<template>
  <div ref="buildLogViewDiv" class="build-log-box">
    <a-row class="m-b-10">
      <a-col :span="12">
        {{ $t('Image.Build.Log.Title') }}
      </a-col>
      <a-col v-if="startTime != '-'" :span="12" style="text-align: right">
        {{ $t('Image.Build.Log.Create.Time', { time: startTime }) }}
      </a-col>
    </a-row>
    <a-row class="build-log-row">
      <a-col>
        <textarea
          ref="buildLogContent"
          class="build-log-content"
          readOnly
          rows="22"
          style="width: 100%; overflow-y: scroll; resize: none" />
      </a-col>
    </a-row>
    <a-row class="m-t-10" type="flex">
      <a-col :span="12">
        <a-button v-if="canCancel" @click="onClickCancel">
          {{ $t('Image.Build.Action.Cancel') }}
        </a-button>
      </a-col>
      <a-col :span="12" style="text-align: right">
        <a-button v-if="canImport" type="link" @click="onImportExistImage">
          {{ $t('Action.Import') }}
        </a-button>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import JobService from '../../../service/job'
import ImageService from '../../../service/image'

export default {
  props: ['canImport', 'canCancel', 'startTime'],
  data() {
    return {
      scrollLatest: true,
      scrollHeight: 0,
      logFilePath: '',
      importable: false,
      cancelable: false,
    }
  },
  watch: {
    canImport: function (val, oldV) {
      this.importable = val
    },
    canCancel: function (val, oldV) {
      this.cancelable = val
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.buildLogContent.addEventListener('scroll', this.handleScroll)
    })
  },
  beforeDestroy() {
    this.$refs.buildLogContent.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    getLogs(path) {
      if (!this.$refs.buildLogViewDiv) {
        return
      }
      JobService.getJobLog(path.replace(this.$store.state.auth.workspace + '/', ''), 0, 0)
        .then(res => {
          this.$refs.buildLogContent.innerHTML = res.lines.join('\n')
          this.setScrollHeight()
        })
        .catch(err => {
          this.$message.error(err)
        })
    },
    setScrollHeight() {
      if (this.scrollLatest) {
        this.$refs.buildLogContent.scrollTop = this.$refs.buildLogContent.scrollHeight
        this.scrollHeight = this.$refs.buildLogContent.scrollHeight
      }
    },
    onImportExistImage() {
      this.$emit('importImageDialogShow')
    },
    onClickCancel() {
      this.$confirm({
        content: this.$t('Image.Build.Cancel.Confirm'),
        centered: true,
        onOk: this.onCancelBuild,
      })
    },
    onCancelBuild() {
      ImageService.cancelBuild().then(
        res => {
          this.$emit('getBuildStatus')
        },
        _ => {
          // do nothing
        },
      )
    },
    cleanBuildLog() {
      this.$refs.buildLogContent.innerHTML = ''
    },
    handleScroll() {
      this.$nextTick(() => {
        const content = this.$refs.buildLogContent
        this.scrollLatest = content.scrollTop + content.clientHeight >= this.scrollHeight
      })
    },
  },
}
</script>
<style scoped>
.build-log-box {
  height: 100%;
  padding: 10px 20px 20px;
  background: #f8f8f8;
}
.build-log-content {
  overflow: auto;
  word-break: break-all;
  outline: aliceblue;
}
</style>
