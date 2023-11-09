<template>
  <div ref="container" style="width: 100%; height: 100%; min-height: 440px" />
</template>

<script>
import Format from '@/common/format'

export default {
  inject: ['resize'],
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
    resize(val) {
      this.onResize()
    },
  },
  mounted() {
    this.$nextTick(function () {
      this.$chart.init(this.$refs.container, window.gApp.echartsTheme.common)
      this.initChart()
    })
  },
  methods: {
    initChart() {
      const data = this.initData()
      const unit = this.$store.getters['settings/getCurrency']

      const option = {
        title: {
          text: this.$t('Consume.Ranking.Chart.Title'),
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          // formatter: `{b}: ${unit}{c}`
          formatter: function (p) {
            const val = Format.formatMoney(p[0].data)
            return `${p[0].axisValue}: ${val}`
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            show: true,
            name: `(${unit})`,
            nameGap: 5,
            position: 'top',
            axisLine: {
              show: false,
            },
            // onZeroAxisIndex: 1,
            type: 'value',
          },
        ],
        yAxis: [
          {
            // inverse: true,
            // name: 'Users',
            // position: 'buttom',
            type: 'category',
            data: data.legendData.reverse(),
            axisTick: {
              alignWithLabel: true,
            },
          },
        ],
        series: [
          {
            type: 'bar',
            // barWidth: "60%",
            data: data.seriesData.reverse(),
          },
        ],
      }
      this.$chart.getInstanceByDom(this.$refs.container).setOption(option)
    },
    initData() {
      const data = this.data
      const legendData = []
      const seriesData = []
      for (let i = 0; i < data.length; i++) {
        legendData.push(data[i][0])
        seriesData.push(data[i][1])
      }
      return {
        legendData,
        seriesData,
      }
    },
    onResize() {
      this.$chart.getInstanceByDom(this.$refs.container).resize()
    },
  },
}
</script>

<style></style>
