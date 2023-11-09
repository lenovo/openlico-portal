<template>
  <div class="dashboard-monitor height--100 p-10">
    <a-row v-if="initOverData" id="tid_dashboard-node-hardware" class="m-b-20" :gutter="[20]">
      <a-col v-for="item in initOverData.hardware" :key="item.type" :sm="24" :md="12" :lg="12" :xl="6" flex>
        <div class="cell-card p-10 b-w" style="display: flex">
          <node-hardware :data="item"></node-hardware>
          <node-hardware v-if="item.groupData" :data="item.groupData"></node-hardware>
        </div>
      </a-col>
    </a-row>
    <a-row :gutter="[20]">
      <a-col :sm="24" :md="24" :lg="24" :xl="18">
        <a-row v-if="showNodeStatue" :gutter="[20, 20]" class="m-b-20">
          <a-col :sm="24" :md="12" :lg="12" :xl="8">
            <a-spin :spinning="!initOverData">
              <node-status :node="initOverData" :style="{ height: isScheduler ? '230px' : '530px' }"></node-status>
            </a-spin>
          </a-col>
          <a-col :sm="24" :md="12" :lg="12" :xl="16">
            <a-spin :spinning="!initOverData">
              <node-group-status
                :init-data="initOverData"
                :style="{ height: isScheduler ? '230px' : '530px' }"></node-group-status>
            </a-spin>
          </a-col>
        </a-row>
        <a-row v-if="isScheduler" :gutter="[20, 20]" class="m-b-20">
          <a-col :sm="24" :md="12" :lg="12" :xl="8">
            <a-spin :spinning="!initJobListData">
              <job-list
                :init-data="initJobListData"
                :status="jobListDefalut"
                :style="{ height: showNodeStatue ? '280px' : '570px' }"
                @on-status-change="onJobListChange"></job-list>
            </a-spin>
          </a-col>
          <a-col :sm="24" :md="12" :lg="12" :xl="16">
            <a-spin :spinning="!initJobListData">
              <job-chart
                :init-data="initJobChartData"
                :style="{ height: showNodeStatue ? '280px' : '570px' }"
                @on-job-time-change="onJobTimeChange"
                @on-job-queue-change="onJobQueueChange"></job-chart>
            </a-spin>
          </a-col>
        </a-row>
      </a-col>
      <a-col :sm="24" :md="24" :lg="24" :xl="6">
        <a-spin :spinning="(role != 'staff' && !initMessageData) || (role == 'staff' && !initTemplateData)">
          <div class="p-20 b-w" style="height: 530px">
            <dashboard-message
              v-if="role != 'staff' && initMessageData"
              :init-data="initMessageData"
              :arch="arch"></dashboard-message>
            <dashboard-template
              v-if="role == 'staff' && initTemplateData"
              :init-data="initTemplateData"></dashboard-template>
          </div>
        </a-spin>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import AccessService from '@/service/access'
import DashboardService from '@/service/dashboard-monitor'
import JobList from './dashboard/job-list.vue'
import JobChart from './dashboard/job-chart.vue'
import NodeStatus from './dashboard/node-status-chart.vue'
import NodeHardware from './dashboard/dashboard-node-hardware.vue'
import NodeGroupStatus from './dashboard/node-group-status-chart.vue'
import DashboardMessage from './dashboard/dashboard-message.vue'
import DashboardTemplate from './dashboard/dashboard-job-template.vue'

export default {
  components: {
    'job-list': JobList,
    'job-chart': JobChart,
    'node-status': NodeStatus,
    'node-hardware': NodeHardware,
    'node-group-status': NodeGroupStatus,
    'dashboard-message': DashboardMessage,
    'dashboard-template': DashboardTemplate,
  },
  data() {
    return {
      role: this.$store.state.auth.access,
      initOverData: null,
      initNodeGroupStatus: null,
      initJobListData: null,
      initJobChartData: null,
      initMessageData: null,
      initTemplateData: null,
      jobQueueDefalut: '',
      selectedTimeDefalut: 3600,
      jobListDefalut: 'running',
      refreshTimeout: null,
      refreshInterval: 15000,
      arch: AccessService.getSchedulerArch(),
      featureCodes: this.$store.state.auth.featureCodes,
    }
  },
  computed: {
    showNodeStatue() {
      return (
        this.role !== 'staff' &&
        AccessService.getMatchFeatureCodes(['sc.host.*,monitor.cluster'], this.featureCodes).length > 0
      )
    },
    isScheduler() {
      return AccessService.getMatchFeatureCodes(['monitor.scheduler'], this.featureCodes).length > 0
    },
  },
  mounted() {
    this.init()
  },

  beforeUnmount() {
    clearTimeout(this.refreshTimeout)
  },
  methods: {
    init() {
      DashboardService.getDashboardOverview().then(res => {
        this.initOverData = res
        if (!this.refreshTimeout) {
          this.refresh()
        }
      })
      this.getMessage()
      this.getTemolateRecent()
      this.getJoblist()
      this.getJobChart()
    },
    getJobChart() {
      DashboardService.getDashboardJobChart(this.selectedTimeDefalut, this.jobQueueDefalut, this.role).then(res => {
        this.initJobChartData = res
        if (!this.refreshTimeout) {
          this.refresh()
        }
      })
    },
    getJoblist() {
      const status = this.jobListDefalut.toLowerCase()
      DashboardService.getDashboardJobList(5, status, this.role).then(res => {
        this.initJobListData = res
        if (!this.refreshTimeout) {
          this.refresh()
        }
      })
    },
    getMessage() {
      if (this.role === 'staff') return
      DashboardService.getDashboardMessages(5).then(res => {
        this.initMessageData = res
        if (!this.refreshTimeout) {
          this.refresh()
        }
      })
    },
    getTemolateRecent() {
      if (this.role !== 'staff') return
      DashboardService.getUserLatestTemplate().then(res => {
        this.initTemplateData = res
        if (!this.refreshTimeout) {
          this.refresh()
        }
      })
    },
    onJobListChange(val) {
      this.jobListDefalut = val
      this.getJoblist()
    },
    onJobQueueChange(val) {
      this.jobQueueDefalut = val
      this.getJobChart()
    },
    onJobTimeChange(val) {
      this.selectedTimeDefalut = val
      this.getJobChart()
    },
    refresh() {
      this.refreshTimeout = setTimeout(() => {
        this.refreshTimeout = null
        this.init()
      }, this.refreshInterval)
    },
  },
}
</script>

<style scoped>
.ant-row {
  width: auto;
}
.dashboard-monitor :deep(.dashboard-card-title) {
  font-weight: 400;
}
</style>
