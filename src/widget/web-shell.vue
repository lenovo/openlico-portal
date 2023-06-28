<template>
  <div class="web-shell">
    <a-row>
      <a-col :span="24">
        <a-select v-model="hostname" style="width: 217px">
          <a-select-option v-for="item in nodes" :key="item.hostname" :value="item.hostname">
            {{ item.hostname }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row>
      <div ref="terminalContainer" style="width: 100%; min-width: 300px; min-height: 600px" />
    </a-row>
    <web-terminal ref="webTerminal" />
  </div>
</template>
<script>
import NodeService from '../service/node'
import WebTerminal from './web-terminal'

export default {
  components: {
    'web-terminal': WebTerminal,
  },
  data() {
    return {
      nodes: [],
      hostname: '',
    }
  },
  watch: {
    hostname(val, oldVal) {
      this.openTerminal(val)
    },
  },
  mounted() {
    this.initNodes()
  },
  methods: {
    initNodes() {
      NodeService.getAllNodes('login').then(
        res => {
          this.nodes = res
          if (res.length <= 0) {
            NodeService.getAllNodes('head').then(res => {
              this.nodes = res
              if (this.nodes.length > 0) {
                this.hostname = this.nodes[0].hostname
              }
            })
          }
          if (this.nodes.length > 0) {
            this.hostname = this.nodes[0].hostname
          }
        },
        res => {
          this.$message.error(res)
        },
      )
    },
    openTerminal(hostname) {
      this.$refs.webTerminal.initShell(hostname, this.$refs.terminalContainer)
    },
    autoResizeTerminalWindows() {
      this.$refs.webTerminal.autoResizeTerminalWindows()
    },
  },
}
</script>
<style scoped>
.web-shell .ant-row {
  margin-bottom: 10px;
}
</style>
