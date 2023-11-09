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

import TableDataFetcherFactory from '../common/table-data-fetcher-factory'
import ErrorHandler from '../common/error-handler'
import utils from '../common/utils'
import Request from '../request/https'
import Collection from '../common/collection'

const AlertPolicyLevelEnums = ['critical', 'error', 'warning', 'info']
const AlertPolicyLevelParse = {
  error: 'error',
  warn: 'warning',
  fatal: 'critical',
  info: 'info',
}
const AlertPolicyLevelValueParse = {
  error: 'error',
  warning: 'warn',
  critical: 'fatal',
  info: 'info',
}
// const AlertPolicyStatusEnums = ['on', 'off']
const AlertTriggerMonitorEnums = [
  'CPU',
  'Memory',
  'GPU',
  'Temperature',
  'GPU_Temperature',
  'Network',
  'Disk',
  'Electric',
  'Hardware',
  'HardwareDiff',
]
// const AlertTriggerTypeEnums = ['Greater', 'Lower', 'Equal', 'Off', 'Error']

const AlertLevelToParse = {
  50: 'critical',
  40: 'error',
  30: 'warning',
  20: 'info',
}
const AlertTriggerMonitorToParse = {
  CPUSAGE: 'CPU',
  MEMORY_UTIL: 'Memory',
  GPU_UTIL: 'GPU',
  TEMP: 'Temperature',
  GPU_TEMP: 'GPU_Temperature',
  // 'GPU_MEM':'GMEM',
  NODE_ACTIVE: 'Network',
  DISK: 'Disk',
  ELECTRIC: 'Electric',
  HARDWARE: 'Hardware',
  HARDWARE_DISCOVERY: 'HardwareDiff',
}
const AlertTriggerTypeToParse = {
  $gt: 'Greater',
  $lt: 'Lower',
  $eq: 'Equal',
  off: 'Off',
  error: 'Error',
}

function getKeys(obj) {
  const keys = []
  for (const key in obj) {
    keys.push(key)
  }
  return keys
}

function findKey(obj, val) {
  for (const key in obj) {
    if (obj[key] === val) {
      return key
    }
  }
}

class AlertTrigger {
  constructor() {
    this.monitor = ''
    this.type = ''
    this.value = ''
    this.duration = 0
  }

  static toRestApi(alertTrigger, operation, id) {
    const portal = {}
    let node = alertTrigger.node
    if (node.length < 1 || (node.length === 1 && node[0] === '')) {
      node = ['all']
    }
    portal[findKey(AlertTriggerTypeToParse, alertTrigger.condition)] =
      Number(alertTrigger.value) * alertTrigger.AlertInputRole.seed
    return {
      id,
      name: alertTrigger.name,
      metric_policy: findKey(AlertTriggerMonitorToParse, alertTrigger.monitor),
      duration: parseFloat(alertTrigger.duration),
      level: String(findKey(AlertLevelToParse, alertTrigger.level)),
      nodes: node,
      comments: alertTrigger.wechat ? ['wechat'] : [],
      status: alertTrigger.status ? 'ON' : 'OFF',
      operation,
      script: alertTrigger.script,
      targets: alertTrigger.nogify,
      language: window.gApp.$i18n.locale,
      portal,
    }
  }

  static parseFromRestApi(jsonObj) {
    const alertTrigger = new AlertTrigger()
    alertTrigger.monitor = AlertTriggerMonitorToParse[jsonObj.metric_policy]
    const unit = getTriggerInputRole(alertTrigger.monitor)
    alertTrigger.type = AlertTriggerTypeToParse[getKeys(jsonObj.portal)[0]]
    alertTrigger.value = !utils.isUndefined(alertTrigger.type)
      ? Math.round(Number(jsonObj.portal[getKeys(jsonObj.portal)[0]]) / unit.seed)
      : ''
    alertTrigger.duration = String(jsonObj.duration)
    return alertTrigger
  }
}

class AlertPolicy {
  constructor() {
    this.id = 0
    this.name = ''
    this.type = 'CPU'
    this.level = ''
    this.status = 'OFF'
    this.node = []
    this.email = ''
    this.sms = ''
    this.wechat = false
    this.targets = []
    this.trigger = new AlertTrigger()
  }

  static parseFromRestApi(jsonObj) {
    const alertPolicy = new AlertPolicy()
    alertPolicy.id = jsonObj.id
    alertPolicy.name = jsonObj.name
    alertPolicy.level = AlertLevelToParse[String(jsonObj.level)]
    alertPolicy.status = jsonObj.status === 'ON'
    alertPolicy.node = jsonObj.nodes === 'all' ? [] : jsonObj.nodes
    alertPolicy.targets = jsonObj.targets
    if (jsonObj.comments) {
      alertPolicy.wechat = jsonObj.comments.includes('wechat')
    }
    alertPolicy.script = jsonObj.script
    alertPolicy.trigger = AlertTrigger.parseFromRestApi(jsonObj)
    return alertPolicy
  }
}

function alertPolicyTableDataParser(res) {
  const alertPolicies = []
  res.forEach(item => {
    alertPolicies.push(AlertPolicy.parseFromRestApi(item))
  })
  return {
    data: alertPolicies,
  }
}

function alertPolicyTableDataSorter(dataItems, prop, order) {
  if (prop === 'level') {
    Collection.sortObjectsByProp(dataItems, prop, order, compareLevel)
    return true
  }
  function compareLevel(objA, objB) {
    const indexA = AlertPolicyLevelEnums.indexOf(objA.level)
    const indexB = AlertPolicyLevelEnums.indexOf(objB.level)
    if (indexA > indexB) {
      return -1
    } else if (indexA < indexB) {
      return 1
    } else {
      return 0
    }
  }
  return false
}

function getAlertPolicyTableDataFetcher() {
  return TableDataFetcherFactory.createLocalPagingFetcher(
    '/api/alert/policy/',
    alertPolicyTableDataParser,
    'data',
    alertPolicyTableDataSorter,
  )
}

function createAlertPolicy(alertPolicy) {
  return new Promise((resolve, reject) => {
    const req = AlertTrigger.toRestApi(alertPolicy, 'create', null)
    Request.post('/api/alert/policy/', req).then(
      res => {
        resolve(AlertPolicy.parseFromRestApi(res.data))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getAlertPolicyById(id) {
  return new Promise((resolve, reject) => {
    Request.get(`/api/alert/policy/${id}/`).then(
      res => {
        const alertPolicy = AlertPolicy.parseFromRestApi(res.data)
        resolve(alertPolicy)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function updateAlertPolicy(id, alertPolicy) {
  return new Promise((resolve, reject) => {
    const req = AlertTrigger.toRestApi(alertPolicy, 'update', id)
    Request.put(`/api/alert/policy/${id}/`, req).then(
      res => {
        const alertPolicy = AlertPolicy.parseFromRestApi(res.data)
        resolve(alertPolicy)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function deleteAlertPolicy(id) {
  return new Promise((resolve, reject) => {
    Request.delete(`/api/alert/policy/${id}/`).then(
      res => {
        const alertPolicy = AlertPolicy.parseFromRestApi(res.data)
        resolve(alertPolicy)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getTriggerInputRole(monitor) {
  switch (monitor) {
    case 'CPU':
    case 'Memory':
    case 'GPU':
    case 'Disk':
      return {
        typeOptions: ['Greater', 'Lower'],
        value: true,
        duration: true,
        unit: '%',
        seed: 1,
      }
    case 'Temperature':
    case 'GPU_Temperature':
      return {
        typeOptions: ['Greater', 'Lower'],
        value: true,
        duration: true,
        unit: '℃',
        seed: 1,
      }
    case 'GMEM':
      return {
        typeOptions: ['Greater', 'Lower'],
        value: true,
        duration: true,
        unit: 'GB',
        seed: 1024,
      }
    case 'Electric':
      return {
        typeOptions: ['Greater', 'Lower'],
        value: true,
        duration: true,
        unit: 'W',
        seed: 1,
      }
    default:
      return {
        typeOptions: ['Off', 'Error'],
        value: false,
        duration: true,
        unit: '',
        seed: 1,
      }
  }
}

export default {
  AlertLevelToParse,
  AlertPolicyLevelEnums,
  AlertTriggerMonitorEnums,
  getAlertPolicyTableDataFetcher,
  createAlertPolicy,
  getAlertPolicyById,
  updateAlertPolicy,
  deleteAlertPolicy,
  getTriggerInputRole,
  AlertPolicyLevelParse,
  AlertPolicyLevelValueParse,
}
