<template>
  <div ref="container" class="node-monitor-chart-style" />
</template>
<script>
import Formatter from '@/common/format'

export default {
  inject: ['resize'],
  props: ['nodeId', 'interval', 'initData', 'formatTime'],
  data() {
    return {
      innerChart: null,
      innerNodeId: null,
      yAxis: {
        max: 10,
        min: 0,
      },
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
    resize(val) {
      this.resizeChart()
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.$chart.init(this.$refs.container, window.gApp.echartsTheme.common)
      this.resizeChart()
      this.init()
      this.refresh()
    })
  },
  unmounted() {
    clearTimeout(this.innerNodeId)
    this.innerNodeId = null
  },
  methods: {
    resizeChart() {
      this.$chart.getInstanceByDom(this.$refs.container).resize()
    },
    init() {
      const option = {
        title: {
          text: this.$t('Monitor.Load'),
          textStyle: {
            fontSize: 14,
          },
          padding: [10, 5],
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const o = params[0]
            const time = o.value[0]
            return `${Formatter.formatDateTime(time, 'hh:mm MM-dd')}<br>
                    ${o.marker}${o.seriesName} : ${o.value[1]}
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
          name: '',
          axisLine: {
            show: false,
          },
          axisLabel: {
            formatter: '{value}',
          },
          axisTick: {
            show: false,
          },
          min: this.yAxis.min,
          max: this.yAxis.max,
        },
        series: [
          {
            name: this.$t('Monitor.Load'),
            type: 'line',
            yAxisIndex: 0,
            symbol: 'none',
            showSymbol: false,
            itemStyle: {
              lineStyle: {
                width: 1,
              },
            },
            data: [],
          },
        ],
      }
      this.$chart.getInstanceByDom(this.$refs.container).setOption(option)
    },
    chartDataMapping(timeSeriesItem) {
      return {
        value: [timeSeriesItem.time, timeSeriesItem.values[0]],
      }
    },
    clear() {
      this.$chart.getInstanceByDom(this.$refs.container).setOption({
        series: [
          {
            data: [],
          },
        ],
      })
    },
    setChartData(response) {
      const loadData = []
      response.data.forEach(item => {
        loadData.push(this.chartDataMapping(item))
      })
      const values = loadData.map(i => (i.value[1] === '-' ? 0 : i.value[1]))
      const max = Math.max(...values) < this.yAxis.max ? this.yAxis.max : null
      this.$chart.getInstanceByDom(this.$refs.container).setOption({
        xAxis: {
          axisLabel: {
            showMinLabel: this.initData.name === 'getNodeDataByMonth',
          },
        },
        yAxis: {
          max,
        },
        series: [
          {
            data: loadData,
          },
        ],
      })
      this.innerNodeId = setTimeout(this.refresh, this.interval)
    },
    refresh() {
      clearTimeout(this.innerNodeId)
      if (this._isDestroyed) return
      this.initData(this.nodeId, 'load', 1).then(
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
