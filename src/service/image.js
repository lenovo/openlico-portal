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
import TableDataFetcherFactory from '../common/table-data-fetcher-factory'
import ErrorHandler from '../common/error-handler'
import FormatHandler from '../common/format'
import Parser from '../common/parser'

const imageStatusEnums = ['waiting', 'uploading', 'success', 'failure']
const FrameworkTypeSingularity = [
  'tensorflow',
  'tensorflow2',
  'caffe',
  'intel-caffe',
  'mxnet',
  'neon',
  'letrain',
  'chainer',
  'jupyter',
  'pytorch',
  'scikit',
  'tensorrt',
  'rstudio',
  'paddlepaddle',
  'other',
]
// const imageBuildStatus = {
//   pending: 'pending',
//   running: 'running',
//   completed: 'completed',
//   failed: 'failed',
// }

const imageSuffix = '.sif'

// Build image source file options
const buildSourceOptions = [
  { label: 'Registry', index: 1 }, // Docker registry
  { label: 'Library', index: 2 }, // Singularity library
  { label: 'Def', index: 3 }, // Singularity definition file
  { label: 'System', index: 4 },
  { label: 'Private', index: 5 },
]

class Image {
  constructor() {
    this.id = 0
    this.name = ''
    this.status = ''
    this.version = ''
    this.framework = ''
    this.tags = []
    this.description = ''
    this.username = ''
    this.imagePath = ''
  }

  static parseFromRestApi(jsonObj) {
    const image = new Image()
    image._id = jsonObj.id
    image._name = jsonObj.name
    image._status = imageStatusEnums[jsonObj.status]
    image._framework = jsonObj.framework
    image._version = jsonObj.version
    image._tags = jsonObj.tags
    image._description = jsonObj.description
    image._username = jsonObj.username ? jsonObj.username : ''
    image._imagePath = jsonObj.image_path
    return image
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

  get _status() {
    return this.status
  }

  set _status(status) {
    return (this.status = status)
  }

  get _version() {
    return this.version
  }

  set _version(version) {
    return (this.version = version)
  }

  get _framework() {
    return this.framework
  }

  set _framework(framework) {
    return (this.framework = framework)
  }

  get _tags() {
    return this.tags
  }

  set _tags(tags) {
    return (this.tags = tags)
  }

  get _description() {
    return this.description
  }

  set _description(description) {
    return (this.description = description)
  }

  get _username() {
    return this.username
  }

  set _username(username) {
    return (this.username = username)
  }

  get _imagePath() {
    return this.imagePath
  }

  set _imagePath(imagePath) {
    return (this.imagePath = imagePath)
  }
}

class ImageBuild {
  constructor() {
    this.name = ''
    this.workspace = ''
    this.source = 1
    this.imagePath = ''
    this.definitionFile = ''
    this.enableHttps = true
    this.logFile = ''
    this.docker = {
      username: '',
      password: '',
    }
    this.pythonLibs = ''
    this.pipCommand = 'pip'
    this.startTime = ''
  }

  static parseFromRestApi(jsonObj) {
    const build = new ImageBuild()
    build.name = jsonObj.name.slice(0, jsonObj.name.lastIndexOf(imageSuffix))
    build.workspace = jsonObj.workspace ? FormatHandler.formatMyFolder(jsonObj.workspace) : 'MyFolder'
    build.source = jsonObj.source
    build.imagePath = jsonObj.image_path
    build.definitionFile = jsonObj.definition_file ? FormatHandler.formatMyFolder(jsonObj.definition_file) : ''
    build.enableHttps = jsonObj.use_https
    build.logFile = jsonObj.log_file
    build.docker = {
      username: jsonObj.docker ? jsonObj.docker.username : '',
      password: jsonObj.docker ? window.Base64.decode(jsonObj.docker.password) : '',
    }
    if (jsonObj.packages) {
      build.packages = {
        pythonLibs: jsonObj.packages.libraries,
        pipCommand: jsonObj.packages.command,
      }
    }
    build.startTime = Parser.parseTimeFromRestApi(jsonObj.create_time)
    return build
  }
}

function imagesTableDataParser(res) {
  const images = []
  res.data.forEach(item => {
    images.push(Image.parseFromRestApi(item))
  })
  return {
    data: images,
  }
}

function getImagesTableDataFetcher(access) {
  return TableDataFetcherFactory.createLocalPagingFetcher(
    `/api/container/${access === 'admin' ? 'system/' : ''}`,
    imagesTableDataParser,
    'data',
  )
}

function getAllImages(data) {
  return new Promise((resolve, reject) => {
    const req = data
      ? {
          framework: JSON.stringify(data.framework ? data.framework.split(',') : []),
          tags: JSON.stringify(data.tags),
        }
      : {}
    Request.get('/api/container/', { params: req }).then(
      res => {
        const images = []
        res.body.data.forEach(obj => {
          images.push(Image.parseFromRestApi(obj))
        })
        resolve(images)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getImageById(id) {
  return new Promise((resolve, reject) => {
    Request.get(`/api/container/${id}/`).then(
      res => {
        resolve(Image.parseFromRestApi(res.body))
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function createImage(name, filePath, dockerImagePath, description, framework, version, tag, target, access) {
  return new Promise((resolve, reject) => {
    const req = {
      name,
      framework,
    }
    /* eslint-disable no-unused-expressions */
    filePath ? (req.file_path = filePath) : ''
    dockerImagePath ? (req.image_path = dockerImagePath) : ''
    target ? (req.target = target) : ''
    description ? (req.description = description) : ''
    version ? (req.version = version) : ''
    tag.length > 0 ? (req.tags = tag) : []
    /* eslint-enable no-unused-expressions */
    Request.post(`/api/container/${access === 'admin' ? 'system/' : ''}`, req).then(
      res => {
        resolve(res.body.data)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function deleteImage(id) {
  return new Promise((resolve, reject) => {
    const req = {
      id,
    }
    Request.delete(`/api/container/${id}/`, req).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function downloadImage(id, name, target) {
  const req = {
    name,
    target,
  }
  return new Promise((resolve, reject) => {
    Request.post(`/api/container/download/${id}/`, req).then(
      res => {
        resolve(res.body.data)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function checkImage(filename, access) {
  const system = access === 'admin' ? 'system/' : 'private/'
  return new Promise((resolve, reject) => {
    Request.get(`/api/container/ensure/${system}${filename}/`).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function imageReupload(id, path) {
  const req = {
    file_path: path,
  }
  return new Promise((resolve, reject) => {
    Request.put(`/api/container/reupload/${id}/`, req).then(
      res => {
        resolve()
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function editImage(id, dockerImagePath, version, tag, description) {
  const req = {}
  /* eslint-disable no-unused-expressions */
  dockerImagePath ? (req.image_path = dockerImagePath) : ''
  description ? (req.description = description) : ''
  version ? (req.version = version) : ''
  tag.length > 0 ? (req.tags = tag) : []
  /* eslint-enable no-unused-expressions */
  return new Promise((resolve, reject) => {
    Request.put(`/api/container/${id}/`, req).then(
      res => {
        resolve()
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getBuildInfo() {
  return new Promise((resolve, reject) => {
    Request.get('/api/container/build/').then(
      res => {
        if (Object.getOwnPropertyNames(res.body) === 0) {
          resolve(new ImageBuild())
        } else {
          resolve(ImageBuild.parseFromRestApi(res.body))
        }
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getBuildStatus() {
  return new Promise((resolve, reject) => {
    // static/data/image-build-status.json
    Request.get('/api/container/build/state/').then(
      res => {
        resolve(res.body.status)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function startBuild(name, workspace, source, imagePath, definitionFile, username, passwd, enableHttps, packages) {
  const req = {
    name: name + imageSuffix,
    workspace: FormatHandler.formatWorkspace(workspace),
    source,
  }
  /* eslint-disable no-unused-expressions */
  source !== 3 ? (req.image_path = imagePath) : ''
  source === 3 ? (req.definition_file = FormatHandler.formatWorkspace(definitionFile)) : ''
  /* eslint-enable no-unused-expressions */
  if ((source === 1 || source === 3) && !!username && !!passwd) {
    req.docker = {
      username,
      password: window.Base64.encode(passwd),
    }
  }
  if ([1, 3].includes(source)) {
    req.use_https = enableHttps
  }
  if (packages.pythonLibs) {
    req.packages = {}
    req.packages.libraries = packages.pythonLibs
    req.packages.command = packages.pipCommand
  }
  return new Promise((resolve, reject) => {
    Request.post('/api/container/build/', req).then(
      res => {
        resolve(res)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function cancelBuild() {
  return new Promise((resolve, reject) => {
    Request.put('/api/container/build/').then(
      res => {
        resolve(res)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function isImageFileExist(imagePath) {
  return new Promise((resolve, reject) => {
    Request.post('/api/container/build/ensure/', {
      image_path: FormatHandler.formatWorkspace(imagePath),
    }).then(
      res => {
        resolve(res.body.exists)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

export default {
  FrameworkTypeSingularity,
  getImagesTableDataFetcher,
  getAllImages,
  getImageById,
  createImage,
  deleteImage,
  downloadImage,
  checkImage,
  imageReupload,
  editImage,
  getBuildInfo,
  getBuildStatus,
  startBuild,
  cancelBuild,
  isImageFileExist,
  imageSuffix,
  buildSourceOptions,
}
