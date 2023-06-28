<template>
  <composite-form-dialog
    ref="innerDialog"
    class="job-parameters-affinity-dialog"
    :title="$t('JobTemplate.Affinity.Dialog.Title', { action: $t(`Action.${mode}`) })"
    size="800px"
    :composite-height="500"
    :form-model="innerForm"
    :form-rules="innerRules"
    :external-validate="externalValidate"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-model-item prop="name" label-width="180px" :label="$t('JobTemplate.Affinity.Name')">
      <a-input v-model="innerForm.name" />
    </a-form-model-item>
    <a-tabs v-model="innerForm.mode">
      <a-tab-pane key="quick" :tab="$t('JobTemplate.Affinity.Quick')">
        <a-row :gutter="16">
          <a-col class="gutter-row" :span="6">
            <a-form-model-item prop="run_mode" label-width="180px" :label="$t('JobTemplate.Affinity.Run_mode')">
              <a-select v-model="innerForm.run_mode">
                <a-select-option v-for="item in runModeOptions" :key="item">
                  {{ $t(`JobTemplate.Affinity.Run_mode.${item}`) }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col v-if="innerForm.run_mode == 'mpi'" class="gutter-row" :span="6">
            <a-form-model-item prop="procset" label-width="180px" :label="$t('JobTemplate.Affinity.Procset')">
              <a-select v-model="innerForm.procset">
                <a-select-option v-for="item in procsetOptions" :key="item">
                  {{ $t(`JobTemplate.Affinity.Procset.${item}`) }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col v-if="innerForm.run_mode == 'mpi'" class="gutter-row" :span="6">
            <a-form-model-item
              prop="type"
              label-width="180px"
              :label="$t('JobTemplate.Affinity.BindType')"
              class="mpi-bind-type-item">
              <a-select v-model="innerForm.type">
                <a-select-option v-for="item in mpiOnlyTypeOptions" :key="item" class="mpi-bind-type-option">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col v-if="innerForm.run_mode == 'mpi' && innerForm.type == 'customize'" class="gutter-row" :span="6">
            <a-form-model-item prop="grain" label-width="180px" :label="$t('JobTemplate.Affinity.Grain')">
              <a-input v-model="innerForm.grain" />
            </a-form-model-item>
          </a-col>
          <a-col v-if="innerForm.run_mode == 'mpi+openmp'" class="gutter-row" :span="6">
            <a-form-model-item prop="size" label-width="180px" :label="$t('JobTemplate.Affinity.Size')">
              <a-input v-model="innerForm.size" />
            </a-form-model-item>
          </a-col>
          <a-col v-if="innerForm.run_mode == 'mpi+openmp'" class="gutter-row" :span="6">
            <a-form-model-item prop="layout" label-width="180px" :label="$t('JobTemplate.Affinity.BindType')">
              <a-select v-model="innerForm.layout">
                <a-select-option v-for="item in bindTypeOptions" :key="item">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col v-if="innerForm.run_mode == 'mpi' && innerForm.type == 'customize'" class="gutter-row" :span="6">
            <a-form-model-item prop="shift" label-width="180px" :label="$t('JobTemplate.Affinity.Shift')">
              <a-input v-model="innerForm.shift" />
            </a-form-model-item>
          </a-col>
          <a-col v-if="innerForm.run_mode == 'mpi' && innerForm.type == 'customize'" class="gutter-row" :span="6">
            <a-form-model-item prop="preoffset" label-width="180px" :label="$t('JobTemplate.Affinity.Preoffset')">
              <a-input v-model="innerForm.preoffset" :disabled="innerForm.postoffset > 0" />
            </a-form-model-item>
          </a-col>
          <a-col
            v-if="innerForm.run_mode == 'mpi' && innerForm.type == 'customize' && innerForm.procset != 'allsocks'"
            class="gutter-row"
            :span="6">
            <a-form-model-item prop="postoffset" label-width="180px" :label="$t('JobTemplate.Affinity.Postoffset')">
              <a-input v-model="innerForm.postoffset" :disabled="innerForm.preoffset > 0" />
            </a-form-model-item>
          </a-col>
        </a-row>
        <div class="job-parameters-affinity-environment">
          <a-button type="link" @click="onViewAffinityEnv">
            {{ $t('JobTemplate.Affinity.ViewEnvironment') }}
          </a-button>
        </div>
        <div class="job-parameters-affinity-layout">
          <p class="m-b-10" style="display: flex">
            <span>{{ $t('JobTemplate.Affinity.Layout') }}</span>
            <a-tooltip placement="topLeft">
              <template slot="title">
                {{ $t('JobTemplate.Affinity.Layout.Help') }}
              </template>
              <a-icon style="margin: 4px 0 0 5px" type="question-circle" />
            </a-tooltip>
          </p>
          <affinity-layout ref="affinityLayout" :form="innerForm" :type="type" />
        </div>
      </a-tab-pane>
      <a-tab-pane key="advanced" :tab="$t('JobTemplate.Affinity.Advanced')">
        <affinity-advanced v-model="innerForm.envs" :type="type" @submitStatus="onSubmitStatus" />
      </a-tab-pane>
    </a-tabs>
    <template v-if="mode == 'Edit'" slot="footer">
      <a-button @click="onDeleteSettings()">
        {{ $t('Action.Delete') }}
      </a-button>
    </template>
    <affinity-env-dialog ref="affinityEnvDialog" />
  </composite-form-dialog>
</template>
<script>
import AffinityService from './../../../service/job-template-affiity'
import CompositeFormDialog from './../../../component/composite-form-dialog'
import ValidRoleFactory from './../../../common/valid-role-factory'
import AffinityEnvDialog from './affinity-env-dialog.vue'
import AffinityAdvanced from './affinity-advanced.vue'
import AffinityLayout from './affinity-layout.vue'
export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
    AffinityEnvDialog,
    AffinityAdvanced,
    AffinityLayout,
  },
  data() {
    return {
      type: 'intelmpi',
      mode: 'Add',
      submit: true,
      runModeOptions: AffinityService.RunModeEnums,
      procsetOptions: AffinityService.PinTypeEnums,
      bindTypeOptions: AffinityService.BindTypeEnums,
      mpiOnlyTypeOptions: AffinityService.MpiOnlytypeEnums,
      innerForm: {},
      innerRules: {
        name: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Affinity.Name')),
          ValidRoleFactory.getLengthRoleForText(this.$t('JobTemplate.Affinity.Name'), 3, 32),
          ValidRoleFactory.getValidIdentityNameRoleIncludeChineseText(this.$t('JobTemplate.Affinity.Name')),
        ],
        run_mode: [ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Affinity.Run_mode'))],
        procset: [ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Affinity.Procset'))],
        type: [ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Affinity.BindType'))],
        grain: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Affinity.Grain')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.Affinity.Grain')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.Affinity.Grain'), 1, 128),
        ],
        shift: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Affinity.Shift')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.Affinity.Shift')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.Affinity.Shift'), 1, 128),
        ],
        preoffset: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Affinity.Preoffset')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.Affinity.Preoffset')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.Affinity.Preoffset'), 0, 128),
        ],
        postoffset: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Affinity.Postoffset')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.Affinity.Postoffset')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.Affinity.Postoffset'), 0, 128),
        ],
        size: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Affinity.Size')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.Affinity.Size')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.Affinity.Size'), 1, 128),
        ],
        layout: [ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Affinity.Layout'))],
      },
    }
  },
  methods: {
    submitForm() {
      const form = { ...this.innerForm, map: this.innerForm.type }
      if (this.mode === 'Add') {
        return AffinityService.createAffinitySettings(form, this.type)
      }
      if (this.mode === 'Edit') {
        return AffinityService.updateAffinitySettings(form, this.type)
      }
    },
    externalValidate(callbackFunc) {
      if (this.innerForm.mode === 'quick') {
        callbackFunc(true)
      } else {
        const env = this.innerForm.envs
        if (env.length === 1 && !env[0].name && !env[0].value) {
          this.$message.error(this.$t('JobTemplate.Affinity.Advanced.Parameters.Message'))
          callbackFunc(false)
        } else {
          callbackFunc(this.submit)
        }
      }
    },
    successMessageFormatter(res) {
      return this.$t(`JobTemplate.Affinity.${this.mode}.Success`)
    },
    errorMessageFormatter(res) {
      return res
    },
    doAdd() {
      this.mode = 'Add'
      this.initDataByFormMode()
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEdit(data) {
      console.log(data)
      this.mode = 'Edit'
      this.initDataByFormMode(data)
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    onViewAffinityEnv() {
      const form = { ...this.innerForm, map: this.innerForm.type }
      const env = AffinityService.parseFromWebForm(form, this.type).envs
      this.$refs.affinityEnvDialog.onShow(env)
    },
    onDeleteSettings() {
      this.$confirm({
        content: this.$t('JobTemplate.Affinity.Delete.Confirm'),
        centered: true,
        onOk: this.submitDelete,
      })
    },
    onSubmitStatus(status) {
      this.submit = status
    },
    submitDelete() {
      AffinityService.deleteAffinitySettings(this.innerForm.id).then(
        res => {
          this.$emit('delete')
          this.$message.success(this.$t('JobTemplate.Affinity.Delete.Success'))
          this.$refs.innerDialog.onCancelClick()
        },
        err => {
          this.$message.error(err)
        },
      )
    },

    initDataByFormMode(form) {
      this.innerForm = {
        id: form ? form.id : '',
        name: form ? form.name : '',
        mode: form ? form.mode : 'quick',
        run_mode: form && form.mode === 'quick' ? form.run_mode : this.runModeOptions[0],
        procset: form && form.mode === 'quick' && form.procset ? form.procset : this.procsetOptions[0],
        type: form && form.mode === 'quick' && form.map ? form.map : this.mpiOnlyTypeOptions[0],
        grain: form && form.mode === 'quick' && form.grain ? form.grain : 1,
        shift: form && form.mode === 'quick' && form.shift ? form.shift : 1,
        preoffset: form && form.mode === 'quick' && form.preoffset ? form.preoffset : 0,
        postoffset: form && form.mode === 'quick' && form.postoffset ? form.postoffset : 0,
        size: form && form.mode === 'quick' && form.size ? form.size : 2,
        layout: form && form.mode === 'quick' && form.layout ? form.layout : this.bindTypeOptions[0],
        envs: form && form.mode === 'advanced' ? form.envs : [{ name: '', value: '' }],
      }
    },
  },
}
</script>
<style>
.mpi-bind-type-item .ant-select-selection-selected-value,
.mpi-bind-type-option {
  text-transform: capitalize;
}
</style>
