<template>
  <div>
    <CompositeTable
      id="tid_nodel-process-table"
      ref="processTable"
      row-key="pid"
      :columns="columns"
      :table-data="tableData"
      :search-enable="true"
      :search-props="searchProps"
      :selection-enable="true"
      :page-sizes="['10', '20', '40', '50']"
      :page-size="20"
      @selection-change="onTableSelectionChange">
      <div slot="controller" class="process-controller">
        <a-select
          v-model="selectedSchedulerIds"
          class="schedulerid-select"
          allow-clear
          show-search
          :show-arrow="true"
          :placeholder="$t('Monitor.Process.SchedulerId.Placeholder')"
          @change="filterSchedulerId">
          <a-select-option v-for="item in schedulerOptions" :key="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
        <a-button :disabled="!hasSchedelerId()" class="cancel-job-button" @click="cancelJobs">
          {{ $t('Monitor.Process.Action.CancelJob') }}
        </a-button>
        <a-button
          v-if="processKillable"
          :disabled="!selectedProcesses.length"
          class="kill-process-button"
          @click="killProcesses">
          {{ $t('Monitor.Process.Action.KillProcess') }}
        </a-button>
        <a-switch v-model="autoReFresh" size="small" class="switch-refresh" :loading="loading" />
        <span v-if="autoReFresh" class="refresh-text">{{
          loading
            ? $t('Monitor.Cluster.Refreshing')
            : $t('Monitor.Cluster.Refresh.Seconds.Tips', { number: reFreshSeconds })
        }}</span>
        <span v-else class="refresh-text">{{
          loading ? $t('Monitor.Cluster.Refreshing') : $t('Monitor.Cluster.AutoRefresh')
        }}</span>
        <a-button
          :disabled="loading"
          class="fresh-button"
          style="margin-left: 10px"
          @click="switchAutoReFresh('manual')">
          {{ $t('Monitor.Cluster.Refresh') }}
        </a-button>
      </div>
      <template slot="schedulerId" slot-scope="{ row, schedulerId }">
        <a v-if="schedulerId !== '-'" href="javascript:;" class="el-button--wrap" @click="onSchedulerIdClick(row)">{{
          schedulerId
        }}</a>
        <span v-else>{{ schedulerId }}</span>
      </template>
      <template slot="gpu" slot-scope="{ row }">
        <span v-if="!row.gpus.length">-</span>
        <a-popover v-else placement="right" overlay-class-name="gpu-detail">
          <template slot="content">
            <p class="gpu-detail-title">GPU</p>
            <div v-for="gpu in row.gpus" :key="gpu.index" class="gpu-detail-item">
              <p class="gpu-detail-item-self">
                <span>{{ `#${gpu.index} ${gpu.type}` }}</span>
                <span>{{ `${gpu.util}%` }}</span>
              </p>
              <p v-for="mig in gpu.migDevs" :key="mig.index" class="gpu-detail-mig-item">
                <span>{{ `#${mig.index} ${mig.type}` }}</span>
                <span>{{ `${mig.util}%` }}</span>
              </p>
            </div>
          </template>
          <a href="javascript:;">{{ getMultiGPUValue(row.gpus) }}</a>
        </a-popover>
      </template>
    </CompositeTable>
    <JobActionDialog ref="jobActionDialog" />
    <a-modal
      :visible="showJobSchedulerInfo"
      :footer="null"
      :title="$t('JobManage.JobSchedulerInfo.Title')"
      @cancel="showJobSchedulerInfo = false">
      <a-input type="textarea" :auto-size="{ maxRows: 10 }" read-only :value="jobSchedulerInfo" style="resize: none" />
    </a-modal>
  </div>
</template>

<script>
import CompositeTable from '../../component/composite-table'
import JobActionDialog from '../../widget/job-action-dialog'
import ProcessService from '../../service/process'
import AccessService from '../../service/access'
import JobService from '../../service/job'
export default {
  components: {
    CompositeTable,
    JobActionDialog,
  },
  props: ['nodeId', 'isGpus'],
  data() {
    const arch = AccessService.getSchedulerArch()
    let columns = [
      {
        title: this.$t('Monitor.Process.Id'),
        dataIndex: 'pid',
        sorter: true,
        show: true,
      },
      {
        title: this.$t('Monitor.Process.User'),
        dataIndex: 'user',
        sorter: true,
        show: true,
      },
      {
        title: this.$t('Monitor.Process.JobName'),
        dataIndex: 'jobName',
        sorter: true,
        show: true,
        ellipsis: true,
      },
      {
        title: this.$t('Monitor.Process.SchedulerId'),
        dataIndex: 'schedulerId',
        sorter: true,
        show: arch === 'host',
        scopedSlots: {
          customRender: 'schedulerId',
        },
      },
      {
        title: this.$t('Monitor.Process.CPU'),
        dataIndex: 'cpu',
        sorter: true,
        defaultSortOrder: 'descend',
        show: true,
        customRender: val => val + '%',
      },
      {
        title: this.$t('Monitor.Process.Memory'),
        dataIndex: 'memory',
        sorter: true,
        show: true,
        customRender: val => val + '%',
      },
      {
        title: this.$t('Monitor.Process.GPU'),
        dataIndex: 'gpu',
        sorter: function (a, b) {
          let preVal = 0
          let nextVal = 0
          if (a.gpu !== '-') {
            for (const el in a.gpu) {
              const value = a.gpu[el]
              preVal += value
            }
          }
          if (b.gpu !== '-') {
            for (const el in b.gpu) {
              const value = b.gpu[el]
              nextVal += value
            }
          }
          return preVal - nextVal
        },
        show: this.isGpus,
        scopedSlots: { customRender: 'gpu' },
      },
      {
        title: this.$t('Monitor.Process.Runtime'),
        dataIndex: 'runTime',
        sorter: (a, b) => {
          const preVal = a.runTime.replace(/:|-/g, '') - 0
          const nextVal = b.runTime.replace(/:|-/g, '') - 0
          return preVal - nextVal
        },
        show: true,
      },
      {
        title: this.$t('Monitor.Process.RunProgram'),
        dataIndex: 'runProgram',
        ellipsis: true,
        show: true,
      },
    ]
    columns = columns.filter(el => el.show)
    return {
      arch,
      columns,
      searchProps: ['pid', 'user', 'jobName', 'schedulerId', 'runProgram'],
      selectedProcesses: [],
      schedulerOptions: [],
      sourceTableData: [],
      tableData: [],
      selectedSchedulerIds: [],
      autoReFresh: false,
      loading: false,
      reFreshSeconds: 30,
      reFreshTimer: null,
      showJobSchedulerInfo: false,
      jobSchedulerInfo: '',
      processKillable: false,
    }
  },
  watch: {
    autoReFresh(val, oldVal) {
      this.switchAutoReFresh(val)
    },
  },
  created() {
    ProcessService.getAllowKillProcess().then(
      res => {
        this.processKillable = res
      },
      err => {
        this.$message.error(err)
      },
    )
  },
  mounted() {
    this.autoReFresh = true
  },
  beforeDestroy() {
    clearTimeout(this.reFreshTimer)
  },
  methods: {
    getMultiGPUValue(val) {
      let value = null
      for (const el in val) {
        const itemValue = Number.isNaN(Number(val[el].util)) ? 0 : Number(val[el].util)
        value += itemValue
      }
      return value + '%'
    },
    onTableSelectionChange(val) {
      this.selectedProcesses = val
    },
    cancelJobs() {
      const jobsName = []
      const jobsId = []
      this.selectedProcesses.forEach(el => {
        if ((el.jobId === 0 || el.jobId) && jobsId.indexOf(el.jobId) === -1) {
          jobsName.push(el.name)
          jobsId.push(el.jobId)
        }
      })
      if (jobsName.length < 1) {
        this.$message.warning(this.$t('Node.Process.Cancel.Tips'))
        return false
      }
      this.$refs.jobActionDialog
        .doBatchCancel({ name: jobsName, id: jobsId })
        .then(
          res => {},
          _ => {},
        )
        .finally(() => {
          this.selectedProcesses = []
          this.$refs.processTable.selectionIndex = []
          this.refreshTable()
        })
    },
    killProcesses() {
      const pids = []
      let existJob = false
      this.selectedProcesses.forEach(el => {
        if (el.schedulerId === '-') {
          pids.push(el.pid)
        } else {
          existJob = true
        }
      })
      if (pids.length < 1) {
        this.$warning({
          content: this.$t('Monitor.Process.Kill.Tips'),
          okText: this.$t('Action.Confirm'),
        })
        return false
      }
      this.$confirm({
        title: existJob
          ? this.$t('Monitor.Process.Kill.Tips') + this.$t('Monitor.Process.Kill.Title')
          : this.$t('Monitor.Process.Kill.Title'),
        content: this.$t('Monitor.Process.Id') + ': ' + pids.join(','),
        okText: this.$t('Action.Confirm'),
        cancelText: this.$t('Action.Cancel'),
        onOk: () => {
          ProcessService.killProcesses(this.nodeId, pids)
            .then(
              res => {
                this.$message.success(this.$t('Monitor.Process.Kill.Success'))
              },
              err => {
                this.$message.error(err)
              },
            )
            .finally(() => {
              this.selectedProcesses = []
              this.$refs.processTable.selectionIndex = []
              this.refreshTable()
            })
        },
      })
    },
    setSchedulerOptions() {
      const schedulerIds = []
      this.schedulerOptions = []
      this.tableData.forEach(el => {
        if (el.schedulerId !== '-') {
          schedulerIds.push(el.schedulerId)
        }
      })
      const filteData = [...new Set(schedulerIds)]
      filteData.forEach(el => {
        this.schedulerOptions.push({
          value: el,
          label: el,
        })
      })
    },
    hasSchedelerId() {
      for (let i = 0; i < this.selectedProcesses.length; i++) {
        if (this.selectedProcesses[i].schedulerId !== '-') {
          return true
        }
      }
      return false
    },
    filterSchedulerId(val) {
      if (val && val.length) {
        this.tableData = this.sourceTableData.filter(el => {
          return val.includes(el.schedulerId)
        })
      } else {
        this.tableData = this.sourceTableData
      }
    },
    switchAutoReFresh(val) {
      const that = this
      clearTimeout(this.reFreshTimer)
      this.reFreshSeconds = 5
      if (!val) return
      this.loading = true
      ProcessService.getNodeProcesses(this.nodeId).then(
        res => {
          this.loading = false
          this.sourceTableData = res
          this.tableData = [...this.sourceTableData]
          this.setSchedulerOptions()
          this.filterSchedulerId(this.selectedSchedulerIds)
          if (this.autoReFresh) {
            this.reFreshTimer = setTimeout(function fresh() {
              that.reFreshSeconds--
              if (that.reFreshSeconds <= 0) {
                that.switchAutoReFresh(true)
              } else {
                that.reFreshTimer = setTimeout(fresh, 1000)
              }
            }, 1000)
          }
        },
        err => {
          this.loading = false
          this.autoReFresh = false
          this.$message.error(err)
        },
      )
    },
    refreshTable() {
      if (this.autoReFresh) {
        this.switchAutoReFresh(true)
      } else {
        this.loading = true
        ProcessService.getNodeProcesses(this.nodeId)
          .then(
            res => {
              this.sourceTableData = res
              this.tableData = [...this.sourceTableData]
              this.setSchedulerOptions()
              this.filterSchedulerId(this.selectedSchedulerIds)
            },
            err => {
              this.$message.error(err)
            },
          )
          .finally(() => {
            this.loading = false
          })
      }
    },
    onSchedulerIdClick(job) {
      JobService.getJobSchedulerInfo(job.jobId).then(
        res => {
          this.jobSchedulerInfo = res
          this.showJobSchedulerInfo = true
        },
        res => {
          this.$message.error(res)
        },
      )
    },
  },
}
</script>

<style scoped>
.schedulerid-select {
  width: 240px;
}
.process-controller {
  display: flex;
  align-items: center;
}
.schedulerid-select,
.cancel-job-button,
.kill-process-button,
.switch-refresh {
  margin-right: 10px;
}
.gpu-detail .gpu-detail-title {
  margin-bottom: 10px;
}
.gpu-detail .gpu-detail-item {
  /* display: flex; */
  /* justify-content: space-between; */
  width: 250px;
  /* margin-bottom: 6px; */
}
.gpu-detail .gpu-detail-item p {
  display: flex;
  justify-content: space-between;
  /* width: 250px; */
  margin-bottom: 6px;
}
.gpu-detail .gpu-detail-mig-item {
  text-indent: 1.5em;
}
.gpu-detail .gpu-detail-item:last-child {
  margin-bottom: 0;
}
.refresh-text {
  white-space: nowrap;
}
</style>
