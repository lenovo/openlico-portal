<template>
  <div>
    <div ref="innerChart" class="report-pie" />
  </div>
</template>
<script>
import Format from './../../common/format'
import * as EChart from 'echarts'
export default {
  components: {},
  props: ['pie'],
  data() {
    return {
      pieObject: {},
    }
  },
  watch: {
    pie: {
      handler: function () {
        this.$nextTick(() => {
          this.draw(this.pie)
        })
      },
      deep: true,
    },
  },
  mounted() {
    const $this = this
    this.$nextTick(function () {
      if (this.pieObject && this.pieObject.on) {
        this.pieObject.on('click', function (para) {
          $this.$emit('clickPie', para)
        })
      }
    })
  },
  methods: {
    draw: function (data) {
      if (Object.keys(this.pieObject).length === 0) {
        this.pieObject = EChart.init(this.$refs.innerChart, window.gApp.echartsTheme.common)
      }
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
      this.pieObject.setOption(option)
      window.removeEventListener('resize', () => {
        this.pieObject.resize()
      })
      window.addEventListener('resize', () => {
        this.pieObject.resize()
      })
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
