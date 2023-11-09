/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: ['plugin:vue/vue3-recommended', 'eslint:recommended', '@vue/eslint-config-prettier/skip-formatting'],
  rules: {
    'no-unused-vars': 0,
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
  parserOptions: {
    ecmaVersion: 'latest',
  },
  globals: {
    $: true,
    jQuery: true,
    TerminalWindow: true,
    elFinder: true,
    ace: true,
    gApp: true,
  },
}
