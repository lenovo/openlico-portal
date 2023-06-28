<template>
  <log-viewer ref="logViewer" :workspace="workingDirectory" :default-file="defaultLogFile" :mapping-path="workspace" />
</template>

<script>
import LogViewer from '../../widget/log-viewer'
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
      this.init()
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      if (this.job) {
        // if(this.job.type == 'vnc' && this.job.schedulerId) {
        //   this.defaultLogFile = this.job.workingDirectory + '/vnc_' + this.job.schedulerId + '.log';
        // }
        // else if(this.job.outputFilename && this.job.workingDirectory) {
        //   this.defaultLogFile = this.job.outputFilename.replace(this.$store.state.auth.workspace, 'MyFolder');
        // }
        // else if(this.job.type != 'general' && this.job.type != 'cmd' && this.job.type != 'file')
        // {
        //   this.defaultLogFile = this.job.workingDirectory + '/' + this.job.name + '-' + this.job.id + '.out';
        // }
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
