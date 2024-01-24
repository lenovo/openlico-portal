<template>
  <composite-form-dialog
    ref="innerDialog"
    size="580px"
    class="jobTemplate-parameter-add-dialog"
    :title="title"
    :form-model="formParameter"
    :form-rules="formRules"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter"
    :external-validate="externalValidate">
    <a-form-item v-if="mode != 'delete'" :label="$t('JobTemplate.Parameters.Id')" name="id">
      <a-input v-model:value="formParameter.id" :disabled="getDisabledStatus('id')"></a-input>
    </a-form-item>
    <a-form-item v-if="mode != 'delete'" :label="$t('JobTemplate.Parameters.Name')" name="name">
      <a-input v-model:value="formParameter.name" :disabled="getDisabledStatus('name')"></a-input>
    </a-form-item>
    <a-form-item v-if="mode != 'delete'" :label="$t('JobTemplate.Parameters.Class')" name="class">
      <a-select v-model:value="formParameter.class" :disabled="getDisabledStatus('class')">
        <a-select-option v-for="item in classOptions" :key="item.value" :value="item.value"
          >{{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-if="mode != 'delete'" :label="$t('JobTemplate.Parameters.DataType')" name="dataType">
      <a-select v-model:value="formParameter.dataType" :disabled="getDisabledStatus('dataType')">
        <a-select-option v-for="item in dataTypeOptions" :key="item.value" :value="item.value"
          >{{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item
      v-if="mode != 'delete' && (formParameter.dataType == 'string' || formParameter.dataType == 'number')"
      :label="$t('JobTemplate.Parameters.Input')"
      name="input">
      <a-select v-model:value="formParameter.input" :disabled="getDisabledStatus('input')">
        <a-select-option v-for="item in inputOptions" :key="item.value" :value="item.value"
          >{{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <string-option
      v-if="mode != 'delete' && formParameter.dataType == 'string' && formParameter.input == 'input'"
      ref="stringOption"
      :form-parameter="formParameter"
      :form-rules="formRules"
      :get-disabled-status="getDisabledStatus" />
    <number-option
      v-if="mode != 'delete' && formParameter.dataType == 'number' && formParameter.input == 'input'"
      ref="numberOption"
      :form-parameter="formParameter"
      :form-rules="formRules"
      :max-value-function="onMaxValueChange"
      :min-value-function="onMinValueChange" />
    <select-option
      v-if="
        mode != 'delete' &&
        (formParameter.dataType == 'string' || formParameter.dataType == 'number') &&
        formParameter.input == 'select'
      "
      ref="selectOption"
      :form-parameter="formParameter"
      :form-rules="formRules" />
    <file-option v-if="mode != 'delete' && formParameter.dataType == 'file'" ref="fileOption" />
    <folder-option v-if="mode != 'delete' && formParameter.dataType == 'folder'" ref="folderOption" />
    <modules-option v-if="mode != 'delete' && formParameter.dataType == 'runtime'" ref="modulesOption" />
    <container-image-option
      v-if="mode != 'delete' && formParameter.dataType == 'image'"
      ref="contailerImageOption"
      :form-parameter="formParameter"
      :show-framework="true"
      :form-rules="formRules" />
    <a-form-item
      v-if="mode != 'delete' && (formParameter.dataType == 'string' || formParameter.dataType == 'number')"
      :label="$t('JobTemplate.Parameters.Default.Value')"
      name="defaultValue">
      <a-input v-model:value="formParameter.defaultValue"></a-input>
    </a-form-item>
    <a-form-item
      v-if="mode != 'delete' && formParameter.dataType != 'runtime'"
      :label="$t('JobTemplate.Parameters.Must')">
      <a-checkbox v-model:checked="formParameter.must" :disabled="getDisabledStatus('must')"></a-checkbox>
    </a-form-item>
    <div v-if="mode == 'delete'" class="">
      <p>
        {{
          $T('JobTemplate.Parameters.Delete.Text', {
            name: formParameter.name,
          })
        }}
      </p>
    </div>
  </composite-form-dialog>
</template>
<script>
import StringOption from './parameter-dialog/string-option.vue'
import NumberOption from './parameter-dialog/number-option.vue'
import SelectOption from './parameter-dialog/select-option.vue'
import FileOption from './parameter-dialog/file-option.vue'
import FolderOption from './parameter-dialog/folder-option.vue'
import ModulesOption from './parameter-dialog/modules-option.vue'
import ContainerImageOption from './parameter-dialog/container-image-option.vue'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import ValidRoleFactory from '@/common/valid-role-factory'
export default {
  components: {
    CompositeFormDialog,
    StringOption,
    NumberOption,
    SelectOption,
    FileOption,
    FolderOption,
    ModulesOption,
    ContainerImageOption,
  },
  props: ['externalValidator'],
  data() {
    return {
      index: null,
      title: '',
      mode: '',
      invalidParameter: null,
      formParameter: {},
      formRules: {
        id: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Parameters.Id')),
          ValidRoleFactory.getLengthRoleForText(this.$t('JobTemplate.Parameters.Id'), 2, 32),
          ValidRoleFactory.getValidIdentityNameRoleForText(this.$t('JobTemplate.Parameters.Id')),
        ],
        name: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Parameters.Name')),
          ValidRoleFactory.getLengthRoleForText(this.$t('JobTemplate.Parameters.Name'), 2, 32),
          // ValidRoleFactory.getValidIdentityNameRoleForText(this.$t('JobTemplate.Parameters.Name'))
        ],
        class: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Parameters.Class')),
          ValidRoleFactory.getLengthRoleForText(this.$t('JobTemplate.Parameters.Class'), 3, 32),
          ValidRoleFactory.getValidIdentityNameRoleForText(this.$t('JobTemplate.Parameters.Class')),
        ],
        dataType: [ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Parameters.DataType'))],
        input: [ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Parameters.Input'))],
        maxLength: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Parameters.Max.Length')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.Parameters.Max.Length')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.Parameters.Max.Length'), 1, 255),
          ValidRoleFactory.getNumberDecimalRoleForText(this.$t('JobTemplate.Parameters.Max.Length'), 0),
        ],
        minValue: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Parameters.Min.Value')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.Parameters.Min.Value')),
          // ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.Parameters.Min.Value'), 0, 99999999),
        ],
        maxValue: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Parameters.Max.Value')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.Parameters.Max.Value')),
          // ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.Parameters.Max.Value'), 0, 99999999),
        ],
        floatLength: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Parameters.Float.Length')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.Parameters.Float.Length')),
          ValidRoleFactory.getNumberDecimalRoleForText(this.$t('JobTemplate.Parameters.Float.Length'), 0),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.Parameters.Float.Length'), 0, 6),
        ],
        selectOption: [],
        framework: [
          // ValidRoleFactory.getRequireRoleForText(
          //     this.$t("JobTemplate.Parameters.framework")
          // )
        ],
        defaultValue: [],
        must: [],
        tags: [ValidRoleFactory.getLengthRoleForArray(this.$t('JobTemplate.Parameters.FilterTags'), 0, 10)],
      },
      classOptions: [],
      inputOptions: [],
      dataTypeOptions: [],
    }
  },
  watch: {},
  mounted() {
    this.initClassOptions()
    this.initInputOptions()
    this.initDataTypeOptions()
  },
  methods: {
    initClassOptions() {
      this.classOptions = [
        {
          value: 'base',
          label: this.$t('JobTemplate.BaseInformation'),
        },
        {
          value: 'param',
          label: this.$t('JobTemplate.Parameters'),
        },
        {
          value: 'resource',
          label: this.$t('JobTemplate.ResourceOptions'),
        },
        {
          value: 'notify',
          label: this.$t('JobTemplate.NotifyOptions'),
        },
      ]
    },
    initInputOptions() {
      this.inputOptions = [
        {
          value: 'input',
          label: this.$t('JobTemplate.Parameters.Input.Input'),
        },
        {
          value: 'select',
          label: this.$t('JobTemplate.Parameters.Input.Select'),
        },
      ]
    },
    initDataTypeOptions() {
      this.dataTypeOptions = [
        {
          value: 'string',
          label: this.$t('JobTemplate.Parameters.DataType.string'),
        },
        {
          value: 'number',
          label: this.$t('JobTemplate.Parameters.DataType.number'),
        },
        {
          value: 'boolean',
          label: this.$t('JobTemplate.Parameters.DataType.boolean'),
        },
        {
          value: 'file',
          label: this.$t('JobTemplate.Parameters.DataType.file'),
        },
        {
          value: 'folder',
          label: this.$t('JobTemplate.Parameters.DataType.folder'),
        },
      ]
      if (this.$store.state.auth.featureCodes.includes('ai')) {
        this.dataTypeOptions.push({
          value: 'image',
          label: this.$t('JobTemplate.Parameters.DataType.image'),
        })
      }
      this.dataTypeOptions.push({
        value: 'runtime',
        label: this.$t('JobTemplate.Parameters.DataType.runtime'),
      })
    },
    externalValidate(callbackFunc) {
      if (
        this.formParameter.dataType === 'number' &&
        !isNaN(parseFloat(this.formParameter.minValue)) &&
        !isNaN(parseFloat(this.formParameter.maxValue)) &&
        parseFloat(this.formParameter.minValue) > parseFloat(this.formParameter.maxValue)
      ) {
        this.$message.error(this.$t('JobTemplate.Parameters.Max.Error'))
        callbackFunc(false)
      } else {
        callbackFunc(true)
      }
    },
    submitForm() {
      const param = this.getParameter()
      if (this.mode === 'delete' || this.externalValidator === null) {
        return new Promise((resolve, reject) => {
          resolve({ data: param, index: this.index })
        })
      } else {
        return new Promise((resolve, reject) => {
          if (param.input === 'select' && param.selectOption.length < 1) {
            reject(new Error({ name: '', value: '' }))
          }
          const valid = this.externalValidator(param, this.index)
          if (valid !== null) {
            reject(valid)
          } else {
            resolve({ data: param, index: this.index })
          }
        })
      }
    },
    successMessageFormatter(res) {
      if (this.mode === 'add') {
        return this.$T('JobTemplate.Parameters.Add.Success', {
          name: this.formParameter.name,
        })
      }
      if (this.mode === 'edit') {
        return this.$T('JobTemplate.Parameters.Edit.Success', {
          name: this.formParameter.name,
        })
      }
      if (this.mode === 'delete') {
        return this.$T('JobTemplate.Parameters.Delete.Success', {
          name: this.formParameter.name,
        })
      }
    },
    errorMessageFormatter(res) {
      const errMsg = res
      if (this.formParameter.input === 'select' && res.name === '' && res.value === '') {
        return this.$t('JobTemplate.Parameters.Select.Option.Nodata')
      }
      if (this.mode === 'add') {
        return this.$T('JobTemplate.Parameters.Add.repeat', {
          label: this.$t(`JobTemplate.Parameters.${res.name}`),
          value: res.value,
        })
      }
      if (this.mode === 'edit') {
        return this.$T('JobTemplate.Parameters.Edit.repeat', {
          label: this.$t(`JobTemplate.Parameters.${res.name}`),
          value: res.value,
        })
      }
      return this.$t(errMsg)
    },
    initData(data) {
      return {
        id: data ? data.id : '',
        name: data ? data.name : '',
        class: data ? data.class : 'base',
        dataType: data ? data.dataType : 'string',
        input: data ? data.input : 'input',
        maxLength: data && data.maxLength ? data.maxLength : 255,
        minValue: data && data.minValue ? data.minValue : 0,
        maxValue: data && data.maxValue ? data.maxValue : 99999999,
        floatLength: data && data.floatLength ? data.floatLength : 0,
        invalid: data && data.invalid ? data.invalid : 'none',
        framework: data && data.framework ? data.framework : 'tensorflow',
        selectOption: data && data.selectOption ? data.selectOption : [],
        defaultValue: data && data.defaultValue ? data.defaultValue : '',
        must: data ? data.must : true,
        tags: data && data.tags ? data.tags : [],
      }
    },
    doAdd() {
      this.formParameter = this.initData()
      this.mode = 'add'
      this.index = null
      this.title = this.$t('JobTemplate.Parameters.Add.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEdit(data, index) {
      this.formParameter = this.initData(data)
      this.mode = 'edit'
      this.index = index
      this.title = this.$t('JobTemplate.Parameters.Edit.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doDelete(data, index) {
      this.formParameter = this.initData(data)
      this.mode = 'delete'
      this.index = index
      this.title = this.$t('JobTemplate.Parameters.Delete.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    getParameter() {
      const param = {}
      param.id = this.formParameter.id
      param.name = this.formParameter.name
      param.class = this.formParameter.class
      param.dataType = this.formParameter.dataType
      if (param.dataType === 'string') {
        param.input = this.formParameter.input
        if (param.input === 'input') {
          param.maxLength = this.formParameter.maxLength
          param.invalid = this.formParameter.invalid
        }
        if (param.input === 'select') {
          param.selectOption = []
          this.formParameter.selectOption.forEach(option => {
            const item = {}
            item.label = option.label
            item.value = option.value
            param.selectOption.push(item)
          })
        }
        param.defaultValue = this.formParameter.defaultValue
      }
      if (param.dataType === 'number') {
        param.input = this.formParameter.input
        if (param.input === 'input') {
          param.minValue = this.formParameter.minValue
          param.maxValue = this.formParameter.maxValue
          param.floatLength = this.formParameter.floatLength
        }
        if (param.input === 'select') {
          param.selectOption = []
          this.formParameter.selectOption.forEach(option => {
            const item = {}
            item.label = option.label
            item.value = option.value
            param.selectOption.push(item)
          })
        }
        param.defaultValue = this.formParameter.defaultValue
      }
      if (param.dataType === 'image') {
        param.framework = this.formParameter.framework
        param.tags = this.formParameter.tags
      }
      if (param.dataType === 'boolean') {
        param.defaultValue = false
        param.must = false
      }
      if (param.dataType === 'runitme') {
        param.defaultValue = 0
        param.must = false
      } else {
        param.must = this.formParameter.must
      }
      return param
    },
    onMaxValueChange(val) {
      // this.formRules.minValue[3] = ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.Parameters.Min.Value'), 0, this.formParameter.maxValue);
    },
    onMinValueChange(val) {
      // this.formRules.maxValue[3] = ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.Parameters.Max.Value'), this.formParameter.minValue, 99999999999);
    },
    getDisabledStatus(attr) {
      if (this.formParameter.id !== 'run_time') {
        return false
      }

      if (attr === 'defaultValue') {
        return false
      }

      return true
    },
  },
}
</script>

<style lang="css">
.jobTemplate-parameter-add-dialog .a-form-item__content {
  width: 370px;
}
</style>
