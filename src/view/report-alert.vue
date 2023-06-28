<template>
  <div class="height--100 p-10">
    <div class="reportFilter">
      <a-col :span="24" style="display: flex" class="report-alert-col">
        <span class="report-alert-filter-label">{{ $t('Report.Title.Time') }}</span>
        <date-region-picker
          id="tid_report-time-picker"
          ref="dateSelect"
          v-model="daterange"
          quick-pick="default"
          @date-change="onDateChange" />
      </a-col>
      <hr class="halving-line" style="width: 100%; margin: 20px 0" />
      <a-col :span="24" style="display: flex" class="report-alert-col">
        <span class="report-alert-filter-label" />
        <a-button type="primary" class="m-r-20" :disabled="isOK()" @click="alertReport()">
          {{ $t('Report.Button.Preview') }}
        </a-button>
        <a-button id="tid_report-submit" :disabled="isOK()" @click="download()">
          {{ $t('Report.Button.Submit') }}
        </a-button>
      </a-col>
    </div>
    <div v-if="show" class="nodata">
      <div style="margin-top: 160px">
        <img src="/static/img/system/main/nodata.png" style="height: 60px; width: 80px" />
      </div>
      <div style="margin-top: 20px; color: #ccc; font-size: 16px">
        {{ $t('No.Data') }}
      </div>
    </div>
    <report-alert-dialog ref="reportAlertDialog" />

    <a-row v-if="okShow" class="report-alert-bottom" type="flex" justify="center">
      <a-col :span="8">
        <div style="padding: 20px">
          <report-alert-pie ref="reportAlertPie" :data-report-alert-pie="dataReportAlertPie" @clickPie="filter" />
        </div>
      </a-col>
      <a-col :span="16">
        <div ref="reportRight" style="padding: 20px">
          <a-tabs v-model="activeName" :animated="false" @change="changeDisplay">
            <a-tab-pane key="axis" :tab="$t('Report.Tab.Chart')">
              <report-alert-axis
                v-if="dataReportAlertAxis"
                ref="reportAlertAxis"
                :data-report-alert-axis="dataReportAlertAxis" />
            </a-tab-pane>
            <a-tab-pane key="table" :tab="$t('Report.Tab.Table')">
              <report-alert-table
                v-if="dataReportAlertTable"
                ref="reportAlertTable"
                :data-report-alert-table="dataReportAlertTable" />
            </a-tab-pane>
          </a-tabs>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import ReportService from '../service/report'
import DateRegionPicker from '../component/date-region-picker'
import ReportAlertDialog from './report/report-alert-dialog'
import ReportAlertPie from './report/report-alert-pie'
import ReportAlertAxis from './report/report-alert-axis'
import ReportAlertTable from './report/report-alert-table'

export default {
  components: {
    'date-region-picker': DateRegionPicker,
    'report-alert-dialog': ReportAlertDialog,
    'report-alert-pie': ReportAlertPie,
    'report-alert-axis': ReportAlertAxis,
    'report-alert-table': ReportAlertTable,
  },
  data() {
    return {
      daterange: ['', ''],
      types: ['critical', 'error', 'warning', 'info'],
      show: false,
      okShow: false,
      activeName: 'axis',
      rawData: [],
      dataReportAlertPie: null,
      dataReportAlertAxis: null,
      dataReportAlertTable: [],
      ReportFilterForm: {
        level: 'all',
        node: {
          value_type: 'hostname',
          values: [],
        },
      },
    }
  },
  watch: {
    activeName(newVal, oldVal) {
      const self = this
      if (newVal === 'axis') {
        this.$nextTick(() => {
          self.$refs.reportAlertAxis.onResize()
        })
      } else if (newVal === 'table') {
        this.$nextTick(() => {
          self.$refs.reportAlertTable.reLayout()
        })
      }
    },
  },

  methods: {
    getPieData: function (data) {
      const self = this
      const count = {}
      const result = []
      data.forEach(item => {
        self.types.forEach(type => {
          if (!(type in count)) {
            count[type] = 0
            count[type] += item[type]
          } else {
            count[type] += item[type]
          }
        })
      })
      if (count) {
        self.types.forEach(type => {
          result.push({ value: count[type], name: type })
        })
      }
      return {
        legend: result && result.length > 0 ? self.types : [],
        data: result,
      }
    },
    getAxisData: function (data) {
      const self = this
      data.sort(function (a, b) {
        return Date.parse(a.alertTime) - Date.parse(b.alertTime)
      })
      const result = {}
      const fields = self.types.concat(['alertTime'])
      data.forEach(item => {
        fields.forEach(type => {
          if (!(type in result)) {
            result[type] = []
            result[type].push(item[type])
          } else {
            result[type].push(item[type])
          }
        })
      })
      return result
    },
    getTableData: function (data) {
      return data
    },
    changeDisplay(activeKey) {
      if (activeKey === 'axis') {
        this.getAxisData(this.rawData)
      } else {
        this.getTableData(this.rawData)
      }
    },
    filter(data) {
      const self = this
      if (data.data.selected) {
        const filtered = []
        self.rawData.forEach(function (item) {
          if (item[data.data.name] > 0) {
            const temp = {}
            temp.alertTime = item.alertTime
            temp[data.data.name] = item[data.data.name]
            filtered.push(temp)
          }
        })
      }
    },
    clearData() {
      this.rawData = []
      this.dataReportAlertPie = null
      this.dataReportAlertAxis = null
      this.dataReportAlertTable = []
    },
    onDateChange(val) {
      this.daterange = val
      this.show = false
      this.okShow = false
      this.clearData()
    },
    isOK: function () {
      if (this.daterange.includes('')) {
        return true
      } else {
        return false
      }
    },
    download() {
      const data = {
        target: 'alert',
        start_time: new Date(this.daterange[0]).valueOf(),
        end_time: new Date(this.daterange[1]).valueOf(),
        level: this.ReportFilterForm.level,
        node: this.ReportFilterForm.node,
      }
      this.$refs.reportAlertDialog.download(data).then(res => {})
    },
    alertReport() {
      const form = {
        start_time: new Date(this.daterange[0]).valueOf() / 1000,
        end_time: new Date(this.daterange[1]).valueOf() / 1000,
        timezone_offset: new Date().getTimezoneOffset(),
      }
      const self = this
      this.isShow = false
      ReportService.alertReport(form).then(res => {
        if (res.length < 1) {
          this.show = true
          this.okShow = false
        } else {
          this.show = false
          this.okShow = true
        }
        self.rawData = res
        self.dataReportAlertPie = self.getPieData(res)
        self.dataReportAlertAxis = self.getAxisData(res)
        self.dataReportAlertTable = self.getTableData(res)
      })
    },
  },
}
</script>
<style scoped>
.report-alert-col {
  display: flex;
}
.report-alert-col .report-alert-filter-label {
  width: 140px;
  line-height: 32px;
  padding-right: 20px;
  text-align: right;
}
</style>
