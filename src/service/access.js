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

import Collection from '../common/collection'
import store from '../store'
import menu from '../menu/menu'
import Request from '../request/https'
import ErrorHandler from '../common/error-handler'

function getAvailableAccessByRole(role) {
  const userRole = Number(role)
  if (userRole === 300) {
    if (!window.gApp.$store.state.auth.featureCodes.includes('monitor.scheduler')) {
      return ['admin', 'operator']
    }
    return ['admin', 'operator', 'staff']
  } else if (userRole === 200) {
    return ['operator']
  } else if (userRole === 100) {
    return ['staff']
  } else {
    return []
  }
}

function shiftAccess(access) {
  if (window.gApp.$store.state.auth.access !== access) {
    window.gApp.$store.dispatch('auth/setAccess', access)
    window.gApp.$router.push({ path: '/login', query: { access } })
  }
}

function getMenuByAccess(access) {
  let result = []
  if (menu[access]) {
    result = [...menu[access]]
  }
  filterMenuForLDAP(result)
  filterMenuForFeatureCodes(result, window.gApp.$store.state.auth.featureCodes)
  return result
}

function filterMenuForLDAP(menu) {
  const removeArr = []
  for (let i = 0; i < menu.length; i++) {
    if (checkForLDAP(menu[i].ldap)) {
      filterMenuForLDAP(menu[i].children)
    } else {
      removeArr.push(menu[i])
    }
  }
  for (let i = 0; i < removeArr.length; i++) {
    Collection.removeByValue(menu, removeArr[i])
  }
}

function checkForLDAP(ldap) {
  if (ldap) {
    if (ldap === 'force' && !store.state.auth.ldapManaged) {
      return false
    }
  }
  return true
}

function filterMenuForFeatureCodes(menu, featureCodes) {
  const removeArr = []
  for (let i = 0; i < menu.length; i++) {
    let menuFeatureCode = 'lico'
    if (menu[i].featureCode) {
      menuFeatureCode = menu[i].featureCode
    }
    if (getMatchFeatureCodes(menuFeatureCode, featureCodes).length > 0) {
      filterMenuForFeatureCodes(menu[i].children, featureCodes)
    } else {
      removeArr.push(menu[i])
    }
  }
  for (let i = 0; i < removeArr.length; i++) {
    Collection.removeByValue(menu, removeArr[i])
  }
}

/**
 *
 * @param {array|string} menuFeatureCode The module feature codes.
 * @param {array} featureCodes The cluster feature codes.
 * @param {string} type Contrast between the module feature code list element.
 * The params is (or/and) depeand on the 'menuFeatureCode' is (array/string).
 * @example getMatchFeatureCodes(['code1,code2', 'code3'], ['code1', 'code3'], 'or')
 * @return {array} Return matched feature codes list
 */
function getMatchFeatureCodes(menuFeatureCode, featureCodes, type = 'or') {
  const sameCodes = []
  let _menuFeatureCode = menuFeatureCode
  if (typeof _menuFeatureCode === 'string') _menuFeatureCode = [_menuFeatureCode]
  for (let i = 0; i < _menuFeatureCode.length; i++) {
    if (_menuFeatureCode[i].search(',') < 0) {
      const reg = new RegExp('\\b' + _menuFeatureCode[i].replace(/\./g, '\\.') + '\\b')
      for (let j = 0; j < featureCodes.length; j++) {
        if (reg.test(featureCodes[j])) {
          sameCodes.push(_menuFeatureCode[i])
        }
      }
    } else {
      // Matched codes in subprocess should be push into sameCodes.
      // sameCodes = getMatchFeatureCodes(menuFeatureCode[i].split(','), featureCodes, 'and')
      const codes = getMatchFeatureCodes(_menuFeatureCode[i].split(','), featureCodes, 'and')
      for (let c = 0; c < codes.length; c++) {
        sameCodes.push(codes[c])
      }
    }
  }
  if (type === 'or') {
    return sameCodes
  } else {
    return sameCodes.length === menuFeatureCode.length ? sameCodes : []
  }
}

function getQuickLinkMenu(access) {
  return new Promise((resolve, reject) => {
    Request.get('/config').then(
      res => {
        const result = []
        const quickLinkMenu = JSON.parse(res.bodyText)['quick-link']
        quickLinkMenu.forEach(menu => {
          const newMenu = reformatQuickLinkMenu(access, menu)
          if (newMenu) {
            result.push(newMenu)
          }
        })
        resolve(result)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function reformatQuickLinkMenu(access, menu) {
  if (menu.access) {
    let temp = access
    if (access === 'staff') {
      temp = 'user'
    }
    if (menu.access.split(',').indexOf(temp) < 0) {
      return null
    }
  }
  const newMenu = {
    label: menu.label,
    icon: 'Collection',
    path: menu.url,
    children: [],
    quickLink: true,
  }
  if (menu.children) {
    menu.children.forEach(subMenu => {
      const child = reformatQuickLinkMenu(access, subMenu)
      if (child) {
        newMenu.children.push(child)
      }
    })
  }
  if (newMenu.path || newMenu.children.length > 0) {
    return newMenu
  } else {
    return null
  }
}

function getScheduler() {
  let scheduler = ''
  const featureCodes = window.gApp.$store.state.auth.featureCodes
  if (featureCodes && featureCodes.length > 0) {
    featureCodes.forEach(featureCode => {
      const codes = featureCode.split('.')
      if (codes.length === 3 && codes[0] === 'sc' && ['host'].indexOf(codes[1]) >= 0) {
        scheduler = codes[2]
      }
    })
  }
  return scheduler
}

function getSchedulerArch() {
  const featureCodes = window.gApp.$store.state.auth.featureCodes
  let arch = ''
  if (featureCodes && featureCodes.length > 0) {
    featureCodes.forEach(featureCode => {
      const codes = featureCode.split('.')
      if (codes.length === 3 && codes[0] === 'sc' && ['host'].indexOf(codes[1]) >= 0) {
        arch = codes[1]
      }
    })
  }
  return arch
}

function checkUrlByAccess(target) {
  return new Promise((resolve, reject) => {
    const _this = window.gApp

    if (_this === undefined) resolve('gApp is undefined')

    if (target.meta.access === undefined) resolve('route access is undefined')

    const auth = _this.$store.state.auth
    const availableAccess = getAvailableAccessByRole(auth.role)
    let access = target.query.access || auth.access

    if (!target.meta.access.includes(access)) {
      access = availableAccess.filter(i => target.meta.access.includes(i))[0]
    }

    if (!access) {
      reject('permission denied')
    }

    if (auth.access !== access) {
      window.gApp.$store.dispatch('auth/setAccess', access)
    }

    resolve('normal')
  })
}

export default {
  getAvailableAccessByRole,
  getMenuByAccess,
  shiftAccess,
  getQuickLinkMenu,
  getScheduler,
  getSchedulerArch,
  getMatchFeatureCodes,
  checkUrlByAccess,
}
