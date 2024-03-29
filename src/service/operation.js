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
import ErrorHandler from '../common/error-handler'
import TableDataFetcherFactory from '../common/table-data-fetcher-factory'

const ModuleEnums = [
  {
    value: 'user',
    children: [{ value: 'create' }, { value: 'update' }, { value: 'delete' }],
  },
  {
    value: 'job',
    children: [
      { value: 'create' },
      { value: 'rerun' },
      { value: 'priority' },
      { value: 'hold' },
      { value: 'release' },
      { value: 'requeue' },
      { value: 'suspend' },
      { value: 'resume' },
      { value: 'cancel' },
      { value: 'delete' },
    ],
  },
  {
    value: 'node',
    featureCode: 'sc.host.*,monitor.cluster',
    children: [{ value: 'turn_on' }, { value: 'turn_off' }],
  },
  {
    value: 'alert',
    featureCode: ['sc.host.*,monitor.cluster'],
    children: [{ value: 'confirm' }, { value: 'solve' }, { value: 'delete' }, { value: 'comment' }],
  },
  {
    value: 'policy',
    featureCode: ['sc.host.*,monitor.cluster'],
    children: [{ value: 'create' }, { value: 'update' }, { value: 'delete' }],
  },
  {
    value: 'billgroup',
    featureCode: ['sc.host.*'],
    children: [{ value: 'create' }, { value: 'update' }, { value: 'delete' }, { value: 'low_balance' }],
  },
  {
    value: 'deposit',
    featureCode: ['sc.host.*'],
    children: [{ value: 'recharge' }, { value: 'chargeback' }],
  },
]

class Operation {
  constructor() {
    this.logId = 0
    this.userName = ''
    this.action = ''
    this.actionTime = new Date(0)
    this.target = []
    this.module = ''
  }

  static parseFromRestApi(jsonObj) {
    const operation = new Operation()
    operation.logId = jsonObj.id
    operation.userName = jsonObj.operator
    operation.action = getOperationEnums(jsonObj.operation)
    operation.actionTime = Parser.parseTimeFromRestApi(jsonObj.operate_time)
    operation.module = getModuleEnums(jsonObj.module)
    const _target = jsonObj.target
    _target.forEach(item => {
      operation.target.push({
        id: item.id,
        name: item.name,
      })
    })
    return operation
  }
}
function getModuleEnums(modul) {
  const modules = {
    user: 'user',
    job: 'job',
    node: 'node',
    alert: 'alert',
    policy: 'policy',
    billgroup: 'billgroup',
    deposit: 'deposit',
  }
  return modules[modul]
}
function getOperationEnums(operation) {
  const operations = {
    create: 'create',
    update: 'update',
    cancel: 'cancel',
    rerun: 'rerun',
    delete: 'delete',
    comment: 'comment',
    turn_on: 'turn_on',
    turn_off: 'turn_off',
    confirm: 'confirm',
    solve: 'solve',
    recharge: 'recharge',
    chargeback: 'chargeback',
    priority: 'priority',
    hold: 'hold',
    release: 'release',
    requeue: 'requeue',
    suspend: 'suspend',
    resume: 'resume',
    low_balance: 'low_balance',
  }
  return operations[operation]
}

function operationsTableDataParser(res) {
  const operations = []
  res.data.forEach(item => {
    operations.push(Operation.parseFromRestApi(item))
  })
  return {
    offset: res.offset,
    total: res.total,
    data: operations,
  }
}

function operationsRestApiPropMap(prop) {
  if (prop === 'logId') return 'id'
  else if (prop === 'userName') return 'operator'
  else if (prop === 'action') return 'operation'
  else if (prop === 'actionTime') return 'operate_time'
  else if (prop === 'module') return 'module'
  else if (prop === 'target') return 'target'
  else return ''
}

function getOperationTableDataFetcher() {
  return TableDataFetcherFactory.createRemotePagingFetcher(
    '/api/operation/optlog/',
    operationsRestApiPropMap,
    operationsTableDataParser,
    'data',
    'offset',
    'total',
  )
}

function getOptlogLatest(length) {
  return new Promise((resolve, reject) => {
    const params = {
      args: {
        length,
        offset: 0,
        filters: [],
        sort: { prop: 'operate_time', order: 'descend' },
      },
    }
    Request.get('/api/operation/optlog/', { params }).then(
      res => {
        const operations = []
        res.body.data.forEach(item => {
          operations.push(Operation.parseFromRestApi(item))
        })
        resolve(operations)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

export default {
  ModuleEnums,
  getOperationTableDataFetcher,
  getOptlogLatest,
}
