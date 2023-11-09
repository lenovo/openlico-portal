<template>
  <div class="p-20 dashboard-backgroud-color">
    <div v-if="nodeStatus" class="dashboard-card-title" style="float: left">
      {{
        $T('Dashboard.NodeStatus.Chart.Title', {
          count: nodeStatus.on + nodeStatus.off,
        })
      }}
    </div>
    <div ref="container" style="width: 100%; height: 100%" />
  </div>
</template>
<script>
export default {
  inject: ['resize'],
  props: ['node'],
  data() {
    return {
      innerChart: null,
      // nodeStatus: null,
    }
  },
  computed: {
    nodeStatus() {
      if (this.node) {
        return this.node.nodeStatus
      }
      return { on: 0, off: 0 }
    },
  },
  watch: {
    node(val, oldVal) {
      this.init()
    },
    resize(val) {
      this.onResize()
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.$chart.init(this.$refs.container, window.gApp.echartsTheme.nodeStatus)
      this.init()
    })
  },
  methods: {
    onResize() {
      this.$chart.getInstanceByDom(this.$refs.container).resize()
    },

    init() {
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: name => {
            return (
              this.$t('Dashboard.NodeStatus.On') +
              ': ' +
              this.nodeStatus.on +
              '(' +
              ((this.nodeStatus.on / (this.nodeStatus.on + this.nodeStatus.off)) * 100).toFixed(0) +
              '%' +
              ')' +
              '</br>' +
              this.$t('Dashboard.NodeStatus.Off') +
              ': ' +
              this.nodeStatus.off +
              '(' +
              ((this.nodeStatus.off / (this.nodeStatus.on + this.nodeStatus.off)) * 100).toFixed(0) +
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
                      return this.nodeStatus.on + this.nodeStatus.off
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
                      return this.nodeStatus.on + this.nodeStatus.off
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
      this.$chart.getInstanceByDom(this.$refs.container).setOption(option)
    },
  },
}
</script>

<style scoped>
.node-satus-chart {
  height: 100%;
}
</style>
