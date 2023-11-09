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
import Format from '../common/format'
import ErrorHandler from '../common/error-handler'

class TimeSeriesItem {
  constructor() {
    this.time = new Date(0)
    this.values = []
  }

  static parseFromRestApi(jsonObj, category) {
    const item = new TimeSeriesItem()
    item.time = new Date(jsonObj.time * 1000)
    if (['gpu', 'gmemory'].includes(category)) {
      if (typeof jsonObj.value === 'number') {
        item.values.push(Format.formatNumber(jsonObj.value, 1))
      } else {
        item.values.push('-')
      }
    } else {
      if (typeof jsonObj.job_util === 'number') {
        item.values.push(Format.formatNumber(jsonObj.job_util, 1))
      } else {
        item.values.push('-')
      }
      if (
        typeof (jsonObj.system_util - jsonObj.job_util) === 'number' &&
        !Number.isNaN(jsonObj.system_util - jsonObj.job_util)
      ) {
        const otherUtil = jsonObj.system_util - jsonObj.job_util
        item.values.push(Format.formatNumber(otherUtil < 0 ? 0 : otherUtil, 1))
      } else {
        item.values.push('-')
      }
    }
    return item
  }
}

function getResources(hostnames, type, schedulerId, currentPage, offset) {
  let url = ''
  switch (type) {
    case 'cpu':
      url = '/api/monitor/node/cpu/latest/util/'
      break
    case 'memory':
      url = '/api/monitor/node/memory/latest/util/'
      break
    case 'gpu':
      url = `/api/monitor/gpu/job/${schedulerId}/latest/util/`
      break
    case 'gmemory':
      url = `/api/monitor/gpu/job/${schedulerId}/latest/memory/`
      break
  }
  const req = {
    offset,
    currentPage,
    hostnames,
  }
  return new Promise((resolve, reject) => {
    Request.post(url, req).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getHistoryChartData(hostname, type, schedulerId) {
  let url = ''
  switch (type) {
    case 'cpu':
      url = `/api/monitor/node/${hostname}/cpu/tendency/hour/?scheduler_id=${schedulerId}`
      break
    case 'memory':
      url = `/api/monitor/node/${hostname}/memory/tendency/hour/?scheduler_id=${schedulerId}`
      break
  }
  return new Promise((resolve, reject) => {
    Request.get(url).then(
      res => {
        if (res.body.history) {
          const timeSeries = makeTimeSeries(res.body.current, res.body.current_time, res.body.history, type)
          let current = []
          if (typeof res.body.current === 'object') {
            let otherUtil = res.body.current.system_util
            if (otherUtil !== undefined && res.body.current.job_util !== undefined) {
              otherUtil -= res.body.current.job_util
            }

            current = [res.body.current.job_util, otherUtil === undefined ? '-' : otherUtil < 0 ? 0 : otherUtil]
          } else {
            current = [res.body.current]
          }
          resolve({
            data: timeSeries,
            current,
          })
        }
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getJobNodeResources(hostnames, type, schedulerId, currentPage, offset) {
  const resources = [getResources(hostnames, type, schedulerId, currentPage, offset)]
  if (type === 'cpu') {
    resources.push(getResources(hostnames, 'memory', schedulerId, currentPage, offset))
  } else if (type === 'gpu') {
    resources.push(getResources(hostnames, 'gmemory', schedulerId, currentPage, offset))
  }
  return new Promise((resolve, reject) => {
    Promise.all(resources).then(
      res => {
        const nodes = []
        let total = 0
        total = res[0].total
        if (type === 'gpu') {
          res[0].nodes.forEach((el, index) => {
            nodes.push({
              hostname: el.hostname,
              gpu: el.value,
              gpuIndex: el.index,
              gmemory: res[1].nodes[index].value,
              type: el.type,
            })
          })
        } else {
          res[0].nodes.forEach((el, index) => {
            nodes.push({
              hostname: el.hostname,
              cpu: el.value,
              memory: res[1].nodes[index].value,
            })
          })
        }
        resolve({ nodes, total })
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function makeTimeSeries(current, currentTime, history, category) {
  const series = []
  history.forEach(item => {
    series.push(TimeSeriesItem.parseFromRestApi(item, category))
  })
  if (current !== null && currentTime && history.length) {
    let currentItem = null
    if (category === 'gpu' || category === 'gmemory') {
      currentItem = {
        value: current,
        time: currentTime,
      }
    } else {
      currentItem = {
        job_util: current.job_util,
        system_util: current.system_util,
        time: currentTime,
      }
    }
    series.push(TimeSeriesItem.parseFromRestApi(currentItem, category))
  }
  return series
}

export default {
  getJobNodeResources,
  getHistoryChartData,
}
