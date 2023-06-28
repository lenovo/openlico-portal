<template>
  <div ref="container" class="node-cpu-chart-line" />
</template>

<script type="text/javascript">
import * as ECharts from 'echarts'
import Format from './../../common/format'

export default {
  props: ['node', 'data'],
  data() {
    return {
      innerChart: null,
    }
  },
  watch: {
    data(val, oldVal) {
      this.initData()
      this.initChart()
      this.onResize()
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initData()
      this.innerChart = ECharts.init(this.$refs.container, window.gApp.echartsTheme.common)
      window.removeEventListener('resize', this.onResize)
      window.addEventListener('resize', this.onResize)
      this.initChart()
      this.onResize()
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    initData() {
      const x = []
      const y = []
      this.data.forEach(item => {
        x.push(Format.formatDateTime(item.time, 'yyyy-MM-dd hh:mm'))
        y.push(item.values[0])
      })
      return { x, y }
    },
    initChart() {
      const $this = this
      const data = this.initData()
      const option = {
        grid: {
          show: true,
          left: '0',
          top: '5px',
          bottom: '10px',
          right: '0',
          borderWidth: 0,
        },
        tooltip: {
          trigger: 'axis',
          formatter: p => {
            return `${p[0].name}<br />${p[0].marker}${p[0].value}${this.$t('Monitor.Cpu.Unit')}`
          },
        },
        xAxis: {
          show: false,
          type: 'category',
          data: data.x,
        },
        yAxis: {
          show: false,
          max: 100,
          splitLine: { show: false },
          type: 'value',
        },
        series: [
          {
            data: data.y,
            type: 'line',
            showSymbol: false,
          },
        ],
      }

      $this.innerChart.setOption(option)
    },
    onResize() {
      if (this.innerChart) {
        this.innerChart.resize()
      }
    },
  },
}
</script>

<style>
.node-cpu-chart-line {
  margin: 0 10px;
  height: 100%;
  width: 100%;
}
</style>
