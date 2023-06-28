<template>
  <div style="display: flex; width: 100%; position: relative">
    <a-date-picker
      v-if="enableDate"
      v-model="date"
      :disabled-date="disabledDate"
      :disabled="disabled"
      :format="formatDate"
      :show-today="false"
      @change="onDateChange" />
    <span v-if="enableDate && enableTime" style="display: inline-block; width: 10px" />
    <a-time-picker
      v-if="enableTime"
      v-model="time"
      :disabled="disabled"
      :get-popup-container="n => n.parentNode"
      :format="formatTime"
      :use12-hours="false"
      @change="onTimeChange" />
  </div>
</template>
<script>
import moment from 'moment'

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
  data() {
    return {
      moment,
      date: null,
      time: null,
      result: [],
      formatDate: 'YYYY-MM-DD',
      formatTime: this.disableSecond ? 'HH:mm' : 'HH:mm:ss',
    }
  },
  watch: {
    value(val, old) {
      if (val || old) {
        this.init()
      }
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.date = this.value ? moment(this.value, this.formatDate) : null
      this.time = this.value ? moment(this.value, this.formatTime) : null
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
        return
      }
      if (this.date && this.enableDate) {
        this.result.push(this.date.format(this.formatDate))
      }
      if (this.time && this.enableTime) {
        this.result.push(this.time.format(this.formatTime))
      }

      const result = this.result.length >= 1 ? this.result.join(' ') : null

      this.$emit('input', moment(result).toDate())
      this.$emit('change', moment(result).toDate())
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
        return current && current <= moment().startOf('day')
      }
      if (this.disableFutureDate) {
        return current && current >= moment().startOf('day')
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
