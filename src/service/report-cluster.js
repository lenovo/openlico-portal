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
import ErrorHandler from '../common/error-handler'

function processFilter(data) {
  const queue = { values: data.queue.values, value_type: 'queue' }
  const filter = [data.user, queue]

  return {
    filters: JSON.stringify(filter),
    waiting_th: data.waitingTime,
    start_time: new Date(data.date[0]).getTime() / 1000,
    end_time: new Date(data.date[1]).getTime() / 1000,
    timezone_offset: new Date().getTimezoneOffset(),
  }
}

function getCluserOver(params) {
  const req = processFilter(params)
  return new Promise((resolve, reject) => {
    Request.get('/api/job/cluster_report/overall/', { params: req }).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getClusterTrend(params) {
  const req = processFilter(params)
  return new Promise((resolve, reject) => {
    Request.get('/api/job/cluster_report/trend/', { params: req }).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getClusterTime(params) {
  const req = processFilter(params)
  return new Promise((resolve, reject) => {
    Request.get('/api/job/cluster_report/time/', { params: req }).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getClusterDistribution(params) {
  const req = processFilter(params)
  return new Promise((resolve, reject) => {
    Request.get('/api/job/cluster_report/distribution/', { params: req }).then(
      res => {
        if (res.body) {
          const data = {}
          res.body.values.forEach(item => {
            res.body.keys.forEach(type => {
              if (!Object.prototype.hasOwnProperty.call(data, type)) {
                data[type] = [item[res.body.keys.indexOf(type)]]
              } else {
                data[type].push(item[res.body.keys.indexOf(type)])
              }
            })
          })
          resolve(data)
        } else {
          resolve(null)
        }
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

export default {
  getCluserOver,
  getClusterTrend,
  getClusterTime,
  getClusterDistribution,
}
