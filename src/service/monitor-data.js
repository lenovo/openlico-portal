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
import Format from '../common/format'
import Constants from '../common/constants'
import ErrorHandler from '../common/error-handler'
import TableDataFetcherFactory from '../common/table-data-fetcher-factory'

const DataDigitMap = {
  load: 2,
  util: 1,
  cpu: 1,
  ram: 1,
  disk: 1,
  energy: 0,
  temperature: 0,
  network: 1,
  ib: 1,
  job: 0,
}

const VendorMap = {
  NVIDIA: {
    vendor: 'Nvidia',
    type: 'mig',
    prefix: '',
    top: 0,
    lineHeight: 25,
  },
  INTEL: {
    vendor: 'Intel',
    type: 'tile',
    prefix: 'Tile ',
    top: 55,
    lineHeight: 21,
  },
}

class ServiceStatus {
  constructor() {
    this.shedulerStatus = ''
    this.fileSystemStatus = ''
    this.shedulerMessage = ''
    this.fileSystemMessage = ''
  }

  static parseFromRestApi(jsonObj) {
    const serviceStatus = new ServiceStatus()
    serviceStatus._shedulerStatus = jsonObj.scheduler_status.status
    serviceStatus._shedulerMessage = jsonObj.scheduler_status.msg
    serviceStatus._fileSystemStatus = jsonObj.shared_storage_status.status
    serviceStatus._fileSystemMessage = jsonObj.shared_storage_status.msg
    return serviceStatus
  }

  get _shedulerStatus() {
    return this.shedulerStatus
  }

  set _shedulerStatus(shedulerStatus) {
    return (this.shedulerStatus = shedulerStatus)
  }

  get _fileSystemStatus() {
    return this.fileSystemStatus
  }

  set _fileSystemStatus(fileSystemStatus) {
    return (this.fileSystemStatus = fileSystemStatus)
  }

  get _shedulerMessage() {
    return this.shedulerMessage
  }

  set _shedulerMessage(shedulerMessage) {
    return (this.shedulerMessage = shedulerMessage)
  }

  get _fileSystemMessage() {
    return this.fileSystemMessage
  }

  set _fileSystemMessage(fileSystemMessage) {
    return (this.fileSystemMessage = fileSystemMessage)
  }
}

class TimeSeriesItem {
  constructor() {
    this.time = new Date(0)
    this.values = []
  }

  static parseFromRestApi(jsonObj, category) {
    const item = new TimeSeriesItem()
    item._time = new Date(jsonObj.time * 1000)
    if (typeof jsonObj.value === 'string') {
      const valStrs = jsonObj.value.split(',')
      valStrs.forEach(valStr => {
        item._values.push(Format.formatNumber(Number(valStr), DataDigitMap[category]))
      })
    } else if (typeof jsonObj.value === 'number') {
      item._values.push(Format.formatNumber(jsonObj.value, DataDigitMap[category]))
    } else {
      item._values.push('-')
      // console.log('Invalid value type');
    }
    return item
  }

  get _time() {
    return this.time
  }

  set _time(time) {
    return (this.time = time)
  }

  get _values() {
    return this.values
  }

  set _values(values) {
    return (this.values = values)
  }
}

class Heat {
  constructor() {
    this.id = 0
    this.hostname = ''
    this.value = 0
  }

  static parseFromRestApi(obj, category) {
    const heat = new Heat()
    heat._id = obj.id
    heat._hostname = obj.hostname
    heat._value = []
    if (typeof obj.value === 'string') {
      const valStrs = obj.value.split(',')
      valStrs.forEach(valStr => {
        if (isNaN(valStr) || valStr === '') {
          // filter none and ""
          heat._value.push('-')
        } else {
          heat._value.push(Format.formatNumber(Number(valStr), DataDigitMap[category]))
        }
      })
    } else if (typeof obj.value === 'number') {
      heat._value.push(Format.formatNumber(obj.value, DataDigitMap[category]))
    } else {
      heat._value.push('-')
    }
    return heat
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

  get _value() {
    return this.value
  }

  set _value(value) {
    return (this.value = value)
  }
}

class NodeGpuHeat {
  constructor() {
    this.hostname = ''
    this.values = []
    this.used = []
    this.types = []
    this.vendors = []
    this.devList = []
  }

  static parseFromRestApi(jsonObj) {
    const heat = new NodeGpuHeat()
    heat.hostname = jsonObj.hostname
    const values = []
    const used = []
    const gpuIndex = []
    const types = []
    const vendors = []
    const devList = []
    for (let i = 0; i < jsonObj.value.length; i++) {
      if (jsonObj.value[i] !== null) {
        values.push(jsonObj.value[i])
        used.push(jsonObj.used[i])
        gpuIndex.push(i)
        types.push(jsonObj.product[i])
        vendors.push(jsonObj.vendor[i])
        devList.push(
          jsonObj.logical_dev_info[i].map((dev, index) => ({
            type: `${VendorMap[jsonObj.vendor[i]].prefix}#${index} ${dev[0]}`,
            used: dev[1],
            uti: dev[2],
            mem: dev[3],
            temp: dev[4],
          })),
        )
      }
    }
    heat._values = values
    heat._used = used
    heat._gpuIndex = gpuIndex
    heat._types = types
    heat._vonders = vendors
    heat._devList = devList

    return heat
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

  get _values() {
    return this.values
  }

  set _values(values) {
    return (this.values = values)
  }

  get _used() {
    return this.used
  }

  set _used(used) {
    return (this.used = used)
  }

  get _gpuIndex() {
    return this.gpuIndex
  }

  set _gpuIndex(gpuIndex) {
    return (this.gpuIndex = gpuIndex)
  }

  get _types() {
    return this.types
  }

  set _types(types) {
    return (this.types = types)
  }

  get _vonders() {
    return this.vendors
  }

  set _vonders(vendors) {
    return (this.vendors = vendors)
  }

  get _devList() {
    return this.devList
  }

  set _devList(devList) {
    return (this.devList = devList)
  }
}
class NodeCpuHeat {
  constructor() {
    this.name = ''
    this.values = []
  }

  static parseFromRestApi(jsonObj) {
    const heat = new NodeCpuHeat()
    heat._name = jsonObj.hostname
    heat._values = jsonObj.value
    return heat
  }

  get _name() {
    return this.name
  }

  set _name(name) {
    return (this.name = name)
  }

  get _values() {
    return this.values
  }

  set _values(values) {
    return (this.values = values)
  }
}

class NodeHealthDetail {
  constructor() {
    this.id = ''
    this.name = ''
    this.health = ''
    this.states = ''
  }

  static parseFromRestApi(jsonObj) {
    const healthDetail = new NodeHealthDetail()
    healthDetail._id = jsonObj.id
    healthDetail._name = jsonObj.name
    healthDetail._health =
      jsonObj.health && Constants.NodeHealthState.includes(jsonObj.health) ? jsonObj.health : 'unknown'
    healthDetail._states = jsonObj.states
    return healthDetail
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

  get _health() {
    return this.health
  }

  set _health(health) {
    return (this.health = health)
  }

  get _states() {
    return this.states
  }

  set _states(states) {
    return (this.states = states)
  }
}

function getRestApiCategory(category) {
  if (category === 'cpu') {
    return 'cpu'
  }
  if (category === 'ram') {
    return 'memory'
  }
  if (category === 'disk') {
    return 'disk'
  }
  if (category === 'network') {
    return 'network'
  }
  if (category === 'ib') {
    return 'ib'
  }
  if (category === 'temperature') {
    return 'temperature'
  }
  if (category === 'load') {
    return 'load'
  }
  if (category === 'energy') {
    return 'energy'
  }
  if (category === 'job') {
    return 'job'
  }
  if (category === 'util') {
    return 'util'
  }
}

function makeTimeSeries(current, currentTime, history, category) {
  const series = []
  history.forEach(item => {
    series.push(TimeSeriesItem.parseFromRestApi(item, category))
  })
  if (current !== null && currentTime && history.length && currentTime > history[history.length - 1].time) {
    const currentItem = {
      value: current,
      time: currentTime,
    }
    series.push(TimeSeriesItem.parseFromRestApi(currentItem, category))
  }
  return series
}

function getLatestData(sourceType, sourceId, category, timeUnit, timeCount, startTime) {
  return new Promise((resolve, reject) => {
    const req = {}
    let url = ''
    const temp = sourceId.split(':')

    if (startTime) {
      req.starttime = Date.parse(startTime) / 1000
    }

    if (sourceType === 'nodegpus') {
      const nodeId = temp[0]
      const gpuIndex = temp[1].substring(3, temp[1].length)
      const [index, devId] = gpuIndex.split(',')
      if (devId !== undefined) {
        req.dev_id = devId
      }
      url = '/api/monitor/node/' + nodeId + '/gpu/' + index
    } else if (sourceType === 'podcpus') {
      const podName = temp[1]
      url = '/api/monitor/node/' + podName + '/cpu'
    } else {
      url = '/api/monitor/' + sourceType + '/' + sourceId
    }

    url = url + '/tendency/'
    if (timeUnit) {
      url = url + timeUnit + '/' + getRestApiCategory(category) + '/'
    } else {
      url = url + getRestApiCategory(category) + '/'
    }
    Request.get(url, { params: req }).then(
      res => {
        if (res.body.history) {
          const timeSeries = makeTimeSeries(res.body.current, res.body.current_time, res.body.history, category)

          resolve({
            id: sourceId,
            data: timeSeries,
            current: res.body.current,
          })
        }
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getGroupHeatData(name, dataCategory) {
  const _url = `/api/monitor/nodegroup/${name}/heat/latest/${getRestApiCategory(dataCategory)}/`
  return new Promise((resolve, reject) => {
    const req = ''
    Request.get(_url, req).then(
      res => {
        const heats = []
        res.body.heat.forEach(item => {
          heats.push(Heat.parseFromRestApi(item, dataCategory))
        })
        resolve({
          data: heats,
        })
      },
      res => {
        reject(res)
      },
    )
  })
}

function getNodeDataByHour(nodeId, category, latestHours) {
  return getLatestData('node', nodeId, category, 'hour', latestHours)
}

function getNodeDataByDay(nodeId, category, latestDays) {
  return getLatestData('node', nodeId, category, 'day', latestDays)
}

function getNodeDataByWeek(nodeId, category, latestWeeks) {
  return getLatestData('node', nodeId, category, 'week', latestWeeks)
}

function getNodeDataByMonth(nodeId, category, latestMonths) {
  return getLatestData('node', nodeId, category, 'month', latestMonths)
}

function getNodeGroupDataByHour(nodeGroupId, category, latestHours, startTime) {
  return getLatestData('nodegroup', nodeGroupId, category, 'hour', latestHours, startTime)
}

function getNodeGroupDataByDay(nodeGroupId, category, latestDays, startTime) {
  return getLatestData('nodegroup', nodeGroupId, category, 'day', latestDays, startTime)
}

function getNodeGroupDataByWeek(nodeGroupId, category, latestWeeks, startTime) {
  return getLatestData('nodegroup', nodeGroupId, category, 'week', latestWeeks, startTime)
}

function getNodeGroupDataByMonth(nodeGroupId, category, latestMonths, startTime) {
  return getLatestData('nodegroup', nodeGroupId, category, 'month', latestMonths, startTime)
}

function getNodeGpuDataByHour(nodeId, gpuIndex, category, latestHours) {
  return getLatestData('nodegpus', nodeId + ':gpu' + gpuIndex, category, 'hour', latestHours)
}

function getNodeGpuDataByDay(nodeId, gpuIndex, category, latestDays) {
  return getLatestData('nodegpus', nodeId + ':gpu' + gpuIndex, category, 'day', latestDays)
}

function getNodeGpuDataByWeek(nodeId, gpuIndex, category, latestWeeks) {
  return getLatestData('nodegpus', nodeId + ':gpu' + gpuIndex, category, 'week', latestWeeks)
}

function getNodeGpuDataByMonth(nodeId, gpuIndex, category, latestMonths) {
  return getLatestData('nodegpus', nodeId + ':gpu' + gpuIndex, category, 'month', latestMonths)
}

function getCpuDataByPod(jobId, podName, category) {
  return getLatestData('podcpus', jobId + ':' + podName, category, 'hour')
}

function getNodesByGroup(groupname, offset) {
  return new Promise((resolve, reject) => {
    const params = {
      args: {
        offset: offset.pageSize * (offset.currentPage - 1),
        length: offset.pageSize,
        filters: [{ prop: 'groups__name', type: 'in', values: [groupname] }],
        sort: { prop: 'hostname', order: 'ascend' },
      },
    }
    Request.get('/api/cluster/node/', { params }).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getNodeGpuDataByhostnames(hostnames, category, offset) {
  return new Promise((resolve, reject) => {
    const api = `/api/monitor/gpu/heat/latest/${category}/`
    const req = {
      offset: offset.pageSize,
      currentPage: offset.currentPage,
      hostnames,
    }
    Request.post(api, req).then(
      res => {
        const gpus = []
        res.body.nodes.forEach(nodeGpus => {
          gpus.push(NodeGpuHeat.parseFromRestApi(nodeGpus))
        })
        resolve({
          pageSize: res.body.offset,
          currentPage: res.body.currentPage,
          total: res.body.total,
          gpuData: gpus,
        })
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getHostnamesFromExecHosts(exechosts) {
  return exechosts
    .split('+')
    .map(i => {
      return i.split('*')[0].split(',')
    })
    .reduce((a, b) => a.concat(b))
}

function getNodeGpuDataByJob(jobId, gpuExecHosts, category, offset) {
  return new Promise((resolve, reject) => {
    const api = `/api/monitor/gpu/heat/latest/${category}/`
    const req = {
      offset: offset.pageSize,
      currentPage: offset.currentPage,
      hostnames: getHostnamesFromExecHosts(gpuExecHosts),
    }
    Request.post(api, req).then(
      res => {
        const gpus = []
        res.body.nodes.forEach(nodeGpus => {
          gpus.push(NodeGpuHeat.parseFromRestApi(nodeGpus))
        })
        resolve({
          pageSize: res.body.offset,
          currentPage: res.body.currentPage,
          total: res.body.total,
          gpuData: gpus,
        })
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function execHostsDecode(exechosts) {
  return exechosts
    .split('+')
    .map(i => {
      const temp = i.split('*')
      return temp[0].split(',').map(pod => {
        return {
          pod,
          RC: temp[1],
        }
      })
    })
    .reduce((a, b) => a.concat(b))
}

function getCpuDataByJob(cpuExecHosts, category, offset) {
  return new Promise((resolve, reject) => {
    const req = {
      offset: offset.pageSize,
      currentPage: offset.currentPage,
      hostnames: getHostnamesFromExecHosts(cpuExecHosts),
    }
    const exechosts = execHostsDecode(cpuExecHosts)
    Request.post(`/api/monitor/cpu/heat/latest/${category}/`, req).then(
      res => {
        const cpus = []
        res.body.nodes.forEach(nodeCpus => {
          const pod = exechosts.filter(i => i.pod === nodeCpus.hostname)[0]
          const value = nodeCpus.value.map(i => (i / pod.RC / 1000).toFixed(1))
          cpus.push(NodeCpuHeat.parseFromRestApi({ ...nodeCpus, ...{ value } }))
        })
        resolve({
          pageSize: res.body.offset,
          currentPage: res.body.currentPage,
          total: res.body.total,
          cpuData: cpus,
        })
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getUsingGPUByJob(id) {
  return new Promise((resolve, reject) => {
    Request.get(`api/monitor/gpu/job/${id}/`).then(
      res => {
        resolve(res.data)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getClusterStatus() {
  return new Promise((resolve, reject) => {
    const sService = Request.get('/api/job/scheduler/status/')
    const fService = Request.get('/api/monitor/filemanager/status/')
    Promise.all([sService, fService]).then(
      res => {
        resolve(
          ServiceStatus.parseFromRestApi({
            scheduler_status: res[0].body,
            shared_storage_status: res[1].body,
          }),
        )
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getNodeHealthTableDataFetcher(name) {
  return TableDataFetcherFactory.createLocalPagingFetcher(
    `/api/monitor/node/health/detail/?args={"nodes":["${name}"]}`,
    nodesHealthDetailTableDataParser,
    'data',
  )
}

function nodesHealthDetailTableDataParser(res) {
  let healthDetail = []
  if (res.data[0]) {
    healthDetail = res.data[0].hardware_health.map(i => NodeHealthDetail.parseFromRestApi(i))
  }
  return {
    data: healthDetail,
  }
}

export default {
  VendorMap,
  getClusterStatus,
  getGroupHeatData,
  getNodeDataByHour,
  getNodeDataByDay,
  getNodeDataByWeek,
  getNodeDataByMonth,
  getNodeGroupDataByHour,
  getNodeGroupDataByDay,
  getNodeGroupDataByWeek,
  getNodeGroupDataByMonth,
  getNodesByGroup,
  getNodeGpuDataByJob,
  getUsingGPUByJob,
  getNodeGpuDataByHour,
  getNodeGpuDataByDay,
  getNodeGpuDataByWeek,
  getNodeGpuDataByMonth,
  getCpuDataByJob,
  getNodeHealthTableDataFetcher,
  getCpuDataByPod,
  getNodeGpuDataByhostnames,
  execHostsDecode,
}
