<template>
  <div id="tid_node_ib_chart" ref="innerNodeIBChart" class="node-monitor-chart-style" />
</template>
<script>
import * as ECharts from 'echarts'
import Format from '../../../common/format'
export default {
  props: ['nodeId', 'interval', 'initData', 'formatTime'],
  data() {
    return {
      innerChart: null,
      unit: this.$t('Monitor.IB.Unit'),
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
  },
  mounted() {
    this.$nextTick(() => {
      this.init()
      window.removeEventListener('resize', this.resizeChart)
      window.addEventListener('resize', this.resizeChart)
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
    init() {
      this.innerChart = ECharts.init(this.$refs.innerNodeIBChart, window.gApp.echartsTheme.common)
      const options = {
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
          text: `${this.$t('Monitor.IB')} (${this.unit})`,
          textStyle: {
            fontSize: 14,
          },
          padding: [10, 5],
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
        },
        yAxis: {
          name: '',
          axisLine: {
            show: false,
          },
          splitLine: {
            show: true,
          },
          axisTick: {
            show: false,
          },
          min: this.yAxis.min,
          max: this.yAxis.max,
        },
        series: [],
      }
      this.innerChart.setOption(options)
      this.refresh()
    },
    parseIBValue(data, type) {
      const ibItem = {
        time: data.time,
        value: type === 'in' ? data.values[0] : data.values[1],
      }
      return ibItem
    },
    setChartData(data) {
      const pointer = this
      const seriesData = {
        In: [],
        Out: [],
      }
      data.data.forEach(item => {
        seriesData.In.push(this.parseIBValue(item, 'in'))
        seriesData.Out.push(this.parseIBValue(item, 'out'))
      })
      const series = ['In', 'Out'].map(i => {
        return {
          name: pointer.$t(`Monitor.Net.${i}`),
          type: 'line',
          symbol: 'none',
          data: seriesData[i].map(item => {
            return [item.time, item.value]
          }),
          itemStyle: {
            lineStyle: {
              width: 1,
            },
          },
        }
      })
      const values = seriesData.In.map(i => (i.value === '-' ? 0 : i.value)).concat(
        seriesData.Out.map(i => (i.value === '-' ? 0 : i.value)),
      )
      const max = Math.max(...values) < this.yAxis.max ? this.yAxis.max : null
      const xAxis = {
        axisLabel: {
          showMinLabel: this.initData.name === 'getNodeDataByMonth',
        },
      }
      this.innerChart.setOption({ xAxis, yAxis: { max }, series })
      this.innerNodeId = setTimeout(this.refresh, this.interval)
    },
    refresh() {
      clearTimeout(this.innerNodeId)
      if (this._isDestroyed) return
      this.initData(this.nodeId, 'ib', 1).then(
        res => {
          this.setChartData(res)
        },
        res => {
          this.$message.error(res)
        },
      )
    },
    clear() {
      this.innerChart.setOption({
        xAxis: {},
        series: [],
      })
      this.refresh()
    },
    resizeChart() {
      this.innerChart.resize()
    },
  },
}
</script>
<style scoped></style>
