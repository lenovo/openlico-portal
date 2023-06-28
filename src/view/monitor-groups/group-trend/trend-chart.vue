<template>
  <div :id="tendencyCategory + 'TrendChart'" class="TrendChart" />
</template>
<script>
import * as ECharts from 'echarts'
import MonitorDataService from '../../../service/monitor-data'
import Format from '../../../common/format'
// import ElCol from "element-ui/packages/col/src/col";

export default {
  props: ['groupId', 'tendencyCategory', 'timeUnit', 'chartTitle'],
  // components: { ElCol },
  data() {
    return {
      dataFetcherMap: {
        hour: MonitorDataService.getNodeGroupDataByHour,
        day: MonitorDataService.getNodeGroupDataByDay,
        week: MonitorDataService.getNodeGroupDataByWeek,
        month: MonitorDataService.getNodeGroupDataByMonth,
      },
      trendChartObj: {},
      nextStartTime: 0,
      setTimeoutId: 0,
      timeoutValue: 15 * 1000,
      axisData: {
        xAxis: [],
        yAxis: [],
      },
      maxValueNum: 120,
      chartName: {},
      yAxis: {
        max: 5,
        min: 0,
      },
    }
  },
  watch: {
    groupId: function (curGroupId) {
      this.fetchChartData(curGroupId, this.timeUnit)
    },
    timeUnit: function (curTimeUnit) {
      this.fetchChartData(this.groupId, curTimeUnit)
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.chartName = {
        load: this.$t('Monitor.Load'),
        loadUnit: '',
        cpu: this.$t('Monitor.Cpu'),
        cpuUnit: this.$t('Monitor.Cpu.Unit'),
        ram: this.$t('Monitor.Ram'),
        ramUnit: this.$t('Monitor.Ram.Unit'),
        disk: this.$t('Monitor.Disk'),
        diskUnit: this.$t('Monitor.Disk.Unit'),
        ib: this.$t('Monitor.IB'),
        ibUnit: this.$t('Monitor.Net.Unit'),
        network: this.$t('Monitor.Eth'),
        networkUnit: this.$t('Monitor.Net.Unit'),
        energy: this.$t('Monitor.Ene'),
        energyUnit: this.$t('Monitor.Group.Ene.Unit'),
        temperature: this.$t('Monitor.Temp'),
        temperatureUnit: this.$t('Monitor.Temp.Unit'),
        job: this.$t('NodeGroup.Trend.Job'),
        jobUnit: '',
      }
      this.trendChartObj = ECharts.init(
        document.getElementById(this.tendencyCategory + 'TrendChart'),
        window.gApp.echartsTheme.common,
      )
      this.fetchChartData(this.groupId, this.timeUnit)
      window.removeEventListener('resize', this.onResize)
      window.addEventListener('resize', this.onResize)
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
    if (this.setTimeoutId > 0) clearTimeout(this.setTimeoutId)
  },
  methods: {
    fetchChartData(groupId, timeUnit, startTime) {
      if (this.setTimeoutId > 0) clearTimeout(this.setTimeoutId)
      if (!startTime) {
        this.axisData.xAxis = []
        this.axisData.yAxis = []
      }
      const category = this.tendencyCategory.toLowerCase()
      const latestNum = 1
      this.dataFetcherMap[timeUnit.toLowerCase()](groupId, category, latestNum, startTime).then(
        res => {
          const dataSet = res.data
          if (category === 'energy') {
            dataSet.forEach(ds => {
              const energy = ds.values[0]
              if (energy && energy !== '-') {
                ds.values[0] = Format.formatEnergy(energy, 1000)
              }
            })
          }
          // if(dataSet.length > 0){
          this.yAxis = this.initAxis(dataSet)
          this.drawTrendCharts(dataSet)
          this.refreshChartData(groupId, timeUnit)
          // }
        },
        res => {
          // Do nothing
        },
      )
    },
    refreshChartData(groupId, timeUnit) {
      this.setTimeoutId = setTimeout(() => {
        // _this.fetchChartData(groupId, timeUnit, _this.nextStartTime);
        this.fetchChartData(groupId, timeUnit)
      }, this.timeoutValue)
    },
    onResize() {
      this.trendChartObj.resize()
    },
    drawTrendCharts(dataSet) {
      const tendencyChart = this.trendChartObj
      this.getAxisData(dataSet)
      const series = this.getChartSeries()
      const options = this.getEChartOption(series)
      tendencyChart.setOption(options)
    },
    getAxisData(dataSet) {
      const yDataSet = []
      dataSet.forEach(ds => {
        // if(this.axisData.xAxis.length > this.maxValueNum)
        //   this.axisData.xAxis.shift();
        this.nextStartTime = ds.time
        this.axisData.xAxis.push(ds.time)
        yDataSet.push(ds.values)
      })
      this.getYAxisFromDataSet(yDataSet)
    },
    getYAxisFromDataSet(yDataSet) {
      const yAxis = []
      if (!yDataSet || yDataSet[0] === null) return yAxis
      const _this = this
      if (yDataSet && yDataSet[0]) {
        for (let i = 0; i < yDataSet[0].length; i++) {
          yDataSet.forEach(d => {
            if (_this.axisData.yAxis[i] === undefined) {
              _this.axisData.yAxis[i] = []
            }
            _this.axisData.yAxis[i].push(d[i])
          })
        }
      }
    },
    getChartSeries() {
      const _yAxis = this.axisData.yAxis.length
        ? this.axisData.yAxis
        : !['ib', 'network'].includes(this.tendencyCategory)
        ? [[]]
        : [[], []]
      const name = _yAxis.length === 1 ? this.chartName[this.tendencyCategory] : ''
      const series = _yAxis.map((i, x) => {
        return {
          name: name || this.$t(`Monitor.Net.${['In', 'Out'][x]}`),
          type: 'line',
          symbol: 'none',
          itemStyle: {
            lineStyle: {
              width: 1,
            },
          },
          data: i,
        }
      })
      return series
    },
    getEChartOption(seriesData) {
      const unit = this.chartName[this.tendencyCategory + 'Unit']
      const titleUnit = unit ? ` (${unit})` : ''
      const self = this
      const title = this.chartName[this.tendencyCategory] + titleUnit
      const options = {
        title: {
          text: title,
          fontSize: 14,
          fontWeight: 'normal',
          padding: [20, 10],
        },
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            const time = [Format.formatDateTime(new Date(params[0].name), 'hh:mm MM-dd')]
            const context = params.map(i => {
              const val = isNaN(i.value) ? '-' : i.value + unit
              return `${i.marker}${i.seriesName}: ${val}`
            })
            return [...time, ...context].join('<br/>')
          },
        },
        grid: {
          top: 50,
          left: 25,
          right: 25,
          bottom: 35,
        },
        legend: {
          data: [],
          right: 0,
        },
        toolbox: {
          show: false,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            formatter: val => {
              let fmt = 'MM-dd'
              if (['day', 'hour'].includes(self.timeUnit.toLowerCase())) {
                fmt = 'hh:mm'
              }

              const label = Format.formatDateTime(new Date(val), fmt)
              return label
            },
          },
          axisTick: {
            show: false,
          },
          data: this.axisData.xAxis,
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false,
          },
          axisLabel: {
            inside: true,
            margin: 0,
            verticalAlign: 'bottom',
            formatter: '{value}',
          },
          axisTick: {
            show: false,
          },
          min: this.yAxis.min,
          max: this.yAxis.max,
        },
        series: seriesData,
      }
      return options
    },
    initAxis(data) {
      let max = 1
      const min = 0
      let values = data.map(i => {
        if (i.values.length <= 1) {
          return i.values.concat(0)
        } else {
          return i.values
        }
      })
      if (values.length) values = values.reduce((a, b) => a.concat(b))
      values = values.map(i => (i === '-' ? 0 : i))
      if (['job'].includes(this.tendencyCategory)) max = 5
      if (['load'].includes(this.tendencyCategory)) max = 10
      if (['network', 'ib'].includes(this.tendencyCategory)) {
        max = 100
      }
      if (['cpu', 'disk', 'ram', 'temperature'].includes(this.tendencyCategory)) {
        max = 100
      }

      const maxV = Math.max(...values) < max ? max : null
      return { max: maxV, min }
    },
  },
}
</script>
<style>
.TrendChart {
  width: 100%;
  height: 275px;
  border: 1px solid #eee;
}
</style>
