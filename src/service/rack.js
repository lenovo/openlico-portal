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
    location.rowIndex = jsonObj.row_index
    location.colIndex = jsonObj.col_index
    return location
  }
}

class ChassisLocation {
  constructor() {
    this.rackId = 0
    this.u = 0
  }

  static parseFromRestApi(jsonObj) {
    const location = new ChassisLocation()
    location.rackId = jsonObj.rack_id
    location.u = jsonObj.u
    return location
  }
}
class Capacity {
  constructor() {
    this.height = 0
    this.width = 0
  }

  static parseFromRestApi(jsonObj) {
    const capacity = new Capacity()
    capacity.height = jsonObj.height ? parseInt(jsonObj.height) : 0
    capacity.width = jsonObj.width ? parseInt(jsonObj.width) : 0
    return capacity
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
    location.u = jsonObj.u
    location.height = jsonObj.height ? parseInt(jsonObj.height) : 0
    location.width = jsonObj.width ? parseFloat(jsonObj.width) : 0
    location.rackId = jsonObj.rack_id
    location.chassisId = jsonObj.chassis_id !== 'null' ? jsonObj.chassis_id : ''
    return location
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
  static parseFromRestApi(jsonObj, chassisData) {
    const chassis = new Chassis()
    chassis.id = jsonObj.id
    chassis.name = jsonObj.name
    chassis.machinetype = jsonObj.machine_type
    chassis.location = ChassisLocation.parseFromRestApi({
      u: jsonObj.location_u,
    })
    fillRackDefine(chassis, getRackDefineById('chassis', jsonObj.machine_type, chassisData))
    return chassis
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

  static parseFromRestApi(jsonObj, switchData) {
    const rackswitch = new Switch()
    rackswitch.id = jsonObj.id
    rackswitch.hostname = jsonObj.hostname
    rackswitch.machinetype = jsonObj.machinetype
    rackswitch.status = jsonObj.power_status
    rackswitch.location = NodeLocation.parseFromRestApi(jsonObj.location)
    fillRackDefine(rackswitch, getRackDefineById('switch', jsonObj.machinetype, switchData))
    return rackswitch
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

  static parseFromRestApi(jsonObj, nodeData) {
    const node = new Node()
    node.id = jsonObj.id
    node.hostname = jsonObj.hostname
    node.status = jsonObj.power_status ? 'on' : 'off'
    node.machinetype = jsonObj.machinetype
    node.location = NodeLocation.parseFromRestApi(jsonObj.location)
    node.energy = isNaN(jsonObj.energy) ? 0 : jsonObj.energy
    node.temperature = isNaN(jsonObj.temperature) ? 0 : jsonObj.temperature
    node.network = [jsonObj.eth_in || 0, jsonObj.eth_out || 0, jsonObj.ib_in || 0, jsonObj.ib_out || 0]
    node.load = isNaN(jsonObj.load) ? 0 : jsonObj.load
    node.diskUsed = handleMathOperations(jsonObj.disk_used, jsonObj.disk_total, 2)

    node.memoryUsed = handleMathOperations(jsonObj.memory_used, jsonObj.memory_total, 2)
    node.cpuUsed = isNaN(jsonObj.cpu_util) ? 0 : jsonObj.cpu_util
    node.cpuCoreUsed = jsonObj.cpu_core_used
    node.alert = jsonObj.alarm_level
    fillRackDefine(node, getRackDefineById('node', jsonObj.machinetype, nodeData))
    return node
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

  static parseFromRestApi(jsonObj, Data) {
    const rack = new Rack()
    rack.id = jsonObj.id
    rack.name = jsonObj.name
    rack.nodeCount = jsonObj.node_num
    rack.nodeBusy = jsonObj.node_busy
    rack.nodeFree = jsonObj.node_free
    rack.nodeOff = jsonObj.node_off
    rack.nodeUsed = jsonObj.node_used
    rack.energy = jsonObj.energy
    rack.location = RackLocation.parseFromRestApi(jsonObj.location)
    fillRackDefine(rack, getRackDefineById('rack', 'rack', Data))
    jsonObj.nodes.forEach(node => {
      rack.nodes.push(Node.parseFromRestApi(node, Data))
    })
    if (jsonObj.switches) {
      jsonObj.switches.forEach(item => {
        rack.switches.push(Switch.parseFromRestApi(item, Data))
      })
    }
    if (jsonObj.chassis) {
      jsonObj.chassis.forEach(chassis => {
        rack.chassis.push(Chassis.parseFromRestApi(chassis, Data))
      })
    }
    return rack
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

function getRackDefineById(type, code, Data) {
  if (Data) {
    for (let i = 0; i < Data.length; i++) {
      if (Data[i].type === type && compareRackByCode(Data[i], code)) {
        return Data[i]
      }
    }
    return null
  }
}

function getRackConf() {
  return new Promise((resolve, reject) => {
    Request.get('/static/settings/rack-conf.json').then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
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

function getRackById(name, Data) {
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
              Rack.parseFromRestApi(
                {
                  ...res.body,
                  ...resp[0].body.data[0],
                  ...{ nodes },
                },
                Data,
              ),
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
  getRackConf,
}
