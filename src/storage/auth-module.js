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
  username: '',
  userid: '',
  role: '',
  access: '',
  token: '',
  // ldap: '',
  ldapManaged: true,
  // ldapDefaultUsername: '',
  featureCodes: [],
  workspace: '',
  clusterName: '',
  prevActionFilePath: '',
}

// Define mutations
const mutations = {
  setUser(state, payload) {
    state.username = payload.username
    state.userid = payload.userid
    state.role = payload.role
    state.access = payload.access
    state.token = payload.token
    // state.ldap = payload.ldap;
    state.ldapManaged = payload.ldapManaged
    // state.ldapDefaultUsername = payload.ldapDefaultUsername;
    state.featureCodes = payload.featureCodes
    state.workspace = payload.workspace
    state.clusterName = payload.clusterName
    state.availableMetrics = payload.availableMetrics
    state.prevActionFilePath = payload.prevActionFilePath
    Session.setValue('lico_username', payload.username)
    Session.setValue('lico_userid', payload.userid)
    Session.setValue('lico_role', payload.role)
    Session.setValue('lico_access', payload.access)
    Session.setValue('lico_token', payload.token)
    // Session.setValue('lico_ldap', payload.ldap);
    Session.setValue('lico_ldap_managed', payload.ldapManaged)
    Session.setValue('lico_workspace', payload.workspace)
    Session.setValue('cluster_name', payload.clusterName)
    Session.setValue('available_metrics', payload.availableMetrics)
    Session.setValue('prev_action_filepath', payload.prevActionFilePath)
    // Session.setValue('lico_ldap_default_username', payload.ldapDefaultUsername);
    if (payload.featureCodes) {
      Session.setValue('lico_feature_codes', payload.featureCodes.join(','))
    } else {
      Session.setValue('lico_feature_codes', '')
    }
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
      // ldap: Session.getValue('lico_ldap', ''),
      ldapManaged: Parser.parseBooleanFromString(Session.getValue('lico_ldap_managed', 'true')),
      // ldapDefaultUsername: Session.getValue('lico_ldap_default_username', ''),
      featureCodes: Session.getValue('lico_feature_codes', '').split(','),
      workspace: Session.getValue('lico_workspace', ''),
      clusterName: Session.getValue('cluster_name', ''),
      availableMetrics: Session.getValue('available_metrics', ''),
      prevActionFilePath: Session.getValue('prev_action_filepath', ''),
    })
  },
  login(context, payload) {
    context.commit('setUser', payload)
  },
  setAccess(context, access) {
    context.commit('setUser', {
      username: Session.getValue('lico_username', ''),
      userid: Session.getValue('lico_userid', ''),
      role: Session.getValue('lico_role', ''),
      access,
      token: Session.getValue('lico_token', ''),
      // ldap: Session.getValue('lico_ldap', ''),
      ldapManaged: Parser.parseBooleanFromString(Session.getValue('lico_ldap_managed', 'true')),
      // ldapDefaultUsername: Session.getValue('lico_ldap_default_username', ''),
      featureCodes: Session.getValue('lico_feature_codes', '').split(','),
      workspace: Session.getValue('lico_workspace', ''),
      clusterName: Session.getValue('cluster_name', ''),
      availableMetrics: Session.getValue('available_metrics', ''),
      prevActionFilePath: Session.getValue('prev_action_filepath', ''),
    })
  },
  setLDAP(context, ldap) {
    context.commit('setUser', {
      username: Session.getValue('lico_username', ''),
      userid: Session.getValue('lico_userid', ''),
      role: Session.getValue('lico_role', ''),
      access: Session.getValue('lico_access', ''),
      token: Session.getValue('lico_token', ''),
      // ldap: ldap,
      ldapManaged: Parser.parseBooleanFromString(Session.getValue('lico_ldap_managed', 'true')),
      // ldapDefaultUsername: Session.getValue('lico_ldap_default_username', ''),
      featureCodes: Session.getValue('lico_feature_codes', '').split(','),
      workspace: Session.getValue('lico_workspace', ''),
      clusterName: Session.getValue('cluster_name', ''),
      availableMetrics: Session.getValue('available_metrics', ''),
      prevActionFilePath: Session.getValue('prev_action_filepath', ''),
    })
  },
  setLDAPManaged(context, payload) {
    context.commit('setUser', {
      username: Session.getValue('lico_username', ''),
      userid: Session.getValue('lico_userid', ''),
      role: Session.getValue('lico_role', ''),
      access: Session.getValue('lico_access', ''),
      token: Session.getValue('lico_token', ''),
      // ldap: Session.getValue('lico_ldap', ''),
      ldapManaged: payload.ldapManaged,
      // ldapDefaultUsername: payload.ldapDefaultUsername,
      featureCodes: Session.getValue('lico_feature_codes', '').split(','),
      workspace: Session.getValue('lico_workspace', ''),
      clusterName: Session.getValue('cluster_name', ''),
      availableMetrics: Session.getValue('available_metrics', ''),
      prevActionFilePath: Session.getValue('prev_action_filepath', ''),
    })
  },
  setToken(context, payload) {
    context.commit('setUser', {
      username: payload.username,
      userid: payload.userid,
      role: payload.role,
      access: Session.getValue('lico_access', ''),
      token: payload.token,
      // ldap: Session.getValue('lico_ldap', ''),
      ldapManaged: Parser.parseBooleanFromString(Session.getValue('lico_ldap_managed', 'true')),
      // ldapDefaultUsername: Session.getValue('lico_ldap_default_username', ''),
      featureCodes: Session.getValue('lico_feature_codes', '').split(','),
      workspace: Session.getValue('lico_workspace', ''),
      clusterName: Session.getValue('cluster_name', ''),
      availableMetrics: Session.getValue('available_metrics', ''),
      prevActionFilePath: Session.getValue('prev_action_filepath', ''),
    })
  },
  setFeatureCodes(context, payload) {
    context.commit('setUser', {
      username: Session.getValue('lico_username', ''),
      userid: Session.getValue('lico_userid', ''),
      role: Session.getValue('lico_role', ''),
      access: Session.getValue('lico_access', ''),
      token: Session.getValue('lico_token', ''),
      // ldap: Session.getValue('lico_ldap', ''),
      ldapManaged: Parser.parseBooleanFromString(Session.getValue('lico_ldap_managed', 'true')),
      // ldapDefaultUsername: Session.getValue('lico_ldap_default_username', ''),
      featureCodes: payload.featureCodes,
      workspace: Session.getValue('lico_workspace', ''),
      clusterName: Session.getValue('cluster_name', ''),
      availableMetrics: Session.getValue('available_metrics', ''),
      prevActionFilePath: Session.getValue('prev_action_filepath', ''),
    })
  },
  setWorkspace(context, workspace) {
    context.commit('setUser', {
      username: Session.getValue('lico_username', ''),
      userid: Session.getValue('lico_userid', ''),
      role: Session.getValue('lico_role', ''),
      access: Session.getValue('lico_access', ''),
      token: Session.getValue('lico_token', ''),
      // ldap: Session.getValue('lico_ldap', ''),
      ldapManaged: Parser.parseBooleanFromString(Session.getValue('lico_ldap_managed', 'true')),
      // ldapDefaultUsername: Session.getValue('lico_ldap_default_username', ''),
      featureCodes: Session.getValue('lico_feature_codes', '').split(','),
      workspace,
      clusterName: Session.getValue('cluster_name', ''),
      availableMetrics: Session.getValue('available_metrics', ''),
      prevActionFilePath: Session.getValue('prev_action_filepath', ''),
    })
  },
  setClusterName(context, payload) {
    context.commit('setUser', {
      username: Session.getValue('lico_username', ''),
      userid: Session.getValue('lico_userid', ''),
      role: Session.getValue('lico_role', ''),
      access: Session.getValue('lico_access', ''),
      token: Session.getValue('lico_token', ''),
      ldapManaged: Parser.parseBooleanFromString(Session.getValue('lico_ldap_managed', 'true')),
      featureCodes: Session.getValue('lico_feature_codes', '').split(','),
      workspace: Session.getValue('lico_workspace', ''),
      clusterName: payload.clusterName,
      availableMetrics: Session.getValue('available_metrics', ''),
      prevActionFilePath: Session.getValue('prev_action_filepath', ''),
    })
  },
  setAvailableMetrics(context, payload) {
    context.commit('setUser', {
      username: Session.getValue('lico_username', ''),
      userid: Session.getValue('lico_userid', ''),
      role: Session.getValue('lico_role', ''),
      access: Session.getValue('lico_access', ''),
      token: Session.getValue('lico_token', ''),
      ldapManaged: Parser.parseBooleanFromString(Session.getValue('lico_ldap_managed', 'true')),
      featureCodes: Session.getValue('lico_feature_codes', '').split(','),
      workspace: Session.getValue('lico_workspace', ''),
      clusterName: Session.getValue('cluster_name', ''),
      availableMetrics: payload.availableMetrics,
      prevActionFilePath: Session.getValue('prev_action_filepath', ''),
    })
  },
  setPrevActionFilePath(context, payload) {
    context.commit('setUser', {
      username: Session.getValue('lico_username', ''),
      userid: Session.getValue('lico_userid', ''),
      role: Session.getValue('lico_role', ''),
      access: Session.getValue('lico_access', ''),
      token: Session.getValue('lico_token', ''),
      ldapManaged: Parser.parseBooleanFromString(Session.getValue('lico_ldap_managed', 'true')),
      featureCodes: Session.getValue('lico_feature_codes', '').split(','),
      workspace: Session.getValue('lico_workspace', ''),
      clusterName: Session.getValue('cluster_name', ''),
      availableMetrics: Session.getValue('available_metrics', ''),
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
      // ldap: '',
      ldapManaged: true,
      // ldapDefaultUsername: '',
      featureCodes: [],
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
