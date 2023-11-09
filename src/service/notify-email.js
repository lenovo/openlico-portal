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
import ErrorHandler from '../common/error-handler'

class NotifyEmail {
  constructor() {
    this.status = 'on'
    this.ssl = '0'
    this.id = ''
    this.password = ''
    this.address = ''
    this.port = ''
    this.mailbox = ''
  }

  static parseFromRestApi(jsonObj) {
    const notifyEmail = new NotifyEmail()
    notifyEmail.status = jsonObj.enabled
    notifyEmail.ssl = jsonObj.ssl
    notifyEmail.id = jsonObj.username
    notifyEmail.password = jsonObj.password
    notifyEmail.address = jsonObj.server_address
    notifyEmail.port = String(jsonObj.server_port)
    notifyEmail.mailbox = jsonObj.sender_address
    return notifyEmail
  }

  static toRestApi(form) {
    const notifyEmail = {}
    notifyEmail.enabled = form.status
    notifyEmail.ssl = form.ssl
    notifyEmail.username = form.id
    notifyEmail.password = form.password
    notifyEmail.server_address = form.address
    notifyEmail.server_port = parseFloat(form.port)
    notifyEmail.sender_address = form.mailbox
    return notifyEmail
  }
}

function getNotifyEmail() {
  return new Promise((resolve, reject) => {
    Request.get('/api/notice/mail/config/').then(
      res => {
        resolve(NotifyEmail.parseFromRestApi(res.data))
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function updateMail(form) {
  return new Promise((resolve, reject) => {
    const req = NotifyEmail.toRestApi(form)
    Request.post('/api/notice/mail/config/', req).then(
      res => {
        resolve()
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function testMail(target) {
  return new Promise((resolve, reject) => {
    const req = {
      target: [target],
      title: 'This is a Test email',
      msg: 'LiCO test',
    }
    Request.post('/api/notice/mail/', req).then(
      res => {
        resolve()
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

export default {
  getNotifyEmail,
  updateMail,
  testMail,
}
