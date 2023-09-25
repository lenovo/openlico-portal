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

import Utils from '../common/utils'
export default function (componentName, autoRefreshComponentRef) {
  return {
    data() {
      return {
        scrollTop: 0,
        leaveTimestamp: 0,
      }
    },
    activated() {
      // leaveDuration: Duration of stay on the details page
      const leaveDuration = new Date().getTime() - this.leaveTimestamp
      document.getElementsByTagName('html')[0].scrollTop = this.scrollTop
      this.scrollTop = 0
      if (autoRefreshComponentRef) {
        let autoRefreshList = []
        if (typeof autoRefreshComponentRef === 'function') {
          autoRefreshList = autoRefreshComponentRef.call(this)
        } else {
          autoRefreshList = [this.$refs[autoRefreshComponentRef]]
        }
        // If leaving the list view too long time (more than the original refreshing interval),
        // the list need refresh immediately when activing.
        autoRefreshList.forEach(el => {
          const refComponent = el
          if (refComponent && refComponent.resumeAutoRefresh) {
            if (window.gApp.updateImmediate || leaveDuration > refComponent.autoRefresh) {
              refComponent.resumeAutoRefresh()
            } else {
              setTimeout(() => {
                if (refComponent) {
                  refComponent.resumeAutoRefresh()
                }
              }, refComponent.autoRefresh)
            }
          }
        })
      }
      window.gApp.updateImmediate = false
    },
    deactivated() {
      let autoRefreshList = []
      if (typeof autoRefreshComponentRef === 'function') {
        autoRefreshList = autoRefreshComponentRef.call(this)
      } else {
        autoRefreshList = [this.$refs[autoRefreshComponentRef]]
      }
      autoRefreshList.forEach(el => {
        const refComponent = el
        if (refComponent && refComponent.pauseAutoRefresh) {
          refComponent.pauseAutoRefresh()
        }
      })
      this.leaveTimestamp = new Date().getTime()
    },
    beforeRouteEnter(to, from, next) {
      const keepAlivePages = window.gApp.$store.getters['settings/getKeepAlivePages']
      if (!Utils.findDetailPathByRoute(to, from)) {
        const index = keepAlivePages.indexOf(componentName)
        if (index !== -1) {
          keepAlivePages.splice(index, 1)
        }
      }
      window.gApp.$store.dispatch('settings/setKeepAlivePages', keepAlivePages).then(() => {
        next()
      })
    },
    beforeRouteLeave(to, from, next) {
      const keepAlivePages = this.$store.getters['settings/getKeepAlivePages']
      if (!Utils.findDetailPathByRoute(from, to)) {
        const index = keepAlivePages.indexOf(componentName)
        if (index !== -1) {
          keepAlivePages.splice(index, 1)
        }
      } else {
        if (keepAlivePages.indexOf(componentName) === -1) {
          keepAlivePages.push(componentName)
        }
      }
      // Clicking on the breadcrumbs to jump to the page will not record the scroll position of the page,
      // need to save the value of the page scroll position
      this.scrollTop = document.getElementsByTagName('html')[0].scrollTop
      this.$store.dispatch('settings/setKeepAlivePages', keepAlivePages).then(() => {
        next()
        if (!to.meta.keepAlive) {
          document.getElementsByTagName('html')[0].scrollTop = 0
        }
      })
    },
  }
}
