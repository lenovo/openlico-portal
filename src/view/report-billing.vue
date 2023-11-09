<template>
  <div class="height--100 p-10 report-billing">
    <div class="b-w p-20" style="height: 520px; text-align: center">
      <div v-if="balanceAlert">
        <a-row type="flex" :gutter="20" justify="center">
          <a-col :span="16" align="center">
            <div class="balance-background">
              <span class="balance-text">{{ $t('Balance.Alert.Text') }}</span>
            </div>
          </a-col>
        </a-row>
      </div>
      <div v-if="!isAdmin">
        <a-row type="flex" :gutter="20" justify="center">
          <a-col :span="8" align="center">
            <a-card style="text-align: left">
              <p>{{ $t('Report.Billing.Group') }}</p>
              <p class="report-billing-card-content">{{ billingGroup }}</p>
            </a-card>
          </a-col>
          <a-col :span="8" align="center" style="text-align: left">
            <a-card>
              <p>{{ $t('Report.Billing.Balance') }}</p>
              <p class="report-billing-card-content">{{ balance }}</p>
            </a-card>
          </a-col>
        </a-row>
      </div>
      <div>
        <div :style="{ marginTop: isAdmin ? '100px' : '30px' }">
          <img src="/static/img/system/report/billing.svg" class="placeholder-img" />
        </div>
        <div class="report-billing-tilte" style="">
          {{ $t('Report.Billing') }}
        </div>
        <a-input-group compact>
          <a-select v-model:value="period" style="width: 120px" @change="onSelectedChange">
            <a-select-option value="daily">
              {{ $t('Report.Billing.Daily') }}
            </a-select-option>
            <a-select-option value="monthly">
              {{ $t('Report.Billing.Monthy') }}
            </a-select-option>
          </a-select>
          <a-date-picker
            v-if="period == 'daily'"
            v-model:value="date"
            :format="'YYYY-MM-DD'"
            :disabled-date="disabledDate"
            :allow-clear="false"
            @change="onDateChange" />
          <a-month-picker
            v-if="period == 'monthly'"
            v-model:value="date"
            :format="'YYYY-MM'"
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
import BillGroupService from '@/service/bill-group'
import dayjs from '@/dayjs'
import Format from '@/common/format'
import billingReportService from '@/service/report-consume'

export default {
  data() {
    return {
      userType: this.$store.state.auth.access === 'staff' ? 'user' : 'cluster',
      date: null,
      period: 'daily',
      latestDate: {},
      selectedDate: '',
      disabled: false,
      billingGroup: '-',
      balance: '-',
      balanceAlert: false,
    }
  },
  computed: {
    isAdmin() {
      return this.$store.state.auth.access === 'admin'
    },
  },
  mounted() {
    billingReportService.getReportLatestDate(this.userType).then(res => {
      this.date = res.latestDate ? dayjs(res.latestDate) : null
      this.selectedDate = res.latestDate
      this.latestDate = res
    })
    if (!this.isAdmin) {
      this.config()
    }
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
      this.selectedDate = dayjs(val).format('YYYY-MM-DD')
    },
    onSelectedChange(val) {
      if (val === 'daily') {
        this.selectedDate = this.latestDate.latestDate
      } else if (val === 'monthly') {
        this.selectedDate = this.latestDate.latestMonth
      }
      this.date = this.selectedDate ? dayjs(this.selectedDate) : null
    },
    disabledDate(current) {
      const disabledDate = this.latestDate
      if (this.period === 'daily' && disabledDate.latestDate) {
        return current > dayjs(disabledDate.latestDate).endOf('day')
      }
      if (this.period === 'monthly' && disabledDate.latestMonth) {
        return current > dayjs(disabledDate.latestMonth).endOf('month')
      }
      return true
    },
    config() {
      BillGroupService.getUserBillGroup().then(res => {
        if (res.bill_group) {
          this.billingGroup = res.bill_group.name ? res.bill_group.name : '-'
          this.balance = res.bill_group.balance ? Format.formatMoney(res.bill_group.balance) : '-'
          this.balanceAlert = res.balance_alert
        }
      })
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
.report-billing-card-content {
  font-weight: bold;
  font-size: 20px;
  margin-top: 10px;
}
.balance-background {
  display: flex;
  height: 50px;
  background: url('/static/img/system/report/balance_alert.png') no-repeat;
  background-size: 100% 100%;
  margin-bottom: 20px;
}
.balance-text {
  font-size: 13px;
  font-weight: bold;
  color: #e98a00;
  line-height: 13px;
  margin: auto;
}
</style>
