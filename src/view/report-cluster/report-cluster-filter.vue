<template>
  <a-row>
    <a-col :span="24" style="display: flex">
      <span class="report-cluster-filter-span">{{ $t('Report.Filter.Time') }}</span>
      <date-region-picker
        id="tid_report-time-picker"
        ref="dateSelect"
        v-model:value="defaultDaterange"
        quick-pick="default"
        @date-change="onDateChange" />
    </a-col>
    <a-col :lg="12" :md="24" class="m-t-20" style="display: flex">
      <span class="report-cluster-filter-span">{{ $t('Report.Filter.User') }}</span>
      <multi-user-selector
        id="tid_report-filter-user"
        ref="multiUserSelector"
        style="width: 375px"
        bind-property="username"
        :placeholder="$t('Select.All')"
        :users-value="[]"
        :users-type="'username'"
        :filter-type="filterUserType"
        :allable="true"
        :clearable="true"
        @change="userSelectionChange" />
    </a-col>
    <a-col v-if="arch == 'host'" :lg="12" :md="24" class="m-t-20">
      <span class="report-cluster-filter-span">{{ $t('Report.Filter.Queue') }}</span>
      <multi-queue-selector
        id="tid_report-filter-queue"
        v-model:value="filterQueue.values"
        :placeholder="$t('Select.All')" />
    </a-col>
    <a-col :span="24" class="m-t-20" style="display: inline-block; line-height: 32px">
      <span class="report-cluster-filter-span">{{ $t('Report.Filter.WaitingTime') }}</span>
      <a-input
        v-model:value="waitingTime"
        style="width: 200px"
        :addon-after="$t('Report.Filter.WaitingTime.Unit')"
        @blur="onWaitingTime" />
      <a-popover placement="right" trigger="hover" width="350" :content="$t('Report.Filter.WaitingTime.Help')">
        <QuestionCircleOutlined class="cluster-report-waitingTime-help" style="color: #1890ff" />
      </a-popover>
    </a-col>
    <a-col :span="24">
      <hr class="halving-line" style="width: 100%; margin: 20px 0" />
      <div>
        <span class="report-cluster-filter-span" />
        <a-button type="primary" :disabled="disabled || loading" @click="onPreviewClick">
          {{ $t('Report.Button.Preview') }}
        </a-button>
      </div>
    </a-col>
  </a-row>
</template>
<script>
import AccessService from '@/service/access'
import DateRegionPicker from '@/component/date-region-picker.vue'
import UserSelect from '@/widget/multi-user-selector.vue'
import QueueSelect from '@/widget/multi-queue-selector.vue'

export default {
  components: {
    'date-region-picker': DateRegionPicker,
    'multi-user-selector': UserSelect,
    'multi-queue-selector': QueueSelect,
  },
  props: ['noData', 'loading'],
  emits: ['input', 'update:value', 'filter-change'],
  data() {
    const arch = AccessService.getSchedulerArch()
    return {
      arch,
      defaultDaterange: ['', ''],
      filterDate: [],
      filterUserType: arch === 'host' ? 'username,billinggroup' : 'username',
      filterUser: {
        values: [],
        value_type: 'username',
      },
      filterQueue: {
        values: [],
        type: 'in',
      },
      waitingTime: 0,
    }
  },
  computed: {
    disabled() {
      return !(this.filterDate[0] && this.filterDate[1])
    },
  },
  watch: {
    waitingTime(val, oldVal) {
      this.$emit('filter-change')
    },
    'filterQueue.values': function (val, oldVal) {
      this.$emit('filter-change')
    },
  },
  mounted() {},
  methods: {
    onWaitingTime(val) {
      if (this.waitingTime === '' || isNaN(this.waitingTime)) {
        this.waitingTime = 0
      } else {
        this.waitingTime = parseInt(this.waitingTime)
        if (this.waitingTime < 0) {
          this.waitingTime = 0
        }
      }
    },
    onDateChange(val) {
      this.$emit('filter-change')
      this.filterDate = val
    },
    userSelectionChange(val) {
      this.$emit('filter-change')
      this.filterUser = {
        values: val.values,
        value_type: val.value_type,
      }
    },
    onPreviewClick() {
      this.$emit('input', {
        date: this.filterDate,
        user: this.filterUser,
        queue: this.filterQueue,
        waitingTime: this.waitingTime,
      })
      this.$emit('update:value', {
        date: this.filterDate,
        user: this.filterUser,
        queue: this.filterQueue,
        waitingTime: this.waitingTime,
      })
    },
  },
}
</script>
<style>
.report-cluster-filter-span {
  line-height: 32px;
  padding-right: 20px;
  text-align: right;
  display: inline-block;
  width: 180px;
  flex-shrink: 0;
}
.cluster-report-waitingTime-help {
  /* color: #e8e8e8; */
  font-size: 16px;
  line-height: 32px;
  margin-left: 10px;
}
</style>
