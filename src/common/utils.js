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

// Define all utils functions
import dayjs from '../dayjs'
import menu from '../menu/menu'
import Format from './format'

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0
}

function isUndefined(obj) {
  if (typeof obj === 'undefined') {
    return true
  }
  return false
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function objectEquals(x, y) {
  if (x === null || x === undefined || y === null || y === undefined) {
    return x === y
  }
  // after this just checking type of one would be enough
  if (x.constructor !== y.constructor) {
    return false
  }
  // if they are functions, they should exactly refer to same one (because of closures)
  if (x instanceof Function) {
    return x === y
  }
  // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
  if (x instanceof RegExp) {
    return x === y
  }
  if (x === y || x.valueOf() === y.valueOf()) {
    return true
  }
  if (Array.isArray(x) && x.length !== y.length) {
    return false
  }

  // if they are dates, they must had equal valueOf
  if (x instanceof Date) {
    return false
  }

  // if they are strictly equal, they both need to be object at least
  if (!(x instanceof Object)) {
    return false
  }
  if (!(y instanceof Object)) {
    return false
  }

  // recursive object equality check
  const p = Object.keys(x)
  return (
    Object.keys(y).every(function (i) {
      return p.indexOf(i) !== -1
    }) &&
    p.every(function (i) {
      return objectEquals(x[i], y[i])
    })
  )
}

function findMenu(path, menuList) {
  if (menuList) {
    let result = null
    let secondaryResult = null
    for (let i = 0; i < menuList.length; i++) {
      const item = menuList[i]
      if (path === item.path) {
        result = item
        break
      } else if (path.indexOf(item.path) === 0 && secondaryResult === null) {
        secondaryResult = item
      }
      if (item.children) {
        for (let j = 0; j < item.children.length; j++) {
          const subItem = item.children[j]
          if (path === subItem.path) {
            result = subItem
            break
          } else if (path.indexOf(subItem.path) === 0 && secondaryResult === null) {
            secondaryResult = subItem
          }
        }
      }
    }
    return result !== null ? result : secondaryResult
  }
  return null
}

function findDetailPathByRoute(listPageRoute, detailPageRoute) {
  const detailPath = detailPageRoute.path
  const access = window.gApp.$store.state.auth.access
  const menus = menu[access]
  const listPagePath = listPageRoute.path
  const listPageMenu = findMenu(listPagePath, menus)
  if (listPageMenu && listPageMenu.details) {
    for (let i = 0; i < listPageMenu.details.length; i++) {
      const usage = listPageMenu.details[i].usage ? listPageMenu.details[i].usage : ['go-back', 'breadcrumb']
      if (menu.compareWithMenuPath(listPageMenu.details[i], detailPath) && usage.includes('go-back')) {
        return true
      }
    }
  }
  return false
}

function matchValueBySelectOptions(array = [], val) {
  return array.filter(({ value, children }) => {
    if (value && children) {
      return value === val || matchValueBySelectOptions(children, val)
    } else if (value !== undefined || children !== undefined) {
      return value ? value === val : matchValueBySelectOptions(children, val)
    } else {
      return false
    }
  })
}

const getDaysOfWeek = () => {
  const data = []
  let counter = 0
  while (counter <= 6) {
    const day = dayjs().startOf('week').add(counter, 'days')
    data.push(day)
    counter++
  }
  return data
}

const getDaysOfWeekMondayFirst = () => {
  //   const data = getDaysOfWeek()
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
}

const getDaysOfMonth = () => {
  const last = parseInt(dayjs('2022-01').endOf('month').format('D'))
  const data = []
  let counter = 0
  while (counter <= last - 1) {
    const day = dayjs('2022-01').startOf('month').add(counter, 'days')
    data.push(day)
    counter++
  }
  return data
}

const getExecResult = async (str, params = {}) => {
  let constStr = ''
  for (const key in params) {
    constStr += `const ${key} = ${JSON.stringify(params[key])};`
  }
  const encodedJs = esm`${constStr} export const display = ${str}`
  const { display } = await import(/* @vite-ignore */ encodedJs)
  return display
}

function esm(templateStrings, ...substitutions) {
  let js = templateStrings.raw[0]
  for (let i = 0; i < substitutions.length; i++) {
    js += substitutions[i] + templateStrings.raw[i + 1]
  }
  return 'data:text/javascript;base64,' + btoa(js)
}

function getBase64ByImgUrl(url, callback, ext = 'jpeg') {
  let canvas = document.createElement('CANVAS')
  const ctx = canvas.getContext('2d')
  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.onload = function () {
    canvas.height = img.height
    canvas.width = img.width
    ctx.drawImage(img, 0, 0)
    const dataURL = canvas.toDataURL('image/' + ext)
    callback.call(this, dataURL)
    canvas = null
  }
  img.src = url
}

function getBase64ByFile(file, callback) {
  const fileRender = new FileReader()
  fileRender.onload = e => {
    callback(e.target.result)
  }
  fileRender.readAsDataURL(file)
}

function getLabelByLocale(label, locale) {
  if (!label) return ''
  if (typeof label === 'string') return label
  return label[locale]
}

function getTimezoneShortByLang(tz, lang = 'en') {
  const timezone = new Intl.DateTimeFormat(lang, {
    dateStyle: 'full',
    timeStyle: 'full',
    timeZone: tz,
  })
    .format(new Date())
    .replace(/^.*(A|P)M\s/, '')
  const arr = timezone.match(new RegExp('[A-Z](?!.*[(])', 'g'))
  return arr ? arr.join('') : tz
}

function chartFormatTime(val, timespan) {
  if (timespan === 'h' || timespan === 'd') {
    // h: hour, d: day
    return ' ' + Format.formatDateTime(new Date(val), 'hh:mm')
  }
  if (timespan === 'w' || timespan === 'm') {
    // w: week, m: month
    return ' ' + Format.formatDateTime(new Date(val), 'MM-dd')
  }
}

export default {
  isEmptyObject,
  isUndefined,
  deepCopy,
  objectEquals,
  findDetailPathByRoute,
  matchValueBySelectOptions,
  getDaysOfWeek,
  getDaysOfWeekMondayFirst,
  getDaysOfMonth,
  getExecResult,
  getBase64ByImgUrl,
  getBase64ByFile,
  getLabelByLocale,
  getTimezoneShortByLang,
  chartFormatTime,
}
