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

import Session from '../common/session'

const state = {
  preference: Session.getValue('preference', {}),
}

const mutations = {
  setPreference(state, payload) {
    for (const attr in payload) {
      state[attr] = payload[attr]
      Session.setValue(attr, payload[attr])
    }
  },
}

const actions = {
  setPreference(context, preference) {
    context.commit('setPreference', { preference: JSON.stringify(preference) })
  },

  clear(context) {
    context.commit('setPreference', {
      preference: '',
    })
  },
}

const getters = {
  getPreference: state => {
    return JSON.parse(state.preference || Session.getValue('preference'))
  },
}

const preferenceModule = {
  namespaced: true,
  state,
  mutations,
  getters,
  actions,
}

export default preferenceModule
