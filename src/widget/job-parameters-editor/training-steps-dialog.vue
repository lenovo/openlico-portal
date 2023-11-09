<template>
  <composite-form-dialog
    ref="innerDialog"
    class="training-steps-dialog"
    :title="$t('JobTemplate.TrainingSteps.Dialog.Title')"
    size="580px"
    :form-model="innerForm"
    :form-rules="innerRules">
    <!--Log Every Steps-->
    <a-form-item name="logPerIterations" label-width="180px" :label="$t('JobTemplate.TrainingEpochs.LogPerIteration')">
      <a-input v-model:value="innerForm.logPerIterations" :addon-after="$t('JobTemplate.TrainingEpochs.Unit')" />
    </a-form-item>
    <!--Save Every Steps-->
    <a-form-item
      name="savePerIterations"
      label-width="180px"
      :label="$t('JobTemplate.TrainingEpochs.SavePerIteration')">
      <a-input v-model:value="innerForm.savePerIterations" :addon-after="$t('JobTemplate.TrainingEpochs.Unit')" />
    </a-form-item>
  </composite-form-dialog>
</template>
<script>
import ValidRoleFactory from '@/common/valid-role-factory'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'

export default {
  components: {
    CompositeFormDialog,
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
