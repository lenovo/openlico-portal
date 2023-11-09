<template>
  <div class="b-w p-20 m-10">
    <div ref="container" style="width: 100%; height: 100%; min-height: 400px" />
  </div>
</template>
<script>
import Format from '@/common/format'

export default {
  inject: ['resize'],
  props: ['data'],
  data() {
    return {
      innerChart: null,
      innerData: null,
    }
  },
  watch: {
    data(val, oldVal) {
      if (val) {
        this.$nextTick(_ => {
          this.initChart()
          this.onResize()
        })
      }
    },
    resize(val) {
      this.onResize()
    },
  },
  mounted() {
    this.$nextTick(function () {
      this.$chart.init(this.$refs.container, window.gApp.echartsTheme.jobQueueStatus)
      this.initChart()
    })
  },
  methods: {
    initChart() {
      const _this = this
      this.innerData = this.initData()
      const option = {
        title: {
          text: this.$t('Report.Cluster.Chart.Time.Distribution'),
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none',
          },
          formatter: function (p) {
            return (
              _this.$t('Report.Cluster.Chart.Time.Distribution.XTitle') +
              ': ' +
              p[0].axisValue +
              '<br>' +
              _this.$t('Report.Cluster.Chart.Time.Distribution.YTitle') +
              ': ' +
              p[0].data
            )
          },
        },
        grid: {
          top: '60px',
          left: '40px',
          right: '30px',
          bottom: '20px',
          containLabel: false,
        },
        xAxis: [
          {
            type: 'category',
            name: this.$t('Report.Cluster.Chart.Time.Distribution.XTitle'),
            nameRotate: -90,
            nameTextStyle: {
              padding: [0, 60, 0, 0],
            },
            data: this.innerData.x,
            axisTick: {
              show: false,
              alignWithLabel: false,
            },
            axisLabel: {
              interval: 0,
              // formatter: function (value, index) {
              //   if(value.indexOf('-')<0) {
              //     return value;
              //   }
              //   var val = value.split('-');
              //   return val[0] + '\n' + '-' + '\n' + val[1];
              // }
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: this.$t('Report.Cluster.Chart.Time.Distribution.YTitle'),
            nameTextStyle: {
              padding: [0, 0, 0, 20],
            },
          },
        ],
        series: [
          {
            type: 'bar',
            areaStyle: {},
            data: this.innerData.y,
          },
        ],
      }
      this.$chart.getInstanceByDom(this.$refs.container).setOption(option)
    },
    initData() {
      const step = 5
      const minGap = 1800 // 30 minutes
      let value = {}
      if (this.data) {
        value = Format.formatDistributionData(this.data.exec_time, step, minGap)
        value.x = value.x.map(item => {
          if (item.indexOf('-') < 0) {
            return Format.formatDurationTime(item * 1000)
          } else {
            const val = item.split('-')
            return val[0] / 3600 + '-' + val[1] / 3600
          }
        })
      }
      return value
    },
    onModeChange(val) {
      this.initChart()
    },
    onResize() {
      this.$chart.getInstanceByDom(this.$refs.container).resize()
    },
  },
}
</script>
<style></style>
