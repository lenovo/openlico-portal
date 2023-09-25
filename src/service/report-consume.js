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
import ErrorHandler from '../common/error-handler'
import Format from './../common/format'
import download from './download'

const gResource = window.gApp.$store.getters['settings/getGResource']

class LatestDate {
  constructor() {
    this.latestdate = ''
    this.latestMonth = ''
  }

  static parseFromRestApi(jsonObj) {
    const date = new LatestDate()
    date._latestDate = jsonObj.latest_daily
    date._latestMonth = jsonObj.latest_monthly
    return date
  }

  get _latestDate() {
    return this.latestDate
  }

  set _latestDate(latestDate) {
    this.latestDate = latestDate
  }

  get _latestMonth() {
    return this.latestMonth
  }

  set _latestMonth(latestMonth) {
    this.latestMonth = latestMonth
  }
}

class QueueCost {
  constructor() {
    this.queueName = ''
    this.cpuCost = ''
    this.memCost = ''
  }

  static parseFromRestApi(jsonObj) {
    const queueCost = new QueueCost()
    queueCost._queueName = jsonObj.queue
    queueCost._cpuCost = jsonObj.cpu_costs
    queueCost._memCost = jsonObj.mem_costs

    gResource.forEach(item => {
      if (Object.prototype.hasOwnProperty.call(jsonObj, item.code)) {
        queueCost[item.display_name] = jsonObj[item.code]
      }
    })

    return queueCost
  }

  get _queueName() {
    return this.queueName
  }

  set _queueName(queueName) {
    this.queueName = queueName
  }

  get _cpuCost() {
    return this.cpuCost
  }

  set _cpuCost(cpuCost) {
    this.cpuCost = cpuCost
  }

  get _memCost() {
    return this.memCost
  }

  set _memCost(memCost) {
    this.memCost = memCost
  }
}

class StorageCost {
  constructor() {
    this.path = ''
    this.cost = ''
  }

  static parseFromRestApi(jsonObj) {
    const storageCost = new StorageCost()
    storageCost._path = jsonObj.path
    storageCost._cost = jsonObj.cost
    return storageCost
  }

  get _path() {
    return this.path
  }

  set _path(path) {
    this.path = path
  }

  get _cost() {
    return this.cost
  }

  set _cost(cost) {
    this.cost = cost
  }
}

class DailyBill {
  constructor() {
    this.date = ''
    this.queueCost = []
    this.storageCost = []
  }

  static parseFromRestApi(jsonObj) {
    const dailyBill = new DailyBill()
    dailyBill._date = jsonObj.date
    const queues = []
    for (let i = 0; i < jsonObj.cost.queue.length; i++) {
      queues.push(QueueCost.parseFromRestApi(jsonObj.cost.queue[i]))
    }
    dailyBill._queueCost = queues

    const storages = []
    for (let i = 0; i < jsonObj.cost.storage.length; i++) {
      storages.push(StorageCost.parseFromRestApi(jsonObj.cost.storage[i]))
    }
    dailyBill._storageCost = storages

    return dailyBill
  }

  get _date() {
    return this.date
  }

  set _date(date) {
    this.date = date
  }

  get _queueCost() {
    return this.queueCost
  }

  set _queueCost(queueCost) {
    this.queueCost = queueCost
  }

  get _storageCost() {
    return this.storageCost
  }

  set _storageCost(storageCost) {
    this.storageCost = storageCost
  }
}

function getReportLatestDate(access) {
  return new Promise((resolve, reject) => {
    const req = {
      billing_type: access,
    }
    Request.get('/api/accounting/billing/latestdate/', { params: req }).then(
      res => {
        resolve(LatestDate.parseFromRestApi(res.body))
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getReportDownUrl(type, period, date) {
  const req = {
    billing_type: type,
    period,
    billing_date: date,
  }
  return download('/api/download/accounting/billing/download/', req, 'post')
}

function getExpensesStatement(filter, date, access) {
  return new Promise((resolve, reject) => {
    const req = {
      args: {
        filter: {
          values: filter.values,
          value_type: filter.value_type,
        },
        start_date: Format.formatDateTime(date[0], 'yyyy-MM-dd'),
        end_date: Format.formatDateTime(date[1], 'yyyy-MM-dd'),
      },
    }
    if (access !== 'staff') {
      req.role = 'admin'
    }

    Request.post('/api/accounting/consume/cost/', req).then(
      res => {
        const cost = []
        for (let i = 0; i < res.body.length; i++) {
          cost.push(DailyBill.parseFromRestApi(res.body[i]))
        }
        resolve(cost)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getUsersRanking(filter, date, access) {
  return new Promise((resolve, reject) => {
    const req = {
      args: {
        filter: {
          values: filter.values,
          value_type: filter.value_type,
        },
        start_date: Format.formatDateTime(date[0], 'yyyy-MM-dd'),
        end_date: Format.formatDateTime(date[1], 'yyyy-MM-dd'),
      },
    }
    if (access !== 'staff') {
      req.role = 'admin'
    }
    Request.post('/api/accounting/consume/ranking/', req).then(
      res => {
        resolve(res.body.data)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

export default {
  getReportLatestDate,
  getReportDownUrl,
  getExpensesStatement,
  getUsersRanking,
}
