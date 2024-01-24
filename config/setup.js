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

/* eslint-env node */
const fs = require('fs')
const errorLog = error => console.log(error)

const envPath = './.env.local'
const context = `
# local development port
VITE_DEV_PORT=8080

# backend url
VITE_BACKEND_URL=http://127.0.0.1

`

const generateFile = async (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, 'utf8', err => {
      if (err) {
        errorLog(err.message)
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

if (!fs.existsSync(envPath)) {
  generateFile(envPath, context)
}
