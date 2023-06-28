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
            <a-icon type="message" />
            {{ $t('Workflow.Description') }}
          </a-col>
          <a-col :span="20" class="workflow-description-editor">
            <div class="workflow-description-info">{{ workflow.description }}</div>
          </a-col>
        </a-row>
        <a-row style="margin-top: 5px">
          <a-col :span="4" class="workflow-jobs-title">
            <a-icon type="container" />
            {{ $t('Workflow.MaxSubmitJobs') }}
          </a-col>
          <a-col :span="4" class="workflow-jobs-editor">
            <div>{{ workflow.maxSubmitJobs }}</div>
          </a-col>
        </a-row>
        <a-dropdown class="action-button" :trigger="['click']">
          <a-button>
            {{ $t('Action') }}
            <a-icon type="down" />
          </a-button>
          <a-menu slot="overlay">
            <a-menu-item key="edit" @click="onEditClick">
              {{ $t('Action.Edit') }}
            </a-menu-item>
            <a-menu-item v-show="operateText.text" key="2" @click="onRunClick">
              {{ operateText.text }}
            </a-menu-item>
          </a-menu>
        </a-dropdown>
        <template v-if="workflow.periodic_task">
          <a-row>
            <a-col :span="4" class="workflow-jobs-title">
              <a-icon type="clock-circle" />
              {{ $t('Workflow.Recurrence.TriggerTime') }}
            </a-col>
            <a-col :span="4" class="workflow-jobs-editor">
              <div>{{ workflow.getNextRunAt() }}</div>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="4" class="workflow-jobs-title">
              <a-icon type="redo" />
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
          <li v-for="(stepItem, index) in workflow.step" :key="stepItem.id" class="step-item">
            <a-tooltip placement="topLeft">
              <template slot="title">
                <div class="tooltip-setp-name">{{ stepItem.name }}</div>
                <div v-if="stepItem.description" class="tooltip-setp-description">{{ stepItem.description }}</div>
              </template>
              <div class="step-name-container" @mouseenter="showCloseIcon(index)" @mouseleave="hideCloseIcon(index)">
                <div class="step-name">
                  {{ stepItem.name }}
                </div>
                <a-icon class="step-edit-icon" type="edit" style="display: none" @click="editStep(index)" />
                <a-icon class="step-delete-icon" type="close" style="display: none" @click="deleteStep(index)" />
              </div>
            </a-tooltip>
            <div class="step-container">
              <a-button class="step-job-create-btn" @click="createStepJob(index)">
                {{ $t('Workflow.CreateNewJob') }}
              </a-button>
              <div v-for="(item, subIndex) in stepItem.stepJob" :key="item.id" class="step-job-container">
                <div class="job-name">
                  {{ item.jobName }}
                  <a-dropdown class="job-action-button" :trigger="['hover']">
                    <i class="el-erp-more2" />
                    <a-menu slot="overlay">
                      <a-menu-item v-if="item.template !== null" key="edit" @click="editStepJob(index, subIndex)">
                        {{ $t('Action.Edit') }}
                      </a-menu-item>
                      <a-menu-item v-if="item.template !== null" key="copy" @click="copyStepJob(index, subIndex)">
                        {{ $t('Action.Copy') }}
                      </a-menu-item>
                      <a-menu-item
                        v-if="workflow.step.length > 1 && item.template !== null"
                        key="move"
                        @click="moveJob(index, subIndex)">
                        {{ $t('Action.MoveTo') }}
                      </a-menu-item>
                      <a-menu-item key="delete" @click="deleteStepJob(index, subIndex)">
                        {{ $t('Action.Delete') }}
                      </a-menu-item>
                    </a-menu>
                  </a-dropdown>
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
          <li class="create-new-step">
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
import WorkflowService from '../../service/workflow'
import WorkflowStepEdit from '../workflow-manage/workflow-step-editor'
import WorkflowCreateDialog from '../workflow-manage/workflow-create-dialog'
import WorkflowJobMoveDialog from '../workflow-manage/workflow-job-move-dialog'
export default {
  components: {
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
      this.$nextTick(() => {
        this.$refs.scrollContainer.scrollLeft =
          parseInt(this.styleObject.width) - this.$refs.scrollContainer.clientWidth
      })
    },
    editStep(index) {
      this.$refs.workflowStepEdit.doEdit(this.workflow.step[index]).then(
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
    deleteStep(index) {
      const $this = this
      this.$confirm({
        title: this.$t('Workflow.Step.Delete.Title'),
        content: this.$t('Workflow.Step.Delete.Tips', {
          name: $this.workflow.step[index].name,
        }),
        okText: this.$t('Action.Confirm'),
        cancelText: this.$t('Action.Cancel'),
        onOk() {
          WorkflowService.deleteWorkflowStep($this.id, $this.workflow.step[index].id).then(
            res => {
              $this.$message.success(
                $this.$t('Workflow.Step.Delete.Success', {
                  name: $this.workflow.step[index].name,
                }),
              )
              $this.getWorkflowInfo()
            },
            err => {
              $this.$message.error(err)
            },
          )
        },
      })
    },
    createStepJob(index) {
      if (this.workflow.step[index].stepJob.length >= 50) {
        this.$message.warning(this.$t('Workflow.MaxJobTips'))
        return false
      }
      const stepId = this.workflow.step[index].id
      this.$router.replace(`/main/workflow-job-template-store/${this.id}/${stepId}/''`)
    },
    editStepJob(index, subIndex) {
      this.$router.replace({
        name: 'workflow-job-edit',
        params: {
          workflowId: this.id,
          stepId: this.workflow.step[index].id,
          job: this.workflow.step[index].stepJob[subIndex],
          template: this.workflow.step[index].stepJob[subIndex].templateId,
        },
      })
    },
    copyStepJob(index, subIndex) {
      this.$router.replace({
        name: 'workflow-job-edit',
        params: {
          copy: true,
          workflowId: this.id,
          stepId: this.workflow.step[index].id,
          job: this.workflow.step[index].stepJob[subIndex],
          template: this.workflow.step[index].stepJob[subIndex].templateId,
        },
      })
    },
    moveJob(index, subIndex) {
      const steps = []
      const oldStepId = this.workflow.step[index].id
      this.workflow.step.forEach(el => {
        if (el.id !== this.workflow.step[index].id) {
          steps.push({
            id: el.id,
            name: el.name,
          })
        }
      })
      this.$refs.workflowJobMoveDialog
        .doMove(oldStepId, steps, this.workflow.step[index].stepJob[subIndex])
        .then(res => {
          this.getWorkflowInfo()
        })
    },
    deleteStepJob(index, subIndex) {
      const $this = this
      this.$confirm({
        title: this.$t('Workflow.Step.Job.Delete.Title'),
        content: this.$t('Workflow.Step.Job.Delete.Tips', {
          name: $this.workflow.step[index].stepJob[subIndex].jobName,
        }),
        okText: this.$t('Action.Confirm'),
        cancelText: this.$t('Action.Cancel'),
        onOk() {
          WorkflowService.deleteWorkflowStepJob(
            $this.workflow.step[index].id,
            $this.workflow.step[index].stepJob[subIndex].id,
          ).then(
            res => {
              $this.$message.success(
                $this.$t('Workflow.Step.Job.Delete.Success', {
                  name: $this.workflow.step[index].stepJob[subIndex].jobName,
                }),
              )
              $this.getWorkflowInfo()
            },
            err => {
              $this.$message.error(err)
            },
          )
        },
      })
    },
    showCloseIcon(index) {
      const closeIcon = document.querySelectorAll('.step-delete-icon')
      const editIcon = document.querySelectorAll('.step-edit-icon')
      for (let i = 0, j = closeIcon.length; i < j; i++) {
        if (index === i) {
          closeIcon[i].style.display = 'block'
          editIcon[i].style.display = 'block'
          break
        }
      }
    },
    hideCloseIcon(index) {
      const closeIcon = document.querySelectorAll('.step-delete-icon')
      const editIcon = document.querySelectorAll('.step-edit-icon')
      for (let i = 0, j = closeIcon.length; i < j; i++) {
        if (index === i) {
          closeIcon[i].style.display = 'none'
          editIcon[i].style.display = 'none'
          break
        }
      }
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
      // const data = {
      //   id: this.id,
      //   name: this.workflow.name,
      //   maxSubmitJobs: this.workflow.maxSubmitJobs,
      //   description: this.workflow.description,
      // }
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
.workflow-steps-editor {
  padding-bottom: 20px;
  overflow: auto;
  height: 592px;
}
.workflow-step-container {
  height: 552px;
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
  height: 500px;
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
.step-job-container {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  position: relative;
}
.create-new-step {
  padding: 10px;
  height: 552px;
}
.job-name {
  color: #000;
  position: relative;
  font-size: 14px;
  padding-right: 30px;
  word-break: break-all;
}
.job-type {
  margin: 8px 0 4px;
  color: #999;
  font-size: 12px;
  word-break: break-all;
}
.step-name-container {
  position: relative;
}
.step-name-container .step-edit-icon {
  font-size: 18px;
  position: absolute;
  right: 20px;
  top: 7px;
}
.step-name-container .step-delete-icon {
  font-size: 18px;
  position: absolute;
  right: 0;
  top: 7px;
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
.workflow-step-container >>> .ant-tooltip-inner {
  padding: 6px 12px;
  display: inline-block;
}
.icon-area i {
  font-size: 14px;
}
.icon-area {
  color: #666;
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
.template-warning-message {
  color: #ff5454;
}
</style>
