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

import dayjs from '../dayjs'
import ErrorHandler from '../common/error-handler'
import TableDataFetcherFactory from '../common/table-data-fetcher-factory'
import Request from '../request/https'
import Utils from '../common/utils'

const daysOfWeekMondayFirst = Utils.getDaysOfWeekMondayFirst()

class Wrokflow {
  constructor() {
    this.id = ''
    this.name = ''
    this.owner = ''
    this.runPolicy = ''
    this.maxSubmitJobs = ''
    this.createTime = ''
    this.updateTime = ''
    this.startTime = ''
    this.description = ''
    this.step = []
    this.stepNumber = 0
    this.status = ''
    this.periodic_task = null
  }

  static parseFromRestApi(jsonObj) {
    const workflow = new Wrokflow()
    workflow.id = jsonObj.id
    workflow.name = jsonObj.name
    workflow.owner = jsonObj.owner
    workflow.runPolicy = jsonObj.run_policy
    workflow.maxSubmitJobs = jsonObj.max_submit_jobs
    workflow.createTime = jsonObj.create_time
    workflow.updateTime = jsonObj.update_time
    workflow.startTime = jsonObj.start_time
    workflow.description = jsonObj.description
    if (Object.prototype.hasOwnProperty.call(jsonObj, 'step')) {
      workflow.step = jsonObj.step.map(el => {
        return WorkflowStep.parseFromRestApi(el)
      })
    }
    if (Object.prototype.hasOwnProperty.call(jsonObj, 'step_number')) {
      workflow.stepNumber = jsonObj.step_number
    }
    workflow.status = jsonObj.status
    workflow.periodic_task = jsonObj.periodic_task
    return workflow
  }

  getRecurrencePattern() {
    if (this.periodic_task === null) {
      return null
    }

    const crontab = this.periodic_task.crontab
    if (crontab !== undefined) {
      // const today = new Date()
      // const date = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), crontab.hour, crontab.minute, 0))
      const time = crontab.hour + ':' + crontab.minute
      // const tz = dayjs().tz(crontab.timezone).format('z')
      const tz = Utils.getTimezoneShortByLang(crontab.timezone)
      if (crontab.day_of_month === '*' && crontab.month_of_year === '*' && crontab.day_of_week === '*') {
        return window.gApp.$T('Workflow.Recurrence.Daily.Msg', { time, tz })
      }
      if (crontab.day_of_week !== '*') {
        const days = crontab.day_of_week
          .split(',')
          .map(i => (parseInt(i) === 0 ? 6 : parseInt(i) - 1))
          .sort((a, b) => a - b)
          .map(index => {
            const day = window.gApp.$t(daysOfWeekMondayFirst[index])
            return day // .format('dddd')
          })
          .join(', ')

        return window.gApp.$T('Workflow.Recurrence.Weekly.Msg', { week: days, time, tz })
      }
      if (crontab.day_of_month !== '*') {
        const days = crontab.day_of_month
          .split(',')
          .map(index => {
            const day = Utils.getDaysOfMonth()[index - 1]
            return day.format('Do')
          })
          .join(', ')

        return window.gApp.$T('Workflow.Recurrence.Monthly.Msg', { month: days, time, tz })
      }
    }

    if (this.periodic_task.clocked) {
      // if (this.getLastRunAt() != null) {
      //   // already ran so avoid displaying redundant information
      //   return window.gApp.$t("Workflow.Recurrence.Once")
      // }
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const date = dayjs(this.periodic_task.clocked).tz(tz).format('YYYY-MM-DD HH:mm')
      const short = Utils.getTimezoneShortByLang(tz)
      return window.gApp.$T('Workflow.Recurrence.Once.Msg', { time: `${date} ${short}` })
    }
  }

  getLastRunAt() {
    if (this.periodic_task === null) {
      return null
    }
    if (this.periodic_task.last_run_at) {
      const short = Utils.getTimezoneShortByLang(this.periodic_task.crontab.timezone)
      return (
        dayjs(this.periodic_task.last_run_at).tz(this.periodic_task.crontab.timezone).format('YYYY-MM-DD HH:mm') +
        ' ' +
        short
      )
    }
    return null
  }

  getNextRunAt() {
    if (this.periodic_task === null) {
      return null
    }
    if (this.periodic_task.next_run_at) {
      if (this.periodic_task.clocked) {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        const short = Utils.getTimezoneShortByLang(tz)
        return dayjs(this.periodic_task.next_run_at).tz(tz).format('YYYY-MM-DD HH:mm') + ' ' + short
      } else if (this.periodic_task.crontab) {
        const short = Utils.getTimezoneShortByLang(this.periodic_task.crontab.timezone)
        return dayjs(this.periodic_task.next_run_at).format('YYYY-MM-DD HH:mm') + ' ' + short
      }
    }
    return null
  }
}

class WorkflowStep {
  constructor() {
    this.id = ''
    this.name = ''
    this.order = ''
    this.stepJob = []
    this.createTime = ''
    this.updateTime = ''
    this.description = ''
  }

  static parseFromRestApi(jsonObj) {
    const workflowStep = new WorkflowStep()
    workflowStep.id = jsonObj.id
    workflowStep.name = jsonObj.name
    workflowStep.order = jsonObj.order
    workflowStep.createTime = jsonObj.create_time
    workflowStep.updateTime = jsonObj.update_time
    workflowStep.description = jsonObj.description
    if (Object.prototype.hasOwnProperty.call(jsonObj, 'step_job')) {
      workflowStep.stepJob = jsonObj.step_job.map(el => {
        return WorkflowStepJob.parseFromRestApi(el)
      })
    }
    return workflowStep
  }
}

class WorkflowStepJob {
  constructor() {
    this.id = ''
    this.jobName = ''
    this.jobId = ''
    this.createTime = ''
    this.updateTime = ''
    this.jsonBody = ''
    this.templateId = ''
    this.template = ''
    this.status = ''
    this.jobExist = false
  }

  static parseFromRestApi(jsonObj) {
    const workflowStepJob = new WorkflowStepJob()
    workflowStepJob.id = jsonObj.id
    workflowStepJob.jobName = jsonObj.job_name
    workflowStepJob.createTime = jsonObj.create_time
    workflowStepJob.updateTime = jsonObj.update_time
    workflowStepJob.jsonBody = jsonObj.json_body
    workflowStepJob.templateId = jsonObj.template_id
    workflowStepJob.jobId = jsonObj.job_id
    return workflowStepJob
  }
}

function workflowTableDataParser(res) {
  const workflows = []
  res.data.forEach(item => {
    workflows.push(Wrokflow.parseFromRestApi(item))
  })
  return {
    offset: res.offset,
    total: res.total,
    data: workflows,
  }
}

function workflowRestApiPropMap(prop) {
  if (prop === 'runPolicy') {
    return 'run_policy'
  }
  if (prop === 'maxSubmitJobs') {
    return 'max_submit_jobs'
  }
  if (prop === 'createTime') {
    return 'create_time'
  }
  if (prop === 'updateTime') {
    return 'update_time'
  }
  if (prop === 'stepNumber') {
    return 'step_number'
  }
  return prop
}

function getWrokflowTableDataFetcher() {
  return TableDataFetcherFactory.createRemotePagingFetcher(
    'api/workflow/',
    workflowRestApiPropMap,
    workflowTableDataParser,
    'data',
    'offset',
    'total',
  )
}

function createWorkflow(data) {
  let req = {
    name: data.name,
    max_submit_jobs: data.maxSubmitJobs ? parseInt(data.maxSubmitJobs) : 3,
    description: data.description,
  }
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (data.recurrence) {
    req = {
      ...req,
      ...data.recurrence,
      tz,
    }
  }
  return new Promise((resolve, reject) => {
    Request.post('/api/workflow/', req).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function updateWorkflow(data) {
  let req = {
    name: data.name,
    description: data.description,
    max_submit_jobs: parseInt(data.maxSubmitJobs),
  }
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (data.recurrence) {
    req = {
      ...req,
      ...data.recurrence,
      tz,
    }
  }
  return new Promise((resolve, reject) => {
    Request.put(`/api/workflow/${data.id}/`, req).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function deleteWorkflow(id) {
  return new Promise((resolve, reject) => {
    Request.delete(`/api/workflow/${id}/`).then(
      res => {
        resolve(res)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function copyWorkflow(data) {
  let req = {
    operation: 'copy',
    name: data.name,
    max_submit_jobs: parseInt(data.maxSubmitJobs),
    description: data.description,
  }
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (data.recurrence) {
    req = {
      ...req,
      ...data.recurrence,
      tz,
    }
  }
  return new Promise((resolve, reject) => {
    Request.post(`/api/workflow/${data.id}/`, req).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function operateWorkflow(id, action) {
  const req = {
    operation: action,
  }
  return new Promise((resolve, reject) => {
    Request.post(`/api/workflow/${id}/`, req).then(
      res => {
        resolve(Wrokflow.parseFromRestApi(res))
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getWorkflowById(id) {
  return new Promise((resolve, reject) => {
    Request.get(`/api/workflow/${id}/`).then(
      res => {
        resolve(Wrokflow.parseFromRestApi(res.body))
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function createWorkflowStep(id, data) {
  const req = {
    name: data.name,
    order: data.order,
    description: data.description,
  }
  return new Promise((resolve, reject) => {
    Request.post(`/api/workflow/step/${id}/`, req).then(
      res => {
        resolve(WorkflowStep.parseFromRestApi(res.body))
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function updateWorkflowStep(id, data) {
  const req = {
    id: data.id,
    name: data.name,
    order: data.order,
    description: data.description,
  }
  return new Promise((resolve, reject) => {
    Request.put(`/api/workflow/step/${id}/`, req).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function deleteWorkflowStep(id, stepId) {
  return new Promise((resolve, reject) => {
    Request.delete(`/api/workflow/step/${id}/`, { data: { id: stepId } }).then(
      res => {
        resolve()
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function createWorkflowStepJob(stepId, data) {
  const req = {
    template_id: data.template,
    json_body: data.jsonBody,
  }
  return new Promise((resolve, reject) => {
    Request.post(`/api/workflow/job/${stepId}/`, req).then(
      res => {
        resolve(res)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function updateWorkflowStepJob(stepId, data) {
  const req = {
    id: data.id,
    json_body: data.jsonBody,
  }
  return new Promise((resolve, reject) => {
    Request.put(`/api/workflow/job/${stepId}/`, req).then(
      res => {
        resolve(res)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function deleteWorkflowStepJob(stepId, stepJobId) {
  return new Promise((resolve, reject) => {
    Request.delete(`/api/workflow/job/${stepId}/`, { data: { id: stepJobId } }).then(
      res => {
        resolve(res)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function moveWorkflowJob(oldStepId, stepid, jobId) {
  const req = {
    job_id: jobId,
    new_step_id: stepid,
  }
  return new Promise((resolve, reject) => {
    Request.put(`/api/workflow/job/${oldStepId}/move/`, req).then(
      res => {
        resolve(res)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

export default {
  getWrokflowTableDataFetcher,
  createWorkflow,
  updateWorkflow,
  operateWorkflow,
  deleteWorkflow,
  copyWorkflow,
  getWorkflowById,
  createWorkflowStep,
  updateWorkflowStep,
  deleteWorkflowStep,
  createWorkflowStepJob,
  updateWorkflowStepJob,
  deleteWorkflowStepJob,
  moveWorkflowJob,
}
