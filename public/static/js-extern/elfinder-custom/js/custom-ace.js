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

const $ = jQuery // eslint-disable-line no-undef
export default {
  // ACE Editor
  // called on initialization of elFinder cmd edit (this: this editor's config object)
  setup: function (opts, fm) {
    const editors = opts.editors.map(el => {
      if (el.info.tag === 'ace') {
        el.info.name = window.gApp.$t('Action.Edit')
      }
      return el
    })
    fm.options.commandsOptions.edit.editors = editors
    if (fm.UA.ltIE8) {
      this.disabled = true
    }
  },
  // `mimes` is not set for support everything kind of text file
  info: {
    id: 'aceeditor',
    name: 'ACE Editor',
    iconImg: 'img/editor-icons.png 0 -96',
    tag: 'ace',
  },
  load: function (textarea) {
    const self = this
    const dfrd = $.Deferred()
    const cdn = 'static/js-extern/ace'
    const init = function () {
      self.fm.loadScript(
        [cdn + '/ext-modelist.js', cdn + '/ext-settings_menu.js', cdn + '/ext-language_tools.js'],
        start,
      )
    }
    const start = function () {
      let editor // eslint-disable-line prefer-const
      let editorBase // eslint-disable-line prefer-const
      let mode
      const ta = $(textarea)
      const taBase = ta.parent()
      //   var dialog = taBase.parent()
      const id = textarea.id + '_ace'
      //   var ext = self.file.name.replace(/^.+\.([^.]+)|(.+)$/, '$1$2').toLowerCase()
      // MIME/mode map
      const mimeMode = {
        'text/x-php': 'php',
        'application/x-php': 'php',
        'text/html': 'html',
        'application/xhtml+xml': 'html',
        'text/javascript': 'javascript',
        'application/javascript': 'javascript',
        'text/css': 'css',
        'text/x-c': 'c_cpp',
        'text/x-csrc': 'c_cpp',
        'text/x-chdr': 'c_cpp',
        'text/x-c++': 'c_cpp',
        'text/x-c++src': 'c_cpp',
        'text/x-c++hdr': 'c_cpp',
        'text/x-shellscript': 'sh',
        'application/x-csh': 'sh',
        'text/x-python': 'python',
        'text/x-java': 'java',
        'text/x-java-source': 'java',
        'text/x-ruby': 'ruby',
        'text/x-perl': 'perl',
        'application/x-perl': 'perl',
        'text/x-sql': 'sql',
        'text/xml': 'xml',
        'application/docbook+xml': 'xml',
        'application/xml': 'xml',
      }

      // set basePath of ace
      ace.config.set('basePath', cdn)

      // set base height
      taBase.height(taBase.height())

      // detect mode
      mode = ace.require('ace/ext/modelist').getModeForPath('/' + self.file.name).name
      if (mode === 'text') {
        if (mimeMode[self.file.mime]) {
          mode = mimeMode[self.file.mime]
        }
      }

      // show MIME:mode in title bar
      taBase
        .prev()
        .children('.elfinder-dialog-title')
        .append(' (' + self.file.mime + ' : ' + mode.split(/[\/\\]/).pop() + ')') // eslint-disable-line no-useless-escape

      // TextArea button and Setting button
      $('<div class="ui-dialog-buttonset"/>')
        .css('float', 'left')
        .append(
          $('<button>TextArea</button>')
            .button()
            .on('click', function () {
              if (ta.data('ace')) {
                ta.removeData('ace')
                editorBase.hide()
                ta.val(editor.session.getValue()).show().focus()
                $(this).text('AceEditor')
              } else {
                ta.data('ace', true)
                editorBase.show()
                editor.setValue(ta.hide().val(), -1)
                editor.focus()
                $(this).text('TextArea')
              }
            }),
        )
        .append(
          $('<button>Ace editor setting</button>')
            .button({
              icons: {
                primary: 'ui-icon-gear',
                secondary: 'ui-icon-triangle-1-e',
              },
              text: false,
            })
            .on('click', function () {
              editor.showSettingsMenu()
            }),
        )
        .prependTo(taBase.next())

      // Base node of Ace editor
      editorBase = $('<div id="' + id + '" style="width:100%; height:100%;"/>')
        .text(ta.val())
        .insertBefore(ta.hide())

      // Ace editor configure
      ta.data('ace', true)
      editor = ace.edit(id)
      ace.require('ace/ext/language_tools')
      ace.require('ace/ext/settings_menu').init(editor)
      editor.$blockScrolling = Infinity
      editor.setOptions({
        theme: 'ace/theme/monokai',
        mode: 'ace/mode/' + mode,
        fontSize: '14px',
        wrap: true,
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false,
      })
      editor.commands.addCommand({
        name: 'saveFile',
        bindKey: {
          win: 'Ctrl-s',
          mac: 'Command-s',
        },
        exec: function (editor) {
          self.doSave()
        },
      })
      editor.commands.addCommand({
        name: 'closeEditor',
        bindKey: {
          win: 'Ctrl-w|Ctrl-q',
          mac: 'Command-w|Command-q',
        },
        exec: function (editor) {
          self.doCancel()
        },
      })

      editor.resize()

      dfrd.resolve(editor)
    }

    // init & start
    init()

    return dfrd
  },
  close: function (textarea, instance) {
    if (instance) {
      instance.destroy()
      $(textarea).show()
    }
  },
  save: function (textarea, instance) {
    instance && $(textarea).data('ace') && (textarea.value = instance.session.getValue())
  },
  focus: function (textarea, instance) {
    instance && $(textarea).data('ace') && instance.focus()
  },
  resize: function (textarea, instance, e, data) {
    instance && instance.resize()
  },
}
