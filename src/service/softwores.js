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
import JobService from './job'

class SoftwareModle {
  constructor() {
    this.name = ''
    this.type = ''
    this.children = []
    this.index = 0
  }

  static parseFromRestApi(jsonObj, index) {
    const softwareModle = new SoftwareModle()
    softwareModle.name = jsonObj.name
    softwareModle.type = jsonObj.type
    softwareModle.index = index
    softwareModle.children = jsonObj.items.map((e, i) => ModulesItem.parseFromRestApi(e, jsonObj.type, index, i))
    return softwareModle
  }
}

class ModulesItem {
  constructor() {
    this.name = ''
    this.version = '-'
    this.location = ''
    this.path = ''
    this.parentType = ''
    this.type = ''
    this.index = ''
  }

  static parseFromRestApi(jsonObj, type, parent, i) {
    const item = new ModulesItem()
    item.name = jsonObj.name
    item.version = jsonObj.version
    item.location = jsonObj.location
    item.path = jsonObj.path
    item.parentType = type
    item.type = jsonObj.type
    item.index = `${type}_${parent}_${i}`
    return item
  }
}

class UsermoduleMonitorJob extends JobService.Job {
  constructor() {
    super()
    this.jobId = 0
    this.softwareName = ''
    this.logPath = ''
    this.isCleared = false
  }

  static parseFromRestApi(jsonObj) {
    const um_obj = new UsermoduleMonitorJob()
    um_obj.id = jsonObj.id
    um_obj.jobId = jsonObj.job_id
    um_obj.schedulerId = jsonObj.scheduler_id
    um_obj.name = jsonObj.job_name
    um_obj.softwareName = jsonObj.software_name
    um_obj.state = jsonObj.state.toLowerCase()
    um_obj.operateStatus = jsonObj.operate_state.toLowerCase()
    um_obj.schedulerStatus = jsonObj.scheduler_state
    um_obj.logPath = jsonObj.standard_output_file
    um_obj.isCleared = jsonObj.is_cleared
    return um_obj
  }

  get statusType() {
    let statusType = 'unknown'
    if (JobService.JobWebStatusEnums.finished.includes(this.status)) statusType = 'finished'
    else if (JobService.JobWebStatusEnums.running.includes(this.status)) statusType = 'running'
    else if (JobService.JobWebStatusEnums.waiting.includes(this.status)) statusType = 'waiting'

    return statusType
  }
}

class FilterResult {
  constructor() {
    this.index = 0
    this.name = ''
    this.version = ''
    this.home = ''
    this.description = ''
    this.path = ''
    this.toolchain = ''
    this.filename = ''
  }

  static parseFromRestApi(jsonObj, index) {
    const filterResult = new FilterResult()
    filterResult.index = jsonObj.index
    filterResult.name = jsonObj.name
    filterResult.version = jsonObj.version
    filterResult.home = jsonObj.homepage
    filterResult.description = jsonObj.description
    filterResult.path = jsonObj.easyconfig_path
    filterResult.toolchain = jsonObj.toolchain
    filterResult.filename = jsonObj.filename
    return filterResult
  }
}

function softwareModulesTableDataParser(res) {
  const softwareModles = res.map((e, i) => SoftwareModle.parseFromRestApi(e, i))

  return {
    data: softwareModles,
  }
}

function getSoftwareModulesTableDataFetcher(type) {
  return TableDataFetcherFactory.createLocalPagingFetcher(
    `/api/usermodule/?type=${type}`,
    softwareModulesTableDataParser,
    'data',
  )
}

function removeModule({ name }) {
  return new Promise((resolve, reject) => {
    Request.delete(`/api/usermodule/?fullname=${name}`).then(
      res => {
        resolve()
      },
      err => {
        if (err.status === 500) {
          reject(window.gApp.$t('Error.16002'))
        } else {
          ErrorHandler.restApiErrorHandler(err, reject)
        }
      },
    )
  })
}

function getBuildingSoftwareByFilter(type, value) {
  return new Promise((resolve, reject) => {
    const req = {
      param: value,
    }
    Request.get(`/api/usermodule/search/${type}/`, { params: req }).then(
      res => {
        resolve(res.body.map((e, i) => FilterResult.parseFromRestApi(e, i)))
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getBuildingSoftwareByPath(path) {
  return new Promise((resolve, reject) => {
    const req = { easyconfig_path: path }
    Request.get('/api/usermodule/easyconfig/content/', { params: req }).then(
      res => {
        resolve(FilterResult.parseFromRestApi(res.data))
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function buildSoftware(data) {
  return new Promise((resolve, reject) => {
    const req = {
      job_queue: data.queue,
      cores_per_node: Number(data.cpu),
      nodes: Number(data.nodes),
      easyconfig_path: data.path,
      template_id: 'easybuild',
      args: data.args,
    }
    Request.post('/api/usermodule/submit/', req).then(
      res => {
        const job = JobService.Job.parseFromRestApi(res.body)
        if (job.status === 'createfailed') {
          reject(job.errmsg)
        } else {
          resolve(job)
        }
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getJobMonitoringData() {
  return new Promise((resolve, reject) => {
    Request.get('/api/usermodule/job/').then(
      res => {
        resolve(res.body.map((e, i) => UsermoduleMonitorJob.parseFromRestApi(e)))
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getSoftwareJobCount() {
  return new Promise((resolve, reject) => {
    Request.get('/api/usermodule/job_count/').then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getViewLog(umId) {
  return new Promise((resolve, reject) => {
    Request.get(`/api/usermodule/job/${umId}/`).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function doCancelJob(umId) {
  return new Promise((resolve, reject) => {
    Request.put(`/api/usermodule/job/${umId}/`).then(
      res => {
        resolve()
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function doClearJob(umId) {
  return new Promise((resolve, reject) => {
    Request.delete(`/api/usermodule/job/${umId}/`).then(
      res => {
        resolve()
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

export default {
  getSoftwareModulesTableDataFetcher,
  removeModule,
  getBuildingSoftwareByFilter,
  getBuildingSoftwareByPath,
  buildSoftware,
  getJobMonitoringData,
  getViewLog,
  getSoftwareJobCount,
  doCancelJob,
  doClearJob,
}
