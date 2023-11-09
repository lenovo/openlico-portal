<template>
  <div class="web-shell">
    <div ref="terminalContainer" style="width: 100%; height: 100%" />
    <web-terminal ref="webTerminal" :auto-close="true" @terminal-close="terminalClose" />
  </div>
</template>
<script>
import WebTerminal from '@/widget/web-terminal.vue'

export default {
  components: {
    'web-terminal': WebTerminal,
  },
  props: ['hostname', 'type'],
  emits: ['destroyTerminal'],
  mounted() {
    this.$refs.webTerminal.initShell(this.hostname, this.$refs.terminalContainer, this.type)
  },
  methods: {
    resize() {
      this.$refs.webTerminal.autoResizeTerminalWindows()
    },
    terminalClose() {
      this.$emit('destroyTerminal')
    },
  },
}
</script>
<style scoped>
.web-shell {
  width: 100%;
  height: 100%;
  background: #000;
}
</style>
