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

// local message
import localZh from '../assets/lang/zh.json'
import localEn from '../assets/lang/en.json'

let lang = {
  en: localEn,
  zh: localZh,
}

try {
  const res = await import.meta.globEager('../assets/lang/commercial/*.json')
  if (Object.keys(res).length) {
    for (const path in res) {
      const key = path.split('/').reverse()[0].replace('.json', '')
      lang[key] = Object.assign(lang[key], res[path].default)
    }
  }
} catch (error) {
  // nothing
}

export default lang
