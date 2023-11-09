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
import AlertPolicyService from './alert-policy'
import Constants from '../common/constants'

const NodeStatusEnums = ['off', 'idle', 'used', 'busy']
const NodePowerStatusEnums = ['on', 'off']
const NodeType = ['head', 'login', 'compute', 'io']

class NodeLocation {
  constructor() {
    this.slot = 0
    this.height = 0
    this.width = 0
    this.rackId = 0
    this.chassisId = 0
  }

  static parseFromRestApi(jsonObj) {
    const location = new NodeLocation()
    location.slot = jsonObj.u
    location.height = parseInt(jsonObj.height)
    location.width = parseFloat(jsonObj.width)
    location.rackId = jsonObj.rack_id
    location.chassisId = jsonObj.chassis_id
  }
}

class Gpu {
  constructor() {
    this.index = 0
    this.devId = null
    this.type = ''
    this.vendor = ''
    this.used = false
    this.devUsed = false
  }
}

class Node {
  constructor() {
    this.id = 0
    this.hostname = ''
    this.status = ''
    this.health = ''
    this.powerStatus = ''
    this.type = ''
    this.osIP = ''
    this.bmcIP = ''
    this.machineType = ''
    this.frontImageUrl = ''
    this.groups = []
    this.cpuUsed = null
    this.cpuTotal = null
    this.ramUsed = null
    this.ramTotal = null
    this.diskUsed = null
    this.diskTotal = null
    this.alertPolicyLevel = ''
    this.location = new NodeLocation()
    this.gpus = []
    this.onCloud = false
    this.gpuTotal = 0
  }

  static parseFromRestApi(jsonObj) {
    const node = new Node()
    node.id = jsonObj.id
    node.hostname = jsonObj.hostname
    node.type = jsonObj.type.toLowerCase()
    node.osIP = jsonObj.mgt_address
    node.bmcIP = jsonObj.bmc_address
    node.machineType = jsonObj.machinetype
    node.frontImageUrl = jsonObj.frontimage
    node.onCloud = jsonObj.on_cloud
    node.groups = jsonObj.groups.map(i => i.name).join()
    node.location = jsonObj.location ? NodeLocation.parseFromRestApi(jsonObj.location) : ''
    node.alertPolicyLevel =
      jsonObj.alarm_level === null ? null : AlertPolicyService.AlertLevelToParse[String(jsonObj.alarm_level)]
    Node.setNodeMonitor(node, jsonObj)
    return node
  }

  static setNodeMonitor(node, jsonObj) {
    node.status = jsonObj.status === 'used' ? 'busy' : jsonObj.status
    node.health = jsonObj.health && Constants.NodeHealthState.includes(jsonObj.health) ? jsonObj.health : ''
    node.powerStatus = jsonObj.power_status
    node.cpuUsed = 0.0
    node.cpuTotal = !isNaN(jsonObj.cpu_total) ? jsonObj.cpu_total : null
    node.ramUsed = jsonObj.memory_used ? jsonObj.memory_used * 1024 : null
    node.ramTotal = !isNaN(jsonObj.memory_total) ? jsonObj.memory_total * 1024 : null
    node.diskUsed = !isNaN(jsonObj.disk_used) ? jsonObj.disk_used * 1024 * 1024 * 1024 : null
    node.diskTotal = !isNaN(jsonObj.disk_total) ? jsonObj.disk_total * 1024 * 1024 * 1024 : null
    node.gpus = []
    if (jsonObj.gpu) {
      node.gpuTotal = jsonObj.gpu.product.length
      for (let i = 0; i < jsonObj.gpu.product.length; i++) {
        const dev = jsonObj.gpu.logical_dev_info[i]
        if (jsonObj.gpu.vendor[i] === 'INTEL' && dev.length > 0) {
          for (let devId = 0; devId < dev.length; devId++) {
            const gpu = new Gpu()
            gpu.index = i
            gpu.devId = devId
            gpu.type = jsonObj.gpu.product[i]
            gpu.vendor = jsonObj.gpu.vendor[i]
            gpu.used = jsonObj.gpu.used[i]
            gpu.devUsed = dev[devId][1]
            node.gpus.push(gpu)
          }
        } else {
          const gpu = new Gpu()
          gpu.index = i
          gpu.type = jsonObj.gpu.product[i]
          gpu.vendor = jsonObj.gpu.vendor[i]
          gpu.used = jsonObj.gpu.used[i]
          node.gpus.push(gpu)
        }
      }
    }
  }
}

async function nodesTableDataParser(res) {
  const nodes = res.data
  const hostnames = nodes.map(i => i.hostname)
  const nodesMonitor = await getNodeHardwareByHostname(hostnames)

  return {
    offset: res.offset,
    total: res.total,
    data: nodes.map(node =>
      Node.parseFromRestApi({ ...node, ...(nodesMonitor.filter(i => i.hostname === node.hostname)[0] || {}) }),
    ),
  }
}

function nodesRestApiPropMap(prop) {
  if (prop === 'powerStatus') return 'power_status'
  if (prop === 'osIP') return 'mgt_address'
  if (prop === 'bmcIP') return 'bmc_address'
  if (prop === 'machineType') return 'machinetype'
  if (prop === 'cpuTotal') return 'processors_total'
  if (prop === 'ramUsed') return 'memory_used'
  if (prop === 'ramTotal') return 'memory_total'
  if (prop === 'diskUsed') return 'disk_used'
  if (prop === 'diskTotal') return 'disk_total'
  if (prop === 'alertPolicyLevel') return 'alert_level'
  if (prop === 'groups') return 'groups__name'
  return prop
}

function getNodesTableDataFetcher() {
  return TableDataFetcherFactory.createRemotePagingFetcher(
    '/api/cluster/node/',
    nodesRestApiPropMap,
    nodesTableDataParser,
    'data',
    'offset',
    'total',
  )
}

function getNodeHardwareByHostname(name) {
  return new Promise((resolve, reject) => {
    const req = {
      args: {
        offset: 0,
        length: 50,
        filters: [{ prop: 'hostname', type: 'in', values: name }],
        sort: { prop: 'hostname', order: 'ascend' },
      },
    }
    Request.get('/api/monitor/node/', { params: req }).then(
      res => {
        resolve(res.body.data)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function powerOnNode(hostname, nextDevice) {
  const req = {
    operation: 'turn_on',
  }
  if (nextDevice) {
    req.bootmode = 'uefi'
    req.nextdevice = nextDevice
    req.persistent = false
  }
  return new Promise((resolve, reject) => {
    Request.put(`/api/cluster/node/${hostname}/`, req).then(
      res => {
        resolve(hostname)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function powerOffNode(hostname) {
  const req = {
    operation: 'turn_off',
  }
  return new Promise((resolve, reject) => {
    Request.put(`/api/cluster/node/${hostname}/`, req).then(
      res => {
        resolve(hostname)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getNodeByName(hostname) {
  return new Promise((resolve, reject) => {
    const nodeInfo = Request.get(`/api/cluster/node/${hostname}/`)
    const nodeAlert = Request.get(`/api/alert/node/${hostname}/`)
    const nodeMonitor = getNodeHardwareByHostname([hostname])
    Promise.all([nodeInfo, nodeAlert, nodeMonitor]).then(
      res => {
        const node = Node.parseFromRestApi({
          ...res[0].body,
          ...res[1].body.node,
          ...res[2][0],
        })
        resolve(node)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getAllNodes(type) {
  const req = {
    args: {
      offset: 0,
      length: 50,
      filters: type ? [{ prop: 'type', type: 'in', values: [type] }] : [],
    },
  }
  return new Promise((resolve, reject) => {
    Request.get('/api/cluster/node/', { params: req }).then(
      res => {
        const data = []
        res.body.data.forEach(node => {
          data.push({
            hostname: node.hostname,
            id: node.id,
          })
        })
        resolve(data)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getNodeConsoleServiceUrl(hostname) {
  return `/api/confluent/console/${hostname}/`
}

function getNodeShellServiceUrl(hostname) {
  return `/api/confluent/shell/${hostname}/`
}

export default {
  Node,
  getNodesTableDataFetcher,
  powerOnNode,
  powerOffNode,
  getNodeByName,
  getAllNodes,
  NodeStatusEnums,
  NodePowerStatusEnums,
  NodeType,
  getNodeConsoleServiceUrl,
  getNodeShellServiceUrl,
  getNodeHardwareByHostname,
}
