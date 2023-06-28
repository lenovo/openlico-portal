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

import moment from 'moment'

function baseFormatMoney(
  number,
  decimalPlaces,
  currencySymbol,
  thousandsSeparator,
  decimalSeparator,
  currencyUnit = '',
) {
  decimalPlaces = !isNaN((decimalPlaces = Math.abs(decimalPlaces))) ? decimalPlaces : 2
  currencySymbol = currencySymbol !== undefined ? currencySymbol : '$'
  thousandsSeparator = thousandsSeparator || ','
  decimalSeparator = decimalSeparator || '.'
  const negative = number < 0 ? '-' : ''
  const i = parseInt((number = Math.abs(+number || 0).toFixed(decimalPlaces)), 10) + ''
  const j = i.length > 3 ? i.length % 3 : 0
  return (
    currencySymbol +
    negative +
    (j ? i.substr(0, j) + thousandsSeparator : '') +
    i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousandsSeparator) +
    (decimalPlaces && Math.abs(number) % 1 !== 0
      ? decimalSeparator +
        Math.abs(number - i)
          .toFixed(decimalPlaces)
          .slice(2)
      : '') +
    currencyUnit
  )
}

// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
function baseFormatDate(date, fmt) {
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (const k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
  return fmt
}

function formatCount(number) {
  if (number === 0) {
    return '-'
  }
  return number
}

function formatMoney(number, decimalPlaces = 2) {
  // return baseFormatMoney(number, 2, window.gApp.$t('Currency.Symbol'), ',', '.');
  const getters = window.gApp.$store.getters
  return baseFormatMoney(
    number,
    decimalPlaces,
    getters['settings/getCurrency'],
    ',',
    '.',
    getters['settings/getCurrencyUnit'],
  )
}

function formatComputingTime(number) {
  return baseFormatMoney(number, 2, '', ',', '.')
}

function formatDateTime(date, format) {
  if (!format) format = 'yyyy-MM-dd hh:mm'
  if (date) {
    return baseFormatDate(date, format)
  }
  return '-'
}

function formatDuration(duration, LoginTime) {
  const seconds = parseInt(duration % 60)
  const minutes = ((duration % 3600) - (duration % 60)) / 60
  const hours = (duration - (duration % 3600)) / 3600
  const s = LoginTime === 'login_after_time' ? ',' + seconds + 's' : ''
  if (minutes <= 0 && hours <= 0) {
    return LoginTime === 'login_after_time' ? seconds + 's' : '<1m'
  }
  if (hours <= 0) {
    return minutes + 'm' + s
  }
  return hours + 'h,' + minutes + 'm' + s
}

/*
 *@method formatDurationTime
 *@param{string,number}duration: Millisecond value, for example: new Date().getTime(), 1563851705711 / '1563851705711'
 *@return {string} (n)s / (n)m(n)s / (n)h(n)m(n)s
 */
function formatDurationTime(duration) {
  const durationTime = parseInt(duration / 1000)
  const seconds = durationTime % 60
  const minutes = ((durationTime % 3600) - (durationTime % 60)) / 60
  const hours = (durationTime - (durationTime % 3600)) / 3600
  if (minutes <= 0 && hours <= 0) {
    return seconds + 's'
  }
  if (hours <= 0) {
    return minutes + 'm' + seconds + 's'
  }
  return hours + 'h' + minutes + 'm' + seconds + 's'
}

// unit: pb, tb, gb, mb, kb, b
function formatByteSize(bytes, unit) {
  const formatList = {
    b: Math.round(bytes),
    kb: bytes / Math.pow(2, 10),
    mb: bytes / Math.pow(2, 20),
    gb: bytes / Math.pow(2, 30),
    tb: bytes / Math.pow(2, 40),
    pb: bytes / Math.pow(2, 50),
  }
  const unitKeys = ['pb', 'tb', 'gb', 'mb', 'kb', 'b']
  let size
  let curUnit
  if (unitKeys.includes(unit)) {
    size = Math.round(formatList[unit] * 10) / 10
    curUnit = unit
  } else {
    for (let i = 0; i < unitKeys.length; i++) {
      curUnit = unitKeys[i]
      size = Math.round(formatList[curUnit] * 10) / 10
      if (size >= 1) {
        break
      }
    }
  }
  return size + ' ' + curUnit.toUpperCase()
}

function formatNumber(number, digit) {
  const multi = Math.pow(10, digit)
  return Math.round(number * multi) / multi
}

function dos2unix(content) {
  const re = /(\r\n)/g
  return content.replace(re, '\n')
}

function formatEnergy(number, unit) {
  return (number / unit).toFixed(1)
}

function formatMyFolder(path, arch) {
  const workspace = window.gApp.$store.state.auth.workspace.replace(/\/$/, '')
  const workspaceTestReg = new RegExp('^' + workspace + '/')
  const workspaceReplaceReg = new RegExp('^' + workspace)

  if (path === workspace || (path.length >= workspace.length && workspaceTestReg.test(path))) {
    return path.replace(workspaceReplaceReg, 'MyFolder')
  }
  return path
}

function formatWorkspace(path, arch) {
  const workspace = window.gApp.$store.state.auth.workspace.replace(/\/$/, '')
  const MyFolderReg = /^MyFolder\//

  if (path === 'MyFolder' || (path.length >= 'MyFolder/'.length && MyFolderReg.test(path))) {
    return path.replace(/^MyFolder/, workspace)
  }
  return path
}

function formatBillingRate(rate, withCurrencySymbol, unit, decimalsLength = 4) {
  let currencySymbol = window.gApp.$store.getters['settings/getCurrency']
  let currencyUnit = window.gApp.$store.getters['settings/getCurrencyUnit']
  if (!withCurrencySymbol) {
    currencySymbol = ''
  }
  if (!unit) {
    currencyUnit = ''
  }
  return baseFormatMoney(rate, decimalsLength, currencySymbol, '', '.', currencyUnit).replace(',', '')
}

function formatDistributionData(data, step, minGap, filterValue) {
  let x = []
  const y = []
  const filter = filterValue !== undefined ? filterValue : () => true

  if (data.length <= 0) {
    return { x, y }
  }

  const max = Math.max.apply(Math, data)
  const min = Math.min.apply(Math, data)

  const rangeList = getDistributionRangeByStep(max, min, step, minGap)

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < rangeList.length; j++) {
      const filterRange = j < rangeList.length - 1 ? data[i] < rangeList[j][1] : data[i] <= rangeList[j][1]
      if (data[i] >= rangeList[j][0] && filterRange) {
        if (filter(data[i])) {
          y[j] = isNaN(y[j]) ? 1 : y[j] + 1
        }
        break
      }
    }
  }

  for (let i = 0; i < y.length; i++) {
    if (isNaN(y[i])) {
      y[i] = 0
    }
  }

  x = rangeList.map(item => {
    return item[0] + '-' + item[1]
  })

  return { x, y }
}

function getDistributionRangeByStep(maxVal, minVal, step, minGap = 1) {
  const list = []
  minVal = minVal - (minVal % minGap)
  const temp = (maxVal - minVal) / step
  let gap = temp

  if (temp === 0 || temp % minGap) {
    gap = temp + (minGap - (temp % minGap))
  }

  for (let i = 0; i < step; i++) {
    const min = minVal + gap * i
    const max = min + gap
    list.push([min, max])
  }
  return list
}

function generateRandomName(prefill) {
  const timeStr = moment().format('MMDDHHmm')
  return prefill + timeStr
}

export default {
  formatCount,
  formatMoney,
  formatComputingTime,
  formatDateTime,
  formatByteSize,
  formatDuration,
  formatDurationTime,
  formatNumber,
  formatEnergy,
  dos2unix,
  formatMyFolder,
  formatWorkspace,
  formatBillingRate,
  formatDistributionData,
  getDistributionRangeByStep,
  generateRandomName,
}
