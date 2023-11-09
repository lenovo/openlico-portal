<template>
  <div class="report-consume">
    <!-- filter date -->
    <a-row class="b-w m-10 p-20">
      <a-row class="report-consume-filter">
        <a-col :span="24" style="display: flex">
          <span class="report-consume-filter-span">{{ $t('Report.Title.Time') }}</span>
          <date-region-picker
            id="tid_report-time-picker"
            ref="dateSelect"
            v-model:value="defaultDaterange"
            quick-pick="default"
            @date-change="onDateChange" />
        </a-col>
        <!-- filter user -->
        <a-col v-if="access != 'staff'" :span="24" style="margin-top: 20px; display: flex">
          <span class="report-consume-filter-span">{{ $t('Report.Label.User') }}</span>
          <multi-user-selector
            id="tid_job-manage-filter-user"
            ref="multiUserSelector"
            style="width: 400px"
            bind-property="username"
            :placeholder="$t('Select.All')"
            :users-value="[]"
            :users-type="'username'"
            :filter-type="filterType"
            :allable="true"
            :clearable="true"
            @change="userSelectionChange" />
        </a-col>
      </a-row>
      <hr class="halving-line" style="width: 100%; margin: 20px 0" />
      <!-- filter button -->
      <span class="report-consume-filter-span" />
      <a-button type="primary" :disabled="disabled || loading" style="margin-right: 20px" @click="onPreview">
        {{ $t('Report.Button.Preview') }}
      </a-button>
      <a-button :disabled="disabled || loading" @click="download()">
        {{ $t('Report.Button.Submit') }}
      </a-button>
    </a-row>

    <a-row v-if="isShowChart" class="" type="flex">
      <a-col :span="access == 'admin' ? 12 : 24" class="">
        <a-row>
          <a-col :span="access == 'admin' ? 24 : 12" class="p-10">
            <div class="b-w p-10">
              <!-- Resource chart -->
              <resource-chart ref="reportResourceChart" :data="innerData" />
            </div>
          </a-col>
          <a-col :span="access == 'admin' ? 24 : 12" class="p-10">
            <div class="b-w p-10">
              <!-- Queue chart -->
              <queue-chart ref="reportQueueChart" :data="innerData" />
            </div>
          </a-col>
        </a-row>
      </a-col>
      <!-- Ranking chart -->
      <a-col v-if="access == 'admin'" :span="12" class="p-10" style="height: 100%">
        <ranking-chart ref="rankingChart" class="b-w p-10" :data="rankingData" />
      </a-col>
    </a-row>
    <!-- Statement of expenses chart -->
    <a-row v-if="isShowChart" class="b-w m-10 p-20">
      <expenses-statement ref="expensesStatement" :data="innerData" />
    </a-row>
    <div v-if="isNoData" class="consume-nodata b-w m-10 p-20">
      <div style="margin-top: 100px">
        <img src="/static/img/system/main/nodata.png" />
      </div>
      <p style="color: rgb(204, 204, 204); font-size: 16px">
        {{ $t('No.Data') }}
      </p>
    </div>
    <report-dialog ref="ReportDialog" :export-list="['csv']" />
  </div>
</template>
<script>
import ConsumeService from '@/service/report-consume'
import DateRegionPicker from '@/component/date-region-picker.vue'
import UserSelect from '@/widget/multi-user-selector.vue'
import RankingChart from './report-consume/ranking-chart.vue'
import QueueChart from './report-consume/report-queue-chart.vue'
import ResourceChart from './report-consume/report-resource-chart.vue'
import ExpensesStatement from './report-consume/expenses-statement-chart.vue'
import ReportDialog from './report/report-dialog.vue'
import Format from '@/common/format'

export default {
  components: {
    'report-dialog': ReportDialog,
    'date-region-picker': DateRegionPicker,
    'multi-user-selector': UserSelect,
    'resource-chart': ResourceChart,
    'queue-chart': QueueChart,
    'expenses-statement': ExpensesStatement,
    'ranking-chart': RankingChart,
  },
  data() {
    return {
      access: this.$store.state.auth.access,
      innerData: false,
      rankingData: false,
      defaultDaterange: ['', ''],
      users: [],
      filterType: 'username,billinggroup',
      filter: {
        values: [],
        value_type: 'username',
      },
      filterDate: [],
      loading: false,
    }
  },
  computed: {
    isNoData() {
      return this.innerData.length <= 0
    },
    isShowChart() {
      return !this.loading && Boolean(this.innerData.length > 0 || this.rankingData)
    },
    disabled() {
      return Boolean(!(this.filterDate[0] && this.filterDate[1]))
    },
  },
  mounted() {
    this.filterDate = this.defaultDaterange
    // this.onPreview();
  },
  methods: {
    getConsumeData() {
      ConsumeService.getExpensesStatement(this.filter, this.filterDate, this.access)
        .then(
          res => {
            this.innerData = res
          },
          err => {
            this.$message.error(err)
          },
        )
        .finally(() => {
          this.loading = false
        })
    },
    getRankingData() {
      ConsumeService.getUsersRanking(this.filter, this.filterDate, this.access)
        .then(
          res => {
            this.rankingData = res
          },
          err => {
            this.$message.error(err)
          },
        )
        .finally(() => {
          this.loading = false
        })
    },
    onPreview() {
      this.loading = true
      this.getConsumeData()
      if (this.access !== 'staff') {
        this.getRankingData()
      }
    },
    download() {
      const data = {
        target: 'expense',
        start_time: new Date(this.filterDate[0]).valueOf(),
        end_time: new Date(this.filterDate[1]).valueOf(),
        filter: this.filter,
      }
      this.$refs.ReportDialog.download(data, 'report-expense').then(
        res => {
          // window.open(res);
        },
        res => {},
      )
    },
    onDateChange(val) {
      this.innerData = false
      this.rankingData = false
      this.filterDate = val
    },
    userSelectionChange(val) {
      this.innerData = false
      this.rankingData = false
      this.filter = {
        values: val.values,
        value_type: val.value_type,
      }
    },
  },
}
</script>
<style>
.report-consume-filter-span {
  line-height: 32px;
  text-align: right;
  display: inline-block;
  width: 140px;
  padding-right: 20px;
}
.report-consume-filter-hr {
  border-bottom: 1px dashed #eee;
}
.consume-nodata {
  text-align: center;
  height: 400px;
  /* margin-top: 100px; */
}
</style>
