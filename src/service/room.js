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

class Room {
  constructor() {
    this.roomName = ''
    this.roomId = 0
    this.location = ''
    this.nodeNumber = 0
    this.powerConsumption = ''
    this.busyNumber = 0
    this.usedNumber = 0
    this.offNumber = 0
    this.freeNumber = 0
  }

  static parseFromRestApi(obj) {
    const room = new Room()
    room._roomName = obj.name
    room._roomId = obj.id
    room._location = obj.location
    room._nodeNumber = obj.node_num
    // room._powerConsumption = obj.power_consumption;
    // room._busyNumber = obj.node_busy;
    // room._usedNumber = obj.node_used;
    // room._offNumber = obj.node_off;
    // room._freeNumber = obj.node_free;

    return room
  }

  get _roomName() {
    return this.roomName
  }

  set _roomName(roomName) {
    return (this.roomName = roomName)
  }

  get _roomId() {
    return this.roomId
  }

  set _roomId(roomId) {
    return (this.roomId = roomId)
  }

  get _location() {
    return this.location
  }

  set _location(location) {
    return (this.location = location)
  }

  get _nodeNumber() {
    return this.nodeNumber
  }

  set _nodeNumber(nodeNumber) {
    return (this.nodeNumber = nodeNumber)
  }

  get _powerConsumption() {
    return this.powerConsumption
  }

  set _powerConsumption(powerConsumption) {
    return (this.powerConsumption = powerConsumption)
  }

  get _busyNumber() {
    return this.busyNumber
  }

  set _busyNumber(busyNumber) {
    return (this.busyNumber = busyNumber)
  }

  get _usedNumber() {
    return this.usedNumber
  }

  set _usedNumber(usedNumber) {
    return (this.usedNumber = usedNumber)
  }

  get _offNumber() {
    return this.offNumber
  }

  set _offNumber(offNumber) {
    return (this.offNumber = offNumber)
  }

  get _freeNumber() {
    return this.freeNumber
  }

  set _freeNumber(freeNumber) {
    return (this.freeNumber = freeNumber)
  }
}

class Rack {
  constructor() {
    this.rackName = ''
    this.rackId = 0
    this.location = ''
    this.nodeNumber = 0
    this.busyNumber = 0
    this.usedNumber = 0
    this.offNumber = 0
    this.freeNumber = 0
    this.energy = 0
    this.alarmLevel = []
  }

  static parseFromRestApi(obj) {
    const rack = new Rack()
    rack._rackName = obj.name
    rack._rackId = obj.id
    rack._location = obj.location
    rack._nodeNumber = obj.node_num
    rack._busyNumber = obj.node_busy
    rack._usedNumber = obj.node_used
    rack._offNumber = obj.node_off
    rack._freeNumber = obj.node_free
    rack._energy = obj.energy
    rack._alarmLevel = obj.alarm_level
    return rack
  }

  get _rackName() {
    return this.rackName
  }

  set _rackName(rackName) {
    return (this.rackName = rackName)
  }

  get _rackId() {
    return this.rackId
  }

  set _rackId(rackId) {
    return (this.rackId = rackId)
  }

  get _location() {
    return this.location
  }

  set _location(location) {
    return (this.location = location)
  }

  get _nodeNumber() {
    return this.nodeNumber
  }

  set _nodeNumber(nodeNumber) {
    return (this.nodeNumber = nodeNumber)
  }

  get _busyNumber() {
    return this.busyNumber
  }

  set _busyNumber(busyNumber) {
    return (this.busyNumber = busyNumber)
  }

  get _usedNumber() {
    return this.usedNumber
  }

  set _usedNumber(usedNumber) {
    return (this.usedNumber = usedNumber)
  }

  get _offNumber() {
    return this.offNumber
  }

  set _offNumber(offNumber) {
    return (this.offNumber = offNumber)
  }

  get _freeNumber() {
    return this.freeNumber
  }

  set _freeNumber(freeNumber) {
    return (this.freeNumber = freeNumber)
  }

  get _energy() {
    return this.energy
  }

  set _energy(energy) {
    return (this.energy = energy)
  }

  get _alarmLevel() {
    return this.alarmLevel
  }

  set _alarmLevel(alarmLevel) {
    return (this.alarmLevel = alarmLevel)
  }
}

class Row {
  constructor() {
    this.rowName = ''
    this.rowId = 0
    this.index = 0
    this.racks = []
    this.totalNode = 0
    this.totalRacks = 0
    this.totalEnergy = 0
  }

  static parseFromRestApi(obj) {
    const row = new Row()
    row._rowName = obj.name
    row._rowId = obj.id
    row._index = obj.index
    row._racks = obj.racks
    row._totalNode = obj.total_nodes
    row._totalRacks = obj.total_racks
    row._totalEnergy = obj.total_energy
    return row
  }

  get _rowName() {
    return this.rowName
  }

  set _rowName(rowName) {
    return (this.rowName = rowName)
  }

  get _rowId() {
    return this.rowId
  }

  set _rowId(rowId) {
    return (this.rowId = rowId)
  }

  get _index() {
    return this.index
  }

  set _index(index) {
    return (this.index = index)
  }

  get _racks() {
    return this.racks
  }

  set _racks(racks) {
    return (this.racks = racks)
  }

  get _totalNode() {
    return this.totalNode
  }

  set _totalNode(totalNode) {
    return (this.totalNode = totalNode)
  }

  get _totalRacks() {
    return this.totalRacks
  }

  set _totalRacks(totalRacks) {
    return (this.totalRacks = totalRacks)
  }

  get _totalEnergy() {
    return this.totalEnergy
  }

  set _totalEnergy(totalEnergy) {
    return (this.totalEnergy = totalEnergy)
  }
}

function getAllRooms() {
  const req = ''
  return new Promise((resolve, reject) => {
    Request.get('/api/cluster/room/', req).then(
      res => {
        resolve({
          data: res.body.rooms.filter(i => !i.on_cloud).map(i => Room.parseFromRestApi(i)),
        })
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getAllRowListItems() {
  return new Promise((resolve, reject) => {
    Request.get('/api/cluster/row/').then(
      res => {
        const rowNames = res.body.rows.filter(i => !i.on_cloud).map(i => i.name)
        const rowInfo = getRowInfoByNames(rowNames)
        const rowMonitor = getRowItemByNames(rowNames)
        Promise.all([rowInfo, rowMonitor]).then(
          resp => {
            const rows = resp[0].map(i => {
              const row = resp[1].filter(r => i.name === r.name)[0]
              return Row.parseFromRestApi({ ...i, ...row })
            })
            resolve(rows)
          },
          err => {
            reject(err)
          },
        )
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getRowItemByNames(names) {
  return new Promise((resolve, reject) => {
    const args = JSON.stringify({ row: names })
    Request.get('/api/monitor/row/', { params: { args } }).then(
      res => {
        resolve(res.body.data)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}
function getRowInfoByNames(names) {
  return new Promise((resolve, reject) => {
    const api = names.map(i => {
      return Request.get(`/api/cluster/row/${i}/`)
    })
    Promise.all(api).then(
      res => {
        const data = res.map(i => i.body)
        resolve(data)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getRackMonitorByNames(row) {
  return new Promise((resolve, reject) => {
    const names = row.racks.map(i => i.name)
    // var params = {
    //     args: JSON.stringify({ rack: names }),
    // };
    Request.post('/api/monitor/rack/', { rack: names }).then(
      res => {
        const racks = row.racks.map(i => {
          const result = res.body.data.filter(r => r.name === i.name)[0]
          return Rack.parseFromRestApi({ ...i, ...result })
        })
        resolve(racks)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

export default {
  getAllRooms,
  getRackMonitorByNames,
  getAllRowListItems,
  getRowItemByNames,
}
