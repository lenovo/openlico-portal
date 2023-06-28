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

import Format from '../common/format'

class Monitor {
  constructor(type, used, total) {
    const map = displayMap.filter(i => i.key === type)[0]
    this.type = type
    this.used = used
    this.total = total
    this.u_unit = ''
    this.t_unit = map.unit || ''
    this.icon = map.icon
    this.rate = map.rate
    this.group = map.group || false
    this.groupData = false
  }

  getDisplay(num = 1) {
    let used = this.used
    let total = this.total
    let value = ''
    if (this.total === null) return null
    if (this.format) {
      const data = this.format()
      used = Number(data.used)
      total = Number(data.total)
    }
    if (used % 1 !== 0) used = used.toFixed(num)
    if (total % 1 !== 0) total = total.toFixed(num)
    if (this.used !== null) {
      value = `${used}${this.u_unit ? ' ' + this.u_unit : ''}/`
    }
    return `${value}${total}${this.t_unit ? ' ' + this.t_unit : ''}`
  }

  getUtil(num = 2, unit = '%') {
    if (this.total === null || this.used === null) return null
    if (this.used === 0) return 0 + unit
    if (this.total === 0) return 100 + unit
    const util = (this.used / this.total) * 100
    if (util % 1 === 0) return util + unit
    return util.toFixed(num) + unit
  }

  get isShow() {
    return this.total !== null && this.used !== null
  }

  get display() {
    return this.getDisplay()
  }

  get util() {
    return this.getUtil()
  }
}

class Cpu extends Monitor {}

class Storage extends Monitor {
  format() {
    const formatUsed = Format.formatByteSize(this.used * this.rate).split(' ')
    const formatTotal = Format.formatByteSize(this.total * this.rate).split(' ')
    const used = formatUsed[0]
    const total = formatTotal[0]
    this.t_unit = formatTotal[1]
    if (formatUsed[1] !== formatTotal[1]) this.u_unit = formatUsed[1]
    return { used, total }
  }
}
class Network extends Monitor {
  constructor(i, o) {
    super('Net')
    this.in = i === null ? null : Format.formatByteSize(i * this.rate)
    this.out = o === null ? null : Format.formatByteSize(o * this.rate)
  }

  get isShow() {
    return this.in !== null && this.out !== null
  }
}
const displayCount = 4
const displayMap = [
  {
    dataType: 'processors',
    key: 'Cpu',
    Class: Cpu,
    icon: 'cpu',
  },
  {
    dataType: 'gpu',
    key: 'Gpu',
    Class: Cpu,
    icon: 'GPU',
    group: 'Cpu',
  },
  {
    dataType: 'memory',
    key: 'Ram',
    Class: Storage,
    icon: 'memory',
    rate: Math.pow(2, 10),
  },
  {
    dataType: 'diskspace',
    key: 'Disk',
    Class: Storage,
    icon: 'storage',
    rate: Math.pow(2, 30),
  },
  {
    key: 'Net',
    Class: Network,
    icon: 'network',
    rate: Math.pow(2, 20),
  },
]
// const monitorList = ['monitor', 'scheduler', 'lico']
// const currentLevel = [...monitorList].reverse().map((e, i) => Object.assign({}, { key: e, index: i }))
// const totalLevel = monitorList.map((e, i) => Object.assign({}, { key: e, index: i }))

export function parseHardwareData(res) {
  const data = displayMap.map(item => {
    if (item.key === 'Net') {
      const netIn = !res.throughput ? null : res.throughput.in + res.ib.in
      const netOut = !res.throughput ? null : res.throughput.out + res.ib.out
      return new item.Class(netIn, netOut)
    } else {
      const temp = res[item.dataType]
      return new item.Class(item.key, temp ? temp.used : null, temp ? temp.total : null)
    }
  })

  let result = []
  let mergeList = []
  const vaildData = data.filter(i => i.isShow)
  const invaildData = data.filter(i => !i.isShow)
  if (vaildData.length === displayCount) return vaildData
  if (vaildData.length < displayCount) {
    const temp = vaildData.concat(invaildData).slice(0, displayCount)
    displayMap.forEach(item => {
      const monitor = temp.filter(i => i.type === item.key)[0]
      if (monitor) {
        result.push(monitor)
      }
    })
  }
  if (vaildData.length > displayCount) {
    result = vaildData.filter(i => !i.group)
    mergeList = vaildData.filter(i => i.group)
    if (mergeList.length > 0) {
      result = result.map(item => {
        const merge = mergeList.filter(i => i.group === item.type)[0]
        if (merge) item.groupData = merge
        return item
      })
    }
  }
  return result
}
