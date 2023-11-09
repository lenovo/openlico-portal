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

// Define auth storage module
import Session from '../common/session'
import Parser from '../common/parser'

// Define state
const state = {
  username: Session.getValue('lico_username', ''),
  userid: Session.getValue('lico_userid', ''),
  role: Session.getValue('lico_role', ''),
  access: Session.getValue('lico_access', ''),
  token: Session.getValue('lico_token', ''),
  ldapManaged: Parser.parseBooleanFromString(Session.getValue('lico_ldapManaged', 'true')),
  featureCodes: Session.getValue('lico_featureCodes', '').split(','),
  workspace: Session.getValue('lico_workspace', ''),
  clusterName: Session.getValue('lico_clusterName', ''),
  availableMetrics: Session.getValue('lico_availableMetrics', ''),
  prevActionFilePath: Session.getValue('lico_prevActionFilePath', ''),
}

// Define mutations
const mutations = {
  setUser(state, payload) {
    for (const key in payload) {
      state[key] = payload[key]
      Session.setValue('lico_' + key, payload[key])
    }
  },
  setFeatureCodes(state, featureCodes) {
    state.featureCodes = featureCodes
    Session.setValue('lico_featureCodes', featureCodes.join(','))
  },
}

// Define actions
const actions = {
  init(context) {
    context.commit('setUser', {
      username: Session.getValue('lico_username', ''),
      userid: Session.getValue('lico_userid', ''),
      role: Session.getValue('lico_role', ''),
      access: Session.getValue('lico_access', ''),
      token: Session.getValue('lico_token', ''),
      ldapManaged: Parser.parseBooleanFromString(Session.getValue('lico_ldapManaged', 'true')),
      workspace: Session.getValue('lico_workspace', ''),
      clusterName: Session.getValue('lico_clusterName', ''),
      availableMetrics: Session.getValue('lico_availableMetrics', ''),
      prevActionFilePath: Session.getValue('lico_prevActionFilePath', ''),
    })
    context.commit('setFeatureCodes', Session.getValue('lico_featureCodes', '').split(','))
  },
  login(context, payload) {
    context.commit('setUser', payload)
  },
  setAccess(context, access) {
    context.commit('setUser', { access })
  },
  setLDAPManaged(context, payload) {
    context.commit('setUser', {
      ldapManaged: payload.ldapManaged,
    })
  },
  setToken(context, payload) {
    context.commit('setUser', {
      username: payload.username,
      userid: payload.userid,
      role: payload.role,
      token: payload.token,
    })
  },
  setFeatureCodes(context, payload) {
    context.commit('setFeatureCodes', payload.featureCodes)
  },
  setWorkspace(context, workspace) {
    context.commit('setUser', { workspace })
  },
  setClusterName(context, payload) {
    context.commit('setUser', {
      clusterName: payload.clusterName,
    })
  },
  setAvailableMetrics(context, payload) {
    context.commit('setUser', {
      availableMetrics: payload.availableMetrics,
    })
  },
  setPrevActionFilePath(context, payload) {
    context.commit('setUser', {
      prevActionFilePath: payload.prevActionFilePath,
    })
  },
  logout(context) {
    context.commit('setUser', {
      username: '',
      userid: '',
      role: '',
      access: '',
      token: '',
      ldapManaged: true,
      featureCodes: '',
      workspace: '',
      clusterName: '',
      availableMetrics: '',
      prevActionFilePath: '',
    })
    Session.clear()
  },
}

// Define module
const authModule = {
  namespaced: true,
  state,
  mutations,
  actions,
}

export default authModule
