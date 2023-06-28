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

const DEV_PORT = 8080

let host = 'localhost'
let protocol = 'https:'

try {
  const reg = /^--(http[s]?:\/\/)?([0-9]{1,3}\.){3}[0-9]{1,3}(:[0-9]{1,5})?/
  const configArgv = require('process').argv
  const domain = configArgv.filter(argv => reg.test(argv)).map(argv => argv.replace(/--/g, ''))[0] || host

  if (/^http/.test(domain)) {
    protocol = domain.split('//')[0]
    host = domain.split('//')[1]
  } else {
    host = domain
  }
} catch (err) {
  // console.log(err);
}

// repuest proxy
const proxy = {
  '/api': {
    target: protocol + '//' + host,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/api': '/api',
    },
  },
  '/config': {
    target: protocol + '//' + host,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/config': '/config',
    },
  },
  '/docs': {
    target: protocol + '//' + host,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/docs': '/docs',
    },
  },
  '/tensorboard': {
    target: 'https://' + host,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/tensorboard': '/tensorboard',
    },
  },
  '/dev': {
    target: 'https://' + host,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/dev': '/dev',
    },
  },
  '/novnc': {
    target: 'https://' + host,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/novnc': '/novnc',
    },
  },
  '/jobtemplates': {
    target: 'https://' + host,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/jobtemplates': '/jobtemplates',
    },
  },
  '/oneapi': {
    target: 'https://' + host,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/oneapi': '/oneapi',
    },
  },
}

const env = process.env.NODE_ENV
const isDev = process.env.NODE_ENV === 'development'

if (isDev) {
  console.log('------------------ PROXY ------------------')
  console.log(`[Proxy Host]: ${protocol}//${host}`)

  for (const key in proxy) {
    console.log(`[Proxy Request]: http://localhost${key} => ${proxy[key].target}${key}`)
  }

  console.log('\n')
  console.log('------------------ PROXY ------------------')
}

module.exports = {
  DEV_PORT,
  proxy,
  env,
  isDev,
}
