<template>
  <div><div id="report-line" ref="innerChart" class="report-line" /></div>
</template>
<script>
export default {
  inject: ['resize'],
  props: ['line'],
  data() {
    return {
      lineObject: {},
    }
  },
  watch: {
    line: {
      handler: function () {
        this.$nextTick(() => {
          this.draw(this.line)
        })
      },
      deep: true,
    },
    resize(val) {
      this.onResize()
    },
  },
  mounted() {
    this.draw(this.line)
  },
  methods: {
    draw: function (data) {
      let chart = this.$chart.getInstanceByDom(this.$refs.innerChart)
      if (!chart) {
        chart = this.$chart.init(this.$refs.innerChart, window.gApp.echartsTheme.common)
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
      chart.clear()
      chart.setOption(option)
      this.onResize()
    },
    onResize() {
      this.$chart.getInstanceByDom(this.$refs.innerChart).resize()
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
