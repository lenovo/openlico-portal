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

import { createRouter, createWebHashHistory } from 'vue-router'
import Routes from './route'

import AuthService from '../service/auth'
import AccessService from '../service/access'
import FileManageService from '../service/file-manager'

const router = createRouter({
  history: createWebHashHistory(),
  routes: Routes,
})

// Handle before route, need check auth information.
router.beforeEach((to, from, next) => {
  if (to.meta.auth && !AuthService.isLogin()) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
    return
  }

  AccessService.checkUrlByAccess(to).then(
    res => {
      next()
    },
    err => {
      next({ path: '/main' })
      window.gApp.$message.warning(err)
    },
  )
})

// Handle after route
router.afterEach((to, from) => {
  FileManageService.clearRecentSelectedPath()
  // Nothing to do
})

export default router
