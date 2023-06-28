<template>
  <composite-form-dialog
    ref="innerDialog"
    class="training-steps-dialog"
    :title="$t('JobTemplate.TrainingSteps.Dialog.Title')"
    size="580px"
    :composite-height="370"
    :form-model="innerForm"
    :form-rules="innerRules">
    <!--Log Every Steps-->
    <a-form-model-item
      prop="logPerIterations"
      label-width="180px"
      :label="$t('JobTemplate.TrainingEpochs.LogPerIteration')">
      <a-input v-model="innerForm.logPerIterations" :addon-after="$t('JobTemplate.TrainingEpochs.Unit')" />
    </a-form-model-item>
    <!--Save Every Steps-->
    <a-form-model-item
      prop="savePerIterations"
      label-width="180px"
      :label="$t('JobTemplate.TrainingEpochs.SavePerIteration')">
      <a-input v-model="innerForm.savePerIterations" :addon-after="$t('JobTemplate.TrainingEpochs.Unit')" />
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
        logPerIterations: '',
        savePerIterations: '',
      },
      innerRules: {
        logPerIterations: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.TrainingEpochs.LogPerIteration')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.TrainingEpochs.LogPerIteration')),
          ValidRoleFactory.getRangeRoleForNumber(this.$t('JobTemplate.TrainingEpochs.LogPerIteration'), 1, 999999999),
        ],
        savePerIterations: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.TrainingEpochs.SavePerIteration')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.TrainingEpochs.SavePerIteration')),
          ValidRoleFactory.getRangeRoleForNumber(this.$t('JobTemplate.TrainingEpochs.SavePerIteration'), 1, 999999999),
        ],
      },
    }
  },
  methods: {
    doSetting(setting) {
      return new Promise((resolve, reject) => {
        this.innerForm = {
          logPerIterations: String(setting.logPerIterations),
          savePerIterations: String(setting.savePerIterations),
        }
        this.$refs.innerDialog.emptyPopup().then(
          res => {
            const setting = {
              logPerIterations: parseInt(this.innerForm.logPerIterations),
              savePerIterations: parseInt(this.innerForm.savePerIterations),
            }
            resolve(setting)
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
