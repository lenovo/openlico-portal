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

import TableDataFetcherFactory from '../common/table-data-fetcher-factory'

class VNC {
  constructor() {
    this.id = ''
    this.name = ''
    this.host = ''
    this.port = 0
    this.username = ''
    this.pid = 0
    this.schedulerId = 0
    this.jobId = 0
    this.index = ''
    this.token = ''
  }

  static parseFromRestApi(jsonObj) {
    const vnc = new VNC()
    vnc.id = jsonObj.id
    vnc.name = jsonObj.name
    vnc.host = jsonObj.host
    vnc.port = jsonObj.port
    vnc.username = jsonObj.username
    vnc.pid = jsonObj.pid
    vnc.schedulerId = jsonObj.scheduler_id
    vnc.jobId = jsonObj.job_id
    vnc.index = jsonObj.display
    vnc.token = jsonObj.token
    return vnc
  }
}

function vncTableDataParser(res) {
  const vncs = []
  res.data.forEach(function (item) {
    vncs.push(VNC.parseFromRestApi(item))
  })
  return {
    data: vncs,
  }
}

function getVNCTableDataFetcher(username) {
  let url = '/api/monitor/vnc/sessions'
  url += username ? '/' + username + '/' : '/'
  return TableDataFetcherFactory.createLocalPagingFetcher(url, vncTableDataParser, 'data')
}

export default {
  getVNCTableDataFetcher,
}
