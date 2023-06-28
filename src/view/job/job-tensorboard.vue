<template>
  <div class="job-tensorboard">
    <a-row>
      <a-col :span="14">
        <file-select id="tid_file" v-model="path" type="folder" />
      </a-col>
      <a-col :span="10" align="right">
        <a-button :disabled="path == '' || !onViewClickEnadle" @click="onViewClick">
          {{ $t('JobDetail.Tensorboard.View') }}
        </a-button>
        <a-button :disabled="path == '' || !showIframe" style="margin: 0 10px" @click="refreshTensorBoard">
          {{ $t('JobDetail.Tensorboard.Refresh') }}
        </a-button>
        <a-button :disabled="!showIframe" @click="onNewWindowClick">
          {{ $t('JobDetail.Tensorboard.NewView') }}
        </a-button>
      </a-col>
    </a-row>
    <a-row class="p-t-10 p-b-10">
      <a-spin :spinning="loading">
        <div ref="tensorflowIframeDiv" class="tensorflow-iframe-div" />
      </a-spin>
    </a-row>
  </div>
</template>
<script>
import FileSelect from '../../component/file-select'
import JobService from '../../service/job'
import Format from '../../common/format'

export default {
  components: {
    'file-select': FileSelect,
  },
  props: ['job', 'arch'],
  data() {
    return {
      loading: false,
      path: '',
      logdir: '',
      showIframe: false,
      tensorboardPath: '',
      waitingPortTimerId: 0,
      onViewClickEnadle: false,
    }
  },
  watch: {
    path(val, oldVal) {
      this.onViewClickEnadle = true
      this.showIframe = false
    },
  },
  beforeDestroy() {
    if (this.waitingPortTimerId > 0) {
      clearTimeout(this.waitingPortTimerId)
    }
  },
  mounted() {
    if (
      this.job &&
      this.job.req &&
      this.job.req.params &&
      this.job.req.params.parameters &&
      this.job.req.params.parameters.train_dir
    ) {
      this.path = Format.formatMyFolder(this.job.req.params.parameters.train_dir)
    }
  },
  methods: {
    onViewClick() {
      this.onViewClickEnadle = false
      this.showIframe = false
      this.loading = true
      this.clearTensorboard()
      const logDir = Format.formatWorkspace(this.path)
      this.getPort(logDir)
    },
    getPort(logDir) {
      const self = this
      JobService.getTensorboardPort(logDir, this.job.queue, this.job.realType).then(
        res => {
          self.getStatus(res.data.uuid)
        },
        res => {
          this.loading = false
          this.onViewClickEnadle = true
          this.$message.error(res)
        },
      )
    },
    getStatus(uuid) {
      const self = this
      JobService.getTensorboardStatus(uuid).then(
        res => {
          if (res.data.status === 'creating') {
            self.waitingPortTimerId = setTimeout(function () {
              self.getStatus(uuid)
            }, 3000)
          } else if (res.data.status === 'on') {
            clearTimeout(self.waitingPortTimerId)
            self.tensorboardPath = window.location.origin + '/tensorboard/' + res.data.base_url + '/' + uuid + '/'
            self.waitingPortTimerId = setTimeout(_ => {
              self.showTensorBoard()
            }, 1000)
          } else if (res.data.status === 'off') {
            this.onViewClickEnadle = true
            this.loading = false
            const error = window.gApp.$t('JobDetail.Tensorboard.Failed')
            self.$message.error(error)
          }
        },
        res => {
          this.onViewClickEnadle = true
          this.loading = false
          this.$message.error(res)
        },
      )
    },
    showTensorBoard(count = 120) {
      const iframe = document.createElement('iframe')
      iframe.setAttribute('id', 'tid_tensorflow-iframe')
      iframe.setAttribute('class', 'tensorflow-iframe')
      iframe.setAttribute('src', this.tensorboardPath)
      iframe.style.width = '100%'
      iframe.style.height = '100%'
      iframe.style.display = 'none'
      iframe.onload = () => {
        const ifmDocument = iframe.contentWindow.document
        const title = ifmDocument.querySelector('head > title')
        if (count < 0 || (title && title.innerHTML.toLowerCase().indexOf('tensorboard') !== -1)) {
          this.loading = false
          iframe.style.display = 'block'
          this.showIframe = true
        } else {
          this.clearTensorboard()
          this.waitingPortTimerId = setTimeout(() => {
            this.showTensorBoard(--count)
          }, 1000)
        }
      }
      this.$refs.tensorflowIframeDiv.append(iframe)
    },
    refreshTensorBoard() {
      this.showIframe = false
      this.loading = true
      this.clearTensorboard()
      this.showTensorBoard()
    },
    onNewWindowClick() {
      localStorage.location = this.tensorboardPath
      window.open(this.tensorboardPath)
    },
    clearTensorboard() {
      const iframe = document.querySelector('.tensorflow-iframe')
      if (iframe) this.$refs.tensorflowIframeDiv.removeChild(iframe)
    },
  },
}
</script>

<style lang="css">
.job-tensorboard .el-row {
  margin-bottom: 10px;
}

.tensorflow-iframe-div {
  height: 550px;
  width: 100%;
  border: 1px #a9a9a9 solid;
}

.tensorflow-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
.job-tensorboard .select-file-input {
  width: 500px;
}
.tensorflow-iframe-div .ant-spin-container {
  height: 100%;
}
</style>
