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

module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: ['standard', 'plugin:vue/recommended', 'plugin:eqeqeq-fix/recommended', 'plugin:prettier/recommended'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['vue'],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    semi: ['error', 'never'],
    'vue/multi-word-component-names': 0,
    'vue/require-prop-types': 0,
    'vue/require-default-prop': 0,
    'vue/max-attributes-per-line': [
      2,
      {
        singleline: 10,
        multiline: 10,
      },
    ],
  },
  globals: {
    $jq: true,
    TerminalWindow: true,
    ace: true,
  },
}
