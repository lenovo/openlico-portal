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

class VersionInfo {
  constructor() {
    this.version = ''
    this.buildNum = ''
  }

  static parseFromRestApi(jsonObj) {
    const versionInfo = new VersionInfo()

    versionInfo._version = jsonObj.version
    versionInfo._buildNum = jsonObj.build_date

    return versionInfo
  }

  get _version() {
    return this.version
  }

  set _version(version) {
    this.version = version
  }

  get _buildNum() {
    return this.buildNum
  }

  set _buildNum(buildNum) {
    this.buildNum = buildNum
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

function getVersion(url) {
  return new Promise((resolve, reject) => {
    Request.get(url).then(
      res => {
        const versionInfo = VersionInfo.parseFromRestApi(res.body)
        resolve(versionInfo)
      },
      res => {
        reject(new Error("Can't get version"))
      },
    )
  })
}

function getCountryCode(locale) {
  return new Promise((resolve, reject) => {
    try {
      const countries = require.context('static/settings/countries-code', true, /\.json$/)
      const path = countries.keys().filter(path => {
        return new RegExp('^\\.\\/' + locale + '_').test(path)
      })
      const context = countries(path)
      resolve(context)
    } catch (error) {
      console.log(error)
      reject(new Error('Can not get country code'))
    }
  })
}

export default {
  getAbout,
  getVersion,
  getCountryCode,
}
