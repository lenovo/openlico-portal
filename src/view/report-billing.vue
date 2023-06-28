<template>
  <div class="height--100 p-10 report-billing">
    <div class="b-w p-20" style="height: 520px; text-align: center">
      <div>
        <div style="margin-top: 100px">
          <img src="static/img/system/report/billing.svg" class="placeholder-img" />
        </div>
        <div class="report-billing-tilte" style="">
          {{ $t('Report.Billing') }}
        </div>
        <a-input-group compact>
          <a-select v-model="period" style="width: 120px" @change="onSelectedChange">
            <a-select-option value="daily">
              {{ $t('Report.Billing.Daily') }}
            </a-select-option>
            <a-select-option value="monthly">
              {{ $t('Report.Billing.Monthy') }}
            </a-select-option>
          </a-select>
          <a-date-picker
            v-if="period == 'daily'"
            v-model="date"
            :format="'yyyy-MM-DD'"
            :disabled-date="disabledDate"
            :allow-clear="false"
            @change="onDateChange" />
          <a-month-picker
            v-if="period == 'monthly'"
            v-model="date"
            :format="'yyyy-MM'"
            :disabled-date="disabledDate"
            :allow-clear="false"
            @change="onDateChange" />
        </a-input-group>
      </div>
      <div>
        <a-button type="primary" :disabled="!date" :loading="disabled" style="margin-top: 10px" @click="DownloadLog()">
          {{ $t('Image.Download') }}
        </a-button>
      </div>
    </div>
  </div>
</template>
<script>
import moment from 'moment'
import billingReportService from './../service/report-consume'

export default {
  data() {
    return {
      moment,
      userType: this.$store.state.auth.access === 'staff' ? 'user' : 'cluster',
      date: null,
      period: 'daily',
      latestDate: {},
      selectedDate: '',
      disabled: false,
    }
  },
  mounted() {
    billingReportService.getReportLatestDate(this.userType).then(res => {
      this.date = res.latestDate ? moment(res.latestDate) : null
      this.selectedDate = res.latestDate
      this.latestDate = res
    })
  },
  methods: {
    DownloadLog() {
      this.disabled = true
      billingReportService
        .getReportDownUrl(this.userType, this.period, this.selectedDate)
        .then(
          res => {},
          err => {
            this.$message.error(err)
          },
        )
        .finally(() => {
          this.disabled = false
        })
    },
    onDateChange(val) {
      this.selectedDate = moment(val).format('YYYY-MM-DD')
    },
    onSelectedChange(val) {
      if (val === 'daily') {
        this.selectedDate = this.latestDate.latestDate
      } else if (val === 'monthly') {
        this.selectedDate = this.latestDate.latestMonth
      }
      this.date = this.selectedDate ? moment(this.selectedDate) : null
    },
    disabledDate(current) {
      const disabledDate = this.latestDate
      if (this.period === 'daily' && disabledDate.latestDate) {
        return current > moment(disabledDate.latestDate).endOf('day')
      }
      if (this.period === 'monthly' && disabledDate.latestMonth) {
        return current > moment(disabledDate.latestMonth).endOf('month')
      }
      return true
    },
  },
}
</script>

<style>
.report-billing .el-select {
  margin-right: -5px;
  width: 150px;
}
.report-billing .el-select input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
/* .report-billing .el-date-editor{
    margin-left: -5px;
  } */
.report-billing .el-date-editor input {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.report-billing-tilte {
  font-size: 16px;
  margin-bottom: 10px;
}
</style>
