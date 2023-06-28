<template>
  <div ref="container" style="width: 100%; height: 100%; min-height: 400px" />
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
      const data = this.initData()
      const option = {
        title: {
          text: this.$t('Consume.Trend.Chart.Title'),
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          // formatter: `{b}<br>{a}: ${unit}{c}`
          formatter: function (p) {
            return `${p[0].axisValue}: ${Format.formatMoney(p[0].data)}`
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: data.dates,
            axisTick: {
              alignWithLabel: true,
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            // name: `(${unit})`
          },
        ],
        dataZoom: [
          {
            show: true,
            filterMode: 'empty',
          },
        ],

        series: (function (params) {
          return [
            {
              type: 'bar',
              stack: 'cost',
              barMinHeight: '1',
              // barWidth: "60%",
              data: params,
            },
          ]
        })(data.seriesData),
      }
      this.innerChart.setOption(option)
    },

    initData() {
      const data = this.data
      const legendData = []
      const seriesData = []
      const dates = []
      for (let i = 0; i < data.length; i++) {
        let value = 0
        dates.push(data[i].date)
        // cpu gpu memory cost
        for (let y = 0; y < data[i].queueCost.length; y++) {
          for (const key in data[i].queueCost[y]) {
            if (key !== 'queueName') {
              value += data[i].queueCost[y][key]
            }
          }
        }

        // storage cost total
        for (let y = 0; y < data[i].storageCost.length; y++) {
          value += data[i].storageCost[y].cost
        }

        seriesData.push(value)
      }
      return {
        legendData,
        seriesData,
        dates,
      }
    },
    onResize() {
      this.innerChart.resize()
    },
  },
}
</script>

<style></style>
