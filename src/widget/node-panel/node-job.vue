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
      <template #name="{ row }">
        <a-popover placement="right">
          <template #content>
            <p class="job-name">
              {{ row.name }}
            </p>
          </template>
          <span class="ellipsis-container">{{ row.name }}</span>
        </a-popover>
      </template>
      <template #schedulerId="{ row, schedulerId }">
        <a href="javascript:;" class="el-button--wrap" @click="onSchedulerIdClick(row)">{{ schedulerId }}</a>
      </template>
      <template #action="{ row }">
        <a-dropdown :trigger="['click']" placement="bottomLeft">
          <a-button>
            {{ $t('Action') }}
            <down-outlined />
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="onViewProcessClick(row)">
                {{ $t('Monitor.Process.Action.ViewProcess') }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </composite-table>
    <a-modal
      :open="showJobSchedulerInfo"
      :footer="null"
      :title="$t('JobManage.JobSchedulerInfo.Title')"
      @cancel="showJobSchedulerInfo = false">
      <a-textarea :auto-size="{ maxRows: 10 }" read-only :value="jobSchedulerInfo" style="resize: none" />
    </a-modal>
  </div>
</template>
<script>
import Format from '@/common/format'
import JobService from '@/service/job'
import CompositeTable from '@/component/composite-table.vue'

export default {
  components: {
    'composite-table': CompositeTable,
  },
  props: ['nodeId', 'isGpus'],
  emits: ['view-process'],
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
          customSlot: true,
        },
        {
          title: this.$t('Job.SchedulerId'),
          dataIndex: 'schedulerId',
          sorter: true,
          customSlot: true,
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
          customRender: ({ text }) => text + ' ' + this.$t('Job.Cpu.Cores'),
        },
        {
          title: this.$t('Job.BeginTime.running'),
          dataIndex: 'beginTime',
          sorter: true,
          customRender: ({ text }) => Format.formatDateTime(text),
        },
        {
          title: this.$t('Action'),
          key: 'action',
          customSlot: true,
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
