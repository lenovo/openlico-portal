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

import { ref, onMounted, onActivated, onDeactivated, getCurrentInstance } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import Utils from '../common/utils'

export function useKeepAlive(componentRef) {
  const leaveTimestamp = ref(0)
  const autoRefreshList = ref([])

  onMounted(() => {
    if (componentRef) {
      const { proxy } = getCurrentInstance()
      if (typeof componentRef === 'function') {
        autoRefreshList.value = componentRef.call(this)
      } else {
        autoRefreshList.value.push(proxy.$refs[componentRef])
      }
    }
  })
  onActivated(() => {
    if (componentRef) {
      // leaveDuration: Duration of stay on the details page
      const leaveDuration = new Date().getTime() - leaveTimestamp.value
      // If leaving the list view too long time (more than the original refreshing interval),
      // the list need refresh immediately when activing.
      autoRefreshList.value.forEach(el => {
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
  })
  onDeactivated(() => {
    if (componentRef) {
      autoRefreshList.value.forEach(el => {
        const refComponent = el
        if (refComponent && refComponent.pauseAutoRefresh) {
          refComponent.pauseAutoRefresh()
        }
      })
      leaveTimestamp.value = new Date().getTime()
    }
  })
  onBeforeRouteLeave((to, from, next) => {
    let keepAliveList = window.gApp.$store.getters['settings/getKeepAlivePages'].filter(i => i !== from.name)
    if (checkKeepAliveByRoute(from)) {
      if (Utils.findDetailPathByRoute(from, to)) {
        keepAliveList.push(from.name)
      }
      window.gApp.$store.dispatch('settings/setKeepAlivePages', keepAliveList).then(() => {
        next()
      })
    } else {
      next()
    }
  })
}

export function checkKeepAliveByRoute(route) {
  const keepAlive = route.meta.keepAlive
  const access = window.gApp.$store.state.auth.access
  if (typeof keepAlive === 'string') {
    return keepAlive === access
  } else if (Array.isArray(keepAlive)) {
    return keepAlive.includes(access)
  } else {
    return Boolean(keepAlive)
  }
}

export function clearKeepAliveByRoute(r1, r2, name) {
  return new Promise(resolve => {
    let keepAliveList = window.gApp.$store.getters['settings/getKeepAlivePages']
    if (keepAliveList.includes(name) && !Utils.findDetailPathByRoute(r1, r2)) {
      keepAliveList = keepAliveList.filter(i => i !== name)
      window.gApp.$store.dispatch('settings/setKeepAlivePages', keepAliveList).then(() => {
        resolve()
      })
    } else {
      resolve()
    }
  })
}
