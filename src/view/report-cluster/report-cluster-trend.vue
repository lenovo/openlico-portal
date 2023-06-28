<template>
  <div ref="container" style="width: 100%; height: 100%; min-height: 400px" />
</template>
<script>
import * as EChart from 'echarts'

export default {
  props: ['data'],
  data() {
    return {
      innerChart: null,
      innerData: { date: [], running: [], waiting: [] },
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
    this.$nextTick(() => {
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
          text: this.$t('Report.Cluster.Chart.Trend'),
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        legend: {
          right: 0,
          data: [this.$t('Report.Cluster.Job.Running'), this.$t('Report.Cluster.Job.Waiting')],
        },
        grid: {
          left: '40px',
          right: '40px',
          bottom: '50px',
          containLabel: true,
        },
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 0,
            end: 100,
            // left: '102px',
            // right: '85px'
          },
        ],
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: this.innerData.date,
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
            type: 'line',
            stack: 'total',
            areaStyle: {},
            data: this.innerData.running,
          },
          {
            name: this.$t('Report.Cluster.Job.Waiting'),
            type: 'line',
            stack: 'total',
            areaStyle: {},
            data: this.innerData.waiting,
          },
        ],
      }
      this.innerChart.setOption(option)
    },
    initData() {
      const arr = { date: [], running: [], waiting: [] }
      this.data.dates.forEach((item, index) => {
        arr.date.push(item)
        arr.running.push(this.data.values[index][0])
        arr.waiting.push(this.data.values[index][1])
      })
      return arr
    },
    onResize() {
      this.innerChart.resize()
    },
  },
}
</script>
<style></style>
