<template>
  <div>
    <div ref="innerChart" class="report-essemble" />
  </div>
</template>
<script>
export default {
  inject: ['resize'],
  props: ['essemble'],
  data() {
    return {
      essembleObject: {},
    }
  },
  watch: {
    essemble(val) {
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
    onResize() {
      this.$chart.getInstanceByDom(this.$refs.innerChart).resize()
    },
    draw: function (data) {
      const unit = this.essemble.type && this.essemble.type !== 'job' ? this.essemble.type : 'CPU'
      const option = {
        animation: false,
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          containLabel: true,
        },
        legend: {
          data: [this.essemble.type, this.$t(`Report.Chart.Time.${unit}`)],
        },
        xAxis: [
          {
            type: 'category',
            data: this.essemble.time,
            axisPointer: {
              type: 'shadow',
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: this.essemble.type,
          },
          {
            type: 'value',
            name: this.$t(`Report.Chart.Time.${unit}`),
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
            name: this.essemble.type,
            type: 'bar',
            data: this.essemble[this.essemble.type + 'Count'],
          },
          {
            name: this.$t(`Report.Chart.Time.${unit}`),
            type: 'line',
            yAxisIndex: 1,
            data: this.essemble[this.essemble.type + 'Time'],
          },
        ],
        tooltip: {
          trigger: 'axis',
          formatter: function (params, ticket, callback) {
            if (params && params.length === 2) {
              let str = params[0].name + '<br>'
              str += params[0].seriesName + ': ' + params[0].data + '<br>'
              str += params[1].seriesName + ': ' + parseFloat(params[1].data).toFixed(2) + '<br>'
              return str
            }
            return ''
          },
        },
      }
      this.$chart.getInstanceByDom(this.$refs.innerChart).setOption(option)
    },
  },
}
</script>
<style>
.report-essemble {
  width: 100%;
  height: 400px;
}
</style>
