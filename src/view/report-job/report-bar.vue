<template>
  <div>
    <div ref="innerChart" class="report-bar" />
  </div>
</template>
<script>
import * as EChart from 'echarts'
export default {
  components: {},
  props: ['bar'],
  data() {
    return {
      barObject: {},
    }
  },
  watch: {
    bar: {
      handler: function () {
        this.$nextTick(() => {
          this.barObject.resize()
          this.draw(this.bar)
        })
      },
      deep: true,
    },
  },
  mounted() {
    this.barObject = EChart.init(this.$refs.innerChart, window.gApp.echartsTheme.common)
    window.removeEventListener('resize', this.barObject.resize)
    window.addEventListener('resize', this.barObject.resize)
  },
  methods: {
    draw: function (data) {
      this.barObject.resize()
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
      this.barObject.setOption(option)
    },
    onResize() {
      this.barObject.resize()
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
