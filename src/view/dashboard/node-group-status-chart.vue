<template>
  <div class="p-20 dashboard-backgroud-color" style="height: 230px">
    <div class="dashboard-card-title" style="float: left">
      {{ $t('Dashboard.NodeGroupStatus.Chart.Title') }}
    </div>
    <div ref="container" style="width: 100%; height: 100%" />
  </div>
</template>
<script>
import * as ECharts from 'echarts'
export default {
  props: ['initData'],
  data() {
    return {
      innerChart: null,
      nodeStatus: null,
    }
  },
  watch: {
    initData(val, oldVal) {
      if (val) {
        this.init()
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.innerChart = ECharts.init(this.$refs.container, window.gApp.echartsTheme.nodegroupStatus)
      window.removeEventListener('resize', this.onResize)
      window.addEventListener('resize', this.onResize)
      this.onResize()
      if (this.initData) {
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
      if (this.initData) {
        const counts = this.processChartYCountData(this.initData.nodeGroupStatus.status)
        this.nodeStatus = {
          groups: {
            labels: this.processChartYLabelData(this.initData.nodeGroupStatus.group),
            counts,
          },
          status: this.processChartValueData(this.initData.nodeGroupStatus.status, counts),
        }
        this.draw(this.initData.nodeGroupStatus)
      }
    },
    draw(data) {
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          formatter: a => {
            const name = a[0].name
            let num = 0
            let str = name
            this.nodeStatus.groups.labels.forEach((item, index) => {
              if (item === name) {
                num = index
              }
            })
            for (const item in this.nodeStatus.status) {
              const status = this.$t('Dashboard.NodeGroupStatus.Chart.' + item.replace('_', ''))
              str += '<br />' + status + ': ' + this.initData.nodeGroupStatus.status[item][num]
            }
            return str
          },
        },
        legend: {
          top: 'top',
          right: '20px',
          data: (data => {
            const legend = []
            for (const key in data) {
              legend.push(this.$t('Dashboard.NodeGroupStatus.Chart.' + key.replace('_', '')))
            }
            return legend
          })(this.nodeStatus.status),
        },
        grid: {
          top: '20%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          name: '(%)',
          nameTextStyle: {
            padding: [25, 0, 0, 0],
          },
          show: true,
          type: 'value',
          splitLine: {
            show: false,
          },
          axisLabel: {
            fontFamily: 'Micsoft Yahei',
          },
          interval: 10,
          // axisLabel: {
          //     formatter: '{value}%'
          // },
          max: 100,
        },
        yAxis: (data => {
          const y = []
          for (const item in data) {
            y.push({
              type: 'category',
              axisLine: {
                show: false,
              },
              axisTick: {
                show: false,
              },
              axisLabel: {
                margin: 20,
                fontFamily: 'Micsoft Yahei',
              },
              data: data[item],
            })
          }
          return y
        })(this.nodeStatus.groups),
        series: (data => {
          const series = []
          for (const key in data) {
            series.push({
              name: this.$t(`Dashboard.NodeGroupStatus.Chart.${key}`),
              type: 'bar',
              stack: 'bar',
              label: {
                show: false,
                position: 'insideRight',
              },
              data: data[key],
            })
          }
          return series
        })(this.nodeStatus.status),
      }
      this.innerChart.setOption(option)
    },
    processChartYCountData(data) {
      // var arr = [0, 0, 0, 0, 0, 0];
      const arr = [0, 0, 0, 0]
      for (const key in data) {
        data[key].forEach((item, index) => {
          arr[index] += item
        })
      }
      return arr
    },
    processChartYLabelData(groups) {
      const data = groups.slice(0, 4).map(item => this.$t('Dashboard.NodeGroupStatus.Group.' + item))
      return data
    },
    processChartValueData(data, count) {
      const obj = {}
      for (const key in data) {
        const arr = []
        data[key].forEach((item, index) => {
          const num = count[index] === 0 ? 0 : (item / count[index]) * 100
          arr.push(num)
        })
        obj[key] = arr
      }
      return obj
    },
  },
}
</script>

<style></style>
