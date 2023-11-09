<template>
  <div class="height--100 p-10">
    <div class="table-style b-w p-20" style="height: 500px; text-align: center">
      <div>
        <div style="margin-top: 100px">
          <img src="/static/img/system/main/operation-log.svg" class="placeholder-img" />
        </div>
        <div style="color: #333333; font-size: 16px; margin-bottom: 10px">
          {{ $t('Menu.OperationLogManage') }}
        </div>
        <date-region-picker
          id="tid_report-time-picker"
          ref="dateSelect"
          v-model:value="daterange"
          quick-pick=""
          style="margin: 0"
          @date-change="onDateChange" />
        <a-button type="primary" :disabled="isOK()" style="margin-top: 10px" @click="DownloadLog()">
          {{ $t('Action.Download') }}
        </a-button>
      </div>
    </div>
    <report-dialog ref="ReportDialog" />
  </div>
</template>

<script>
import DateRegionPicker from '@/component/date-region-picker.vue'
import ReportDialog from './report/report-dialog.vue'
export default {
  components: {
    'date-region-picker': DateRegionPicker,
    'report-dialog': ReportDialog,
  },
  data() {
    return {
      daterange: ['', ''],
      isOK: function () {
        if (this.daterange.includes('')) {
          return true
        } else {
          return false
        }
      },
    }
  },
  methods: {
    DownloadLog() {
      const data = {
        target: 'operation',
        job_type: 'log',
        start_time: new Date(this.daterange[0]).valueOf(),
        end_time: new Date(this.daterange[1]).valueOf(),
      }
      this.$refs.ReportDialog.download(data, 'operation-log').then(
        res => {
          // window.open(res);
        },
        res => {},
      )
    },
    onDateChange(val) {
      this.daterange = val
    },
  },
}
</script>
