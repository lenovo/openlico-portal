<template>
  <composite-form-dialog
    ref="innerDialog"
    size="580px"
    :composite-height="500"
    :title="$t('JobTemplate.PSWorker.Dialog.Title')"
    :form-model="innerForm"
    :form-rules="innerRules">
    <a-form-model-item :label="$t('JobTemplate.PSWorker.Mode')" label-width="180px">
      <a-select v-model="innerForm.mode">
        <a-select-option value="auto">
          {{ $t('JobTemplate.PSWorker.Mode.Auto') }}
        </a-select-option>
        <a-select-option value="manual">
          {{ $t('JobTemplate.PSWorker.Mode.Manual') }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item
      v-if="innerForm.mode == 'manual'"
      prop="psNumber"
      :label="$t('JobTemplate.PSWorker.PSNumber')"
      label-width="180px">
      <a-input v-model="innerForm.psNumber" />
    </a-form-model-item>
    <a-form-model-item
      v-if="innerForm.mode == 'manual'"
      prop="workerNumber"
      :label="$t('JobTemplate.PSWorker.WorkerNumber')"
      label-width="180px">
      <a-input v-model="innerForm.workerNumber" :disabled="gpuPerNode > 0" />
    </a-form-model-item>
    <a-form-model-item
      v-if="innerForm.mode == 'manual' && gpuPerNode > 0"
      prop="gpuPerWorker"
      :label="$t('JobTemplate.PSWorker.GPUPerWorker')"
      label-width="180px">
      <a-input v-model="innerForm.gpuPerWorker" />
    </a-form-model-item>
  </composite-form-dialog>
</template>
<script>
import CompositeFormDialog from '../../component/composite-form-dialog'
import ValidRoleFactory from '../../common/valid-role-factory'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    return {
      innerForm: {
        mode: 'auto',
        psNumber: '1',
        workerNumber: '1',
        gpuPerWorker: '1',
      },
      innerRules: {},
      nodes: 0,
      gpuPerNode: 0,
      psPolicy: 'required',
    }
  },
  watch: {
    'innerForm.mode': function (val, oldVal) {
      this.initRules()
    },
    'innerForm.gpuPerWorker': function (val, oldVal) {
      if (this.gpuPerNode > 0) {
        const gpuPerWorker = parseInt(val)
        if (!isNaN(gpuPerWorker) && gpuPerWorker > 0 && gpuPerWorker <= this.gpuPerNode) {
          if (this.gpuPerNode % gpuPerWorker === 0) {
            this.innerForm.workerNumber = String((this.nodes * this.gpuPerNode) / gpuPerWorker)
          } else {
            this.innerForm.workerNumber = ''
          }
        } else {
          this.innerForm.workerNumber = ''
        }
      }
    },
  },
  methods: {
    initRules() {
      const rules = {}
      if (this.innerForm.mode === 'manual') {
        let minPS = 1
        if (this.psPolicy === 'optional') {
          minPS = 0
        }
        rules.psNumber = [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.PSWorker.PSNumber')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.PSWorker.PSNumber')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.PSWorker.PSNumber'), minPS, 9999),
        ]
        rules.workerNumber = [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.PSWorker.WorkerNumber')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.PSWorker.WorkerNumber')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.PSWorker.WorkerNumber'), 1, 9999),
        ]
        rules.gpuPerWorker = [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.PSWorker.WorkerNumber')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.PSWorker.WorkerNumber')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.PSWorker.WorkerNumber'), 1, this.gpuPerNode),
        ]
      }
      this.innerRules = rules
    },
    doSetting(setting, nodes, gpuPerNode, psPolicy) {
      return new Promise((resolve, reject) => {
        this.nodes = nodes
        this.gpuPerNode = gpuPerNode
        this.psPolicy = psPolicy
        this.innerForm = {
          mode: setting.mode,
          psNumber: String(setting.psNumber),
          workerNumber: String(setting.workerNumber),
          gpuPerWorker: String(setting.gpuPerWorker),
        }
        this.initRules()
        this.$refs.innerDialog.emptyPopup().then(
          res => {
            const newSetting = {
              mode: this.innerForm.mode,
              psNumber: parseInt(this.innerForm.psNumber),
              workerNumber: parseInt(this.innerForm.workerNumber),
              gpuPerWorker: parseInt(this.innerForm.gpuPerWorker),
            }
            resolve(newSetting)
          },
          res => {
            reject(res)
          },
        )
      })
    },
  },
}
</script>
