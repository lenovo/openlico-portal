<template>
  <a-input
    v-model="inputValue"
    :addon-before="currency"
    :disabled="disabled"
    @input="handlerUserInput(inputValue, timetype)">
    <a-select slot="addonAfter" v-model="timetype" :disabled="disabled" @change="computeChargeRate($event)">
      <a-select-option value="minute">
        {{ currencyUnit + '/ ' + unit + '*' + $t('BillGroup.ChargeRate.Minute') }}
      </a-select-option>
      <a-select-option value="hour">
        {{ currencyUnit + '/ ' + unit + '*' + $t('BillGroup.ChargeRate.Hour') }}
      </a-select-option>
    </a-select>
  </a-input>
</template>

<script>
import Format from '../../common/format'
export default {
  props: {
    value: {
      type: Object,
      default: function () {
        return {
          value: '0.00',
          timeUnit: 'hour',
        }
      },
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
  },
  data() {
    return {
      oldValue: {
        minute: '',
        hour: '',
      },
      inputValue: '0.00',
      timetype: 'hour',
      currencyUnit: this.$store.getters['settings/getCurrencyUnit'],
    }
  },
  watch: {
    value: {
      handler: function (val, oldValue) {
        this.inputValue = val.value
        this.timetype = val.timeUnit
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    handlerUserInput(val, time) {
      const input = {
        value: val,
        timeUnit: this.timetype,
      }
      this.$emit('input', input)
      this.oldValue[time] = parseFloat(val).toFixed(2)
      if (time === 'hour') {
        this.oldValue.minute = null
      } else {
        this.oldValue.hour = null
      }
    },
    computeChargeRate(val) {
      if (val === 'minute') {
        this.oldValue.hour = parseFloat(this.inputValue).toFixed(4)
        this.inputValue = this.oldValue.minute ? this.oldValue.minute : (this.inputValue / 60).toFixed(4)
      } else if (val === 'hour') {
        this.oldValue.minute = parseFloat(this.inputValue).toFixed(4)
        this.inputValue = this.oldValue.hour ? this.oldValue.hour : (this.inputValue * 60).toFixed(4)
      }
      const input = {
        value: Format.formatBillingRate(this.inputValue, false),
        timeUnit: val,
      }
      this.$emit('input', input)
    },
  },
}
</script>

<style></style>
