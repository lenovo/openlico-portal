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

// function toUTC (time) {
//   const now = new Date(time)
//   return Date.UTC(
//     now.getFullYear(),
//     now.getMonth(),
//     now.getDate(),
//     now.getHours(),
//     now.getMinutes(),
//   )
// }

const reportType = {
  alert: 'alert',
  job: 'jobs',
  log: 'operation',
  node: 'node',
  user: 'user',
  billgroup: 'bill',
  node_running: 'node_running',
  node_user: 'node_user',
  user_login: 'user_login',
  user_storage: 'user_storage',
}
const levelToRest = {
  all: '0',
  fatal: '1',
  error: '2',
  warn: '3',
  info: '4',
}

function toReportUrl(type, content, name, format) {
  switch (type) {
    case 'job':
      return reportType[name] + '_' + content + '.' + format
    case 'alert':
      return 'alert' + '_' + content + '.' + format
    case 'operation': {
      const logContent = name === 'log' ? 'details' : content
      return reportType[name] + '_' + logContent + '.' + format
    }
    default:
      break
  }
}

class Report {
  constructor() {
    this.type = 'job'
    this.report = 'job'
    this.content = 'statistics'
    this.format = 'xlsx'
    this.level = 'all'
    this.user = []
    this.node = []
    this.billGroup = []
    this.startTime = new Date(0)
    this.endTime = new Date(0)
  }

  // 定义属性，定义属性方法
  static toRestApi(form) {
    const reportForm = {}
    let now = new Date()
    const reportName = form.reportType === 'job' ? 'job_type' : 'operation_type'
    reportForm.url = toReportUrl(form.reportType, form.filterData.content, form.filterData[reportName], form.format)
    reportForm.event_level = levelToRest[form.filterData.level]
    reportForm.job_user = form.filterData.user
    reportForm.node = form.filterData.node
    reportForm.bill = form.filterData.billGroup
    reportForm.monitor_type = form.filterData.monitor_type
    now = new Date()
    reportForm.start_time = isNaN(form.start_time) ? 0 : form.start_time / 1000
    reportForm.end_time = isNaN(form.end_time) ? 0 : form.end_time / 1000
    reportForm.creator = window.gApp.$store.state.auth.username
    reportForm.language = window.gApp.$i18n.locale
    if (reportForm.language === 'zh') {
      reportForm.language = 'sc'
    }
    reportForm.page_direction = form.direction
    // Backend not need create time
    // reportForm.create_time = toUTC(now.valueOf());
    reportForm.timezone_offset = now.getTimezoneOffset()
    reportForm.format = form.format
    return reportForm
  }

  get type() {
    return this._type
  }

  set type(type) {
    this._type = type
  }

  get report() {
    return this._report
  }

  set report(report) {
    this._report = report
  }

  get content() {
    return this._content
  }

  set content(content) {
    this._content = content
  }

  get format() {
    return this._format
  }

  set format(format) {
    this._format = format
  }

  get level() {
    return this._level
  }

  set level(level) {
    this._level = level
  }

  get user() {
    return this._user
  }

  set user(user) {
    this._user = user
  }

  get node() {
    return this._node
  }

  set node(node) {
    this._node = node
  }

  get billGroup() {
    return this._billGroup
  }

  set billGroup(billGroup) {
    this._billGroup = billGroup
  }

  get startTime() {
    return this._startTime
  }

  set startTime(startTime) {
    this._startTime = startTime
  }

  get endTime() {
    return this._endTime
  }

  set endTime(endTime) {
    this._endTime = endTime
  }
}

function previewJobReport(form) {
  const name = form.job_type === 'billgroup' ? form.billgroup : form.user
  const now = new Date()
  const para = {
    filters: name,
    start_time: String(form.start_time / 1000),
    end_time: String(form.end_time / 1000),
    timezone_offset: String(now.getTimezoneOffset()),
  }
  const type = form.job_type === 'billgroup' ? 'bill_group' : form.job_type
  return new Promise((resolve, reject) => {
    Request.post(`/api/job/${type}/`, para).then(
      res => {
        resolve(res.data.data)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}
class ReportAlert {
  constructor() {
    this.alertTime = new Date(0)
    this.numTotal = 0
    this.critical = 0
    this.error = 0
    this.warning = 0
    this.info = 0
  }

  static parseReportAlert(obj) {
    const reportAlert = new ReportAlert()
    reportAlert.alertTime = obj.alarm_time
    reportAlert.numTotal = obj.num_total
    reportAlert.critical = obj.critical
    reportAlert.error = obj.error
    reportAlert.warning = obj.warning
    reportAlert.info = obj.info
    return reportAlert
  }
}

function alertReport(form) {
  const para = {
    start_time: form.start_time,
    end_time: form.end_time,
    timezone_offset: form.timezone_offset,
  }
  return new Promise((resolve, reject) => {
    Request.get('/api/alert/report/', { params: para }).then(
      res => {
        const reports = []
        res.data.data.forEach(item => {
          reports.push(ReportAlert.parseReportAlert(item))
        })
        resolve(reports)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
        resolve(res)
      },
    )
  })
}

function previewLogReport(form) {
  const type = form.monitor_type
  const now = new Date()
  const para = {
    filters: { ...form.node, time_type: form.timeType },
    timezone_offset: String(now.getTimezoneOffset()),
  }
  return new Promise((resolve, reject) => {
    Request.post(`/api/monitor/report/${type}/`, para).then(
      res => {
        resolve(res.data.data)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

export default {
  Report,
  levelToRest,
  previewJobReport,
  alertReport,
  previewLogReport,
}
