<template>
  <div ref="container" class="node-monitor-chart-style" />
</template>

<script>
import Format from './../../../common/format'
import * as ECharts from 'echarts'
export default {
  props: ['node'],
  data() {
    return {
      innerChart: null,
      unit: this.$t('Monitor.Disk.Unit'),
      diskRate: {
        used: 0,
        total: 0,
      },
    }
  },
  watch: {
    node: {
      handler(val) {
        this.init()
      },
      deep: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.innerChart = ECharts.init(this.$refs.container, window.gApp.echartsTheme.common)
      window.removeEventListener('resize', this.resizeChart)
      window.addEventListener('resize', this.resizeChart)
      this.resizeChart()
      this.init()
      window.gApp.$watch('isCollapse', (newValue, oldValue) => {
        setTimeout(() => {
          this.resizeChart()
        }, 300)
      })
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
  },
  methods: {
    resizeChart() {
      this.innerChart.resize()
    },

    init() {
      if (!this.node) return
      this.diskRate.used = this.node.diskUsed
      this.diskRate.total = this.node.diskTotal
      const option = {
        title: {
          text: this.$t('Monitor.Disk'),
          textStyle: {
            fontSize: 14,
          },
          padding: [10, 5],
        },
        tooltip: {
          show: this.diskRate.total !== null,
          trigger: 'item',
          formatter: p => {
            return `${p.marker}${p.name}: ${Format.formatNumber(p.percent, 1)}${this.unit} / ${Format.formatByteSize(
              p.value,
            )}`
          },
        },
        series: [
          {
            type: 'pie',
            center: ['50%', '55%'],
            radius: ['120%', '150%'],
            x: 'center',
            y: 'center',
            label: { show: false },
            data: [
              {
                name: this.$t('Node.Disk.Chart.Used'),
                value: this.diskRate.used,
                emphasis: {
                  scale: false,
                },
                label: {
                  show: false,
                },
                labelLine: {
                  show: false,
                },
              },
              {
                name: this.$t('Node.Disk.Chart.Free'),
                value: this.diskRate.total - this.diskRate.used,
                emphasis: {
                  scale: false,
                },
                itemStyle: {
                  label: {
                    show: false,
                  },
                  labelLine: {
                    show: false,
                  },
                },
                label: {
                  show: true,
                  formatter: () => {
                    if (this.diskRate.total === null) return '-'
                    return Format.formatByteSize(this.diskRate.total)
                  },
                  position: 'center',
                  fontSize: 18,
                },
                labelLine: {
                  show: false,
                },
              },
            ],
          },
        ],
      }
      this.innerChart.setOption(option)
    },
  },
}
</script>
