<template><div></div></template>
<script>
import NodeService from '@/service/node'

export default {
  props: ['autoClose'],
  emits: ['terminalClose'],
  data() {
    return {
      terminalWindows: [],
      terminalContainer: null,
      screenWidth: document.body.clientWidth,
      autoResizeTimerId: 0,
      autoConnectTimerId: 0,
      latestHostname: null,
    }
  },
  watch: {
    screenWidth(val, oldVal) {
      if (this.autoResizeTimerId <= 0) {
        const self = this
        self.autoResizeTimerId = setTimeout(function () {
          self.autoResizeTerminalWindows()
          self.autoResizeTimerId = 0
        }, 200)
      }
    },
  },
  mounted() {
    const self = this
    window.onresize = () => {
      return (() => {
        self.screenWidth = document.body.clientWidth
      })()
    }
    this.startAutoConnect()
  },
  beforeUnmount() {
    window.onresize = null
    this.stopAutoConnect()
  },
  methods: {
    popupConsole(hostname) {
      const serviceUrl = NodeService.getNodeConsoleServiceUrl(hostname)
      const title = this.$T('WebTerminal.Console.Title', {
        hostname,
      })
      this.createTerminalWindow(hostname, serviceUrl, title)
    },
    popupShell(hostname) {
      const serviceUrl = NodeService.getNodeShellServiceUrl(hostname)
      const title = this.$T('WebTerminal.Shell.Title', {
        hostname,
      })
      this.createTerminalWindow(hostname, serviceUrl, title)
    },
    initShell(hostname, domElement, type = 'shell') {
      if (this.terminalWindows.length > 0) {
        window.CloseTerminals()
        this.terminalWindows = []
        this.terminalContainer = null
      }
      let serviceUrl = ''
      let title = ''

      if (type === 'shell') {
        serviceUrl = NodeService.getNodeShellServiceUrl(hostname)
        title = this.$T('WebTerminal.Shell.Title', { hostname })
      }
      if (type === 'console') {
        serviceUrl = NodeService.getNodeConsoleServiceUrl(hostname)
        title = this.$T('WebTerminal.Console.Title', { hostname })
      }

      const terminal = this.createTerminalWindow(hostname, serviceUrl, title)
      const css = [
        'box-shadow: none',
        'position: relative',
        'float: left',
        'border: none',
        'padding-top: 0px',
        'top: 0px',
        'left: 0px',
        'z-index: 0',
      ]
      terminal.element.style.cssText = css.join(';')
      terminal.element.children[1].style.display = 'none'
      domElement.appendChild(terminal.element)
      // this.terminalWindows.push(terminal);
      this.terminalContainer = domElement
      this.$nextTick(() => {
        this.autoResizeTerminalWindows()
      })
    },
    createTerminalWindow(hostname, serviceUrl, title) {
      this.latestHostname = hostname
      const position = this.calculateWindowPosition(this.terminalWindows.length)
      const terminalWindow = new TerminalWindow(serviceUrl, title, position.x, position.y)
      this.terminalWindows.push(terminalWindow)
      return terminalWindow
    },
    calculateWindowPosition(index) {
      const startPosition = {
        x: 50,
        y: 50,
      }
      return {
        x: startPosition.x + 10 * index,
        y: startPosition.y + 10 * index,
      }
    },
    autoResizeTerminalWindows() {
      if (this.terminalWindows.length <= 0 || this.terminalContainer === null) {
        return
      }
      const terminalWindow = this.terminalWindows[0]
      const container = this.terminalContainer
      if (
        terminalWindow.element.clientWidth > 0 &&
        terminalWindow.element.clientHeight > 0 &&
        terminalWindow.element.style.visibility !== 'hidden'
      ) {
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight
        const termWidth = terminalWindow.element.clientWidth
        const termHeight = terminalWindow.element.clientHeight
        const currentCols = terminalWindow.cols
        const currentRows = terminalWindow.rows
        const x = containerWidth / termWidth
        const consoleCols = (x * currentCols) | 0
        const y = containerHeight / termHeight
        const consoleRows = (y * currentRows) | 0
        terminalWindow.resize(consoleCols, consoleRows)
      }
    },
    startAutoConnect() {
      this.stopAutoConnect()
      const self = this
      this.autoConnectTimerId = setTimeout(function () {
        if (self.terminalContainer !== null) {
          if (self.terminalContainer.children.length <= 0) {
            if (!self.autoClose) {
              self.initShell(self.latestHostname, self.terminalContainer)
            } else {
              self.stopAutoConnect()
              self.$emit('terminalClose')
            }
          }
        }
        self.startAutoConnect()
      }, 1000)
    },
    stopAutoConnect() {
      if (this.autoConnectTimerId > 0) {
        clearTimeout(this.autoConnectTimerId)
      }
    },
  },
}
</script>
<style>
.termwindow {
  padding-top: 15px;
  border: #fafafa solid 1px;
  background: linear-gradient(to right, #282828, #444444);
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 200000;
  transition: opacity 0.5s;
  box-shadow: rgba(0, 0, 0, 0.8) 0 0 10px;
  /* width: 100%; */
}

.maximized .termwindow {
  border: none;
  box-shadow: none;
}

.dark .termwindow {
  box-shadow: none;
}

.bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 13px;
  padding: 1px 0;
  font-family: 'Courier New', 'DejaVu Sans Mono', 'Liberation Mono', monospace;
  color: #fafafa;
}

.title {
  position: absolute;
  left: 10px;
  top: 2px;
  font-size: 11px;
  cursor: default;
}

.tab {
  font-size: 13px;
  margin-right: 8px;
  margin-top: -2px;
  float: right;
  cursor: pointer;
}

.tab:hover {
  font-weight: bold;
}

.grip {
  position: absolute;
  /* bottom: -10px; */
  right: -10px;
  width: 22px;
  height: 22px;
  cursor: se-resize;
  z-index: -1;
  background: transparent;
}

.terminal {
  border: #000 solid 5px;
  font-family: 'Courier New', 'DejaVu Sans Mono', 'Liberation Mono', monospace;
  font-size: 1pc;
  transition: font-size 0.5s;
  color: #f0f0f0;
  background: #000;
}

.reverse-video {
  color: #000;
  background: #f0f0f0;
}
</style>
