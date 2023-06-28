<template>
  <div ref="container" class="node-cpu-chart-bar" />
</template>

<script type="text/javascript">
import * as ECharts from 'echarts'
export default {
  props: ['node', 'valueType', 'valueRange', 'isReversal', 'current'],
  data() {
    return {
      innerChart: null,
      nodeCpus: this.node,
      type: 'util',
      range: [0, 0],
      barColors: ['#33AAFF', '#d9eeff'],
      series_data_max: [],
      fixed_bar_width: 20,
    }
  },
  watch: {
    current(val, oldVal) {
      this.$nextTick(() => {
        this.init_data()
        this.init_chart()
      })
    },
    valueRange(val, oldVal) {
      this.$nextTick(() => {
        this.range = val
        this.init_chart()
      })
    },
    isReversal(val, oldVal) {
      this.$nextTick(() => {
        this.init_chart()
      })
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.init_data()
      this.innerChart = ECharts.init(this.$refs.container, window.gApp.echartsTheme.common)
      window.removeEventListener('resize', this.onResize)
      window.addEventListener('resize', this.onResize)
      this.onResize()
      this.init_chart()
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    init_data() {
      this.nodeCpus = this.node
      if (this.current === 0 || this.current) {
        this.nodeCpus.values = [this.current.toFixed(0)]
      } else {
        this.nodeCpus.values = ['-']
      }
      this.nodeCpus.used = [0]
      this.series_data_max = this.modifyGapData(this.nodeCpus.values)
      this.type = this.valueType || this.type
      this.range = this.valueRange
    },
    onResize() {
      if (this.innerChart) {
        this.innerChart.resize()
      }
    },
    init_chart() {
      const $this = this
      this.innerChart.resize()
      const option = {
        title: {
          show: false,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          formatter: function (p) {
            return $this.$t(`NodeCpus.Monitor.Chart.${$this.type}`, { value: p[1].data })
          },
        },
        grid: {
          left: '0',
          top: '5px',
          bottom: '10px',
          right: '0',
        },
        yAxis: {
          show: false,
          type: 'value',
          name: 'Days',
          axisLabel: {
            formatter: '{value}',
          },
        },
        xAxis: [
          {
            type: 'category',
            data: $this.nodeCpus.used,
            show: false,
          },
          {
            type: 'category',
            data: $this.nodeCpus.used,
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
              width: 10,
              formatter: function (value) {
                return '{' + value + '|}'
              },
              margin: 0,
              interval: 0,
              rich: {
                value: {
                  lineHeight: 10,
                  align: 'center',
                },
                1: {
                  height: 5,
                  width: $this.fixed_bar_width,
                  align: 'center',
                  backgroundColor: 'rgb(255, 175, 1)',
                },
                0: {},
                2: {
                  height: 5,
                  width: $this.fixed_bar_width,
                  align: 'center',
                  backgroundColor: '#6bcb01',
                },
              },
            },
          },
        ],
        series: [
          {
            type: 'bar',
            barGap: '-100%',
            barCategoryGap: '50',
            barWidth: String($this.fixed_bar_width) + 'px',
            data: $this.series_data_max,
            animation: false,
          },
          {
            // name: 'GPU usage(%)',
            type: 'bar',
            data: $this.nodeCpus.values,
            label: {
              formatter: function (val) {
                if ($this.reversal(val)) {
                  return val.data
                } else {
                  return ''
                }
              },
              show: true,
              position: 'insideTop',
              textColor: '#333',
              textBorderColor: '#333',
              textBorderWidth: 0,
            },
            barWidth: String($this.fixed_bar_width) + 'px',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: '#fff',
              emphasis: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }

      $this.innerChart.setOption(option)
    },
    reversal(val) {
      let isShowLabel = val.data >= this.range[0] && val.data <= this.range[1]
      if (this.isReversal) {
        isShowLabel = val.data <= this.range[0] || val.data >= this.range[1]
      }
      return isShowLabel
    },
    modifyGapData(values) {
      const arr = []
      values.forEach(item => {
        arr.push(100)
      })
      return arr
    },
  },
}
</script>

<style>
.node-cpu-chart-bar {
  width: 50px;
  height: 100%;
}
</style>
