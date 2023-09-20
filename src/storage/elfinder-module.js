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

const state = {
  lang: '',
}

const mutations = {
  setHash(state, payload) {
    state.lang = payload.lang
    setStorageOrCookie('/-elfinder-langelfauto0', payload.lang)
  },
}

const actions = {
  init(context) {
    context.commit('setHash', {
      lang: 'en',
    })
  },
  setStorage(context, payload) {
    context.commit('setHash', {
      lang: payload.lang,
    })
  },
  clear(context) {
    context.commit('setHash', {
      lang: '',
    })
  },
}

const getters = {
  isFileManager: state => {
    if (!state.hash) {
      return false
    } else {
      return true
    }
  },
}

const elfinderModule = {
  namespaced: true,
  state,
  mutations,
  getters,
  actions,
}

export default elfinderModule
