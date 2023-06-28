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

import Admin from './admin'
import Operator from './operator'
import Staff from './staff'

function formatMenu(menu) {
  for (let i = 0; i < menu.length; i++) {
    fillMenuProperties(menu[i])
  }
  return menu
}

function fillMenuProperties(menu) {
  if (menu.children) {
    for (let i = 0; i < menu.children.length; i++) {
      fillMenuProperties(menu.children[i])
    }
  } else {
    menu.children = []
  }
}

function compareWithMenuPath(menuRoute, routePath, routeName) {
  let detailPath = menuRoute.path
  if (menuRoute.param) {
    detailPath += '/'
  }
  if (menuRoute.type === routeName) {
    return true
  }
  if (routePath.indexOf(detailPath) === 0) {
    return true
  }
  return false
}

export default {
  admin: formatMenu(Admin),
  operator: formatMenu(Operator),
  staff: formatMenu(Staff),
  compareWithMenuPath,
}
