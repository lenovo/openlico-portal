<template>
  <div class="colony-info">
    <div ref="colonyChart" style="width: 100%; height: 100%" />
  </div>
</template>

<script>
import * as ECharts from 'echarts'
export default {
  props: ['data'],
  data() {
    return {
      indexRunning: '',
      innerChart: null,
    }
  },
  watch: {
    data: {
      deep: true,
      immediate: true,
      handler(newV, oldV) {
        this.getChartOption()
      },
    },
  },
  mounted() {
    this.innerChart = ECharts.init(this.$refs.colonyChart)
  },
  methods: {
    getChartOption() {
      this.$nextTick(() => {
        this.mouseout_action(this.innerChart)
        const dom = this.$refs.colonyChart
        if (!dom && dom === null) return false
        const colorList = this.data.color
        const option = {
          series: [
            {
              type: 'pie',
              center: ['50%', '40%'],
              radius: ['50%', '60%'],
              label: {
                show: false,
                position: 'center',
                formatter: data => {
                  return (
                    '{count|' +
                    data.value +
                    '}' +
                    '\n' +
                    '{desc|' +
                    this.$t('NodeStatus.' + data.name) +
                    '}' +
                    '\n' +
                    '{proportion|' +
                    data.percent.toFixed(0) +
                    '%' +
                    '}'
                  )
                },
                rich: {
                  count: {
                    color: '#fff',
                    fontSize: 14,
                    fontFamily: 'Arial',
                    verticalAlign: 'middle',
                  },
                  desc: {
                    color: '#fff',
                    fontSize: 14,
                    padding: [8, 0, 8, 0],
                    fontFamily: 'Arial',
                    verticalAlign: 'middle',
                  },
                  proportion: {
                    fontSize: 14,
                    color: '#fff',
                    fontFamily: 'Arial',
                    verticalAlign: 'middle',
                  },
                },
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '10',
                },
              },
              itemStyle: {
                color: function (params) {
                  return colorList[params.dataIndex]
                },
              },
              data: this.data.colonyArr,
            },
          ],
        }
        this.innerChart.setOption(option, true)
        Object.getOwnPropertyNames(this.data).forEach((item, index) => {
          if (item === 'colonyArr') {
            this.data[item].forEach((item2, index2) => {
              if (item2.name === 'Running') {
                this.indexRunning = index2
              }
            })
          }
        })
        this.innerChart.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: this.indexRunning,
        })
        this.innerChart.on('mouseover', e => {
          if (e.dataIndex !== this.indexRunning) {
            this.mouseover_action(this.innerChart, this.indexRunning)
          }
        })
        this.innerChart.on('mouseout', e => {
          this.mouseout_action(this.innerChart)
        })
        window.addEventListener('resize', () => {
          this.innerChart.resize()
        })
      })
    },
    mouseover_action(who, index) {
      who.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
        dataIndex: index,
      })
    },
    mouseout_action(who) {
      for (let i = 0; i < 3; i++) {
        who.dispatchAction({
          type: 'downplay',
          seriesIndex: 0,
          dataIndex: i,
        })
      }
      who.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: this.indexRunning,
      })
    },
  },
}
</script>
<style lang="less" scoped>
.colony-info {
  height: 220px;
}
</style>
