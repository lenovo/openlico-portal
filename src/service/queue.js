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

class Queue {
  constructor() {
    this.index = 0
    this.name = ''
    this.state = ''
    this.totalNodes = ''
    this.totalCores = ''
    this.freeCores = ''
    this.gpuNum = ''
    this.freeGpu = ''
    this.gpuOptions = []
    this.maxGpusPerNode = ''
    this.maxNodes = ''
    this.maxCoresPerNode = ''
    this.defineMemoryPerNode = ''
    this.maxMemoryPerNode = ''
    this.walltime = ''
  }

  static parseFromRestApi(jsonObj) {
    const queue = new Queue()
    queue.index = jsonObj.name
    queue.name = jsonObj.name
    queue.state = jsonObj.state
    queue.walltime = jsonObj.max_time
    queue.totalNodes = getVal(jsonObj.resource_list, 'N')
    queue.maxNodes = getVal(jsonObj.max_resource_list, 'N')
    queue.totalCores = getVal(jsonObj.resource_list, 'C')
    queue.maxCoresPerNode = getVal(jsonObj.per_node_resource_list, 'C')
    const usedCores = getVal(jsonObj.used_resource_list, 'C')
    queue.freeCores = queue.totalCores - usedCores
    queue.defineMemoryPerNode = getVal(jsonObj.per_node_resource_list, 'M')
    queue.maxMemoryPerNode = getVal(jsonObj.per_node_resource_list, 'M')
    const gpuType = jsonObj.resource_list.filter(item => {
      for (const key in item) {
        if (key.startsWith('G/gpu')) {
          return true
        }
      }
      return false
    })[0]
    const gpuOptions = []
    let gpuNum = 0
    let gpuFree = 0
    if (gpuType) {
      for (const key in gpuType) {
        const gpuTypeNum = getVal(jsonObj.resource_list, key)
        const gpuTypeUsed = getVal(jsonObj.used_resource_list, key)
        const gpuTypePerNode = getVal(jsonObj.per_node_resource_list, key)
        gpuNum += gpuTypeNum
        gpuFree += gpuTypeNum - gpuTypeUsed
        gpuOptions.push({
          type: key,
          free: gpuTypeNum - gpuTypeUsed,
          total: gpuTypeNum,
          maxPerNode: gpuTypePerNode,
        })
      }
      queue.gpuNum = gpuNum
      queue.freeGpu = gpuFree
      queue.gpuOptions = gpuOptions

      queue.maxGpusPerNode = getVal(jsonObj.per_node_resource_list, 'G/gpu')
    }
    return queue
  }

  get _index() {
    return this.index
  }

  set _index(index) {
    return (this.index = index)
  }

  get _name() {
    return this.name
  }

  set _name(name) {
    return (this.name = name)
  }

  get _state() {
    return this.state
  }

  set _state(state) {
    return (this.state = state)
  }

  get _totalNodes() {
    return this.totalNodes
  }

  set _totalNodes(totalNodes) {
    return (this.totalNodes = totalNodes)
  }

  get _totalCores() {
    return this.totalCores
  }

  set _totalCores(totalCores) {
    return (this.totalCores = totalCores)
  }

  get _freeCores() {
    return this.freeCores
  }

  set _freeCores(freeCores) {
    return (this.freeCores = freeCores)
  }

  get _gpuNum() {
    return this.gpuNum
  }

  set _gpuNum(gpuNum) {
    return (this.gpuNum = gpuNum)
  }

  get _freeGpu() {
    return this.freeGpu
  }

  set _freeGpu(freeGpu) {
    return (this.freeGpu = freeGpu)
  }

  get _gpuOptions() {
    return this.gpuOptions
  }

  set _gpuOptions(gpuOptions) {
    return (this.gpuOptions = gpuOptions)
  }

  get _maxGpusPerNode() {
    return this.maxGpusPerNode
  }

  set _maxGpusPerNode(maxGpusPerNode) {
    return (this.maxGpusPerNode = maxGpusPerNode)
  }

  get _maxNodes() {
    return this.maxNodes
  }

  set _maxNodes(maxNodes) {
    return (this.maxNodes = maxNodes)
  }

  get _maxCoresPerNode() {
    return this.maxCoresPerNode
  }

  set _maxCoresPerNode(maxCoresPerNode) {
    return (this.maxCoresPerNode = maxCoresPerNode)
  }

  get _defineMemoryPerNode() {
    return this.defineMemoryPerNode
  }

  set _defineMemoryPerNode(defineMemoryPerNode) {
    return (this.defineMemoryPerNode = defineMemoryPerNode)
  }

  get _maxMemoryPerNode() {
    return this.maxMemoryPerNode
  }

  set _maxMemoryPerNode(maxMemoryPerNode) {
    return (this.maxMemoryPerNode = maxMemoryPerNode)
  }

  get _walltime() {
    return this.walltime
  }

  set _walltime(walltime) {
    return (this.walltime = walltime)
  }
}

export function getVal(list, key, defaultValue = 0) {
  const value = list.filter(i => i[key])[0]
  if (value) {
    return isNaN(value[key]) ? value[key] : Number(value[key])
  }
  return defaultValue
}

function getAllQueues() {
  return new Promise((resolve, reject) => {
    let req = ''
    if (['admin', 'operator'].includes(window.gApp.$store.state.auth.access)) {
      req = '?role=admin'
    }
    Request.get(`/api/job/queue/${req}`).then(
      res => {
        const queues = []
        res.body.forEach(obj => {
          queues.push(Queue.parseFromRestApi(obj))
        })
        resolve(queues)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getGpuQueues() {
  const access = window.gApp.$store.state.auth.access
  return new Promise((resolve, reject) => {
    Request.get(`/api/queues/?gres=gpu&is_admin=${access === 'staff'}`).then(
      res => {
        const queues = []
        res.body.forEach(obj => {
          queues.push(Queue.parseFromRestApi(obj))
        })
        resolve(queues)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

export default {
  getAllQueues,
  getGpuQueues,
}
