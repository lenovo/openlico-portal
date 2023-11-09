<template>
  <div ref="innerChart" style="width: 100%; height: 500px"></div>
</template>
<script>
import Format from '@/common/format'

export default {
  inject: ['resize'],
  props: ['dataReportAlertPie'],
  emits: ['clickPie'],
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
        this.onResize()
        this.draw()
      },
      deep: true,
    },
    resize(val) {
      this.onResize()
    },
  },
  mounted() {
    const chart = this.$chart.init(this.$refs.innerChart, window.gApp.echartsTheme.alert)
    this.$nextTick(function () {
      chart.on('click', para => {
        this.$emit('clickPie', para)
      })
      this.draw()
    })
  },
  methods: {
    onResize() {
      this.$chart.getInstanceByDom(this.$refs.innerChart).resize()
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
      this.$chart.getInstanceByDom(this.$refs.innerChart).setOption(option)
    },
  },
}
</script>
