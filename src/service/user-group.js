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

class UserGroup {
  constructor() {
    this.name = ''
    this.id = ''
  }

  static parseFromRestApi(jsonObj) {
    const userGroup = new UserGroup()
    userGroup.name = jsonObj.name
    userGroup.id = jsonObj.gid
    return userGroup
  }

  get _name() {
    return this.name
  }

  set _name(name) {
    this.name = name
  }

  get _id() {
    return this.id
  }

  set _id(id) {
    this.id = id
  }
}

function userGroupsTableDataParser(res) {
  const userGroups = []
  res.forEach(item => {
    userGroups.push(UserGroup.parseFromRestApi(item))
  })
  return {
    data: userGroups,
  }
}

function getUserGroupsTableDataFetcher() {
  return TableDataFetcherFactory.createLocalPagingFetcher('/api/user/group/', userGroupsTableDataParser, 'data')
}

function getAllUserGroups() {
  return new Promise((resolve, reject) => {
    Request.get('/api/user/group/').then(
      res => {
        const userGroups = []
        res.body.forEach(obj => {
          userGroups.push(UserGroup.parseFromRestApi(obj))
        })
        resolve(userGroups)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function createUserGroup(name) {
  return new Promise((resolve, reject) => {
    const req = {
      name,
    }
    Request.post('/api/user/group/', req).then(
      res => {
        resolve(UserGroup.parseFromRestApi(res.body))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function deleteUserGroup(name) {
  return new Promise((resolve, reject) => {
    Request.delete(`/api/user/group/${encodeURIComponent(name)}/`).then(
      res => {
        const userGroup = new UserGroup()
        userGroup.name = name
        resolve(UserGroup.parseFromRestApi(userGroup))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

export default {
  getUserGroupsTableDataFetcher,
  getAllUserGroups,
  createUserGroup,
  deleteUserGroup,
}
