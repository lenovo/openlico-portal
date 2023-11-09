<template lang="">
  <div ref="container" class="node-monitor-chart-style" />
</template>
<script>
import Format from '@/common/format'
export default {
  inject: ['resize'],
  props: ['gpuData'],
  data() {
    return {
      innerChart: null,
      unit: this.$t('Monitor.Util.Unit'),
      gpu: [],
    }
  },
  watch: {
    gpuData(val, oldVal) {
      this.processData(this.gpuData)
    },
    resize(val) {
      this.onResize()
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.$chart.init(this.$refs.container, window.gApp.echartsTheme.common)
      this.processData(this.gpuData)
      this.onResize()
      this.setOption()
    })
  },
  methods: {
    onResize() {
      this.$nextTick(() => {
        this.$chart.getInstanceByDom(this.$refs.container).resize()
      })
    },
    processData(data) {
      const values = []
      if (data.length > 0) {
        data.forEach(t => {
          const time = t.time
          const value = t.values[0]
          values.push({ value: [time, value] })
        })
        this.gpu = values
        this.setOption()
      }
    },
    setOption() {
      const option = {
        title: {
          text: `${this.$t('Monitor.Util')} (${this.unit})`,
          fontSize: 14,
          padding: [10, 5],
        },
        grid: {
          top: 40,
          bottom: 30,
          left: 40,
          right: 30,
        },
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            const o = params[0]
            const time = o.value[0]
            return `${Format.formatDateTime(time, 'hh:mm MM-dd')}<br>
                        ${o.marker}${o.seriesName} : ${o.value[1]}${this.unit}
                        `
          },
        },
        xAxis: {
          type: 'time',
          splitLine: {
            show: false,
          },
          axisLabel: {
            formatter: function (value) {
              return Format.formatDateTime(new Date(value), 'hh:mm')
            },
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          name: '',
          type: 'value',
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          min: 0,
          max: 100,
        },
        series: [
          {
            name: this.$t('Monitor.Util'),
            type: 'line',
            showSymbol: false,
            data: this.gpu,
            itemStyle: {
              areaStyle: {
                type: 'default',
              },
            },
          },
        ],
      }
      this.$chart.getInstanceByDom(this.$refs.container).setOption(option)
    },
  },
}
</script>

<style lang="css">
.node-monitor-chart-style {
  width: 100%;
  height: 100%;
}
</style>
