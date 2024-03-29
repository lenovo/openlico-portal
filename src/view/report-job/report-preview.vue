<template>
  <a-spin :spinning="loading">
    <div style="width: 100%; min-height: 200px" class="b-w">
      <div v-if="!loading && !rawData.length" class="nodata">
        <div style="margin-top: 160px">
          <img src="/static/img/system/main/nodata.png" style="height: 60px; width: 80px" />
        </div>
        <div style="margin-top: 20px; color: #ccc; font-size: 16px">
          {{ $t('No.Data') }}
        </div>
      </div>
      <a-row v-if="!loading && rawData.length" class="reportPreview p-20 b-w">
        <a-col :span="8">
          <report-pie v-if="preview.twoColumns" :pie="data_pie" @click-pie="filter" />
        </a-col>
        <a-col :span="preview.twoColumns ? 16 : 24">
          <a-tabs v-model:activeKey="activeName" :animated="false" @change="changeTab">
            <a-tab-pane key="chart" :tab="$t('Report.Tab.Chart')">
              <a-radio-group v-model:value="chartType" button-style="solid" @change="handleClick">
                <a-radio-button value="job">
                  {{ $t('Monitor.Job') }}
                </a-radio-button>
                <a-radio-button value="CPU">
                  {{ 'CPU' }}
                </a-radio-button>
                <a-radio-button value="GPU">
                  {{ 'GPU' }}
                </a-radio-button>
              </a-radio-group>
              <div>
                <report-bar v-if="chartType == 'job'" ref="jobChart" :bar="data_bar" />
                <report-essemble v-if="chartType != 'job'" ref="essChart" :essemble="data_essemble" />
              </div>
            </a-tab-pane>
            <a-tab-pane key="table" :tab="$t('Report.Tab.Table')">
              <report-table :table="data_table" :job-type="preview.job_type" />
            </a-tab-pane>
          </a-tabs>
        </a-col>
      </a-row>
    </div>
  </a-spin>
</template>
<script>
import _ from 'lodash'
import { v1 as uuidv1 } from 'uuid'
import ReportService from '@/service/report'
import ReportPie from './report-pie.vue'
import ReportBar from './report-bar.vue'
import ReportEssemble from './report-essemble.vue'
import ReportTable from './report-table.vue'

export default {
  components: {
    'report-pie': ReportPie,
    'report-bar': ReportBar,
    'report-essemble': ReportEssemble,
    'report-table': ReportTable,
  },
  props: ['preview', 'loading'],
  emits: ['onDataChange', 'update:loading'],
  data() {
    return {
      activeName: 'chart',
      chartType: 'job',
      rawData: [],
      filterData: [],
      data_pie: {
        data: [],
        legend: [],
      },
      data_table: [],
      data_bar: {},
      data_essemble: {
        CPUCount: [],
        CPUTime: [],
        GPUCount: [],
        GPUTime: [],
        time: [],
        type: '',
      },
      get_pie: function (data) {
        const pieData = []
        const unique = [...new Set(data.map(item => item.name))]
        unique.forEach(function (item) {
          pieData.push({
            value: _.sumBy(_.filter(data, { name: item }), 'job_count'),
            name: item,
          })
        })
        return {
          data: pieData,
          legend: unique,
        }
      },
      get_bar: function (data) {
        const y = []
        const uniqueTime = [...new Set(data.map(item => item.start_time))]
        uniqueTime.forEach(function (item) {
          y.push(_.sumBy(_.filter(data, { start_time: item }), 'job_count'))
        })
        return {
          x: uniqueTime,
          y,
        }
      },
      get_essemble: function (data) {
        const cpuTime = []
        const cpuCount = []
        const gpuTime = []
        const gpuCount = []
        const uniqueTime = [...new Set(data.map(item => item.start_time))]
        uniqueTime.forEach(function (item) {
          const subtotal = _.filter(data, { start_time: item })
          cpuCount.push(_.sumBy(subtotal, 'cpu_count'))
          cpuTime.push(_.sumBy(subtotal, 'cpu_runtime'))
          gpuCount.push(_.sumBy(subtotal, 'gpu_count'))
          gpuTime.push(_.sumBy(subtotal, 'gpu_runtime'))
        })
        return {
          time: uniqueTime,
          CPUTime: cpuTime,
          CPUCount: cpuCount,
          GPUTime: gpuTime,
          GPUCount: gpuCount,
          type: this.chartType,
        }
      },
      get_table: function (data) {
        const tableData = []
        if (this.preview.job_type === 'job') {
          const uniqueTime = [...new Set(data.map(item => item.start_time))]
          uniqueTime.forEach(function (item) {
            const subtotal = _.filter(data, { start_time: item })
            tableData.push({
              key: uuidv1(),
              start_time: item,
              job_count: _.sumBy(subtotal, 'job_count'),
              cpu_count: _.sumBy(subtotal, 'cpu_count'),
              cpu_runtime: _.sumBy(subtotal, 'cpu_runtime'),
              gpu_count: _.sumBy(subtotal, 'gpu_count'),
              gpu_runtime: _.sumBy(subtotal, 'gpu_runtime'),
            })
          })
          return tableData
        } else {
          const uniqueName = [...new Set(data.map(item => item.name))]
          uniqueName.forEach(function (item) {
            const subtotal = _.filter(data, { name: item })
            const uniqueTime = [...new Set(subtotal.map(item => item.start_time))]
            uniqueTime.forEach(function (t) {
              const subtotalTime = _.filter(subtotal, {
                start_time: t,
              })
              tableData.push({
                key: uuidv1(),
                start_time: t,
                name: item,
                job_count: _.sumBy(subtotalTime, 'job_count'),
                cpu_count: _.sumBy(subtotalTime, 'cpu_count'),
                cpu_runtime: _.sumBy(subtotalTime, 'cpu_runtime'),
                gpu_count: _.sumBy(subtotalTime, 'gpu_count'),
                gpu_runtime: _.sumBy(subtotalTime, 'gpu_runtime'),
              })
            })
          })
          return tableData
        }
      },
    }
  },
  watch: {
    filterData: {
      handler: function () {
        this.data_bar = this.get_bar(this.filterData)
        this.data_essemble = this.get_essemble(this.filterData)
        this.data_table = this.get_table(this.filterData)
      },
      deep: true,
    },
    activeName() {
      this.$nextTick(() => {
        this.$refs.jobChart.onResize()
      })
    },
    preview() {
      this.init()
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.$emit('update:loading', true)
      ReportService.previewJobReport(this.preview)
        .then(
          res => {
            this.changeRuntimeUnit(res)
            this.rawData = _.sortBy(res, ['start_time'])
            this.filterData = this.rawData
          },
          err => {
            this.rawData = []
            this.filterData = this.rawData
          },
        )
        .finally(_ => {
          this.data_pie = this.get_pie(this.rawData)
          this.$emit('onDataChange', this.rawData)
          this.$emit('update:loading', false)
        })
    },
    handleClick() {
      this.$nextTick(() => {
        if (this.chartType === 'job') {
          this.data_bar = this.get_bar(this.filterData)
          this.$refs.jobChart.onResize()
        }
        if (this.chartType === 'CPU' || this.chartType === 'GPU') {
          this.data_essemble = this.get_essemble(this.filterData)
          this.$refs.essChart.onResize()
        }
      })
    },
    filter(data) {
      if (data.event.target.selected) {
        this.filterData = _.filter(this.rawData, {
          name: data.data.name,
        })
      } else {
        this.filterData = this.rawData
      }
    },
    changeTab(event) {
      this.data_bar = this.get_bar(this.filterData)
      this.data_essemble = this.get_essemble(this.filterData)
      this.data_table = this.get_table(this.filterData)
    },
    changeRuntimeUnit(data) {
      data.forEach(function (item) {
        if (item.cpu_runtime) {
          item.cpu_runtime = item.cpu_runtime / 36 / 100
        }
        if (item.gpu_runtime) {
          item.gpu_runtime = item.gpu_runtime / 36 / 100
        }
      })
    },
  },
}
</script>
