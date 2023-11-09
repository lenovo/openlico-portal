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

(function () {
  const elFinder = window.elFinder
  const defaultTheme = 'custom'
  const themes = {
    'custom': '../elfinder-custom/themes/custom/manifest.json',
    'default': '../elfinder-custom/themes/default/manifest.json',
    'dark-slim': '../elfinder-custom/themes/dark-slim/manifest.json',
    'material': '../elfinder-custom/themes/material/material-default.json',
    'material-gray': '../elfinder-custom/themes/material/material-gray.json',
    'material-light': '../elfinder-custom/themes/material/manifest-light.json',
  }

  elFinder.prototype._options.theme = defaultTheme
  elFinder.prototype._options.themes = themes
})()
