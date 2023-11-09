<template>
  <div class="height--100 p-10 job-manage-wrapper">
    <div class="job-tab b-w p-20">
      <a-row type="flex" justify="start" align="middle">
        <a-col :span="10">
          <span class="job-tab-span">{{ $t('JobManager.Filter.StatusType') }}</span>
          <a-radio-group
            id="tid_job-manage-filter-status"
            v-model:value="statusType"
            button-style="solid"
            @change="statusChange">
            <a-radio-button
              v-for="item in statusTypes"
              :id="'JobManager_Filter_' + item.label"
              :key="item.type"
              :value="item.type">
              {{ item.label }}
            </a-radio-button>
          </a-radio-group>
        </a-col>
        <a-col v-show="statusType == 'finished'" :span="14">
          <span class="job-tab-span">{{ $t('JobManager.Filter.Submission') }}</span>
          <a-radio-group
            id="tid_job-manage-filter-submission"
            v-model:value="defaultSubmitTime"
            button-style="solid"
            @change="submitTimeChangeAction">
            <a-radio-button :value="1">
              {{ $t('JobManager.SubmitTime.Month') }}
            </a-radio-button>
            <a-radio-button :value="3">
              {{ $T('JobManager.SubmitTime.Months', { value: 3 }) }}
            </a-radio-button>
            <a-radio-button :value="6">
              {{ $T('JobManager.SubmitTime.Months', { value: 6 }) }}
            </a-radio-button>
            <a-radio-button :value="0">
              {{ $t('JobManager.SubmitTime.All') }}
            </a-radio-button>
          </a-radio-group>
        </a-col>
      </a-row>
      <a-row class="job-tab-div" type="flex" justify="start" align="middle">
        <a-col :span="10" class="m-t-20">
          <span class="job-tab-span">{{ $t('JobManager.Filter.Queue') }}</span>
          <multi-queue-selector
            id="tid_job-manage-filter-queue"
            v-model:value="dataFilter.queue.values"
            class="default-select"
            :placeholder="$t('Select.All')"
            :clearable="true">
          </multi-queue-selector>
        </a-col>
        <a-col v-if="false" :span="14" class="m-t-20">
          <span class="job-tab-span">{{ $t('JobManager.Filter') }}</span>
          <a-select v-model:value="jobType" :placeholder="$t('Select.All')" class="default-select" allow-clear>
            <a-select-option value="hide-system">
              {{ $t('JobManager.Filter.HideSystemJob') }}
            </a-select-option>
            <a-select-option value="all">
              {{ $t('Select.All') }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col v-if="access != 'staff'" :span="14" class="m-t-20">
          <span class="job-tab-span">{{ $t('JobManager.Filter.SubmitUser') }}</span>
          <multi-user-selector
            id="tid_job-manage-filter-user"
            ref="multiUserSelector"
            class="default-select"
            :placeholder="$t('Select.All')"
            :users-value="[]"
            :users-type="'username'"
            :filter-type="filterType"
            :allable="true"
            :clearable="true"
            @change="changeValue" />
        </a-col>
        <a-col v-if="access == 'staff'" :span="14" class="m-t-20">
          <span class="job-tab-span">{{ $t('JobManager.Filter.Tags') }}</span>
          <a-select v-model:value="dataFilter.tag.values" mode="tags" style="width: 300px">
            <a-select-option v-for="tag in tagsOption" :key="tag" :value="tag">{{ tag }} </a-select-option>
          </a-select>
        </a-col>
      </a-row>
    </div>
    <div v-if="isHR" class="job-manage-hr"></div>
    <div style="height: 100%">
      <a-row class="">
        <a-col>
          <composite-table
            id="tid_job-mamange-table"
            ref="jobTable"
            class="table-style"
            :columns="columns"
            row-key="id"
            :table-data-fetcher="tableDataFetcher"
            :search-enable="true"
            :external-filter="dataFilter"
            :search-props="searchProps"
            :selection-enable="access == 'staff' || statusType !== 'finished'"
            :table-loading="loading"
            :auto-refresh="freshInterval"
            @loading-change="loadingChange"
            @selection-change="onTableSelectionChange">
            <template #controller>
              <ul class="composite-table-controller">
                <li>
                  <a-dropdown-button
                    v-if="access == 'staff'"
                    :disabled="!selectedJob.length"
                    class="job-tag-action"
                    @click="onAddTagsClick">
                    {{ $t('JobManager.Add.Tags') }}
                    <template #overlay>
                      <a-menu
                        @click="
                          ({ key }) => {
                            onTagsAction(key)
                          }
                        ">
                        <a-menu-item key="clear">{{ $t('JobManager.Clear.Tags') }}</a-menu-item>
                      </a-menu>
                    </template>
                    <template #icon>
                      <down-outlined />
                    </template>
                  </a-dropdown-button>
                </li>
                <li>
                  <a-button
                    v-if="(access === 'admin' || access === 'operator') && statusType === 'waiting'"
                    id="batch_priority_btn"
                    :disabled="!selectedJob.length"
                    @click="onPriorityClick()">
                    {{ $t('Action.Priority') }}
                  </a-button>
                </li>
                <li>
                  <a-button
                    v-if="statusType === 'running'"
                    id="batch_requeue_btn"
                    :disabled="!selectedJob.length"
                    @click="onRequeueClick()">
                    {{ $t('Action.Requeue') }}
                  </a-button>
                </li>
                <li>
                  <a-button
                    v-if="statusType === 'running' && access !== 'staff'"
                    id="batch_suspend_btn"
                    :disabled="!selectedJob.length"
                    @click="onSuspendClick()">
                    {{ $t('Action.Suspend') }}
                  </a-button>
                </li>
                <li>
                  <a-button
                    v-if="statusType === 'running' && access !== 'staff'"
                    id="batch_resume_btn"
                    :disabled="!selectedJob.length"
                    @click="onResumeClick()">
                    {{ $t('Action.Resume') }}
                  </a-button>
                </li>
                <li>
                  <a-button
                    v-if="statusType === 'waiting'"
                    id="batch_hold_btn"
                    :disabled="!selectedJob.length"
                    @click="onHoldClick()">
                    {{ $t('Action.Hold') }}
                  </a-button>
                </li>
                <li>
                  <a-button
                    v-if="statusType === 'waiting'"
                    id="batch_release_btn"
                    :disabled="!selectedJob.length"
                    @click="onReleaseClick()">
                    {{ $t('Action.Release') }}
                  </a-button>
                </li>
                <li>
                  <a-button
                    v-if="statusType !== 'finished'"
                    id="batch_cancel_btn"
                    :disabled="!selectedJob.length"
                    @click="onCancelClick()">
                    {{ $t('Action.Cancel') }}
                  </a-button>
                </li>
                <li>
                  <a-button
                    v-if="access === 'staff' && statusType === 'finished'"
                    id="batch_delete_btn"
                    :disabled="!selectedJob.length"
                    @click="onDeleteClick()">
                    {{ $t('Action.Delete') }}
                  </a-button>
                </li>
              </ul>
            </template>
            <template #name="{ row, name }">
              <span v-if="access == 'staff'" class="job-name-container">
                <a-popover placement="right">
                  <template #content>
                    <p class="job-name" :class="row.comment.length ? 'm-b-8' : ''">{{ row.name }}</p>
                    <p v-if="row.comment.length" class="job-comment">
                      {{ row.comment }}
                    </p>
                  </template>
                  <a href="javascript:;" class="el-button--wrap ellipsis-container" @click="onDetailClick(row)">{{
                    jobNameFormat(name)
                  }}</a>
                </a-popover>
              </span>
              <a-popover v-else placement="right">
                <template #content>
                  <p class="job-name">{{ row.name }}</p>
                </template>
                <span class="ellipsis-container">{{ jobNameFormat(name) }}</span>
              </a-popover>
            </template>
            <template #schedulerId="{ row, schedulerId }">
              <a
                v-if="statusType != 'finished'"
                href="javascript:;"
                class="el-button--wrap"
                @click="onSchedulerIdClick(row)"
                >{{ schedulerId }}</a
              >
              <span v-else>{{ schedulerId }}</span>
            </template>
            <template #status="{ row, status }">
              <job-status-label
                :arch="arch"
                :status="status"
                :operate-status="row.operateStatus"
                :ai-operate-status="row.aiOperateStatus">
              </job-status-label>
            </template>
            <template #tags="{ tags }">
              <job-tag-display :tags="tags" :display-count="1" :display-tag-length="10" />
            </template>
            <template #submitUser="{ row, submitUser }">
              <user-data-tooltip :username="submitUser">
                <a class="el-button--wrap" @click.prevent="onSubmitUserClick(row)">
                  {{ submitUser }}
                </a>
              </user-data-tooltip>
            </template>
            <template #action="{ row }">
              <a-dropdown :trigger="['click']" placement="bottomLeft" @open-change="onMenuVisible(row, $event)">
                <template #overlay>
                  <a-menu @click="({ key }) => onActionCommand(key, row)">
                    <template v-for="i in actionOptions">
                      <a-menu-item v-if="i.value != 'Browse'" :key="i.value" :disabled="i.value == 'NoAction'">
                        {{ i.label }}</a-menu-item
                      >
                    </template>
                  </a-menu>
                </template>
                <a-button style="margin-left: 8px">
                  {{ $t('Action') }}
                  <down-outlined />
                </a-button>
              </a-dropdown>
            </template>
          </composite-table>
          <job-action-dialog id="tid_job-manange-action-dialog" ref="jobActionDialog" />
          <job-error-message-dialog id="tid_job-manange-error-message-dialog" ref="jobErrorMessageDialog" />
          <file-manager-dialog id="tid_job-manange-file-dialog" ref="fileManager" />
          <job-tag-action-dialog id="tid_job-tag-action-dialog" ref="jobTagActionDialog" />
          <job-comment-dialog id="tid_job-comment-dialog" ref="jobCommentDialog" />
          <job-priority-dialog v-if="access !== 'staff'" id="tid_job-priority-all-dialog" ref="jobPriorityDialog" />
        </a-col>
      </a-row>
    </div>
    <a-modal
      :open="showJobSchedulerInfo"
      :footer="null"
      :title="$t('JobManage.JobSchedulerInfo.Title')"
      @cancel="showJobSchedulerInfo = false">
      <a-textarea :auto-size="{ maxRows: 10 }" read-only :value="jobSchedulerInfo" style="resize: none"> </a-textarea>
    </a-modal>
  </div>
</template>
<script>
import Format from '@/common/format'
import JobService from '@/service/job'
import AccessService from '@/service/access'
import Mixins from '@/mixins/set-keep-alive-pages'
import CompositeTable from '@/component/composite-table.vue'
import UserDataTooltip from '@/component/user-data-tooltip.vue'
import FileManagerDialog from '@/component/file-manager-dialog.vue'
import JobTagDisplay from '@/widget/job-tag-display.vue'
import JobStatusLabel from '@/widget/job-status-label.vue'
import JobActionDialog from '@/widget/job-action-dialog.vue'
import MultiUserSelector from '@/widget/multi-user-selector.vue'
import MultiQueueSelector from '@/widget/multi-queue-selector.vue'
import JobTagActionDialog from '@/widget/job-tag-action-dialog.vue'
import JobErrorMessageDialog from './job-manage/job-error-message-dialog.vue'
import JobPriorityDialog from './job-manage/job-priority-dialog.vue'
import JobCommentDialog from './job/job-comment-dialog.vue'
const name = 'job-manage'
export default {
  name,
  components: {
    CompositeTable,
    FileManagerDialog,
    MultiUserSelector,
    MultiQueueSelector,
    UserDataTooltip,
    JobActionDialog,
    JobStatusLabel,
    JobErrorMessageDialog,
    JobTagActionDialog,
    JobCommentDialog,
    JobTagDisplay,
    JobPriorityDialog,
  },
  mixins: [Mixins(name, 'jobTable')],
  data() {
    const statusTypes = [
      {
        type: 'running',
        label: this.$t('JobManager.StatusType.Running'),
        status: JobService.JobWebStateEnums.running,
      },
      {
        type: 'waiting',
        label: this.$t('JobManager.StatusType.Waiting'),
        status: JobService.JobWebStateEnums.waiting,
      },
      {
        type: 'finished',
        label: this.$t('JobManager.StatusType.Finished'),
        status: JobService.JobWebStateEnums.finished,
      },
    ]
    let defaultStatusIndex = 0
    if (this.$route.params.status) {
      for (let i = 0; i < statusTypes.length; i++) {
        if (statusTypes[i].type === this.$route.params.status) {
          defaultStatusIndex = i
          break
        }
      }
    }
    const access = this.$store.state.auth.access
    return {
      access,
      filterType: '',
      tableDataFetcher: JobService.getJobTableDataFetcher(access),
      jobType: 'hide-system',
      statusType: statusTypes[defaultStatusIndex].type,
      defaultSubmitTime: 1,
      statusTypes,
      loading: false,
      arch: AccessService.getSchedulerArch(),
      scheduler: AccessService.getScheduler(),
      dataFilter: {
        state: {
          values: statusTypes[defaultStatusIndex].status,
          type: 'in',
        },
        queue: {
          values: [],
          type: 'in',
        },
        submitUser: {
          value_type: 'username',
          values: access === 'staff' ? [this.$store.state.auth.username] : [],
          type: 'in',
        },
        submitTime: {
          values: [new Date(new Date() - 86400000 * 30), new Date('2100/1/1')],
          type: 'range',
        },
        tag: {
          values: [],
          type: 'in',
        },
      },
      savedTime: 1,
      showJobSchedulerInfo: false,
      jobSchedulerInfo: '',
      columns: [],
      actionOptions: [],
      searchProps: ['id', 'name'],
      tagsOption: [],
      selectedJob: [],
      freshInterval: 15 * 1000,
    }
  },
  computed: {
    isHR: function () {
      return this.access === 'staff' && this.$route.path.indexOf('expert-mode') >= 0
    },
  },
  watch: {
    statusType(val) {
      this.computeColumns(this.arch, this.access, this.statusType)
      for (let i = 0; i < this.statusTypes.length; i++) {
        if (this.statusTypes[i].type === val) {
          this.statusType = this.statusTypes[i].type
          this.initSubmitTime()
          this.dataFilter.state.values = this.statusTypes[i].status
        }
      }
    },
  },
  created() {
    this.searchProps.push('schedulerId')
    this.filterType = 'username,usergroup,billinggroup'
    this.initSubmitTime()
    this.computeColumns(this.arch, this.access, this.statusType)
    this.getTagsOptions()
  },
  activated() {
    this.getTagsOptions()
  },
  methods: {
    getTagsOptions() {
      JobService.getAllJobTags().then(
        res => {
          this.tagsOption = res
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    computeColumns(arch, access, statusType) {
      const columns = [
        {
          dataIndex: 'id',
          title: this.$t('Job.Id'),
          sorter: true,
          defaultSortOrder: 'descend',
          show: true,
        },
        {
          dataIndex: 'name',
          title: this.$t('Job.Name'),
          customSlot: true,
          sorter: true,
          ellipsis: true,
          show: true,
        },
        {
          dataIndex: 'schedulerId',
          title: this.$t('Job.SchedulerId'),
          customSlot: true,
          sorter: true,
          show: arch === 'host',
        },
        {
          dataIndex: 'status',
          title: this.$t('Job.Status'),
          customSlot: true,
          align: 'left',
          show: true,
        },
        {
          dataIndex: 'queue',
          title: this.$t('Job.Queue'),
          sorter: true,
          show: arch === 'host',
        },
        {
          dataIndex: 'tags',
          title: this.$t('Job.Tags'),
          align: 'left',
          customSlot: true,
          width: 130,
          show: this.access === 'staff',
        },
        {
          dataIndex: 'submitTime',
          title: this.$t('Job.SubmitTime'),
          customRender: ({ text }) => {
            return Format.formatDateTime(text)
          },
          sorter: true,
          show: statusType !== 'running',
        },
        {
          dataIndex: 'waitDuration',
          title: this.$t('Job.WaitDuration'),
          customRender: ({ text }) => {
            return Format.formatDuration(text)
          },
          show: statusType === 'waiting',
        },
        {
          dataIndex: 'beginTime',
          title: this.$t(`Job.BeginTime.${statusType}`),
          customRender: ({ text }) => {
            return Format.formatDateTime(text)
          },
          sorter: true,
          show: statusType === 'running' || (statusType === 'waiting' && this.scheduler === 'slurm'),
        },
        {
          dataIndex: 'runDuration',
          title: this.$t('Job.RunDuration'),
          customRender: ({ text }) => {
            return Format.formatDuration(text)
          },
          show: statusType === 'running',
        },
        {
          dataIndex: 'finishTime',
          title: this.$t('Job.FinishTime'),
          customRender: ({ text }) => {
            return Format.formatDateTime(text)
          },
          sorter: true,
          show: statusType === 'finished',
        },
        {
          dataIndex: 'submitUser',
          title: this.$t('Job.SubmitUser'),
          customSlot: true,
          sorter: true,
          show: access !== 'staff',
        },
        {
          dataIndex: 'priority',
          title: this.$t('Job.Priority'),
          align: 'right',
          sorter: true,
          show: statusType === 'waiting',
        },
        {
          title: this.$t('Action'),
          key: 'action',
          customSlot: true,
          show: access === 'staff' || statusType !== 'finished',
        },
      ]
      this.columns = columns.filter(item => item.show)
    },
    onAddTagsClick() {
      this.$refs.jobTagActionDialog.doAdd(this.selectedJob).then(res => {
        this.$refs.jobTable.fetchTableData(true)
        this.getTagsOptions()
      })
    },
    onTagsAction(key) {
      if (key === 'clear') {
        this.onClearTagsClick()
      }
    },
    onClearTagsClick() {
      this.$refs.jobTagActionDialog.doDelete(this.selectedJob).then(res => {
        this.$refs.jobTable.fetchTableData(true)
      })
    },
    onDetailClick(job) {
      this.$router.push({ path: '/main/job/' + job.id })
    },
    onTableSelectionChange(val) {
      this.selectedJob = val
    },
    loadingChange(val) {
      this.loading = val
    },
    onMenuVisible(row, e) {
      this.actionOptions = []
      if (!e) {
        return
      }
      const job = row
      JobService.initTemplateJobFields(job).finally(async () => {
        const actions = await JobService.getJobActions(this.access, job)
        this.initActionOptions(actions)
      })
    },
    initActionOptions(actions) {
      if (actions.length <= 0) actions.push('NoAction')
      this.actionOptions = actions.map(a => {
        return {
          value: a,
          label: this.$t(`Action.${a}`),
        }
      })
    },
    onRequeueClick(job) {
      const batch = !job
      const jobs = job || this.getJobsId()
      this.$refs.jobActionDialog
        .doRequeue(jobs, batch)
        .catch(_ => {})
        .finally(() => {
          this.$refs.jobTable.fetchTableData(true)
        })
    },
    onCancelClick(job) {
      const batch = !job
      const jobs = job || this.getJobsId()
      this.$refs.jobActionDialog.doCancel(jobs, batch).then(
        res => {
          // Reload table data
          this.$refs.jobTable.fetchTableData(true)
        },
        res => {
          this.$refs.jobTable.fetchTableData(true)
        },
      )
    },
    onHoldClick(job) {
      const batch = !job
      const jobs = job || this.getJobsId()
      this.$refs.jobActionDialog
        .doHold(jobs, batch)
        .catch(_ => {})
        .finally(() => {
          this.$refs.jobTable.fetchTableData(true)
        })
    },
    onReleaseClick(job) {
      const batch = !job
      const jobs = job || this.getJobsId()
      this.$refs.jobActionDialog
        .doRelease(jobs, batch)
        .catch(_ => {})
        .finally(() => {
          this.$refs.jobTable.fetchTableData(true)
        })
    },
    onSuspendClick(job) {
      const batch = !job
      const jobs = job || this.getJobsId()
      this.$refs.jobActionDialog
        .doSuspend(jobs, batch)
        .catch(_ => {})
        .finally(() => {
          this.$refs.jobTable.fetchTableData(true)
        })
    },
    onResumeClick(job) {
      const batch = !job
      const jobs = job || this.getJobsId()
      this.$refs.jobActionDialog
        .doResume(jobs, batch)
        .catch(_ => {})
        .finally(() => {
          this.$refs.jobTable.fetchTableData(true)
        })
    },
    onDeleteClick(job) {
      const batch = !job
      const jobs = job || this.getJobsId()
      this.$refs.jobActionDialog.doDelete(jobs, batch).then(
        res => {
          this.$refs.jobTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onRerunClick(job) {
      this.$refs.jobActionDialog.doRerun(job).then(
        res => {
          this.$refs.jobTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onCopyClick(job) {
      this.$router.push({ path: '/main/job-template-ex/copy/' + job.id })
    },
    onErrMessageClick(job) {
      this.$refs.jobErrorMessageDialog.showErrorMessage(job)
    },
    onCommentClick(job) {
      this.$refs.jobCommentDialog.doEdit(job).then(res => {
        this.$refs.jobTable.fetchTableData(true)
      })
    },
    columnFormatter(row, column) {
      if (['submitTime', 'beginTime', 'finishTime'].indexOf(column.property) >= 0) {
        return Format.formatDateTime(row[column.property])
      }
      if (['waitDuration', 'runDuration'].indexOf(column.property) >= 0) {
        return Format.formatDuration(row[column.property])
      }
    },
    jobNameFormat(name) {
      if (!name) {
        return this.$t('NoName')
      }
      return name
    },
    onActionCommand(action, job) {
      if (action === 'Requeue') {
        this.onRequeueClick(job)
      }
      if (action === 'Cancel') {
        this.onCancelClick(job)
      }
      if (action === 'Hold') {
        this.onHoldClick(job)
      }
      if (action === 'Release') {
        this.onReleaseClick(job)
      }
      if (action === 'Suspend') {
        this.onSuspendClick(job)
      }
      if (action === 'Resume') {
        this.onResumeClick(job)
      }
      if (action === 'Rerun') {
        this.onRerunClick(job)
      }
      if (action === 'Copy') {
        this.onCopyClick(job)
      }
      if (action === 'Delete') {
        this.onDeleteClick(job)
      }
      if (action === 'Comment') {
        this.onCommentClick(job)
      }
      if (action === 'Errmsg') {
        this.onErrMessageClick(job)
      }
      if (action === 'Priority') {
        this.onPriorityClick(job)
      }
    },
    changeValue(data) {
      this.dataFilter.submitUser.value_type = data.value_type
      this.dataFilter.submitUser.values = data.values
    },
    onPriorityClick(job) {
      const idList = job ? [job.id] : this.getJobsId()
      this.$refs.jobPriorityDialog
        .doOpen(idList)
        .catch(_ => {})
        .finally(() => {
          this.$refs.jobTable.fetchTableData(true)
        })
    },
    submitTimeChange(val) {
      let submissionRange = [new Date(0), new Date('2100/1/1')]
      if (val) {
        submissionRange = [new Date(new Date() - 86400000 * 30 * val), new Date('2100/1/1')]
      }
      if (this.statusType === 'finished') {
        this.savedTime = val
      }
      this.dataFilter.submitTime.values = submissionRange
    },

    submitTimeChangeAction(e) {
      const val = e.target.value
      this.submitTimeChange(val)
    },
    statusChange(e) {
      const val = e.target.value
      this.statusType = val
      for (let i = 0; i < this.statusTypes.length; i++) {
        if (this.statusTypes[i].status === val) {
          this.initSubmitTime()
          this.dataFilter.state.values = this.statusTypes[i].status
        }
      }
    },
    initSubmitTime() {
      if (this.statusType === 'finished') {
        this.defaultSubmitTime = this.savedTime
        this.submitTimeChange(this.savedTime)
      } else {
        this.defaultSubmitTime = 0
        this.submitTimeChange(0)
      }
    },
    onSubmitUserClick(job) {
      this.$refs.multiUserSelector.setUsername(job.submitUser)
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
    getJobsId() {
      return this.selectedJob.map(item => item.id)
    },
  },
}
</script>
<style scoped>
.job-manage-wrapper :deep(.ant-table-cell) {
  overflow: unset;
  overflow-wrap: unset;
}
.job-tab {
  margin-bottom: 20px;
}

.job-tab-span {
  display: inline-block;
  width: 120px;
  text-align: left;
}
.job-manage-hr {
  background: #e9eef2;
  height: 1.5px;
  width: 100%;
  margin-bottom: 20px;
}
.job-tag-action :deep(.ant-dropdown-trigger) {
  width: 34px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
.job-name {
  font-size: 14px;
  color: #333;
}
.m-b-8 {
  margin-bottom: 8px;
}
.job-comment {
  font-size: 12px;
  color: #999;
}
.job-name-container {
  display: inline-block;
  max-width: 100%;
}
.ellipsis-container {
  max-width: 100%;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
.composite-table-controller > li {
  float: left;
  margin-right: 20px;
}
</style>
