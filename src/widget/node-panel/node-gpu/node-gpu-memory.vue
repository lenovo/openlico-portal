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
      unit: this.$t('Monitor.Ram.Unit'),
      memory: [],
    }
  },
  watch: {
    gpuData(val, oldVal) {
      this.processData(val)
    },
    resize(val) {
      this.onResize()
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.$chart.init(this.$refs.container, window.gApp.echartsTheme.common)
      this.processData(this.gpuData)
      this.setOption()
      this.onResize()
    })
  },
  methods: {
    onResize() {
      this.$chart.getInstanceByDom(this.$refs.container).resize()
    },
    processData(data) {
      const values = []
      if (data.length > 0) {
        data.forEach(t => {
          const time = t.time
          const value = t.values[0]
          values.push({ value: [time, value] })
        })
        this.memory = values
        this.setOption()
      }
    },
    setOption() {
      const self = this
      const option = {
        title: {
          text: `${this.$t('NodePanel.GPU.Memory')} (${this.unit})`,
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
        /*
          legend: {
            top: 'top',
            right: '20px',
            data: ['CPU', 'LOAD']
          },
          */
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
            name: this.$t('NodePanel.GPU.Memory'),
            type: 'line',
            showSymbol: false,
            data: self.memory,
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

<style lang="css"></style>
