<template>
  <a-row>
    <a-col :span="22" :offset="1">
      <div :id="healthCategory + 'HealthChart'" class="HealthChart" />
      <level-card class="health-chart_level-card" :ranges="levelRanges" :mode="healthCategory" />
      <div v-if="totalDataNum > 0" class="HealthChartPage">
        <a-pagination
          id="tid_health-chart-page"
          size="small"
          :current="currentPage"
          :page-size-options="['200', '400', '800', '1000']"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalDataNum"
          @show-size-change="handleSizeChange"
          @change="handleCurrentChange" />
      </div>
      <node-detail-dialog id="tid_node-detail-dialog" ref="detailDialog" />
    </a-col>
  </a-row>
</template>
<script>
import MonitorDataService from '@/service/monitor-data'
import NodeDetailDialog from '@/widget/nodes-table/node-detail-dialog.vue'
import LevelCard from '@/widget/level-card.vue'
export default {
  components: {
    'node-detail-dialog': NodeDetailDialog,
    'level-card': LevelCard,
  },
  inject: ['resize'],
  props: ['healthCategory', 'groupId'],
  data() {
    return {
      healthChartObj: {},
      xRatioInitValue: 3,
      yRatioInitValue: 2,
      currentPage: 1,
      totalDataNum: 0,
      pageSize: 200,
      setTimeoutId: 0,
      refreshIntervalValue: 30 * 1000,
      heatDataSet: [],
      levelRanges: {
        temperature: [0, 100],
        energy: [0, 2000],
        load: [0, 100],
        cpu: [0, 100],
        ram: [0, 100],
        disk: [0, 100],
        network: [0, 50000],
        job: [0, 100],
      },
      chartName: {
        load: this.$t('Monitor.Load'),
        loadUnit: '',
        cpu: this.$t('Monitor.Cpu'),
        cpuUnit: this.$t('Monitor.Cpu.Unit'),
        ram: this.$t('Monitor.Ram'),
        ramUnit: this.$t('Monitor.Ram.Unit'),
        disk: this.$t('Monitor.Disk'),
        diskUnit: this.$t('Monitor.Disk.Unit'),
        network: this.$t('Monitor.Net'),
        networkUnit: this.$t('Monitor.Net.Unit'),
        energy: this.$t('Monitor.Ene'),
        energyUnit: this.$t('Monitor.Ene.Unit'),
        temperature: this.$t('Monitor.Temp'),
        temperatureUnit: this.$t('Monitor.Temp.Unit'),
        job: this.$t('NodeGroup.Trend.Job'),
        jobUnit: '',
      },
    }
  },
  watch: {
    groupId: function (newGroupId) {
      if (this.healthChartObj) {
        this.healthChartObj.clear()
      }
      this.fetchHeatChartData(newGroupId, this.healthCategory)
    },
    healthCategory: function (newCategory) {
      if (this.healthChartObj) {
        this.healthChartObj.clear()
      }
      this.fetchHeatChartData(this.groupId, newCategory)
    },
    resize(val) {
      this.onResize()
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.healthChartObj = this.$chart.init(
        document.getElementById(this.healthCategory + 'HealthChart'),
        window.gApp.echartsTheme.common,
      )
      this.fetchHeatChartData(this.groupId, this.healthCategory)
      const self = this
      this.healthChartObj.on('click', function (params) {
        self.$refs.detailDialog.showDetail(params.data.hostname)
      })
    })
  },
  beforeUnmount() {
    if (this.setTimeoutId > 0) clearTimeout(this.setTimeoutId)
  },
  methods: {
    fetchHeatChartData(groupId, category) {
      if (this.setTimeoutId > 0) clearTimeout(this.setTimeoutId)
      MonitorDataService.getGroupHeatData(groupId, category).then(
        res => {
          this.heatDataSet = res.data
          this.totalDataNum = this.heatDataSet.length
          const currentHeatData = this.getInterceptDataByPage()
          this.drawHeatChart(currentHeatData)
          this.refreshHealthChartData()
        },
        res => {
          // Do nothing
        },
      )
    },
    refreshHealthChartData() {
      this.setTimeoutId = setTimeout(() => {
        this.fetchHeatChartData(this.groupId, this.healthCategory)
      }, this.refreshIntervalValue)
    },
    getInterceptDataByPage() {
      const startIndex = this.pageSize * (this.currentPage - 1)
      const endIndex = this.pageSize * this.currentPage
      const dataSet = this.heatDataSet.slice(startIndex, endIndex)
      return dataSet
    },
    onResize() {
      this.$chart.getInstanceByDom(document.getElementById(this.healthCategory + 'HealthChart')).resize()
    },
    drawHeatChart(dataSet) {
      const axisLen = this.autoAllocationAxisLength(dataSet)
      let options
      if (dataSet.length > 0) {
        const series = this.getSeriesData(dataSet, axisLen)
        options = this.getChartOption(series.seriesData, series.minValue, series.maxValue, axisLen)
      } else {
        options = this.getChartOption([], 0, 0, axisLen)
      }
      this.$chart.getInstanceByDom(document.getElementById(this.healthCategory + 'HealthChart')).setOption(options)
    },
    autoAllocationAxisLength(dataSet) {
      let xAxisLen = 0
      let yAxisLen = 0
      const ps = this.pageSize
      if (ps === 200) {
        xAxisLen = 20
        yAxisLen = 10
      } else if (ps === 400) {
        xAxisLen = 20
        yAxisLen = 20
      } else if (ps === 800) {
        xAxisLen = 40
        yAxisLen = 20
      } else {
        xAxisLen = 40
        yAxisLen = 25
      }
      return {
        xAxisLen,
        yAxisLen,
      }
    },
    getSeriesData(dataSet, axisLen) {
      const self = this
      const xAxisMaxLength = axisLen.xAxisLen
      const yAxisMaxLength = axisLen.yAxisLen
      const seriesData = []
      let xAxis = 0
      let yAxis = 0
      const tempArray = []
      dataSet.forEach((ds, index) => {
        let name = this.chartName[this.healthCategory]
        let value = ds.value[0] === '-' ? -99 : ds.value[0]
        xAxis = parseInt(index % xAxisMaxLength)
        yAxis = yAxisMaxLength - 1 - parseInt(index / xAxisMaxLength)
        if (self.healthCategory === 'network') {
          name = this.$t('Monitor.Net')
          if (ds.value.filter(i => i === '-').length < 4) {
            value = self.addNum(ds.value)
          }
        }
        tempArray.push(value)
        seriesData.push({
          name,
          value: [xAxis, yAxis, value],
          info: ds.value,
          id: ds.id,
          hostname: ds.hostname,
        })
      })

      if (xAxis > 0 && xAxis < xAxisMaxLength - 1) {
        for (let x = xAxis + 1; x < xAxisMaxLength; x++) {
          seriesData.push([x, yAxis, '-'])
        }
        yAxis--
      }
      for (let y = yAxis - 1; y >= 0; y--) {
        for (let x = 0; x < xAxisMaxLength; x++) {
          seriesData.push([x, y, '-'])
        }
      }
      let minValue = Math.min.apply(null, tempArray)
      let maxValue = Math.max.apply(null, tempArray)
      minValue = minValue < 0 ? 0 : minValue
      maxValue = maxValue < 0 ? 0 : maxValue
      return {
        seriesData,
        minValue,
        maxValue,
      }
    },
    getChartOption(seriesData, minValue, maxValue, axisLen) {
      const unit = this.chartName[this.healthCategory + 'Unit']
      const option = {
        tooltip: {
          position: 'top',
          formatter: param => {
            let ret = `${this.$t('Node.HostName')}: ${param.data.hostname}<br/>`
            const value = param.data.value
            if (this.healthCategory === 'network') {
              const info = param.data.info
              const inText = this.$t('Monitor.Net.In')
              const outText = this.$t('Monitor.Net.Out')
              for (let i = 0; i < info.length; i++) {
                // get network display current value  #vlaue + unit
                const val = value[2] < 0 || isNaN(info[i]) ? '-' : info[i] + unit
                // Edit the text displayed  #network type + (in|out) + val
                ret += this.$t(`Monitor.${i < 2 ? 'Eth' : 'IB'}`) + ` ${i % 2 ? outText : inText}: ${val}<br/>`
              }
            } else {
              const valA = value[2] < 0 ? '-' : value[2] + unit
              ret += `${param.name}: ${valA}`
            }

            return ret
          },
        },
        animation: false,
        grid: {
          bottom: 5,
          height: '85%',
          y: '10%',
        },
        xAxis: {
          type: 'category',
          data: (() => {
            const tmp = []
            for (let i = 1; i <= axisLen.xAxisLen; i++) {
              tmp.push('')
            }
            return tmp
          })(),
          splitLine: {
            show: true,
            lineStyle: {
              width: 1,
            },
          },
          axisTick: {
            show: false,
          },
          axisLine: {},
        },
        yAxis: {
          type: 'category',
          data: (() => {
            const tmp = []
            for (let i = 1; i <= axisLen.yAxisLen; i++) {
              tmp.push('')
            }
            return tmp
          })(),
          splitLine: {
            show: true,
            lineStyle: {
              width: 1,
            },
          },
          axisTick: {
            show: false,
          },
          offset: 1,
        },
        visualMap: {
          show: false,
          min: this.levelRanges[this.healthCategory][0],
          max: this.levelRanges[this.healthCategory][1],
        },
        series: [
          {
            type: 'heatmap',
            data: seriesData,
            label: {
              formatter: function (data) {
                if (data.data && data.data.value[2] < 0) {
                  return ''
                }
              },
              show: true,
              fontSize: 14,
            },
            emphasis: {
              scale: false,
            },
            itemStyle: {
              shadowBlur: 10,
            },
          },
        ],
      }
      return option
    },
    handleSizeChange(page, newSize) {
      if (this.healthChartObj) {
        this.healthChartObj.clear()
      }
      this.pageSize = newSize
      const currentHeatData = this.getInterceptDataByPage()
      this.drawHeatChart(currentHeatData)
    },
    handleCurrentChange(newPage) {
      this.currentPage = newPage
      const currentHeatData = this.getInterceptDataByPage()
      this.drawHeatChart(currentHeatData)
    },
    addNum(arr) {
      // Sum of data acquisition
      const val = arr
        .map(val => {
          return val === '-' ? 0 : val
        })
        .reduce((a, b) => a + b)

      return val % 1 ? val.toFixed(1) : val
    },
  },
}
</script>
<style scoped>
.HealthChart {
  width: 100%;
  height: 600px;
}
.HealthChartPage {
  float: right;
  margin-right: 10%;
}
.health-chart_level-card {
  margin-left: 50%;
  transform: translateX(-50%);
  margin-bottom: 3%;
}
</style>
