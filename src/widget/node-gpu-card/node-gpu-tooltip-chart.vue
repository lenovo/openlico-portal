<template>
  <a-spin :spinning="loading" size="small">
    <div class="node-gpu-tooltip-container">
      <span class="node-gpu-tooltip-title">{{ $T('NodeGpus.Monitor.Tooltip.Title', { index: gpuId }) }}</span>
      <p style="color: #999; font-size: 12px; padding: 0 0 5px">
        {{ container.types[gpuId] }}
      </p>
      <p v-if="container.vendors.length" style="color: #999; font-size: 12px; padding: 0 0 5px">
        {{ container.vendors[gpuId] }}
      </p>
      <span
        v-for="(item, index) in chartList"
        :key="index"
        class="node-gpu-tooltip-current-value"
        :style="getCurrenrValuePosition(index)"
        >{{ currentData[index] }}</span
      >
      <div ref="tooltipChart" class="node-gpu-tooltip-chart" :style="`height: ${chartHeight * chartList.length}px;`" />
    </div>
    <div v-if="vendor === 'NVIDIA'" class="node-gpu-tooltip-mig">
      <p
        v-for="mig in container.devList[gpuId]"
        :key="mig.type"
        class="node-gpu-tooltip-mig-item"
        :title="mig.used ? $t('NodePanel.Gpu.Using') : ''">
        <span class="node-gpu-tooltip-mig-item-label">{{ mig.type }}</span>
        <i class="node-gpu-tooltip-mig-item-status" :class="{ 'mig-used': mig.used }" />
      </p>
    </div>
    <div v-if="vendor === 'INTEL' && container.devList[gpuId].length" class="node-gpu-tooltip-tile-info">
      <div class="node-gpu-tooltip-tile">
        <a-row class="node-gpu-tooltip-tile-header">
          <a-col span="6"></a-col>
          <a-col span="6">{{ $t('NodeGpus.Card.Tip.Util') }}</a-col>
          <a-col span="6">{{ $t('NodeGpus.Card.Tip.Mem') }}</a-col>
          <a-col span="6">{{ $t('NodeGpus.Card.Tip.Temp') }}</a-col>
        </a-row>
        <a-row
          v-for="tile in container.devList[gpuId]"
          :key="`${gpuId}-${tile.type}`"
          class="node-gpu-tooltip-tile-item b-w">
          <a-col span="6" class="node-gpu-tooltip-tile-item-span">{{ tile.type }}</a-col>
          <a-col span="6" class="node-gpu-tooltip-tile-item-span">{{ tile.uti + '%' }}</a-col>
          <a-col span="6" class="node-gpu-tooltip-tile-item-span">{{ tile.mem + '%' }}</a-col>
          <a-col span="6" class="node-gpu-tooltip-tile-item-span">{{ tile.temp + '℃' }}</a-col>
        </a-row>
      </div>
    </div>
  </a-spin>
</template>
<script>
import MonitorService from '@/service/monitor-data'
import AccessService from '@/service/access'
export default {
  inject: ['resize'],
  props: ['container', 'gpuId', 'job', 'vendor'],
  data() {
    return {
      loading: true,
      currentData: ['-', '-', '-'],
      chartList: ['Util', 'Memory', 'Temperature'],
      chartHeight: 50,
      titleHeight: 10,
      arch: AccessService.getSchedulerArch(),
      access: this.$store.state.auth.access,
      gap: 7,
      refreshId: null,
      refreshInterval: 15000,
    }
  },
  watch: {
    container(val, oldVal) {
      this.renderChart()
    },
    resize(val) {
      this.onResize()
    },
  },
  beforeUnmount() {
    clearTimeout(this.refreshId)
  },
  mounted() {
    this.$nextTick(() => {
      Object.defineProperty(this.$refs.tooltipChart, 'clientWidth', {
        get: function () {
          return 200
        },
      })
      Object.defineProperty(this.$refs.tooltipChart, 'clientHeight', {
        get: function () {
          return 150
        },
      })
      this.$chart.init(this.$refs.tooltipChart, window.gApp.echartsTheme.common)
      this.renderChart()
    })
  },
  methods: {
    renderChart() {
      const _this = this
      const chartHeight = this.chartHeight
      const titleHeight = this.titleHeight
      const gap = this.gap
      this.initData().then(res => {
        if (_this.$refs.tooltipChart === null) {
          return
        }
        const option = {
          animation: false,
          title: _this.chartList.map((item, index) => {
            return {
              left: -5,
              top: chartHeight * index - gap + 'px',
              text: window.gApp.$t(`NodeGpus.Monitor.Tooltip.${item}`),
              fontSize: '18px',
              fontWeight: 'normal',
            }
          }),
          xAxis: _this.chartList.map((item, index) => {
            return {
              show: false,
              data: res.x[index],
              gridIndex: index,
            }
          }),
          yAxis: _this.chartList.map((item, index) => {
            return {
              show: false,
              max: 100,
              splitLine: { show: false },
              gridIndex: index,
            }
          }),
          grid: _this.chartList.map((item, index, arr) => {
            return {
              show: true,
              top: chartHeight * index + titleHeight + gap + 'px',
              bottom: (arr.length - 1) * chartHeight - index * chartHeight + gap + 'px',
              left: 0,
              right: 0,
              borderWidth: 0,
              backgroundColor: '#00000010',
            }
          }),
          series: _this.chartList.map((item, index) => {
            return {
              type: 'line',
              lineStyle: {
                width: 1,
                color: _this.$chart.getInstanceByDom(_this.$refs.tooltipChart)._theme.color[0],
              },
              showSymbol: false,
              data: res.y[index],
              xAxisIndex: index,
              yAxisIndex: index,
            }
          }),
        }
        this.loading = false
        this.$chart.getInstanceByDom(this.$refs.tooltipChart).setOption(option)
      })
    },
    initData() {
      return new Promise((resolve, reject) => {
        this.getGpuData().then(res => {
          const x = []
          const y = []
          this.currentData = res.current
          res.history.forEach(item => {
            const time = []
            const value = []
            item.forEach(e => {
              const jobBeginTime = this.job ? new Date(this.job.beginTime).getTime() : 0
              const t = new Date(e.time).getTime()
              if (this.access !== 'staff' || jobBeginTime <= t) {
                time.push(e.time)
                value.push(e.values[0])
              }
            })
            x.push(time)
            y.push(value)
          })
          resolve({ x, y })
        })
      })
    },
    getGpuData() {
      const _this = this
      return new Promise((resolve, reject) => {
        const utilReq = MonitorService.getNodeGpuDataByHour(this.container.hostname, this.gpuId, 'util')
        const ramReq = MonitorService.getNodeGpuDataByHour(this.container.hostname, this.gpuId, 'ram')
        const tempReq = MonitorService.getNodeGpuDataByHour(this.container.hostname, this.gpuId, 'temperature')
        Promise.all([utilReq, ramReq, tempReq]).then(
          res => {
            const current = []
            const history = []
            res.forEach((item, index) => {
              if (index < 2) {
                current.push(_this.formatter(item.current, '%'))
              } else {
                current.push(_this.formatter(item.current, '℃'))
              }
              history.push(item.data)
            })
            resolve({ current, history })
          },
          err => {
            this.$message.error(err)
          },
        )
      })
    },
    formatter(value, unit) {
      if (value) {
        return value.toFixed(1) + unit
      } else if (value === 0) {
        return 0 + unit
      } else {
        return '-'
      }
    },
    onResize() {
      this.$nextTick(() => {
        this.$chart.getInstanceByDom(this.$refs.tooltipChart).resize()
      })
    },
    getCurrenrValuePosition(index) {
      const top = index * this.chartHeight + 90
      return `top: ${top}px;`
    },
  },
}
</script>
<style scoped>
.node-gpu-tooltip-title {
  display: inline-block;
  height: 20px;
}
.node-gpu-tooltip-mig-item {
  padding: 2px 0;
  display: flex;
}
.node-gpu-tooltip-mig-item-label {
  display: inline-block;
  width: 100%;
}
.node-gpu-tooltip-mig-item-status {
  display: inline-block;
  margin-top: 5px;
  width: 12px;
  height: 12px;
  background: #999;
}
.node-gpu-tooltip-mig-item-status.mig-used {
  background: #ffaf01;
}
.node-gpu-tooltip-tile-info {
  padding-top: 5px;
}
.node-gpu-tooltip-tile {
  background: #eee;
  padding: 5px;
}
.node-gpu-tooltip-tile-header {
  text-align: center;
  line-height: 20px;
}
.node-gpu-tooltip-tile-item {
  margin: 5px 0;
  text-align: center;
}
.node-gpu-tooltip-current-value {
  margin-top: -20px;
  display: inline-block;
}
</style>
