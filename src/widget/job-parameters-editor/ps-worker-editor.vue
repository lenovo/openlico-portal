<template>
  <div style="display: flex">
    <a-input v-model="psWorkerDisplay" style="width: 300px" :disabled="true" />
    <a-button @click="onSettingClick">
      {{ modeText }}
    </a-button>
    <ps-worker-dialog ref="settingDialog" />
  </div>
</template>
<script>
import PsWorkerDialog from './ps-worker-dialog'

export default {
  components: {
    'ps-worker-dialog': PsWorkerDialog,
  },
  props: ['value', 'nodes', 'gpuPerNode', 'workerAutoPolicy', 'psPolicy'],
  data() {
    return {
      psWorkerDisplay: '',
      setting: {
        mode: this.value.mode,
        psNumber: this.value.psNumber,
        workerNumber: this.value.workerNumber,
        gpuPerWorker: this.value.gpuPerWorker,
      },
    }
  },
  computed: {
    modeText() {
      if (this.setting.mode === 'auto') {
        return this.$t('JobTemplate.PSWorker.Mode.Auto')
      }
      if (this.setting.mode === 'manual') {
        return this.$t('JobTemplate.PSWorker.Mode.Manual')
      }
      return ''
    },
  },
  watch: {
    psPolicy: function (val, oldVal) {
      this.resetPSWorker()
    },
    nodes: function (val, oldVal) {
      this.resetPSWorker()
    },
    gpuPerNode: function (val, oldVal) {
      this.resetPSWorker()
    },
  },
  mounted() {
    if (this.$route.path.includes('copy')) {
      this.onValueChange()
    } else {
      this.resetPSWorker()
    }
  },
  methods: {
    resetPSWorker() {
      if (this.psPolicy === 'optional') {
        this.setting.psNumber = 0
      }
      if (this.psPolicy === 'required') {
        this.setting.psNumber = this.nodes
      }
      if (this.gpuPerNode > 0) {
        if (this.workerAutoPolicy === 'one_node_one_worker') {
          this.setting.workerNumber = this.nodes
          this.setting.gpuPerWorker = this.gpuPerNode
        }
        if (this.workerAutoPolicy === 'one_gpu_one_worker') {
          this.setting.workerNumber = this.nodes * this.gpuPerNode
          this.setting.gpuPerWorker = 1
        }
      } else {
        this.setting.workerNumber = this.nodes
        this.setting.gpuPerWorker = 0
      }
      this.onValueChange()
    },
    onSettingClick() {
      this.$refs.settingDialog.doSetting(this.setting, this.nodes, this.gpuPerNode, this.psPolicy).then(
        res => {
          this.setting = res
          if (this.setting.mode === 'auto') {
            this.resetPSWorker()
          }
          this.onValueChange()
        },
        res => {
          // Do nothing
        },
      )
    },
    onValueChange() {
      const psWorker = {
        mode: this.setting.mode,
        psNumber: this.setting.psNumber,
        workerNumber: this.setting.workerNumber,
        gpuPerWorker: this.setting.gpuPerWorker,
      }
      if (psWorker.psNumber === 0) {
        this.psWorkerDisplay = psWorker.workerNumber + ' Worker'
      } else {
        this.psWorkerDisplay = psWorker.psNumber + ' PS, ' + psWorker.workerNumber + ' Worker'
      }
      this.$emit('input', psWorker)
    },
  },
}
</script>
