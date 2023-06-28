<template>
  <div class="job-detail-log">
    <a-row class="m-b-10">
      <a-col :span="14">
        <file-select ref="fileSelect" v-model="innerFile" type="file" style="width: 500px" />
      </a-col>
      <a-col :span="10" align="right">
        <a-checkbox v-model="autoRefresh" unchecked @change="onAutoRefreshChange">
          {{ $t('LogViewer.Auto.Refresh') }}
        </a-checkbox>
        <a-button :disabled="autoRefresh" :loading="!autoRefresh && loading" @click="refreshLog(true)">
          {{ $t('LogViewer.Refresh') }}
        </a-button>
      </a-col>
    </a-row>
    <a-row>
      <textarea
        id="model-log"
        ref="output"
        readonly
        rows="25"
        style="width: 100%; overflow-y: scroll; resize: none"
        @blur="modelLogBlur" />
    </a-row>
  </div>
</template>
<script>
import JobService from '../service/job'
import FileSelect from '../component/file-select'

export default {
  components: {
    'file-select': FileSelect,
  },
  props: ['workspace', 'defaultFile', 'mappingPath'],
  data() {
    return {
      innerWorkspace: '',
      innerFile: '',
      autoRefresh: true,
      loading: false,
      autoRefreshInterval: 15 * 1000,
      innerLines: '',
      lines: [],
      offset: 0,
      autoRefreshTimerId: 0,
      scrollHeight: 0,
    }
  },
  watch: {
    innerFile(val, oldVal) {
      this.init()
    },
    workspace(val, oldVal) {
      this.innerWorkspace = val
    },
    defaultFile(val, oldVal) {
      this.innerFile = val
    },
    $route(val, oldVal) {
      this.init()
    },
  },
  mounted() {
    if (this.workspace) {
      this.innerWorkspace = this.workspace
    }
    if (this.defaultFile) {
      this.innerFile = this.defaultFile
    }
    this.scrollHeight = this.$refs.output.scrollHeight - this.$refs.output.scrollTop
  },
  beforeDestroy() {
    if (this.autoRefreshTimerId > 0) {
      clearTimeout(this.autoRefreshTimerId)
    }
  },
  methods: {
    init() {
      if (this.autoRefreshTimerId > 0) {
        clearTimeout(this.autoRefreshTimerId)
      }
      this.$refs.output.innerHTML = ''
      this.innerLines = ''
      this.lines = []
      this.offset = 0
      this.refreshLog()
    },
    refreshLog(isRefresh) {
      if (this.autoRefreshTimerId > 0) {
        clearTimeout(this.autoRefreshTimerId)
      }
      if (!this.innerFile) {
        return
      }
      this.loading = true
      // The backend only accept the relative directory base on MyFolder/ for SSRB
      // if(this.mappingPath) {
      //   filename = this.innerFile.replace('MyFolder', this.mappingPath);
      // } else {
      //   filename = this.innerFile.replace('MyFolder/', '');
      // }
      const filename = this.innerFile.replace('MyFolder/', '').replace(this.$store.state.auth.workspace + '/', '')
      JobService.getJobLog(filename, this.offset)
        .then(
          res => {
            if (res.lines.length > 0 && this.offset !== res.offset) {
              this.offset = res.offset
              this.lines = this.lines.concat(res.lines)
              if (this.lines.length > 1500) {
                this.lines.splice(0, this.lines.length - 1500)
              }
              this.scrollHeight = this.$refs.output.scrollHeight - this.$refs.output.scrollTop
              this.$refs.output.innerHTML = this.lines.join('\n')
              this.setScrollHeight()
            }
            if (this.autoRefresh && this.autoRefreshInterval > 0) {
              const self = this
              this.autoRefreshTimerId = setTimeout(self.refreshLog, this.autoRefreshInterval)
            }
          },
          res => {
            this.$message.error(res)
          },
        )
        .finally(() => {
          this.loading = false
        })
    },
    onAutoRefreshChange(val) {
      if (val.target.checked) {
        this.refreshLog()
      } else {
        if (this.autoRefreshTimerId > 0) {
          clearTimeout(this.autoRefreshTimerId)
        }
      }
    },
    modelLogBlur() {
      // if(this.$refs.output){
      //   this.refreshLog(true);
      // }
    },
    setScrollHeight() {
      if (this.$refs.output.scrollTop === 0) {
        this.$refs.output.scrollTop = 99999999
      } else {
        this.$refs.output.scrollTop = this.$refs.output.scrollHeight
      }
    },
  },
}
</script>
<style scoped>
.job-detail-log .el-row {
  margin-bottom: 10px;
}
.job-detail-log >>> .select-file-input {
  width: 500px;
}
</style>
