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
    user._id = jsonObj.id
    user._uid = jsonObj.uid
    user._username = jsonObj.username
    user._role = jsonObj.role
    user._firstName = jsonObj.first_name || ''
    user._lastName = jsonObj.last_name || ''
    user._email = jsonObj.email || ''
    // user.billGroup = jsonObj.bill_group?BillGroupService.BillGroup.parseFromRestApi(jsonObj.bill_group):false;
    user._userGroup = jsonObj.group ? jsonObj.group : false
    user._billGroupId = jsonObj.bill_group ? jsonObj.bill_group.id : ''
    user._billGroupName = jsonObj.bill_group ? jsonObj.bill_group.name : ''
    user._userGroupName = jsonObj.group ? jsonObj.group.name : ''
    user._loginTime = jsonObj.last_login ? Parser.parseTimeFromRestApi(jsonObj.last_login) : null
    user._createTime = Parser.parseTimeFromRestApi(jsonObj.date_joined)
    user._updateTime = Parser.parseTimeFromRestApi(jsonObj.last_operation_time)
    user._freezed = jsonObj.is_locked
    user._thawTime = Parser.parseTimeFromRestApi(jsonObj.effective_time)
    return user
  }

  get realName() {
    if (this._firstName && this._lastName) {
      return this._firstName + ' ' + this._lastName
    }
    return ''
  }

  get _id() {
    return this.id
  }

  set _id(id) {
    return (this.id = id)
  }

  get _uid() {
    return this.uid
  }

  set _uid(uid) {
    return (this.uid = uid)
  }

  get _username() {
    return this.username
  }

  set _username(username) {
    return (this.username = username)
  }

  get _role() {
    return this.role
  }

  set _role(role) {
    return (this.role = role)
  }

  get _firstName() {
    return this.firstName
  }

  set _firstName(firstName) {
    return (this.firstName = firstName)
  }

  get _lastName() {
    return this.lastName
  }

  set _lastName(lastName) {
    return (this.lastName = lastName)
  }

  get _email() {
    return this.email
  }

  set _email(email) {
    return (this.email = email)
  }

  get _billGroup() {
    return this.billGroup
  }

  set _billGroup(billGroup) {
    return (this.billGroup = billGroup)
  }

  get _userGroup() {
    return this.userGroup
  }

  set _userGroup(userGroup) {
    return (this.userGroup = userGroup)
  }

  get _billGroupId() {
    return this.billGroupId
  }

  set _billGroupId(billGroupId) {
    return (this.billGroupId = billGroupId)
  }

  get _billGroupName() {
    return this.billGroupName
  }

  set _billGroupName(billGroupName) {
    return (this.billGroupName = billGroupName)
  }

  get _userGroupName() {
    return this.userGroupName
  }

  set _userGroupName(userGroupName) {
    return (this.userGroupName = userGroupName)
  }

  get _status() {
    return this.status
  }

  set _status(status) {
    return (this.status = status)
  }

  get _loginTime() {
    return this.loginTime
  }

  set _loginTime(loginTime) {
    return (this.loginTime = loginTime)
  }

  get _createTime() {
    return this.createTime
  }

  set _createTime(createTime) {
    return (this.createTime = createTime)
  }

  get _updateTime() {
    return this.updateTime
  }

  set _updateTime(updateTime) {
    return (this.updateTime = updateTime)
  }

  get _freezed() {
    return this.freezed
  }

  set _freezed(freezed) {
    return (this.freezed = freezed)
  }

  get _thawTime() {
    return this.thawTime
  }

  set _thawTime(thawTime) {
    return (this.thawTime = thawTime)
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
  return new Promise((resolve, reject) => {
    Request.get(`/api/user/${id}/`).then(
      res => {
        BillGroupService.getRelationshipByUsers([res.body.username]).then(
          relationship => {
            const user = User.parseFromRestApi(res.body)
            user.billGroup = relationship[user.username]
              ? BillGroupService.BillGroup.parseFromRestApi(relationship[user.username])
              : {}
            user.billGroupId = relationship[user.username] ? relationship[user.username].id : ''
            resolve(user)
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
  freezedUserByName,
  unfreezedUserByName,
  getUserImportList,
  getUserTableData,
}
