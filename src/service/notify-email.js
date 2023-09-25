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
    notifyEmail._status = jsonObj.enabled
    notifyEmail._ssl = jsonObj.ssl
    notifyEmail._id = jsonObj.username
    notifyEmail._password = jsonObj.password
    notifyEmail._address = jsonObj.server_address
    notifyEmail._port = String(jsonObj.server_port)
    notifyEmail._mailbox = jsonObj.sender_address
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

  get _status() {
    return this.status
  }

  set _status(status) {
    this.status = status
  }

  get _ssl() {
    return this.ssl
  }

  set _ssl(ssl) {
    this.ssl = ssl
  }

  get _id() {
    return this.id
  }

  set _id(id) {
    this.id = id
  }

  get _password() {
    return this.password
  }

  set _password(password) {
    this.password = password
  }

  get _address() {
    return this.address
  }

  set _address(address) {
    this.address = address
  }

  get _port() {
    return this.port
  }

  set _port(port) {
    this.port = port
  }

  get _mailbox() {
    return this.mailbox
  }

  set _mailbox(mailbox) {
    this.mailbox = mailbox
  }
}

function getNotifyEmail() {
  return new Promise((resolve, reject) => {
    Request.get('/api/external/notice/mail/config/').then(
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
    Request.post('/api/external/notice/mail/config/', req).then(
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
    Request.post('/api/external/notice/mail/', req).then(
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
