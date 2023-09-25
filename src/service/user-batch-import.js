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
import Parser from '../common/parser'
import Format from '../common/format'
import TableDataFetcherFactory from '../common/table-data-fetcher-factory'
import ErrorHandler from '../common/error-handler'
import download from './download'

class User {
  constructor() {
    this.row = 0
    this.username = ''
    this.role = ''
    this.firstName = ''
    this.lastName = ''
    this.billGroup = ''
    this.email = ''
    this.status = ''
    this.errorMessage = ''
  }

  static parseFromRestApi(jsonObj) {
    const user = new User()
    user.row = jsonObj.row
    user.username = jsonObj.username
    user.role = jsonObj.role
    user.firstName = jsonObj.first_name || ''
    user.lastName = jsonObj.last_name || ''
    user.billGroup = jsonObj.bill_group
    user.email = jsonObj.email || ''
    user.status = jsonObj.ret
    user.errorMessage = jsonObj.error_message
    return user
  }

  get row() {
    return this._row
  }

  set row(row) {
    this._row = row
  }

  get username() {
    return this._username
  }

  set username(username) {
    this._username = username
  }

  get role() {
    return this._role
  }

  set role(role) {
    this._role = role
  }

  get firstName() {
    return this._firstName
  }

  set firstName(firstName) {
    this._firstName = firstName
  }

  get lastName() {
    return this._lastName
  }

  set lastName(lastName) {
    this._lastName = lastName
  }

  get email() {
    return this._email
  }

  set email(email) {
    this._email = email
  }

  get result() {
    return this._result
  }

  set result(result) {
    this._result = result
  }

  get status() {
    return this._status
  }

  set status(status) {
    this._status = status
  }

  get errorMessage() {
    return this._errorMessage
  }

  set errorMessage(errorMessage) {
    this._errorMessage = errorMessage
  }
}

function usersRestApiPropMap(prop) {
  if (prop === 'firstName') {
    return 'first_name'
  } else if (prop === 'lastName') {
    return 'last_name'
  } else if (prop === 'billGroup') {
    return 'bill_group'
  } else if (prop === 'errorMessage') {
    return 'error_message'
  } else {
    return prop
  }
}

function usersTableDataParser(res) {
  const users = []
  res.data.forEach(item => {
    users.push(User.parseFromRestApi(item))
  })
  return {
    offset: res.offset,
    total: res.total,
    data: users,
  }
}

function getUsersTableDataFetcher() {
  return TableDataFetcherFactory.createRemotePagingFetcher(
    '/api/user/import/detail/',
    usersRestApiPropMap,
    usersTableDataParser,
    'data',
    'offset',
    'total',
  )
}

function getUsersImportStatu() {
  return new Promise((resolve, reject) => {
    Request.get('/api/user/import/').then(
      res => {
        if (res.body.last_importing) {
          res.body.last_importing.finish_time = Format.formatDateTime(
            Parser.parseTimeFromRestApi(res.body.last_importing.finish_time),
          )
        }
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function importUsers(file) {
  const req = {
    upload: file,
  }
  const formData = new FormData()
  for (const el in req) {
    formData.append(el, req[el])
  }
  return new Promise((resolve, reject) => {
    Request({
      url: '/api/user/import/',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(
      res => {
        resolve()
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function cancelUsersImport() {
  return new Promise((resolve, reject) => {
    Request.delete('/api/user/import/').then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getUsersExport(token) {
  return download('/api/download/user/export/?charset=gbk')
}

export default {
  getUsersTableDataFetcher,
  getUsersImportStatu,
  importUsers,
  getUsersExport,
  cancelUsersImport,
}
