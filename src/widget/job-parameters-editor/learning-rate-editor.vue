<template>
  <div class="learning-rate-editor">
    <a-tag
      v-for="(learningRate, index) in learningRates"
      :key="index + getLearningRateDisplayName(learningRate)"
      :closable="multi"
      :close-transition="true"
      @close.prevent="onLearningRateRemove(learningRate)"
      @click="onLearningRateSetting(learningRate)">
      {{ getLearningRateDisplayName(learningRate) }}
    </a-tag>
    <a-button v-show="multi" class="new-learning-rate-button" size="small" @click="onCreateClick"> + </a-button>
    <learning-rate-dialog ref="settingDialog" />
  </div>
</template>
<script>
import Utils from '@/common/utils'
import LearningRateDialog from './learning-rate-dialog.vue'

export default {
  components: {
    LearningRateDialog,
  },
  props: ['value', 'multi'],
  emits: ['input', 'update:value'],
  data() {
    return {
      learningRates: this.multi ? this.value : [this.value],
    }
  },
  watch: {
    learningRates: {
      handler(val, oldVal) {
        if (this.multi) {
          this.$emit('input', this.learningRates)
          this.$emit('update:value', this.learningRates)
        } else {
          this.$emit('input', this.learningRates[0])
          this.$emit('update:value', this.learningRates[0])
        }
      },
    },
  },
  methods: {
    getLearningRateDisplayName(learningRate) {
      let type = ''
      if (learningRate.decayType === 'fixed') {
        type = this.$t('JobTemplate.LearningRate.DecayType.Fixed')
      } else if (learningRate.decayType === 'exponential') {
        type = this.$t('JobTemplate.LearningRate.DecayType.Exponential')
      } else if (learningRate.decayType === 'polynomial') {
        type = this.$t('JobTemplate.LearningRate.DecayType.Polynomial')
      }
      return type + ' / ' + String(learningRate.beginValue)
    },
    onLearningRateRemove(learningRate) {
      const learningRates = []
      this.learningRates.forEach(temp => {
        if (temp !== learningRate) {
          learningRates.push(temp)
        }
      })
      this.learningRates = learningRates
    },
    onLearningRateSetting(learningRate) {
      this.$refs.settingDialog.doSetting(learningRate).then(
        res => {
          const learningRates = []
          this.learningRates.forEach(temp => {
            if (temp !== learningRate) {
              learningRates.push(temp)
            } else {
              learningRates.push(res)
            }
          })
          this.learningRates = []
          learningRates.forEach(el => {
            this.learningRates = this.isPush(this.learningRates, el)
          })
        },
        res => {
          // Do nothing
        },
      )
    },
    onCreateClick() {
      const learningRate = this.getDefaultLearningRate()
      this.$refs.settingDialog.doSetting(learningRate).then(
        res => {
          const learningRates = []
          this.learningRates.forEach(temp => {
            learningRates.push(temp)
          })
          // Determines whether the array has the same object
          this.learningRates = this.isPush(learningRates, res)
        },
        res => {
          // Do nothing
        },
      )
    },
    isPush(arr, obj) {
      let isPush = true
      arr.forEach(item => {
        if (Utils.objectEquals(item, obj)) {
          isPush = false
        }
      })
      if (isPush) {
        arr.push(obj)
      }
      return arr
    },
    getDefaultLearningRate() {
      return {
        beginValue: 0.001,
        decayType: 'fixed',
        endValue: 0.00001,
        decayFactor: 0.9,
        epochsPerDecay: 1,
        movingAverageDecay: null,
      }
    },
  },
}
</script>
<style>
.learning-rate-editor .el-tag + .el-tag {
  margin-left: 10px;
}

.learning-rate-editor .el-tag {
  cursor: pointer;
}

.learning-rate-editor .new-learning-rate-button {
  margin-left: 6px;
}
</style>
