<template>
  <div class="height--100 p-20 dashboard-backgroud-color">
    <div v-if="nodeStatus" class="dashboard-card-title" style="float: left">
      {{
        $t('Dashboard.NodeStatus.Chart.Title', {
          count: nodeStatus.on + nodeStatus.off,
        })
      }}
    </div>
    <div ref="container" style="width: 100%; height: 100%" />
  </div>
</template>
<script>
import * as ECharts from 'echarts'
export default {
  props: ['node'],
  data() {
    return {
      innerChart: null,
      nodeStatus: null,
    }
  },
  watch: {
    node(val, oldVal) {
      if (val) {
        this.init()
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.innerChart = ECharts.init(this.$refs.container, window.gApp.echartsTheme.nodeStatus)
      window.removeEventListener('resize', this.onResize)
      window.addEventListener('resize', this.onResize)
      this.onResize()
      if (this.node) {
        this.init()
      }
      window.gApp.$watch('isCollapse', (newValue, oldValue) => {
        setTimeout(() => {
          this.onResize()
        }, 300)
      })
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    onResize() {
      this.innerChart.resize()
    },

    init() {
      const $this = this
      this.nodeStatus = this.node.nodeStatus
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function (name) {
            return (
              $this.$t('Dashboard.NodeStatus.On') +
              ': ' +
              $this.nodeStatus.on +
              '(' +
              (($this.nodeStatus.on / ($this.nodeStatus.on + $this.nodeStatus.off)) * 100).toFixed(0) +
              '%' +
              ')' +
              '</br>' +
              $this.$t('Dashboard.NodeStatus.Off') +
              ': ' +
              $this.nodeStatus.off +
              '(' +
              (($this.nodeStatus.off / ($this.nodeStatus.on + $this.nodeStatus.off)) * 100).toFixed(0) +
              '%' +
              ')'
            )
          },
        },
        legend: {
          top: 'bottom',
          right: '0',
          data: [
            this.$t('Dashboard.NodeStatus.On') + ': ' + this.nodeStatus.on,
            this.$t('Dashboard.NodeStatus.Off') + ': ' + this.nodeStatus.off,
          ],
        },
        series: [
          {
            type: 'pie',
            center: ['50%', '50%'],
            radius: ['100%', '140%'],
            x: 'center',
            y: 'center',
            avoidLabelOverlap: false,
            label: {
              show: false,
            },
            labelLine: {
              show: false,
            },
            data: [
              {
                name: this.$t('Dashboard.NodeStatus.On') + ': ' + this.nodeStatus.on,
                value: this.nodeStatus.on,
                emphasis: {
                  scale: false,
                },
                itemStyle: {
                  label: {
                    show: false,
                    formatter: function () {
                      return $this.nodeStatus.on + $this.nodeStatus.off
                    },
                    position: 'center',
                  },
                  labelLine: {
                    show: false,
                  },
                },
              },
              {
                name: this.$t('Dashboard.NodeStatus.Off') + ': ' + this.nodeStatus.off,
                value: this.nodeStatus.off,
                emphasis: {
                  scale: false,
                },
                itemStyle: {
                  label: {
                    show: false,
                    formatter: function () {
                      return $this.nodeStatus.on + $this.nodeStatus.off
                    },
                    position: 'center',
                  },
                  labelLine: {
                    show: false,
                  },
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

<style lang="css">
.node-satus-chart {
  height: 100%;
}
</style>
