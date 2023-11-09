<template>
  <div>
    <div ref="innerChart" class="report-bar"></div>
  </div>
</template>
<script>
export default {
  inject: ['resize'],
  props: ['bar'],
  data() {
    return {
      barObject: {},
    }
  },
  watch: {
    bar(val) {
      this.draw()
    },
    resize(val) {
      this.onResize()
    },
  },
  mounted() {
    this.$chart.init(this.$refs.innerChart, window.gApp.echartsTheme.common)
    this.draw()
  },
  methods: {
    draw: function (data) {
      const chart = this.$chart.getInstanceByDom(this.$refs.innerChart)
      chart.resize()
      const $this = this
      const option = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          formatter: function (data) {
            if (data[0].seriesName === 'job') {
              data[0].seriesName = 'Job'
            }
            return `${data[0].name}<br>` + $this.$t(`Report.Label.Type.${data[0].seriesName}`) + `: ${data[0].value}`
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: this.bar.x,
            axisTick: {
              alignWithLabel: true,
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 80,
          },
          {
            start: 0,
            end: 80,
            handleSize: '80%',
            handleStyle: {
              shadowBlur: 3,
              shadowOffsetX: 2,
              shadowOffsetY: 2,
            },
          },
        ],
        series: [
          {
            name: 'job',
            type: 'bar',
            barWidth: '60%',
            data: this.bar.y,
          },
        ],
      }
      chart.setOption(option)
    },
    onResize() {
      this.$chart.getInstanceByDom(this.$refs.innerChart).resize()
    },
  },
}
</script>
<style>
.report-bar {
  width: 100%;
  height: 400px;
}
</style>
