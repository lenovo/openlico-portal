<template>
  <div class="b-w p-20 m-10">
    <div class="report-resource-select">
      <a-select v-model:value="resource" @change="onModeChange">
        <a-select-option v-for="option in resourceOption" :key="option.id" :value="option.code">
          {{ option.display_name }}
        </a-select-option>
      </a-select>
    </div>
    <div ref="container" style="width: 100%; height: 100%; min-height: 400px" />
  </div>
</template>
<script>
import Format from '@/common/format'
import Collection from '@/common/collection'

export default {
  inject: ['resize'],
  props: ['data'],
  data() {
    return {
      innerChart: null,
      resourceOption: [
        {
          code: 'cpu_cores',
          id: 0,
          display_name: 'CPU Cores',
          unit: 'cores',
        },
      ],
      resource: 'cpu_cores',
      innerData: null,
      xTitle: '',
    }
  },
  watch: {
    data(val, oldVal) {
      if (val) {
        this.$nextTick(function () {
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
      const options = this.resourceOption.concat(this.$store.getters['settings/getGResource'])
      Collection.sortObjectsByProp(options, 'id', '')
      this.xTitle = `${options[0].display_name}(${options[0].unit})`
      this.resourceOption = options
      this.initChart()
    })
  },
  methods: {
    initChart() {
      const _this = this
      this.innerData = this.initData()
      const option = {
        title: {
          text: this.$t('Report.Cluster.Chart.ResourceMap'),
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none',
          },
          formatter: function (p) {
            return (
              _this.xTitle +
              ': ' +
              p[0].axisValue +
              '<br>' +
              _this.$t('Report.Cluster.Chart.ResourceMap.YTitle') +
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
            name: this.xTitle,
            nameRotate: -90,
            nameTextStyle: {
              padding: [0, 60, 0, 0],
            },
            type: 'category',
            data: this.innerData[this.resource].x,
            axisTick: {
              show: false,
              alignWithLabel: false,
            },
            axisLabel: {
              interval: 0,
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: this.$t('Report.Cluster.Chart.ResourceMap.YTitle'),
            nameTextStyle: {
              padding: [0, 0, 0, 20],
            },
          },
        ],
        series: [
          {
            type: 'bar',
            areaStyle: {},
            data: this.innerData[this.resource].y,
          },
        ],
      }
      this.$chart.getInstanceByDom(this.$refs.container).setOption(option)
    },
    initData() {
      const step = 5
      const minGap = 1
      const value = {}
      for (const key in this.data) {
        if (key !== 'exec_time') {
          value[key] = Format.formatDistributionData(this.data[key], step, minGap, val => {
            return val > 0
          })
        }
      }
      return value
    },
    onModeChange(val) {
      const reslut = this.resourceOption.filter(item => item.code === val)[0]
      this.xTitle = `${reslut.display_name}(${reslut.unit})`
      this.initChart(this.xTitle)
    },
    onResize() {
      this.$chart.getInstanceByDom(this.$refs.container).resize()
    },
  },
}
</script>
<style>
.report-resource-select {
  position: absolute;
  top: 30px;
  right: 30px;
}
.report-resource-select .ant-select {
  z-index: 10;
  width: 150px;
}
</style>
