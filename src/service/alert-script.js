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
import ErrorHandler from '../common/error-handler'
import Parser from '../common/parser'
import Request from '../request/https'

class AlertScript {
  constructor() {
    this.name = ''
    this.fileSize = 0
    this.createTime = new Date(0)
  }

  static parseFromRestApi(jsonObj) {
    const alertScript = new AlertScript()
    alertScript.name = jsonObj.name
    alertScript.fileSize = jsonObj.size
    alertScript.createTime = Parser.parseTimeFromRestApi(jsonObj.modify_time)
    return alertScript
  }

  get name() {
    return this._name
  }

  set name(name) {
    this._name = name
  }

  get fileSize() {
    return this._fileSize
  }

  set fileSize(fileSize) {
    this._fileSize = fileSize
  }

  get createTime() {
    return this._createTime
  }

  set createTime(createTime) {
    this._createTime = createTime
  }
}

function alertScriptsTableDataParser(res) {
  const scripts = []
  res.forEach(item => {
    scripts.push(AlertScript.parseFromRestApi(item))
  })
  return {
    data: scripts,
  }
}

function getAlertScriptsTableDataFetcher() {
  return TableDataFetcherFactory.createLocalPagingFetcher('api/alert/script/', alertScriptsTableDataParser, 'data')
}

function getAllAlertScripts() {
  return new Promise((resolve, reject) => {
    Request.get('api/alert/script/').then(
      res => {
        const scripts = []
        res.body.forEach(obj => {
          scripts.push(obj.name)
        })
        resolve(scripts)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

export default {
  getAlertScriptsTableDataFetcher,
  getAllAlertScripts,
}
