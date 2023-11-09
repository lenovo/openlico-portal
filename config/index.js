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

import { loadEnv } from 'vite'

/* eslint-env node */
const config = loadEnv(process.env.NODE_ENV, './')
const DEV = process.env.NODE_ENV === 'development'

// repuest proxy
const proxy = {
  '/api': {
    target: config.VITE_BACKEND_URL,
    changeOrigin: true,
    secure: false,
  },
  '/config': {
    target: config.VITE_BACKEND_URL,
    changeOrigin: true,
    secure: false,
  },
  '/jobtemplates': {
    target: config.VITE_BACKEND_URL,
    changeOrigin: true,
    secure: false,
  },
  '/dev': {
    target: config.VITE_BACKEND_URL,
    changeOrigin: true,
    secure: false,
  },
  '/novnc': {
    target: config.VITE_BACKEND_URL,
    changeOrigin: true,
    secure: false,
  },
  '/tensorboard': {
    target: config.VITE_BACKEND_URL,
    changeOrigin: true,
    secure: false,
  },
  '/docs': {
    target: config.VITE_BACKEND_URL,
    changeOrigin: true,
    secure: false,
  },
  '/oneapi': {
    target: config.VITE_BACKEND_URL,
    changeOrigin: true,
    secure: false,
  },
}

if (DEV) {
  console.log('------------------ PROXY ------------------')
  console.log(`[Proxy Host]: ${config.VITE_BACKEND_URL}`)

  for (const key in proxy) {
    console.log(`[Proxy Request]: http://localhost${key} => ${proxy[key].target}${key}`)
  }

  console.log('\n')
  console.log('------------------ PROXY ------------------')
}

/* eslint-env node */
module.exports = {
  proxy,
  DEV,
}
