/*
 * Copyright 2015-2023 Lenovo
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Request from '../request/https'
// import Utils from './utils'
import Collection from './collection'
import ErrorHandler from './error-handler'

// Remote pagination.
class RemotePagingTableDataFetcher {
  constructor() {
    this.restApiPath = ''
    this.restApiPropMap = null
    this.dataParser = null
    this.dataProp = 'data'
    this.offsetProp = 'offset'
    this.totalProp = 'total'
  }

  fetch(pageSize, currentPage, sort, filters, search, requestId) {
    return new Promise((resolve, reject) => {
      const requestID = requestId
      const req = {
        offset: (currentPage - 1) * pageSize,
        length: pageSize,
        filters,
      }
      if (sort && sort.prop && sort.prop.length > 0 && sort.order) {
        req.sort = sort
      }
      if (search && search.props.length > 0 && search.keyword.length > 0) {
        req.search = search
      }
      if (this.restApiPropMap) {
        if (req.sort) {
          req.sort.prop = this.restApiPropMap(req.sort.prop)
        }
        if (req.filters) {
          req.filters.forEach(filter => {
            filter.prop = this.restApiPropMap(filter.prop)
          })
        }
        if (req.search) {
          const mappedProps = []
          req.search.props.forEach(prop => {
            mappedProps.push(this.restApiPropMap(prop))
          })
          req.search.props = mappedProps
        }
      }
      const args = JSON.stringify(req)
      Request.get(this.restApiPath, { params: { args } }).then(
        res => {
          let result = null
          if (this.dataParser) {
            result = this.dataParser(res.body)
          } else {
            result = res
          }
          const dataItems = result[this.dataProp]
          resolve({
            data: dataItems,
            total: result[this.totalProp],
            pageSize,
            // currentPage: Math.floor(result[this.offsetProp] / pageSize) + 1
            currentPage,
            requestId: requestID,
          })
        },
        res => {
          this._status = res.status
          ErrorHandler.restApiErrorHandler(res, reject)
        },
      )
    })
  }

  get restApiPath() {
    return this._restApiPath
  }

  set restApiPath(restApiPath) {
    this._restApiPath = restApiPath
  }

  get restApiPropMap() {
    return this._restApiPropMap
  }

  set restApiPropMap(restApiPropMap) {
    this._restApiPropMap = restApiPropMap
  }

  get dataParser() {
    return this._dataParser
  }

  set dataParser(dataParser) {
    this._dataParser = dataParser
  }

  get status() {
    return this._status
  }
}

// Local pagination.
class LocalPagingTableDataFetcher {
  constructor() {
    this.restApiPath = ''
    this.dataParser = null
    this.dataProp = 'data'
    this.dataSorter = null
  }

  fetch(pageSize, currentPage, sort, filters, search) {
    return new Promise((resolve, reject) => {
      Request.get(this.restApiPath).then(
        res => {
          let result = null
          if (this.dataParser) {
            result = this.dataParser(res.body)
          } else {
            result = res
          }
          let dataItems = result[this.dataProp]
          // Do filter
          // filters.forEach((filter) => {
          //   dataItems = Collection.filterObjectsByProp(dataItems, filter.prop, filter.type, filter.values);
          // });
          const filterData = []
          filters.forEach(filter => {
            const d = Collection.filterObjectsByProp(dataItems, filter.prop, filter.type, filter.values)
            for (let i = 0; i < d.length; i++) {
              const exist = JSON.stringify(filterData).indexOf(JSON.stringify(d[i])) > -1
              if (!exist) {
                filterData.push(d[i])
              }
            }
          })
          if (filters.length > 0) {
            dataItems = filterData
          }
          // Do search
          if (search && search.keyword !== '') {
            dataItems = Collection.searchObjectsByProps(dataItems, search.props, search.keyword)
          }
          // Do sort
          if (sort && sort.prop && sort.order) {
            if (this.dataSorter) {
              if (this.dataSorter(dataItems, sort.prop, sort.order) === false) {
                Collection.sortObjectsByProp(dataItems, sort.prop, sort.order)
              }
            } else {
              Collection.sortObjectsByProp(dataItems, sort.prop, sort.order)
            }
          }
          const total = dataItems.length
          let newPage = currentPage
          if (pageSize > 0) {
            // Do paging, not enough pages should shift to page 1.
            if (dataItems.length <= pageSize * (currentPage - 1)) {
              newPage = 1
            }
            const startIndex = pageSize * (newPage - 1)
            const endIndex = pageSize * newPage
            dataItems = dataItems.slice(startIndex, endIndex)
          }
          resolve({
            data: dataItems,
            total,
            pageSize,
            currentPage: newPage,
          })
        },
        res => {
          this._status = res.status
          ErrorHandler.restApiErrorHandler(res, reject)
        },
      )
    })
  }

  get restApiPath() {
    return this._restApiPath
  }

  set restApiPath(restApiPath) {
    this._restApiPath = restApiPath
  }

  get dataParser() {
    return this._dataParser
  }

  set dataParser(dataParser) {
    this._dataParser = dataParser
  }

  get dataProp() {
    return this._dataProp
  }

  set dataProp(dataProp) {
    this._dataProp = dataProp
  }

  get dataSorter() {
    return this._dataSorter
  }

  set dataSorter(dataSorter) {
    this._dataSorter = dataSorter
  }

  get status() {
    return this._status
  }
}

// Local pagination with no refresh
class FixLocalPagingTableDataFetcher {
  constructor() {
    this.data = null
    this.dataSorter = null
  }

  fetch(pageSize, currentPage, sort, filters, search) {
    return new Promise((resolve, reject) => {
      let dataItems = []
      if (this.data) {
        this.data.forEach(item => {
          dataItems.push(item)
        })
      }
      // Do filter
      // filters.forEach((filter) => {
      //   dataItems = Collection.filterObjectsByProp(dataItems, filter.prop, filter.type, filter.values);
      // });
      const filterData = []
      filters.forEach(filter => {
        const d = Collection.filterObjectsByProp(dataItems, filter.prop, filter.type, filter.values)
        for (let i = 0; i < d.length; i++) {
          const exist = JSON.stringify(filterData).indexOf(JSON.stringify(d[i])) > -1
          if (!exist) {
            filterData.push(d[i])
          }
        }
      })
      if (filters.length > 0) {
        dataItems = filterData
      }
      // Do search
      if (search && search.keyword !== '') {
        dataItems = Collection.searchObjectsByProps(dataItems, search.props, search.keyword)
      }
      // Do sort
      if (sort && sort.prop && sort.order) {
        if (this.dataSorter) {
          if (this.dataSorter(dataItems, sort.prop, sort.order) === false) {
            Collection.sortObjectsByProp(dataItems, sort.prop, sort.order)
          }
        } else {
          Collection.sortObjectsByProp(dataItems, sort.prop, sort.order)
        }
      }
      const total = dataItems.length
      let newPage = currentPage
      if (pageSize > 0) {
        // Do paging, not enough pages should shift to page 1.
        if (dataItems.length <= pageSize * (currentPage - 1)) {
          newPage = 1
        }
        const startIndex = pageSize * (newPage - 1)
        const endIndex = pageSize * newPage
        dataItems = dataItems.slice(startIndex, endIndex)
      }
      resolve({
        data: dataItems,
        total,
        pageSize,
        currentPage: newPage,
      })
    })
  }

  get data() {
    return this._data
  }

  set data(data) {
    this._data = data
  }

  get dataSorter() {
    return this._dataSorter
  }

  set dataSorter(dataSorter) {
    this._dataSorter = dataSorter
  }

  get status() {
    return null
  }
}

function createRemotePagingFetcher(restApiPath, restApiPropMap, dataParser, dataProp, offsetProp, totalProp) {
  const fetcher = new RemotePagingTableDataFetcher()
  fetcher.restApiPath = restApiPath
  if (restApiPropMap) {
    fetcher.restApiPropMap = restApiPropMap
  }
  if (dataParser) {
    fetcher.dataParser = dataParser
  }
  if (dataProp) {
    fetcher.dataProp = dataProp
  }
  if (offsetProp) {
    fetcher.offsetProp = offsetProp
  }
  if (totalProp) {
    fetcher.totalProp = totalProp
  }
  return fetcher
}

function createLocalPagingFetcher(restApiPath, dataParser, dataProp, dataSorter) {
  const fetcher = new LocalPagingTableDataFetcher()
  fetcher.restApiPath = restApiPath
  if (dataParser) {
    fetcher.dataParser = dataParser
  }
  if (dataProp) {
    fetcher.dataProp = dataProp
  }
  if (dataSorter) {
    fetcher.dataSorter = dataSorter
  }
  return fetcher
}

function createFixLocalPagingFetcher(data, dataSorter) {
  const fetcher = new FixLocalPagingTableDataFetcher()
  fetcher.data = data
  if (dataSorter) {
    fetcher.dataSorter = dataSorter
  }
  return fetcher
}

export default {
  createRemotePagingFetcher,
  createLocalPagingFetcher,
  createFixLocalPagingFetcher,
}
