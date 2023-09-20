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

import Vue from 'vue'
import VueRouter from 'vue-router'
import VueI18n from 'vue-i18n'
import Antd from 'ant-design-vue'

import 'ant-design-vue/dist/antd.css'
import './assets/fonts/iconfont.css'
import './assets/theme/main.css'
import './/assets/theme/index.less'

import store from './storage/store'
import routes from './router/route'
import messages from './locale/message'

import { Base64 } from 'js-base64'
import ECharts from './assets/theme/echarts'

import AuthService from './service/auth'
import AccessService from './service/access'
import FileManageService from './service/file-manager'
// import ECharts theme
import App from './App.vue'
import axios from './request/https'

Vue.config.productionTip = false

Vue.use(VueRouter)
Vue.use(VueI18n)
Vue.use(Antd)
// Vue.use()

Vue.$echarts = ECharts

// Init locale
const browserLang = (navigator.language || navigator.browserLanguage).toLowerCase()
let langCode = 'en'
if (browserLang.indexOf('zh') >= 0) {
  langCode = 'zh'
}

const i18n = new VueI18n({
  locale: langCode,
  messages,
})

// Init router
const router = new VueRouter({
  mode: 'hash',
  routes,
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

// Init storage
store.dispatch('auth/init')

window.Base64 = Base64
// window.Echart = EChart;
window.gApp = new Vue({
  el: '#app',
  i18n,
  store,
  router,
  data: {
    // The change flag of the detail page of the keepAlive page
    updateImmediate: false,
    isCollapse: false,
    mainToolsVisible: false,
    echartsTheme: {
      common: 'default',
      nodeStatus: 'nodeStatus',
      nodegroupStatus: 'nodeGroupStatus',
      jobStatus: 'jobStatus',
      jobQueueStatus: 'jobQueueStatus',
      alert: 'alert',
    },
  },
  beforeDestroy() {
    if (window.refreshTokenId > 0) {
      clearTimeout(window.refreshTokenId)
    }
  },
  render: h => h(App),
})

Vue.prototype.$axios = axios
window.gApp.$axios = Vue.prototype.$axios

// Start async service for Confluent termwindow
window.asyncCallback = function () {
  window.async_flag = true
}
if (AuthService.isLogin() && AccessService.getSchedulerArch() === 'host') {
  window.startAsync(window.asyncCallback.bind({ username: 'demouser' }))
}

// Refresh Token Daemon
function refreshToken() {
  if (window.refreshTokenId > 0) {
    clearTimeout(window.refreshTokenId)
  }
  const token = window.gApp.$store.state.auth.token
  if (token && token.length > 0) {
    AuthService.refreshToken().then(
      res => {
        window.refreshTokenId = setTimeout(refreshToken, 1000 * 60 * 10)
      },
      res => {
        console.log('Refresh token failed.', res)
        AuthService.logout()
        window.refreshTokenId = setTimeout(refreshToken, 1000 * 60 * 10)
      },
    )
  } else {
    window.refreshTokenId = setTimeout(refreshToken, 1000 * 60 * 10)
  }
}
refreshToken()
