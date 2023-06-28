<template>
  <composite-form-dialog
    ref="innerDialog"
    class="early-stop-dialog"
    :title="$t('JobTemplate.EarlyStop.Settings')"
    size="380px"
    :composite-height="500"
    :form-model="innerForm"
    :form-rules="innerRules">
    <a-form-model-item
      v-if="settings.monitorOptions"
      prop="monitor"
      label-width="180px"
      :label="$t('JobTemplate.EarlyStop.Settings.Monitor')">
      <a-select v-model="innerForm.monitor">
        <a-select-option v-for="option in settings.monitorOptions" :key="option.value">
          {{ option.label }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item prop="minDelta" label-width="180px" :label="$t('JobTemplate.EarlyStop.Settings.MinDelta')">
      <a-input v-model="innerForm.minDelta" />
    </a-form-model-item>
    <a-form-model-item prop="patience" label-width="180px" :label="$t('JobTemplate.EarlyStop.Settings.Patience')">
      <a-input v-model="innerForm.patience" />
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
  props: ['settings'],
  data() {
    return {
      innerForm: {
        monitor: '',
        minDelta: 0,
        patience: 10,
      },
      innerRules: {
        monitor: [],
        minDelta: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.EarlyStop.Settings.MinDelta')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.EarlyStop.Settings.MinDelta')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.EarlyStop.Settings.MinDelta'), 0, 9999),
          ValidRoleFactory.getNumberDecimalRoleForText(this.$t('JobTemplate.EarlyStop.Settings.MinDelta'), 6),
        ],
        patience: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.EarlyStop.Settings.Patience')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.EarlyStop.Settings.Patience')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.EarlyStop.Settings.Patience'), 1, 9999),
          ValidRoleFactory.getNumberDecimalRoleForText(this.$t('JobTemplate.EarlyStop.Settings.Patience'), 2),
        ],
      },
    }
  },
  methods: {
    doSetting(data) {
      return new Promise((resolve, reject) => {
        this.innerForm = {
          monitor: data.monitor,
          patience: data.patience,
          minDelta: data.min_delta,
        }
        this.$refs.innerDialog.emptyPopup().then(
          res => {
            const { monitor, patience, minDelta } = this.innerForm
            resolve({
              monitor,
              patience: Number(patience),
              min_delta: Number(minDelta),
            })
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
