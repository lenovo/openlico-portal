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

const GranularityEnums = ['fine', 'thread', 'core', 'tile']

const RunModeEnums = ['mpi', 'mpi+openmp']

const PinTypeEnums = ['all', 'allcores', 'allsocks']

const BindTypeEnums = ['compact', 'scatter']

const MpiOnlytypeEnums = ['bunch', 'scatter', 'spread', 'customize']

const ParamsMap = {
  openmp: [
    {
      label: 'granularity',
      requireKey: true,
    },
    { label: 'bind_type' },
    { label: 'permute' },
    { label: 'offset' },
  ],
  intelmpi: {
    mpi: [
      {
        label: 'procset',
        split: ':',
      },
      {
        label: 'map',
        requireKey: true,
        visible: "form.map!='customize'",
        undefinedValue: 'customize',
      },
      {
        label: 'grain',
        requireKey: true,
        visible: "form.map=='customize'",
      },
      {
        label: 'shift',
        requireKey: true,
        visible: "form.map=='customize'",
      },
      {
        label: 'preoffset',
        requireKey: true,
        visible: "form.map=='customize'",
      },
      {
        label: 'postoffset',
        requireKey: true,
        visible: "form.map=='customize'&&form.procset!='allsocks'",
      },
    ],
    'mpi+openmp': [
      {
        label: 'size',
        split: ':',
      },
      { label: 'layout' },
    ],
  },
}

const DefaultEnv = {
  openmp: 'KMP_AFFINITY',
  intelmpi: {
    mpi: ['I_MPI_PIN_PROCESSOR_LIST'],
    'mpi+openmp': ['I_MPI_PIN_DOMAIN', 'OMP_NUM_THREADS'],
  },
}

const TagPrefix = 'sys:affinity'

class Openmp {
  constructor() {
    this.id = 0
    this.name = ''
    this.mode = ''
    this.granularity = ''
    this.bind_type = ''
    this.permute = ''
    this.offset = ''
    this.envs = []
  }

  static parseFromRestApi(jsonObj) {
    const openmp = new Openmp()
    openmp._id = jsonObj.pk
    openmp._name = jsonObj.name
    const tag = getAffinityTag(jsonObj.tag)
    openmp._mode = tag.split('.').pop()
    if (openmp._mode === 'quick' && jsonObj.envs.length) {
      const env = jsonObj.envs.filter(i => i.name === DefaultEnv.openmp)[0]
      const val = env.value.split(',').filter(i => i !== 'verbose')
      for (let i = 0; i < ParamsMap.openmp.length; i++) {
        if (ParamsMap.openmp[i].requireKey) {
          openmp[`_${ParamsMap.openmp[i].label}`] = val[i].split('=').pop()
        } else {
          openmp[`_${ParamsMap.openmp[i].label}`] = val[i]
        }
      }
    }
    if (openmp._mode === 'advanced') {
      openmp._envs = jsonObj.envs
    }
    return openmp
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

  get _mode() {
    return this.mode
  }

  set _mode(mode) {
    this.mode = mode
  }

  get _granularity() {
    return this.granularity
  }

  set _granularity(granularity) {
    this.granularity = granularity
  }

  get _bind_type() {
    return this.bind_type
  }

  set _bind_type(bindType) {
    this.bind_type = bindType
  }

  get _permute() {
    return this.permute
  }

  set _permute(permute) {
    this.permute = permute
  }

  get _offset() {
    return this.offset
  }

  set _offset(offset) {
    this.offset = offset
  }

  get _envs() {
    return this.envs
  }

  set _envs(envs) {
    this.envs = envs
  }
}

class Intelmpi {
  constructor() {
    this.id = 0
    this.name = ''
    this.mode = ''
    this.run_mode = ''
    this.procset = ''
    this.map = 'bunch'
    this.grain = ''
    this.shift = ''
    this.preoffset = ''
    this.postoffset = ''
    this.size = ''
    this.layout = ''
  }

  static parseFromRestApi(jsonObj) {
    const intelmpi = new Intelmpi()
    intelmpi._id = jsonObj.pk
    intelmpi._name = jsonObj.name
    const tag = getAffinityTag(jsonObj.tag)
    intelmpi._mode = tag.split('.').pop()
    if (intelmpi._mode === 'quick' && jsonObj.envs.length) {
      const envMap = DefaultEnv.intelmpi
      const paramsMap = ParamsMap.intelmpi
      intelmpi._run_mode = jsonObj.envs.filter(i => envMap.mpi.includes(i.name))[0] ? 'mpi' : 'mpi+openmp'
      const env = jsonObj.envs.filter(i => {
        return envMap[intelmpi._run_mode].includes(i.name)
      })

      const val = env
        .map(i => i.value)
        .join(',')
        .replace(':', ',')
        .split(',')

      for (let i = 0; i < paramsMap[intelmpi._run_mode].length; i++) {
        const item = paramsMap[intelmpi._run_mode][i]
        if (item.requireKey) {
          const result = val.filter(i => new RegExp(`^${item.label}=.*$`).test(i))[0]
          if (result) {
            intelmpi[`_${item.label}`] = result.split('=').pop()
          } else if (item.undefinedValue) {
            intelmpi[`_${item.label}`] = item.undefinedValue
          }
        } else {
          intelmpi[`_${item.label}`] = val[i]
        }
      }
    }
    if (intelmpi._mode === 'advanced') {
      intelmpi._envs = jsonObj.envs
    }
    return intelmpi
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

  get _mode() {
    return this.mode
  }

  set _mode(mode) {
    this.mode = mode
  }

  get _run_mode() {
    return this.run_mode
  }

  set _run_mode(runMode) {
    this.run_mode = runMode
  }

  get _procset() {
    return this.procset
  }

  set _procset(procset) {
    this.procset = procset
  }

  get _map() {
    return this.map
  }

  set _map(map) {
    this.map = map
  }

  get _grain() {
    return this.grain
  }

  set _grain(grain) {
    this.grain = grain
  }

  get _shift() {
    return this.shift
  }

  set _shift(shift) {
    this.shift = shift
  }

  get _preoffset() {
    return this.preoffset
  }

  set _preoffset(preoffset) {
    this.preoffset = preoffset
  }

  get _postoffset() {
    return this.postoffset
  }

  set _postoffset(postoffset) {
    this.postoffset = postoffset
  }

  get _size() {
    return this.size
  }

  set _size(size) {
    this.size = size
  }

  get _layout() {
    return this.layout
  }

  set _layout(layout) {
    this.layout = layout
  }

  get _envs() {
    return this.envs
  }

  set _envs(envs) {
    this.envs = envs
  }
}

class Layout {
  constructor() {
    this.env = {}
    this.cpuInfo = []
    this.threadBind = []
  }

  static parseFromRestApi(jsonObj) {
    const layout = new Layout()
    layout._env = jsonObj.affinity_env
    layout._cpuInfo = jsonObj.cpuinfo
    layout._threadBind = jsonObj.bind

    return layout
  }

  get _env() {
    return this.env
  }

  set _env(env) {
    this.env = env
  }

  get _cpuInfo() {
    return this.cpuInfo
  }

  set _cpuInfo(cpuInfo) {
    this.cpuInfo = cpuInfo
  }

  get _threadBind() {
    return this.threadBind
  }

  set _threadBind(threadBind) {
    this.threadBind = threadBind
  }
}

function getAffinityTag(tags, tag = TagPrefix) {
  if (!tags) return false
  const result = tags.split(',').filter(i => i.split('.').includes(tag))[0]
  return result
}

function parseFromWebForm(form, type) {
  const data = {}
  let result = []
  data.name = form.name
  data.type = 'Affinity'
  data.modules = []
  data.scripts = []
  if (form.mode === 'advanced') {
    data.envs = form.envs.filter(i => i.name)
  } else {
    let env = []
    if (type === 'openmp') {
      result = ParamsMap.openmp.map(i => {
        if (i.requireKey) {
          return i.label + '=' + form[i.label]
        }
        if (i.visible) {
          // eslint-disable-next-line no-eval
          return eval(i.visible) ? form[i.label] : ''
        }
        return form[i.label]
      })
      env = [
        {
          name: DefaultEnv[type],
          value: ['verbose'].concat(result).join(','),
        },
      ]
    }
    if (type === 'intelmpi') {
      result = ParamsMap.intelmpi[form.run_mode].map(i => {
        let temp = ''
        const splitStr = i.split ? i.split : ','
        if (i.requireKey) {
          temp = i.label + '=' + form[i.label] + splitStr
        } else {
          temp = form[i.label] + splitStr
        }
        if (i.visible) {
          // eslint-disable-next-line no-eval
          return eval(i.visible) ? temp : ''
        }
        return temp
      })
      env = DefaultEnv.intelmpi[form.run_mode].map((el, index) => {
        let value = ''
        if (form.run_mode === 'mpi') {
          value = result
        } else {
          if (index === 0) {
            value = result
          } else {
            value = result.filter((r, i) => i === 0)
          }
        }
        return {
          name: el,
          value: value.join('').replace(/(,|:)$/, ''),
        }
      })
    }
    data.envs = env
  }

  data.tag = `${TagPrefix}.${type}.${form.mode}`
  return data
}

function getAffinityByRuntime(type) {
  return new Promise((resolve, reject) => {
    Request.get('/api/template/runtime/').then(
      res => {
        const data = res.body.data.filter(el => getAffinityTag(el.tag))
        resolve(
          data
            .filter(i => getAffinityTag(i.tag, type))
            .map(i => {
              if (type === 'openmp') {
                return Openmp.parseFromRestApi(i)
              }
              if (type === 'intelmpi') {
                return Intelmpi.parseFromRestApi(i)
              }
              return null
            }),
        )
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function createAffinitySettings(form, type) {
  return new Promise((resolve, reject) => {
    const req = parseFromWebForm(form, type)
    Request.post('/api/template/runtime/', req).then(
      res => {
        resolve(res.body.pk)
        // resolve(form.name)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function updateAffinitySettings(form, type) {
  return new Promise((resolve, reject) => {
    const req = parseFromWebForm(form, type)
    Request.put(`/api/template/runtime/${form.id}/`, req).then(
      res => {
        resolve()
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function deleteAffinitySettings(id) {
  return new Promise((resolve, reject) => {
    Request.delete(`/api/template/runtime/${id}/`).then(
      res => {
        resolve(true)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getOpenmpLayoutInfo(form, params) {
  const url = '/api/oneapi/openmp/bindInfo/'
  const data = {
    sockets_per_node: Number(params.socketsPerNode),
    cores_per_socket: Number(params.coresPerSocket),
    hyper_threading: params.hyperThreading,
    granularity: form.granularity,
    bind_type: form.bind_type,
    permute: Number(form.permute),
    offset: Number(form.offset),
  }
  return getAffinityLayout(url, data)
}

function getIntelmpiLayoutInfo(form, params) {
  const url = '/api/oneapi/intelmpi/bindInfo/'
  const data = {
    sockets_per_node: Number(params.socketsPerNode),
    cores_per_socket: Number(params.coresPerSocket),
    hyper_threading: params.hyperThreading,
    run_mode: form.run_mode,
    procset: form.procset,
    type: form.type,
    grain: Number(form.grain),
    shift: Number(form.shift),
    preoffset: Number(form.preoffset),
    postoffset: Number(form.postoffset),
    size: Number(form.size),
    layout: form.layout,
  }
  return getAffinityLayout(url, data)
}

function getAffinityLayout(url, req) {
  return new Promise((resolve, reject) => {
    Request.post(url, req).then(
      res => {
        resolve(Layout.parseFromRestApi(res.body))
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getNodeHardware(hostname) {
  return new Promise((resolve, reject) => {
    Request.get('/api/monitor/node/host/detail/', { params: { hostname } }).then(
      res => {
        const data = res.body.data
        resolve({
          socketsPerNode: data.cpu_socket_num,
          coresPerSocket: data.cpu_core_per_socket,
          hyperThreading: data.cpu_thread_per_core > 1,
        })
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

export default {
  GranularityEnums,
  RunModeEnums,
  PinTypeEnums,
  BindTypeEnums,
  MpiOnlytypeEnums,
  DefaultEnv,
  getAffinityTag,
  parseFromWebForm,
  getAffinityByRuntime,
  createAffinitySettings,
  updateAffinitySettings,
  deleteAffinitySettings,
  getOpenmpLayoutInfo,
  getIntelmpiLayoutInfo,
  getNodeHardware,
}
