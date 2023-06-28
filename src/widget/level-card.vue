<template>
  <div v-show="mode != 'common'" ref="levelcard" class="level-card" />
</template>
<script type="text/javascript">
import * as EChart from 'echarts'
export default {
  props: ['ranges', 'mode'],
  data() {
    return {
      chartObj: {},
      min_value: ['0'],
      max_real: 100,
      levels: [],
      series_data: [],
      min_max: [],
      unit: {
        cpu: ' %',
        load: '',
        ram: ' %',
        disk: ' %',
        temperature: ' ℃',
        energy: ' W',
        network: ' MB/s',
        job: '',
      },
    }
  },
  computed: {
    max_value() {
      if (this.mode === 'temperature') {
        return ['100℃+']
      } else if (this.mode === 'energy') {
        return ['2000W+']
      } else if (this.mode === 'load' || this.mode === 'job') {
        return ['100+']
      } else if (this.mode === 'cpu' || this.mode === 'disk' || this.mode === 'ram') {
        return ['100%']
      } else if (this.mode === 'network') {
        return ['50GB/s+']
      } else {
        return ['']
      }
    },
  },
  watch: {
    mode(newVal) {
      this.drawLevelCard(newVal)
    },
  },
  mounted() {
    Object.defineProperty(this.$refs.levelcard, 'clientWidth', {
      get: function () {
        return 300
      },
    })
    Object.defineProperty(this.$refs.levelcard, 'clientHeight', {
      get: function () {
        return 50
      },
    })
    this.chartObj = EChart.init(this.$refs.levelcard, window.gApp.echartsTheme.common)

    const levelColor = this.chartObj._theme.visualMap.inRange.color
    for (let i = 0; i < levelColor.length; i++) {
      this.series_data.push([i, 0, i + 1])
      this.levels.push(String(i + 1))
    }
    this.drawLevelCard(this.mode)
    this.$emit('get-chart-color', levelColor)
  },
  methods: {
    drawLevelCard(mode) {
      if (mode === 'common') {
        return
      }
      const min = Number(this.ranges[mode][0])
      const max = Number(this.ranges[mode][1])
      const unit = this.unit[mode]
      const options = this.getChartOption(min, max, unit, mode)
      this.chartObj.setOption(options)
    },
    getChartOption(min, max, unit, mode) {
      const option = {
        tooltip: {
          position: 'top',
          formatter: function (value) {
            const index = Number(value.dataIndex)
            const a = min + ((max - min) / 10) * index
            const b = min + ((max - min) / 10) * (index + 1)
            let result = ''
            if (mode === 'network') {
              if (index === 9) {
                result = '≥' + `${a / 1000}${'GB/s'}`
              } else {
                result = `${a / 1000}${'GB/s'} - ${b / 1000}${'GB/s'}`
              }
            } else {
              if (index === 9) {
                if (mode === 'temperature' || mode === 'energy' || mode === 'load' || mode === 'job') {
                  result = '≥' + `${a}${unit}`
                } else {
                  result = `${a}${unit} - ${b}${unit}`
                }
              } else {
                result = `${a}${unit} - ${b}${unit}`
              }
            }
            return result
          },
        },
        animation: false,
        grid: {
          height: '42%',
          left: '4%',
          right: '20%',
          y: '55%',
        },
        xAxis: {
          type: 'category',
          data: this.levels,
          splitArea: {
            show: true,
          },
          show: false,
        },
        yAxis: [
          {
            type: 'category',
            data: this.min_value,
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
              margin: 5,
              fontFamily: 'Micsoft Yahei',
            },
          },
          {
            type: 'category',
            data: this.max_value,
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
              margin: 5,
              fontFamily: 'Micsoft Yahei',
            },
          },
        ],
        visualMap: {
          min: 0,
          max: 10,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          show: false,
          bottom: '15%',
        },
        series: [
          {
            name: 'Color Card',
            type: 'heatmap',
            data: this.series_data,
            label: {
              show: false,
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }
      return option
    },
  },
}
</script>
<style>
.level-card {
  width: 300px;
  height: 50px;
  left: 20px;
  bottom: 7px;
}
</style>
