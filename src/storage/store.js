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

import Vue from 'vue'
import Vuex from 'vuex'
import authModule from './auth-module'
import settings from './settings-module'
import preference from './preference-module'
import elfinderModule from './elfinder-module'

// Install Vuex into Vue
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    auth: authModule,
    settings,
    preference,
    elfinder: elfinderModule,
  },
})

// Export store
export default store
