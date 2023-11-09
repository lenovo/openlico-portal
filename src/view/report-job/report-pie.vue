<template>
  <div>
    <div ref="innerChart" class="report-pie"></div>
  </div>
</template>
<script>
import Format from '@/common/format'
export default {
  inject: ['resize'],
  props: ['pie'],
  emits: ['clickPie'],
  data() {
    return {
      pieObject: {},
    }
  },
  watch: {
    resize(val) {
      this.onResize()
    },
  },
  mounted() {
    const $this = this
    const chart = this.$chart.init(this.$refs.innerChart, window.gApp.echartsTheme.common)
    this.$nextTick(function () {
      if (chart && chart.on) {
        chart.on('click', function (para) {
          $this.$emit('clickPie', para)
        })
      }
      this.draw()
    })
  },
  beforeUnmount() {
    this.$chart.getInstanceByDom(this.$refs.innerChart).clear()
  },
  methods: {
    draw: function (data) {
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function (data) {
            return `${data.name}: ${data.data.value}<br>
                        ${Format.formatNumber(data.percent, 1)}%`
          },
        },
        legend: {
          x: 'center',
          y: 'bottom',
        },
        series: [
          {
            name: 'user',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            selectedMode: 'single',
            label: {
              formatter: '{c}',
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '30',
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: false,
            },
            data: this.pie.data,
          },
        ],
      }
      this.$chart.getInstanceByDom(this.$refs.innerChart).setOption(option)
      // window.removeEventListener('resize', () => {
      //   this.pieObject.resize()
      // })
      // window.addEventListener('resize', () => {
      //   this.pieObject.resize()
      // })
    },
    onResize() {
      this.$chart.getInstanceByDom(this.$refs.innerChart).resize()
    },
  },
}
</script>
<style>
.report-pie {
  width: 100%;
  height: 500px;
}
</style>
