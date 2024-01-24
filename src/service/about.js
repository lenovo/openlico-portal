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

class VersionInfo {
  constructor() {
    this.version = ''
    this.buildNum = ''
  }

  static parseFromRestApi(jsonObj) {
    const versionInfo = new VersionInfo()

    versionInfo.version = jsonObj.version
    versionInfo.buildNum = jsonObj.build_date

    return versionInfo
  }
}

function getAbout() {
  return new Promise((resolve, reject) => {
    Request.get('/static/settings/about.json').then(
      res => {
        const aboutInfo = res.body
        const currentYear = new Date().getFullYear()
        const copyright = res.body.copyRightDescription
        if (copyright) {
          aboutInfo.copyRightDescription = copyright.replace('{year}', currentYear > 2019 ? '-present' : '')
        }
        resolve(aboutInfo)
      },
      res => {
        reject(res)
      },
    )
  })
}

function getVersion() {
  return new Promise((resolve, reject) => {
    Request.get('/api/base/version/').then(
      res => {
        const versionInfo = VersionInfo.parseFromRestApi(res.body)
        resolve(versionInfo)
      },
      res => {
        reject("Can't get version")
      },
    )
  })
}

function getCountryCode(locale) {
  return new Promise((resolve, reject) => {
    Request.get(`/static/settings/countries-code/${locale}_countries.json`).then(
      res => {
        resolve(res.data)
      },
      err => {
        reject(err)
      },
    )
  })
}

export default {
  getAbout,
  getVersion,
  getCountryCode,
}
