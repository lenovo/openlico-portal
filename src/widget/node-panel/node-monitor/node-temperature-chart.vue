<template>
  <div ref="container" class="node-monitor-chart-style" />
</template>
<script>
import Format from '@/common/format'

export default {
  inject: ['resize'],
  props: ['nodeId', 'interval', 'initData', 'formatTime'],
  data() {
    return {
      innerChart: null,
      unit: this.$t('Monitor.Temp.Unit'),
      innerNodeId: 0,
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
          text: `${this.$t('Monitor.Temp')} (${this.unit})`,
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
          min: 0,
          max: 100,
        },
        series: [
          {
            name: this.$t('Monitor.Temp'),
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
      const temperatureData = []
      response.data.forEach(item => {
        temperatureData.push(this.chartDataMapping(item))
      })
      this.$chart.getInstanceByDom(this.$refs.container).setOption({
        xAxis: {
          axisLabel: {
            showMinLabel: this.initData.name === 'getNodeDataByMonth',
          },
        },
        series: [
          {
            data: temperatureData,
          },
        ],
      })
      this.innerNodeId = setTimeout(this.refresh, this.interval)
    },
    refresh() {
      clearTimeout(this.innerNodeId)
      if (this._isDestroyed) return
      this.initData(this.nodeId, 'temperature', 1).then(
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
