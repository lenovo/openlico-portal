<template>
  <log-viewer ref="logViewer" :workspace="workingDirectory" :default-file="defaultLogFile" :mapping-path="workspace" />
</template>

<script>
import LogViewer from '@/widget/log-viewer.vue'
export default {
  components: {
    'log-viewer': LogViewer,
  },
  props: ['job'],
  data() {
    return {
      defaultLogFile: '',
      workingDirectory: '',
      workspace: '',
    }
  },
  watch: {
    job(val, oldVal) {
      if (val) this.init()
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      if (this.job) {
        this.workspace = this.$store.state.auth.workspace
        this.workingDirectory = this.job.workingDirectory
        this.defaultLogFile = this.job.outputFilename
      } else {
        this.defaultLogFile = ''
        this.workingDirectory = ''
        this.workspace = ''
      }
    },
    initJobLog() {
      this.$refs.logViewer.setScrollHeight()
    },
  },
}
</script>

<style scoped></style>
