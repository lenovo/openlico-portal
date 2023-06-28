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

import Axios from 'axios'
const instance = Axios.create()
instance.interceptors.request.use(
  config => {
    const token = window.gApp.$store.state.auth.token
    if (token && token.length > 0) {
      config.headers.authorization = 'Jwt ' + token
    }
    if (config.params && config.params.args && typeof config.params.args !== 'string') {
      config.params.args = JSON.stringify(config.params.args)
    }
    return config
  },
  err => {
    return Promise.reject(err)
  },
)

instance.interceptors.response.use(
  response => {
    response.body = response.data
    response.bodyText = JSON.stringify(response.data)
    return response
  },
  err => {
    if (err && err.response) {
      err.response.body = err.response.data
      err.response.bodyText = JSON.stringify(err.response.data)
      return Promise.reject(err.response)
    }
    return Promise.reject(new Error('unkown error'))
  },
)
export default instance
