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

// local message
import localZh from './../assets/lang/zh.json'
import localEn from './../assets/lang/en.json'

let EN = localEn
let ZH = localZh

try {
  EN = Object.assign(EN, require('./../assets/lang/commercial/en.json'))
  ZH = Object.assign(ZH, require('./../assets/lang/commercial/zh.json'))
} catch (error) {}

export default {
  en: EN,
  zh: ZH,
}
