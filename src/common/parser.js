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

const CurrentTimezoneOffset = new Date().getTimezoneOffset()

function parseTimeFromRestApi(timeStr) {
  if (timeStr) {
    timeStr = String(timeStr)
    if (timeStr.indexOf('T') >= 0 && timeStr.indexOf('Z') >= 0) {
      return new Date(Date.parse(timeStr))
    } else if (timeStr.indexOf('-') >= 0) {
      timeStr = timeStr.replace('-', '/').replace('-', '/')
      return new Date(Date.parse(timeStr) - CurrentTimezoneOffset * 60 * 1000)
    } else {
      return new Date(timeStr * 1000)
    }
  }
  return null
}

// convert timestamp to format 'yyyy-MM-dd hh:mm:ss', unit: ms
// function parseTimestamp2Str (timestamp) {
//   if (timestamp) {
//     const temp = new Date(timestamp)
//     return temp.toLocaleDateString().replace(/\//g, '-') + ' ' + temp.toTimeString().substr(0, 8)
//   }
//   return null
// }

function parseBooleanFromString(str) {
  if (str === 'true') {
    return true
  }
  return false
}

export default {
  parseTimeFromRestApi,
  parseBooleanFromString,
}
