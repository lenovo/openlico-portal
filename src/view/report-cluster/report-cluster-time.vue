<template>
  <div>
    <a-select v-model="mode" class="report-time-select" @change="onModeChange">
      <a-select-option value="week">
        {{ $t('Report.Cluster.Chart.Time.Day') }}
      </a-select-option>
      <a-select-option value="hour">
        {{ $t('Report.Cluster.Chart.Time.Hour') }}
      </a-select-option>
    </a-select>
    <div ref="container" style="width: 100%; height: 100%; min-height: 400px" />
  </div>
</template>
<script>
import * as EChart from 'echarts'

export default {
  props: ['data'],
  data() {
    return {
      innerChart: null,
      innerData: {
        hour: { date: [], running: [], waiting: [] },
        week: { date: [], running: [], waiting: [] },
      },
      hour: [
        '00:00-02:00',
        '02:00-04:00',
        '04:00-06:00',
        '06:00-08:00',
        '08:00-10:00',
        '10:00-12:00',
        '12:00-14:00',
        '14:00-16:00',
        '16:00-18:00',
        '18:00-20:00',
        '20:00-22:00',
        '22:00-24:00',
      ],
      week: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      mode: 'week',
    }
  },
  watch: {
    data(val, oldVal) {
      if (val) {
        this.$nextTick(_ => {
          this.initChart()
          this.onResize()
        })
      }
    },
  },
  mounted() {
    this.$nextTick(function () {
      this.innerChart = EChart.init(this.$refs.container, window.gApp.echartsTheme.jobQueueStatus)
      window.removeEventListener('resize', this.onResize)
      window.addEventListener('resize', this.onResize)
      this.initChart()
      window.gApp.$watch('isCollapse', (newValue, oldValue) => {
        setTimeout(() => {
          this.onResize()
        }, 300)
      })
    })
  },
  methods: {
    initChart() {
      this.innerData = this.initData()
      const option = {
        title: {
          text: this.$t('Report.Cluster.Chart.Time'),
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none',
          },
        },
        legend: {
          right: 0,
          data: [this.$t('Report.Cluster.Job.Running'), this.$t('Report.Cluster.Job.Waiting')],
        },
        grid: {
          left: '3%',
          right: '1%',
          bottom: '12%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: this.innerData[this.mode].date,
            axisLabel: {
              interval: 0,
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: [
          {
            name: this.$t('Report.Cluster.Job.Running'),
            type: 'bar',
            stack: 'total',
            data: this.innerData[this.mode].running,
          },
          {
            name: this.$t('Report.Cluster.Job.Waiting'),
            type: 'bar',
            stack: 'total',
            data: this.innerData[this.mode].waiting,
          },
        ],
      }
      this.innerChart.setOption(option)
    },
    initData() {
      const arr = {
        hour: { date: [], running: [], waiting: [] },
        week: { date: [], running: [], waiting: [] },
      }
      this.data.hour.forEach((item, index) => {
        arr.hour.running.push(item[0])
        arr.hour.waiting.push(item[1])
      })
      arr.hour.date = this.hour
      this.data.week.forEach((item, index) => {
        arr.week.date.push(this.$t(`Report.Cluster.Chart.Time.${this.week[index]}`))
        arr.week.running.push(item[0])
        arr.week.waiting.push(item[1])
      })
      return arr
    },
    onModeChange(val) {
      this.initChart()
    },
    onResize() {
      this.innerChart.resize()
    },
  },
}
</script>
<style>
.report-time-select {
  float: right;
  margin-right: 300px;
  z-index: 10;
}
</style>
