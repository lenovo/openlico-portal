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
import ErrorHandler from '../common/error-handler'
import download from './download'

const HelpKeysMap = {
  aps: [],
  tac: [1, 'command', 2],
  vtune_profiler: [1, 2, 3],
  advisor: [1, 2, 'command', 3, 4],
}

const IntelAnalysisToolsMap = {
  aps: 'Application Performance Snapshot',
  tac: 'Trace Analyzer and Collector',
  vtune_profiler: 'VTune Profiler',
  advisor: 'Advisor',
}

const IntelAnalysisToolTypeMap = {
  'performance-snapshot': 'Performance Snapshot',
  hotspots: 'Hotspots',
  'memory-consumption': 'Memory Consumption',
  'uarch-exploration': 'Microarchitecture Exploration',
  'memory-access': 'Memory Access',
  threading: 'Threading',
  'hpc-performance': 'HPC Performance Characterization',
  'system-overview': 'System Overview',
  'platform-profiler': 'Platform Profiler',
}

class Result {
  constructor() {
    this.command = ''
    this.result = []
    this.dataFiles = []
    this.show = Boolean
  }

  static parseFromRestApi(jsonObj) {
    const result = new Result()
    result._show = jsonObj.show
    result._command = jsonObj.command
    result._result = jsonObj.report_path.map(item => [Format.formatMyFolder(item[0]), item[1], item[0]])
    result._dataFiles = jsonObj.dir_path.map(item => [Format.formatMyFolder(item[0]), item[1], item[0]])
    return result
  }

  get _show() {
    return this.show
  }

  set _show(show) {
    this.show = show
  }

  get _command() {
    return this.command
  }

  set _command(command) {
    this.command = command
  }

  get _result() {
    return this.result
  }

  set _result(result) {
    this.result = result
  }

  get _dataFiles() {
    return this.dataFiles
  }

  set _dataFiles(dataFiles) {
    this.dataFiles = dataFiles
  }
}

function getIntelAnalyzerById(id) {
  return new Promise((resolve, reject) => {
    Request.get(`/api/oneapi/analyzer/resultPath/${id}/`).then(
      res => {
        resolve(Result.parseFromRestApi(res.body))
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function downloadAnalysisResult(path) {
  const url = '/api/download/oneapi/analyzer/report_download/'
  const data = {
    file_path: path,
    token: window.gApp.$store.state.auth.token,
  }
  return download(url, data, 'get', 'json')
}

function previewAnalysisResult(id, path) {
  window.open(`/oneapi/report/?id=${id}&report=${path}`)
}

function deleteAnalysisData(targets) {
  return new Promise((resolve, reject) => {
    const req = {
      path_list: targets,
    }
    Request.delete('/api/oneapi/analyzer/report/', { data: req }).then(
      res => {
        if (res.body.status) {
          resolve()
        } else if (res.body.error) {
          reject(res.body.error)
        }
      },
      err => {
        reject(err)
      },
    )
  })
}

function getVTuneUrl(data) {
  return new Promise((resolve, reject) => {
    const { id, dataDirectory, platformId } = data
    const req = {
      job_template_ex_id: id,
      data_directory: dataDirectory,
      platform_id: platformId,
    }
    Request.post('/api/oneapi/vtune/', req).then(
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
  HelpKeysMap,
  IntelAnalysisToolsMap,
  IntelAnalysisToolTypeMap,
  getIntelAnalyzerById,
  downloadAnalysisResult,
  previewAnalysisResult,
  deleteAnalysisData,
  getVTuneUrl,
}
