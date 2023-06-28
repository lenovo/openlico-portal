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

class Resource {
  constructor() {
    this.jobUsed = null // Percentage
    this.systemUsed = null // Percentage
    this.vacant = null // Percentage
    this.total = null // exact value
    this.allocated = null // exact value
    this.nonSchedulable = null // exact value
  }

  static parseFromRestApi(jsonObj) {
    const resource = new Resource()
    resource.total = jsonObj[0]
    resource.jobUsed = jsonObj[1]
    resource.allocated = jsonObj[2]
    resource.systemUsed = jsonObj[3]
    resource.nonSchedulable = jsonObj[4]
    const vacant = ((jsonObj[2] - (jsonObj[0] * jsonObj[1]) / 100) / jsonObj[0]) * 100
    resource.vacant = Number.isNaN(Math.max(vacant, 0)) ? 0 : Math.max(vacant, 0)
    return resource
  }
}

function getClusterNodesData(type, value, gResource) {
  const req = {
    filter_type: type || 'all',
    filter_value: type ? value : 'all',
  }
  return new Promise((resolve, reject) => {
    Request.get('/api/maintenance/nodes/resource/', { params: req }).then(
      res => {
        const nodes = []
        res.body.data.forEach(el => {
          const node = {}
          const props = Object.keys(el)
          for (let i = 0; i < props.length; i++) {
            const element = props[i]
            if (element !== 'hostname') {
              node[element] = Resource.parseFromRestApi(el[element])
            } else {
              node.hostname = el.hostname
            }
          }
          nodes.push(node)
        })
        const cpuOverView = {
          key: 'cpu',
          unit: window.gApp.$t('Monitor.Cluster.Cores'),
          total: 0,
          free: 0,
          name: window.gApp.$t('Monitor.Cluster.CPU'),
          exist: false,
        }
        const memoryOverView = {
          key: 'mem',
          unit: 'GB',
          total: 0,
          free: 0,
          name: window.gApp.$t('Monitor.Cluster.Memory'),
          exist: false,
        }
        const overViewData = [cpuOverView, memoryOverView]
        gResource.forEach(el => {
          const item = {
            key: el.code,
            unit: el.unit,
            total: 0,
            free: 0,
            name: el.display_name,
            exist: false,
          }
          overViewData.push(item)
        })
        overViewData.forEach(item => {
          item.jobUsed = 0
          item.allocated = 0
          item.systemUsed = 0
          item.vacant = 0
          item.nonSchedulable = 0
          nodes.forEach(el => {
            if (el[item.key]) {
              item.exist = Boolean(nodes.filter(e => e[item.key] && e[item.key].total !== null)[0])
              const resource = el[item.key]
              // overView Data
              // Calculate the total value
              const total = Number.isNaN(Number(resource.total)) ? 0 : Number(resource.total)
              item.total += total
              // jobUsed
              const jobUsed = Number.isNaN(Number(resource.jobUsed)) ? 0 : Number(resource.jobUsed)
              item.jobUsed += (total * jobUsed) / 100
              // allocated
              const allocated = Number.isNaN(Number(resource.allocated)) ? 0 : Number(resource.allocated)
              item.allocated += allocated
              // systemUsed
              const systemUsed = Number.isNaN(Number(resource.systemUsed)) ? 0 : Number(resource.systemUsed)
              item.systemUsed += (total * systemUsed) / 100
              // nonSchedulable
              const nonSchedulable = Number.isNaN(Number(resource.nonSchedulable)) ? 0 : Number(resource.nonSchedulable)
              item.nonSchedulable += nonSchedulable
              // free
              item.free += total - allocated - nonSchedulable
              item.vacant += allocated - (total * jobUsed) / 100
            }
          })
          item.free = Number(item.free.toFixed(2))
          item.total = Number(item.total.toFixed(2))
          item.vacant = (item.vacant / item.total) * 100
          item.vacant = Number.isNaN(Math.max(item.vacant, 0)) ? 0 : Math.max(item.vacant, 0)
          item.jobUsed = (item.jobUsed / item.total) * 100
          item.systemUsed = (item.systemUsed / item.total) * 100
        })
        resolve({
          overViewData,
          nodes,
        })
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

export default {
  getClusterNodesData,
}
