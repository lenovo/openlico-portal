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

import AuthService from '../service/auth'
import Format from './format'

function restApiErrorHandler(res, reject) {
  if (res.status >= 400 && res.status < 500) {
    if (res.body.errid) {
      if (res.body.errid === '2013') {
        if (res.body.detail) {
          if (res.body.detail.remain_time) {
            const tryAfterTime = Format.formatDuration(res.body.detail.remain_time, 'login_after_time')
            if (tryAfterTime.split(',').length >= 3 && parseInt(tryAfterTime.split(',')[0]) >= 12) {
              reject(window.gApp.$t('Error.2013.Ban.Long'))
            }
            reject(
              window.gApp.$t('Error.2013.Ban', {
                try_after_hours: tryAfterTime,
              }),
            )
          } else if (res.body.detail.fail_chances >= 0) {
            reject(
              window.gApp.$t('Error.2013.LeftTimes', {
                left_times: res.body.detail.remain_chances,
              }),
            )
          } else {
            reject(window.gApp.$t('Error.2013'))
          }
        } else {
          reject(window.gApp.$t('Error.2013'))
        }
      } else if (['1003', '7024'].indexOf(res.body.errid) >= 0) {
        console.log('\n')
        console.log('%c Error Message：', 'color:red')
        console.log('%c ' + res.body.msg, 'color:red')
        reject(
          window.gApp.$t('Error.ErrorMessage', {
            message: res.body.msg,
          }),
        )
      } else {
        reject(window.gApp.$t('Error.' + res.body.errid))
        if (['2017'].indexOf(res.body.errid) >= 0) {
          setTimeout(() => {
            AuthService.logout()
          }, 2000)
        }
      }
    } else {
      if (res.status === 400) {
        if (res.body.code > 0) {
          reject(window.gApp.$t('Error.' + res.body.code))
        } else if (res.body.description) {
          reject(
            window.gApp.$t('Error.ErrorMessage', {
              message: res.body.description,
            }),
          )
        }
      } else if (res.status === 401) {
        reject(window.gApp.$t('Error.401'))
        setTimeout(() => {
          AuthService.logout()
        }, 2000)
      } else {
        if (res.body.message) {
          reject(res.body.message)
        } else if (res.body.detail) {
          reject(res.body.detail)
        } else {
          reject(window.gApp.$t('Error.Unknown'))
        }
      }
    }
  } else if (res.status === 502) {
    reject(window.gApp.$t('Error.RestAPI.Connection'))
  } else {
    reject(window.gApp.$t('Error.RestAPI.Unknown'))
  }
}

export default {
  restApiErrorHandler,
}
