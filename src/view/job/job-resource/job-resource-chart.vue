<template>
  <div ref="jobResourceChart" class="job-resource-chart" />
</template>

<script>
import * as ECharts from 'echarts'
import Format from '../../../common/format'
export default {
  props: ['initData', 'color', 'type'],
  data() {
    return {
      innerChart: null,
      lableMap: {
        cpu: this.$t('Monitor.Cluster.CPU'),
        memory: this.$t('Monitor.Cluster.Memory'),
        gpu: this.$t('Monitor.Resource.GPU'),
        gmemory: this.$t('Monitor.Resource.GPU.Memory'),
      },
    }
  },
  watch: {
    initData(val, oldVal) {
      this.setChartData()
    },
  },
  mounted() {
    this.innerChart = ECharts.init(this.$refs.jobResourceChart)
    window.removeEventListener('resize', this.resizeChart)
    window.addEventListener('resize', this.resizeChart)
    this.resizeChart()
    this.init()
    window.gApp.$watch('isCollapse', (newValue, oldValue) => {
      setTimeout(() => {
        this.resizeChart()
      }, 300)
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    this.innerChart.clear()
  },
  methods: {
    resizeChart() {
      this.innerChart.resize()
    },
    init() {
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            let time
            if (Array.isArray(this.color)) {
              const curent = params[0]
              const others = params[1]
              time = curent.value[0]
              return `${Format.formatDateTime(time, 'hh:mm MM-dd')}<br>
                                    ${curent.marker}${curent.seriesName}: ${
                curent.value[1] !== '-' ? curent.value[1] + '%' : '-'
              }<br>
                                    ${others.marker}${others.seriesName}: ${
                others.value[1] !== '-' ? others.value[1] + '%' : '-'
              }
                                    `
            } else {
              const o = params[0]
              time = o.value[0]
              return `${Format.formatDateTime(time, 'hh:mm MM-dd')}<br>
                                    ${o.marker}${o.seriesName}: ${o.value[1] !== '-' ? o.value[1] + '%' : '-'}
                                    `
            }
          },
        },
        animation: false,
        grid: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
        xAxis: {
          type: 'time',
          splitLine: {
            show: false,
          },
          axisLabel: {
            formatter: val => {
              return this.formatTime(val)
            },
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false,
          },
          axisLabel: {
            formatter: '{value}',
          },
          axisTick: {
            show: false,
          },
          min: 0,
          max: val => (val.max > 100 ? val.max : 100),
        },
        series: [
          {
            type: 'line',
            yAxisIndex: 0,
            symbol: 'none',
            showSymbol: false,
            color: Array.isArray(this.color) ? this.color[0] : this.color,
            stack: 'occupied',
            data: [],
            areaStyle: {},
          },
        ],
      }
      this.innerChart.setOption(option)
    },
    setChartData() {
      let series = []
      if (this.initData) {
        if (Array.isArray(this.color)) {
          const data0 = []
          const data1 = []
          this.initData.data.forEach(item => {
            data0.push(this.chartDataMapping(item, 0))
            data1.push(this.chartDataMapping(item, 1))
          })
          series = [
            {
              type: 'line',
              yAxisIndex: 0,
              symbol: 'none',
              showSymbol: false,
              color: this.color[1],
              stack: 'occupied',
              data: data1,
              name: this.$t('Monitor.Resource.Title.Others'),
              areaStyle: {},
            },
            {
              type: 'line',
              yAxisIndex: 0,
              symbol: 'none',
              showSymbol: false,
              color: this.color[0],
              stack: 'occupied',
              data: data0,
              name: this.$t('Monitor.Resource.Title.Current.Job'),
              areaStyle: {},
            },
          ]
        } else {
          const data = []
          this.initData.data.forEach(item => {
            data.push(this.chartDataMapping(item, 0))
          })
          series = [
            {
              type: 'line',
              name: this.lableMap[this.type],
              yAxisIndex: 0,
              symbol: 'none',
              showSymbol: false,
              color: this.color,
              stack: 'occupied',
              data,
              areaStyle: {},
            },
          ]
        }
        this.innerChart.setOption({ series })
        this.resizeChart()
      }
    },
    chartDataMapping(timeSeriesItem, index) {
      return {
        value: [timeSeriesItem.time, timeSeriesItem.values[index]],
      }
    },
    formatTime(val) {
      if (this.initTime === 3600 || this.initTime === 86400) {
        return Format.formatDateTime(new Date(val), 'hh:mm')
      }
      if (this.initTime === 604800 || this.initTime === 2592000) {
        return Format.formatDateTime(new Date(val), 'MM-dd')
      }
    },
  },
}
</script>

<style scoped></style>
