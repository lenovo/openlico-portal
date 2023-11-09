<template>
  <a-modal
    :title="$t('Action.ViewLog')"
    :open="visible"
    destroy-on-close
    :width="width"
    @ok="handleOk"
    @cancel="handleCancel">
    <div v-if="logPath" class="build-log">
      <log-viewer ref="jobLogViewer" :default-file="logPath" />
    </div>
    <p v-else>{{ $t('Softwares.Build.LogNotExist') }}</p>
  </a-modal>
</template>

<script>
import LogViewer from '@/widget/log-viewer.vue'

export default {
  components: {
    'log-viewer': LogViewer,
  },
  props: ['logPath'],
  data() {
    return {
      visible: false,
      width: '800px',
    }
  },
  watch: {
    logPath() {
      this.getWidth()
    },
  },
  mounted() {
    this.getWidth()
  },
  methods: {
    open() {
      this.visible = true
    },
    getWidth() {
      if (this.logPath) this.width = '800px'
      else this.width = '400px'
    },
    handleOk() {
      this.visible = false
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style scoped>
.build-log .el-row {
  margin-bottom: 10px;
}
.build-log :deep(.select-file-input) {
  width: 500px;
}
.build-log :deep(.ant-col-14) {
  visibility: hidden;
}
.build-log .logName {
  position: absolute;
}
</style>
