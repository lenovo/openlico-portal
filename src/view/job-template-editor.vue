<template>
  <div class="height--100 p-10">
    <div class="job-template-editor-container file-icon-select table-style b-w p-20">
      <a-form-model ref="innerForm" :model="formModel" :rules="formRules" label-width="200px" :colon="false">
        <a-row>
          <a-collapse v-model="activeNames" :bordered="false">
            <a-collapse-panel key="base" :header="$t('JobTemplate.BaseInformation')">
              <a-form-model-item :label="$t('JobTemplate.Name')" prop="name">
                <a-input v-model="formModel.name" style="width: 300px" />
              </a-form-model-item>
              <a-form-model-item :label="$t('JobTemplate.Logo')" prop="logo">
                <file-icon-select ref="fileAlertSelect" v-model="formModel.logo" :restore-icon="restoreIcon" />
                <span>{{ $t('JobTemplate.Logo.size') }}</span>
              </a-form-model-item>
              <a-form-model-item :label="$t('JobTemplate.Category')" prop="category">
                <a-select v-model="formModel.category" style="width: 300px">
                  <template v-for="item in categories">
                    <a-select-option :key="item.key">
                      {{ item.label || item.key }}
                    </a-select-option>
                  </template>
                </a-select>
              </a-form-model-item>
              <a-form-model-item
                v-if="formModel.category == 'custom'"
                :label="$t('JobTemplateStore.Category.CustomCategory')"
                prop="customCategory">
                <a-input v-model="formModel.customCategory" style="width: 300px" @blur="onCustomCategoryBlur" />
              </a-form-model-item>
              <a-form-model-item :label="$t('JobTemplate.Description')" prop="description">
                <a-input v-model="formModel.description" style="width: 300px" />
              </a-form-model-item>
              <a-form-model-item prop="index" class="job-template-editor-form-item">
                <span slot="label">
                  {{ $t('JobTemplate.Index') }}&nbsp;
                  <a-tooltip placement="rightBottom">
                    <div slot="title" style="min-width: 200px; white-space: break-spaces">
                      {{ $t('JobTemplate.Index.Tips') }}
                    </div>
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </span>
                <a-input v-model="formModel.index" style="width: 300px" />
              </a-form-model-item>
            </a-collapse-panel>

            <a-collapse-panel key="param" :header="$t('JobTemplate.Parameters')">
              <parameters-editor :parameters="formModel.parameters" />
            </a-collapse-panel>
            <a-collapse-panel key="file" :header="$t('JobTemplate.TemplateFile')">
              <template-file-editor ref="templateFileEditor" :content="formModel.fileTemplate" />
            </a-collapse-panel>
          </a-collapse>
        </a-row>
        <a-row style="margin-top: 20px">
          <a-button
            id="Job_Template_Submit"
            style="margin-right: 10px"
            type="primary"
            :loading="submitting"
            @click="onSubmitClick">
            {{ $t('JobTemplate.Submit') }}
          </a-button>
          <a-button id="Job_template_Cancel" :loading="submitting" @click="onBackClick">
            {{ $t('JobTemplate.Cancel') }}
          </a-button>
        </a-row>
      </a-form-model>
    </div>
  </div>
</template>
<script>
import JobTemplateService from '../service/job-template'
import ValidRoleFactory from '../common/valid-role-factory'
import ParametersEditor from './job-template-editor/parameters-editor'
import TemplateFileEditor from './job-template-editor/template-file-editor'
import FileIconSelect from '../component/file-icon-select'
import AccessService from '../service/access'

export default {
  components: {
    'parameters-editor': ParametersEditor,
    'template-file-editor': TemplateFileEditor,
    'file-icon-select': FileIconSelect,
  },
  data() {
    const fileTemplateExamples = {
      slurm:
        '#!/bin/bash\n#SBATCH --job-name={{job_name}}\n#SBATCH --chdir={{job_workspace}}\n#SBATCH --partition={{job_queue}}\n{% if run_time %}#SBATCH --time={{ run_time|timeformat }}{% endif %}',
      lsf: '#!/bin/bash\n#BSUB -J {{ job_name }}\n#BSUB -q {{ job_queue }}\n#BSUB -cwd {{ job_workspace }}\n{% if run_time %}#BSUB -W {% format_lsf_walltime run_time %}{% endif %}',
      pbs: '#!/bin/bash\n#PBS -N {{ job_name }}\n#PBS -q {{ job_queue }}\n#{% if run_time %}#PBS -l walltime={% format_pbs_walltime run_time %}{% endif %}\n#PBS -V\ncd {{ job_workspace }}',
    }

    return {
      activeNames: ['base', 'param', 'file'],
      restoreIcon: '',
      code: '',
      jobTemplate: null,
      formModel: {
        name: '',
        logo: '',
        category: '',
        customCategory: '',
        description: '',
        index: 99999,
        parameters: [],
        fileTemplate: fileTemplateExamples[AccessService.getScheduler()],
      },
      formRules: {
        name: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Name')),
          ValidRoleFactory.getValidTemplateFileName(this.$t('JobTemplate.Name')),
          ValidRoleFactory.getLengthRoleForText(this.$t('JobTemplate.Name'), 3, 20),
        ],
        logo: [ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Logo'))],
        customCategory: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplateStore.Category.CustomCategory')),
          ValidRoleFactory.getValidTemplateFileName(this.$t('JobTemplateStore.Category.CustomCategory')),
          ValidRoleFactory.getLengthRoleForText(this.$t('JobTemplateStore.Category.CustomCategory'), 3, 20),
          {
            validator: (rule, value, callback) => {
              const val = value.toLowerCase()
              if (val === 'custom' || val === 'all') {
                callback(new Error(this.$t('JobTemplateStore.Category.CustomCategory.Error')))
              } else {
                callback()
              }
            },
            trigger: 'change',
          },
        ],
        description: [ValidRoleFactory.getLengthRoleForText(this.$t('JobTemplate.Description'), 0, 100)],
        index: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Index')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.Index')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.Index'), 1, 99999),
          ValidRoleFactory.getVaildPositiveInteger(this.$t('JobTemplate.Index')),
        ],
      },
      submitting: false,
      categories: [],
      defaultParams: [],
    }
  },
  watch: {
    'formModel.logo': function (val, oldVal) {
      if (val.indexOf('data:image/jpeg;base64,') === 0) {
        this.formRules.logo = [ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Logo'))]
      } else {
        this.formRules.logo = [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Logo')),
          ValidRoleFactory.getSuffixValid(this.$t('JobTemplate.Logo'), ['jpeg', 'jpg', 'png', 'bmp']),
        ]
      }
      if (val) {
        this.$refs.innerForm.validateField(['logo'])
      }
    },
  },
  mounted() {
    this.initDefaultParams()
    this.getTemplateCategories()
    if (this.$route.params.code) {
      this.code = this.$route.params.code
      this.jobTemplate = null
      this.init()
    } else {
      this.formModel.parameters = this.defaultParams
    }
  },
  methods: {
    init() {
      JobTemplateService.getJobTemplate(this.code).then(
        res => {
          const defaurtParamsKeys = this.defaultParams.map(p => p.name)
          const customParams = res.params.filter(p => !defaurtParamsKeys.includes(p.name))

          if (this.$route.path.includes('job-template-editor/copy')) {
            this.formModel.name = res.name + '_' + 'copy'
          } else {
            this.formModel.name = res.name
          }
          this.formModel.logo = res.logo
          this.formModel.category = res.category[0] || this.formModel.category
          this.formModel.description = res.description
          this.formModel.index = res.index
          this.formModel.parameters = this.defaultParams.concat(customParams)
          this.formModel.fileTemplate = res.templateFileContent
          this.restoreIcon = res.logo
        },
        res => {
          this.$message.error(res)
        },
      )
    },
    initDefaultParams() {
      const parameters = [
        {
          id: 'job_name',
          name: this.$t('Job.Name'),
          class: 'base',
          dataType: 'string',
          must: true,
          type: 'system',
          input: 'input',
          maxLength: 64,
        },
        {
          id: 'job_workspace',
          name: this.$t('Job.Workspace'),
          class: 'param',
          dataType: 'folder',
          must: true,
          type: 'system',
        },
      ]
      if (AccessService.getSchedulerArch() === 'host') {
        parameters.push({
          id: 'job_queue',
          name: this.$t('Job.Queue'),
          class: 'resource',
          dataType: 'queue',
          must: true,
          type: 'system',
        })
        parameters.push({
          id: 'run_time',
          name: this.$t('Job.RunTime'),
          class: 'resource',
          dataType: 'string',
          input: 'input',
          defaultValue: '24h',
          must: false,
          type: 'system',
          tips: {
            type: 'text',
            content: 'eg.3d 4h 12m',
          },
          help: this.$t('Job.RunTime.Help'),
        })
      }
      parameters.push({
        id: 'job_notify',
        name: this.$t('Job.Notify'),
        class: 'notify',
        dataType: 'string',
        must: false,
        type: 'system',
        input: 'select',
        selectOption: [
          {
            label: this.$t('Job.Notify.None'),
            value: '',
          },
          {
            label: this.$t('Job.Notify.Email'),
            value: 'email',
          },
        ],
      })
      this.defaultParams = parameters
    },
    onSubmitClick() {
      this.$refs.innerForm.validate(valid => {
        if (valid) {
          if (this.formModel.parameters.length <= 0) {
            this.$message.error(
              this.$t('Valid.Require', {
                name: this.$t('JobTemplate.Parameters'),
              }),
            )
            return false
          }
          const fileTemplateContent = this.$refs.templateFileEditor.getContent()
          if (fileTemplateContent.length <= 0) {
            this.$message.error(
              this.$t('Valid.Require', {
                name: this.$t('JobTemplate.TemplateFile'),
              }),
            )
            return false
          }
          this.submitting = true
          let submitPromise = null
          let mode = ''
          const runTime = this.formModel.parameters.filter(param => param.id === 'run_time')[0]
          const parameters = this.formModel.parameters.filter(param => param.id !== 'run_time')
          if (AccessService.getSchedulerArch() === 'host') {
            parameters.push(runTime)
          }

          if (this.code === '' || this.$route.path.includes('job-template-editor/copy')) {
            mode = 'Create'
            submitPromise = JobTemplateService.createJobTemplate(this.formModel, parameters, fileTemplateContent)
          } else {
            mode = 'Update'
            submitPromise = JobTemplateService.updateJobTemplate(
              this.code,
              this.formModel,
              parameters,
              fileTemplateContent,
            )
          }
          submitPromise.then(
            res => {
              this.submitting = false
              const jobTemplate = res
              const message = this.$t(`JobTemplate.Submit.${mode}.Success`, {
                id: jobTemplate.id,
                name: jobTemplate.name,
              })
              this.$message.success(message)
              if (this.$route.path.includes('job-template-editor/copy')) {
                this.$router.push({
                  path: '../../job-template-store/mytemplates',
                })
              } else {
                this.$router.push({
                  path: '../job-template-store/mytemplates',
                })
              }
            },
            res => {
              this.submitting = false
              this.$message.error(res)
            },
          )
        } else {
          return false
        }
      })
    },
    onBackClick() {
      this.$confirm({
        content: this.$t('JobTemplate.Cancel.Text'),
        okText: this.$t('Action.Confirm'),
        cancelText: this.$t('Action.Cancel'),
        onOk() {
          window.history.back()
        },
      })
    },
    onCustomCategoryBlur(e) {
      const val = e.target.value
      if (this.categories.map(i => i.key).includes(val) && val !== 'All' && val !== 'custom') {
        this.formModel.category = val
      }
    },
    getTemplateCategories() {
      JobTemplateService.getTemplateCategory().then(
        res => {
          this.categories = res[0].filter(i => i.key !== 'All')
          if (this.categories.length) {
            this.categories.push({
              key: 'custom',
              label: this.$t('JobTemplateStore.Category.Custom'),
            })
            if (!this.formModel.category) {
              this.formModel = { ...this.formModel, category: this.categories[0].key }
            }
          }
        },
        err => {
          this.$message.error(err)
        },
      )
    },
  },
}
</script>
<style scoped>
.file-icon-select .el-dialog__body {
  padding: 0 20px;
}
.job-template-editor-container >>> .table-but-icon {
  margin-right: 3px;
  font-size: 16px;
}
.job-template-editor-container >>> .job-template-editor-form-item .ant-form-item-label {
  overflow: unset;
}
</style>
