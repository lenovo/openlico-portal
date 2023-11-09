<template>
  <div class="step-job-container">
    <div class="job-name">
      {{ stepJob.jobName }}
      <a-dropdown v-if="job || mode === 'edit'" class="job-action-button" :trigger="['hover']">
        <i class="el-erp-more2" />
        <template #overlay>
          <a-menu>
            <slot name="actions" :job="job" :template="template">
              <a-menu-item key="detail" @click="jobDetail(stepJob.jobId)">
                {{ $t('Action.Info') }}
              </a-menu-item>
            </slot>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <div class="job-status">
      <job-status-label
        v-if="job && mode !== 'edit'"
        v-model:status="job.status"
        :operate-status="job.operateStatus"
        :ai-operate-status="job.aiOperateStatus" />
    </div>
    <div class="job-type">
      <span v-if="template === null" class="template-warning-message">
        <exclamation-circle-outlined />
        {{ $t('Workflow.Template.Tips') }}</span
      >
      <span v-else>{{ template }}</span>
    </div>
    <a-row class="icon-area">
      <a-col v-if="computedNodes !== false" :span="8" :title="$t('Workflow.Nodes') + ': ' + computedNodes">
        <i class="el-erp-monitor_node" />{{ computedNodes }}
      </a-col>
      <a-col v-if="computedCores !== false" :span="8" :title="$t('Workflow.Cores') + ': ' + computedCores">
        <i class="el-erp-cpu" />{{ computedCores }}
      </a-col>
      <a-col v-if="computedGpus !== false" :span="8" :title="$t('Workflow.GPU') + ': ' + computedGpus">
        <i class="el-erp-GPU" />{{ computedGpus }}
      </a-col>
    </a-row>
  </div>
</template>
<script>
import JobService from '@/service/job'
import TemplateService from '@/service/job-template'
import JobStatusLabel from '@/widget/job-status-label.vue'
export default {
  components: {
    JobStatusLabel,
  },
  props: ['stepJob', 'mode'],
  data() {
    return {
      job: null,
      template: '',
    }
  },
  computed: {
    computedNodes() {
      const jsonBody = this.stepJob.jsonBody
      if (Object.prototype.hasOwnProperty.call(jsonBody, 'nodes')) {
        return jsonBody.nodes
      } else {
        return false
      }
    },
    computedCores() {
      const jsonBody = this.stepJob.jsonBody
      if (Object.prototype.hasOwnProperty.call(jsonBody, 'cores_per_node')) {
        if (Object.prototype.hasOwnProperty.call(jsonBody, 'exclusive') && jsonBody.exclusive) {
          return false
        }
        return jsonBody.nodes * jsonBody.cores_per_node
      } else {
        return false
      }
    },
    computedGpus() {
      const jsonBody = this.stepJob.jsonBody
      if (Object.prototype.hasOwnProperty.call(jsonBody, 'gpu_per_node')) {
        const gpuNumber = jsonBody.nodes * jsonBody.gpu_per_node
        if (gpuNumber <= 0) {
          return false
        }
        return gpuNumber
      } else {
        return false
      }
    },
  },
  watch: {
    stepJob(val) {
      this.getJob()
    },
  },
  mounted() {
    this.getJob()
    this.getJobTemplate()
  },
  methods: {
    jobDetail(id) {
      this.$router.push({ path: '/main/job/' + id })
    },
    getJob() {
      if (this.stepJob.jobId === -1) {
        this.job = { status: 'failed' }
        return
      }
      if (this.stepJob.jobId === null) return
      if (this.job && JobService.JobWebStatusEnums.finished.includes(this.job.status)) return
      JobService.getJobById(this.stepJob.jobId, { jobtemplateSync: false }).then(
        res => {
          this.job = res
        },
        err => {},
      )
    },
    getJobTemplate() {
      if (Number.isInteger(Number(this.stepJob.templateId))) {
        TemplateService.getJobTemplate(this.stepJob.templateId).then(
          res => {
            this.template = res.name
          },
          _ => {
            this.template = null
          },
        )
      } else {
        this.template = this.stepJob.templateId
      }
    },
  },
}
</script>
<style scoped>
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
  margin-top: 10px;
  padding: 10px 0;
  height: 36px;
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
.workflow-steps-editor :deep(.state-label) {
  width: 14px;
  height: 14px;
}
.template-warning-message {
  color: #ff5454;
}
</style>
