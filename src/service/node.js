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
    location._slot = jsonObj.u
    location._height = parseInt(jsonObj.height)
    location._width = parseFloat(jsonObj.width)
    location._rackId = jsonObj.rack_id
    location._chassisId = jsonObj.chassis_id
  }

  get _slot() {
    return this.slot
  }

  set _slot(slot) {
    return (this.slot = slot)
  }

  get _height() {
    return this.height
  }

  set _height(height) {
    return (this.height = height)
  }

  get _width() {
    return this.width
  }

  set _width(width) {
    return (this.width = width)
  }

  get _rackId() {
    return this.rackId
  }

  set _rackId(rackId) {
    return (this.rackId = rackId)
  }

  get _chassisId() {
    return this.chassisId
  }

  set _chassisId(chassisId) {
    return (this.chassisId = chassisId)
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

  get _index() {
    return this.index
  }

  set _index(index) {
    return (this.index = index)
  }

  get _devId() {
    return this.devId
  }

  set _devId(devId) {
    return (this.devId = devId)
  }

  get _type() {
    return this.type
  }

  set _type(type) {
    return (this.type = type)
  }

  get _vendor() {
    return this.vendor
  }

  set _vendor(vendor) {
    return (this.vendor = vendor)
  }

  get _used() {
    return this.used
  }

  set _used(used) {
    return (this.used = used)
  }

  get _devUsed() {
    return this.devUsed
  }

  set _devUsed(devUsed) {
    return (this.devUsed = devUsed)
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

  static parseFromRestApi(jsonObj, monitor) {
    const node = new Node()
    node._id = jsonObj.id
    node._hostname = jsonObj.hostname
    node._type = jsonObj.type.toLowerCase()
    node._osIP = jsonObj.mgt_address
    node._bmcIP = jsonObj.bmc_address
    node._machineType = jsonObj.machinetype
    node._frontImageUrl = jsonObj.frontimage
    node._onCloud = jsonObj.on_cloud
    node._groups = jsonObj.groups.map(i => i.name).join()
    node._location = jsonObj.location ? NodeLocation.parseFromRestApi(jsonObj.location) : ''
    node._alertPolicyLevel =
      jsonObj.alarm_level === null ? null : AlertPolicyService.AlertLevelToParse[String(jsonObj.alarm_level)]
    if (monitor === undefined) {
      getNodeHardwareByHostname(jsonObj.hostname, node)
    } else {
      Node.setNodeMonitor(node, jsonObj)
    }
    return node
  }

  static setNodeMonitor(node, jsonObj) {
    node._status = jsonObj.status === 'used' ? 'busy' : jsonObj.status
    node._health = jsonObj.health && Constants.NodeHealthState.includes(jsonObj.health) ? jsonObj.health : ''
    node._powerStatus = jsonObj.power_status
    node._cpuUsed = 0.0
    node._cpuTotal = !isNaN(jsonObj.cpu_total) ? jsonObj.cpu_total : null
    node._ramUsed = jsonObj.memory_used ? jsonObj.memory_used * 1024 : null
    node._ramTotal = !isNaN(jsonObj.memory_total) ? jsonObj.memory_total * 1024 : null
    node._diskUsed = !isNaN(jsonObj.disk_used) ? jsonObj.disk_used * 1024 * 1024 * 1024 : null
    node._diskTotal = !isNaN(jsonObj.disk_total) ? jsonObj.disk_total * 1024 * 1024 * 1024 : null
    node._gpus = []
    if (jsonObj.gpu) {
      node._gpuTotal = jsonObj.gpu.product.length
      for (let i = 0; i < jsonObj.gpu.product.length; i++) {
        const dev = jsonObj.gpu.logical_dev_info[i]
        if (jsonObj.gpu.vendor[i] === 'INTEL' && dev.length > 0) {
          for (let devId = 0; devId < dev.length; devId++) {
            const gpu = new Gpu()
            gpu._index = i
            gpu._devId = devId
            gpu._type = jsonObj.gpu.product[i]
            gpu._vendor = jsonObj.gpu.vendor[i]
            gpu._used = jsonObj.gpu.used[i]
            gpu._devUsed = dev[devId][1]
            node._gpus.push(gpu)
          }
        } else {
          const gpu = new Gpu()
          gpu._index = i
          gpu._type = jsonObj.gpu.product[i]
          gpu._vendor = jsonObj.gpu.vendor[i]
          gpu._used = jsonObj.gpu.used[i]
          node._gpus.push(gpu)
        }
      }
    }
  }

  get _id() {
    return this.id
  }

  set _id(id) {
    return (this.id = id)
  }

  get _hostname() {
    return this.hostname
  }

  set _hostname(hostname) {
    return (this.hostname = hostname)
  }

  get _status() {
    return this.status
  }

  set _status(status) {
    return (this.status = status)
  }

  get _health() {
    return this.health
  }

  set _health(health) {
    return (this.health = health)
  }

  get _powerStatus() {
    return this.powerStatus
  }

  set _powerStatus(powerStatus) {
    return (this.powerStatus = powerStatus)
  }

  get _type() {
    return this.type
  }

  set _type(type) {
    return (this.type = type)
  }

  get _osIP() {
    return this.osIP
  }

  set _osIP(osIP) {
    return (this.osIP = osIP)
  }

  get _bmcIP() {
    return this.bmcIP
  }

  set _bmcIP(bmcIP) {
    return (this.bmcIP = bmcIP)
  }

  get _machineType() {
    return this.machineType
  }

  set _machineType(machineType) {
    return (this.machineType = machineType)
  }

  get _frontImageUrl() {
    return this.frontImageUrl
  }

  set _frontImageUrl(frontImageUrl) {
    return (this.frontImageUrl = frontImageUrl)
  }

  get _groups() {
    return this.groups
  }

  set _groups(groups) {
    return (this.groups = groups)
  }

  get _cpuUsed() {
    return this.cpuUsed
  }

  set _cpuUsed(cpuUsed) {
    return (this.cpuUsed = cpuUsed)
  }

  get _cpuTotal() {
    return this.cpuTotal
  }

  set _cpuTotal(cpuTotal) {
    return (this.cpuTotal = cpuTotal)
  }

  get _ramUsed() {
    return this.ramUsed
  }

  set _ramUsed(ramUsed) {
    return (this.ramUsed = ramUsed)
  }

  get _ramTotal() {
    return this.ramTotal
  }

  set _ramTotal(ramTotal) {
    return (this.ramTotal = ramTotal)
  }

  get _diskUsed() {
    return this.diskUsed
  }

  set _diskUsed(diskUsed) {
    return (this.diskUsed = diskUsed)
  }

  get _diskTotal() {
    return this.diskTotal
  }

  set _diskTotal(diskTotal) {
    return (this.diskTotal = diskTotal)
  }

  get _alertPolicyLevel() {
    return this.alertPolicyLevel
  }

  set _alertPolicyLevel(alertPolicyLevel) {
    return (this.alertPolicyLevel = alertPolicyLevel)
  }

  get _location() {
    return this.location
  }

  set _location(location) {
    return (this.location = location)
  }

  get _gpus() {
    return this.gpus
  }

  set _gpus(gpus) {
    return (this.gpus = gpus)
  }

  get _onCloud() {
    return this.onCloud
  }

  set _onCloud(onCloud) {
    return (this.onCloud = onCloud)
  }

  get _gpuTotal() {
    return this.gpuTotal
  }

  set _gpuTotal(gpuTotal) {
    return (this.gpuTotal = gpuTotal)
  }
}

function nodesTableDataParser(res) {
  const nodes = res.data
  return {
    offset: res.offset,
    total: res.total,
    data: nodes.map(node => Node.parseFromRestApi(node)),
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

function getNodeHardwareByHostname(name, node) {
  return new Promise((resolve, reject) => {
    const req = {
      args: {
        offset: 0,
        length: 50,
        filters: [{ prop: 'hostname', type: 'in', values: [name] }],
        sort: { prop: 'hostname', order: 'ascend' },
      },
    }
    Request.get('/api/monitor/node/', { params: req }).then(
      res => {
        const data = res.body.data[0]
        if (node && data && node.hostname === data.hostname) {
          Node.setNodeMonitor(node, data)
        }
        resolve(data)
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
    const nodeMonitor = getNodeHardwareByHostname(hostname)
    Promise.all([nodeInfo, nodeAlert, nodeMonitor]).then(
      res => {
        const node = Node.parseFromRestApi(
          {
            ...res[0].body,
            ...res[1].body.node,
            ...res[2],
          },
          true,
        )
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
  return `/api/external/confluent/console/${hostname}/`
}

function getNodeShellServiceUrl(hostname) {
  return `/api/external/confluent/shell/${hostname}/`
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
