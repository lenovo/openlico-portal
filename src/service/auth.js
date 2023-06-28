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
import JWTDecode from 'jwt-decode'
import { Base64 } from 'js-base64'
import AccessService from './access'
import ErrorHandler from '../common/error-handler'
import store from '../storage/store'
import PreferenceService from './preference'

function login(username, password) {
  return new Promise((resolve, reject) => {
    const req = username + ':' + password
    const headers = {
      Authorization: 'basic-json',
    }
    Request.post('/api/user/login/', { token: Base64.encode(req) }, { headers }).then(
      res => {
        const token = res.body.token
        const info = JWTDecode(token)
        const role = info.role
        const availableAccess = AccessService.getAvailableAccessByRole(role)
        if (availableAccess.length > 0) {
          window.gApp.$store.dispatch('auth/login', {
            username: info.sub,
            userid: info.id,
            token,
            role,
            access: availableAccess[0],
            workspace: info.workspace,
          })
          window.gApp.$store.dispatch('settings/init')
          PreferenceService.init()
          resolve()
        } else {
          reject(new Error('No available access.'))
        }
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function refreshToken() {
  return new Promise((resolve, reject) => {
    Request.post('/api/user/login/').then(
      res => {
        const token = res.body.token
        const info = JWTDecode(token)
        const role = info.role
        const availableAccess = AccessService.getAvailableAccessByRole(role)
        if (availableAccess.length > 0) {
          window.gApp.$store.dispatch('auth/setToken', {
            username: info.sub,
            userid: info.id,
            token,
            role,
          })
          resolve()
        } else {
          reject(new Error('No available access.'))
        }
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function logout() {
  window.CloseTerminals()
  window.stopAsync()
  window.gApp.$store.dispatch('auth/logout')
  window.gApp.$store.dispatch('settings/setGResource', '[]')
  window.gApp.$router.push({ path: '/login' })
}

function isLogin() {
  const token = store.state.auth.token
  const role = store.state.auth.role
  const access = store.state.auth.access
  if (token === '' || role === '' || access === '') {
    return false
  } else {
    return true
  }
}

function changePassword(currentPassword, password) {
  return new Promise((resolve, reject) => {
    const req = {
      new_password: password,
      old_password: currentPassword,
    }
    Request.patch('/api/user/password/', req).then(
      res => {
        resolve()
        // resolve(User.parseFromRestApi(res.body));
      },
      res => {
        if (res.status === 401) {
          reject(window.gApp.$t('Auth.ChangePassword.Error.CurrentPassword'))
        } else {
          ErrorHandler.restApiErrorHandler(res, reject)
        }
      },
    )
  })
}

function checkConfig() {
  return new Promise((resolve, reject) => {
    const baseConfig = Request.get('/api/base/config/')
    const userConfig = Request.get('/api/user/config/')
    const jobsConfig = Request.get('/api/job/config/')
    const monitorConfig = Request.get('/api/monitor/config/')
    Promise.all([baseConfig, userConfig, jobsConfig, monitorConfig]).then(
      res => {
        // Setup feature codes
        const featureCodes = ['lico', 'hpc', 'ai']
        let clusterScheduler = 'sc.'
        if (res[0].body.arch === 'host') {
          clusterScheduler += 'host.'
          if (res[2].body.scheduler) {
            clusterScheduler += res[2].body.scheduler
          }
        }
        const monitor = res[3].body.targets.map(c => 'monitor.' + c)

        window.gApp.$store.dispatch('auth/setClusterName', {
          clusterName: res[0].body.domain || '',
        })
        window.gApp.$store.dispatch('auth/setLDAPManaged', {
          ldapManaged: res[1].body.use_libuser,
          ldapDefaultUsername: res[1].body.name,
        })

        // get oneapi modules
        Promise.all([getOneApiConfig()]).then(
          resp => {
            if (resp[0].status === 200 && resp[0].body.enable) {
              featureCodes.push('oneapi')
            }
            // setup featureCodes
            window.gApp.$store.dispatch('auth/setFeatureCodes', {
              featureCodes: featureCodes.concat(clusterScheduler, monitor),
            })
            // setup gresource
            Request.get('/api/accounting/config/').then(
              response => {
                const currency = response.body.billing.unit ? response.body.billing.unit.split(';') : ['$', '']
                const gResource = response.body.gres
                  ? JSON.stringify(
                      response.body.gres.map(i => ({
                        id: i.id,
                        code: i.code,
                        display_name: i.display_name,
                        unit: i.unit,
                        billing: i.billing,
                        create_time: i.create_time,
                      })),
                    )
                  : '[]'
                window.gApp.$store.dispatch('settings/setCurrency', currency)
                window.gApp.$store.dispatch('settings/setGResource', gResource)
                resolve()
              },
              err => {
                ErrorHandler.restApiErrorHandler(err, reject)
              },
            )
          },
          errp => {
            ErrorHandler.restApiErrorHandler(errp, reject)
          },
        )
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getOneApiConfig() {
  return new Promise((resolve, reject) => {
    Request.get('/api/oneapi/config/').then(
      res => {
        resolve(res)
      },
      err => {
        resolve(err)
        // ErrorHandler.restApiErrorHandler(err, reject);
      },
    )
  })
}

function isLDAPManaged() {
  return store.state.auth.ldapManaged
}

function checkRegisterType() {
  return new Promise((resolve, reject) => {
    Request.get('/api/config/user/').then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function register(req) {
  return new Promise((resolve, reject) => {
    Request.post('/api/register/', req).then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

export default {
  login,
  logout,
  isLogin,
  changePassword,
  checkConfig,
  isLDAPManaged,
  refreshToken,
  checkRegisterType,
  register,
}
