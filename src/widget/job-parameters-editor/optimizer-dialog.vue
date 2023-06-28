<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="$t('JobTemplate.Optimizer.Dialog.Title')"
    size="580px"
    :composite-height="540"
    :form-model="innerForm"
    :form-rules="innerRules">
    <a-form-model-item prop="optimizerType" label-width="200px" :label="$t('JobTemplate.Optimizer')">
      <a-select v-model="optimizerType">
        <a-select-option v-for="option in optimizerOptions" :key="option.key" :value="option.key">
          {{ $t(option.label) }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item
      v-for="param in optimizerParams"
      :key="param.key"
      :label="$t(param.label)"
      label-width="200px"
      :prop="param.key">
      <a-input v-if="param.type == 'number'" v-model="innerForm[param.key]" />
      <a-checkbox v-if="param.type == 'bool'" v-model="innerForm[param.key]" />
    </a-form-model-item>
  </composite-form-dialog>
</template>

<script>
import ValidRoleFactory from '../../common/valid-role-factory'
import CompositeFormDialog from '../../component/composite-form-dialog'
import OptimizerDefine from './optimizer-define'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    return {
      innerForm: {},
      innerRules: {},
      optimizerType: '',
      optimizerSetting: null,
      optimizerOptions: OptimizerDefine.optimizers,
      optimizerParams: [],
    }
  },
  watch: {
    optimizerType: {
      handler(val, oldVal) {
        this.init(false)
      },
    },
  },
  methods: {
    init(resetForm) {
      const type = this.optimizerType
      const setting = this.optimizerSetting
      for (let i = 0; i < OptimizerDefine.optimizers.length; i++) {
        const optimizer = OptimizerDefine.optimizers[i]
        if (optimizer.key === type) {
          this.optimizerParams = optimizer.params
          break
        }
      }
      const form = {}
      const rule = {}
      for (let i = 0; i < this.optimizerParams.length; i++) {
        const param = this.optimizerParams[i]
        form[param.key] = setting[type][param.key]
        // scientific notation to string
        // example: 1e-8 => 0.00000001
        if (typeof form[param.key] === 'number') {
          form[param.key] = String(form[param.key])
          if (form[param.key].includes('e')) {
            form[param.key] = this.scientificNotationToString(form[param.key])
          }
        }
        //
        rule[param.key] = []
        if (param.type === 'number') {
          rule[param.key].push(ValidRoleFactory.getRequireRoleForText(this.$t(param.label)))
          rule[param.key].push(ValidRoleFactory.getValidNumberRoleForText(this.$t(param.label)))
        }
        if (param.key === 'learningRatePower') {
          rule[param.key].push(ValidRoleFactory.getNumberRangeRoleForText(this.$t(param.label), undefined, 0))
        }
      }
      if (!resetForm) {
        for (const key in this.innerForm) {
          form[key] = this.innerForm[key]
        }
      }
      this.innerForm = form
      this.innerRules = rule
    },
    doSetting(optimizer) {
      this.optimizerType = optimizer.type
      this.optimizerSetting = optimizer
      this.init(true)
      return new Promise((resolve, reject) => {
        this.$refs.innerDialog.emptyPopup().then(
          res => {
            const newSetting = {}
            newSetting.type = this.optimizerType
            for (let i = 0; i < OptimizerDefine.optimizers.length; i++) {
              const optimizer = OptimizerDefine.optimizers[i]
              newSetting[optimizer.key] = {}
              for (let j = 0; j < optimizer.params.length; j++) {
                const param = optimizer.params[j]
                if (optimizer.key === newSetting.type) {
                  newSetting[optimizer.key][param.key] = Number(this.innerForm[param.key])
                } else {
                  newSetting[optimizer.key][param.key] = Number(this.optimizerSetting[optimizer.key][param.key])
                }
              }
            }
            newSetting.sgd.gradientNormGlobalFirst = Boolean(newSetting.sgd.gradientNormGlobalFirst)
            resolve(newSetting)
          },
          res => {
            reject(res)
          },
        )
      })
    },
    scientificNotationToString(scientificNumber) {
      const strParam = String(scientificNumber)
      const flag = /e/.test(strParam)
      if (!flag) return scientificNumber
      let sysbol = true
      if (/e-/.test(strParam)) {
        sysbol = false
      }
      const index = Number(strParam.match(/\d+$/)[0])
      // eslint-disable-next-line no-useless-escape
      const basis = strParam.match(/^[\d\.]+/)[0].replace(/\./, '')
      if (sysbol) {
        return basis.padEnd(index + 1, 0)
      } else {
        return basis.padStart(index + basis.length, 0).replace(/^0/, '0.')
      }
    },
  },
}
</script>

<style lang="css"></style>
