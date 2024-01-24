<template>
  <div v-if="showBuildJobs">
    <a-form class="bordering">
      <p class="building-job-title">{{ $t('Softwares.Monitor.Title') }}</p>
      <a-spin :spinning="loading">
        <composite-table
          ref="buildJobs"
          :columns="columns"
          :search-enable="false"
          :table-data="buildJobs"
          :pagination-enable="false"
          :controller-header-enable="false">
          <template #name="{ row, name }">
            <a-popover placement="right">
              <template #content>
                <p class="job-name">{{ name }}</p>
              </template>
              <a href="javascript:;" class="ellipsis-container" @click="onDetailClick(row)">{{
                jobNameFormat(name)
              }}</a>
            </a-popover>
          </template>
          <template #status="{ row, status }">
            <job-status-label :status="status" :operate-status="row.operateStatus" />
          </template>
          <template #action="{ row }">
            <a-dropdown :trigger="['click']">
              <template #overlay>
                <a-menu>
                  <a-menu-item style="white-space: nowrap" @click="viewLog(row)">
                    {{ $t('Action.ViewLog') }}
                  </a-menu-item>
                  <a-menu-item v-if="row.statusType !== 'finished'" style="white-space: nowrap" @click="doCancel(row)">
                    {{ $t('Action.Cancel') }}
                  </a-menu-item>
                  <a-menu-item style="white-space: nowrap" @click="doClear(row)">{{ $t('Action.Clear') }}</a-menu-item>
                </a-menu>
              </template>
              <a-button style="margin-left: 8px">
                {{ $t('Action') }}
                <DownOutlined />
              </a-button>
            </a-dropdown>
          </template>
        </composite-table>
      </a-spin>
    </a-form>
    <build-log-dialog ref="buildLogDialog" :log-path="logPath" />
    <build-action-dialog ref="buildActionDialog" />
  </div>
</template>
<script>
import JobStatusLabel from '@/widget/job-status-label.vue'
import SoftwaresService from '@/service/softwores'
import CompositeTable from '@/component/composite-table.vue'
import BuildLogDialog from './build-log-dialog.vue'
import BuildActionDialog from './build-action-dialog.vue'
export default {
  components: {
    CompositeTable,
    JobStatusLabel,
    BuildLogDialog,
    BuildActionDialog,
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('Softwares.Monitor.SoftwareName'),
          dataIndex: 'softwareName',
          align: 'left',
        },
        {
          title: this.$t('Job.Name'),
          dataIndex: 'name',
          align: 'left',
          customSlot: true,
        },
        {
          title: this.$t('Job.SchedulerId'),
          dataIndex: 'schedulerId',
          align: 'left',
        },
        {
          title: this.$t('Job.Status'),
          dataIndex: 'status',
          align: 'left',
          customSlot: true,
        },
        {
          title: this.$t('Action'),
          key: 'action',
          width: 120,
          customSlot: true,
          defaultSortOrder: 'ascend',
        },
      ],
      buildJobs: [],
      showBuildJobs: false,
      loading: true,
      logPath: '',
      refreshId: 0,
    }
  },
  mounted() {
    this.getBuildingJobCount()
  },
  beforeUnmount() {
    if (this.refreshId > 0) {
      clearTimeout(this.refreshId)
    }
  },
  methods: {
    getBuildingJobCount() {
      SoftwaresService.getSoftwareJobCount().then(
        res => {
          if (res.total > 0) {
            this.showBuildJobs = true
            this.fetchBuildingJob(true)
          } else {
            this.showBuildJobs = false
          }
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    fetchBuildingJob(loading = false) {
      if (this.refreshId > 0) {
        clearTimeout(this.refreshId)
      }

      if (loading) {
        this.loading = true
      }

      SoftwaresService.getJobMonitoringData().then(
        res => {
          this.loading = false
          if (res.length) {
            this.showBuildJobs = true
            this.buildJobs = res
          } else {
            this.showBuildJobs = false
            this.buildJobs = []
          }
          this.refreshId = setTimeout(() => {
            this.fetchBuildingJob()
          }, 1000 * 30)
        },
        err => {
          clearTimeout(this.refreshId)
          this.$message.error(err)
        },
      )
    },
    viewLog(row) {
      this.logPath = row.logPath
      this.$refs.buildLogDialog.open()
    },
    doCancel(row) {
      this.$refs.buildActionDialog.doCancel(row).then(
        res => {
          this.fetchBuildingJob(true)
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    doClear(row) {
      this.$refs.buildActionDialog.doClear(row).then(
        res => {
          this.fetchBuildingJob(true)
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    jobNameFormat(name) {
      if (!name) {
        return this.$t('NoName')
      }
      return name
    },
    onDetailClick(row) {
      this.$router.push({ path: '/main/job/' + row.jobId })
    },
  },
}
</script>
<style scoped>
.bordering {
  padding: 5px;
  border: 1px solid #eee;
}
.building-job-title {
  padding: 5px;
  font-weight: 500;
}
.job-name {
  font-size: 14px;
  color: #333;
}
.ellipsis-container {
  max-width: 100%;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
</style>
