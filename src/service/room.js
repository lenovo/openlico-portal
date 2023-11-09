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

import Request from '@/request/https'
import ErrorHandler from '@/common/error-handler'

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
    room.roomName = obj.name
    room.roomId = obj.id
    room.location = obj.location
    room.nodeNumber = obj.node_num
    return room
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
    rack.rackName = obj.name
    rack.rackId = obj.id
    rack.location = obj.location
    rack.nodeNumber = obj.node_num
    rack.busyNumber = obj.node_busy
    rack.usedNumber = obj.node_used
    rack.offNumber = obj.node_off
    rack.freeNumber = obj.node_free
    rack.energy = obj.energy
    rack.alarmLevel = obj.alarm_level
    return rack
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
    row.rowName = obj.name
    row.rowId = obj.id
    row.index = obj.index
    row.racks = obj.racks
    row.totalNode = obj.total_nodes
    row.totalRacks = obj.total_racks
    row.totalEnergy = obj.total_energy
    return row
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
