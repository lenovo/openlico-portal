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
import Parser from '../common/parser'
import Format from '../common/format'
import { v1 as uuidv1 } from 'uuid'
import TableDataFetcherFactory from '../common/table-data-fetcher-factory'
import ErrorHandler from '../common/error-handler'
import AfffinityService from './job-template-affiity'
const nameSpace = '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0'

const oneapiIconPath = '/static/img/system/runtime/oneapi_1.png'
const runtimeIconPath = '/static/img/system/runtime/regular.png'

class Runtime {
  constructor() {
    this.id = 0
    this.name = ''
    this.tag = ''
    this.createTime = null
    this.items = null
    this.count = 0
    this.envs = null
    this.scripts = []
    this.type = ''
  }

  static parseFromRestApi(jsonObj) {
    const runtime = new Runtime()
    runtime._id = jsonObj.pk
    runtime._name = jsonObj.name
    runtime._tag = jsonObj.tag || ''
    runtime._createTime = jsonObj.ctime ? Format.formatDateTime(Parser.parseTimeFromRestApi(jsonObj.ctime)) : null
    runtime._items = jsonObj.modules ? jsonObj.modules : null
    runtime._count = jsonObj.modules ? jsonObj.modules.length : 0
    runtime._envs = jsonObj.envs ? jsonObj.envs : null
    runtime._scripts =
      jsonObj.scripts && jsonObj.scripts.length
        ? jsonObj.scripts.map(i => {
            return { path: Format.formatMyFolder(i) }
          })
        : []
    runtime._type = jsonObj.username ? 'Private' : 'System'
    return runtime
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

  get _tag() {
    return this.tag
  }

  set _tag(tag) {
    return (this.tag = tag)
  }

  get _createTime() {
    return this.createTime
  }

  set _createTime(createTime) {
    return (this.createTime = createTime)
  }

  get _items() {
    return this.items
  }

  set _items(items) {
    return (this.items = items)
  }

  get _count() {
    return this.count
  }

  set _count(count) {
    return (this.count = count)
  }

  get _envs() {
    return this.envs
  }

  set _envs(envs) {
    return (this.envs = envs)
  }

  get _scripts() {
    return this.scripts
  }

  set _scripts(scripts) {
    return (this.scripts = scripts)
  }

  get _type() {
    return this.type
  }

  set _type(type) {
    return (this.type = type)
  }
}

class Module {
  constructor() {
    this.name = ''
    this.items = null
    this.displayName = ''
    this.code = uuidv1()
    this.iconPath = ''
    this.show = true
  }

  static parseFromRestApi(jsonObj) {
    const module = new Module()
    module._name = jsonObj.name
    module._items = jsonObj.items ? jsonObj.items : null
    module._displayName = jsonObj.name
    module._iconPath = jsonObj.iconPath ? jsonObj.iconPath : ''
    return module
  }

  get _name() {
    return this.name
  }

  set _name(name) {
    return (this.name = name)
  }

  get _items() {
    return this.items
  }

  set _items(items) {
    return (this.items = items)
  }

  get _displayName() {
    return this.displayName
  }

  set _displayName(displayName) {
    return (this.displayName = displayName)
  }

  get _code() {
    return this.code
  }

  set _code(code) {
    return (this.code = code)
  }

  get _iconPath() {
    return this.iconPath
  }

  set _iconPath(iconPath) {
    return (this.iconPath = iconPath)
  }
}

class ModuleItem {
  constructor() {
    this.name = ''
    this.version = ''
    this.path = ''
    this.category = ''
    this.description = ''
    this.parents = []
    this.displayName = ''
    this.code = uuidv1()
    this.moduleTag = ''
    this.parentName = ''
  }

  static parseFromRestApi(jsonObj) {
    const moduleItem = new ModuleItem()
    moduleItem._name = jsonObj.name
    moduleItem._parentName = jsonObj.parentName
    moduleItem._version = jsonObj.version ? jsonObj.version : ''
    moduleItem._path = jsonObj.path ? jsonObj.path : ''
    moduleItem._category = jsonObj.category ? jsonObj.category : ''
    moduleItem._description = jsonObj.description ? jsonObj.description : ''
    moduleItem._parents = jsonObj.parents
    moduleItem._displayName =
      jsonObj.parents && jsonObj.parents.length > 0
        ? jsonObj.name + nameSpace + jsonObj.parents.join(',')
        : jsonObj.name
    moduleItem._moduleTag = jsonObj.moduleTag ? jsonObj.moduleTag : ''

    return moduleItem
  }

  get _name() {
    return this.name
  }

  set _name(name) {
    return (this.name = name)
  }

  get _version() {
    return this.version
  }

  set _version(version) {
    return (this.version = version)
  }

  get _path() {
    return this.path
  }

  set _path(path) {
    return (this.path = path)
  }

  get _category() {
    return this.category
  }

  set _category(category) {
    return (this.category = category)
  }

  get _description() {
    return this.description
  }

  set _description(description) {
    return (this.description = description)
  }

  get _parents() {
    return this.parents
  }

  set _parents(parents) {
    return (this.parents = parents)
  }

  get _displayName() {
    return this.displayName
  }

  set _displayName(displayName) {
    return (this.displayName = displayName)
  }

  get _code() {
    return this.code
  }

  set _code(code) {
    return (this.code = code)
  }

  get _moduleTag() {
    return this.moduleTag
  }

  set _moduleTag(moduleTag) {
    return (this.moduleTag = moduleTag)
  }

  get _parentName() {
    return this.parentName
  }

  set _parentName(parentName) {
    return (this.parentName = parentName)
  }
}

function runtimeTableDataParser(res) {
  const runtimes = []
  res.data.forEach(item => {
    runtimes.push(Runtime.parseFromRestApi(item))
  })
  return {
    data: runtimes.filter(i => !AfffinityService.getAffinityTag(i.tag)),
  }
}

function getRuntimesTableDataFetcher() {
  const access = window.gApp.$store.state.auth.access
  return TableDataFetcherFactory.createLocalPagingFetcher(
    `/api/template/runtime/${access !== 'staff' ? '?role=admin' : ''}`,
    runtimeTableDataParser,
    'data',
  )
}

function listModules() {
  return new Promise((resolve, reject) => {
    Request.get('/api/template/modules/').then(
      res => {
        getIntelModuleName().then(response => {
          const intelModuleNames = response
          const modules = []
          res.body.forEach(obj => {
            const tempItems = []
            obj.items.forEach(item => {
              item.parentName = obj.name
              tempItems.push(ModuleItem.parseFromRestApi(item))
            })
            obj.items = tempItems
            modules.push(Module.parseFromRestApi(obj))
          })
          modules.forEach(obj => {
            if (obj.items && obj.items.length === 1) {
              if (obj.items[0].version !== '') {
                const tempFirstItem = new ModuleItem()
                tempFirstItem.name = obj.name
                tempFirstItem.displayName = obj.name
                tempFirstItem.parentName = obj.name
                obj.items.unshift(tempFirstItem)
              }
            }

            if (intelModuleNames.includes(obj.name)) {
              obj.iconPath = oneapiIconPath
              obj.items.forEach(item => {
                item.moduleTag = 'intel'
              })
            } else {
              obj.iconPath = runtimeIconPath
            }
          })
          resolve(modules)
        })
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function verifyModule(modules) {
  return new Promise((resolve, reject) => {
    const result = []
    modules.forEach(item => {
      result.push(item.name)
    })
    Request.post('/api/template/modules/verify/', { modules: result }).then(
      res => {
        resolve(res)
      },
      res => {
        reject(res)
      },
    )
  })
}

function getIntelModuleName() {
  return new Promise((resolve, reject) => {
    if (!window.gApp.$store.state.auth.featureCodes.includes('oneapi')) {
      resolve([])
      return
    }
    Request.get('/api/oneapi/intel/modules/').then(
      res => {
        resolve(eval(res.body)) // eslint-disable-line no-eval
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function listRuntime() {
  return new Promise((resolve, reject) => {
    Request.get('/api/template/runtime/').then(
      res => {
        const runtimes = []
        res.body.data.forEach(obj => {
          if (!AfffinityService.getAffinityTag(obj.tag)) {
            runtimes.push(Runtime.parseFromRestApi(obj))
          }
        })
        resolve(runtimes)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function verifyRuntime(id) {
  return new Promise((resolve, reject) => {
    Request.post(`/api/template/runtime/verify/${id}/`).then(
      res => {
        resolve(res)
      },
      res => {
        reject(res)
      },
    )
  })
}

function getRuntime(id) {
  return new Promise((resolve, reject) => {
    Request.get(`/api/template/runtime/${id}/`).then(
      res => {
        getIntelModuleName().then(response => {
          const runtime = Runtime.parseFromRestApi(res.body)
          const intelModuleNames = response
          runtime.items.forEach(obj => {
            const moduleName = obj.module.split('/')[0]
            if (intelModuleNames.includes(moduleName)) {
              obj.moduleTag = 'intel'
            }
          })
          resolve(runtime)
        })
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function createRuntime(name, modules, envs, scripts, tag = '', access) {
  const moduleItems = []
  modules.forEach(obj => {
    const result = {
      module: obj.name,
      parents: obj.parents,
    }
    moduleItems.push(result)
  })
  return new Promise((resolve, reject) => {
    const req = {
      name,
      modules: moduleItems,
      envs,
      scripts: scripts.filter(i => i.path).map(i => Format.formatWorkspace(i.path)),
      tag,
    }
    Request.post(`/api/template/runtime/${access !== 'staff' ? '?role=admin' : ''}`, req).then(
      res => {
        resolve(Runtime.parseFromRestApi(res.body))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function updateRuntime(id, name, modules, envs, scripts, tag = '') {
  const moduleItems = []
  modules.forEach(obj => {
    const result = {
      module: obj.name,
      parents: obj.parents,
    }
    moduleItems.push(result)
  })
  return new Promise((resolve, reject) => {
    const req = {
      name,
      modules: moduleItems,
      envs,
      scripts: scripts.filter(i => i.path).map(i => Format.formatWorkspace(i.path)),
      tag,
    }
    Request.put(`/api/template/runtime/${id}/`, req).then(
      res => {
        resolve(Runtime.parseFromRestApi(res.body))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function deleteRuntime(id) {
  return new Promise((resolve, reject) => {
    Request.delete(`/api/template/runtime/${id}/`).then(
      res => {
        const runtime = new Runtime()
        runtime.id = id
        resolve(runtime)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function findModuleIndex(module, modules) {
  let result = -1
  modules.forEach(function (item, index) {
    if (module.displayName === item.displayName) {
      result = index
    }
  })
  return result
}

function findEnvIndex(env, envs) {
  let result = -1
  envs.forEach(function (item, index) {
    if (env.name === item.name) {
      result = index
    }
  })
  return result
}

function imgSet(showCondition) {
  if (showCondition) {
    return oneapiIconPath
  }
  return runtimeIconPath
}

function getTemplateRuntimeInfo(idList) {
  return new Promise((resolve, reject) => {
    const req = {
      runtime_ids: JSON.stringify(idList),
    }
    Request.get('/api/template/runtime/details/', { params: req }).then(
      res => {
        let { modules, envs, scripts } = res.body
        getIntelModuleName().then(
          resp => {
            modules = modules.map(item => {
              if (resp.includes(item.module.split('/')[0])) {
                item.moduleTag = 'intel'
              }
              return item
            })
            scripts = scripts.map(i => ({ path: i.filename }))
            resolve({ modules, envs, scripts })
          },
          error => {
            reject(error)
          },
        )
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

export default {
  nameSpace,
  oneapiIconPath,
  runtimeIconPath,
  ModuleItem,
  listModules,
  verifyModule,
  getIntelModuleName,
  listRuntime,
  verifyRuntime,
  getRuntimesTableDataFetcher,
  getRuntime,
  createRuntime,
  updateRuntime,
  deleteRuntime,
  findModuleIndex,
  findEnvIndex,
  imgSet,
  getTemplateRuntimeInfo,
}
