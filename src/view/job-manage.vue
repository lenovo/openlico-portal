<template>
  <div class="height--100 p-10">
    <div class="job-tab b-w p-20">
      <a-row type="flex" justify="start" align="middle">
        <a-col :span="10">
          <span class="job-tab-span">{{ $t('JobManager.Filter.StatusType') }}</span>
          <a-radio-group
            id="tid_job-manage-filter-status"
            v-model="statusType"
            button-style="solid"
            @change="statusChange">
            <a-radio-button
              v-for="type in statusTypes"
              :id="'JobManager_Filter_' + type.label"
              :key="type.type"
              :value="type.type">
              {{ type.label }}
            </a-radio-button>
          </a-radio-group>
        </a-col>
        <a-col v-show="statusType == 'finished'" :span="14">
          <span class="job-tab-span">{{ $t('JobManager.Filter.Submission') }}</span>
          <a-radio-group
            id="tid_job-manage-filter-submission"
            v-model="defaultSubmitTime"
            button-style="solid"
            @change="submitTimeChangeAction">
            <a-radio-button :value="1">
              {{ $t('JobManager.SubmitTime.Month') }}
            </a-radio-button>
            <a-radio-button :value="3">
              {{ $t('JobManager.SubmitTime.Months', { value: 3 }) }}
            </a-radio-button>
            <a-radio-button :value="6">
              {{ $t('JobManager.SubmitTime.Months', { value: 6 }) }}
            </a-radio-button>
            <a-radio-button :value="0">
              {{ $t('JobManager.SubmitTime.All') }}
            </a-radio-button>
          </a-radio-group>
        </a-col>
      </a-row>
      <a-row class="job-tab-div" type="flex" justify="start" align="middle">
        <a-col v-if="arch == 'host'" :span="10" class="m-t-20">
          <span class="job-tab-span">{{ $t('JobManager.Filter.Queue') }}</span>
          <multi-queue-selector
            id="tid_job-manage-filter-queue"
            v-model="dataFilter.queue.values"
            class="default-select"
            :placeholder="$t('Select.All')"
            :clearable="true">
          </multi-queue-selector>
        </a-col>
        <a-col v-if="false" :span="14" class="m-t-20">
          <span class="job-tab-span">{{ $t('JobManager.Filter') }}</span>
          <a-select v-model="jobType" :placeholder="$t('Select.All')" class="default-select" allow-clear>
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
          <a-select v-model="dataFilter.tag.values" mode="tags" style="width: 300px">
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
            :selection-enable="access == 'staff'"
            :table-loading="loading"
            :auto-refresh="freshInterval"
            @loading-change="loadingChange"
            @selection-change="onTableSelectionChange">
            <ul slot="controller" class="composite-table-controller">
              <a-dropdown-button
                v-if="access == 'staff'"
                :disabled="!selectedJob.length"
                class="job-tag-action"
                type="primary"
                @click="onAddTagsClick">
                {{ $t('JobManager.Add.Tags') }}
                <a-menu
                  slot="overlay"
                  @click="
                    ({ key }) => {
                      onTagsAction(key)
                    }
                  ">
                  <a-menu-item key="clear">{{ $t('JobManager.Clear.Tags') }}</a-menu-item>
                </a-menu>
                <a-icon slot="icon" type="down" />
              </a-dropdown-button>
              <span v-else>&nbsp;</span>
            </ul>
            <template slot="name" slot-scope="{ row, name }">
              <span v-if="access == 'staff'" class="job-name-container">
                <a-popover placement="right">
                  <template slot="content">
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
                <template slot="content">
                  <p class="job-name">{{ row.name }}</p>
                </template>
                <span class="ellipsis-container">{{ jobNameFormat(name) }}</span>
              </a-popover>
            </template>
            <template slot="schedulerId" slot-scope="{ row, schedulerId }">
              <a
                v-if="statusType != 'finished'"
                href="javascript:;"
                class="el-button--wrap"
                @click="onSchedulerIdClick(row)"
                >{{ schedulerId }}</a
              >
              <span v-else>{{ schedulerId }}</span>
            </template>
            <template slot="status" slot-scope="{ row, status }">
              <job-status-label
                :arch="arch"
                :status="status"
                :operate-status="row.operateStatus"
                :ai-operate-status="row.aiOperateStatus">
              </job-status-label>
            </template>
            <template slot="tags" slot-scope="{ tags }">
              <job-tag-display :tags="tags" :display-count="1" :display-tag-length="10" />
            </template>
            <template slot="submitUser" slot-scope="{ row, submitUser }">
              <a href="javascript:;" class="el-button--wrap" @click="onSubmitUserClick(row)">
                {{ submitUser }}
              </a>
            </template>
            <a-dropdown
              slot="action"
              slot-scope="{ row }"
              :trigger="['click']"
              placement="bottomLeft"
              @visibleChange="onMenuVisible(row, $event)">
              <a-menu slot="overlay" @click="({ key }) => onActionCommand(key, row)">
                <template v-for="i in actionOptions">
                  <a-menu-item v-if="i.value != 'Browse'" :key="i.value" :disabled="i.value == 'NoAction'">
                    {{ i.label }}</a-menu-item
                  >
                </template>
              </a-menu>
              <a-button style="margin-left: 8px">
                {{ $t('Action') }}
                <a-icon type="down" />
              </a-button>
            </a-dropdown>
          </composite-table>
          <job-action-dialog id="tid_job-manange-action-dialog" ref="jobActionDialog" />
          <job-error-message-dialog id="tid_job-manange-error-message-dialog" ref="jobErrorMessageDialog" />
          <file-manager-dialog id="tid_job-manange-file-dialog" ref="fileManager" />
          <job-tag-action-dialog id="tid_job-tag-action-dialog" ref="jobTagActionDialog" />
          <job-comment-dialog id="tid_job-comment-dialog" ref="jobCommentDialog" />
        </a-col>
      </a-row>
    </div>
    <a-modal
      :visible="showJobSchedulerInfo"
      :footer="null"
      :title="$t('JobManage.JobSchedulerInfo.Title')"
      @cancel="showJobSchedulerInfo = false">
      <a-input type="textarea" :auto-size="{ maxRows: 10 }" read-only :value="jobSchedulerInfo" style="resize: none">
      </a-input>
    </a-modal>
  </div>
</template>
<script>
import Format from '../common/format'
import JobService from '../service/job'
import AccessService from '../service/access'
import MultiUserSelector from '../widget/multi-user-selector'
import MultiQueueSelector from '../widget/multi-queue-selector'
import CompositeTable from '../component/composite-table'
import JobStatusLabel from '../widget/job-status-label'
import JobActionDialog from '../widget/job-action-dialog'
import FileManagerDialog from '../component/file-manager-dialog'
import ErrorMessageDialog from './job-manage/job-error-message-dialog'
import JobTagSActionDialog from './../widget/job-tag-action-dialog'
import JobCommentDialog from './job/job-comment-dialog'
import JobTagDisplay from './../widget/job-tag-display'
import Mixins from '../mixins/set-keep-alive-pages'
const name = 'job-manage'
export default {
  name,
  components: {
    'composite-table': CompositeTable,
    'job-action-dialog': JobActionDialog,
    'multi-user-selector': MultiUserSelector,
    'multi-queue-selector': MultiQueueSelector,
    'job-status-label': JobStatusLabel,
    'file-manager-dialog': FileManagerDialog,
    'job-error-message-dialog': ErrorMessageDialog,
    'job-tag-action-dialog': JobTagSActionDialog,
    'job-comment-dialog': JobCommentDialog,
    'job-tag-display': JobTagDisplay,
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
      currentUserRole: '',
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
          scopedSlots: {
            customRender: 'name',
          },
          sorter: true,
          ellipsis: true,
          show: true,
        },
        {
          dataIndex: 'schedulerId',
          title: this.$t('Job.SchedulerId'),
          scopedSlots: {
            customRender: 'schedulerId',
          },
          sorter: true,
          show: arch === 'host',
        },
        {
          dataIndex: 'status',
          title: this.$t('Job.Status'),
          scopedSlots: {
            customRender: 'status',
          },
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
          scopedSlots: {
            customRender: 'tags',
          },
          width: 130,
          show: this.access === 'staff',
        },
        {
          dataIndex: 'submitTime',
          title: this.$t('Job.SubmitTime'),
          customRender: (text, record) => {
            return Format.formatDateTime(text)
          },
          sorter: true,
          show: statusType !== 'running',
        },
        {
          dataIndex: 'waitDuration',
          title: this.$t('Job.WaitDuration'),
          customRender: (text, record) => {
            return Format.formatDuration(text)
          },
          show: statusType === 'waiting',
        },
        {
          dataIndex: 'beginTime',
          title: this.$t(`Job.BeginTime.${statusType}`),
          customRender: (text, record) => {
            return Format.formatDateTime(text)
          },
          sorter: true,
          show: statusType === 'running' || (statusType === 'waiting' && this.scheduler === 'slurm'),
        },
        {
          dataIndex: 'runDuration',
          title: this.$t('Job.RunDuration'),
          customRender: (text, record) => {
            return Format.formatDuration(text)
          },
          show: statusType === 'running',
        },
        {
          dataIndex: 'finishTime',
          title: this.$t('Job.FinishTime'),
          customRender: (text, record) => {
            return Format.formatDateTime(text)
          },
          sorter: true,
          show: statusType === 'finished',
        },
        {
          dataIndex: 'submitUser',
          title: this.$t('Job.SubmitUser'),
          scopedSlots: {
            customRender: 'submitUser',
          },
          sorter: true,
          show: access !== 'staff',
        },
        {
          title: this.$t('Action'),
          scopedSlots: {
            customRender: 'action',
          },
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
      JobService.initTemplateJobFields(job).finally(() => {
        this.$router.push({ path: '/main/job/' + job.id })
      })
    },
    onTableSelectionChange(val) {
      this.selectedJob = val
    },
    loadingChange(val) {
      this.loading = val
    },
    onMenuVisible(row, e) {
      const job = row
      if (!e) {
        this.actionOptions = []
        return
      }
      JobService.initTemplateJobFields(job).finally(async () => {
        const actions = await JobService.getJobActions(this.access, job.operateStatus, job.status, job.type, job.errmsg)
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
    onCancelClick(job) {
      this.$refs.jobActionDialog.doCancel(job).then(
        res => {
          // Reload table data
          this.$refs.jobTable.fetchTableData(true)
        },
        res => {
          this.$refs.jobTable.fetchTableData(true)
        },
      )
    },
    onDeleteClick(job) {
      this.$refs.jobActionDialog.doDelete(job).then(
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
      if (action === 'Cancel') {
        this.onCancelClick(job)
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
    },
    changeValue(data) {
      this.dataFilter.submitUser.value_type = data.value_type
      this.dataFilter.submitUser.values = data.values
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
  },
}
</script>
<style scoped>
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
.job-tag-action >>> .ant-dropdown-trigger {
  width: 34px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
.job-name,
.job-comment {
  max-width: 260px;
  word-break: break-all;
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
</style>
