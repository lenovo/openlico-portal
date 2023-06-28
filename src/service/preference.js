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

class Preference {
  constructor() {
    this.pageSize = 20
    this.pageSizes = ['10', '20', '40', '50']
  }

  // static parseFromRestApi(jsonObj) {
  //   var preference = new Preference();
  //   for (var key in jsonObj) {
  //     preference[key] = jsonObj[key];
  //   }
  //   return preference
  // }
}

function init() {
  const preference = new Preference()
  window.gApp.$store.dispatch('preference/setPreference', preference)
}

function getPreferenceByKey(key) {
  const preference = window.gApp.$store.getters['preference/getPreference']
  return preference[key]
}

function setPreferenceValue(key, value) {
  const preference = window.gApp.$store.getters['preference/getPreference']
  preference[key] = value
  // var req = Preference.parseFromRestApi(preference);
  window.gApp.$store.dispatch('preference/setPreference', preference)
}

export default {
  init,
  getPreferenceByKey,
  setPreferenceValue,
}
