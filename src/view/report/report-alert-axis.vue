<template>
  <div ref="reportAlertAxis" style="width: 100%; height: 500px" />
</template>
<script>
import * as EChart from 'echarts'
export default {
  props: ['dataReportAlertAxis'],
  data() {
    return {
      barObject: null,
      p: this.dataReportAlertAxis,
    }
  },
  watch: {
    dataReportAlertAxis: {
      handler(val, oldVal) {
        this.p = val
        this.barObject.resize()
        this.draw()
      },
      deep: true,
    },
  },
  mounted() {
    const self = this
    self.barObject = EChart.init(self.$refs.reportAlertAxis, window.gApp.echartsTheme.alert)
    this.draw()
    window.addEventListener('resize', this.onResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    onResize() {
      this.barObject.resize()
    },
    draw: function () {
      const self = this
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          formatter: function (data) {
            let result = `${data[0].name}<br>`
            data.forEach(item => {
              result += self.$t(`Alert.PolicyLevel.${item.seriesName}`) + `: ${item.value}<br>`
            })
            return result
          },
        },
        barWidth: '25%',
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: this.dataReportAlertAxis.alertTime,
            axisLabel: {
              interval: 0,
              rotate: 60,
            },
            axisPointer: {
              type: 'shadow',
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            minInterval: 1,
          },
        ],
        series: (function () {
          const serise = []
          for (const key in self.dataReportAlertAxis) {
            if (key !== 'alertTime') {
              serise.push({
                name: key,
                type: 'bar',
                stack: 'error',
                data: self.dataReportAlertAxis[key],
              })
            }
          }
          return serise
        })(),
      }
      this.barObject.setOption(option)
    },
  },
}
</script>
