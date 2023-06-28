<template>
  <div ref="innerChart" style="width: 100%; height: 500px" />
</template>
<script>
import Format from './../../common/format'
import * as EChart from 'echarts'

export default {
  components: {},
  props: ['dataReportAlertPie'],
  data() {
    return {
      pieObject: {},
      p: this.dataReportAlertPie,
    }
  },
  watch: {
    dataReportAlertPie: {
      handler: function (val, oldVal) {
        this.p = val
        this.pieObject.resize()
        this.draw()
      },
      deep: true,
    },
  },
  mounted() {
    const self = this
    this.$nextTick(function () {
      this.pieObject = EChart.init(this.$refs.innerChart, window.gApp.echartsTheme.alert)
      this.pieObject.on('click', function (para) {
        self.$emit('clickPie', para)
      })
      this.draw()
      window.addEventListener('resize', this.onResize)
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    onResize() {
      this.pieObject.resize()
    },
    draw: function () {
      const self = this
      const option = {
        tooltip: {
          formatter: function (data) {
            return (
              self.$t(`Alert.PolicyLevel.${data.name}`) +
              `: ${data.data.value}<br>
                  ${Format.formatNumber(data.percent, 1)}% `
            )
          },
        },
        legend: {
          top: 'bottom',
          x: 'center',
          formatter: function (name) {
            return self.$t(`Alert.PolicyLevel.${name}`)
          },
          data: this.dataReportAlertPie.legend,
        },
        series: [
          {
            type: 'pie',
            radius: ['50%', '65%'],
            avoidLabelOverlap: false,
            selectedMode: 'single',
            label: {
              show: false,
              position: 'center',
              formatter: '{c}',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '30',
                fontWeight: 'bold',
              },
            },
            data: this.dataReportAlertPie.data,
          },
        ],
      }
      this.pieObject.setOption(option)
    },
  },
}
</script>
