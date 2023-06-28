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
        <a-col :span="12" align="right">
          <a-dropdown :trigger="['click']">
            <a-button class="workflow-detail-action-button">
              {{ $t('Action') }}
              <a-icon type="down" />
            </a-button>
            <a-menu slot="overlay">
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
                v-if="workflow.status != 'running' && workflow.status != 'cancelling' && workflow.status != 'starting'"
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
          <li v-for="stepItem in workflow.step" :key="stepItem.id" class="step-item">
            <div class="step-name-container">
              <h3 class="step-name">
                {{ stepItem.name }}
              </h3>
            </div>
            <div class="step-container">
              <div v-for="item in stepItem.stepJob" :key="item.id" class="step-job-container">
                <div class="job-name">
                  {{ item.jobName }}
                  <a-dropdown v-if="item.jobExist" class="job-action-button" :trigger="['hover']">
                    <i class="el-erp-more2" />
                    <a-menu slot="overlay">
                      <a-menu-item key="detail" @click="jobDetail(item.jobId)">
                        {{ $t('Action.Info') }}
                      </a-menu-item>
                    </a-menu>
                  </a-dropdown>
                </div>
                <div class="job-status">
                  <job-status-label
                    v-if="item.jobExist || item.jobId == -1"
                    :arch="arch"
                    :status="item.status"
                    :operate-status="item.operateStatus"
                    :ai-operate-status="item.aiOperateStatus" />
                </div>
                <div class="job-type">
                  <span v-if="item.template === null" class="template-warning-message">
                    <a-icon class="template-warning" type="exclamation-circle" />
                    {{ $t('Workflow.Template.Tips') }}</span
                  >
                  <span v-else>{{ item.template }}</span>
                </div>
                <a-row class="icon-area">
                  <a-col
                    v-if="computedNodes(item) !== false"
                    :span="8"
                    :title="$t('Workflow.Nodes') + ': ' + computedNodes(item)">
                    <i class="el-erp-monitor_node" />{{ computedNodes(item) }}
                  </a-col>
                  <a-col
                    v-if="computedCores(item) !== false"
                    :span="8"
                    :title="$t('Workflow.Cores') + ': ' + computedCores(item)">
                    <i class="el-erp-cpu" />{{ computedCores(item) }}
                  </a-col>
                  <a-col
                    v-if="computedGpus(item) !== false"
                    :span="8"
                    :title="$t('Workflow.GPU') + ': ' + computedGpus(item)">
                    <i class="el-erp-GPU" />{{ computedGpus(item) }}
                  </a-col>
                </a-row>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <workflow-create-dialog ref="workflowCreateDialog" />
  </div>
</template>

<script>
import WorkflowService from '../../service/workflow'
import moment from 'moment'
import WorkflowStatusLabel from '../workflow-manage/workflow-status-label'
import JobStatusLabel from '../../widget/job-status-label'
import AccessService from '../../service/access'
import WorkflowCreateDialog from './workflow-create-dialog'

export default {
  components: {
    WorkflowStatusLabel,
    JobStatusLabel,
    WorkflowCreateDialog,
  },
  props: ['id'],
  data() {
    return {
      workflow: null,
      refreshTimer: null,
      arch: AccessService.getSchedulerArch(),
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
  beforeDestroy() {
    clearTimeout(this.refreshTimer)
  },
  methods: {
    jobDetail(id) {
      this.$router.push({ path: '/main/job/' + id })
    },
    formatDateTime(val) {
      return moment.tz(val * 1000, Intl.DateTimeFormat().resolvedOptions().timeZone).format('YYYY-MM-DD HH:mm z')
    },
    computedNodes(item) {
      if (Object.prototype.hasOwnProperty.call(item.jsonBody, 'nodes')) {
        return item.jsonBody.nodes
      } else {
        return false
      }
    },
    computedCores(item) {
      if (Object.prototype.hasOwnProperty.call(item.jsonBody, 'cores_per_node')) {
        if (Object.prototype.hasOwnProperty.call(item.jsonBody, 'exclusive') && item.jsonBody.exclusive) {
          return false
        }
        return item.jsonBody.nodes * item.jsonBody.cores_per_node
      } else {
        return false
      }
    },
    computedGpus(item) {
      if (Object.prototype.hasOwnProperty.call(item.jsonBody, 'gpu_per_node')) {
        const gpuNumber = item.jsonBody.nodes * item.jsonBody.gpu_per_node
        if (gpuNumber <= 0) {
          return false
        }
        return gpuNumber
      } else {
        return false
      }
    },
    getWorkflow() {
      clearTimeout(this.refreshTimer)
      WorkflowService.getWorkflowById(this.id).then(
        res => {
          this.workflow = res
          clearTimeout(this.refreshTimer)
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
        content: this.$t('Workflow.Cancel.Tips', { name: row.name }),
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
  background: url('static/img/system/workflow/workflow-detail-back.png') center center no-repeat;
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
.step-name {
  font-weight: bolder;
}
.step-item {
  padding: 10px;
}
.step-container {
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  height: 500px;
  overflow: auto;
}
.step-job-container {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  position: relative;
}
.job-name {
  font-size: 14px;
  color: #000;
  position: relative;
  padding-right: 30px;
  word-break: break-all;
}
.link-to-detail {
  cursor: pointer;
  font-size: 14px;
  color: #aaa;
  position: absolute;
  right: 0;
  top: 0;
}
.job-status {
  margin: 10px 0 0;
  display: inline-block;
  height: 15px;
  width: 100%;
}
.icon-area i {
  font-size: 14px;
}
.icon-area {
  color: #666;
}
.job-action-button {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 16px;
  color: #999;
}
.template-warning {
  margin-right: 4px;
}
.el-erp-more2 {
  cursor: pointer;
}
.job-type {
  font-size: 12px;
  color: #999;
  margin: 8px 0 4px;
  word-break: break-all;
}
.workflow-steps-editor >>> .state-label {
  width: 14px;
  height: 14px;
}
.template-warning-message {
  color: #ff5454;
}
</style>
