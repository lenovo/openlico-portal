<template>
  <div><div id="report-line" ref="innerChart" class="report-line" /></div>
</template>
<script>
import * as EChart from 'echarts'
export default {
  components: {},
  props: ['line'],
  data() {
    return {
      lineObject: {},
    }
  },
  watch: {
    line: {
      handler: function () {
        this.draw(this.line)
      },
      deep: true,
    },
  },
  methods: {
    draw: function (data) {
      if (Object.keys(this.lineObject).length === 0) {
        this.lineObject = EChart.init(this.$refs.innerChart, window.gApp.echartsTheme.common)
      }
      const format = this.line.format
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function (para) {
            let str = para[0].axisValueLabel + '<br>'
            para.forEach(function (i) {
              const seriesValue = i.value.slice(1, 2)
              str = str + i.seriesName + ' : ' + seriesValue + format + '<br>'
            })
            return str
          },
        },
        legend: {
          data: data.legend,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: data.time,
        },
        yAxis: {
          type: 'value',
        },
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
              color: '#fff',
              shadowBlur: 3,
              shadowColor: 'rgba(0, 0, 0, 0.6)',
              shadowOffsetX: 2,
              shadowOffsetY: 2,
            },
          },
        ],
        series: data.series,
        // series: {
        //     name: data.series.name,
        //     type:'line'
        //   }
      }
      this.lineObject.clear()
      this.lineObject.setOption(option)
      window.removeEventListener('resize', () => {
        this.lineObject.resize()
      })
      window.addEventListener('resize', () => {
        this.lineObject.resize()
      })
    },
  },
}
</script>
<style>
.report-line {
  width: 100%;
  height: 400px;
}
</style>
