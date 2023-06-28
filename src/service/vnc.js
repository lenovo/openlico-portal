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

import TableDataFetcherFactory from '../common/table-data-fetcher-factory'

class VNC {
  constructor() {
    this.id = ''
    this.name = ''
    this.host = ''
    this.port = 0
    this.username = ''
    this.pid = 0
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
    vnc.index = jsonObj.display
    vnc.token = jsonObj.token
    return vnc
  }

  get id() {
    return this._id
  }

  set id(id) {
    this._id = id
  }

  get name() {
    return this._name
  }

  set name(name) {
    this._name = name
  }

  get host() {
    return this._host
  }

  set host(host) {
    this._host = host
  }

  get port() {
    return this._port
  }

  set port(port) {
    this._port = port
  }

  get username() {
    return this._username
  }

  set username(username) {
    this._username = username
  }

  get pid() {
    return this._pid
  }

  set pid(pid) {
    this._pid = pid
  }

  get index() {
    return this._index
  }

  set index(index) {
    this._index = index
  }

  get token() {
    return this._token
  }

  set token(token) {
    this._token = token
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
