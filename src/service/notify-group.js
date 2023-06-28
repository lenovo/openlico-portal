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
import Parser from '../common/parser'
import TableDataFetcherFactory from '../common/table-data-fetcher-factory'
import ErrorHandler from '../common/error-handler'

class NotifyGroup {
  constructor() {
    this.id = 0
    this.name = ''
    this.emails = []
    this.mobiles = []
    this.updateTime = new Date(0)
  }

  static parseFromRestApi(jsonObj) {
    const notifyGroup = new NotifyGroup()
    notifyGroup.id = jsonObj.id
    notifyGroup.name = jsonObj.name
    notifyGroup.emails = jsonObj.email
    notifyGroup.mobiles = jsonObj.phone
    notifyGroup.updateTime = Parser.parseTimeFromRestApi(jsonObj.last_operation_time)
    return notifyGroup
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

  get emails() {
    return this._emails
  }

  set emails(emails) {
    this._emails = emails
  }

  get mobiles() {
    return this._mobiles
  }

  set mobiles(mobiles) {
    this._mobiles = mobiles
  }

  get updateTime() {
    return this._updateTime
  }

  set updateTime(updateTime) {
    this._updateTime = updateTime
  }
}

function notifyGroupsTableDataParser(res) {
  const notifyGroups = []
  res.forEach(item => {
    notifyGroups.push(NotifyGroup.parseFromRestApi(item))
  })
  return {
    data: notifyGroups,
  }
}

function getNotifyGroupsTableDataFetcher() {
  return TableDataFetcherFactory.createLocalPagingFetcher('/api/alert/target/', notifyGroupsTableDataParser, 'data')
}

function getAllNotifyGroups() {
  return new Promise((resolve, reject) => {
    Request.get('/api/alert/target/').then(
      res => {
        const notifyGroups = []
        res.data.forEach(obj => {
          notifyGroups.push(NotifyGroup.parseFromRestApi(obj))
        })
        resolve(notifyGroups)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function createNotifyGroup(name, emails, mobiles) {
  return new Promise((resolve, reject) => {
    const req = {
      name,
      email: emails,
      phone: mobiles,
    }
    Request.post('/api/alert/target/', req).then(
      res => {
        resolve(NotifyGroup.parseFromRestApi(res.body))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function updateNotifyGroup(id, name, emails, mobiles) {
  return new Promise((resolve, reject) => {
    const req = {
      name,
      email: emails,
      phone: mobiles,
    }
    Request.put(`/api/alert/target/${id}/`, req).then(
      res => {
        resolve(NotifyGroup.parseFromRestApi(res.body))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function deleteNotifyGroup(id) {
  return new Promise((resolve, reject) => {
    Request.delete(`/api/alert/target/${id}/`).then(
      res => {
        resolve(NotifyGroup.parseFromRestApi(res.body))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

export default {
  getNotifyGroupsTableDataFetcher,
  getAllNotifyGroups,
  createNotifyGroup,
  updateNotifyGroup,
  deleteNotifyGroup,
}
