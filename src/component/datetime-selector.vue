<template>
  <div style="display: flex; width: 100%; position: relative">
    <a-date-picker
      v-if="enableDate"
      v-model:value="date"
      :disabled-date="disabledDate"
      :disabled="disabled"
      :format="formatDate"
      :show-today="false"
      @change="onDateChange" />
    <span v-if="enableDate && enableTime" style="display: inline-block; width: 10px" />
    <a-time-picker
      v-if="enableTime"
      v-model:value="time"
      :disabled="disabled"
      :get-popup-container="n => n.parentNode"
      :format="formatTime"
      :show-now="false"
      @change="onTimeChange" />
  </div>
</template>
<script>
import dayjs from '@/dayjs'
import { Form } from 'ant-design-vue'

export default {
  props: {
    // eslint-disable-next-line vue/require-prop-types
    value: {
      default() {
        return new Date()
      },
    },
    // eslint-disable-next-line vue/require-prop-types
    enableDate: { default: true },
    // eslint-disable-next-line vue/require-prop-types
    enableTime: { default: true },
    // eslint-disable-next-line vue/require-prop-types
    disabled: { default: false },
    // eslint-disable-next-line vue/require-prop-types
    disableHistoryDate: { default: false },
    // eslint-disable-next-line vue/require-prop-types
    disableFutureDate: { default: false },
    // eslint-disable-next-line vue/require-prop-types
    disableSecond: { default: true },
    // eslint-disable-next-line vue/require-prop-types, vue/require-default-prop
    disableDateSelection: Function,
  },
  emits: ['input', 'change', 'update:value'],
  data() {
    return {
      date: null,
      time: null,
      result: [],
      formatDate: 'YYYY-MM-DD',
      formatTime: this.disableSecond ? 'HH:mm' : 'HH:mm:ss',
      formItemContext: Form.useInjectFormItemContext(),
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.date = this.value ? dayjs(this.value, this.formatDate) : null
      this.time = this.value ? dayjs(this.value, this.formatTime) : null
    },
    setResult() {
      this.result = []
      if (
        (this.enableDate && this.enableTime && (!this.date || !this.time)) ||
        (!this.enableDate && !this.time) ||
        (!this.enableTime && !this.date)
      ) {
        this.$emit('input', null)
        this.$emit('change', null)
        this.$emit('update:value', null)
        return
      }
      if (this.date && this.enableDate) {
        this.result.push(this.date.format(this.formatDate))
      }
      if (this.time && this.enableTime) {
        this.result.push(this.time.format(this.formatTime))
      }

      const result = this.result.length >= 1 ? this.result.join(' ') : null

      this.$emit('input', dayjs(result).toDate())
      this.$emit('change', dayjs(result).toDate())
      this.$emit('update:value', dayjs(result).toDate())
    },
    onDateChange(val) {
      this.setResult()
    },
    onTimeChange(val) {
      this.setResult()
    },
    disabledDate(current) {
      if (this.disableHistoryDate && this.disableFutureDate) {
        return true
      }
      if (this.disableHistoryDate) {
        return current && current <= dayjs().startOf('day')
      }
      if (this.disableFutureDate) {
        return current && current >= dayjs().startOf('day')
      }
      if (this.disableDateSelection) {
        return this.disabledDateSelection(current)
      }
    },
    resetDateTime() {
      this.date = null
      this.time = null
    },
  },
}
</script>
