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
import download from './download'
import moment from 'moment'

class BillGroup {
  constructor() {
    this.id = 0
    this.name = ''
    this.chargeRate = 1.0
    this.chargeRateMinute = 1.0
    this.chargeRateDisplayType = 'hour'
    this.gresChargeRate = {}
    this.gresChargeRateMinute = {}
    this.gresChargeRateDisplayType = {}
    this.memoryChargeRate = 1.0
    this.memoryChargeRateMinute = 1.0
    this.memoryChargeRateDisplayType = 'hour'
    this.storageChargeRate = 1.0
    this.totalComputingTime = 0
    this.accountConsumed = 0.0
    this.accountBalance = 0.0
    this.description = ''
    this.updateTime = new Date(0)
  }

  static parseFromRestApi(jsonObj) {
    const billGroup = new BillGroup()
    billGroup.id = jsonObj.id
    billGroup.name = jsonObj.name
    billGroup.chargeRate = jsonObj.charge_rate
    billGroup.chargeRateMinute = jsonObj.cr_minute
    billGroup.chargeRateDisplayType = jsonObj.cr_display_type
    billGroup.totalComputingTime = jsonObj.used_time
    billGroup.accountConsumed = jsonObj.used_credits
    billGroup.accountBalance = jsonObj.balance
    billGroup.description = jsonObj.description
    billGroup.updateTime = Parser.parseTimeFromRestApi(jsonObj.last_operation_time)
    if (Object.prototype.hasOwnProperty.call(jsonObj, 'gres_charge_rate')) {
      billGroup.gresChargeRate = jsonObj.gres_charge_rate
      billGroup.gresChargeRateMinute = jsonObj.gcr_minute
      billGroup.gresChargeRateDisplayType = jsonObj.gcr_display_type
    }
    if (Object.prototype.hasOwnProperty.call(jsonObj, 'memory_charge_rate')) {
      billGroup.memoryChargeRate = jsonObj.memory_charge_rate
      billGroup.memoryChargeRateMinute = jsonObj.mcr_minute
      billGroup.memoryChargeRateDisplayType = jsonObj.mcr_display_type
    }
    if (Object.prototype.hasOwnProperty.call(jsonObj, 'storage_charge_rate')) {
      billGroup.storageChargeRate = jsonObj.storage_charge_rate
    }
    if (Object.prototype.hasOwnProperty.call(jsonObj, 'storage_policy')) {
      billGroup.storagePolicy = []
      jsonObj.storage_policy.forEach(item => {
        billGroup.storagePolicy.push(StoragePolicy.parseFromRestApi(item))
      })
    }
    if (Object.prototype.hasOwnProperty.call(jsonObj, 'queue_policy')) {
      billGroup.queuePolicy = []
      jsonObj.queue_policy.forEach(item => {
        billGroup.queuePolicy.push(QueuePolicy.parseFromRestApi(item))
      })
    }
    return billGroup
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

  get chargeRate() {
    return this._chargeRate
  }

  set chargeRate(chargeRate) {
    this._chargeRate = chargeRate
  }

  get chargeRateMinute() {
    return this._chargeRateMinute
  }

  set chargeRateMinute(chargeRateMinute) {
    this._chargeRateMinute = chargeRateMinute
  }

  get chargeRateDisplayType() {
    return this._chargeRateDisplayType
  }

  set chargeRateDisplayType(chargeRateDisplayType) {
    this._chargeRateDisplayType = chargeRateDisplayType
  }

  get gresChargeRate() {
    return this._gresChargeRate
  }

  set gresChargeRate(gresChargeRate) {
    this._gresChargeRate = gresChargeRate
  }

  get gresChargeRateMinute() {
    return this._gresChargeRateMinute
  }

  set gresChargeRateMinute(gresChargeRateMinute) {
    this._gresChargeRateMinute = gresChargeRateMinute
  }

  get gresChargeRateDisplayType() {
    return this._gresChargeRateDisplayType
  }

  set gresChargeRateDisplayType(gresChargeRateDisplayType) {
    this._gresChargeRateDisplayType = gresChargeRateDisplayType
  }

  get memoryChargeRate() {
    return this._memoryChargeRate
  }

  set memoryChargeRate(memoryChargeRate) {
    this._memoryChargeRate = memoryChargeRate
  }

  get memoryChargeRateMinute() {
    return this._memoryChargeRateMinute
  }

  set memoryChargeRateMinute(memoryChargeRateMinute) {
    this._memoryChargeRateMinute = memoryChargeRateMinute
  }

  get memoryChargeRateDisplayType() {
    return this._memoryChargeRateDisplayType
  }

  set memoryChargeRateDisplayType(memoryChargeRateDisplayType) {
    this._memoryChargeRateDisplayType = memoryChargeRateDisplayType
  }

  get storageChargeRate() {
    return this._storageChargeRate
  }

  set storageChargeRate(storageChargeRate) {
    this._storageChargeRate = storageChargeRate
  }

  get totalComputingTime() {
    return this._totalComputingTime
  }

  set totalComputingTime(totalComputingTime) {
    this._totalComputingTime = totalComputingTime
  }

  get accountConsumed() {
    return this._accountConsumed
  }

  set accountConsumed(accountConsumed) {
    this._accountConsumed = accountConsumed
  }

  get accountBalance() {
    return this._accountBalance
  }

  set accountBalance(accountBalance) {
    this._accountBalance = accountBalance
  }

  get description() {
    return this._description
  }

  set description(description) {
    this._description = description
  }

  get updateTime() {
    return this._updateTime
  }

  set updateTime(updateTime) {
    this._updateTime = updateTime
  }
}

class QueuePolicy {
  constructor() {
    this.id = 0
    this.queueList = []
    this.chargeRate = 1
    this.chargeRateMinute = 1
    this.chargeRateDisplayType = 'hour'
    this.gresChargeRate = {}
    this.gresChargeRateMinute = {}
    this.gresChargeRateDisplayType = {}
    this.memoryChargeRate = 1
    this.memoryChargeRateMinute = 1
    this.memoryChargeRateDisplayType = 'hour'
    this.updateTime = new Date(0)
  }

  static parseFromRestApi(jsonObj) {
    const queuePolicy = new QueuePolicy()
    queuePolicy.id = jsonObj.id
    queuePolicy.queueList = jsonObj.queue_list
    queuePolicy.chargeRate = jsonObj.charge_rate
    queuePolicy.chargeRateMinute = jsonObj.cr_minute
    queuePolicy.chargeRateDisplayType = jsonObj.cr_display_type
    queuePolicy.gresChargeRate = jsonObj.gres_charge_rate
    queuePolicy.gresChargeRateMinute = jsonObj.gcr_minute
    queuePolicy.gresChargeRateDisplayType = jsonObj.gcr_display_type
    queuePolicy.memoryChargeRate = jsonObj.memory_charge_rate
    queuePolicy.memoryChargeRateMinute = jsonObj.mcr_minute
    queuePolicy.memoryChargeRateDisplayType = jsonObj.mcr_display_type
    queuePolicy.updateTime = Parser.parseTimeFromRestApi(jsonObj.last_operation_time)
    return queuePolicy
  }

  get id() {
    return this._id
  }

  set id(id) {
    return (this._id = id)
  }

  get queueList() {
    return this._queueList
  }

  set queueList(queueList) {
    return (this._queueList = queueList)
  }

  get chargeRate() {
    return this._chargeRate
  }

  set chargeRate(chargeRate) {
    return (this._chargeRate = chargeRate)
  }

  get chargeRateMinute() {
    return this._chargeRateMinute
  }

  set chargeRateMinute(chargeRateMinute) {
    this._chargeRateMinute = chargeRateMinute
  }

  get chargeRateDisplayType() {
    return this._chargeRateDisplayType
  }

  set chargeRateDisplayType(chargeRateDisplayType) {
    this._chargeRateDisplayType = chargeRateDisplayType
  }

  get gresChargeRate() {
    return this._gresChargeRate
  }

  set gresChargeRate(gresChargeRate) {
    return (this._gresChargeRate = gresChargeRate)
  }

  get gresChargeRateMinute() {
    return this._gresChargeRateMinute
  }

  set gresChargeRateMinute(gresChargeRateMinute) {
    this._gresChargeRateMinute = gresChargeRateMinute
  }

  get gresChargeRateDisplayType() {
    return this._gresChargeRateDisplayType
  }

  set gresChargeRateDisplayType(gresChargeRateDisplayType) {
    this._gresChargeRateDisplayType = gresChargeRateDisplayType
  }

  get memoryChargeRate() {
    return this._memoryChargeRate
  }

  set memoryChargeRate(memoryChargeRate) {
    return (this._memoryChargeRate = memoryChargeRate)
  }

  get memoryChargeRateMinute() {
    return this._memoryChargeRateMinute
  }

  set memoryChargeRateMinute(memoryChargeRateMinute) {
    this._memoryChargeRateMinute = memoryChargeRateMinute
  }

  get memoryChargeRateDisplayType() {
    return this._memoryChargeRateDisplayType
  }

  set memoryChargeRateDisplayType(memoryChargeRateDisplayType) {
    this._memoryChargeRateDisplayType = memoryChargeRateDisplayType
  }

  get updateTime() {
    return this._updateTime
  }

  set updateTime(updateTime) {
    return (this._updateTime = updateTime)
  }
}

class StoragePolicy {
  constructor() {
    this.id = 0
    this.pathList = []
    this.storageChargeRate = 1
    this.updateTime = new Date(0)
  }

  static parseFromRestApi(jsonObj) {
    const storagePolicy = new StoragePolicy()
    storagePolicy.id = jsonObj.id
    storagePolicy.pathList = jsonObj.path_list
    storagePolicy.storageChargeRate = jsonObj.storage_charge_rate
    storagePolicy.updateTime = Parser.parseTimeFromRestApi(jsonObj.last_operation_time)
    return storagePolicy
  }

  get id() {
    return this._id
  }

  set id(id) {
    return (this._id = id)
  }

  get pathList() {
    return this._pathList
  }

  set pathList(pathList) {
    return (this._pathList = pathList)
  }

  get storageChargeRate() {
    return this._storageChargeRate
  }

  set storageChargeRate(storageChargeRate) {
    return (this._storageChargeRate = storageChargeRate)
  }

  get updateTime() {
    return this._updateTime
  }

  set updateTime(updateTime) {
    return (this._updateTime = updateTime)
  }
}

class Statement {
  constructor() {
    this.id = 0
    this.user = ''
    this.credits = 0
    this.applyTime = null
    this.approvedTime = null
    this.balance = 0
    this.billingType = 'job'
    this.displayType = ''
    this.billing = {}
    this.description = ''
  }

  static parseFromRestApi(jsonObj) {
    const statement = new Statement()
    statement._id = jsonObj.id
    statement._user = jsonObj.user
    statement._credits = jsonObj.credits
    statement._applyTime = Parser.parseTimeFromRestApi(jsonObj.apply_time)
    statement._approvedTime = Parser.parseTimeFromRestApi(jsonObj.approved_time)
    statement._balance = jsonObj.balance
    statement._billingType = jsonObj.billing_type
    statement._displayType = jsonObj.display_type
    statement._billing = jsonObj.billing
    statement._description = '-'
    if (jsonObj.billing_type === 'job') {
      statement._description = `${jsonObj.billing.scheduler_id} - ${jsonObj.billing.job_name}`
    }
    if (jsonObj.billing_type === 'storage') {
      statement._description = jsonObj.billing.path
    }
    return statement
  }

  get _id() {
    return this.id
  }

  set _id(id) {
    this.id = id
  }

  get _user() {
    return this.user
  }

  set _user(user) {
    this.user = user
  }

  get _credits() {
    return this.credits
  }

  set _credits(credits) {
    this.credits = credits
  }

  get _applyTime() {
    return this.applyTime
  }

  set _applyTime(applyTime) {
    this.applyTime = applyTime
  }

  get _approvedTime() {
    return this.approvedTime
  }

  set _approvedTime(approvedTime) {
    this.approvedTime = approvedTime
  }

  get _balance() {
    return this.balance
  }

  set _balance(balance) {
    this.balance = balance
  }

  get _billingType() {
    return this.billingType
  }

  set _billingType(billingType) {
    this.billingType = billingType
  }

  get _displayType() {
    return this.displayType
  }

  set _displayType(displayType) {
    this.displayType = displayType
  }

  get _billing() {
    return this.billing
  }

  set _billing(billing) {
    this.billing = billing
  }

  get _description() {
    return this.description
  }

  set _description(description) {
    this.description = description
  }
}

function billGroupsTableDataParser(res) {
  const billGroups = []
  res.forEach(item => {
    billGroups.push(BillGroup.parseFromRestApi(item))
  })
  return {
    data: billGroups,
  }
}

function getBillGroupsTableDataFetcher() {
  return TableDataFetcherFactory.createLocalPagingFetcher(
    '/api/accounting/billgroup/',
    billGroupsTableDataParser,
    'data',
  )
}

function getAllBillGroups() {
  return new Promise((resolve, reject) => {
    Request.get('/api/accounting/billgroup/').then(
      res => {
        const billGroups = []
        res.body.forEach(obj => {
          billGroups.push(BillGroup.parseFromRestApi(obj))
        })
        resolve(billGroups)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getRelationshipByUsers(users) {
  const req = {
    name: users,
  }
  return new Promise((resolve, reject) => {
    Request.post('/api/accounting/user_billgroup/', req).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function createRelationshipByUsers(relationship) {
  const req = {
    user_billgroup_pairs: relationship,
  }
  return new Promise((resolve, reject) => {
    Request.put('api/accounting/user_billgroup/', req).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function deleteRelationshipByUsers(users) {
  const req = {
    username_list: users,
  }
  return new Promise((resolve, reject) => {
    Request.delete('api/accounting/user_billgroup/', { data: req }).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getBillGroupById(id) {
  return new Promise((resolve, reject) => {
    Request.get(`/api/accounting/billgroup/${id}/`).then(
      res => {
        resolve(BillGroup.parseFromRestApi(res.body))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function createBillGroup(data) {
  return new Promise((resolve, reject) => {
    const req = {
      name: data.name,
      charge_rate: parseFloat(data.chargeRate),
      cr_minute: parseFloat(data.cr_minute),
      cr_display_type: data.cr_display_type,
      gres_charge_rate: data.gresChargeRate,
      gcr_minute: data.gcr_minute,
      gcr_display_type: data.gcr_display_type,
      memory_charge_rate: parseFloat(data.memoryChargeRate),
      mcr_minute: parseFloat(data.mcr_minute),
      mcr_display_type: data.mcr_display_type,
      storage_charge_rate: parseFloat(data.storageChargeRate),
      balance: parseFloat(data.accountInitAmount),
      description: data.description,
    }
    Request.post('/api/accounting/billgroup/', req).then(
      res => {
        resolve(BillGroup.parseFromRestApi(res.body))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function updateBillGroup(data) {
  return new Promise((resolve, reject) => {
    const req = {
      name: data.name,
      charge_rate: parseFloat(data.chargeRate),
      cr_minute: parseFloat(data.cr_minute),
      cr_display_type: data.cr_display_type,
      gres_charge_rate: data.gresChargeRate,
      gcr_minute: data.gcr_minute,
      gcr_display_type: data.gcr_display_type,
      memory_charge_rate: parseFloat(data.memoryChargeRate),
      mcr_minute: parseFloat(data.mcr_minute),
      mcr_display_type: data.mcr_display_type,
      storage_charge_rate: parseFloat(data.storageChargeRate),
      description: data.description,
    }
    Request.patch(`/api/accounting/billgroup/${data.id}/`, req).then(
      res => {
        resolve(BillGroup.parseFromRestApi(res.body))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function deleteBillGroup(id, force = false) {
  return new Promise((resolve, reject) => {
    Request.delete(`/api/accounting/billgroup/${id}/${force ? '?force=true' : ''}`).then(
      res => {
        resolve(BillGroup.parseFromRestApi(res.body))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}
function copyBillGroup(data) {
  return new Promise((resolve, reject) => {
    const req = {
      name: data.name,
      balance: Number(data.accountInitAmount),
    }
    Request.post(`/api/accounting/billgroup/${data.id}/`, req).then(
      res => {
        resolve(BillGroup.parseFromRestApi(res.body))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function createBillGroupQueuePolicy(data) {
  return new Promise((resolve, reject) => {
    const req = {
      charge_rate: parseFloat(data.chargeRate),
      cr_minute: parseFloat(data.cr_minute),
      cr_display_type: data.cr_display_type,
      gres_charge_rate: data.gresChargeRate,
      gcr_minute: data.gcr_minute,
      gcr_display_type: data.gcr_display_type,
      memory_charge_rate: parseFloat(data.memoryChargeRate),
      mcr_minute: parseFloat(data.mcr_minute),
      mcr_display_type: data.mcr_display_type,
      queue_list: data.queueList,
    }
    Request.post(`/api/accounting/queuepolicy/${data.queuePolicyId}/`, req).then(
      res => {
        resolve()
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function updateBillGroupQueuePolicy(billGroupId, data) {
  return new Promise((resolve, reject) => {
    const req = {
      charge_rate: parseFloat(data.chargeRate),
      cr_minute: parseFloat(data.cr_minute),
      cr_display_type: data.cr_display_type,
      gres_charge_rate: data.gresChargeRate,
      gcr_minute: data.gcr_minute,
      gcr_display_type: data.gcr_display_type,
      memory_charge_rate: parseFloat(data.memoryChargeRate),
      mcr_minute: parseFloat(data.mcr_minute),
      mcr_display_type: data.mcr_display_type,
      queue_list: data.queueList,
    }
    Request.patch(`/api/accounting/queuepolicy/${billGroupId}/${data.queuePolicyId}/`, req).then(
      res => {
        resolve()
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function deleteBillGroupQueuePolicy(billGroupId, id) {
  return new Promise((resolve, reject) => {
    Request.delete(`/api/accounting/queuepolicy/${billGroupId}/${id}/`).then(
      res => {
        resolve()
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function createBillGroupStoragePolicy(data) {
  return new Promise((resolve, reject) => {
    const req = {
      storage_charge_rate: parseFloat(data.storageChargeRate),
      path_list: data.pathList,
    }
    Request.post(`/api/accounting/storagepolicy/${data.billGroupId}/`, req).then(
      res => {
        resolve()
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function updateBillGroupStoragePolicy(data) {
  return new Promise((resolve, reject) => {
    const req = {
      storage_charge_rate: parseFloat(data.storageChargeRate),
      path_list: data.pathList,
    }
    Request.patch(`/api/accounting/storagepolicy/${data.billGroupId}/${data.id}/`, req).then(
      res => {
        resolve()
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function deleteBillGroupStoragePolicy(billGroupId, id) {
  return new Promise((resolve, reject) => {
    Request.delete(`/api/accounting/storagepolicy/${billGroupId}/${id}/`).then(
      res => {
        resolve()
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function operateAccount(billGroupId, changeAmount) {
  return new Promise((resolve, reject) => {
    const req = {
      user: window.gApp.$store.state.auth.username,
      bill_group: billGroupId,
      credits: changeAmount,
    }
    Request.post('/api/accounting/deposit/', req).then(
      res => {
        resolve(BillGroup.parseFromRestApi(res.body.bill_group))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function checkBillGroup(billGroupId) {
  return new Promise((resolve, reject) => {
    const params = {
      bill_group_list: [billGroupId],
    }
    Request.post('/api/accounting/billgroup/user_list/', params).then(
      res => {
        resolve(res.body)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function statementTableDataParser(res) {
  const data = []
  res.data.forEach(item => {
    data.push(Statement.parseFromRestApi(item))
  })
  return {
    data,
    offset: res.offset,
    total: res.total,
  }
}

function statementRestApiPropMap(prop) {
  if (prop === 'id') return 'id'
  else if (prop === 'user') return 'user'
  else if (prop === 'credits') return 'credits'
  else if (prop === 'applyTime') return 'apply_time'
  else if (prop === 'approvedTime') return 'approved_time'
  else if (prop === 'balance') return 'balance'
  else if (prop === 'billingType') return 'billing_type'
  else if (prop === 'displayType') return 'billing_type'
  else if (prop === 'description') return 'description'
  else return ''
}

function getStatementTableDataFetcher(id) {
  const lang = window.gApp.$i18n.locale === 'zh' ? 'sc' : 'en'
  return TableDataFetcherFactory.createRemotePagingFetcher(
    `/api/accounting/deposit/list/${lang}/${id}/`,
    statementRestApiPropMap,
    statementTableDataParser,
    'data',
    'offset',
    'total',
  )
}

function downloadStatement(id, type, timeRange) {
  const url = `/api/accounting/deposit_report/billing_group_details.${type}/`
  const data = {
    language: window.gApp.$i18n.locale === 'en' ? 'en' : 'sc',
    bill_group: id,
    start_time: String(moment(timeRange[0]).unix()),
    end_time: String(moment(timeRange[1]).unix()),
    timezone_offset: String(new Date().getTimezoneOffset()),
  }
  return download(url, data, 'post')
}

export default {
  BillGroup,
  getBillGroupsTableDataFetcher,
  getAllBillGroups,
  getRelationshipByUsers,
  createRelationshipByUsers,
  deleteRelationshipByUsers,
  getBillGroupById,
  createBillGroup,
  updateBillGroup,
  deleteBillGroup,
  copyBillGroup,
  operateAccount,
  createBillGroupQueuePolicy,
  updateBillGroupQueuePolicy,
  deleteBillGroupQueuePolicy,
  createBillGroupStoragePolicy,
  updateBillGroupStoragePolicy,
  deleteBillGroupStoragePolicy,
  checkBillGroup,
  getStatementTableDataFetcher,
  downloadStatement,
}
