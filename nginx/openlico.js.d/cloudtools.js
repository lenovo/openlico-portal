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

async function redirect_share_url(r) {
  try {
    let res = await r.subrequest('/api/cloudtools/share/', { args: `uuid=${r.variables.uuid}` })

    if (res.status >= 300) {
      r.return(404)
      return
    }

    let response = JSON.parse(res.responseText)
    r.return(301, response['redirect_url'])
  } catch (e) {
    r.return(500)
  }
}

export default { redirect_share_url }

