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

// import 'ant-design-vue/dist/reset.css'
// import 'ant-design-vue/es/message/style/css'
import './assets/fonts/iconfont.css'
import './assets/theme/main.css'
import './assets/theme/index.css'

import { Base64 } from 'js-base64'
import { createApp, h, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'

import i18n, { T } from './i18n'
import store from './store'
import router from './router'
import Echarts from './assets/theme/echarts'
import Axios from './request/https'

import App from './App.vue'

import AuthService from '@/service/auth'
import AccessService from '@/service/access'

const app = createApp({
  provide() {
    return {
      resize: computed(() => this.windowResize),
    }
  },
  data() {
    return {
      updateImmediate: false,
      isCollapse: false,
      mainToolsVisible: false,
      windowResize: 0,
      echartsTheme: {
        common: 'default',
        nodeStatus: 'nodeStatus',
        nodegroupStatus: 'nodeGroupStatus',
        jobStatus: 'jobStatus',
        jobQueueStatus: 'jobQueueStatus',
        alert: 'alert',
      },
    }
  },
  watch: {
    isCollapse(val) {
      setTimeout(_ => {
        this.windowOnResize()
      }, 500)
    },
  },
  mounted() {
    this.refreshToken()
    window.removeEventListener('resize', this.windowOnResize)
    window.addEventListener('resize', this.windowOnResize)
  },
  beforeUnmount() {
    if (window.refreshTokenId > 0) {
      clearTimeout(window.refreshTokenId)
    }
    window.removeEventListener('resize', this.windowOnResize)
  },
  methods: {
    refreshToken() {
      if (window.refreshTokenId > 0) {
        clearTimeout(window.refreshTokenId)
      }
      const token = this.$store.state.auth.token
      if (token && token.length > 0) {
        AuthService.refreshToken().then(
          res => {
            window.refreshTokenId = setTimeout(this.refreshToken, 1000 * 60 * 10)
          },
          res => {
            console.log('Refresh token failed.', res)
            AuthService.logout()
            window.refreshTokenId = setTimeout(this.refreshToken, 1000 * 60 * 10)
          },
        )
      } else {
        window.refreshTokenId = setTimeout(this.refreshToken, 1000 * 60 * 10)
      }
    },
    windowOnResize() {
      this.windowResize++
      setTimeout(_ => {
        this.windowResize++
      }, 300)
    },
  },
  render: _ => h(App),
})
  .use(store)
  .use(i18n)
  .use(router)

app.config.globalProperties.$chart = Echarts
app.config.globalProperties.$message = message
app.config.globalProperties.$confirm = Modal.confirm
app.config.globalProperties.$success = Modal.success
app.config.globalProperties.$warning = Modal.warning
app.config.globalProperties.$error = Modal.error
app.config.globalProperties.$axios = Axios
app.config.globalProperties.$T = T

app.config.devtools = import.meta.env.DEV

app.config.errorHandler = (err, vm, info) => {
  console.log('[ERROR Msg]', err)
  console.log('[ERROR Node]', vm)
  console.log('[ERROR Info]', info)
}

window.Base64 = Base64
window.gApp = app.mount('#app')

window.asyncCallback = function () {
  window.async_flag = true
}

if (AuthService.isLogin() && AccessService.getSchedulerArch() === 'host') {
  window.startAsync(window.asyncCallback.bind({ username: 'demouser' }))
}
