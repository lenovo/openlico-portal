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

import mainInnerRoute from './main-inner-route'

let Routes = [
  {
    path: '/',
    name: '/',
    meta: {
      auth: false,
    },
    component: _ => import('@/view/login.vue'),
  },
  {
    path: '/login',
    name: 'login',
    meta: {
      auth: false,
    },
    component: _ => import('@/view/login.vue'),
  },
  {
    path: '/main',
    name: 'main',
    meta: {
      auth: true,
      access: ['admin', 'operator', 'staff'],
    },
    component: _ => import('@/view/main.vue'),
    children: [].concat(mainInnerRoute),
  },
]

try {
  const res = import.meta.globEager('./commercial/*.js')
  if (Object.keys(res).length) {
    let valued = []
    for (const key in res) {
      valued = valued.concat(res[key].default)
    }
    const routes = Routes.map(item => {
      const children = valued.filter(i => item.name === i.parent)
      if (item.children) {
        item.children = item.children.concat(children)
      } else {
        item.children = children
      }
      return item
    })
    Routes = routes.concat(valued.filter(i => i.parent === undefined))
  }
} catch (error) {
  // nothing
}

export default Routes
