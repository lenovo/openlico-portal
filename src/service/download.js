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
import ErrorHandler from '../common/error-handler'

function saveFileByBlob(res) {
  const result = res.headers['content-disposition'].split(';').filter(str => str.indexOf('filename') >= 0)[0]
  const fileName = result.replace(/(filename=)|"*/g, '')
  const link = document.createElement('a')
  const blob = new Blob([res.body], {
    type: 'application/josn',
  })
  link.setAttribute('href', window.URL.createObjectURL(blob))
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  window.document.body.append(link)
  link.click()
  link.remove()
}

function download(url, data = {}, method = 'get', datatype = 'json') {
  return new Promise((resolve, reject) => {
    let params = {}
    if (datatype === 'formData') {
      const formData = new FormData()
      for (const key in data) {
        formData.append(key, data[key])
      }
      params = formData
    } else {
      params = data
    }
    const config = {
      headers: {
        ContentType: datatype === 'formData' ? 'application/x-www-form-urlencoded' : 'application/json',
      },
      responseType: 'blob',
    }
    let req = params
    if (method === 'get') {
      req = { params, ...config }
    }

    Request[method](url, req, config).then(
      res => {
        saveFileByBlob(res)
        resolve()
      },
      err => {
        const reader = new FileReader()
        reader.onload = e => {
          const body = JSON.parse(e.target.result)
          ErrorHandler.restApiErrorHandler({ ...err, ...{ body } }, reject)
        }
        reader.readAsText(err.body)
      },
    )
  })
}

export default download
