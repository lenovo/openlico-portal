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
import Parser from '../common/parser'
import ErrorHandler from '../common/error-handler'
import moment from 'moment'

class APIKey {
  constructor() {
    this.id = 0
    this.value = ''
    this.createTime = ''
    this.expireTime = ''
    this.ultimate = true
    this.status = false
  }

  static parseFromRestApi(jsonObj) {
    const apiKey = new APIKey()
    apiKey.id = jsonObj.id ? jsonObj.id : 0
    apiKey.value = jsonObj.api_key ? jsonObj.api_key : ''
    apiKey.createTime = jsonObj.create_time ? Parser.parseTimeFromRestApi(jsonObj.create_time) : ''
    apiKey.expireTime = jsonObj.expire_time ? moment(jsonObj.expire_time * 1000) : ''
    apiKey.ultimate = !jsonObj.expire_time
    apiKey.status = !!jsonObj.status
    return apiKey
  }

  get id() {
    return this._id
  }

  set id(value) {
    this._id = value
  }

  get value() {
    return this._value
  }

  set value(value) {
    this._value = value
  }

  get createTime() {
    return this._createTime
  }

  set createTime(value) {
    this._createTime = value
  }

  get expireTime() {
    return this._expireTime
  }

  set expireTime(value) {
    this._expireTime = value
  }

  get ultimate() {
    return this._ultimate
  }

  set ultimate(value) {
    this._ultimate = value
  }

  get status() {
    return this._status
  }

  set status(value) {
    this._status = value
  }
}

function getKeyValue() {
  return new Promise((resolve, reject) => {
    Request.get('/api/user/apikey/generate/').then(
      res => {
        resolve(res.body)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

// datePicker should add 23:59:59 to the choosen date in order to ensure the expire time to be the latest sencond of the choosen day
// for example, the choosen date is 2017-11-29, the expire time sent to server should be 2017-11-29 23:59:59.
function createAPIKey(apiKey) {
  return new Promise((resolve, reject) => {
    const req = {
      api_key: apiKey.value,
      expire_time: apiKey.ultimate ? null : moment(apiKey.expireTime).endOf('day').valueOf(),
    }
    Request.post('/api/user/apikey/', req).then(
      res => {
        resolve(APIKey.parseFromRestApi(res.body))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function deleteAPIKey(id) {
  return new Promise((resolve, reject) => {
    Request.delete('/api/user/apikey/').then(
      res => {
        const apiKey = new APIKey()
        apiKey.id = id
        resolve(apiKey)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

// datePicker should add 23:59:59 to the choosen date in order to ensure the expire time to be the latest sencond of the choosen day
// for example, the choosen date is 2017-11-29, the expire time sent to server should be 2017-11-29 23:59:59.
function updateAPIKey(apiKey) {
  return new Promise((resolve, reject) => {
    const req = {
      expire_time: apiKey.newUltimate ? null : moment(apiKey.newExpireTime).endOf('day').valueOf(),
    }
    Request.patch('/api/user/apikey/', req).then(
      res => {
        resolve(APIKey.parseFromRestApi(res.body))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getAPIKey(id) {
  return new Promise((resolve, reject) => {
    Request.get('/api/user/apikey/').then(
      res => {
        resolve(APIKey.parseFromRestApi(res.body))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function listAPIKeys() {
  return new Promise((resolve, reject) => {
    Request.get('api/user/apikey/').then(
      res => {
        const result = []
        // (res.body).forEach((item) => {
        //     result.push(APIKey.parseFromRestApi(item));
        // });
        if (res.body) {
          result.push(APIKey.parseFromRestApi(res.body))
        }
        resolve(result)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

export default {
  APIKey,
  getKeyValue,
  createAPIKey,
  deleteAPIKey,
  updateAPIKey,
  getAPIKey,
  listAPIKeys,
}
