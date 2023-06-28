/*
 * Copyright 2015-2023 Lenovo
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
import { Base64 } from 'js-base64'
import Format from '../common/format'
import Parser from '../common/parser'
import Collection from '../common/collection'
import ErrorHandler from '../common/error-handler'
import TableDataFetcherFactory from '../common/table-data-fetcher-factory'
import AccessService from './access'
import JobTemplateService from './job-template'

const JobStatusEnums = [
  'completed',
  'queueing',
  'creating',
  'running',
  'suspending',
  'waiting',
  'holding',
  'error',
  'cancelled',
  'createfailed',
  'cancelling',
]
const JobWebStatusEnums = {
  running: ['running'],
  waiting: ['queueing', 'suspending', 'waiting', 'holding'],
  finished: ['completed', 'error', 'cancelled', 'createfailed'],
}
const JobWebStateEnums = {
  running: ['R'],
  waiting: ['Q', 'S', 'H'],
  finished: ['C'],
}

// Remove hold/release/pause/resume actions
// const JobActionEnums = ['browse', 'cancel', 'rerun', 'copy', 'delete', 'hold', 'release', 'pause', 'resume'];
const JobActionEnums = ['browse', 'cancel', 'rerun', 'copy', 'delete', 'errmsg']
// format backend return data
const JobStateMapping = {
  c: 'completed',
  q: 'queueing',
  r: 'running',
  h: 'holding',
  s: 'suspending',
  un: 'unknown',
}

// format backend return data
// Not using created
const JobOperateStatusMapping = {
  creating: 'creating',
  create_fail: 'createfailed',
  cancelling: 'cancelling',
  cancelled: 'cancelled',
}

class Job {
  constructor() {
    this.id = 0
    this.schedulerId = ''
    this.name = ''
    this.queue = ''
    this.submitTime = new Date(0)
    this.beginTime = new Date(0)
    this.finishTime = new Date(0)
    this.submitUser = ''
    this.jobFilename = ''
    this.workingDirectory = ''
    this.workspace = ''
    this.state = ''
    this.operateStatus = ''
    this.outputFilename = ''
    this.rawInfo = ''
    this.errmsg = ''
    this.createTime = new Date(0)
    this.updateTime = new Date(0)
    this.jobRunning = null
    this.jobCSres = []
    this.type = ''
    this.numberOfCpuCores = 0
    this.numberOfNodes = 0
    this.execHosts = ''
    this.execHostsDisplay = ''
    this.aiOperateStatus = ''
    this.req = null
    this.numberOfGpus = 0
    this.gpuExecHosts = ''
    this.gpuExecHostsDisplay = ''
    this.realType = ''
    this.tags = []
    this.comment = ''
    this.pass = ''
    this.vnc = ''
  }

  static parseFromRestApi(jsonObj) {
    const job = new Job()
    job.id = jsonObj.id
    job.schedulerId = jsonObj.scheduler_id
    job.jobRunning = jsonObj.job_running
    job.jobCSres = jsonObj.job_csres
    job.submitUser = jsonObj.submitter
    job.name = jsonObj.job_name
    job.queue = jsonObj.queue
    job.submitTime = Parser.parseTimeFromRestApi(jsonObj.submit_time)
    job.beginTime = Parser.parseTimeFromRestApi(jsonObj.start_time)
    job.finishTime = Parser.parseTimeFromRestApi(jsonObj.end_time)
    job.comment = jsonObj.user_comment
    job.pass = jsonObj.password
    job.vnc = jsonObj.entrance_uri
    const tags = []
    for (let i = 0; i < jsonObj.tags.length; i++) {
      tags.push(Tag.parseFromRestApi(jsonObj.tags[i]))
    }
    job.tags = tags
    if (jsonObj.state) {
      job.state = jsonObj.state.toLowerCase()
    }
    if (jsonObj.operate_state) {
      job.operateStatus = jsonObj.operate_state.toLowerCase()
    }
    job.workingDirectory = Format.formatMyFolder(jsonObj.workspace)
    job.workspace = jsonObj.workspace
    job.jobFilename = Format.formatMyFolder(jsonObj.job_file)
    if (jsonObj.standard_output_file) {
      job.outputFilename = Format.formatMyFolder(jsonObj.standard_output_file)
    }
    if (jsonObj.reason) {
      job.errmsg = jsonObj.reason
    }
    if (jsonObj.runtime) {
      job.wallDuration = jsonObj.runtime
    }
    initJobResFields(job, jsonObj)
    // initTemplateJobFields(job)
    return job
  }

  // Computed property
  get waitDuration() {
    if (JobWebStatusEnums.waiting.indexOf(this.status) >= 0 || this.status === 'cancelling') {
      return Math.round((new Date() - this.submitTime) / 1000)
    } else {
      return Math.round((this.beginTime - this.submitTime) / 1000)
    }
  }

  get runDuration() {
    if (JobWebStatusEnums.waiting.indexOf(this.status) >= 0) {
      return 0
    } else if (JobWebStatusEnums.running.indexOf(this.status) >= 0 || this.status === 'cancelling') {
      if (this.beginTime) {
        return Math.round((new Date() - this.beginTime) / 1000)
      } else {
        return 0
      }
    } else {
      if (this.finishTime && this.beginTime) {
        return Math.round((this.finishTime - this.beginTime) / 1000)
      } else {
        return 0
      }
    }
  }

  get status() {
    let status = 'unknown'
    if (this.state && this.state in JobStateMapping) {
      status = JobStateMapping[this.state]
    }
    if (
      this.operateStatus &&
      this.operateStatus in JobOperateStatusMapping &&
      (!JobWebStatusEnums.finished.includes(status) ||
        JobWebStatusEnums.finished.includes(JobOperateStatusMapping[this.operateStatus]))
    ) {
      status = JobOperateStatusMapping[this.operateStatus]
    }
    return status
  }
  // Getter and Setter
}

class RunningJob {
  constructor() {
    this.id = 0
    this.schedulerId = ''
    this.submitUser = ''
    this.name = ''
    this.queue = ''
    this.beginTime = new Date(0)
    this.usedCores = 0
    this.usedGpus = 0
  }

  static parseFromRestApi(jsonObj) {
    const job = new RunningJob()
    job.id = jsonObj.id
    job.schedulerId = jsonObj.jobid
    job.submitUser = jsonObj.submitter
    job.name = jsonObj.jobname
    job.queue = jsonObj.queue
    job.beginTime = Parser.parseTimeFromRestApi(jsonObj.starttime)
    job.usedCores = jsonObj.core_num_on_node
    if (jsonObj.gpu_num_on_node) {
      job.usedGpus = jsonObj.gpu_num_on_node
    }
    return job
  }

  get id() {
    return this._id
  }

  set id(id) {
    this._id = id
  }

  get schedulerId() {
    return this._schedulerId
  }

  set schedulerId(schedulerId) {
    this._schedulerId = schedulerId
  }

  get submitUser() {
    return this._submitUser
  }

  set submitUser(submitUser) {
    this._submitUser = submitUser
  }

  get name() {
    return this._name
  }

  set name(name) {
    this._name = name
  }

  get queue() {
    return this._queue
  }

  set queue(queue) {
    this._queue = queue
  }

  get beginTime() {
    return this._beginTime
  }

  set beginTime(beginTime) {
    this._beginTime = beginTime
  }

  get usedCores() {
    return this._usedCores
  }

  set usedCores(usedCores) {
    this._usedCores = usedCores
  }

  get usedGpus() {
    return this._usedGpus
  }

  set usedGpus(usedGpus) {
    this._usedGpus = usedGpus
  }
}

class Tag {
  constructor() {
    this.id = 0
    this.name = ''
    this.count = 0
    this.username = ''
    this.createTime = ''
    this.updateTime = ''
  }

  static parseFromRestApi(jsonObj) {
    const tag = new Tag()
    tag._id = jsonObj.id
    tag._name = jsonObj.name
    tag._count = jsonObj.count
    tag._username = jsonObj.username
    tag._createTime = Parser.parseTimeFromRestApi(jsonObj.create_time)
    tag._updateTime = Parser.parseTimeFromRestApi(jsonObj.update_time)
    return tag
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

  get _count() {
    return this.count
  }

  set _count(count) {
    return (this.count = count)
  }

  get _username() {
    return this.username
  }

  set _username(username) {
    return (this.username = username)
  }

  get _createTime() {
    return this.createTime
  }

  set _createTime(createTime) {
    return (this.createTime = createTime)
  }

  get _updateTime() {
    return this.updateTime
  }

  set _updateTime(updateTime) {
    return (this.updateTime = updateTime)
  }
}

function jobTableDataParser(res) {
  const jobs = []
  res.data.forEach(item => {
    jobs.push(Job.parseFromRestApi(item))
  })
  return {
    offset: res.offset,
    total: res.total,
    data: jobs,
  }
}

function jobsRestApiPropMap(prop) {
  if (prop === 'schedulerId') {
    return 'scheduler_id'
  }
  if (prop === 'submitUser') {
    return 'submitter'
  }
  if (prop === 'name') {
    return 'job_name'
  }
  if (prop === 'submitTime') {
    return 'submit_time'
  }
  if (prop === 'beginTime') {
    return 'start_time'
  }
  if (prop === 'finishTime') {
    return 'end_time'
  }
  if (prop === 'workingDirectory') {
    return 'workspace'
  }
  if (prop === 'jobFilename') {
    return 'job_file'
  }
  return prop
}

function getJobTableDataFetcher(access) {
  let api = '/api/job/'
  if (access === 'admin' || access === 'operator') {
    api = '/api/job/?role=admin'
  }
  return TableDataFetcherFactory.createRemotePagingFetcher(
    api,
    jobsRestApiPropMap,
    jobTableDataParser,
    'data',
    'offset',
    'total',
  )
}

function getJobById(id, templateSync = true) {
  return new Promise((resolve, reject) => {
    Request.get(`/api/job/${id}/`).then(
      res => {
        const job = Job.parseFromRestApi(res.body)
        if (!job.id) {
          job.id = id
        }
        if (templateSync) {
          initTemplateJobFields(job).finally(() => {
            resolve(job)
          })
        } else {
          resolve(job)
        }
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function runningJobsTableDataParser(res) {
  const jobs = []
  res.forEach(item => {
    jobs.push(RunningJob.parseFromRestApi(item))
  })
  return {
    data: jobs,
  }
}

function getRunningJobsTableDataFetcher(nodename) {
  const api = `/api/job/nodes/${nodename}/runningjobs/`
  return TableDataFetcherFactory.createLocalPagingFetcher(api, runningJobsTableDataParser, 'data')
}

function getJobLog(file, offset, lines) {
  const url = '/api/job/log/'
  const req = {
    file_path: file,
    line_num: offset,
  }
  if (lines !== undefined) {
    req.lines = lines
  }
  return new Promise((resolve, reject) => {
    Request.get(url, { params: req }).then(
      res => {
        const data = Base64.decode(res.body.data.log)
        let lines = []
        if (data.length > 0) lines = data.split('\n')
        const result = {
          lines,
          offset: res.body.data.line_num,
        }
        resolve(result)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function cancelJob(id) {
  return new Promise((resolve, reject) => {
    const req = {
      action: 'cancel',
    }
    Request.put('/api/job/' + id + '/', req).then(
      res => {
        resolve(res.body)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function batchCancelJob(jobsId) {
  const jobs = []
  jobsId.forEach(val => {
    jobs.push(cancelJob(val))
  })
  return new Promise((resolve, reject) => {
    Promise.all(jobs).then(
      res => {
        resolve(res)
      },
      err => {
        // ErrorHandler.restApiErrorHandler(err, reject);
        reject(err)
      },
    )
  })
}

function deleteJob(id) {
  return new Promise((resolve, reject) => {
    Request.delete(`/api/job/${id}/`).then(
      res => {
        resolve(res.body)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function rerunJob(id) {
  return new Promise((resolve, reject) => {
    Request.post(`/api/template/rerunjob/${id}/`).then(
      res => {
        setTimeout(function () {
          waitForJobCreated(res.body.id, resolve, reject, 10)
        }, 2000)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function parseJobReq(req, params) {
  for (const key in req) {
    if (['action', 'type', 'jobname', 'hooks'].indexOf(key) < 0) {
      params[key] = req[key]
    }
  }

  // handler for hooks
  if (Object.prototype.hasOwnProperty.call(req, 'hooks') && req.hooks.length > 0) {
    params.parameters.job_notify = req.hooks[0].notice !== 'rest' ? req.hooks[0].notice : ''
  }
}

function buildJobReq(type, params, req, webhook) {
  const notCopyKeys = [
    'job_name',
    'job_queue',
    'job_workspace',
    'job_queue',
    'nodes',
    'cores_per_node',
    'gui_mode',
    'runtime_id',
    'job_notify',
  ]
  for (const key in params) {
    if (notCopyKeys.indexOf(key) < 0 && Object.prototype.hasOwnProperty.call(params, key)) {
      req[key] = params[key]
    }
  }
  req.job_name = params.job_name
  req.job_workspace = params.job_workspace
  if (Object.prototype.hasOwnProperty.call(params, 'job_queue') && params.queue !== '') {
    req.job_queue = params.job_queue
  } else {
    req.job_queue = 'compute'
  }
  if (Object.prototype.hasOwnProperty.call(params, 'nodes')) {
    req.nodes = params.nodes
  } else {
    req.nodes = 1
  }
  if (Object.prototype.hasOwnProperty.call(params, 'cores_per_node')) {
    req.cores_per_node = params.cores_per_node
  }
  if (Object.prototype.hasOwnProperty.call(params, 'runtime_id')) {
    req.runtime_id = params.runtime_id
  }
  if ((type === 'ansys' || type === 'comsol') && Object.prototype.hasOwnProperty.call(params, 'gui_mode')) {
    if (params.gui_mode) {
      req.gui_mode = true
    } else {
      req.gui_mode = false
    }
  }
  if (Object.prototype.hasOwnProperty.call(params, 'job_notify')) {
    if (params.job_notify && params.job_notify !== '') {
      const notice = {}
      notice.notice = params.job_notify
      webhook.push(notice)
    }
  }
}

function createJobEx(jobTemplate, params, paramTypes) {
  return new Promise((resolve, reject) => {
    const req = {}
    const webhook = []
    buildJobReq(jobTemplate.code, params, req, webhook)
    Request.post('/api/template/submitjob/', {
      parameters: req,
      template_id: jobTemplate.code,
      hooks: webhook,
    }).then(
      res => {
        setTimeout(function () {
          waitForJobCreated(res.body.id, resolve, reject, 10)
        }, 2000)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function waitForJobCreated(jobId, resolve, reject, tryTimes) {
  getJobById(jobId).then(
    res => {
      const job = res
      if (job.status !== 'creating') {
        resolve(job)
      } else {
        if (tryTimes > 0) {
          setTimeout(function () {
            waitForJobCreated(jobId, resolve, reject, tryTimes - 1)
          }, 2000)
        } else {
          reject(window.gApp.$t('Job.Create.Error.NoSchedulerId'))
        }
      }
    },
    res => {
      reject(res)
    },
  )
}

function getTensorboardPort(logdir, jobQueue, jobTemplateCode) {
  return new Promise((resolve, reject) => {
    const req = {
      logdir,
      job_template_code: jobTemplateCode,
    }
    if (jobQueue) {
      req.job_queue = jobQueue
    }
    Request.post('/api/tensorboard/', req).then(
      res => {
        resolve(res.body)
      },
      res => {
        if (res.status === 502) {
          reject(window.gApp.$t('Error.RestAPI.Unavailable'))
        } else {
          ErrorHandler.restApiErrorHandler(res, reject)
        }
      },
    )
  })
}

function getTensorboardStatus(uuid) {
  return new Promise((resolve, reject) => {
    Request.get(`/api/tensorboard/${uuid}/`).then(
      res => {
        resolve(res.body)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function sendHeartbeat(port) {
  return new Promise((resolve, reject) => {
    Request.post(`/api/tensorboard/${port}/session/`, JSON.stringify(port)).then(
      () => {
        resolve()
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

// unused
// function formatHoursToTime(hours) {
//   let hourStr = Math.floor(hours).toString()
//   let minuteStr = Math.floor(60 * (hours - Math.floor(hours))).toString()
//   const secondStr = '00'
//   if (hourStr.length < 1) {
//     hourStr = '0' + hourStr
//   }
//   if (minuteStr.length < 1) {
//     minuteStr = '0' + minuteStr
//   }
//   return hourStr + ':' + minuteStr + ':' + secondStr
// }

// function parseTimeToHours(time) {
//   let hours = 0
//   const times = time.split(':')
//   hours += parseInt(times[0])
//   hours += parseInt(times[1]) / 60
//   return times
// }

// function formatTriggers(triggers) {
//   let result = ''
//   triggers.forEach(trigger => {
//     if (trigger === 'suspend') {
//       result += 'b'
//     } else if (trigger === 'finish') {
//       result += 'e'
//     }
//   })
//   return result
// }

// function parseTriggers(trigger) {
//   const result = []
//   for (let c = 0; c < trigger.length; c++) {
//     if (trigger[c] === 'b') {
//       result.push('suspend')
//     }
//     if (trigger[c] === 'e') {
//       result.push('finish')
//     }
//   }
//   return result
// }

function getJoblatest(length, status, role) {
  return new Promise((resolve, reject) => {
    const api = role === 'admin' || role === 'operator' ? '' : 'user/'
    status = status || 'finished'
    const params = {
      count: length,
      job_state: JSON.stringify(
        JobWebStateEnums[status].map(item => {
          return { state: item }
        }),
      ),
    }
    Request.get('/api/job/latest/' + api, { params }).then(
      res => {
        const jobs = []
        res.body.forEach(item => {
          jobs.push(Job.parseFromRestApi(item))
        })
        resolve(jobs)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

async function getJobActions(access, operateStatus, status, type, errmsg = null) {
  const actions = []
  // Set available actions by access and arch.
  let availActions = []
  const arch = AccessService.getSchedulerArch()
  if ((access === 'admin' || access === 'operator') && arch === 'host') {
    availActions = ['Cancel', 'Errmsg']
  }
  if (access === 'staff') {
    availActions = ['Browse', 'Cancel', 'Rerun', 'Copy', 'Delete', 'Errmsg', 'Comment']
  }

  // Get actions by job status
  const statusActions = []
  if (JobWebStatusEnums.running.indexOf(status) >= 0 || JobWebStatusEnums.finished.indexOf(status) >= 0) {
    statusActions.push('Browse')
  }
  if (operateStatus !== 'cancelling' && JobWebStatusEnums.finished.indexOf(status) < 0) {
    statusActions.push('Cancel')
  }
  if (JobWebStatusEnums.finished.indexOf(status) >= 0) {
    statusActions.push('Rerun')
    statusActions.push('Delete')
  }
  statusActions.push('Copy')
  statusActions.push('Comment')
  if (errmsg) {
    statusActions.push('Errmsg')
  }

  // Merge availActions and statusActions to actions
  statusActions.forEach(statusAction => {
    let avail = false
    availActions.forEach(availAction => {
      if (availAction === statusAction) {
        avail = true
      }
    })
    if (avail) {
      actions.push(statusAction)
    }
  })

  // Filter actions by job type
  // AI Studio and System job can't rerun and copy.
  // OPENAPI job can't copy.
  if (type === 'openapi' || type === 'cmd') {
    Collection.removeByValue(actions, 'Rerun')
    Collection.removeByValue(actions, 'Copy')
  } else {
    const data = await JobTemplateService.getJobTemplate(type)
    if (!data.display) {
      Collection.removeByValue(actions, 'Rerun')
      Collection.removeByValue(actions, 'Copy')
    }
  }

  // Unknown type job can't copy.
  if (type === '') {
    Collection.removeByValue(actions, 'Copy')
  }

  return actions
}

function getJobSchedulerInfo(id) {
  return new Promise((resolve, reject) => {
    Request.get(`/api/job/raw_info/${id}/`).then(
      res => {
        resolve(res.body)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function initJobResFields(job, jsonObj) {
  if (jsonObj.tres) {
    const tresObj = parseTRES(jsonObj.tres)
    if (tresObj.nodes) {
      job.numberOfNodes = tresObj.nodes
    }
    if (tresObj.cores) {
      job.numberOfCpuCores = tresObj.cores
    }
    if (tresObj.gpus.length) {
      job.numberOfGpus = tresObj.gpus.map(i => i.num).reduce((a, b) => a + b)
    }
  }
  if (jsonObj.job_running) {
    const exechosts = []
    const exechostsDisplay = []
    const gpuExechosts = []
    const gpuExechostsDisplay = []
    const usedNodes = []
    jsonObj.job_running.forEach(running => {
      const tresObj = parseTRES(running.per_host_tres)
      let hostsDisplay = running.hosts
      if (hostsDisplay) {
        usedNodes.push(...hostsDisplay.split(','))
      }
      if (hostsDisplay && hostsDisplay.includes(',')) {
        hostsDisplay = '(' + hostsDisplay + ')'
      }
      if (tresObj.cores) {
        exechosts.push(running.hosts + '*' + tresObj.cores)
        exechostsDisplay.push(hostsDisplay + ' * ' + tresObj.cores)
      }
      if (tresObj.gpus) {
        tresObj.gpus.forEach(item => {
          const gpuMigType = item.gpuType ? `(${item.gpuType})` : null
          gpuExechosts.push(running.hosts + '*' + job.numberOfGpus)
          gpuExechostsDisplay.push(hostsDisplay + (gpuMigType || '') + ' * ' + item.num)
        })
      }
    })
    job.usedNodes = usedNodes
    job.execHosts = exechosts.join('+')
    job.execHostsDisplay = exechostsDisplay.join(' + ').substring(0, 512)
    job.gpuExecHosts = gpuExechosts.join('+')
    job.gpuExecHostsDisplay = gpuExechostsDisplay.join(' + ').substring(0, 512)
  }

  if (jsonObj.exechosts) {
    job.execHosts = jsonObj.exechosts
    job.execHostsDisplay = jsonObj.exechosts
  }
  if (jsonObj.gpusexechosts) {
    job.gpuExecHosts = jsonObj.gpusexechosts
    job.gpuExecHostsDisplay = jsonObj.gpusexechosts
  }
}

function parseTRES(tres) {
  const result = {}
  result.gpus = []
  tres.split(',').forEach(item => {
    const vals = item.split(':')
    const num = vals[1] % 1 ? Format.formatNumber(vals[1], 2) : Number(vals[1])
    if (vals[0] === 'N') {
      result.nodes = num
    }
    if (vals[0] === 'C') {
      result.cores = num
    }
    if (vals[0].startsWith('G/gpu')) {
      const gpu = { num }
      if (vals[0] !== 'G/gpu') {
        gpu.gpuType = vals[0].replace('G/gpu/', '')
      }
      result.gpus.push(gpu)
    }
  })
  return result
}

function initTemplateJobFields(job) {
  return new Promise((resolve, reject) => {
    Request.get('/api/template/templatejob/' + job.id + '/').then(
      res => {
        const templateJob = res.body
        job.type = templateJob.template_code
        job.realType = job.type
        const params = {}
        parseJobReq(JSON.parse(templateJob.json_body), params)
        job.req = {
          params,
        }
        // 判断类型是否为数字
        if (!isNaN(Number(job.realType))) {
          const templateId = job.realType
          JobTemplateService.getJobTemplate(templateId).then(
            res => {
              job.realType = res.name
            },
            _ => {
              // do nothing
            },
          )
        }
        resolve()
      },
      res => {
        if (res.status === 404 && res.body.type === 'DoesNotExist') {
          // Not a template job, do nothing
          job.type = 'cmd'
          job.realType = 'cmd'
          resolve()
        } else {
          ErrorHandler.restApiErrorHandler(res, reject)
        }
      },
    )
  })
}

function getAllJobTags() {
  return new Promise((resolve, reject) => {
    const params = {
      count: 20,
    }
    Request.get('/api/job/tag/', { params }).then(
      res => {
        resolve(res.body.tags)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function AddTagsforJob(jobId, tags) {
  return new Promise((resolve, reject) => {
    const req = {
      job_id: jobId,
      tags,
    }
    Request.put('/api/job/tag/', req).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}
function DeleteTagsforJob(jobId, tags = false) {
  return new Promise((resolve, reject) => {
    const req = { job_id: jobId }
    if (tags) {
      req.tags = tags
    }
    Request.delete('/api/job/tag/', { data: req }).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function editCommentForJob(jobId, comment) {
  return new Promise((resolve, reject) => {
    const req = {
      user_comment: comment,
    }
    Request.put(`/api/job/${jobId}/comment/`, req).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

export default {
  Job,
  JobStatusEnums,
  JobWebStatusEnums,
  JobWebStateEnums,
  JobActionEnums,
  getJobTableDataFetcher,
  batchCancelJob,
  cancelJob,
  deleteJob,
  rerunJob,
  getJobById,
  getJobLog,
  getRunningJobsTableDataFetcher,
  getTensorboardPort,
  getTensorboardStatus,
  sendHeartbeat,
  getJoblatest,
  getJobActions,
  createJobEx,
  getJobSchedulerInfo,
  buildJobReq,
  initTemplateJobFields,
  getAllJobTags,
  AddTagsforJob,
  DeleteTagsforJob,
  editCommentForJob,
}
