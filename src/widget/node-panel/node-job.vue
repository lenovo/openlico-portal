<template>
  <div>
    <composite-table
      id="tid_nodel-job-table"
      ref="jobTable"
      row-key="id"
      :columns="columns"
      :table-data-fetcher="tableDataFetcher"
      :page-sizes="['5', '10', '20', '50']"
      :page-size="5"
      :controller-header-enable="false"
      :auto-refresh="15 * 1000">
      <template slot="name" slot-scope="{ row }">
        <a-popover placement="right">
          <template slot="content">
            <p class="job-name">
              {{ row.name }}
            </p>
          </template>
          <span class="ellipsis-container">{{ row.name }}</span>
        </a-popover>
      </template>
      <template slot="schedulerId" slot-scope="{ row, schedulerId }">
        <a href="javascript:;" class="el-button--wrap" @click="onSchedulerIdClick(row)">{{ schedulerId }}</a>
      </template>
      <a-dropdown slot="action" slot-scope="{ row }" :trigger="['click']" placement="bottomLeft">
        <a-button>
          {{ $t('Action') }}
          <a-icon type="down" />
        </a-button>
        <a-menu slot="overlay">
          <a-menu-item @click="onViewProcessClick(row)">
            {{ $t('Monitor.Process.Action.ViewProcess') }}
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </composite-table>
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
import Format from '../../common/format'
import JobService from '../../service/job'
import CompositeTable from '../../component/composite-table'

export default {
  components: {
    'composite-table': CompositeTable,
  },
  props: ['nodeId', 'isGpus'],
  data() {
    return {
      tableDataFetcher: JobService.getRunningJobsTableDataFetcher(this.nodeId),
      columns: [
        {
          title: this.$t('ID'),
          dataIndex: 'id',
          sorter: true,
          width: 100,
          defaultSortOrder: 'ascend',
        },
        {
          title: this.$t('Name'),
          dataIndex: 'name',
          sorter: true,
          ellipsis: true,
          scopedSlots: { customRender: 'name' },
        },
        {
          title: this.$t('Job.SchedulerId'),
          dataIndex: 'schedulerId',
          sorter: true,
          scopedSlots: {
            customRender: 'schedulerId',
          },
        },
        {
          title: this.$t('Job.SubmitUser'),
          dataIndex: 'submitUser',
          sorter: true,
        },
        {
          title: this.$t('Job.Queue'),
          dataIndex: 'queue',
          sorter: true,
          width: 100,
        },
        {
          title: this.$t('Job.Cpu'),
          dataIndex: 'usedCores',
          sorter: true,
          customRender: val => val + ' ' + this.$t('Job.Cpu.Cores'),
        },
        {
          title: this.$t('Job.BeginTime.running'),
          dataIndex: 'beginTime',
          sorter: true,
          customRender: val => Format.formatDateTime(val),
        },
        {
          title: this.$t('Action'),
          scopedSlots: {
            customRender: 'action',
          },
        },
      ],
      showJobSchedulerInfo: false,
      jobSchedulerInfo: '',
    }
  },
  mounted() {
    if (this.isGpus) {
      this.columns.splice(6, 0, {
        title: this.$t('Job.Gpu'),
        dataIndex: 'usedGpus',
        sorter: true,
        width: 80,
      })
    }
  },
  methods: {
    onViewProcessClick(job) {
      this.$emit('view-process', job)
    },
    onSchedulerIdClick(job) {
      JobService.getJobSchedulerInfo(job.id).then(
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
.job-name {
  max-width: 260px;
  word-break: break-all;
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
