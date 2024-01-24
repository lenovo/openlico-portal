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
