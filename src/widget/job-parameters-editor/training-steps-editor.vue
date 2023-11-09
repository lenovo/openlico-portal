<template>
  <div class="training-steps-editor">
    <a-input-group compact>
      <a-input v-model:value="setting.maxEpochs" style="width: 300px" @change="onValueChanged" />
      <a-button @click="onSettingClick">
        {{ $t('JobTemplate.TrainingSteps.Setting') }}
      </a-button>
    </a-input-group>
    <training-steps-dialog ref="settingDialog" />
  </div>
</template>
<script>
import ValidRoleFactory from '@/common/valid-role-factory'
import TrainingStepsDialog from './training-steps-dialog.vue'

export default {
  components: {
    TrainingStepsDialog,
  },
  props: {
    value: {
      type: Object,
      default: function () {
        return {
          maxEpochs: 100,
          logPerIterations: 10,
          savePerIterations: 50,
        }
      },
    },
  },
  emits: ['input', 'change', 'update:value'],
  data() {
    return {
      // maxEpochs: String(this.value.maxEpochs),
      setting: {
        maxEpochs: this.value.maxEpochs,
        logPerIterations: this.value.logPerIterations,
        savePerIterations: this.value.savePerIterations,
      },
    }
  },
  watch: {
    setting: function (val, oldVal) {
      this.onValueChanged()
    },
  },
  methods: {
    onSettingClick() {
      this.$refs.settingDialog.doSetting(this.setting).then(
        res => {
          this.setting = res
        },
        res => {
          // Do nothing
        },
      )
    },
    onValueChanged() {
      const trainingSteps = {
        maxEpochs: Number(this.setting.maxEpochs),
        logPerIterations: this.setting.logPerIterations,
        savePerIterations: this.setting.savePerIterations,
      }
      this.$emit('input', trainingSteps)
      this.$emit('change', trainingSteps)
      this.$emit('update:value', trainingSteps)
    },
  },
  getValidRules(paramName) {
    return {
      type: 'object',
      required: true,
      fields: {
        maxEpochs: [
          ValidRoleFactory.getRequireRoleForNumber(paramName),
          ValidRoleFactory.getDecimalRoleForNumber(paramName, 0),
          ValidRoleFactory.getRangeRoleForNumber(paramName, 1, 9999),
        ],
      },
    }
  },
}
</script>
<style>
.training-steps-editor .el-input {
  width: 300px;
}
</style>
