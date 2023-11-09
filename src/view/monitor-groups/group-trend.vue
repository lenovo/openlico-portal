<template>
  <div class="TrendContainer p-20">
    <div>
      <a-select id="tid_group-trend-time-select" v-model:value="trendTimeUnit" @change="onTrendTimeIntervalChange">
        <a-select-option
          v-for="timeInterval in trendIntervalOption"
          :key="timeInterval.value"
          :value="timeInterval.value">
          {{ timeInterval.name }}
        </a-select-option>
      </a-select>
    </div>
    <div id="tid_group-trend-chart-list" class="TendencyChartContent">
      <a-row :gutter="20">
        <a-col
          v-for="(category, index) in trendChartCategory"
          :key="index"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="8"
          class="TrendChartItem">
          <trend-chart :group-id="currentSelectedGroupId" :tendency-category="category" :time-unit="trendTimeUnit" />
        </a-col>
      </a-row>
    </div>
  </div>
</template>
<script>
import TrendChart from './group-trend/trend-chart.vue'
import AccessService from '@/service/access'

export default {
  components: {
    'trend-chart': TrendChart,
  },
  props: ['currentSelectedGroupId'],
  data() {
    return {
      trendIntervalOption: [
        {
          value: 'hour',
          name: this.$t('Time.Select.Hour'),
        },
        {
          value: 'day',
          name: this.$t('Time.Select.Day'),
        },
        {
          value: 'week',
          name: this.$t('Time.Select.Week'),
        },
        {
          value: 'month',
          name: this.$t('Time.Select.Month'),
        },
      ],
      trendTimeUnit: 'hour',
      tendencyCharts: {},
    }
  },
  computed: {
    trendChartCategory() {
      const chartList = ['load', 'cpu', 'ram', 'disk', 'network', 'ib', 'energy', 'temperature']
      if (this.isScheduler) {
        chartList.push('job')
      }
      return chartList
    },
    isScheduler() {
      return (
        AccessService.getMatchFeatureCodes(['sc.host.*,monitor.scheduler'], this.$store.state.auth.featureCodes)
          .length > 0
      )
    },
  },
  methods: {
    onTrendTimeIntervalChange() {
      // Do nothing
    },
  },
}
</script>
<style>
.TrendContainer {
  background: #fff;
  padding-top: 20px;
}
.TrendChartItem {
  margin-top: 20px;
}
</style>
