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

import { createI18n } from 'vue-i18n'

import messages from './message'

// const { t } = useI18n()

// Init locale
const browserLang = (navigator.language || navigator.browserLanguage).toLowerCase()
let langCode = 'en'
if (browserLang.indexOf('zh') >= 0) {
  langCode = 'zh'
}

const i18n = createI18n({
  legacy: true,
  globalInjection: true,
  locale: langCode,
  messages,
})

export const T = function (label, args) {
  let msg = i18n.global.t(label)
  if (args) {
    for (const key in args) {
      msg = msg.replace(`{${key}}`, args[key])
    }
  }
  return msg
}

export default i18n
