<template>
  <a-spin :spinning="loading">
    <a-form-model
      :id="formId"
      ref="innerForm"
      :model="formModel"
      :rules="formRules"
      :colon="false"
      class="job-parameters-editor-form">
      <slot name="paramsTop" />
      <template v-for="param in displayParams">
        <a-form-model-item :key="param.id" :prop="param.id">
          <span v-if="!param.help" slot="label">{{ param.name }}</span>
          <span v-else slot="label">
            {{ param.name }}
            <a-tooltip :title="param.help" placement="topLeft" :get-popup-container="n => n.ownerDocument.body">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input
            v-if="param.type == 'string' && param.mode == 'input'"
            v-model="formModel[param.id]"
            style="width: 300px"
            :class="param.id == 'job_name' && defaultName == formModel[param.id] ? 'prefill' : ''"
            @focus="emptyCall($event, param.id)"
            @blur="fillDefaultName(param.id)" />
          <a-input
            v-if="param.type == 'number' && param.mode == 'input' && !param.multi"
            v-model="formModel[param.id]"
            style="width: 300px"
            :disabled="param.disabled"
            @focus="emptyCall" />
          <a-input-password
            v-if="param.type == 'password'"
            v-model="formModel[param.id]"
            :disabled="param.disabled"
            autocomplete="new-password"
            style="width: 300px"
            @focus="emptyCall" />
          <multi-tags-input
            v-if="param.type == 'number' && param.mode == 'input' && param.multi"
            v-model="formModel[param.id]"
            :valid-roles="multiInputRules[param.id]"
            :disabled="false"
            :allow-clear-all="false" />
          <a-select
            v-if="(param.type == 'string' || param.type == 'number') && param.mode == 'select'"
            v-model="formModel[param.id]"
            style="width: 300px">
            <template v-for="item in param.options">
              <a-select-option v-if="!item.children" :key="item.value">
                {{ item.label }}
              </a-select-option>
              <a-select-opt-group v-else :key="item.label">
                <span slot="label">{{ item.label }}</span>
                <a-select-option v-for="child in item.children" :key="child.value">
                  {{ child.label }}
                </a-select-option>
              </a-select-opt-group>
            </template>
          </a-select>
          <div v-if="param.tipsHelp && param.tipsHelp[formModel[param.id]]" class="remotely_debug_tip">
            <p>
              <a-icon type="exclamation-circle" theme="filled" class="help-icon" />
            </p>
            <p>{{ getLocalizeVal($i18n.locale, param.tipsHelp[formModel[param.id]]) }}</p>
          </div>
          <a-checkbox v-if="param.type == 'boolean'" v-model="formModel[param.id]" :label="param.label" />
          <a-input
            v-if="param.type == 'text'"
            v-model="formModel[param.id]"
            type="textarea"
            style="width: 600px"
            :auto-size="{ minRows: 10 }"
            resize="none" />
          <file-select
            v-if="param.type == 'file'"
            v-model="formModel[param.id]"
            :special_character="true"
            type="file"
            style="width: 375px" />
          <file-select
            v-if="param.type == 'folder'"
            v-model="formModel[param.id]"
            :special_character="true"
            type="folder"
            style="width: 375px" />
          <image-selection
            v-if="param.type == 'image'"
            v-model="formModel[param.id]"
            :arch="arch"
            :images="imageOptions" />
          <queue-selector
            v-if="param.type == 'queue'"
            ref="queueSelector"
            v-model="formModel[param.id]"
            select-style="width: 300px;" />
          <learning-rate-editor
            v-if="param.type == 'ext.learning_rate'"
            v-model="formModel[param.id]"
            :multi="param.multi" />
          <optimizer-editor v-if="param.type == 'ext.optimizer'" v-model="formModel[param.id]" :multi="param.multi" />
          <training-steps-editor v-if="param.type == 'ext.training_epochs'" v-model="formModel[param.id]" />
          <ps-worker-editor
            v-if="param.type == 'ext.psworker'"
            v-model="formModel[param.id]"
            :nodes="context[param.nodesField]"
            :gpu-per-node="context[param.gpuPerNodeField]"
            :worker-auto-policy="param.workerAutoPolicy"
            :ps-policy="param.psPolicy" />
          <load-module-editor
            v-if="param.type == 'runtime'"
            v-model="formModel[param.id]"
            :param="param"
            style="width: 450px" />
          <affinity-editor
            v-if="param.type.split('.').includes('affinity')"
            v-model="formModel[param.id]"
            :type="param.type.split('.').pop()" />
          <mig-editor v-if="param.type == 'mig'" v-model="formModel[param.id]" :mig-options="migOptions" />
          <early-stop-editor
            v-if="param.type == 'ext.early_stop'"
            v-model="formModel[param.id]"
            :settings="param.settings" />
          <license-feature v-if="param.type == 'license_feature'" v-model="formModel[param.id]" />
          <span v-if="param.tips">
            <a v-if="param.tips.type == 'link'" :href="param.tips.url" class="tips-link" target="_blank">{{
              param.tips.name
            }}</a>
            <span v-if="param.tips.type == 'text'" style="color: rgba(153, 153, 153, 1)">
              {{ param.tips.content }}</span
            >
          </span>
        </a-form-model-item>
      </template>
    </a-form-model>
  </a-spin>
</template>
<script>
import ImageService from '../service/image'
import ValidRoleFactory from '../common/valid-role-factory'
import FileSelect from '../component/file-select'
import QueueSelector from './queue-selector'
import AccessService from '../service/access'
import JobTemplateService from '../service/job-template'
import LearningRateEditor from './job-parameters-editor/learning-rate-editor'
import OptimizerEditor from './job-parameters-editor/optimizer-editor'
import TrainingStepsEditor from './job-parameters-editor/training-steps-editor'
import PSWorkerEditor from './job-parameters-editor/ps-worker-editor'
import MultiTagsInput from '../component/multi-tags-input'
import LoadModuleEditor from './job-parameters-editor/load-module-editor'
import ImageSelection from '../widget/image-selection'
import AffinityEditor from '../widget/job-parameters-editor/affinity-editor'
import MigEditor from './job-parameters-editor/mig-editor.vue'
import Format from '../common/format'
import Utils from '../common/utils'
import EarlyStopEditor from './job-parameters-editor/early-stop-editor.vue'
import LicenseFeature from './job-parameters-editor/license-feature.vue'

export default {
  components: {
    'file-select': FileSelect,
    'queue-selector': QueueSelector,
    'learning-rate-editor': LearningRateEditor,
    'optimizer-editor': OptimizerEditor,
    'training-steps-editor': TrainingStepsEditor,
    'ps-worker-editor': PSWorkerEditor,
    'multi-tags-input': MultiTagsInput,
    'load-module-editor': LoadModuleEditor,
    'image-selection': ImageSelection,
    'affinity-editor': AffinityEditor,
    MigEditor,
    EarlyStopEditor,
    LicenseFeature,
  },
  props: {
    params: {},
    context: {},
    formId: {
      type: String,
      default: 'Job_Parameters_Editor_Form',
    },
  },
  data() {
    return {
      defaultName: '',
      formModel: null,
      formRules: null,
      innerParams: [],
      displayParams: [],
      queueOptions: [],
      imageOptions: [],
      scheduler: '',
      arch: 'host',
      paramVisible: {},
      paramTriggerCache: {},
      multiInputRules: null,
      promiseList: [],
      loading: false,
      migOptions: [],
    }
  },
  watch: {
    params: {
      handler(val, oldVal) {
        this.init()
      },
      deep: true,
    },
    formModel: {
      handler(val, oldVal) {
        const paramValues = this.getParamValues(val)
        const innerContext = this.context
        this.innerParams.forEach(param => {
          innerContext[param.id] = paramValues[param.id]
        })
        this.initContext(innerContext)
      },
      deep: true,
    },
    context: {
      handler(val, oldVal) {
        this.initContext(val)
      },
      deep: true,
    },
  },
  created() {
    this.scheduler = AccessService.getScheduler()
    this.arch = AccessService.getSchedulerArch()
  },
  mounted() {
    this.init()
  },
  methods: {
    initContext(context) {
      // chenjun19 2021/9/8
      // bug 239421
      // filter need display params
      this.displayParams = this.innerParams.filter(param => {
        if (param.visible) {
          // eslint-disable-next-line no-eval
          this.paramVisible[param.id] = eval(param.visible)
          // wengmh1 2021/5/25
          // Bug 232018
          // When the param became unvisible, if the input value
          // is empty, return to default value.
          // This can help to avoid being unable to submit job
          // due to the unvisible error message of validation.
          // This only works on string, number type.
          if (!this.paramVisible[param.id] && param.require) {
            // chenjun19 2021/9/7
            // Bug 239319
            // If the input value is empty and has default value, return default value
            // Otherwise, automatic verification is triggered
            if (this.formModel[param.id] === '' && Object.prototype.hasOwnProperty.call(param, 'default')) {
              this.formModel[param.id] = param.default
            }
          }
        }
        if (param.valueTrigger) {
          let oldOne = null
          if (Object.prototype.hasOwnProperty.call(this.paramTriggerCache, param.id)) {
            oldOne = this.paramTriggerCache[param.id]
          }
          // eslint-disable-next-line no-eval
          const newOne = eval(param.valueTrigger)
          const currentOne = context[param.id]
          // A quick way to match the copy job
          if (oldOne === null && currentOne !== newOne) {
            this.paramTriggerCache[param.id] = newOne
            oldOne = newOne
          }
          if (oldOne !== newOne) {
            this.formModel[param.id] = newOne
          }
          this.paramTriggerCache[param.id] = newOne
        }

        return this.paramVisible[param.id]
      })
    },
    init() {
      const formModel = {}
      const formRules = {}
      const multiInputRules = {}
      const params = this.formatFields(this.params)
      this.paramVisible = {}
      this.promiseList = []
      this.localizeParams(params)
      params.forEach(param => {
        // this.innerParams.push(param);
        formModel[param.id] = this.getFormValue(param)
        if (param.id === 'job_name' && !formModel[param.id].length) {
          formModel[param.id] = Format.generateRandomName(this.context.prefix_job_name)
          this.defaultName = formModel[param.id]
        }
        let rules = []
        let minLength = 0
        if (param.require) {
          minLength = 1
          if (param.multi) {
            rules.push(ValidRoleFactory.getRequireRoleForArray(param.name))
          } else {
            rules.push(ValidRoleFactory.getRequireRoleForText(param.name))
          }
        }
        if (param.multi) {
          rules.push(ValidRoleFactory.getLengthRoleForArray(param.name, 0, 200))
          rules.push(ValidRoleFactory.getUniqueRoleForArray(param.name))
        }
        if (param.type === 'string') {
          if (param.mode === 'input') {
            if (param.id === 'job_name') {
              minLength = 3
              rules.push(ValidRoleFactory.getValidIdentityNameRoleForText(param.name))
            }
            if (param.id === 'run_time') {
              rules.push(ValidRoleFactory.getValidRunTimeRoleForText(param.name))
            }
            rules.push(ValidRoleFactory.getLengthRoleForText(param.name, minLength, Number(param.maxLength)))
            if (param.validPolicy === 'default') {
              rules.push(ValidRoleFactory.getValidIdentityNameRoleForText(param.name))
            } else if (param.validPolicy === 'phone') {
              rules.push(ValidRoleFactory.getMobileRole(param.name))
            } else if (param.validPolicy === 'email') {
              rules.push(ValidRoleFactory.getEmailRole(param.name))
            } else if (param.id === 'username') {
              rules.push(ValidRoleFactory.getUsernameRoleByText(param.name))
            }
          }
        } else if (param.type === 'number') {
          if (param.mode === 'input' && param.multi) {
            multiInputRules[param.id] = []
            multiInputRules[param.id].push(ValidRoleFactory.getValidNumberRoleForText(param.name))
            if (
              Object.prototype.hasOwnProperty.call(param, 'min') &&
              Object.prototype.hasOwnProperty.call(param, 'max')
            ) {
              multiInputRules[param.id].push(
                ValidRoleFactory.getNumberRangeRoleForText(param.name, param.min, param.max),
              )
            }
            if (Object.prototype.hasOwnProperty.call(param, 'decimal')) {
              multiInputRules[param.id].push(ValidRoleFactory.getNumberDecimalRoleForText(param.name, param.decimal))
            }
          } else {
            rules.push(ValidRoleFactory.getValidNumberRoleForText(param.name))
            if (
              Object.prototype.hasOwnProperty.call(param, 'min') &&
              Object.prototype.hasOwnProperty.call(param, 'max')
            ) {
              rules.push(ValidRoleFactory.getNumberRangeRoleForText(param.name, param.min, param.max))
            }
            if (Object.prototype.hasOwnProperty.call(param, 'decimal')) {
              rules.push(ValidRoleFactory.getNumberDecimalRoleForText(param.name, param.decimal))
            }
          }
        } else if (param.type === 'image') {
          this.initImage(param.id, param.hypervisor, param.framework, param.require, param.tags)
        } else if (param.type === 'ext.training_epochs') {
          rules = TrainingStepsEditor.getValidRules(param.name)
        } else if (param.type === 'password') {
          rules.push(ValidRoleFactory.getPasswordRoleByText(param.name))
          rules.push(
            ValidRoleFactory.getLengthRoleForText(param.name, Number(param.minLength), Number(param.maxLength)),
          )
        } else if (param.type === 'mig') {
          this.promiseList.push({
            id: 'gpu_resource_name',
            request: JobTemplateService.getMIGSelectOptions(),
            callback: this.initMIG,
          })
        }
        if (param.mode === 'select') {
          if (param.options && param.options.length > 0) {
            const tempObj = {}
            param.options.forEach(item => {
              if (item.content) {
                tempObj[item.value] = item.content
              }
            })
            this.$set(param, 'tipsHelp', tempObj)
          }
          if (!formModel[param.id] || !Utils.matchValueBySelectOptions(param.options, formModel[param.id])[0]) {
            formModel[param.id] = param.options[0].value
          }
        }
        formRules[param.id] = rules
        // Set param visible
        this.paramVisible[param.id] = true
      })
      this.multiInputRules = multiInputRules
      this.formModel = formModel
      this.formRules = formRules
      this.innerParams = params
      this.formModel = { ...this.formModel }
      this.initContext(this.context)
      this.startPromiseList(params).then(
        res => {},
        _ => {},
      )
    },
    getLocalizeVal(lang, label) {
      if (label[lang]) {
        return label[lang]
      }
      return label
    },
    formatFields(params) {
      const result = []
      const lang = this.$i18n.locale
      params.forEach(param => {
        const obj = {}
        obj.id = param.id
        obj.name = param.name
        obj.group = param.class
        obj.require = param.must
        obj.type = param.dataType
        if (obj.type === 'string') {
          obj.mode = param.input
          if (obj.mode === 'input') {
            obj.maxLength = param.maxLength
            obj.validPolicy = param.invalid
          }
          if (obj.mode === 'select') {
            obj.options = this.deepCopyOptions(param.selectOption)
          }
        } else if (obj.type === 'number') {
          obj.mode = param.input
          if (obj.mode === 'input') {
            obj.min = param.minValue
            obj.max = param.maxValue
            obj.decimal = param.floatLength
          }
          if (obj.mode === 'select') {
            obj.options = this.deepCopyOptions(param.selectOption)
          }
        } else if (obj.type === 'image') {
          obj.hypervisor = param.hypervisor
          obj.framework = param.framework
          obj.tags = param.tags
        } else if (obj.type === 'ext.psworker') {
          obj.nodesField = param.nodesField
          obj.gpuPerNodeField = param.gpuPerNodeField
          obj.workerAutoPolicy = param.workerAutoPolicy
          obj.psPolicy = param.psPolicy
        } else if (obj.type === 'password') {
          obj.maxLength = param.maxLength
          obj.minLength = param.minLength
        } else if (obj.type === 'ext.early_stop') {
          obj.settings = {}
          if (param.settings && param.settings.monitorOption) {
            obj.settings.monitorOptions = param.settings.monitorOption.map(i => {
              return {
                label: this.getLocalizeVal(lang, i.label),
                value: i.value,
              }
            })
          }
        }
        if (Object.prototype.hasOwnProperty.call(param, 'defaultValue')) {
          obj.default = param.defaultValue
        }
        if (Object.prototype.hasOwnProperty.call(param, 'visible')) {
          obj.visible = param.visible
        }
        if (Object.prototype.hasOwnProperty.call(param, 'tips')) {
          obj.tips = param.tips
        }
        if (Object.prototype.hasOwnProperty.call(param, 'help')) {
          obj.help = param.help
        }
        if (Object.prototype.hasOwnProperty.call(param, 'valueTrigger')) {
          obj.valueTrigger = param.valueTrigger
        }
        if (Object.prototype.hasOwnProperty.call(param, 'label')) {
          obj.label = param.label
        }
        if (Object.prototype.hasOwnProperty.call(param, 'multi')) {
          obj.multi = param.multi
        }
        if (Object.prototype.hasOwnProperty.call(param, 'selectMode')) {
          obj.selectMode = param.selectMode
        }
        if (Object.prototype.hasOwnProperty.call(param, 'disabled')) {
          obj.disabled = true
        } else {
          obj.disabled = false
        }
        obj.featureCodes = param.featureCodes
        if (
          !obj.featureCodes ||
          AccessService.getMatchFeatureCodes(obj.featureCodes, this.$store.state.auth.featureCodes).length > 0
        ) {
          result.push(obj)
        }
      })
      return result
    },
    localizeParams(params) {
      const lang = this.$i18n.locale
      params.forEach(param => {
        param.name = this.getLocalizeVal(lang, param.name)
        if (param.options) {
          param.options.forEach(option => {
            option.label = this.getLocalizeVal(lang, option.label)
          })
        }
        if (param.tips) {
          if (param.tips.type === 'link') {
            param.tips.name = this.getLocalizeVal(lang, param.tips.name)
          }
          if (param.tips.type === 'text') {
            param.tips.content = this.getLocalizeVal(lang, param.tips.content)
          }
        }
        if (param.help) {
          param.help = this.getLocalizeVal(lang, param.help)
        }
        if (param.label) {
          param.label = this.getLocalizeVal(lang, param.label)
        }
      })
    },
    sleep(interval) {
      return new Promise(resolve => {
        setTimeout(resolve, interval)
      })
    },
    initImage(paramId, hypervisor, framework, require, tags) {
      this.imageOptions = []
      ImageService.getAllImages({ framework, tags }).then(res => {
        res.forEach(image => {
          if (this.paramValues) {
            this.imageOptions.push({
              username: image.username,
              tag: image.tags,
              version: image.version,
              value: image.imagePath,
              label: image.name,
            })
          } else {
            // Bug 199680
            // Common template need support all kinds of images.
            // Add by wengmh1 2020/4/1
            // var frameworkList = [];
            // if (framework) {
            //     framework.split(",").forEach(val => {
            //         frameworkList.push(val.trim());
            //     });
            // }
            // if (
            //     framework &&
            //     frameworkList.indexOf(image.framework) >= 0
            // ) {
            if (image.username === this.$store.state.auth.username || !image.username) {
              if (image.status === 'success' || !image.status) {
                this.imageOptions.push({
                  username: image.username,
                  tag: image.tags,
                  version: image.version,
                  value: image.imagePath,
                  label: image.name,
                })
              }
            }
          }
          // }
        })
        if (this.imageOptions.length > 0 && this.formModel[paramId] === '' && require) {
          this.formModel[paramId] = this.imageOptions[0].value
        }
      })
    },
    initMIG(res, param) {
      const mig = param
      mig.selectOption = res
      this.migOptions = res
      if (this.migOptions.length > 0 && !this.formModel[param.id]) {
        this.formModel[param.id] = this.migOptions[0].value
      }
      this.initContext(this.context)
      return mig
    },
    getParamValues(formModel) {
      if (formModel === undefined) {
        formModel = this.formModel
      }
      const obj = {}
      this.innerParams.forEach(param => {
        if (param.type === 'number') {
          if (param.multi) {
            const arr = []
            formModel[param.id].forEach(str => {
              const val = parseFloat(str)
              if (val) {
                arr.push(val)
              } else {
                arr.push(0)
              }
            })
            obj[param.id] = arr
          } else {
            const val = parseFloat(formModel[param.id])
            if (val) {
              obj[param.id] = val
            } else {
              obj[param.id] = 0
            }
          }
        } else if ((param.type === 'file' || param.type === 'folder') && this.workspace) {
          obj[param.id] = formModel[param.id].replace('MyFolder', this.workspace)
        } else {
          obj[param.id] = formModel[param.id]
        }
      })
      return obj
    },
    getFormValue(param) {
      if (
        this.context &&
        Object.prototype.hasOwnProperty.call(this.context, param.id) &&
        this.context[param.id] !== null
      ) {
        return this.context[param.id]
      }
      if (Object.prototype.hasOwnProperty.call(param, 'default')) {
        return param.default
      }
      return ''
    },
    validate() {
      return new Promise((resolve, reject) => {
        this.$refs.innerForm.validate(valid => {
          if (valid) {
            resolve()
          } else {
            reject(new Error('Invalid'))
          }
        })
      })
    },
    emptyCall(e, param) {
      if (param === 'job_name') {
        e.target.select()
      }
      // This call is a workaround for space key not working on some case.
      // console.log(param);
    },
    fillDefaultName(param) {
      if (param === 'job_name' && !this.formModel[param].length) {
        this.formModel[param] = this.defaultName = Format.generateRandomName(this.context.prefix_job_name)
      }
    },
    deepCopyOptions(options) {
      const opts = options.map(item => {
        const opt = {}
        if (Object.prototype.hasOwnProperty.call(item, 'label')) opt.label = item.label
        if (Object.prototype.hasOwnProperty.call(item, 'value')) opt.value = item.value
        if (Object.prototype.hasOwnProperty.call(item, 'content')) opt.content = item.content
        if (Object.prototype.hasOwnProperty.call(item, 'children')) opt.children = this.deepCopyOptions(item.children)
        return opt
      })
      return opts
    },
    startPromiseList(params) {
      return new Promise((resolve, reject) => {
        if (!this.promiseList.length) resolve()
        // this.loading = true;
        const list = this.promiseList.filter(i => i.request)
        const apiList = list.map(i => i.request)
        Promise.all(apiList)
          .then(
            res => {
              for (let i = 0; i < list.length; i++) {
                if (list[i].callback) {
                  const param = params.filter(item => item.id === list[i].id)[0]
                  const result = list[i].callback(res[i], param) || param
                  params = params.map(item => (result.id === item.id ? result : item))
                }
              }
            },
            err => {
              err.forEach(error => {
                this.$message.error(error)
              })
            },
          )
          .finally(() => {
            resolve()
            this.loading = false
          })
      })
    },
    getQueueOptions() {
      return this.$refs.queueSelector[0].queueOptions
    },
  },
}
</script>
<style scoped>
.tips-link {
  color: #409eff;
  text-decoration: none;
}
.job-parameters-editor-form {
  padding-left: 200px;
}
.job-parameters-editor-form >>> .image-select-content {
  width: 300px;
}
.prefill {
  color: #bfbfbf;
}
.queue-selector {
  margin-right: 10px;
}
.remotely_debug_tip {
  width: 300px;
  background: rgba(248, 248, 248, 1);
  line-height: 25px;
  color: #449fff;
  display: flex;
  padding: 5px;
}
.remotely_debug_tip .help-icon {
  margin-right: 5px;
  color: #449fff;
}
</style>
