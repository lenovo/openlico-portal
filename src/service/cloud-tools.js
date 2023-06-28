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

import ErrorHandler from '../common/error-handler'
import Request from '../request/https'

class CloudTools {
  constructor() {
    this.id = 0
    this.name = ''
    this.code = ''
    this.instance = {}
    this.job_template = ''
    this.setting_params = ''
    this.settings = {}
  }

  static parseFromRestApi(jsonObj) {
    const cloudtools = new CloudTools()
    cloudtools._id = jsonObj.id
    cloudtools._name = jsonObj.name
    cloudtools._code = jsonObj.code
    cloudtools._instance = jsonObj.instance
    cloudtools._job_template = jsonObj.job_template
    const params = jsonObj.setting_params.split(',')
    if (params.includes('gpu_per_node')) {
      for (let i = 0; i < params.length; i++) {
        if (params[i] === 'gpu_per_node') {
          params.splice(i + 1, 0, 'gpu_resource_name')
          break
        }
      }
    }
    cloudtools._setting_params = params.join(',')
    // cloudtools._setting_params = jsonObj.setting_params;
    cloudtools._settings = jsonObj.settings
    return cloudtools
  }

  get _id() {
    return this.id
  }

  set _id(id) {
    this.id = id
  }

  get _name() {
    return this.name
  }

  set _name(name) {
    this.name = name
  }

  get _code() {
    return this.code
  }

  set _code(code) {
    this.code = code
  }

  get _instance() {
    return this.instance
  }

  set _instance(instance) {
    this.instance = instance
  }

  get _job_template() {
    return this.job_template
  }

  set _job_template(jobTemplate) {
    this.job_template = jobTemplate
  }

  get _setting_params() {
    return this.setting_params
  }

  set _setting_params(settingParams) {
    this.setting_params = settingParams
  }

  get _settings() {
    return this.settings
  }

  set _settings(settings) {
    this.settings = settings
  }
}

function getProject() {
  return new Promise((resolve, reject) => {
    Request.get('api/cloudtools/project/').then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function postProject(res) {
  return new Promise((resolve, reject) => {
    Request.post('api/cloudtools/project/', res).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function putProject(id, res) {
  return new Promise((resolve, reject) => {
    const req = {
      name: res,
    }
    Request.put(`api/cloudtools/project/${id}/`, req).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function deleteProject(id, deleteCompletely) {
  return new Promise((resolve, reject) => {
    const req = {
      delete_completely: deleteCompletely,
    }
    Request.delete(`api/cloudtools/project/${id}/`, { data: req }).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getProjectInfo(id) {
  return new Promise((resolve, reject) => {
    Request.get(`api/cloudtools/project/${id}/`).then(
      res => {
        const data = res.body
        data.tools = data.tools.map(i => CloudTools.parseFromRestApi(i))
        resolve(data)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function postSetting(res) {
  return new Promise((resolve, reject) => {
    Request.post('api/cloudtools/setting/', res).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getSetting(id) {
  return new Promise((resolve, reject) => {
    Request.get(`api/cloudtools/setting/${id}/`).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function putSetting(id, req) {
  return new Promise((resolve, reject) => {
    Request.put(`api/cloudtools/setting/${id}/`, req).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function putProjectInfo(id) {
  return new Promise((resolve, reject) => {
    Request.put(`api/cloudtools/project/${id}/`).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function postCloudtools(res) {
  return new Promise((resolve, reject) => {
    Request.post('api/cloudtools/', res).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getInstance(id) {
  return new Promise((resolve, reject) => {
    Request.get(`api/cloudtools/instance/${id}/`).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getWorkspaceStatus(url) {
  return new Promise((resolve, reject) => {
    Request.get(url).then(
      res => {
        if (res.status === 200) {
          resolve('ready')
        } else {
          resolve()
        }
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function postShareUrl(res) {
  return new Promise((resolve, reject) => {
    Request.post('api/cloudtools/shareurl/', res).then(
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
  getProject,
  postProject,
  putProject,
  deleteProject,
  getProjectInfo,
  postSetting,
  getSetting,
  putSetting,
  putProjectInfo,
  postCloudtools,
  getInstance,
  getWorkspaceStatus,
  postShareUrl,
}
