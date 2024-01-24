<template>
  <div class="main-tools-drawer">
    <a-drawer
      root-class-name="main-tools-drawer-continer"
      placement="bottom"
      :closable="false"
      :open="visible"
      :mask="false"
      :mask-closable="false"
      :height="height">
      <template #title>
        <div class="main-tools-top" @touchmove.prevent>
          <div
            class="main-tools-drag-row"
            :title="$t('MainTools.Header.Title.Msg')"
            @dblclick="onVisible({})"
            @mousedown="onMousedown($event, 'y')">
            <div />
          </div>
        </div>
      </template>
      <div class="main-tools-content">
        <div
          v-show="showFilemanager && filemanagerEnable"
          class="main-tools-filemanager"
          :style="'width: ' + filemanagerWidth + 'px;'">
          <div class="main-tools-filemanager-title">
            <span>{{ $t('MainTools.FileManage') }}</span>
            <span
              v-show="shellEnable && showShell"
              class="main-tools-min"
              style="float: right"
              @click="onMinCkick('shell')">
              <span class="el-erp-SystemToolsMax" />
            </span>
          </div>
          <file-manager ref="mainFilemanager" :height="height - 41" :init-path="filePath" :auto-focus="false" />
        </div>
        <div class="main-tools-drag-col">
          <div
            style="height: 32px"
            :style="!showFilemanager || !showShell ? 'background: #fff;' : 'background: #eee;'" />
          <div
            class="main-tools-drag-col-poninter"
            :class="{
              'main-tools-drag': showFilemanager && showShell && filemanagerEnable && shellEnable,
              'main-filemanager-restore': !showFilemanager,
              'main-ssh-restore': !showShell,
            }"
            @mousedown="onMousedown($event, 'x')"
            @click="onRestoreClick"
            @touchmove.prevent>
            <double-right-outlined v-if="!showFilemanager && filemanagerEnable" />
            <double-left-outlined v-if="!showShell && shellEnable" />
          </div>
        </div>
        <div v-show="showShell && shellEnable" class="main-tools-ssh" :style="'width: ' + sshWidth + 'px;'">
          <div class="main-tools-ssh-header">
            <span class="main-tools-ssh-header-title">{{ $t('MainTools.Console') }}</span>
            <div class="main-tools-ssh-tabs-title" style="width: 100%">
              <div class="main-tools-ssh-tabs-title-container">
                <span
                  v-for="item in terminalList"
                  :key="item.id"
                  class="main-tools-ssh-tabs-title-item"
                  :class="{ 'main-tools-active': item.visible }"
                  :title="item.title"
                  @click="onTerminalTabclick(item.id)">
                  <span class="main-tools-ssh-tabs-item-title">{{ item.hostname }}</span>
                  <close-outlined @click="onCloseSSHClick($event, item)" />
                  <i class="main-tools-ssh-tabs-item-border" />
                </span>
              </div>
              <span v-if="terminalList.length < maxConnected" class="main-tools-ssh-item-add" @click="onAddSSHClick">
                <plus-outlined />
              </span>
            </div>
            <span
              v-show="filemanagerEnable && showFilemanager"
              class="main-tools-min"
              style="padding: 4px 15px 0 0"
              @click="onMinCkick('file')">
              <span class="el-erp-SystemToolsMax" style="font-weight: bold" />
            </span>
            <div class="main-tools-ssh-header-border" />
          </div>
          <div class="main-tools-ssh-content" :style="'height: ' + (height - 41) + 'px;'">
            <div v-for="item in terminalList" v-show="item.visible" :id="item.id" :key="item.id" style="height: 100%">
              <main-tools-terminal
                ref="mainToolsTerminal"
                :hostname="item.hostname"
                :type="item.type"
                @destroy-terminal="onCloseSSHClick('', item)" />
            </div>
            <div v-if="!terminalList.length" class="main-tools-ssh-default-diaplay">
              <div>
                <img src="/static/img/system/main/no_connected.png" style="width: 50px; height: 50px" />
                <p style="color: #bbb">
                  {{ $t('MainTools.NoConnect') }}
                </p>
                <a-button @click="onAddSSHClick">
                  {{ $t('Action.Connect') }}
                </a-button>
              </div>
            </div>
          </div>
        </div>
        <ssh-action-dialog ref="sshActionDialog" />
      </div>
    </a-drawer>
  </div>
</template>
<script>
import FileManager from '@/component/file-manager.vue'
import SshActionDialog from './main-tools/ssh-action-dialog.vue'
import MainToolsTerminal from './main-tools/main-tools-terminal.vue'
import { v4 as uuidv4 } from 'uuid'
import AccessService from '@/service/access'
import { h } from 'vue'

export default {
  components: {
    FileManager,
    SshActionDialog,
    MainToolsTerminal,
  },
  data() {
    return {
      visible: false,
      mousedown: false,
      showFilemanager: true,
      showShell: true,
      maxHeight: 0.7,
      minHeight: 0.3,
      height: document.documentElement.clientHeight * 0.5,
      width: 0,
      minWidth: 0.3,
      maxWidth: 0.7,
      maxConnected: 10,
      offset: {
        x: 0,
        y: 0,
      },
      direction: '',
      terminalList: [],
      filePath: '',
    }
  },
  computed: {
    filemanagerWidth() {
      return this.width
    },
    sshWidth() {
      return document.documentElement.clientWidth - 6 - this.width
    },
    filemanagerEnable() {
      return true
    },
    shellEnable() {
      return (
        AccessService.getMatchFeatureCodes(['sc.host.*,monitor.cluster'], this.$store.state.auth.featureCodes).length >
        0
      )
    },
  },
  watch: {
    terminalList(val) {
      this.resizeTools()
    },
  },
  mounted() {
    this.initTools()
    window.addEventListener('mousemove', this.getResizePosition)
    window.addEventListener('mouseup', this.onMouseup)
    window.addEventListener('onMainToolsVisible', this.onVisible)
    window.addEventListener('resize', this.windowResize)
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.getResizePosition)
    window.removeEventListener('mouseup', this.onMouseup)
    window.removeEventListener('onMainToolsVisible', this.onVisible)
    window.removeEventListener('resize', this.windowResize)
    window.gApp.mainToolsVisible = false
  },
  methods: {
    windowResize() {
      this.initTools()
      this.resizeTools()
    },
    initTools() {
      const docHeight = document.documentElement.clientHeight
      const docWidth = document.documentElement.clientWidth - 6

      const height = docHeight * Number(this.$store.getters['settings/getMainToolsY'])
      this.height = height ? Number(height) : docHeight * 0.5

      const showFilemanager = this.$store.getters['settings/getMainToolsFM']
      this.showFilemanager = showFilemanager === undefined ? true : showFilemanager

      const showShell = this.$store.getters['settings/getMainToolsShell']
      this.showShell = showShell === undefined ? true : showShell

      const width = docWidth * Number(this.$store.getters['settings/getMainToolsX'])
      this.width = width ? Number(width) : docWidth * 0.5

      if (!this.showFilemanager || !this.filemanagerEnable) {
        this.onMinCkick('file')
      } else if (!this.showShell || !this.shellEnable) {
        this.onMinCkick('shell')
      }
    },
    onVisible(e) {
      const visible = e.visible !== undefined ? e.visible : !window.gApp.mainToolsVisible
      this.visible = visible
      window.gApp.mainToolsVisible = visible

      if (this.visible) {
        if (!document.getElementById('main-tools-sitting')) {
          const div = document.createElement('div')
          div.id = 'main-tools-sitting'
          div.style.height = this.height + 'px'
          document.querySelector('.main-content-wrapper').append(div)
        }
        if (e.nodes && Array.isArray(e.nodes)) {
          const nodes = e.nodes.map(i => ({
            hostname: i.hostname,
            terminalType: i.type,
          }))
          if (this.maxConnected < nodes.length + this.terminalList.length) {
            const max = this.maxConnected - this.terminalList.length
            nodes.splice(max, nodes.length - max)
            this.$warning({
              centered: true,
              zIndex: 1004,
              title: this.$t('MainTools.MaxConnected.Msg'),
              okText: this.$t('Action.Ok'),
            })
          }
          this.initTerminal(nodes)
          if (!this.showShell) {
            this.onRestoreClick()
          }
        }

        if (e.workspace) {
          this.filePath = e.workspace || ''
          this.$refs.mainFilemanager && this.$refs.mainFilemanager.reloadPath(this.filePath)

          let event = new Event('elEditorAction')
          event.data = { type: 'clear' }
          window.dispatchEvent(event)
        }
      } else {
        document.getElementById('main-tools-sitting').remove()
      }
    },
    onMousedown(e, direction) {
      e.stopPropagation()
      e.preventDefault()
      this.direction = direction
      this.offset[direction] = e[direction]
      this.mousedown = true
    },
    onMouseup() {
      this.mousedown = false
    },
    getResizePosition(e) {
      if (this.mousedown) {
        e.stopPropagation()
        e.preventDefault()
        if (this.direction === 'y') {
          const docHeight = document.documentElement.clientHeight
          let height = this.height + (this.offset[this.direction] - e[this.direction])
          const heightRate = height / docHeight
          if (heightRate >= this.maxHeight) height = this.maxHeight * docHeight
          if (heightRate <= this.minHeight) height = this.minHeight * docHeight
          this.height = height
          document.getElementById('main-tools-sitting').style.height = height + 'px'
          this.offset[this.direction] = e[this.direction]
          this.$store.dispatch('settings/setMainToolsY', height / docHeight)
        }
        if (this.direction === 'x' && this.showFilemanager && this.showShell) {
          const docWidth = document.documentElement.clientWidth - 6
          let width = this.width + (e[this.direction] - this.offset[this.direction])
          const widthRate = width / docWidth
          if (widthRate <= this.minWidth) width = this.minWidth * docWidth
          if (widthRate >= this.maxWidth) width = this.maxWidth * docWidth
          this.width = width
          this.offset[this.direction] = e[this.direction]
          this.$store.dispatch('settings/setMainToolsX', width / docWidth)
        }
        this.resizeTools()
      }
    },
    onMinCkick(type) {
      if (this.showFilemanager && this.showShell) {
        this.$store.dispatch('settings/setMainToolsX', this.width / (document.documentElement.clientWidth - 6))
      }
      if (type === 'file') {
        this.showFilemanager = false
        this.showShell = true
        this.width = 14
      }
      if (type === 'shell') {
        this.showShell = false
        this.showFilemanager = true
        this.width = document.documentElement.clientWidth - 14
      }
      this.resizeTools()
    },
    onRestoreClick() {
      if (!this.shellEnable) return
      if (this.showFilemanager && this.showShell) return
      this.width = Number(this.$store.getters['settings/getMainToolsX']) * (document.documentElement.clientWidth - 6)
      this.showFilemanager = true
      this.showShell = true
      this.resizeTools()
    },
    onAddSSHClick() {
      this.$refs.sshActionDialog.onConnect().then(
        res => {
          this.initTerminal([res])
        },
        _ => {},
      )
    },
    initTerminal(nodes) {
      if (!nodes.length) return
      const terminalNodes = nodes.map((item, i) => ({
        id: uuidv4(),
        hostname: item.hostname,
        title: `${item.terminalType === 'shell' ? 'SSH' : 'Console'}: ${item.hostname}`,
        type: item.terminalType,
        visible: i === nodes.length - 1,
      }))
      this.terminalList = this.terminalList
        .map(item => {
          item.visible = false
          return item
        })
        .concat(terminalNodes)
    },
    onTerminalTabclick(id) {
      this.terminalList = this.terminalList.map(i => {
        i.visible = i.id === id
        return i
      })
      this.$nextTick(() => {
        $(`#${id} .termwindow .focusBtn`).click()
      })
    },
    onCloseSSHClick(e, node) {
      if (e) {
        e.stopPropagation()
        e.preventDefault()
        this.$confirm({
          centered: true,
          zIndex: 3000,
          title: h(
            'div',
            {
              style: 'color: rgba(0,0,0,.85);font-size: 14px;font-weight: 400;',
            },
            this.$T('MainTools.SSH.Close.Msg', { hostname: node.hostname }),
          ),
          onOk: () => {
            this.closeSSH(node)
          },
        })
      } else {
        this.closeSSH(node)
      }
    },
    closeSSH(node) {
      const terminals = this.terminalList.filter(n => n.id !== node.id)
      if (node.visible && terminals.length) {
        terminals[terminals.length - 1].visible = true
      }

      this.terminalList = terminals
    },
    resizeTools() {
      this.$nextTick(() => {
        if (this.$refs.mainToolsTerminal) {
          this.$refs.mainToolsTerminal.forEach(i => {
            i.resize()
          })
        }
        if (this.$refs.mainFilemanager && $('.lico-fileManager').elfinder('instance')) {
          this.$refs.mainFilemanager.resize()
        }
        if (this.filemanagerEnable) {
          this.$store.dispatch('settings/setMainToolsFM', this.showFilemanager)
        }
        if (this.shellEnable) {
          this.$store.dispatch('settings/setMainToolsShell', this.showShell)
        }
      })
    },
  },
}
</script>
<style lang="css" scoped>
.main-tools-top {
  padding: 2px 0;
  background: #eee;
}
.main-tools-drag-row {
  height: 6px;
  cursor: n-resize;
}
.main-tools-drag-row > div {
  height: 6px;
  width: 18px;
  margin: auto;
  box-sizing: border-box;
  border-top: 2px solid #bbb;
  border-bottom: 2px solid #bbb;
}
.main-tools-drag-col {
  display: flex;
  flex-direction: column;
  background: #eee;
}
.main-tools-drag-col-poninter {
  width: 14px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.main-tools-drag-col-poninter.main-filemanager-restore {
  background: #676767;
}
.main-tools-drag-col-poninter.main-ssh-restore {
  background: #eee;
}
.main-tools-drag-col-poninter:hover {
  color: #5fbdfc;
  cursor: pointer;
}
.main-tools-drag-col-poninter.main-tools-drag {
  width: 6px;
  cursor: col-resize;
}
.main-tools-content,
.main-tools-ssh-default-diaplay {
  height: 100%;
  display: flex;
}
.main-tools-filemanager-title {
  height: 30px;
}
.main-tools-filemanager-title > span {
  line-height: 30px;
  padding: 0 15px;
  font-weight: bold;
}
.main-tools-ssh {
  height: 100%;
}
.main-tools-ssh-header {
  display: flex;
  width: 100%;
  position: relative;
}
.main-tools-ssh-header > span:first-child {
  display: block;
  line-height: 30px;
  font-weight: bold;
  padding-left: 15px;
  width: 100px;
}
.main-tools-ssh-header > span:last-child {
  display: inline-block;
  width: 44px;
  line-height: 30px;
  padding: 0 15px;
}
.main-tools-ssh-header-border {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: #bbb;
}
.main-tools-min {
  cursor: pointer;
}
.main-tools-ssh-tabs-title-container {
  display: inline-block;
  /* max-width: calc(100% - 14px) !important;
     overflow: hidden !important; */
}
.main-tools-ssh-tabs-title-item {
  position: relative;
  display: inline-block;
  margin-right: 20px;
  cursor: default;
}
.main-tools-ssh-tabs-title-item > span {
  line-height: 30px;
  font-size: 12px;
}
.main-tools-ssh-tabs-item-title {
  padding-left: 5px;
  margin-right: 5px;
}
.main-tools-ssh-tabs-item-border {
  position: absolute;
  display: inline-block;
  height: 2px;
  background: transparent;
  width: 100%;
  bottom: 4px;
  left: 0;
}
.main-tools-ssh-tabs-title-item.main-tools-active > .main-tools-ssh-tabs-item-border {
  background: #5fbdfc;
}
.main-tools-ssh-tabs-item-close {
  cursor: pointer;
  font-size: 10px;
}
.main-tools-ssh-tabs-title-item.main-tools-active > .main-tools-ssh-tabs-item-title,
.main-tools-ssh-tabs-item-title:hover,
.main-tools-ssh-tabs-item-close:hover,
.main-tools-ssh-item-add:hover {
  color: #5fbdfc;
}
.main-tools-ssh-item-add {
  display: inline-block;
  margin: 4px 0;
  cursor: pointer;
}
.main-tools-ssh-default-diaplay > div {
  margin: auto;
  text-align: center;
}
.main-tools-ssh-content :deep(.termwindow .grip) {
  display: none;
}
</style>
