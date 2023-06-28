<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    :size="920"
    :form-model="reportDownloadForm"
    :form-rules="reportDownloadRules"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-alert v-show="target != 'operation'" :message="$t('Report.Message.Dialog')" type="info" show-icon />
    <div style="margin-left: 20px">
      <div v-show="target != 'operation'" class="reportDialog-div-header">{{ $t('Report.Label.Content') }}:</div>
      <a-form-model-item v-show="target != 'operation'">
        <a-radio-group v-model="reportDownloadForm.content" button-style="solid">
          <a-radio-button id="tid_report-filter-statistics" value="statistics">
            {{ $t('Report.Label.Content.Stat') }}
          </a-radio-button>
          <a-radio-button id="tid_report-filter-details" value="details">
            {{ $t('Report.Label.Content.Detail') }}
          </a-radio-button>
        </a-radio-group>
      </a-form-model-item>
      <div class="reportFormat">
        <div class="reportDialog-div-header">{{ $t('Report.Title.Format') }}:</div>
        <a-row>
          <div>
            <template v-for="item in exportTypeList">
              <div v-show="reportDownloadForm.content == 'statistics' || item != 'pdf'" :key="item" class="inline">
                <input
                  :id="'tid_reportFormat_' + item"
                  v-model="reportDownloadForm.format"
                  type="radio"
                  :value="item" />
                <label
                  :for="'tid_reportFormat_' + item"
                  :style="{
                    'background-image': `url('static/img/system/report/${item}${
                      reportDownloadForm.format == item ? '_check' : ''
                    }.png')`,
                  }" />
              </div>
            </template>
          </div>
        </a-row>
        <a-row id="tid_reportDirection" class="reportFilter-div-header reportDirection">
          <div v-show="reportDownloadForm.format == 'pdf' && reportDownloadForm.content == 'statistics'">
            <a-radio-group v-model="reportDownloadForm.direction">
              <a-radio id="tid_reportPdfHorizontal" value="landscape">
                {{ $t('Report.Direction.Horizontal') }}
              </a-radio>
              <a-radio id="tid_reportPdfVertical" value="vertical" :disabled="disableVertical">
                {{ $t('Report.Direction.Vertical') }}
              </a-radio>
            </a-radio-group>
          </div>
        </a-row>
      </div>
    </div>
  </composite-form-dialog>
</template>
<script>
import CompositeFormDialog from '../../component/composite-form-dialog'
import download from '../../service/download'
import ReportService from '../../service/report'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  props: ['exportList'],
  data() {
    return {
      token: this.$store.state.auth.token,
      type: '',
      title: this.$t('Report.Button.Submit'),
      target: 'job',
      disableVertical: false,
      reportDownloadForm: {
        content: 'statistics',
        format: 'csv',
        direction: 'landscape',
        reportType: 'job',
      },
      reportDownloadRules: {},
    }
  },
  computed: {
    exportTypeList() {
      if (Array.isArray(this.exportList)) return this.exportList

      const list = ['xlsx', 'pdf', 'html']
      return list
    },
  },
  watch: {
    reportDownloadForm: {
      handler: function () {
        if (this.reportDownloadForm.content === 'details' && this.target !== 'operation') {
          this.reportDownloadForm.direction = 'landscape'
          this.disableVertical = true
        } else {
          this.disableVertical = false
        }
      },
      deep: true,
    },
    'reportDownloadForm.content'(val, old) {
      if (this.reportDownloadForm.format === 'pdf') {
        this.reportDownloadForm.format = this.exportTypeList[0]
      }
    },
  },
  methods: {
    submitForm() {
      const form = {
        reportType: this.target,
        format: this.reportDownloadForm.format,
        start_time: this.reportDownloadForm.start_time,
        end_time: this.reportDownloadForm.end_time,
        direction: this.reportDownloadForm.direction,
        filterData: {
          job_type: this.reportDownloadForm.reportType,
          operation_type: this.reportDownloadForm.reportType,
          content: this.reportDownloadForm.content,
          level: '',
          user: JSON.stringify(this.reportDownloadForm.user),
          billGroup: JSON.stringify(this.reportDownloadForm.billgroup),
          node: this.reportDownloadForm.node,
          monitor_type: this.reportDownloadForm.monitor_type,
        },
      }
      const data = ReportService.Report.toRestApi(form)
      let req = null
      if (this.type === 'utilizaiton-report') {
        req = {
          creator: data.creator,
          page_direction: data.page_direction,
          timezone_offset: data.timezone_offset,
          monitor_type: data.monitor_type,
          url: data.url,
          language: data.language,
          utilization_report_type: this.reportDownloadForm.utilization_report_type,
          utilization_report_value: this.reportDownloadForm.utilization_report_value.values.join(','),
          time_type: this.reportDownloadForm.time_type,
        }
        return download('/api/download/monitor/report/download/', req, 'post', 'formData')
      } else if (this.type === 'operation-log') {
        return download('/api/download/operation/optlog/download/', data, 'post', 'formData')
      } else if (this.type === 'report-job') {
        return download(`/api/download/job/job_report/${data.url}/`, data, 'post', 'formData')
      }
    },
    successMessageFormatter(res) {
      return this.$t('Report.Message.Success')
    },
    errorMessageFormatter(res) {
      const errMsg = res
      return this.$t(errMsg)
    },
    download(data, type) {
      this.type = type
      this.target = data.target
      this.reportDownloadForm = {
        content: 'statistics',
        format: this.exportTypeList[0],
        direction: 'landscape',
        start_time: data.start_time,
        end_time: data.end_time,
        user: data.user,
        node: data.node,
        billgroup: data.billgroup,
        reportType: data.job_type,
        monitor_type: data.monitor_type,
        utilization_report_type: data.valueType,
        utilization_report_value: data.value,
        time_type: data.time_type,
      }
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
<style>
.reportAlert {
  margin: 0px 20px 15px;
}
.reportFormat .inline {
  display: inline-block;
}
.reportFormat input[type='radio'] {
  display: none;
}
.reportDirection input[type='radio'] {
  display: inline-block;
}
.reportFormat input[type='radio'] ~ label {
  display: inline-block;
  width: 60px;
  height: 60px;
}
.reportFormat {
  padding: 10px 0;
}
.inline {
  margin-right: 20px;
}
.reportDialog-div-header {
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>
