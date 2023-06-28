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
import ErrorHandler from '../common/error-handler'

class Process {
  constructor() {
    this.pid = ''
    this.jobId = ''
    this.user = ''
    this.jobName = ''
    this.schedulerId = ''
    this.cpu = ''
    this.memory = ''
    this.gpu = ''
    this.runTime = ''
    this.runProgram = ''
  }

  static parseFromRestApi(jsonObj) {
    const process = new Process()
    process.pid = jsonObj.pid
    process.jobId = jsonObj.job_id
    process.user = jsonObj.user
    process.jobName = jsonObj.job_name ? jsonObj.job_name : '-'
    process.schedulerId = jsonObj.scheduler_id || jsonObj.scheduler_id === 0 ? jsonObj.scheduler_id : '-'
    process.cpu = jsonObj.cpu_util
    process.memory = jsonObj.mem_util
    const gpus = []
    let gpuUtil = ''
    if (jsonObj.gpu_util && Object.keys(jsonObj.gpu_util.gpu).length) {
      for (const gpuI in jsonObj.gpu_util.gpu) {
        const gpuItem = jsonObj.gpu_util.gpu[gpuI]
        const migDevs = []
        if (gpuItem.mig_devs) {
          for (const migI in gpuItem.mig_devs) {
            const migItem = gpuItem.mig_devs[migI]
            migDevs.push({
              index: migI,
              type: migItem.dev_name,
              util: migItem.dev_util,
            })
          }
        }
        gpus.push({
          index: gpuI,
          type: gpuItem.type,
          util: gpuItem.util,
          migDevs,
        })
      }
      gpuUtil = jsonObj.gpu_util.util_total
    }
    process.gpus = gpus
    process.gpuUtil = gpuUtil
    process.runTime = jsonObj.runtime
    process.runProgram = jsonObj.cmd
    return process
  }
}

function getNodeProcesses(hostname) {
  return new Promise((resolve, reject) => {
    Request.get(`/api/monitor/node/${hostname}/process/`).then(
      res => {
        const processes = []
        res.body.data.forEach(el => {
          processes.push(Process.parseFromRestApi(el))
        })
        resolve(processes)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getJobProcesses(hostname, schedulerId) {
  let url = `/api/monitor/node/${hostname}/process/`
  if (schedulerId || schedulerId === 0) {
    url = `/api/monitor/node/${hostname}/process/?scheduler_id=${schedulerId}`
  }
  return new Promise((resolve, reject) => {
    Request.get(url).then(
      res => {
        const processes = []
        res.body.data.forEach(el => {
          processes.push(Process.parseFromRestApi(el))
        })
        resolve(processes)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function killProcesses(hostname, pids) {
  const req = {
    hostname,
    pid_list: pids,
  }
  return new Promise((resolve, reject) => {
    Request.post('api/maintenance/process/terminate/', req).then(
      res => {
        resolve(res)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getAllowKillProcess() {
  return new Promise((resolve, reject) => {
    Request.get('/api/maintenance/config/').then(
      res => {
        if (res.body.allow_kill_process) {
          resolve(true)
        } else {
          resolve(false)
        }
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

export default {
  getNodeProcesses,
  getJobProcesses,
  killProcesses,
  getAllowKillProcess,
}
