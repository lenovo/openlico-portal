<template>
  <composite-form-dialog
    ref="innerDialog"
    class="early-stop-dialog"
    :title="$t('JobTemplate.EarlyStop.Settings')"
    size="380px"
    :form-model="innerForm"
    :form-rules="innerRules">
    <a-form-item
      v-if="settings.monitorOptions"
      name="monitor"
      label-width="180px"
      :label="$t('JobTemplate.EarlyStop.Settings.Monitor')">
      <a-select v-model:value="innerForm.monitor">
        <a-select-option v-for="option in settings.monitorOptions" :key="option.value">
          {{ option.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item name="minDelta" label-width="180px" :label="$t('JobTemplate.EarlyStop.Settings.MinDelta')">
      <a-input v-model:value="innerForm.minDelta" />
    </a-form-item>
    <a-form-item name="patience" label-width="180px" :label="$t('JobTemplate.EarlyStop.Settings.Patience')">
      <a-input v-model:value="innerForm.patience" />
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
