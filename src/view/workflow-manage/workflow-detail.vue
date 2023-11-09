<template>
  <div v-if="workflow" class="height--100 p-10">
    <div class="workflow-infor-bar">
      <a-row>
        <a-col :span="12">
          <span>{{ workflow.name }}</span>
          <div class="workflow-status">
            <workflow-status-label :status="workflow.status" />
          </div>
        </a-col>
        <a-col :span="12" style="text-align: right">
          <a-dropdown :trigger="['click']">
            <a-button class="workflow-detail-action-button">
              {{ $t('Action') }}
              <down-outlined />
            </a-button>
            <template #overlay>
              <a-menu style="text-align: left; width: max-content">
                <a-menu-item v-if="workflow.status == 'created'" key="run" @click="onRunClick(workflow)">
                  {{ $t('Action.Run') }}
                </a-menu-item>
                <a-menu-item
                  v-if="workflow.status == 'completed' || workflow.status == 'cancelled' || workflow.status == 'failed'"
                  key="Rerun"
                  @click="onRerunClick(workflow)">
                  {{ $t('Action.Rerun') }}
                </a-menu-item>
                <a-menu-item
                  v-if="
                    workflow.status != 'running' && workflow.status != 'cancelling' && workflow.status != 'starting'
                  "
                  key="edit"
                  @click="onEditClick(workflow)">
                  {{ $t('Action.Edit') }}
                </a-menu-item>
                <a-menu-item key="copy" @click="onCopyClick(workflow)">
                  {{ $t('Action.Copy') }}
                </a-menu-item>
                <a-menu-item
                  v-if="workflow.status == 'running' || workflow.status == 'starting'"
                  key="cancel"
                  @click="onCancelClick(workflow)">
                  {{ $t('Action.Cancel') }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-col>
      </a-row>
      <a-row v-if="String(workflow.description).length > 0">
        <a-col class="workflow-description" :title="workflow.description">
          {{ workflow.description }}
        </a-col>
      </a-row>
      <a-row class="workflow-info-list">
        <a-col :span="2">
          {{ $t('Workflow.Detail.Step') }}
        </a-col>
        <a-col :span="2">
          {{ $t('Workflow.Detail.Job') }}
        </a-col>
        <a-col :span="3">
          {{ $t('Workflow.MaxSubmitJobs') }}
        </a-col>
        <!-- <a-col :span="3">{{$t('Workflow.StartTime')}}</a-col> -->
        <a-col :span="3">
          {{ $t('Workflow.LastTriggerTime') }}
        </a-col>
        <a-col v-if="workflow.periodic_task" :span="3">
          {{ $t('Workflow.Recurrence.Pattern') }}
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="2">
          {{ workflow.step.length }}
        </a-col>
        <a-col :span="2">
          {{ jobNums }}
        </a-col>
        <a-col :span="3">
          {{ workflow.maxSubmitJobs }}
        </a-col>
        <a-col :span="3">
          {{ workflow.startTime ? formatDateTime(workflow.startTime) : '--' }}
        </a-col>
        <!-- <a-col v-if="workflow.periodic_task" :span="3">{{ workflow.getLastRunAt() || '--' }}</a-col> -->
        <a-col v-if="workflow.periodic_task" :span="3">
          {{ workflow.getRecurrencePattern() }}
        </a-col>
      </a-row>
    </div>
    <div class="b-w steps-container-outer">
      <div v-if="workflow.step.length <= 0">
        <a-empty />
      </div>
      <div v-else class="workflow-steps-editor">
        <ul class="workflow-step-container" :style="styleObject">
          <template v-for="stepItem in workflow.step" :key="stepItem.id">
            <workflow-detail-step :step="stepItem" />
          </template>
        </ul>
      </div>
    </div>
    <workflow-create-dialog ref="workflowCreateDialog" />
  </div>
</template>

<script>
import dayjs from '@/dayjs'
import Utils from '@/common/utils'
import AccessService from '@/service/access'
import WorkflowService from '@/service/workflow'
import WorkflowStatusLabel from './workflow-status-label.vue'
import WorkflowCreateDialog from './workflow-create-dialog.vue'
import WorkflowDetailStep from './workflow-detail/workflow-detail-step.vue'

export default {
  components: {
    WorkflowStatusLabel,
    WorkflowCreateDialog,
    WorkflowDetailStep,
  },
  props: ['id'],
  data() {
    return {
      workflow: null,
      refreshTimer: null,
      arch: AccessService.getSchedulerArch(),
      localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  },
  computed: {
    styleObject: function () {
      if (this.workflow && this.workflow.step) {
        return {
          width: this.workflow.step.length * 280 + 'px',
        }
      }
      return { width: '280px' }
    },
    jobNums() {
      let count = 0
      this.workflow.step.forEach(el => {
        count += el.stepJob.length
      })
      return count
    },
  },
  watch: {
    id(val) {
      this.getWorkflow()
    },
  },
  mounted() {
    this.getWorkflow()
  },
  beforeUnmount() {
    clearTimeout(this.refreshTimer)
  },
  methods: {
    formatDateTime(val) {
      return (
        dayjs(val * 1000)
          .tz(this.localTimezone)
          .format('YYYY-MM-DD HH:mm') +
        ' ' +
        Utils.getTimezoneShortByLang(this.localTimezone)
      )
    },
    getWorkflow() {
      clearTimeout(this.refreshTimer)
      WorkflowService.getWorkflowById(this.id).then(
        res => {
          this.workflow = res
          this.refreshTimer = setTimeout(this.getWorkflow, 15000)
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    onRunClick(row) {
      WorkflowService.operateWorkflow(row.id, 'run').then(
        res => {
          this.$message.success(this.$t('Workflow.Operate.Success'))
          this.getWorkflow()
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    onRerunClick(row) {
      WorkflowService.operateWorkflow(row.id, 'rerun').then(
        res => {
          this.$message.success(this.$t('Workflow.Operate.Success'))
          this.getWorkflow()
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    onCancelClick(row) {
      this.$confirm({
        title: this.$t('Workflow.Cancel.Title'),
        content: this.$T('Workflow.Cancel.Tips', { name: row.name }),
        okText: this.$t('Action.Confirm'),
        cancelText: this.$t('Action.Cancel'),
        onOk: () => {
          WorkflowService.operateWorkflow(row.id, 'cancel').then(
            res => {
              this.$message.success(this.$t('Workflow.Operate.Success'))
              this.getWorkflow()
            },
            err => {
              this.$message.error(err)
            },
          )
        },
      })
    },
    onCopyClick(row) {
      this.$refs.workflowCreateDialog.doCopy(row).then(res => {
        //
      })
    },
    onEditClick(row) {
      this.$router.push(`/main/workflow-editor/${row.id}`)
    },
  },
}
</script>

<style scoped>
.workflow-infor-bar {
  color: #fff;
  padding: 20px;
  background: url('/static/img/system/workflow/workflow-detail-back.png') center center no-repeat;
  background-size: cover;
  border-radius: 4px;
}
.workflow-status {
  display: inline-block;
  margin-left: 20px;
}
.workflow-description {
  margin-bottom: 20px;
  color: #bcbfcc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.workflow-info-list {
  margin-bottom: 10px;
  color: #bcbfcc;
}
.workflow-detail-action-button {
  background-color: rgba(255, 255, 255, 0);
  color: #fff;
}
.steps-container-outer {
  padding: 20px;
  margin-top: 20px;
  border-radius: 4px;
}
.workflow-steps-editor {
  overflow: auto;
  height: 592px;
  margin-bottom: 20px;
}
.workflow-step-container {
  height: 100%;
}
.workflow-step-container > li {
  display: inline-block;
  width: 280px;
  height: 100%;
  vertical-align: top;
}
</style>
