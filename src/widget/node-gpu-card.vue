<template>
  <a-popover
    id="node-gpu-card-popover"
    v-model="tooltipVisible"
    trigger="contextmenu"
    placement="bottom"
    :destroy-tooltip-on-hide="true"
    :get-popup-container="n => n.ownerDocument.body">
    <tooltip-chart
      slot="content"
      ref="tooltipChart"
      :container="node"
      :gpu-id="gpuId"
      :job="job"
      :vendor="node.vendors[gpuId]"
      class="node-gpu-tooltip-popper"
      :style="`height: ${tooltipHeight}px;`" />
    <div class="node-gpu-card">
      <span :title="node.hostname" class="node-gpu-card-title">{{ node.hostname }}</span>
      <div
        id="node-gpu-card-container"
        ref="container"
        class="node-gpu-chart"
        :class="isShowTwoChart ? 'show-two-chart' : 'show-one-chart'" />
      <div
        id="node-gpu-card-containerFix"
        ref="containerFix"
        class="node-gpu-chart"
        :class="{ 'show-two-chart': isShowTwoChart }"
        :style="styleObj" />
    </div>
  </a-popover>
</template>

<script type="text/javascript">
import * as ECharts from 'echarts'
import TooltipChart from './node-gpu-card/node-gpu-tooltip-chart'
import Access from '../service/access'
import MonitorService from '../service/monitor-data'

export default {
  components: {
    TooltipChart,
  },
  props: ['node', 'valueType', 'job'],
  data() {
    return {
      innerChart: null,
      innerChartFix: null,
      type: 'util',
      fixed_bar_width: 20,
      tooltipVisible: false,
      access: this.$store.state.auth.access,
      arch: Access.getScheduler(),
      gpuId: 0,
    }
  },
  computed: {
    isShowTwoChart() {
      return this.node.values.length > 4
    },
    styleObj() {
      let barItem = 0
      if (this.isShowTwoChart) {
        barItem = this.node.values.length - 4
      }
      // Let the gpu histogram of the second row be arranged from the left;
      switch (barItem) {
        case 0:
          return {
            width: 0,
          }
        case 1:
          return {
            width: 'calc(25% + 30px)',
          }
        case 2:
          return {
            width: 'calc(50% + 20px)',
          }
        case 3:
          return {
            width: 'calc(75% + 10px)',
          }
        case 4:
          return {
            width: '100%',
          }
        default:
          return {}
      }
    },
    tooltipHeight() {
      const dev = MonitorService.VendorMap[this.node.vendors[this.gpuId]]
      const devHeight = !this.node.devList[this.gpuId].length
        ? 0
        : dev.top + this.node.devList[this.gpuId].length * dev.lineHeight
      return 210 + devHeight
    },
  },
  watch: {
    node(val, oldVal) {
      this.$nextTick(() => {
        this.onResize()
        this.setChartOption()
      })
    },
    valueType(val, old) {
      this.type = val || this.type
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
      window.removeEventListener('resize', this.onResize)
      window.addEventListener('resize', this.onResize)
      if (this.innerChart && this.innerChart.on) {
        this.innerChart.on('mouseover', params => this.mouseoverEvent(params, 1))
        this.innerChart.on('mouseout', params => this.mouseoutEvent(params))
      }
      if (this.innerChartFix && this.innerChartFix.on) {
        this.innerChartFix.on('mouseover', params => this.mouseoverEvent(params, 2))
        this.innerChartFix.on('mouseout', params => this.mouseoutEvent(params))
      }
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
    if (this.innerChart.clear() && this.innerChartFix.clear()) {
      this.innerChart.clear()
      this.innerChartFix.clear()
    }
  },
  methods: {
    onResize() {
      if (this.innerChart) {
        this.innerChart.resize()
      }
      if (this.innerChartFix) {
        this.innerChartFix.resize()
      }
    },
    initChart() {
      this.innerChart = ECharts.init(this.$refs.container, window.gApp.echartsTheme.common)
      if (this.$refs.containerFix.offsetWidth) {
        this.innerChartFix = ECharts.init(this.$refs.containerFix, window.gApp.echartsTheme.common)
      }
      this.setChartOption()
    },
    setChartOption() {
      const node = this.node
      this.innerChart.setOption(
        this.getChartOption(
          {
            id: node.id,
            hostname: node.hostname,
            values: node.values.slice(0, 4),
            used: node.used.slice(0, 4),
            gpuIndex: node.gpuIndex.slice(0, 4),
            series_data_max: this.modifyGapData(node.values.slice(0, 4)),
          },
          1,
        ),
      )
      if (this.isShowTwoChart) {
        this.innerChartFix.setOption(
          this.getChartOption(
            {
              id: node.id,
              hostname: node.hostname,
              values: node.values.slice(4, 8),
              used: node.used.slice(4, 8),
              gpuIndex: node.gpuIndex.slice(4, 8),
              series_data_max: this.modifyGapData(node.values.slice(4, 8)),
            },
            2,
          ),
        )
      }
      this.onResize()
    },
    getChartOption(data, chartIndex) {
      const option = {
        tooltip: {
          show: false,
        },
        grid: {
          left: '20px',
          top: this.isShowTwoChart && chartIndex === 2 ? '5px' : '20px',
          bottom: this.isShowTwoChart && chartIndex === 1 ? '5px' : '20px',
          right: '20px',
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
            data: data.used,
            show: false,
          },
          {
            type: 'category',
            data: data.used,
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
                  width: this.fixed_bar_width,
                  align: 'center',
                  backgroundColor: 'rgb(255, 175, 1)',
                },
                0: {},
                2: {
                  height: 5,
                  width: this.fixed_bar_width,
                  align: 'center',
                  backgroundColor: 'rgb(107, 203, 1)',
                },
              },
            },
          },
        ],
        series: [
          {
            type: 'bar',
            itemStyle: {
              color: 'rgba(0,0,0,0.05)',
            },
            barGap: '-100%',
            barCategoryGap: '50',
            barWidth: String(this.fixed_bar_width) + 'px',
            data: data.series_data_max,
            animation: false,
          },
          {
            // name: 'GPU usage(%)',
            type: 'bar',
            data: data.values,
            label: {
              show: true,
              position: 'insideTop',
              textBorderWidth: 0,
              color: '#fff',
              formatter: p => {
                return Math.round(p.data)
              },
            },
            barWidth: String(this.fixed_bar_width) + 'px',
            emphasis: {
              shadowBlur: 10,
              shadowColor: '#fff',
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }
      return option
    },
    mouseoverEvent(params, index) {
      if (this.access !== 'staff' || this.node.used[(index - 1) * 4 + params.dataIndex] === 2) {
        this.gpuId = this.node.gpuIndex[(index - 1) * 4 + params.dataIndex]
        this.tooltipVisible = true
      }
    },
    mouseoutEvent(params) {
      this.tooltipVisible = false
      this.gpuId = 0
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
<style scoped>
.node-gpu-card {
  width: 100%;
  height: 100%;
  border: 1px solid #eee;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.node-gpu-card-title {
  display: inline-block;
  /* width: 50%; */
  height: 20px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding-left: 20px;
}
.node-gpu-chart {
  width: 100%;
  box-sizing: border-box;
}
.show-two-chart {
  height: 50%;
}
.show-one-chart {
  height: 100%;
}
.node-gpu-tooltip-popper {
  min-height: 210px;
  width: 200px;
}
</style>
