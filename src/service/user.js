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
import TableDataFetcherFactory from '../common/table-data-fetcher-factory'
import ErrorHandler from '../common/error-handler'
import BillGroupService from './bill-group'

const UserRoleEnums = [300, 200, 100]
class User {
  constructor() {
    this.id = 0
    this.uid = 0
    this.username = ''
    this.role = ''
    this.firstName = ''
    this.lastName = ''
    this.fullName = ''
    this.email = ''
    this.billGroup = {}
    this.userGroup = false
    this.billGroupId = ''
    this.billGroupName = ''
    this.userGroupName = ''
    this.status = ''
    this.loginTime = null
    this.createTime = new Date(0)
    this.updateTime = new Date(0)
    this.freezed = false
    this.thawTime = new Date(0)
  }

  static parseFromRestApi(jsonObj) {
    const user = new User()
    user.id = jsonObj.id
    user.uid = jsonObj.uid
    user.username = jsonObj.username
    user.role = jsonObj.role
    user.firstName = jsonObj.first_name || ''
    user.lastName = jsonObj.last_name || ''
    user.fullName = jsonObj.full_name || ''
    user.email = jsonObj.email || ''
    // user.billGroup = jsonObj.bill_group?BillGroupService.BillGroup.parseFromRestApi(jsonObj.bill_group):false;
    user.userGroup = jsonObj.group ? jsonObj.group : false
    user.billGroupId = jsonObj.bill_group ? jsonObj.bill_group.id : ''
    user.billGroupName = jsonObj.bill_group ? jsonObj.bill_group.name : ''
    user.userGroupName = jsonObj.group ? jsonObj.group.name : ''
    user.loginTime = jsonObj.last_login ? Parser.parseTimeFromRestApi(jsonObj.last_login) : null
    user.createTime = Parser.parseTimeFromRestApi(jsonObj.date_joined)
    user.updateTime = Parser.parseTimeFromRestApi(jsonObj.last_operation_time)
    user.freezed = jsonObj.is_locked
    user.thawTime = Parser.parseTimeFromRestApi(jsonObj.effective_time)
    return user
  }

  get realName() {
    return [this.firstName, this.lastName].join(' ').trim()
  }
}

function usersTableDataParser(res) {
  const users = []
  res.data.forEach(item => {
    users.push(User.parseFromRestApi(item))
  })
  const userNames = []
  users.forEach(el => {
    userNames.push(el.username)
  })
  BillGroupService.getRelationshipByUsers(userNames).then(
    res => {
      users.forEach(el => {
        el.billGroupId = res[el.username] ? res[el.username].id : ''
        el.billGroup = res[el.username] ? BillGroupService.BillGroup.parseFromRestApi(res[el.username]) : {}
      })
    },
    err => {
      window.gApp.$message.error(err)
    },
  )
  return {
    offset: res.offset,
    total: res.total,
    data: users,
  }
}

function usersRestApiPropMap(prop) {
  if (prop === 'id') return 'id'
  else if (prop === 'username') return 'username'
  else if (prop === 'fullName') return 'full_name'
  else if (prop === 'role') return 'role'
  else if (prop === 'loginTime') return 'last_login'
  else if (prop === 'thawTime') return 'effective_time'
  else if (prop === 'billGroupName') return 'bill_group'
  else if (prop === 'freezed') return 'is_locked'
  else return ''
}

function getUsersTableDataFetcher() {
  return TableDataFetcherFactory.createRemotePagingFetcher(
    '/api/user/',
    usersRestApiPropMap,
    usersTableDataParser,
    'data',
    'offset',
    'total',
  )
}

function getAllUsers() {
  return new Promise((resolve, reject) => {
    Request.get('/api/user/').then(
      res => {
        const users = []
        const userNames = []
        res.body.forEach(obj => {
          userNames.push(obj.username)
          users.push(User.parseFromRestApi(obj))
        })
        BillGroupService.getRelationshipByUsers(userNames).then(
          relationship => {
            users.forEach(el => {
              el.billGroup = relationship[el.username]
                ? BillGroupService.BillGroup.parseFromRestApi(relationship[el.username])
                : {}
              el.billGroupId = relationship[el.username] ? relationship[el.username].id : ''
            })
            resolve(users)
          },
          er => {
            ErrorHandler.restApiErrorHandler(er, reject)
          },
        )
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getUserById(id) {
  return fetchUser(`/api/user/${id}/`)
}

function getUserByUsername(username) {
  return fetchUser(`/api/user/${username}/by_username`)
}

async function fetchUser(apiEndpoint) {
  try {
    const res = await Request.get(apiEndpoint)
    const relationship = await BillGroupService.getRelationshipByUsers([res.body.username])
    const user = User.parseFromRestApi(res.body)
    user.billGroup = relationship[user.username]
      ? BillGroupService.BillGroup.parseFromRestApi(relationship[user.username])
      : {}
    user.billGroupId = relationship[user.username] ? relationship[user.username].id : ''
    return user
  } catch (err) {
    await ErrorHandler.awaitableErrorHandler(err)
  }
}

function getUserRoleDisplayName(role) {
  if (role === 300) {
    return window.gApp.$t('Access.admin')
  }
  if (role === 200) {
    return window.gApp.$t('Access.operator')
  }
  if (role === 100) {
    return window.gApp.$t('Access.staff')
  }
  return ''
}

function createUser(username, role, firstName, lastName, billGroupId, email, userGroupName, password) {
  return new Promise((resolve, reject) => {
    const req = {
      username,
      role,
      first_name: firstName,
      last_name: lastName,
      bill_group: billGroupId,
      email,
    }
    if (window.gApp.$store.state.auth.ldapManaged) {
      req.group = userGroupName === null ? '' : userGroupName
      req.password = password
    }
    const apiList = [Request.post('/api/user/', req)]
    if (billGroupId || billGroupId === 0) {
      apiList.push(
        BillGroupService.createRelationshipByUsers({
          [username]: billGroupId,
        }),
      )
    }
    Promise.all(apiList).then(
      res => {
        resolve(User.parseFromRestApi(res[0].body))
      },
      err => {
        if (typeof err === 'string') {
          reject(err)
        }
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function updateUser(id, username, role, firstName, lastName, billGroupId, email, userGroupName) {
  return new Promise((resolve, reject) => {
    const req = {
      role,
      first_name: firstName,
      last_name: lastName,
      bill_group: billGroupId,
      email,
    }
    if (window.gApp.$store.state.auth.ldapManaged) {
      req.group = userGroupName === null ? '' : userGroupName
    }
    const relationship = {}
    relationship[username] = billGroupId

    const apiList = [Request.patch(`/api/user/${id}/`, req)]
    if (billGroupId || billGroupId === 0) {
      apiList.push(BillGroupService.createRelationshipByUsers(relationship))
    }
    Promise.all(apiList).then(
      res => {
        resolve(User.parseFromRestApi(res[0].body))
      },
      err => {
        if (typeof err === 'string') {
          reject(err)
        }
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function deleteUser(id, username) {
  return new Promise((resolve, reject) => {
    BillGroupService.deleteRelationshipByUsers([username]).then(
      resp => {
        Request.delete(`/api/user/${id}/`).then(
          res => {
            const user = new User()
            user.id = id
            resolve(user)
          },
          err => {
            if (typeof err === 'string') {
              reject(err)
            }
            ErrorHandler.restApiErrorHandler(err, reject)
          },
        )
      },
      errp => {
        ErrorHandler.restApiErrorHandler(errp, reject)
      },
    )
  })
}

function importUser(username, role, firstName, lastName, billGroupId, email) {
  return new Promise((resolve, reject) => {
    const req = {
      username,
      role,
      bill_group: billGroupId,
      email,
      first_name: firstName,
      last_name: lastName,
    }

    const apiList = [Request.put('/api/user/', req)]
    if (billGroupId || billGroupId === 0) {
      apiList.push(
        BillGroupService.createRelationshipByUsers({
          [username]: billGroupId,
        }),
      )
    }
    Promise.all(apiList).then(
      res => {
        resolve(User.parseFromRestApi(res[0].body))
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function changeUserPassword(id, password) {
  return new Promise((resolve, reject) => {
    const req = {
      password,
    }
    Request.put(`/api/user/${id}/password/`, req).then(
      res => {
        const user = new User()
        user.id = id
        resolve(User.parseFromRestApi(res.body))
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function freezedUserByName(id, days, hours) {
  return new Promise((resolve, reject) => {
    const req = {
      days: Number(days) || 0,
      hours: Number(hours) || 0,
    }
    Request.post(`/api/user/${id}/lock/`, req).then(
      res => {
        resolve({
          freezed: res.body.is_frozen,
          thawTime: Parser.parseTimeFromRestApi(res.body.effective_time),
        })
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function fullLockUser(id) {
  return new Promise((resolve, reject) => {
    Request.post(`/api/user/${id}/full-lock/`).then(
      res => {
        resolve()
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function unfreezedUserByName(id) {
  return new Promise((resolve, reject) => {
    Request.delete(`/api/user/${id}/lock/`).then(
      res => {
        resolve()
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getUserImportList() {
  return new Promise((resolve, reject) => {
    Request.get('/api/user/unimported/').then(
      res => {
        const userList = res.body ? res.body : []
        resolve(userList)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getUserTableData(args = {}) {
  const params = { args }
  return new Promise((resolve, reject) => {
    Request.get('/api/user/', { params }).then(
      res => {
        const data = res.data.data.map(item => User.parseFromRestApi(item))
        resolve({
          data,
          offset: res.data.offset,
          total: res.data.total,
        })
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}
export default {
  UserRoleEnums,
  getUsersTableDataFetcher,
  getAllUsers,
  getUserRoleDisplayName,
  createUser,
  updateUser,
  deleteUser,
  importUser,
  changeUserPassword,
  getUserById,
  getUserByUsername,
  freezedUserByName,
  fullLockUser,
  unfreezedUserByName,
  getUserImportList,
  getUserTableData,
}
