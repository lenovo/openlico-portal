/*
 * Copyright 2015-present Lenovo
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
import TableDataFetcherFactory from '../common/table-data-fetcher-factory'
import ErrorHandler from '../common/error-handler'

class Discount {
  constructor() {
    this.id = 0
    this.name = ''
    this.type = ''
    this.discount = 0
  }

  static parseFromRestApi(jsonObj) {
    const discount = new Discount()
    discount.id = jsonObj.id
    discount.name = jsonObj.name
    discount.type = jsonObj.type
    discount.discount = Number(jsonObj.discount).toFixed(2)
    return discount
  }

  get id() {
    return this._id
  }

  set id(id) {
    this._id = id
  }

  get name() {
    return this._name
  }

  set name(name) {
    this._name = name
  }

  get type() {
    return this._type
  }

  set type(type) {
    this._type = type
  }

  get discount() {
    return this._discount
  }

  set discount(discount) {
    this._discount = discount
  }
}

function discountTableDataParser(res) {
  const discounts = []
  res.data.forEach(item => {
    discounts.push(Discount.parseFromRestApi(item))
  })
  return {
    data: discounts,
  }
}

function getDiscountTableDataFetcher() {
  return TableDataFetcherFactory.createLocalPagingFetcher('/api/discount/', discountTableDataParser, 'data')
}

function getAllDiscount() {
  return new Promise((resolve, reject) => {
    Request.get('/api/accounting/discount/').then(
      res => {
        const discount = {
          user: [],
          userGroup: [],
        }
        res.body.data.forEach(obj => {
          const item = Discount.parseFromRestApi(obj)
          if (item.type === 'user') {
            discount.user.push(item)
          } else if (item.type === 'usergroup') {
            discount.userGroup.push(item)
          }
        })
        resolve(discount)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function createDiscount(data) {
  const req = {
    name: data.name,
    type: data.type,
    discount: parseFloat(data.discount),
  }
  return new Promise((resolve, reject) => {
    Request.post('/api/accounting/discount/', req).then(
      res => {
        resolve(res)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function updateDiscount(data) {
  const req = {
    name: data.name,
    type: data.type,
    discount: parseFloat(data.discount),
  }
  return new Promise((resolve, reject) => {
    Request.put(`/api/accounting/discount/${data.id}/`, req).then(
      res => {
        resolve(res.body)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function deleteDiscount(id) {
  return new Promise((resolve, reject) => {
    Request.delete(`/api/accounting/discount/${id}/`).then(
      res => {
        resolve(res.body)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function batchCreateDiscount(datas) {
  const reqs = []
  datas.forEach(el => {
    reqs.push({
      name: el.name,
      type: el.type,
      discount: parseFloat(el.discount),
    })
  })
  const discounts = []
  reqs.forEach(el => {
    discounts.push(createDiscount(el))
  })
  return new Promise((resolve, reject) => {
    Promise.all(discounts).then(
      res => {
        resolve(res)
      },
      err => {
        reject(err)
      },
    )
  })
}

function batchUpdateDiscount(datas) {
  const reqs = []
  datas.forEach(el => {
    reqs.push({
      id: el.id,
      name: el.name,
      type: el.type,
      discount: parseFloat(el.discount),
    })
  })
  const discounts = []
  reqs.forEach(el => {
    discounts.push(updateDiscount(el))
  })
  return new Promise((resolve, reject) => {
    Promise.all(discounts).then(
      res => {
        resolve(res)
      },
      err => {
        reject(err)
      },
    )
  })
}

function batchDeleteDiscount(datas) {
  const reqs = []
  datas.forEach(el => {
    reqs.push({
      id: el.id,
    })
  })
  const discounts = []
  reqs.forEach(el => {
    discounts.push(deleteDiscount(el.id))
  })
  return new Promise((resolve, reject) => {
    Promise.all(discounts).then(
      res => {
        resolve(res)
      },
      err => {
        reject(err)
      },
    )
  })
}

function batchCreateOrDeleteDiscount(datas) {
  const reqs = {
    create: [],
    delete: [],
  }
  datas.create.forEach(el => {
    reqs.create.push({
      name: el.name,
      type: el.type,
      discount: parseFloat(el.discount),
    })
  })
  datas.delete.forEach(el => {
    reqs.delete.push({
      id: el.id,
    })
  })
  const discounts = []
  reqs.create.forEach(el => {
    discounts.push(createDiscount(el))
  })
  reqs.delete.forEach(el => {
    discounts.push(deleteDiscount(el.id))
  })
  return new Promise((resolve, reject) => {
    Promise.all(discounts).then(
      res => {
        resolve(res)
      },
      err => {
        reject(err)
      },
    )
  })
}

export default {
  getDiscountTableDataFetcher,
  getAllDiscount,
  batchCreateDiscount,
  batchUpdateDiscount,
  batchDeleteDiscount,
  batchCreateOrDeleteDiscount,
}
