<template>
  <composite-form-dialog
    ref="innerDialog"
    class="job-parameters-affinity-dialog"
    :title="$T('JobTemplate.Affinity.Dialog.Title', { action: $t(`Action.${mode}`) })"
    size="800px"
    :form-model="innerForm"
    :form-rules="innerRules"
    :external-validate="externalValidate"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-item name="name" label-width="180px" :label="$t('JobTemplate.Affinity.Name')">
      <a-input v-model:value="innerForm.name" />
    </a-form-item>
    <a-tabs v-model:activeKey="innerForm.mode">
      <a-tab-pane key="quick" :tab="$t('JobTemplate.Affinity.Quick')">
        <a-row :gutter="16">
          <a-col class="gutter-row" :span="6">
            <a-form-item name="granularity" label-width="180px" :label="$t('JobTemplate.Affinity.Granularity')">
              <a-select v-model:value="innerForm.granularity">
                <a-select-option v-for="item in granularityOptions" :key="item">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col class="gutter-row" :span="6">
            <a-form-item name="bind_type" label-width="180px" :label="$t('JobTemplate.Affinity.BindType')">
              <a-select v-model:value="innerForm.bind_type">
                <a-select-option v-for="item in bindTypeOptions" :key="item">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col class="gutter-row" :span="6">
            <a-form-item name="permute" label-width="180px" :label="$t('JobTemplate.Affinity.Permute')">
              <a-input v-model:value="innerForm.permute" />
            </a-form-item>
          </a-col>
          <a-col class="gutter-row" :span="6">
            <a-form-item name="offset" label-width="180px" :label="$t('JobTemplate.Affinity.Offset')">
              <a-input v-model:value="innerForm.offset" />
            </a-form-item>
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
              <template #title>
                {{ $t('JobTemplate.Affinity.Layout.Help') }}
              </template>
              <question-circle-outlined style="margin: 4px 0 0 5px" />
            </a-tooltip>
          </p>
          <affinity-layout ref="affinityLayout" :form="innerForm" :type="type" />
        </div>
      </a-tab-pane>
      <a-tab-pane key="advanced" :tab="$t('JobTemplate.Affinity.Advanced')">
        <affinity-advanced v-model:value="innerForm.envs" :type="type" @submit-status="onSubmitStatus" />
      </a-tab-pane>
    </a-tabs>
    <template v-if="mode == 'Edit'" #footer>
      <a-button @click="onDeleteSettings()">
        {{ $t('Action.Delete') }}
      </a-button>
    </template>
    <affinity-env-dialog ref="affinityEnvDialog" />
  </composite-form-dialog>
</template>
<script>
import ValidRoleFactory from '@/common/valid-role-factory'
import AffinityService from '@/service/job-template-affiity'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import AffinityEnvDialog from './affinity-env-dialog.vue'
import AffinityAdvanced from './affinity-advanced.vue'
import AffinityLayout from './affinity-layout.vue'
export default {
  components: {
    CompositeFormDialog,
    AffinityEnvDialog,
    AffinityAdvanced,
    AffinityLayout,
  },
  emits: ['delete'],
  data() {
    return {
      type: 'openmp',
      mode: 'Add',
      submit: true,
      granularityOptions: AffinityService.GranularityEnums,
      bindTypeOptions: AffinityService.BindTypeEnums,
      innerForm: {},
      innerRules: {
        name: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Affinity.Name')),
          ValidRoleFactory.getLengthRoleForText(this.$t('JobTemplate.Affinity.Name'), 3, 32),
          ValidRoleFactory.getValidIdentityNameRoleIncludeChineseText(this.$t('JobTemplate.Affinity.Name')),
        ],
        granularity: [ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Affinity.Granularity'))],
        bind_type: [ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Affinity.BindType'))],
        permute: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Affinity.Permute')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.Affinity.Permute')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.Affinity.Permute'), 0, 9),
        ],
        offset: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Affinity.Offset')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('JobTemplate.Affinity.Offset')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('JobTemplate.Affinity.Offset'), 0, 128),
        ],
      },
    }
  },
  methods: {
    submitForm() {
      if (this.mode === 'Add') {
        return AffinityService.createAffinitySettings(this.innerForm, this.type)
      }
      if (this.mode === 'Edit') {
        return AffinityService.updateAffinitySettings(this.innerForm, this.type)
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
      this.mode = 'Edit'
      this.initDataByFormMode(data)
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    onViewAffinityEnv() {
      const env = AffinityService.parseFromWebForm(this.innerForm, this.type).envs
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
        granularity: form && form.mode === 'quick' ? form.granularity : this.granularityOptions[0],
        bind_type: form && form.mode === 'quick' ? form.bind_type : this.bindTypeOptions[0],
        permute: form && form.mode === 'quick' ? form.permute : 0,
        offset: form && form.mode === 'quick' ? form.offset : 0,
        envs:
          form && form.mode === 'advanced'
            ? form.envs
            : [
                {
                  name: AffinityService.DefaultEnv[this.type],
                  value: '',
                },
                { name: '', value: '' },
              ],
      }
    },
  },
}
</script>
<style></style>
