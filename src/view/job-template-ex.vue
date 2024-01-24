<template>
  <div class="height--100 p-10">
    <a-row v-if="jobTemplate != null" class="job-template-title">
      <!-- <a-col :xs="24" :sm="9" :md="7" :lg="5"
                    class="job-template-logo">
                    <img :src="getImage()" />
                </a-col> -->
      <a-col :span="24" class="job-template-info b-w">
        <div class="job-template-title-bg">
          <!-- <div :style="getImage()"></div> -->
        </div>
        <div class="job-template-title-content">
          <div class="job-template-title-logo" :style="getImage()" />
          <div class="job-template-title-context">
            <div class="logo-title">
              {{ jobTemplate.name }}
            </div>
            <div class="logo-description">
              {{ jobTemplate.description }}
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
    <div class="job-template-container">
      <a-row v-if="jobTemplate != null" style="display: flex; flex-flow: unset">
        <a-col style="width: 100%">
          <a-collapse
            id="Job_Template_Collapse"
            v-model:activeKey="activeNames"
            :bordered="false"
            expand-icon-position="right">
            <template #expandIcon="props">
              <span type="template_test" :custom="props" />
            </template>
            <a-collapse-panel
              v-for="paramGroup in paramGroups"
              :id="paramGroup.name"
              :key="paramGroup.name"
              force-render>
              <template #header>
                <span class="template-collapse-panel-header">
                  {{ paramGroup.title }}
                  <right-outlined
                    class="template-collapse-icon"
                    :class="[activeNames.includes(paramGroup.name) ? 'turn90' : 'turn-0']" />
                </span>
              </template>

              <job-parameters-editor
                ref="paramsEditor"
                :params="paramGroup.params"
                :context="paramValues"
                :form-id="'Job_Parameters_Form_' + paramGroup.name" />
            </a-collapse-panel>
          </a-collapse>
        </a-col>
        <a-col :style="`min-width: ${jobTemplate.helpUrl ? 420 : 220}px;margin-top: 12px;`" class="p-l-20">
          <iframe
            v-if="jobTemplate.helpUrl"
            :src="jobTemplate.helpUrl"
            frameborder="0"
            style="width: 100%; height: 100%" />
          <a-anchor v-else :get-container="getAnchorScrollContainer" :items="anchorOptions" @click.prevent.self />
        </a-col>
      </a-row>
      <a-row v-if="jobTemplate != null" class="submit-job-bottom-button p-t-20">
        <a-button id="Job_Submit" type="primary" :loading="submitting" @click="onSubmitClick">
          {{ buttonText }}
        </a-button>
        <a-button
          id="Job_Preview"
          style="margin-left: 4px"
          :disabled="submitting"
          :loading="preview.loading"
          @click="onPreviewClick">
          {{ $t('Action.Preview') }}
        </a-button>

        <a-tag v-if="balanceAlert" color="warning" style="margin-left: 4px">
          <InfoCircleFilled />
          <a href="#/main/report-billing" class="balance-alert-text">{{ $t('Balance.Alert.Text') }}</a>
        </a-tag>
      </a-row>
      <!-- <job-action-dialog id="tid_job-manange-action-dialog" ref="jobActionDialog" /> -->

      <!-- preview job modal -->
      <a-modal v-model:open="preview.modal" :title="$t('JobTemplate.Preview')">
        <a-textarea
          v-model:value="preview.content"
          :rows="20"
          read-only
          style="overflow-x: scroll; resize: none; white-space: pre" />

        <template #footer>
          <a-button @click="preview.modal = false">
            {{ $t('Action.Cancel') }}
          </a-button>
          <a-button type="primary" @click="onSubmitClick">
            {{ $t('Action.Submit') }}
          </a-button>
        </template>
      </a-modal>
    </div>
  </div>
</template>
<script>
import BillGroupService from '@/service/bill-group'
import JobService from '@/service/job'
import Request from '@/request/https'
import AccessService from '@/service/access'
import WorkflowService from '@/service/workflow'
import JobTemplateService from '@/service/job-template'
// import JobActionDialog from '@/widget/job-action-dialog.vue'
import JobParametersEditor from '@/widget/job-parameters-editor.vue'

export default {
  components: {
    // 'job-action-dialog': JobActionDialog,
    'job-parameters-editor': JobParametersEditor,
  },
  data() {
    return {
      activeNames: ['base', 'param', 'resource'],
      code: '',
      job: null,
      jobTemplate: null,
      submitting: false,
      paramGroups: [
        {
          name: 'base',
          title: this.$t('JobTemplate.BaseInformation'),
          params: [],
        },
        {
          name: 'param',
          title: this.$t('JobTemplate.Parameters'),
          params: [],
        },
        {
          name: 'resource',
          title: this.$t('JobTemplate.ResourceOptions'),
          params: [],
        },
        {
          name: 'adv_param',
          title: this.$t('JobTemplate.AdvancedParameters'),
          params: [],
        },
        {
          name: 'notify',
          title: this.$t('JobTemplate.NotifyOptions'),
          params: [],
        },
      ],
      paramValues: {},
      paramValueTypes: {},
      resources: null,
      scheduler: AccessService.getScheduler(),
      workflowMode: '',
      preview: {
        loading: false,
        modal: false,
        content: null,
      },
      defaultRunTime: '24h', // updated on mounted
      balanceAlert: false,
    }
  },
  computed: {
    buttonText() {
      if (this.$route.name === 'workflow-template-ex') {
        return this.$t('Workflow.SaveToWorkflow')
      } else if (this.$route.path.includes('workflow-job-template')) {
        return this.$t('Workflow.AddToWorkflow')
      } else {
        return this.$t('JobTemplate.Submit')
      }
    },
    anchorOptions() {
      return this.paramGroups.map(i => ({
        key: i.name,
        href: '#' + i.name,
        title: i.title,
      }))
    },
  },
  async mounted() {
    const { data } = await this.$axios.get('/api/template/default-run-time/')
    this.defaultRunTime = data

    // workflow ----------
    if (this.$route.name === 'workflow-template-ex') {
      this.code = this.$route.params.code
      const stepId = Number(this.$route.params.stepId)
      const stepJobId = Number(this.$route.params.stepJobId)
      if (this.$route.params.action === 'create') {
        this.init()
        return
      }
      WorkflowService.getWorkflowById(this.$route.params.workflowId).then(
        res => {
          this.job = {
            req: {
              params: {
                parameters: res.step.filter(s => s.id === stepId)[0].stepJob.filter(j => j.id === stepJobId)[0]
                  .jsonBody,
              },
            },
          }

          this.init()
        },
        err => {
          this.$message.error(err)
        },
      )
      // ---------------
    } else if (this.$route.params.code) {
      this.code = this.$route.params.code
      this.job = null
      const query = this.$route.query
      if (query.params_string) {
        this.job = {
          req: {
            params: {
              parameters: JSON.parse(query.params_string),
            },
          },
        }
      }
      this.code = this.$route.params.code
      this.init()
    }
    if (this.$route.params.jobId) {
      JobService.getJobById(this.$route.params.jobId, { templateSync: false }).then(
        res => {
          this.job = res
          this.code = this.job.type
          this.init()
        },
        res => {
          this.$message.error(res)
        },
      )
    }

    // balanceAlert --------
    BillGroupService.getUserBillGroup().then(res => {
      this.balanceAlert = res.balance_alert
    })
  },
  methods: {
    getAnchorScrollContainer() {
      const element = document.getElementById('Workflow-Scroll-Modal-Container')
      return element || window
    },
    init() {
      const paramValues = {}
      const paramValueTypes = {}
      JobTemplateService.getJobTemplate(this.code).then(
        res => {
          res.params.forEach(param => {
            paramValues[param.id] = this.getInitParamValue(param.id)
            paramValueTypes[param.id] = param.dataType
            this.paramGroups.forEach(group => {
              if (param.class === group.name) {
                group.params.push(param)
              }
            })
          })
          // Remove the group that not contains param.
          const paramGroups = []
          this.paramGroups.forEach(group => {
            if (group.params.length > 0) {
              paramGroups.push(group)
            }
          })
          this.paramGroups = paramGroups
          if (Object.prototype.hasOwnProperty.call(paramValues, 'job_name')) {
            const prefillName = `${res.name.replace(/\s|-/g, '_')}_`.replace(/_+/g, '_')
            paramValues.prefix_job_name = prefillName
          }
          this.paramValues = paramValues
          this.paramValueTypes = paramValueTypes
          this.jobTemplate = res

          // check if there is a default value for the resource run_time
          const group = this.paramGroups.find(g => g.name === 'resource')
          if (group) {
            const runTime = group.params.find(p => p.id === 'run_time')
            if (runTime && !runTime.defaultValue) {
              runTime.defaultValue = this.defaultRunTime
            }
          }
        },
        res => {
          this.$message.error(res)
        },
      )
    },
    getInitParamValue(paramId) {
      if (this.job && this.job.req && this.job.req.params && this.job.req.params.parameters) {
        return this.job.req.params.parameters[paramId]
      }
      return null
    },
    getImage() {
      const type = this.jobTemplate.type === 'system' ? 'job' : 'user'
      const img = `/api/template/${type}templates/${this.code}/logo/`
      return {
        'background-image': `url(${img})`,
      }
    },
    getIconRotate(name) {
      return this.activeNames.includes(name) ? 90 : 0
    },
    doCreateJob(nextUrl) {
      const params = this.paramValues
      const paramTypes = this.paramValueTypes
      this.submitting = true
      // Workflow -------------
      if (this.$route.name === 'workflow-template-ex') {
        const req = {}
        const webhook = []
        JobService.buildJobReq(this.jobTemplate.code, params, req, webhook)
        const stepId = this.$route.params.stepId
        let data = { jsonBody: req }
        let requestFn = null
        let message = ''
        if (this.$route.params.action === 'edit') {
          data.id = Number(this.$route.params.stepJobId)
          requestFn = WorkflowService.updateWorkflowStepJob
          message = 'Update'
        } else {
          data.template = this.code
          requestFn = WorkflowService.createWorkflowStepJob
          message = this.$route.params.action === 'copy' ? 'Copy' : 'Create'
        }
        this.saveToWorkflow(requestFn, { stepId, data }, () => {
          this.$message.success(
            this.$T(`Workflow.Step.Job.${message}.Success`, {
              name: req.job_name,
            }),
          )
          this.$router.replace(`/main/workflow-editor/${this.$route.params.workflowId}`)
        })
        // ----------------------
      } else {
        JobService.createJobEx(this.jobTemplate, params, paramTypes).then(
          res => {
            this.submitting = false
            const job = res
            let message
            if (job.schedulerId && job.schedulerId.length > 0) {
              message = this.$T('Job.Submit.Success', {
                id: job.id,
                name: job.name,
                schedulerId: job.schedulerId,
              })
              this.$message.success(message)
              if (nextUrl) {
                this.$router.push({ path: nextUrl })
              } else {
                this.$router.push({
                  path: '/main/job/' + job.id,
                })
              }
            } else {
              const title = this.$t('Job.Submit.Error')
              message = job.errmsg
              this.$message.error(message || title)
            }
          },
          res => {
            this.submitting = false
            this.$message.error(res)
          },
        )
      }
    },
    getMinIntValue(m, n) {
      if (m || n) {
        if (Number(m) && Number(n)) {
          return Math.min(Number(m), Number(n))
        } else if (Number(m) || Number(n)) {
          return Number(m) ? Number(m) : Number(n)
        } else {
          return Infinity
        }
      }
      return Infinity
    },
    saveToWorkflow(requestFn, { stepId, data }, callback) {
      requestFn(stepId, data).then(
        _ => {
          callback()
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    onSubmitClick() {
      this.preview.modal = false

      const validates = []
      this.$refs.paramsEditor.forEach(editor => {
        validates.push(editor.validate())
      })
      Promise.all(validates).then(
        () => {
          // Using underline character in job name maybe cause the job fail to run
          const nameWarningMsg = ''

          /// / if the number of cores or nodes exceeds the maximum resource limit
          let submitTitle = this.$t('JobTemplate.Submit.Tip')
          let emptyQueue = false
          if (AccessService.getScheduler() === 'slurm' && this.$refs.paramsEditor[2]) {
            const queueValue = this.$refs.paramsEditor[2].formModel
            const overflowItem = []
            if (Object.prototype.hasOwnProperty.call(queueValue, 'job_queue') || this.resources) {
              let resources = {}
              if (this.resources) {
                // container
                resources = this.resources
              } else {
                // host
                const queueOptions = this.$refs.paramsEditor[2].getQueueOptions()
                queueOptions.forEach(val => {
                  if (val.value === queueValue.job_queue) {
                    resources = val
                  }
                })
              }
              if (
                Object.prototype.hasOwnProperty.call(queueValue, 'job_queue') &&
                !Object.prototype.hasOwnProperty.call(resources, 'totalNodes')
              ) {
                emptyQueue = true
              } else {
                if (Object.prototype.hasOwnProperty.call(queueValue, 'nodes')) {
                  if (Number(queueValue.nodes) > this.getMinIntValue(resources.maxNodes, resources.totalNodes)) {
                    overflowItem.push(this.$t('JobTemplate.Nodes'))
                  }
                }
                if (Object.prototype.hasOwnProperty.call(queueValue, 'cores_per_node')) {
                  if (
                    (Number(resources.maxCoresPerNode) > 0 &&
                      Number(queueValue.cores_per_node) > Number(resources.maxCoresPerNode)) ||
                    (Object.prototype.hasOwnProperty.call(queueValue, 'nodes') &&
                      Number(queueValue.nodes * queueValue.cores_per_node) > Number(resources.totalCores) &&
                      resources.totalCores) ||
                    (Number(queueValue.cores_per_node) > Number(resources.totalCores) && resources.totalCores)
                  ) {
                    overflowItem.push(this.$t('JobTemplate.MaxCoresPerNode'))
                  }
                }
                if (Object.prototype.hasOwnProperty.call(queueValue, 'gpuPerNode')) {
                  const gpuPerNode = Number(queueValue.gpuPerNode) || 0
                  const nodes = Number(queueValue.nodes) || 0
                  const gpuType = queueValue.gpu_resource_name || ''
                  const resourceMig = resources.gpuOptions.filter(mig => mig.type.split('G/')[1] === gpuType)[0]

                  let maxGpusPerNode = Number(resources.maxGpusPerNode) || 0
                  let gpuTotal = Number(resources.gpuNum) || 0

                  if (resourceMig) {
                    maxGpusPerNode = resourceMig.maxPerNode
                    gpuTotal = resourceMig.free
                  }
                  if (gpuPerNode) {
                    if (!gpuTotal || nodes * gpuPerNode > gpuTotal || (gpuType && gpuPerNode > maxGpusPerNode)) {
                      overflowItem.push(this.$t('JobTemplate.GpusPerNode'))
                    }
                  }
                }
              }
            }
            submitTitle =
              overflowItem.length > 0
                ? this.$T('JobTemplate.Submit.Tip.Overflow', {
                    name: overflowItem.join(','),
                  })
                : emptyQueue
                ? this.$t('JobTemplate.Submit.Tip.Queue.Null')
                : this.$t('JobTemplate.Submit.Tip')
          }
          if (this.$route.path.includes('workflow-job-template')) {
            // The workflow does not need to pop up a confirmation prompt
            this.doCreateJob()
          } else {
            this.$confirm({
              title: this.$t('JobTemplate.Submit.Tip.Title'),
              content: nameWarningMsg + submitTitle,
              centered: true,
              okText: this.$t('Action.Submit'),
              cancelText: this.$t('Action.Cancel'),
              onOk: () => {
                this.doCreateJob()
              },
            })
          }
        },
        () => {
          // Do nothing
        },
      )
    },
    onPreviewClick() {
      this.preview.content = null
      this.preview.loading = true
      const validates = []
      this.$refs.paramsEditor.forEach(editor => {
        validates.push(editor.validate())
      })
      Promise.all(validates).then(
        () => {
          const parameters = this.paramValues
          Request.post('/api/template/previewjob/', {
            parameters,
            template_id: this.jobTemplate.code,
          }).then(
            response => {
              this.preview.loading = false
              this.preview.modal = true
              this.preview.content = response.data
            },
            err => {
              this.$message.error(this.$t(`Error.${err.status === 400 ? err.body.errid : 'Unknown'}`))
              this.preview.loading = false
            },
          )
        },
        () => {
          this.preview.loading = false
        },
      )
    },
  },
}
</script>
<style scoped>
.logo-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}
.logo-description {
  font-size: 14px;
}
.job-template-container {
  box-sizing: border-box;
  /* height: 100%; */
  padding: 20px;
}
.job-template-info {
  position: relative;
  border-bottom: 1px solid #d9d9d9;
}
.job-template-title-bg {
  height: 140px;
  padding: 10px;
  background-repeat: no-repeat;
  background-size: 100%;
  background-position-y: center;
}
.job-template-title-bg div {
  background-repeat: no-repeat;
  background-size: 100%;
  background-position-y: center;
  height: 100%;
  filter: blur(10px);
}
.job-template-title-content {
  position: absolute;
  top: 0;
  height: 140px;
  width: 100%;
  padding: 20px;
  /* background: #fff; */
  display: flex;
  box-sizing: border-box;
}
.job-template-title-logo {
  width: 100px;
  height: 100px;
  margin-right: 20px;
  background-repeat: no-repeat;
  background-size: contain;
  border-radius: 8px;
  flex-shrink: 0;
}
.job-template-title-context {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.job-template-id {
  width: 80px;
}
.job-template-container :deep(.ant-tag) {
  padding: 4px 10px;
}
.template-collapse-panel-header {
  font-weight: bold;
  margin-left: 4px;
}
.template-collapse-icon {
  margin-left: 10px;
  font-size: 12px;
}
.submit-job-bottom-button {
  border-top: 1px solid #d9d9d9;
}
.balance-alert-text {
  color: #e98b00;
  font-weight: bold;
  font-size: 13px;
  text-decoration: underline;
  margin-left: 4px;
}
a:hover {
  color: #e98b00;
}
</style>
