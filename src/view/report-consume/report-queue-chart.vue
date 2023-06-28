<template>
  <div ref="container" style="width: 100%; height: 100%; min-height: 200px" />
</template>

<script>
import Format from './../../common/format'
import * as EChart from 'echarts'

export default {
  props: ['data'],
  data() {
    return {
      innerChart: null,
    }
  },
  watch: {
    data(val, oldVal) {
      if (val) {
        this.$nextTick(function () {
          this.initChart()
        })
      }
    },
  },
  mounted() {
    this.$nextTick(function () {
      this.innerChart = EChart.init(this.$refs.container, window.gApp.echartsTheme.common)
      window.removeEventListener('resize', this.onResize)
      window.addEventListener('resize', this.onResize)
      this.initChart()
      window.gApp.$watch('isCollapse', (newValue, oldValue) => {
        setTimeout(() => {
          this.onResize()
        }, 300)
      })
    })
  },
  methods: {
    initChart() {
      const _this = this
      const innerData = this.initData()

      const option = {
        title: {
          text: _this.$t('Consume.Queue.Chart.Title'),
        },
        tooltip: {
          trigger: 'item',
          // formatter: `{b}: ${unit}{c}({d}%)`
          formatter: function (v) {
            const val = Format.formatMoney(v.data.value)
            return `${v.data.name}: ${val}(${v.percent}%)`
          },
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          align: 'right',

          right: 30,
          top: 20,
          bottom: 20,
          itemGap: 20,
          data: innerData.legendData,
          selected: innerData.selected,
          formatter: function (name) {
            for (let i = 0; i < innerData.seriesData.length; i++) {
              if (innerData.seriesData[i].name === name) {
                const val = Format.formatMoney(innerData.seriesData[i].value)
                return `${name}   ${val}`
              }
            }
            return name
          },
        },
        series: [
          {
            type: 'pie',
            center: ['25%', '50%'],
            label: {
              show: false,
            },
            data: innerData.seriesData,
            emphasis: {
              scale: false,
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        ],
      }
      this.innerChart.setOption(option)
    },
    initData() {
      const data = this.data
      const legendData = []
      const seriesData = []
      const selected = {}
      const temp = {}
      for (let i = 0; i < data.length; i++) {
        // cpu gpu memory cost
        for (let y = 0; y < data[i].queueCost.length; y++) {
          let name = ''
          let value = 0
          for (const key in data[i].queueCost[y]) {
            if (key === 'queueName') {
              name = data[i].queueCost[y][key]
            } else {
              value += data[i].queueCost[y][key]
            }
          }
          if (!temp[name]) {
            temp[name] = value
          } else {
            temp[name] += value
          }
        }
      }
      for (const key in temp) {
        legendData.push(key)
        seriesData.push({
          name: key,
          value: temp[key].toFixed(2),
        })
        selected[key] = true
      }
      return {
        legendData,
        seriesData,
        selected,
      }
    },
    onResize() {
      this.innerChart.resize()
    },
  },
}
</script>

<style></style>
