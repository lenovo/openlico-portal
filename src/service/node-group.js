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
import Collection from '../common/collection'

class NodeGroup {
  constructor() {
    this.id = 0
    this.name = ''
  }

  static parseFromRestApi(jsonObj) {
    const group = new NodeGroup()
    group.id = jsonObj.id
    group.name = jsonObj.name
    return group
  }
}

function getAllNodeGroups() {
  function compareStrProp(strA, strB) {
    if (strA.name > strB.name) {
      return 1
    } else if (strA.name < strB.name) {
      return -1
    } else {
      return 0
    }
  }
  return new Promise((resolve, reject) => {
    Request.get('/api/cluster/nodegroup/').then(
      res => {
        const groups = []
        res.body.groups.forEach(obj => {
          groups.push(NodeGroup.parseFromRestApi(obj))
        })
        Collection.sortObjectsByProp(groups, 'name', 'asc', compareStrProp)
        resolve(groups)
      },
      res => {
        reject(res.body)
      },
    )
  })
}

export default {
  getAllNodeGroups,
}
