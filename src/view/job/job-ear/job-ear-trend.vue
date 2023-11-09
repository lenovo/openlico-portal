<template>
  <div class="energy-report-trend">
    <a-row>
      <a-col :span="12">
        <span class="energy-report-trend-title">{{ $t('Ear.Energy.Trend') }}</span>
      </a-col>
      <a-col :span="12" style="position: relative">
        <a-select v-model:value="step" style="width: 120px; position: absolute; right: 0" @change="handleChange">
          <a-select-option v-for="(item, index) in data.stepList" :key="index">
            {{ item }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row class="energy-report-trend-chart" style="border: 1px solid #e8e8e8; margin-top: 15px">
      <div ref="container" style="width: 100%; height: 100%" />
    </a-row>
  </div>
</template>
<script>
export default {
  inject: ['resize'],
  props: ['data'],
  data() {
    return {
      step: this.data.stepList[0],
      innerChart: null,
      loading: false,
    }
  },
  watch: {
    resize(val) {
      this.onResize()
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.$chart.init(this.$refs.container, window.gApp.echartsTheme.jobQueueStatus)

      this.onResize()
      if (this.data) {
        this.initChart()
      }
    })
  },
  methods: {
    handleChange(val) {
      this.initChart(val)
    },
    onResize() {
      this.innerChart.resize()
    },
    getChartOption(data) {
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: p => {
            let text = p[0].name
            p.forEach(i => {
              text += `<br />${i.marker} ${i.seriesName}: ${i.value}${i.data.unit}`
            })
            return text
          },
        },
        grid: {
          top: 50,
          left: '3%',
          right: 20,
          bottom: 10,
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: data.xAxis,
            axisPointer: {
              type: 'shadow',
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            // name: this.$t("Ear.Energy.Energy"),
            axisLine: {
              show: true,
            },
            axisTick: {
              show: true,
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              formatter: '{value} GHz',
            },
          },
          {
            type: 'value',
            // name: this.$t("Ear.Energy.Power"),
            // show: false,
            axisLine: {
              show: true,
            },
            axisTick: {
              show: true,
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              formatter: '{value} W',
            },
          },
        ],
        series: [
          {
            name: this.$t('Ear.Energy.AverageFreq'),
            type: 'line',
            data: data.freq,
          },
          {
            name: this.$t('Ear.Energy.AveragePower'),
            type: 'bar',
            yAxisIndex: 1,
            data: data.power,
            barWidth: '60%',
          },
        ],
      }
      return option
    },
    initChart(index = 0) {
      const key = this.data.stepList[index]
      const data = {
        xAxis: this.data.stepMap[key].label,
        freq: this.data.stepMap[key].freq.map(i => ({
          value: i % 1 ? i.toFixed(2) : i,
          unit: this.$t('Unit.GHz'),
        })),
        power: this.data.stepMap[key].power.map(i => ({
          value: i % 1 ? i.toFixed(1) : i,
          unit: this.$t('Unit.W'),
        })),
      }

      const option = this.getChartOption(data)
      this.$chart.getInstanceByDom(this.$refs.container).setOption(option)
    },
  },
}
</script>
<style scoped>
.energy-report-trend-chart {
  height: 400px;
}
</style>
