<template>
  <a-modal
    ref="popupDialog"
    width="500px"
    :title="title"
    :open="isRender"
    :append-to-body="true"
    destroy-on-close
    @cancel="isRender = false">
    <a-form ref="runtimeEnvForm" layout="vertical" :model="runtimeEnvForm" :rules="runtimeEnvRules" :colon="false">
      <a-form-item :label="$t('Admin.Runtime.Env.Name')" name="name">
        <a-input v-model:value="runtimeEnvForm.name" :placeholder="$t('Admin.Runtime.Env.Name.PlaceHolder')" />
      </a-form-item>
      <a-form-item :label="$t('Admin.Runtime.Env.Value')" name="value">
        <a-input v-model:value="runtimeEnvForm.value" :placeholder="$t('Admin.Runtime.Env.Value.PlaceHolder')" />
      </a-form-item>
    </a-form>
    <template #footer>
      <span class="dialog-footer">
        <a-button @click="isRender = false"> {{ $t('Action.Cancel') }}</a-button>
        <a-button type="primary" @click="onSubmit"> {{ $t('Action.Confirm') }}</a-button>
      </span>
    </template>
  </a-modal>
</template>

<script>
import Utils from '@/common/utils'
import RuntimeService from '@/service/runtime-manage'
import ValidRoleFactory from '@/common/valid-role-factory'

export default {
  emits: ['get-env'],
  data() {
    return {
      isRender: false,
      title: '',
      mode: '',
      addedEnvs: [],
      onEditEnv: null,
      runtimeEnvForm: {},
      runtimeEnvRules: {
        name: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Admin.Runtime.Env.Name')),
          ValidRoleFactory.getLengthRoleForText(this.$t('Admin.Runtime.Env.Name'), 1, 50),
          ValidRoleFactory.getValidIdentityNameRoleForText(this.$t('Admin.Runtime.Env.Name')),
          this.duplicated(),
        ],
      },
    }
  },
  methods: {
    duplicated() {
      const _this = this
      return {
        validator(rule, value) {
          const errors = []
          if (_this.mode === 'create') {
            const dataIndex = RuntimeService.findEnvIndex({ name: value }, _this.addedEnvs)
            if (dataIndex !== -1) {
              errors.push(
                new Error(
                  _this.$T('Valid.Array.Unique', {
                    name: _this.$t('Admin.Runtime.Env.Name'),
                  }),
                ),
              )
            }
          }
          return Promise[errors.length ? 'reject' : 'resolve'](errors)
        },
      }
    },
    filterEnvs(env, envs, mode) {
      if (mode === 'create') {
        envs.push(env)
      } else {
        const dataIndex = RuntimeService.findEnvIndex(this.onEditEnv, envs)
        if (dataIndex !== -1) {
          envs.splice(dataIndex, 1, env)
        }
      }
      return Utils.deepCopy(envs)
    },
    resetForm() {
      if (this.$refs.runtimeEnvForm) {
        this.$refs.runtimeEnvForm.resetFields()
      }
      this.isRender = false
      this.title = ''
      this.mode = ''
      this.addedEnvs = []
      this.onEditEnv = null
      this.runtimeEnvForm = {}
    },
    doCreate(envs) {
      this.resetForm()
      this.isRender = true
      this.addedEnvs = envs
      this.mode = 'create'
      this.runtimeEnvForm = {
        name: '',
        value: '',
      }
      this.title = this.$t('Admin.Runtime.Env.Create.Title')
    },
    doEdit(data, envs) {
      this.resetForm()
      this.isRender = true
      this.onEditEnv = data
      this.addedEnvs = envs
      this.mode = 'edit'
      this.runtimeEnvForm = {
        name: data.name,
        value: data.value,
      }
      this.title = this.$t('Admin.Runtime.Env.Edit.Title')
    },
    onSubmit() {
      this.$refs.runtimeEnvForm.validate().then(
        _ => {
          this.$emit('get-env', this.filterEnvs(this.runtimeEnvForm, this.addedEnvs, this.mode))
          this.isRender = false
        },
        _ => {},
      )
    },
  },
}
</script>
