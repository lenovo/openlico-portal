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

// Define all session functions
import Utils from './utils'

function getValue(key, defaultValue) {
  defaultValue = Utils.isUndefined(arguments[1]) ? null : arguments[1]
  if (hasKey(key)) {
    return window.sessionStorage.getItem(key)
  }
  return defaultValue
}

function setValue(key, value) {
  window.sessionStorage.setItem(key, value)
}

function hasKey(key) {
  for (let i = 0; i < window.sessionStorage.length; i++) {
    const tempKey = window.sessionStorage.key(i)
    if (tempKey === key) {
      return true
    }
  }
  return false
}

function clear() {
  window.sessionStorage.clear()
}

export default {
  getValue,
  setValue,
  hasKey,
  clear,
}
