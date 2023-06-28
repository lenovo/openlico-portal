<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="900px"
    :form-model="reportDownloadForm"
    :form-rules="reportDownloadRules"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-alert :message="$t('Report.Message.Dialog')" type="info" show-icon />
    <a-form-model-item :label="$t('Report.Label.Content')" class="p-t-20">
      <a-radio-group v-model="reportMode" button-style="solid">
        <a-radio-button v-for="(item, index) in reportModeOptions" :key="index" :value="item.value">
          {{ item.label }}
        </a-radio-button>
      </a-radio-group>
    </a-form-model-item>
    <a-form-model-item v-if="reportMode == 'details'" :label="$t('Report.Label.Level')">
      <a-radio-group v-model="reportDownloadForm.level" button-style="solid" @change="onAlertLevelChange">
        <a-radio-button v-for="(item, index) in levelOptions" :key="index" :value="item.value">
          {{ item.label }}
        </a-radio-button>
      </a-radio-group>
    </a-form-model-item>
    <a-form-model-item v-show="reportMode == 'details'" :label="$t('Report.Label.Node')">
      <multi-node-selector ref="multiNodeSelector" :hostname-max="50" @nodes-selected-change="nodeSelectedChange" />
    </a-form-model-item>
    <a-form-model-item :label="$t('Report.Title.Format')">
      <a-row class="reportFormats">
        <a-col :span="2">
          <input
            id="tid_reportFormatExcel"
            v-model="reportDownloadForm.format"
            type="radio"
            class="reportFormatExcel"
            value="xlsx" />
          <label for="tid_reportFormatExcel" />
        </a-col>
        <a-col v-if="reportMode == 'statistics'" :span="2">
          <input
            id="tid_reportFormatPDF"
            v-model="reportDownloadForm.format"
            type="radio"
            class="reportFormatPDF"
            value="pdf" />
          <label for="tid_reportFormatPDF" />
        </a-col>
        <a-col :span="2">
          <input
            id="tid_reportFormatHTML"
            v-model="reportDownloadForm.format"
            type="radio"
            class="reportFormatHTML"
            value="html" />
          <label for="tid_reportFormatHTML" />
        </a-col>
      </a-row>
      <a-row v-if="reportDownloadForm.format == 'pdf' && reportMode == 'statistics'">
        <a-radio-group v-model="reportDownloadForm.direction">
          <a-radio id="tid_reportPdfHorizontal" value="landscape">
            {{ $t('Report.Direction.Horizontal') }}
          </a-radio>
          <a-radio id="tid_reportPdfVertical" value="vertical">
            {{ $t('Report.Direction.Vertical') }}
          </a-radio>
        </a-radio-group>
      </a-row>
    </a-form-model-item>
  </composite-form-dialog>
</template>
<script>
import ReportService from '../../service/report'
import CompositeFormDialog from '../../component/composite-form-dialog'
import MultiNodeSelector from '../../widget/multi-node-selector'
import download from '../../service/download'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
    'multi-node-selector': MultiNodeSelector,
  },
  data() {
    return {
      title: this.$t('Report.Button.Submit'),
      innerValue: [],
      reportMode: 'statistics',
      reportDownloadForm: {
        level: 'all',
        content: 'statistics',
        format: 'xlsx',
        direction: 'landscape',
        reportType: 'alert',
        node: {
          value_type: 'hostname',
          values: [],
        },
      },
      reportModeOptions: [
        {
          label: this.$t('Report.Label.Content.Stat'),
          value: 'statistics',
        },
        {
          label: this.$t('Report.Label.Content.Detail'),
          value: 'details',
        },
      ],
      levelOptions: [
        {
          label: this.$t('Report.Label.Level.All'),
          value: 'all',
        },
        {
          label: this.$t('Alert.PolicyLevel.critical'),
          value: 'fatal',
        },
        {
          label: this.$t('Alert.PolicyLevel.error'),
          value: 'error',
        },
        {
          label: this.$t('Alert.PolicyLevel.warning'),
          value: 'warn',
        },
        {
          label: this.$t('Alert.PolicyLevel.info'),
          value: 'info',
        },
      ],
      reportDownloadRules: {},
    }
  },
  watch: {
    reportDownloadForm: {
      handler: function (val, oldV) {
        if (this.reportMode === 'details') {
          if (val.format === 'pdf') {
            this.reportDownloadForm.format = 'xlsx'
          }
          this.reportDownloadForm.direction = 'landscape'
        }
      },
      deep: true,
    },
    reportMode(val, oldV) {
      this.reportDownloadForm.content = val
    },
  },
  methods: {
    submitForm() {
      const req = {
        timezone_offset: new Date().getTimezoneOffset(),
        creator: window.gApp.$store.state.auth.username,
        language: window.gApp.$i18n.locale === 'zh' ? 'sc' : 'en',
        start_time: isNaN(this.reportDownloadForm.start_time) ? 0 : this.reportDownloadForm.start_time / 1000,
        end_time: isNaN(this.reportDownloadForm.end_time) ? 0 : this.reportDownloadForm.end_time / 1000,

        page_direction: this.reportDownloadForm.direction,
      }
      if (this.reportDownloadForm.node && this.reportDownloadForm.node.values.length > 0) {
        req.node_value_type = this.reportDownloadForm.node.value_type
        req.node_values = this.reportDownloadForm.node.values.join(',')
      }
      // eslint-disable-next-line no-unused-expressions, no-extra-boolean-cast
      !!this.reportDownloadForm.level
        ? (req.event_level = ReportService.levelToRest[this.reportDownloadForm.level])
        : null

      this.$refs.multiNodeSelector.handleNodes()
      return download(
        `/api/download/alert/report/alert_${this.reportMode}.${this.reportDownloadForm.format}/`,
        req,
        'post',
        'formData',
      )
    },
    successMessageFormatter(res) {
      return this.$t('Report.Message.Success')
    },
    errorMessageFormatter(err) {
      return this.$t(err)
    },
    download(data) {
      this.reportDownloadForm = {
        content: 'statistics',
        format: 'xlsx',
        direction: 'landscape',
        start_time: data.start_time,
        end_time: data.end_time,
        node: data.node,
        level: data.level,
      }
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    onAlertLevelChange(e) {
      this.reportDownloadForm.level = e.target.value
    },
    nodeSelectedChange(val) {
      this.reportDownloadForm.node = val
    },
  },
}
</script>
<style>
.reportAlert {
  margin: 0px 20px 15px;
}
.reportFormats .inline {
  display: inline-block;
}
.reportFormats input[type='radio'] {
  display: none;
}
.reportDirection input[type='radio'] {
  display: inline-block;
}
.reportFormats input[type='radio'] ~ label {
  display: inline-block;
  width: 60px;
  height: 60px;
}
.reportFormatExcel ~ label {
  background-image: url('static/img/system/report/xlsx.png');
}
.reportFormatExcel:checked ~ label {
  background-image: url('static/img/system/report/xlsx_check.png');
}
.reportFormatPDF ~ label {
  background-image: url('static/img/system/report/pdf.png');
}
.reportFormatPDF:checked ~ label {
  background-image: url('static/img/system/report/pdf_check.png');
}
.reportFormatHTML ~ label {
  background-image: url('static/img/system/report/html.png');
}
.reportFormatHTML:checked ~ label {
  background-image: url('static/img/system/report/html_check.png');
}

.inline {
  margin-right: 20px;
}
.reportDialog-div-header {
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>
