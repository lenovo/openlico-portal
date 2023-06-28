<template>
  <div class="report-table-style m-10">
    <div class="reportFilter m-b-20">
      <a-row style="margin-bottom: 20px">
        <a-col :span="12" class="report-job-col">
          <span class="report-job-filter-label">{{ $t('Report.Label.Type') }}</span>
          <a-radio-group v-model="reportFilterForm.job_type" class="reportFilter-button" button-style="solid">
            <a-radio-button id="tid_report-filter-type-job" value="job">
              {{ $t('Report.Label.Type.Job') }}
            </a-radio-button>
            <a-radio-button v-if="arch == 'host'" id="tid_report-filter-type-billgroup" value="billgroup">
              {{ $t('Report.Label.BillGroup') }}
            </a-radio-button>
            <a-radio-button id="tid_report-filter-type-user" value="user">
              {{ $t('Report.Label.Type.User') }}
            </a-radio-button>
          </a-radio-group>
        </a-col>
        <a-col
          v-show="reportFilterForm.job_type == 'user' || reportFilterForm.job_type == 'job'"
          :span="12"
          class="report-job-col">
          <span class="report-job-filter-label">{{ $t('Report.Label.User') }}</span>
          <multi-user-selector
            id="tid_report-filter-user-select"
            style="width: 375px"
            :users-value="[]"
            :filter-type="multiUserFilter"
            :allable="true"
            :clearable="true"
            @change="userSelectionChange" />
        </a-col>
        <a-col v-if="reportFilterForm.job_type == 'billgroup'" :span="12" class="report-job-col">
          <span class="report-job-filter-label">{{ $t('Report.Label.BillGroup') }}</span>
          <a-select
            id="tid_report-filter-billgroup-select"
            v-model="reportFilterForm.billGroup"
            style="width: 300px"
            mode="multiple"
            :placeholder="$t('Select.All')">
            <a-select-option v-for="item in billOption" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-col>
      </a-row>
      <a-row id="tid_reportTime">
        <a-col :span="24" class="report-job-col">
          <span class="report-job-filter-label">{{ $t('Report.Title.Time') }}</span>
          <date-region-picker
            id="tid_report-time-picker"
            ref="dateSelect"
            v-model="daterange"
            quick-pick="default"
            @date-change="onDateChange" />
        </a-col>
      </a-row>
      <hr class="halving-line" style="width: 100%; margin: 20px 0" />
      <a-row id="tid_reportAction">
        <a-col :span="24" class="report-job-col">
          <span class="report-job-filter-label" />
          <a-button
            id="tid_report-submit"
            type="primary"
            :disabled="isOK()"
            style="margin-right: 20px"
            @click="submit()">
            {{ $t('Report.Button.Preview') }}
          </a-button>
          <a-button :disabled="isOK()" @click="download()">
            {{ $t('Report.Button.Submit') }}
          </a-button>
        </a-col>
      </a-row>
    </div>
    <report-dialog ref="ReportDialog" />
    <div v-show="isShow" class="nodata">
      <div style="margin-top: 160px">
        <img src="/static/img/system/main/nodata.png" style="height: 60px; width: 80px" />
      </div>
      <div style="margin-top: 20px; color: #ccc; font-size: 16px">
        {{ $t('No.Data') }}
      </div>
    </div>
    <report-preview v-show="show" ref="reportPreview" :preview="preview" @onDataChange="onPreviewChange" />
  </div>
</template>
<script>
import AccessService from '../service/access'
import BillGroupService from '../service/bill-group'
import DateRegionPicker from '../component/date-region-picker'
import MultiUserSelector from '../widget/multi-user-selector'
import ReportDialog from './report/report-dialog'
import ReportPreview from './report-job/report-preview'

export default {
  components: {
    'date-region-picker': DateRegionPicker,
    'report-dialog': ReportDialog,
    'multi-user-selector': MultiUserSelector,
    'report-preview': ReportPreview,
  },
  data() {
    return {
      show: false,
      isShow: false,
      daterange: ['', ''],
      billOption: [],
      preview: {},
      arch: AccessService.getSchedulerArch(),
      reportFilterForm: {
        job_type: 'job',
        user: {
          values: [],
          value_type: '',
        },
        billGroup: [],
      },
      isOK: function () {
        if (this.daterange.includes('')) {
          return true
        } else {
          return false
        }
      },
    }
  },
  computed: {
    multiUserFilter() {
      if (this.arch === 'host' && this.job_type === 'user') {
        return 'username'
      }
      return 'username,usergroup,billinggroup'
    },
  },
  watch: {
    reportFilterForm: {
      handler: function () {
        this.show = false
        this.isShow = false
      },
      deep: true,
    },
  },
  mounted() {
    if (this.arch === 'host') {
      BillGroupService.getAllBillGroups().then(
        res => {
          this.billOption = res
        },
        err => {
          this.$message.error(err)
        },
      )
    }
  },
  methods: {
    download() {
      const data = {
        target: 'job',
        start_time: new Date(this.daterange[0]).valueOf(),
        end_time: new Date(this.daterange[1]).valueOf(),
        job_type: this.reportFilterForm.job_type,
        user: this.reportFilterForm.user,
        billgroup: this.reportFilterForm.billGroup,
      }
      this.$refs.ReportDialog.download(data, 'report-job').then(
        res => {
          // window.open(res);
        },
        res => {},
      )
    },
    userSelectionChange(val) {
      this.reportFilterForm.user = val
    },
    submit() {
      const twoColumns = this.reportFilterForm.job_type !== 'job'
      this.preview = {
        target: 'job',
        twoColumns,
        start_time: new Date(this.daterange[0]).valueOf(),
        end_time: new Date(this.daterange[1]).valueOf(),
        job_type: this.reportFilterForm.job_type,
        user: this.reportFilterForm.user,
        billgroup: this.reportFilterForm.billGroup,
      }
    },
    onDateChange(val) {
      this.daterange = val
      this.show = false
    },
    onPreviewChange(data) {
      if (data.length < 1) {
        this.show = false
        this.isShow = true
      } else {
        this.show = true
        this.isShow = false
      }
    },
  },
}
</script>
<style>
.report-job-col {
  display: flex;
}
.report-job-col .report-job-filter-label {
  width: 140px;
  line-height: 32px;
  padding-right: 20px;
  text-align: right;
}
</style>
