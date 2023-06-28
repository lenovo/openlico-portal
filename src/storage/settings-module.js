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

import Session from '../common/session'

const storage = (function () {
  try {
    return 'localStorage' in window && window.localStorage !== null ? self.localStorage : self.cookie
  } catch (e) {
    return self.cookie
  }
})()

function setStorageOrCookie(key, val) {
  return (storage[key] = val)
}
function getStorageOrCookie(key) {
  return storage[key]
}

function getDefaultLangCode() {
  const browserLang = (navigator.language || navigator.browserLanguage).toLowerCase()
  if (browserLang.indexOf('zh') >= 0) {
    return 'zh'
  } else {
    return 'en'
  }
}

const state = {
  utilColor: storage.utilColor,
  gpuutil: storage.gpuutil,
  cpuutilColor: storage.cpuutilColor,
  cpuutil: storage.cpuutil,
  memoryColor: storage.memoryColor,
  gpumemory: storage.gpumemory,
  temperatureColor: storage.temperatureColor,
  gputemperature: storage.gputemperature,
  show3D: storage.show3D,
  breadcrumbBarName: storage.breadcrumbBarName,
  mobilePolicy: storage.mobilePolicy,
  langCode: storage.langCode || getDefaultLangCode(),
  currency: storage.currency,
  currencyUnit: storage.currencyUnit,
  gResource: storage.gResource,
  license: JSON.parse(Session.getValue('license', '{}')),
  keepAlivePages: ['file-manage'], // The component name of the keepAlive pages
  earMinPState: Session.getValue('earMinPState', 0),
  earMaxPState: Session.getValue('earMaxPState', 6),
  mainToolsY: storage.mainToolsY,
  mainToolsX: storage.mainToolsX,
  mainToolsFM: storage.mainToolsFM,
  mainToolsShell: storage.mainToolsShell,
  backFilter: '',
}

const mutations = {
  setUserConfig(state, payload) {
    for (const attr in payload) {
      state[attr] = payload[attr]
      setStorageOrCookie(attr, payload[attr])
    }
  },
  initLicense(state, payload) {
    state.license = payload
    Session.setValue('license', JSON.stringify(payload))
  },
  initKeepAlivePages(state, payload) {
    state.keepAlivePages = payload
    Session.setValue('keep_alive_pages', JSON.stringify(payload))
  },
  setEarSettings(state, payload) {
    for (const attr in payload) {
      state[attr] = payload[attr]
      Session.setValue(attr, payload[attr])
    }
  },
  setpTemplateFilter(state, item) {
    state.backFilter = item
  },
}

const actions = {
  init(context) {
    context.commit('setUserConfig', {
      gpuutil: getStorageOrCookie('gpuutil') || '0, 100',
      utilColor: getStorageOrCookie('utilColor') || false,
      cpuutil: getStorageOrCookie('cpuutil') || '0, 100',
      cpuutilColor: getStorageOrCookie('cpuutilColor') || false,
      gpumemory: getStorageOrCookie('gpumemory') || '0, 100',
      memoryColor: getStorageOrCookie('memoryColor') || false,
      gputemperature: getStorageOrCookie('gputemperature') || '0, 100',
      temperatureColor: getStorageOrCookie('temperatureColor') || false,
      show3D: getStorageOrCookie('show3D') || false,
      breadcrumbBarName: getStorageOrCookie('breadcrumbBarName') || '',
      langCode: getStorageOrCookie('langCode') || getDefaultLangCode(),
      mobilePolicy: getStorageOrCookie('mobilePolicy') || 'US',
      currency: getStorageOrCookie('currency') || '$',
      currencyUnit: getStorageOrCookie('currencyUnit') || '',
      gResource: getStorageOrCookie('gResource') || '[]',
      // mainToolsY: getStorageOrCookie("mainToolsY") || "",
      // mainToolsX: getStorageOrCookie("mainToolsX") || "",
      // mainToolsFM: getStorageOrCookie("mainToolsFM") || false,
      // mainToolsShell: getStorageOrCookie("mainToolsShell") || false,
    })
  },
  setStorage(context, payload) {
    context.commit('setUserConfig', payload)
  },
  setGpuutil(context, gpuutil) {
    context.commit('setUserConfig', {
      gpuutil: setStorageOrCookie('gpuutil', gpuutil),
    })
  },
  setCpuutilColor(context, utilColor) {
    context.commit('setUserConfig', {
      utilColor: setStorageOrCookie('cpuutilColor', utilColor),
    })
  },
  setCpuutil(context, cpuutil) {
    context.commit('setUserConfig', {
      gpuutil: setStorageOrCookie('cpuutil', cpuutil),
    })
  },
  setGpumemory(context, gpumemory) {
    context.commit('setUserConfig', {
      gpumemory: setStorageOrCookie('gpumemory', gpumemory),
    })
  },
  setGputemperature(context, gputemperature) {
    context.commit('setUserConfig', {
      gputemperature: setStorageOrCookie('gputemperature', gputemperature),
    })
  },
  setShow3D(context, show3D) {
    context.commit('setUserConfig', {
      show3D: setStorageOrCookie('show3D', show3D),
    })
  },
  setBreadcrumbBarName(context, breadcrumbBarName) {
    context.commit('setUserConfig', {
      breadcrumbBarName: setStorageOrCookie('breadcrumbBarName', breadcrumbBarName),
    })
  },
  setMobilePolicy(context, mobilePolicy) {
    context.commit('setUserConfig', {
      mobilePolicy: setStorageOrCookie('mobilePolicy', mobilePolicy),
    })
  },
  setLangCode(context, langCode) {
    context.commit('setUserConfig', {
      langCode: setStorageOrCookie('langCode', langCode),
    })
  },
  setCurrency(context, currency) {
    context.commit('setUserConfig', {
      currency: setStorageOrCookie('currency', currency[0] || ''),
      currencyUnit: setStorageOrCookie('currency', currency[1] || ''),
    })
  },
  setGResource(context, gResource) {
    context.commit('setUserConfig', {
      gResource: setStorageOrCookie('gResource', gResource),
    })
  },
  clear(context) {
    context.commit('setUserConfig', {})
  },
  setLicense(context, payload) {
    context.commit('initLicense', payload)
  },
  setKeepAlivePages(context, payload) {
    context.commit('initKeepAlivePages', payload)
  },
  setEarMinPState(context, min) {
    context.commit('setEarSettings', {
      earMinPState: min,
    })
  },
  setEarMaxPState(context, max) {
    context.commit('setEarSettings', {
      earMaxPState: max,
    })
  },
  setMainToolsY(context, y) {
    context.commit('setUserConfig', {
      mainToolsY: y,
    })
  },
  setMainToolsX(context, x) {
    context.commit('setUserConfig', {
      mainToolsX: x,
    })
  },
  setMainToolsFM(context, fm) {
    context.commit('setUserConfig', {
      mainToolsFM: fm,
    })
  },
  setMainToolsShell(context, shell) {
    context.commit('setUserConfig', {
      mainToolsShell: shell,
    })
  },
  setpTemplateFilter(context, backFilter) {
    context.commit('setpTemplateFilter', backFilter)
  },
}

const getters = {
  getGpuutilColor: state => {
    if (state.utilColor === 'false' || state.utilColor === false) {
      return false
    } else {
      return true
    }
  },
  getGpuutil: state => {
    if (state.gpuutil) {
      return state.gpuutil
    } else {
      return getStorageOrCookie('gpuutil')
    }
  },
  getCpuutilColor: state => {
    if (state.cpuutilColor === 'false' || state.cpuutilColor === false) {
      return false
    } else {
      return true
    }
  },
  getCpuutil: state => {
    if (state.cpuutil) {
      return state.cpuutil
    } else {
      return getStorageOrCookie('cpuutil')
    }
  },
  getGpumemoryColor: state => {
    if (state.memoryColor === 'false' || state.memoryColor === false) {
      return false
    } else {
      return true
    }
  },
  getGpumemory: state => {
    if (state.gpumemory) {
      return state.gpumemory
    } else {
      return getStorageOrCookie('gpumemory')
    }
  },
  getGputemperatureColor: state => {
    if (state.temperatureColor === 'false' || state.temperatureColor === false) {
      return false
    } else {
      return true
    }
  },
  getGputemperature: state => {
    if (state.gputemperature) {
      return state.gputemperature
    } else {
      return getStorageOrCookie('gputemperature')
    }
  },
  getMobilePolicy: state => {
    if (state.mobilePolicy) {
      return state.mobilePolicy
    } else {
      return getStorageOrCookie('mobilePolicy')
    }
  },
  getLangCode: state => {
    return state.langCode
  },
  getCurrency: state => {
    if (state.currency) {
      return state.currency
    } else {
      return getStorageOrCookie('currency')
    }
  },
  getCurrencyUnit: state => {
    if (state.currencyUnit) {
      return state.currencyUnit
    } else {
      return getStorageOrCookie('currencyUnit')
    }
  },
  /**
   * get billing gRresource
   * @returns [{"billing":true,...}]
   */
  getGResource: state => {
    const gres = JSON.parse(state.gResource || getStorageOrCookie('gResource'))
    return gres.filter(i => i.billing)
  },
  /**
   * get all gResource
   */
  getAllGResource: state => {
    const gres = JSON.parse(state.gResource || getStorageOrCookie('gResource'))
    return gres
  },
  getLicense: state => {
    return state.license
  },
  getKeepAlivePages: state => {
    return state.keepAlivePages
  },
  getEarMinPState: state => {
    if (state.earMinPState) {
      return state.earMinPState
    } else {
      return Session.getValue('earMinPState')
    }
  },
  getEarMaxPState: state => {
    if (state.earMaxPState) {
      return state.earMaxPState
    } else {
      return Session.getValue('earMaxPState')
    }
  },
  getMainToolsY: state => {
    if (state.mainToolsY) {
      return state.mainToolsY
    } else {
      return getStorageOrCookie('mainToolsY')
    }
  },
  getMainToolsX: state => {
    if (state.mainToolsX) {
      return state.mainToolsX
    } else {
      return getStorageOrCookie('mainToolsX')
    }
  },
  getMainToolsFM: state => {
    if (state.mainToolsFM === 'false' || state.mainToolsFM === false) {
      return false
    } else {
      return true
    }
  },
  getMainToolsShell: state => {
    if (state.mainToolsShell === 'false' || state.mainToolsShell === false) {
      return false
    } else {
      return true
    }
  },
  getBackCode: state => {
    return state.backFilter
  },
}

const settingsModule = {
  namespaced: true,
  state,
  mutations,
  getters,
  actions,
}

export default settingsModule
