<template>
  <a-spin :spinning="loading">
    <div class="lico-fileManager" :style="{ height: height + 'px' }"></div>
  </a-spin>
</template>
<script>
import Format from '../common/format'
import AccessService from '../service/access'
import ErrorHandler from '../common/error-handler'
import { themes, defaultTheme } from 'static/js-extern/elfinder-custom/themes'
import ace from 'static/js-extern/elfinder-custom/js/custom-ace.js'

export default {
  props: ['initPath', 'mode', 'width', 'height', 'autoFocus'],
  data() {
    return {
      defaultFilePath: this.initPath || '',
      defaultSelectType: this.mode === 'file' ? 'choosefile' : this.mode === 'folder' ? 'choosefolder' : '',
      arch: AccessService.getSchedulerArch(),
      loading: true,
      containerContext: this.$store.state.auth.containerUserContext,
      customHeaders: this.getRequestHeaders(),
    }
  },
  computed: {
    matchWorkspace() {
      return this.defaultFilePath === this.$store.state.auth.workspace
    },
  },
  watch: {
    initPath: function (val, oldVal) {
      this.defaultFilePath = val
      this.getDataHash()
    },
  },
  mounted() {
    this.getDataHash()
  },
  beforeDestroy() {
    clearTimeout(this.refreshId)
    $jq('.elfinder-quicklook').trigger('close')
  },
  activated() {
    this.refreshToken()
  },
  methods: {
    reloadPath(path) {
      const elfinder = $jq('.lico-fileManager').elfinder('instance')
      elfinder.destroy()
      this.defaultFilePath = path
      this.getDataHash()
    },
    resize() {
      this.$nextTick(() => {
        $jq('.lico-fileManager').elfinder('instance').resize()
      })
    },
    refreshToken() {
      clearTimeout(this.refreshId)
      const elfinder = $jq('.lico-fileManager').elfinder('instance')
      if (elfinder) {
        elfinder.options.customHeaders.authorization = 'Jwt ' + this.$store.state.auth.token
      }
      this.refreshId = setTimeout(() => {
        this.refreshToken()
      }, 1000 * 60 * 5)
    },
    getDefaultPath() {
      let path = this.defaultFilePath || 'MyFolder'
      path = Format.formatWorkspace(path, this.arch).replace(/\/$/, '')

      this.defaultFilePath = path

      if (!this.matchWorkspace) {
        path = this.getFileParentFolder(path)
      }
      return path
    },
    getFileParentFolder(path) {
      const temp = path.split('/')
      temp.pop()
      path = temp.join('/')
      return path
    },
    getRequestHeaders() {
      const headers = {
        authorization: 'Jwt ' + this.$store.state.auth.token,
        //    "Content-Type": "application/json"
      }
      // const arch = this.arch || AccessService.getSchedulerArch()
      return headers
    },
    getDataHash() {
      const self = this
      self.defaultFilePath = self.getDefaultPath()
      $jq
        .ajax({
          url: '/api/external/file/',
          type: 'GET',
          dataType: 'json',
          headers: self.customHeaders,
          data: { cmd: 'hash', target: self.defaultFilePath },
        })
        .done(res => {
          if (res.exists) {
            // self.$store.dispatch("elfinder/setStorage", res.hash);
            self.showManager(res.hash)
          } else {
            self.$message.warning(self.$t('FileSelect.Path.InValid', { path: self.defaultFilePath }))
            if (!this.matchWorkspace) {
              self.defaultFilePath = Format.formatWorkspace('MyFolder', this.arch)
              self.getDataHash()
            }
          }
        })
        .catch(err => {
          if (err.status === 502) {
            self.$message.error(self.$t('Admin.FileManager.NotReady'))
          } else {
            ErrorHandler.restApiErrorHandler(err, self.$message.error)
          }
        })
    },
    showManager(hash) {
      const self = this
      const options = {
        url: '/api/external/file/',
        customHeaders: self.customHeaders,
        customParams: {
          params: {},
          enabled: false,
          openType: self.defaultSelectType ? 'select' : 'manager',
        },
        requestType: 'post',
        // startPathHash: '',
        startPathHash: hash || '',
        lang: self.$i18n.locale === 'en' ? 'en' : 'zh_CN',
        defaultView: 'list',
        // onlyMimes: ["all"],
        rememberLastDir: false,
        useBrowserHistory: false,
        resizable: false,
        width: self.width || '',
        height: self.height || '',
        ui: ['toolbar', 'tree', 'path'],
        commands: ['choosefolder', 'choosefile', '*'],
        uiOptions: {
          toolbar: [
            ['back', 'forward'],
            ['home'],
            [self.defaultSelectType],
            ['reload'],
            ['upload', 'download'],
            ['mkdir', 'mkfile', 'rm'],
            ['sort'],
            ['search'],
          ],
          toolbarExtra: {
            // also displays the text label on the button (true / false / 'none')
            displayTextLabel: 'none',
            // Initial setting value of hide button in toolbar setting
            defaultHides: [],
            // show Preference button into contextmenu of the toolbar (true / false)
            preferenceInContextmenu: false,
          },
        },
        contextmenu: {
          // navbarfolder menu
          navbar: ['open', '|', 'rm'],

          // current directory menu
          cwd: ['paste', '|', 'reload', 'back', '|', 'upload', 'mkdir', 'mkfile'],

          // current directory file menu
          files: [
            'copy',
            'cut',
            'paste',
            'duplicate',
            '|',
            'download',
            '|',
            'rm',
            '|',
            'edit',
            'rename',
            '|',
            'quicklook',
            'extract',
            'archive',
            '|',
            'info',
          ],
        },
        cssAutoLoad: true,
        theme: defaultTheme,
        themes,
        commandsOptions: {
          info: {
            nullUrlDirLinkSelf: false,
            // Information items to be hidden by default
            // These name are 'size', 'aliasfor', 'path', 'link', 'dim', 'modify', 'perms', 'locked', 'owner', 'group', 'perm' and your custom info items label
            hideItems: ['path', 'perms', 'locked'],
            // Array of hash algorisms to show on info dialog
            // These name are 'md5', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512', 'sha3-224', 'sha3-256', 'sha3-384', 'sha3-512', 'shake128' and 'shake256'
            showHashAlgorisms: [],
            custom: {
              /**
               * Example of custom info `desc`
               */
              desc: {
                tpl: '<div class="elfinder-info-custom"><span class="elfinder-spinner"></span></div>',
                action: function (file, fm, dialog) {
                  let url = fm.options.url
                  url += 'download/?cmd=file&target=' + file.hash + '&download=1'
                  if (fm.options.customParams.enabled) {
                    for (const key in fm.options.customParams.params) {
                      url += `&${key}=${fm.options.customParams.params[key]}`
                    }
                  }
                  url += '&token=' + self.$store.state.auth.token
                  // var url = "/api/file/static" + file.path;
                  if (file.mime === 'directory') {
                    $jq(dialog.find('a').closest('tr')).remove()
                  } else $jq(dialog.find('a').attr('href', url))
                  $jq(dialog.find('div.elfinder-info-custom').closest('tr')).remove()
                },
              },
            },
          },
          quicklook: {
            autoplay: false,
            pdfToolbar: false,
          },
          edit: {
            editors: [ace],
          },
          upload: {
            ui: 'uploadbutton',
          },
        },
        chooseFileCallback: function (file, instance) {
          self.$emit('selected', Format.formatMyFolder(file.path, self.arch))
        },
        getFolderCallback: function (folder, instance) {
          self.$emit('selected', Format.formatMyFolder(folder.path, self.arch))
        },
      }
      $jq('.lico-fileManager').elfinder(
        options,
        // 2nd Arg - before boot up function
        function (fm, extraObj) {
          // `init` event callback function
          fm.bind('load', function () {
            if (self.mode) {
              $jq('.elfinder-button-icon-' + self.defaultSelectType)
                .addClass('elfinder-button-icon-custom')
                .text(self.$t(`Elfinder.Select.${self.mode}`))
                .next('.elfinder-button-text')
                .text('')
            }
            fm.messages.dropPasteFiles = self.$t('FileManager.Upload.Drop.Msg')
            if (self.autoFocus !== false) {
              setTimeout(() => {
                fm.enable()
              }, 200)
            }
            self.refreshToken()
          })
          self.loading = false
        },
      )
    },
  },
}
</script>
