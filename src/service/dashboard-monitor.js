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
import JobService from './job'
// import GPUService from './gpu'
import QueueService from './queue'
import OptlogService from './operation'
import JobTemplateService from './job-template'
import { parseHardwareData } from './dashboard-hardware-monitor'

function getTemplateEnums() {
  return JobTemplateService.getAllJobTemplates()
}

class Cluster {
  constructor() {
    this.name = ''
    this.jobStatus = {}
    this.nodeGroupStatus = {}
    this.nodeStatus = {}
    this.hardware = []
  }

  static parseFromRestApi(jsonObj) {
    const cluster = new Cluster()
    if (jsonObj.name) {
      cluster.name = jsonObj.name
      if (window.gApp.$store.state.auth.featureCodes.includes('monitor.cluster')) {
        cluster.jobStatus = jsonObj.jobs
        cluster.nodeGroupStatus = NodeGroupStatus.parseFromRestApi(jsonObj.nodes)
        const state = jsonObj.nodes.state
        cluster.nodeStatus = {
          on: state.busy.concat(state.idle, state.occupied).reduce(function (a, b) {
            return a + b
          }),
          off: state.off.reduce(function (a, b) {
            return a + b
          }),
        }
      }
    }
    cluster.hardware = parseHardwareData(jsonObj)
    return cluster
  }
}

class Status {
  constructor() {
    this.busy = []
    // this.running = [];
    this.free = []
    this.off = []
  }

  static parseFromRestApi(jsonObj, groups) {
    const status = new Status()
    let running = []
    status.busy = processStatus(jsonObj.busy, groups)
    running = processStatus(jsonObj.occupied, groups)
    status.free = processStatus(jsonObj.idle, groups)
    status.off = processStatus(jsonObj.off, groups)
    for (let i = 0; i < status.busy.length; i++) {
      status.busy[i] = status.busy[i] + running[i]
    }
    return status
  }
}
class NodeGroupStatus {
  constructor() {
    this.status = new Status()
    this.group = []
  }

  static parseFromRestApi(jsonObj) {
    const nodeGroupStatus = new NodeGroupStatus()
    const nodeGroups = ['head', 'login', 'compute', 'io', 'service', 'gpu']
    const groups = {}
    nodeGroups.forEach(item => {
      if (jsonObj.types.includes(item)) {
        groups[item] = jsonObj.types.indexOf(item)
      }
    })

    nodeGroupStatus.status = Status.parseFromRestApi(jsonObj.state, groups)
    nodeGroupStatus.group = jsonObj.types.length > 4 ? nodeGroups.slice(0, 4) : jsonObj.types
    return nodeGroupStatus
  }
}

class JobChart {
  constructor() {
    this.running = 0
    this.waiting = 0
    this.time = new Date()
    this.timezone = 0
  }

  static parseFromRestApi(jsonObj) {
    const jobChart = new JobChart()
    jobChart.running = jsonObj.running
    jobChart.waiting = jsonObj.waiting
    jobChart.time = new Date(jsonObj.time * 1000)
    jobChart.timezone = jsonObj.timezone
    return jobChart
  }
}

class Template {
  constructor() {
    this.type = ''
    this.counts = 0
  }

  static parseFromRestApi(jsonObj) {
    const template = new Template()
    template.type = jsonObj.template_code
    template.counts = jsonObj.count
    return template
  }
}
function processStatus(status, groups) {
  let arr = []
  if (status.length > 4) {
    status.forEach((item, index) => {
      if (index === groups.head) {
        item += status[groups.service]
      } else if (index === groups.compute) {
        item += status[groups.gpu]
      }
      if (index !== groups.service && index !== groups.gpu) {
        arr.push(item)
      }
    })
  } else {
    arr = status
  }
  return arr
}

function getDashboardOverview() {
  return new Promise((resolve, reject) => {
    Request.get('/api/monitor/overview/').then(
      res => {
        resolve(Cluster.parseFromRestApi(res.body))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getDashboardJobList(length, status, role) {
  return JobService.getJoblatest(length, status, role)
}

function getDashboardMessages(...args) {
  return OptlogService.getOptlogLatest(...args)
}

function getJobChartQueue() {
  return QueueService.getAllQueues()
}

function getDashboardJobChart(time, queue, role, iscompleted, numOfPoints = 7) {
  return new Promise((resolve, reject) => {
    const status = !iscompleted ? 'uncompleted' : 'completed'
    const api = role === 'admin' || role === 'operator' ? '' : 'user/'
    Request.get(
      `/api/job/job_history/${api}?duration=${time}&num_of_points=${numOfPoints}&q_name=${queue}&status=${status}`,
    ).then(
      res => {
        const jobChart = []
        res.body.forEach(item => {
          jobChart.push(JobChart.parseFromRestApi(item))
        })
        resolve(jobChart)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getUserLatestTemplate() {
  return new Promise((resolve, reject) => {
    Request.get('/api/template/jobtemplates/recent/').then(
      res => {
        const templates = []
        res.body.forEach(item => {
          templates.push(Template.parseFromRestApi(item))
        })
        resolve(templates.sort(compare('counts')))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}
const compare = function (prop) {
  return function (x, y) {
    let before = x[prop]
    let after = y[prop]
    if (!isNaN(Number(before)) && !isNaN(Number(after))) {
      before = Number(before)
      after = Number(after)
    }
    if (before < after) {
      return 1
    } else if (before > after) {
      return -1
    } else {
      return 0
    }
  }
}

export default {
  getDashboardOverview,
  getJobChartQueue,
  getDashboardJobChart,
  getDashboardJobList,
  getUserLatestTemplate,
  getDashboardMessages,
  getTemplateEnums,
}
