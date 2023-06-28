<template>
  <div class="p-10">
    <div class="report-table-style b-w">
      <div class="reportFilter">
        <a-col :span="24" style="display: flex" class="report-operation-col m-b-20">
          <span class="report-operation-filter-label">{{ $t('Report.Label.Index') }}</span>
          <a-radio-group
            v-model="reportFilterForm.monitor_type"
            button-style="solid"
            class="reportFilter-button"
            @change="onMonitorTypeChange">
            <a-radio-button value="cpu">
              {{ $t('Report.Label.Index.CPU') }}
            </a-radio-button>
            <a-radio-button value="memory">
              {{ $t('Report.Label.Index.Memory') }}
            </a-radio-button>
            <a-radio-button value="network">
              {{ $t('Report.Label.Index.Network') }}
            </a-radio-button>
            <a-radio-button value="gpu">
              {{ $t('Report.Label.Index.GPU') }}
            </a-radio-button>
          </a-radio-group>
        </a-col>
        <a-col :span="24" style="display: flex" class="report-operation-col m-b-20">
          <span class="report-operation-filter-label">{{ $t('Report.Title.Time') }}</span>
          <a-select
            id="report-operation-time-select"
            v-model="reportFilterForm.timeType"
            style="width: 300px"
            @change="onSelectedTimeChang">
            <a-select-option v-for="item in timeSelectOptions" :key="item.value" :value="item.value">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="24" style="display: flex" class="report-operation-col">
          <span class="report-operation-filter-label">{{ $t('Report.Label.Node') }}</span>
          <multi-node-selector
            id="tid_report-filter-node-select"
            style="width: 375px"
            :filter-type="'hostname'"
            :hostname-max="50"
            :allable="isAllable"
            @nodes-selected-change="nodeSelectChange" />
        </a-col>
        <hr class="halving-line" style="width: 100%; margin: 20px 0" />
        <div class="lico-date-picke">
          <a-button id="tid_report-submit" type="primary" :disabled="isDisabled" @click="submit()">
            {{ $t('Report.Button.Preview') }}
          </a-button>
          <a-button :disabled="isDisabled" @click="download()">
            {{ $t('Report.Button.Submit') }}
          </a-button>
        </div>
      </div>
      <div v-show="isShow" class="nodata">
        <div style="margin-top: 160px">
          <img src="/static/img/system/main/nodata.png" style="height: 60px; width: 80px" />
        </div>
        <div style="margin-top: 20px; color: #ccc; font-size: 16px">
          {{ $t('No.Data') }}
        </div>
      </div>

      <div v-show="show" class="reportPreview b-w">
        <a-col :span="24">
          <a-tabs v-model="activeName" default-active-key="chart" :animated="false">
            <a-tab-pane key="chart" :tab="$t('Report.Tab.Chart')">
              <report-line :line="data_line" />
            </a-tab-pane>
          </a-tabs>
        </a-col>
      </div>
      <report-dialog ref="ReportDialog" :export-list="['csv', 'xlsx']" />
    </div>
  </div>
</template>
<script>
import ReportDialog from './report/report-dialog'
import ReportLine from './report/report-line'
import ReportService from '../service/report'
import _ from 'lodash'
import MultiNodeSelector from '../widget/multi-node-selector'

export default {
  components: {
    'report-dialog': ReportDialog,
    'report-line': ReportLine,
    'multi-node-selector': MultiNodeSelector,
  },
  data() {
    return {
      activeName: 'chart',
      data_line: [],
      show: false,
      isShow: false,
      reportFilterForm: {
        node: [],
        monitor_type: 'cpu',
        start_time: null,
        end_time: null,
        timeType: 'hour',
      },
      isAllable: false,
      timeSelectOptions: [
        {
          value: 'hour',
          name: this.$t('Time.Select.Hour'),
        },
        {
          value: 'day',
          name: this.$t('Time.Select.Day'),
        },
        {
          value: 'week',
          name: this.$t('Time.Select.Week'),
        },
        {
          value: 'month',
          name: this.$t('Time.Select.Month'),
        },
      ],
    }
  },
  computed: {
    isDisabled() {
      const noHostsSelected = this.reportFilterForm.node.values.length === 0
      if (noHostsSelected) {
        return true
      }
      return false
    },
  },
  methods: {
    download() {
      const data = {
        target: 'operation',
        time_type: this.reportFilterForm.timeType,
        job_type: 'node_running',
        monitor_type: this.reportFilterForm.monitor_type,
        // node: this.reportFilterForm.node
        valueType: 'hostname',
        value: this.reportFilterForm.node,
      }
      this.$refs.ReportDialog.download(data, 'utilizaiton-report').then(
        res => {
          // window.open(res);
        },
        res => {},
      )
    },
    nodeSelectChange(val) {
      this.reportFilterForm.node = val
      this.isShow = false
      this.show = false
    },
    submit() {
      const $this = this
      const format = this.reportFilterForm.monitor_type === 'network' ? 'MB/s' : '%'

      ReportService.previewLogReport(this.reportFilterForm).then(res => {
        if (res.length > 0) {
          $this.show = true
          $this.isShow = false
        } else {
          $this.show = false
          $this.isShow = true
        }
        const hostname = [...new Set(res.map(item => item.hostname))]
        const time = []
        const series = []
        // var monitor_type = res[0]['type'];
        hostname.forEach(function (item) {
          const lineData = []
          _.filter(res, { hostname: item })[0].history.forEach(function (cell) {
            lineData.push([cell.time, Number(cell.usage)])
            time.push(cell.time)
          })
          series.push({
            name: item,
            type: 'line',
            // stack: monitor_type,
            data: lineData,
          })
        })
        const uniqueTime = [...new Set(time.map(item => item))]
        $this.data_line = {
          time: uniqueTime,
          legend: hostname,
          series,
          format,
        }
      })
    },
    onMonitorTypeChange(val) {
      this.show = false
      this.isShow = false
    },
    onSelectedTimeChang() {
      this.show = false
      this.isShow = false
    },
  },
}
</script>
<style scoped>
.report-operation-col {
  display: flex;
}
.report-operation-col .report-operation-filter-label {
  width: 140px;
  line-height: 32px;
  padding-right: 20px;
  text-align: right;
}
.lico-date-picke {
  padding-left: 140px;
}
#tid_report-submit {
  margin-right: 10px;
}
.reportPreview {
  padding: 20px;
  font-size: 14px;
  display: flex;
  margin-top: 10px;
}
</style>
