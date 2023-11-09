<template>
  <div class="energy-report-summary">
    <span class="energy-report-summary-title">{{ $t('Ear.Energy.Summary') }}</span>
    <a-row class="energy-report-summary-context m-t-10 p-20">
      <a-col :span="6">
        <span class="summary-item-label">{{ $t('Ear.Energy.Nodes') }}</span>
        <span class="summary-item-value">{{ nodes }}</span>
      </a-col>
      <a-col :span="6">
        <span class="summary-item-label">{{ $t('Time') }}</span>
        <span class="summary-item-value">{{ time }}</span>
      </a-col>
      <a-col :span="6">
        <span class="summary-item-label">{{ $t('Ear.Energy.TotalEnergy') }}</span>
        <span class="summary-item-value">{{ totalEnergy }}</span>
      </a-col>
      <a-col :span="6">
        <span class="summary-item-label">{{ $t('Ear.Energy.AveragePower') }}</span>
        <span class="summary-item-value">{{ averagePower }}</span>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import dayjs from '@/dayjs'
export default {
  props: ['data'],
  computed: {
    nodes: function () {
      return this.data.nodes
    },
    time: function () {
      let value = ''
      const time = dayjs.duration(this.data.time, 'seconds')._data
      value += time.days > 0 ? time.days + this.$t('Unit.Day') + ' ' : ''
      value += time.hours < 10 ? '0' + time.hours : time.hours
      value += ':'
      value += time.minutes < 10 ? '0' + time.minutes : time.minutes
      value += ':'
      value += time.seconds < 10 ? '0' + time.seconds : time.seconds
      return value
    },
    totalEnergy: function () {
      return this.formatThousands(this.data.energy, 1000, ['J', 'KJ'])
    },
    averagePower: function () {
      return this.formatThousands(this.data.power, 10000, ['W', 'KW'])
    },
  },
  methods: {
    formatThousands(number, range, units) {
      let value = number
      let unitIndex = 0
      if (value <= range) {
        value = Math.round(value)
      } else {
        unitIndex = 1
        value = Math.round(value / 1000)
      }
      return value.toLocaleString() + ' ' + this.$t(`Unit.${units[unitIndex]}`)
    },
  },
}
</script>
<style scoped>
.energy-report-summary-context {
  border: 1px solid #e8e8e8;
}
.summary-item-label {
  margin-right: 20px;
}
.summary-item-value {
  font-weight: bold;
  font-size: 20px;
}
</style>
