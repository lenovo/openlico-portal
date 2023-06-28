<template>
  <div ref="container" class="node-monitor-chart-style" />
</template>
<script>
import * as ECharts from 'echarts'
import Format from '../../../common/format'

export default {
  props: ['nodeId', 'interval', 'initData', 'formatTime'],
  data() {
    return {
      innerChart: null,
      unit: this.$t('Monitor.Cpu.Unit'),
      innerNodeId: null,
    }
  },
  watch: {
    nodeId(val, oldVal) {
      this.clear()
      this.refresh()
    },
    initData(val, oldVal) {
      this.clear()
      this.refresh()
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.innerChart = ECharts.init(this.$refs.container, window.gApp.echartsTheme.common)
      window.removeEventListener('resize', this.resizeChart)
      window.addEventListener('resize', this.resizeChart)
      this.resizeChart()
      this.init()
      this.refresh()
      window.gApp.$watch('isCollapse', (newValue, oldValue) => {
        setTimeout(() => {
          this.resizeChart()
        }, 300)
      })
    })
  },
  destroyed() {
    clearTimeout(this.innerNodeId)
    window.removeEventListener('resize', this.resizeChart)
    this.innerNodeId = null
  },
  methods: {
    resizeChart() {
      this.innerChart.resize()
    },
    init() {
      const option = {
        title: {
          text: `${this.$t('Monitor.Cpu')} (${this.unit})`,
          textStyle: {
            fontSize: 14,
          },
          padding: [10, 5],
        },
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            const o = params[0]
            const time = o.value[0]
            return `${Format.formatDateTime(time, 'hh:mm MM-dd')}<br>
                    ${o.marker}${o.seriesName} : ${o.value[1]}${this.unit}
                    `
          },
        },
        grid: {
          top: 40,
          bottom: 30,
          left: 50,
          right: 30,
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
          max: 100,
        },
        series: [
          {
            name: this.$t('Monitor.Cpu'),
            type: 'line',
            yAxisIndex: 0,
            symbol: 'none',
            showSymbol: false,
            itemStyle: {
              lineStyle: {
                shadowBlur: 6,
                shadowColor: '#f1f8fe',
                width: 1,
              },
            },
            data: [],
          },
        ],
      }
      this.innerChart.setOption(option)
    },
    chartDataMapping(timeSeriesItem) {
      return {
        value: [timeSeriesItem.time, timeSeriesItem.values[0]],
      }
    },
    clear() {
      this.innerChart.setOption({
        series: [
          {
            data: [],
          },
        ],
      })
    },
    setChartData(response) {
      const cpuData = []
      response.data.forEach(item => {
        cpuData.push(this.chartDataMapping(item))
      })
      this.innerChart.setOption({
        xAxis: {
          axisLabel: {
            showMinLabel: this.initData.name === 'getNodeDataByMonth',
          },
        },
        series: [
          {
            data: cpuData,
          },
        ],
      })
      this.innerNodeId = setTimeout(this.refresh, this.interval)
    },
    refresh() {
      clearTimeout(this.innerNodeId)
      if (this._isDestroyed) return
      this.initData(this.nodeId, 'cpu', 1).then(
        res => {
          this.setChartData(res)
        },
        res => {
          this.$message.error(res)
        },
      )
    },
  },
}
</script>
<style scoped></style>
