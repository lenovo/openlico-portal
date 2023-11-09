<template>
  <composite-form-dialog
    ref="innerDialog"
    class="learning-rate-dialog"
    :title="$t('JobTemplate.LearningRate.Dialog.Title')"
    size="580px"
    :form-model="innerForm"
    :form-rules="innerRules">
    <!--Decay Type-->
    <a-form-item name="decayType" label-width="180px" :label="$t('JobTemplate.LearningRate.DecayType')">
      <a-select v-model:value="innerForm.decayType">
        <a-select-option v-for="option in decayTypeOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <!--Learning Rate-->
    <a-form-item name="beginValue" label-width="180px" :label="$t('JobTemplate.LearningRate.BeginValue')">
      <a-input v-model:value="innerForm.beginValue" />
    </a-form-item>
    <!--End Learning Rate-->
    <a-form-item
      v-if="innerForm.decayType == 'polynomial'"
      name="endValue"
      label-width="180px"
      :label="$t('JobTemplate.LearningRate.EndValue')">
      <a-input v-model:value="innerForm.endValue" />
    </a-form-item>
    <!--Decay Factor-->
    <a-form-item
      v-if="innerForm.decayType != 'fixed'"
      name="decayFactor"
      label-width="180px"
      :label="$t('JobTemplate.LearningRate.DecayFactor')">
      <a-input v-model:value="innerForm.decayFactor" />
    </a-form-item>
    <!--Epoches Per Decay-->
    <a-form-item
      v-if="innerForm.decayType != 'fixed'"
      name="epochsPerDecay"
      label-width="180px"
      :label="$t('JobTemplate.LearningRate.EpochsPerDecay')">
      <a-input v-model:value="innerForm.epochsPerDecay" />
    </a-form-item>
    <!--Moving Average Decay-->
    <a-form-item
      v-if="innerForm.decayType != 'fixed'"
      v-show="false"
      name="movingAverageDecay"
      label-width="180px"
      :label="$t('JobTemplate.LearningRate.MovingAverageDecay')">
      <a-input v-model:value="innerForm.movingAverageDecay" />
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
      decayTypeOptions: [
        {
          value: 'fixed',
          label: this.$t('JobTemplate.LearningRate.DecayType.Fixed'),
        },
        {
          value: 'exponential',
          label: this.$t('JobTemplate.LearningRate.DecayType.Exponential'),
        },
        {
          value: 'polynomial',
          label: this.$t('JobTemplate.LearningRate.DecayType.Polynomial'),
        },
      ],
      innerForm: {
        decayType: 'fixed',
        beginValue: '',
        endValue: '',
        decayFactor: '',
        epochsPerDecay: '',
        movingAverageDecay: '',
      },
      innerRules: {},
    }
  },
  watch: {
    'innerForm.decayType': function (val, oldVal) {
      this.initRules(val)
    },
  },
  methods: {
    initRules(decayType) {
      if (decayType === 'fixed') {
        this.innerRules = {
          beginValue: [
            ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.LearningRate.BeginValue')),
            ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.LearningRate.BeginValue')),
            ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.LearningRate.BeginValue'), 0, undefined),
          ],
        }
      } else {
        this.innerRules = {
          beginValue: [
            ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.LearningRate.BeginValue')),
            ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.LearningRate.BeginValue')),
            ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.LearningRate.BeginValue'), 0, undefined),
          ],
          endValue: [
            ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.LearningRate.EndValue')),
            ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.LearningRate.EndValue')),
            ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.LearningRate.BeginValue'), 0, undefined),
          ],
          decayFactor: [
            ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.LearningRate.DecayFactor')),
            ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.LearningRate.DecayFactor')),
            ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.LearningRate.BeginValue'), 0, undefined),
          ],
          epochsPerDecay: [
            ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.LearningRate.EpochsPerDecay')),
            ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.LearningRate.EpochsPerDecay')),
            ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.LearningRate.BeginValue'), 0, undefined),
          ],
          movingAverageDecay: [
            ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.LearningRate.MovingAverageDecay')),
          ],
        }
      }
    },
    doSetting(learningRate) {
      return new Promise((resolve, reject) => {
        this.innerForm = {
          decayType: learningRate.decayType,
          beginValue: String(learningRate.beginValue),
          endValue: String(learningRate.endValue),
          decayFactor: String(learningRate.decayFactor),
          epochsPerDecay: String(learningRate.epochsPerDecay),
          movingAverageDecay: learningRate.movingAverageDecay === null ? null : String(learningRate.movingAverageDecay),
        }
        this.initRules(learningRate.decayType)
        this.$refs.innerDialog.emptyPopup().then(
          res => {
            let movingAverageDecay = ''
            if (!isNaN(parseFloat(this.innerForm.movingAverageDecay))) {
              movingAverageDecay = parseFloat(this.innerForm.movingAverageDecay)
            }
            const learningRate = {
              decayType: this.innerForm.decayType,
              beginValue: parseFloat(this.innerForm.beginValue),
              endValue: parseFloat(this.innerForm.endValue),
              decayFactor: parseFloat(this.innerForm.decayFactor),
              epochsPerDecay: parseInt(this.innerForm.epochsPerDecay),
              movingAverageDecay: movingAverageDecay || null,
            }
            resolve(learningRate)
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
