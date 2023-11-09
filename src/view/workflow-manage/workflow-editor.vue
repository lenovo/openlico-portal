<template>
  <div class="height--100 p-10">
    <div v-if="workflow" class="workflow-editor b-w">
      <div class="workflow-top-bar">
        <a-row class="">
          <a-col class="workflow-name-editor">
            <div>{{ workflow.name }}</div>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="4" class="workflow-description-title">
            <message-outlined />
            {{ $t('Workflow.Description') }}
          </a-col>
          <a-col :span="20" class="workflow-description-editor">
            <div class="workflow-description-info">{{ workflow.description }}</div>
          </a-col>
        </a-row>
        <a-row style="margin-top: 5px">
          <a-col :span="4" class="workflow-jobs-title">
            <container-outlined />
            {{ $t('Workflow.MaxSubmitJobs') }}
          </a-col>
          <a-col :span="4" class="workflow-jobs-editor">
            <div>{{ workflow.maxSubmitJobs }}</div>
          </a-col>
        </a-row>
        <a-dropdown class="action-button" :trigger="['click']">
          <a-button>
            {{ $t('Action') }}
            <down-outlined />
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item key="edit" @click="onEditClick">
                {{ $t('Action.Edit') }}
              </a-menu-item>
              <a-menu-item v-if="operateText.text" key="2" @click="onRunClick">
                {{ operateText.text }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        <template v-if="workflow.periodic_task">
          <a-row>
            <a-col :span="4" class="workflow-jobs-title">
              <ClockCircleOutlined />
              {{ $t('Workflow.Recurrence.TriggerTime') }}
            </a-col>
            <a-col :span="4" class="workflow-jobs-editor">
              <div>{{ workflow.getNextRunAt() }}</div>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="4" class="workflow-jobs-title">
              <RedoOutlined />
              {{ $t('Workflow.Recurrence.Pattern') }}
            </a-col>
            <a-col :span="12" class="workflow-jobs-editor">
              <div>{{ workflow.getRecurrencePattern() }}</div>
            </a-col>
          </a-row>
        </template>
      </div>
      <div ref="scrollContainer" class="workflow-steps-editor">
        <ul class="workflow-step-container" :style="styleObject">
          <li v-for="stepItem in workflow.step" :key="stepItem.id" class="step-item">
            <a-tooltip placement="topLeft">
              <template #title>
                <div class="tooltip-setp-name">{{ stepItem.name }}</div>
                <div v-if="stepItem.description" class="tooltip-setp-description">{{ stepItem.description }}</div>
              </template>
              <div class="step-name-container">
                <div class="step-name">
                  {{ stepItem.name }}
                </div>
                <edit-outlined class="step-edit-icon step-icon" type="edit" @click="editStep(stepItem)" />
                <close-outlined class="step-delete-icon step-icon" type="close" @click="deleteStep(stepItem)" />
              </div>
            </a-tooltip>
            <div class="step-container">
              <a-button class="step-job-create-btn" @click="createStepJob(stepItem)">
                {{ $t('Workflow.CreateNewJob') }}
              </a-button>
              <template v-for="item in stepItem.stepJob" :key="item.id">
                <workflow-detail-job :step-job="item" mode="edit">
                  <template #actions="{ template }">
                    <a-menu-item v-if="template !== null" key="edit" @click="editStepJob(stepItem.id, item)">
                      {{ $t('Action.Edit') }}
                    </a-menu-item>
                    <a-menu-item v-if="template !== null" key="copy" @click="copyStepJob(stepItem.id, item)">
                      {{ $t('Action.Copy') }}
                    </a-menu-item>
                    <a-menu-item
                      v-if="workflow.step.length > 1 && template !== null"
                      key="move"
                      @click="moveJob(stepItem.id, item)">
                      {{ $t('Action.MoveTo') }}
                    </a-menu-item>
                    <a-menu-item key="delete" @click="deleteStepJob(stepItem.id, item)">
                      {{ $t('Action.Delete') }}
                    </a-menu-item>
                  </template>
                </workflow-detail-job>
              </template>
            </div>
          </li>
          <li class="workflow-step-container">
            <a-button type="link" @click="addStep">
              {{ $t('Workflow.CreateNewStep') }}
            </a-button>
          </li>
        </ul>
      </div>
    </div>
    <workflow-step-editor ref="workflowStepEdit" />
    <workflow-create-dialog ref="workflowCreateDialog" />
    <workflow-job-move-dialog ref="workflowJobMoveDialog" />
  </div>
</template>

<script>
import WorkflowService from '@/service/workflow'
import WorkflowStepEdit from './workflow-step-editor.vue'
import WorkflowCreateDialog from './workflow-create-dialog.vue'
import WorkflowJobMoveDialog from './workflow-job-move-dialog.vue'
import WorkflowDetailJob from './workflow-detail/workflow-detail-job.vue'

export default {
  components: {
    WorkflowDetailJob,
    'workflow-step-editor': WorkflowStepEdit,
    'workflow-create-dialog': WorkflowCreateDialog,
    'workflow-job-move-dialog': WorkflowJobMoveDialog,
  },
  props: ['id'],
  data() {
    return {
      workflow: null,
    }
  },
  computed: {
    styleObject: function () {
      if (this.workflow && this.workflow.step) {
        return {
          width: (this.workflow.step.length + 1) * 280 + 'px',
        }
      }
      return { width: '280px' }
    },
    operateText() {
      const status = this.workflow.status
      if (status === 'completed' || status === 'cancelled' || status === 'failed') {
        return {
          action: 'rerun',
          text: this.$t('Action.Rerun'),
        }
      } else if (status === 'created') {
        return {
          action: 'run',
          text: this.$t('Action.Run'),
        }
      }
      return {
        text: null,
      }
    },
  },
  created() {
    this.getWorkflowInfo()
  },
  methods: {
    getWorkflowInfo() {
      WorkflowService.getWorkflowById(this.id).then(
        res => {
          this.workflow = res
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    addStep() {
      if (this.workflow.step.length >= 20) {
        this.$message.warning(this.$t('Workflow.MaxStepTips'))
        return false
      }
      const defaultOrder =
        this.workflow.step.length <= 0 ? 1 : this.workflow.step[this.workflow.step.length - 1].order + 1
      this.$refs.workflowStepEdit.doCreate(defaultOrder).then(
        topRes => {
          WorkflowService.createWorkflowStep(this.id, topRes).then(
            _ => {
              this.getWorkflowInfo()
            },
            err => {
              this.$message.error(err)
            },
          )
        },
        _ => {},
      )
      this.$nextTick(() => {
        this.$refs.scrollContainer.scrollLeft =
          parseInt(this.styleObject.width) - this.$refs.scrollContainer.clientWidth
      })
    },
    editStep(step) {
      this.$refs.workflowStepEdit.doEdit(step).then(
        topRes => {
          WorkflowService.updateWorkflowStep(this.id, topRes).then(
            res => {
              this.getWorkflowInfo()
            },
            err => {
              this.$message.error(err)
            },
          )
        },
        topErr => {},
      )
    },
    deleteStep(step) {
      this.$confirm({
        title: this.$t('Workflow.Step.Delete.Title'),
        content: this.$T('Workflow.Step.Delete.Tips', {
          name: step.name,
        }),
        okText: this.$t('Action.Confirm'),
        cancelText: this.$t('Action.Cancel'),
        onOk: () => {
          WorkflowService.deleteWorkflowStep(this.id, step.id).then(
            res => {
              this.$message.success(
                this.$T('Workflow.Step.Delete.Success', {
                  name: step.name,
                }),
              )
              this.getWorkflowInfo()
            },
            err => {
              this.$message.error(err)
            },
          )
        },
      })
    },
    createStepJob(step) {
      if (step.stepJob.length >= 50) {
        this.$message.warning(this.$t('Workflow.MaxJobTips'))
        return false
      }
      this.$router.push({
        name: 'workflow-template-store',
        params: {
          workflowId: this.id,
          stepId: step.id,
        },
      })
    },
    editStepJob(stepId, job) {
      this.$router.push({
        name: 'workflow-template-ex',
        params: {
          workflowId: this.id,
          stepId: stepId,
          stepJobId: job.id,
          code: job.templateId,
          action: 'edit',
        },
      })
    },
    copyStepJob(stepId, job) {
      this.$router.push({
        name: 'workflow-template-ex',
        params: {
          workflowId: this.id,
          stepId: stepId,
          stepJobId: job.id,
          code: job.templateId,
          action: 'copy',
        },
      })
    },
    moveJob(stepId, job) {
      const steps = this.workflow.step.filter(i => i.id !== stepId)
      this.$refs.workflowJobMoveDialog.doMove(stepId, steps, job).then(res => {
        this.getWorkflowInfo()
      })
    },
    deleteStepJob(stepId, job) {
      this.$confirm({
        title: this.$t('Workflow.Step.Job.Delete.Title'),
        content: this.$T('Workflow.Step.Job.Delete.Tips', {
          name: job.jobName,
        }),
        okText: this.$t('Action.Confirm'),
        cancelText: this.$t('Action.Cancel'),
        onOk: () => {
          WorkflowService.deleteWorkflowStepJob(stepId, job.id).then(
            _ => {
              this.$message.success(
                this.$T('Workflow.Step.Job.Delete.Success', {
                  name: job.jobName,
                }),
              )
              this.getWorkflowInfo()
            },
            err => {
              this.$message.error(err)
            },
          )
        },
      })
    },
    onRunClick() {
      WorkflowService.operateWorkflow(this.id, this.operateText.action).then(
        res => {
          this.$message.success(this.$t('Workflow.Operate.Success'))
          this.$router.push('/main/workflow-manage')
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    onEditClick() {
      this.$refs.workflowCreateDialog.doEdit(this.workflow).then(res => {
        this.getWorkflowInfo()
      })
    },
  },
}
</script>

<style scoped>
.workflow-editor {
  border-radius: 4px;
  padding: 10px 20px;
}
.workflow-top-bar {
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  position: relative;
}
.workflow-top-bar :deep(.ant-dropdown) {
  width: max-content;
}
.workflow-steps-editor {
  padding-bottom: 20px;
  overflow: auto;
  /* height: 725px; */
}
.workflow-step-container {
  height: 695px;
}
.workflow-step-container > li {
  display: inline-block;
  width: 280px;
  vertical-align: top;
}
.step-container {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  height: 635px;
  overflow: auto;
}
.step-job-create-btn {
  width: 100%;
  margin-bottom: 10px;
  position: sticky;
  top: 0;
  z-index: 3;
}
.step-item {
  padding: 10px;
}
.step-name-container {
  position: relative;
}

.step-name-container .step-icon {
  font-size: 18px;
  position: absolute;
  top: 7px;
  display: none;
}
.step-name-container .step-edit-icon {
  right: 20px;
}
.step-name-container .step-delete-icon {
  right: 0;
}
.step-name-container:hover .step-icon {
  display: block;
}
.step-name {
  width: 80%;
  height: 32px;
  line-height: 32px;
  margin: 4px 0;
  padding-left: 4px;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tooltip-setp-name {
  font-size: 15px;
  white-space: nowrap;
}
.tooltip-setp-description {
  margin-top: 5px;
  opacity: 0.8;
}
.workflow-step-container :deep(.ant-tooltip-inner) {
  padding: 6px 12px;
  display: inline-block;
}
.action-button {
  position: absolute;
  right: 0;
  top: 0px;
}
.workflow-name-editor {
  color: #333;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  margin-top: 4px;
}
.workflow-description-title,
.workflow-jobs-title {
  color: #999;
}
.workflow-description-editor,
.workflow-jobs-editor {
  color: #666;
}
.workflow-description-info {
  word-wrap: break-word;
  line-height: 20px;
}
</style>
