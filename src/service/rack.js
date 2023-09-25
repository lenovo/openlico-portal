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
import ErrorHandler from '../common/error-handler'
import Data from 'static/settings/rack-conf.json'

function handleMathOperations(x, y, decimalPlaces) {
  decimalPlaces = decimalPlaces || 2
  if (!isNaN(y) && y > 0) {
    const result = (x / y) * 100
    return result % 1 > 0 ? result.toFixed(decimalPlaces) : result
  } else {
    return 0
  }
}

class RackLocation {
  constructor() {
    this.rowIndex = 0
    this.colIndex = 0
  }

  static parseFromRestApi(jsonObj) {
    const location = new RackLocation()
    location._rowIndex = jsonObj.row_index
    location._colIndex = jsonObj.col_index
    return location
  }

  get _rowIndex() {
    return this.rowIndex
  }

  set _rowIndex(rowIndex) {
    return (this.rowIndex = rowIndex)
  }

  get _colIndex() {
    return this.colIndex
  }

  set _colIndex(colIndex) {
    return (this.colIndex = colIndex)
  }
}

class ChassisLocation {
  constructor() {
    this.rackId = 0
    this.u = 0
  }

  static parseFromRestApi(jsonObj) {
    const location = new ChassisLocation()
    location._rackId = jsonObj.rack_id
    location._u = jsonObj.u
    return location
  }

  get _rackId() {
    return this.rackId
  }

  set _rackId(rackId) {
    return (this.rackId = rackId)
  }

  get _u() {
    return this.u
  }

  set _u(u) {
    return (this.u = u)
  }
}
class Capacity {
  constructor() {
    this.height = 0
    this.width = 0
  }

  static parseFromRestApi(jsonObj) {
    const capacity = new Capacity()
    capacity._height = jsonObj.height ? parseInt(jsonObj.height) : 0
    capacity._width = jsonObj.width ? parseInt(jsonObj.width) : 0
    return capacity
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
}
class NodeLocation {
  constructor() {
    this.u = 0
    this.height = 0
    this.width = 0
    this.rackId = 0
    this.chassisId = 0
  }

  static parseFromRestApi(jsonObj) {
    const location = new NodeLocation()
    location._u = jsonObj.u
    location._height = jsonObj.height ? parseInt(jsonObj.height) : 0
    location._width = jsonObj.width ? parseFloat(jsonObj.width) : 0
    location._rackId = jsonObj.rack_id
    location._chassisId = jsonObj.chassis_id !== 'null' ? jsonObj.chassis_id : ''
    return location
  }

  get _u() {
    return this.u
  }

  set _u(u) {
    return (this.u = u)
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
class Chassis {
  constructor() {
    this.id = 0
    this.name = ''
    this.frontimage = ''
    this.machinetype = ''
    this.location = new ChassisLocation()
    this.capacity = new Capacity()
  }

  static parseFromRestApi(jsonObj) {
    const chassis = new Chassis()
    chassis._id = jsonObj.id
    chassis._name = jsonObj.name
    chassis._machinetype = jsonObj.machine_type
    chassis._location = ChassisLocation.parseFromRestApi({
      u: jsonObj.location_u,
    })
    fillRackDefine(chassis, getRackDefineById('chassis', jsonObj.machine_type))
    return chassis
  }

  get _id() {
    return this.id
  }

  set _id(id) {
    return (this.id = id)
  }

  get _name() {
    return this.name
  }

  set _name(name) {
    return (this.name = name)
  }

  get _frontimage() {
    return this.frontimage
  }

  set _frontimage(frontimage) {
    return (this.frontimage = frontimage)
  }

  get _machinetype() {
    return this.machinetype
  }

  set _machinetype(machinetype) {
    return (this.machinetype = machinetype)
  }

  get _location() {
    return this.location
  }

  set _location(location) {
    return (this.location = location)
  }

  get _capacity() {
    return this.capacity
  }

  set _capacity(capacity) {
    return (this.capacity = capacity)
  }
}

class Switch {
  constructor() {
    this.id = 0
    this.hostname = ''
    this.frontimage = ''
    this.machinetype = ''
    this.status = ''
    this.location = new NodeLocation()
  }

  static parseFromRestApi(jsonObj) {
    const rackswitch = new Switch()
    rackswitch._id = jsonObj.id
    rackswitch._hostname = jsonObj.hostname
    rackswitch._machinetype = jsonObj.machinetype
    rackswitch._status = jsonObj.power_status
    rackswitch._location = NodeLocation.parseFromRestApi(jsonObj.location)
    fillRackDefine(rackswitch, getRackDefineById('switch', jsonObj.machinetype))
    return rackswitch
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

  get _frontimage() {
    return this.frontimage
  }

  set _frontimage(frontimage) {
    return (this.frontimage = frontimage)
  }

  get _machinetype() {
    return this.machinetype
  }

  set _machinetype(machinetype) {
    return (this.machinetype = machinetype)
  }

  get _status() {
    return this.status
  }

  set _status(status) {
    return (this.status = status)
  }

  get _location() {
    return this.location
  }

  set _location(location) {
    return (this.location = location)
  }
}
class Node {
  constructor() {
    this.id = 0
    this.hostname = ''
    this.status = ''
    this.machinetype = ''
    this.frontimage = ''
    this.location = new NodeLocation()
    this.energy = ''
    this.temperature = ''
    this.network = ','
    this.load = ''
    this.diskUsed = ''
    this.memoryUsed = ''
    this.cpuUsed = ''
    this.cpuCoreUsed = ''
    this.alert = null
  }

  static parseFromRestApi(jsonObj) {
    const node = new Node()
    node._id = jsonObj.id
    node._hostname = jsonObj.hostname
    node._status = jsonObj.power_status ? 'on' : 'off'
    node._machinetype = jsonObj.machinetype
    node._location = NodeLocation.parseFromRestApi(jsonObj.location)
    node._energy = isNaN(jsonObj.energy) ? 0 : jsonObj.energy
    node._temperature = isNaN(jsonObj.temperature) ? 0 : jsonObj.temperature
    node._network = [jsonObj.eth_in || 0, jsonObj.eth_out || 0, jsonObj.ib_in || 0, jsonObj.ib_out || 0]
    node._load = isNaN(jsonObj.load) ? 0 : jsonObj.load
    node._diskUsed = handleMathOperations(jsonObj.disk_used, jsonObj.disk_total, 2)

    node._memoryUsed = handleMathOperations(jsonObj.memory_used, jsonObj.memory_total, 2)
    node._cpuUsed = isNaN(jsonObj.cpu_util) ? 0 : jsonObj.cpu_util
    node._cpuCoreUsed = jsonObj.cpu_core_used
    node._alert = jsonObj.alarm_level
    fillRackDefine(node, getRackDefineById('node', jsonObj.machinetype))
    return node
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

  get _machinetype() {
    return this.machinetype
  }

  set _machinetype(machinetype) {
    return (this.machinetype = machinetype)
  }

  get _frontimage() {
    return this.frontimage
  }

  set _frontimage(frontimage) {
    return (this.frontimage = frontimage)
  }

  get _location() {
    return this.location
  }

  set _location(location) {
    return (this.location = location)
  }

  get _energy() {
    return this.energy
  }

  set _energy(energy) {
    return (this.energy = energy)
  }

  get _temperature() {
    return this.temperature
  }

  set _temperature(temperature) {
    return (this.temperature = temperature)
  }

  get _network() {
    return this.network
  }

  set _network(network) {
    return (this.network = network)
  }

  get _load() {
    return this.load
  }

  set _load(load) {
    return (this.load = load)
  }

  get _diskUsed() {
    return this.diskUsed
  }

  set _diskUsed(diskUsed) {
    return (this.diskUsed = diskUsed)
  }

  get _memoryUsed() {
    return this.memoryUsed
  }

  set _memoryUsed(memoryUsed) {
    return (this.memoryUsed = memoryUsed)
  }

  get _cpuUsed() {
    return this.cpuUsed
  }

  set _cpuUsed(cpuUsed) {
    return (this.cpuUsed = cpuUsed)
  }

  get _cpuCoreUsed() {
    return this.cpuCoreUsed
  }

  set _cpuCoreUsed(cpuCoreUsed) {
    return (this.cpuCoreUsed = cpuCoreUsed)
  }

  get _alert() {
    return this.alert
  }

  set _alert(alert) {
    return (this.alert = alert)
  }
}
class Rack {
  constructor() {
    this.id = 0
    this.name = ''
    this.nodeCount = 0
    this.nodeBusy = 0
    this.nodeFree = 0
    this.nodeOff = 0
    this.nodeUsed = 0
    this.energy = ''
    this.frontimage = ''
    this.location = new RackLocation()
    this.capacity = new Capacity()
    this.chassis = []
    this.switches = []
    this.nodes = []
  }

  static parseFromRestApi(jsonObj, rackDefine) {
    const rack = new Rack()
    rack._id = jsonObj.id
    rack._name = jsonObj.name
    rack._nodeCount = jsonObj.node_num
    rack._nodeBusy = jsonObj.node_busy
    rack._nodeFree = jsonObj.node_free
    rack._nodeOff = jsonObj.node_off
    rack._nodeUsed = jsonObj.node_used
    rack._energy = jsonObj.energy
    rack._location = RackLocation.parseFromRestApi(jsonObj.location)
    fillRackDefine(rack, getRackDefineById('rack', 'rack'))
    jsonObj.nodes.forEach(node => {
      rack._nodes.push(Node.parseFromRestApi(node))
    })
    if (jsonObj.switches) {
      jsonObj.switches.forEach(item => {
        rack._switches.push(Switch.parseFromRestApi(item))
      })
    }
    if (jsonObj.chassis) {
      jsonObj.chassis.forEach(chassis => {
        rack._chassis.push(Chassis.parseFromRestApi(chassis))
      })
    }
    return rack
  }

  get _id() {
    return this.id
  }

  set _id(id) {
    return (this.id = id)
  }

  get _name() {
    return this.name
  }

  set _name(name) {
    return (this.name = name)
  }

  get _nodeCount() {
    return this.nodeCount
  }

  set _nodeCount(nodeCount) {
    return (this.nodeCount = nodeCount)
  }

  get _nodeBusy() {
    return this.nodeBusy
  }

  set _nodeBusy(nodeBusy) {
    return (this.nodeBusy = nodeBusy)
  }

  get _nodeFree() {
    return this.nodeFree
  }

  set _nodeFree(nodeFree) {
    return (this.nodeFree = nodeFree)
  }

  get _nodeOff() {
    return this.nodeOff
  }

  set _nodeOff(nodeOff) {
    return (this.nodeOff = nodeOff)
  }

  get _nodeUsed() {
    return this.nodeUsed
  }

  set _nodeUsed(nodeUsed) {
    return (this.nodeUsed = nodeUsed)
  }

  get _energy() {
    return this.energy
  }

  set _energy(energy) {
    return (this.energy = energy)
  }

  get _frontimage() {
    return this.frontimage
  }

  set _frontimage(frontimage) {
    return (this.frontimage = frontimage)
  }

  get _location() {
    return this.location
  }

  set _location(location) {
    return (this.location = location)
  }

  get _capacity() {
    return this.capacity
  }

  set _capacity(capacity) {
    return (this.capacity = capacity)
  }

  get _chassis() {
    return this.chassis
  }

  set _chassis(chassis) {
    return (this.chassis = chassis)
  }

  get _switches() {
    return this.switches
  }

  set _switches(switches) {
    return (this.switches = switches)
  }

  get _nodes() {
    return this.nodes
  }

  set _nodes(nodes) {
    return (this.nodes = nodes)
  }
}

function compareRackByCode(rackDefine, code) {
  code = code.toLowerCase()
  rackDefine.code = rackDefine.code.toLowerCase()
  rackDefine.aliasCodes = rackDefine.aliasCodes.map(i => i.toLowerCase())
  if (rackDefine.code === code || (rackDefine.aliasCodes && rackDefine.aliasCodes.indexOf(code) >= 0)) {
    return true
  }
  return false
}

function getRackDefineById(type, code) {
  for (let i = 0; i < Data.length; i++) {
    if (Data[i].type === type && compareRackByCode(Data[i], code)) {
      return Data[i]
    }
  }
  return null
}

function fillRackDefine(obj, define) {
  if (define) {
    obj.frontimage = define.frontimage
    obj.padding = define.padding
    obj.width_height = define.width_height
    obj.uheight = define.uheight
    obj.gap = define.gap
    if (obj.location && define.location) {
      obj.location.width = define.location.width
      obj.location.height = define.location.height
    }
    if (define.capacity) {
      obj.capacity.width = define.capacity.width
      obj.capacity.height = define.capacity.height
    }
  } else {
    obj.frontimage = 'default_1X.png'
    obj.location.width = obj.location.chassisId !== '' ? 0.5 : 1
    obj.location.height = 1
    if (!Object.prototype.hasOwnProperty.call(obj, 'status')) {
      obj.padding = [3, 2, 3, 2]
      obj.width_height = [254, 21]
      obj.uheight = [18]
      obj.gap = [2, 2]
    }
  }
  return obj
}

function getRackById(name) {
  return new Promise((resolve, reject) => {
    Request.get(`/api/cluster/rack/${name}/`).then(
      res => {
        const args = JSON.stringify({
          offset: 0,
          length: 200,
          filters: [
            {
              prop: 'hostname',
              type: 'in',
              values: res.body.nodes.map(n => n.hostname),
            },
          ],
          sort: { prop: 'hostname', order: 'ascend' },
        })
        const apiRack = Request.post('/api/monitor/rack/', { rack: [res.body.name] })
        const apiNode = Request.get('/api/monitor/node/', {
          params: { args },
        })
        Promise.all([apiRack, apiNode]).then(
          resp => {
            const nodes = res.body.nodes.map(i => {
              return {
                ...i,
                ...resp[1].body.data.filter(n => n.hostname === i.hostname)[0],
              }
            })
            resolve(
              Rack.parseFromRestApi({
                ...res.body,
                ...resp[0].body.data[0],
                ...{ nodes },
              }),
            )
          },
          errp => {
            ErrorHandler.restApiErrorHandler(errp, reject)
          },
        )
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}
function getAllRacks() {
  return new Promise(
    (resolve, reject) => {
      Request.get('/api/cluster/rack/').then(
        res => {
          resolve(res.body.racks)
        },
        res => {
          ErrorHandler.restApiErrorHandler(res, reject)
        },
      )
    },
    // res => {
    //   ErrorHandler.restApiErrorHandler(res, reject)
    // },
  )
}

function getRackHierarchy() {
  return new Promise((resolve, reject) => {
    Request.get('/api/cluster/rack_hierarchy/').then(
      res => {
        resolve(res.body.data)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

export default {
  getRackById,
  getAllRacks,
  getRackHierarchy,
}
