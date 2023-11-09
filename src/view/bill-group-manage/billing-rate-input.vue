<template>
  <a-input
    v-model:value="rateForm.inputValue"
    :addon-before="currency"
    :disabled="disabled"
    @input="handlerUserInput(rateForm.inputValue, rateForm.timetype)">
    <template #addonAfter>
      <a-select v-model:value="rateForm.timetype" :disabled="disabled" @change="computeChargeRate($event)">
        <a-select-option value="minute">
          {{ currencyUnit + '/ ' + unit + '*' + $t('BillGroup.ChargeRate.Minute') }}
        </a-select-option>
        <a-select-option value="hour">
          {{ currencyUnit + '/ ' + unit + '*' + $t('BillGroup.ChargeRate.Hour') }}
        </a-select-option>
      </a-select>
    </template>
  </a-input>
</template>

<script>
import Format from '@/common/format'
export default {
  props: {
    value: {
      type: String,
      default: '0.00',
    },
    timeType: {
      type: String,
      default: 'hour',
    },
    currency: {
      type: String,
      default: '$',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    unit: String,
    rules: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  emits: ['update:value', 'update:timeType'],
  data() {
    return {
      oldValue: {
        minute: '',
        hour: '',
      },
      rateForm: {
        inputValue: null,
        timetype: null,
      },
      currencyUnit: this.$store.getters['settings/getCurrencyUnit'],
    }
  },
  watch: {
    value: {
      handler: function (val) {
        this.rateForm.inputValue = val
      },
      immediate: true,
    },
    timeType: {
      handler: function (val) {
        this.rateForm.timetype = val
      },
      immediate: true,
    },
  },
  methods: {
    handlerUserInput(val, time) {
      this.$emit('update:value', val)
      this.$emit('update:timeType', time)
      this.oldValue[time] = parseFloat(val).toFixed(2)
      if (time === 'hour') {
        this.oldValue.minute = null
      } else {
        this.oldValue.hour = null
      }
    },
    computeChargeRate(val) {
      if (val === 'minute') {
        this.oldValue.hour = parseFloat(this.rateForm.inputValue).toFixed(4)
        this.rateForm.inputValue = this.oldValue.minute
          ? this.oldValue.minute
          : (this.rateForm.inputValue / 60).toFixed(4)
      } else if (val === 'hour') {
        this.oldValue.minute = parseFloat(this.rateForm.inputValue).toFixed(4)
        this.rateForm.inputValue = this.oldValue.hour ? this.oldValue.hour : (this.rateForm.inputValue * 60).toFixed(4)
      }
      this.$emit('update:value', Format.formatBillingRate(this.rateForm.inputValue, false))
      this.$emit('update:timeType', val)
    },
  },
}
</script>
