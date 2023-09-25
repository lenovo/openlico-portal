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
import AlertPolicyService from './alert-policy'

const AlertStatusEnums = ['present', 'confirmed', 'resolved']

class Alert {
  constructor() {
    this.id = 0
    this.policyId = ''
    this.policyName = ''
    this.policyLevel = ''
    this.status = ''
    this.createTime = new Date(0)
    this.nodeId = 0
    this.nodeName = ''
    this.gpuId = ''
    this.comment = ''
  }

  static parseFromRestApi(jsonObj) {
    const alert = new Alert()
    alert.id = jsonObj.id
    alert.policyId = jsonObj.policy__id
    alert.policyName = jsonObj.policy__name
    alert.policyLevel = AlertPolicyService.AlertPolicyLevelParse[jsonObj.policy__level.toLowerCase()]
    alert.status = jsonObj.status.toLowerCase()
    alert.createTime = Parser.parseTimeFromRestApi(jsonObj.create_time)
    alert.nodeId = 0
    alert.gpuId = jsonObj.gpu_index
    alert.nodeName = jsonObj.node
    alert.comment = jsonObj.comment
    return alert
  }
}

function buildFilters(idList, statusList, policyLevelList, timeRange) {
  const filters = []
  if (idList) {
    filters.push({ prop: 'id', type: 'in', values: idList })
  }
  if (statusList) {
    filters.push({ prop: 'status', type: 'in', values: statusList })
  }
  if (policyLevelList) {
    filters.push({
      prop: 'policy__level',
      type: 'in',
      values: policyLevelList,
    })
  }
  if (timeRange) {
    filters.push({ prop: 'create_time', type: 'range', values: timeRange })
  }
  return filters
}

function processByFilters(filters, action) {
  return new Promise((resolve, reject) => {
    const req = {
      filters,
      action,
    }
    Request.patch('/api/alert/', req).then(
      res => {
        resolve(res.body)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function alertsTableDataParser(res) {
  const alerts = []
  res.data.forEach(item => {
    alerts.push(Alert.parseFromRestApi(item))
  })
  return {
    offset: res.offset,
    total: res.total,
    data: alerts,
  }
}

function alertsRestApiPropMap(prop) {
  if (prop === 'id') return 'id'
  else if (prop === 'policyId') return 'policy__id'
  else if (prop === 'policyName') return 'policy__name'
  else if (prop === 'policyLevel') return 'policy__level'
  else if (prop === 'status') return 'status'
  else if (prop === 'createTime') return 'create_time'
  else if (prop === 'nodeName') return 'node'
  else if (prop === 'gpuId') return 'gpu_index'
  else if (prop === 'comment') return 'comment'
  else if (prop === 'nodeName') return 'node'
  else return ''
}

function getAlertTableDataFetcher() {
  return TableDataFetcherFactory.createRemotePagingFetcher(
    '/api/alert/',
    alertsRestApiPropMap,
    alertsTableDataParser,
    'data',
    'offset',
    'total',
  )
}
function confirmAlerts(idList, statusList, policyLevelList, timeRange) {
  return processByFilters(buildFilters(idList, statusList, policyLevelList, timeRange), 'confirm')
}
function fixAlerts(idList, statusList, policyLevelList, timeRange) {
  return processByFilters(buildFilters(idList, statusList, policyLevelList, timeRange), 'solve')
}
function deleteAlerts(idList, statusList, policyLevelList, timeRange) {
  return processByFilters(buildFilters(idList, statusList, policyLevelList, timeRange), 'delete')
}

function updateAlertComment(id, comment) {
  return new Promise((resolve, reject) => {
    const req = {
      comment,
    }
    Request.patch(`/api/alert/comment/${id}/`, req).then(
      res => {
        resolve(res.body)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getUnresolvedAlertCount() {
  return new Promise((resolve, reject) => {
    Request.get('/api/alert/count/').then(
      res => {
        resolve(res.body.count)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

export default {
  AlertStatusEnums,
  getAlertTableDataFetcher,
  confirmAlerts,
  fixAlerts,
  deleteAlerts,
  updateAlertComment,
  getUnresolvedAlertCount,
}
