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
      unit: this.$t('Monitor.Eth.Unit'),
      innerNodeId: null,
      yAxis: {
        max: 100,
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
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            const time = [Format.formatDateTime(params[0].value[0], 'hh:mm MM-dd')]
            const context = params.map(i => {
              const val = isNaN(i.value[1]) ? '-' : i.value[1] + this.unit
              return `${i.marker}${i.seriesName}: ${val}`
            })
            return [...time, ...context].join('<br/>')
          },
        },
        grid: {
          top: 40,
          bottom: 30,
          left: 50,
          right: 30,
        },
        title: {
          text: `${this.$t('Monitor.Eth')} (${this.unit})`,
          textStyle: {
            fontSize: 14,
          },
          padding: [10, 5],
        },
        xAxis: {
          type: 'time',
          axisLabel: {
            formatter: val => {
              return this.formatTime(val)
            },
          },
          splitLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          name: '',
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          min: this.yAxis.min,
          max: this.yAxis.max,
        },
        series: ['In', 'Out'].map(i => {
          return {
            name: this.$t(`Monitor.Net.${i}`),
            type: 'line',
            symbol: 'none',
            data: this[`net${i}Data`],
            itemStyle: {
              lineStyle: {
                width: 1,
              },
            },
          }
        }),
      }
      this.$chart.getInstanceByDom(this.$refs.container).setOption(option)
    },
    parseNetIn(timeSeriesItem) {
      return {
        value: [timeSeriesItem.time, timeSeriesItem.values[0]],
      }
    },
    parseNetOut(timeSeriesItem) {
      return {
        value: [timeSeriesItem.time, timeSeriesItem.values[1]],
      }
    },
    parseTime(time) {
      let hours = time.getHours()
      let minutes = time.getMinutes()
      let seconds = time.getSeconds()
      if (hours < 10) hours = '0' + hours
      if (minutes < 10) minutes = '0' + minutes
      if (seconds < 10) seconds = '0' + seconds
      return hours + ':' + minutes + ':' + seconds
    },
    clear() {
      this.$chart.getInstanceByDom(this.$refs.container).setOption({
        series: [{ data: [] }, { data: [] }],
      })
    },
    setChartData(response) {
      const netInData = []
      const netOutData = []
      response.data.forEach(item => {
        netInData.push(this.parseNetIn(item))
        netOutData.push(this.parseNetOut(item))
      })
      const values = netInData
        .map(i => (i.value[1] === '-' ? 0 : i.value[1]))
        .concat(netOutData.map(i => (i.value[1] === '-' ? 0 : i.value[1])))
      const max = Math.max(...values) < this.yAxis.max ? this.yAxis.max : null
      this.$chart.getInstanceByDom(this.$refs.container).setOption({
        xAxis: {
          axisLabel: {
            showMinLabel: this.initData.name === 'getNodeDataByMonth',
          },
        },
        yAxis: { max },
        series: [{ data: netInData }, { data: netOutData }],
      })
      this.innerNodeId = setTimeout(this.refresh, this.interval)
    },
    refresh() {
      clearTimeout(this.innerNodeId)
      if (this._isDestroyed) return
      if (this.nodeId !== 0) {
        this.initData(this.nodeId, 'network', 1).then(
          res => {
            this.setChartData(res)
          },
          res => {
            this.$message.error(res)
          },
        )
      }
    },
  },
}
</script>
<style scoped></style>
