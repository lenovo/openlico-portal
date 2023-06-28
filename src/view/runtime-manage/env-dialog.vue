<template>
  <a-modal
    ref="popupDialog"
    :title="title"
    :visible="isRender"
    :append-to-body="true"
    width="500px"
    @cancel="isRender = false">
    <a-form-model
      ref="runtimeEnvForm"
      label-width="120px"
      :model="runtimeEnvForm"
      :rules="runtimeEnvRules"
      :colon="false">
      <a-form-model-item :label="$t('Admin.Runtime.Env.Name')" prop="name">
        <a-input v-model="runtimeEnvForm.name" :placeholder="$t('Admin.Runtime.Env.Name.PlaceHolder')" />
      </a-form-model-item>
      <a-form-model-item :label="$t('Admin.Runtime.Env.Value')" prop="value">
        <a-input v-model="runtimeEnvForm.value" :placeholder="$t('Admin.Runtime.Env.Value.PlaceHolder')" />
      </a-form-model-item>
    </a-form-model>
    <span slot="footer" class="dialog-footer">
      <a-button @click="isRender = false"> {{ $t('Action.Cancel') }}</a-button>
      <a-button type="primary" @click="onSubmit"> {{ $t('Action.Confirm') }}</a-button>
    </span>
  </a-modal>
</template>

<script>
import ValidRoleFactory from '../../common/valid-role-factory'
import RuntimeService from '../../service/runtime-manage'
import Utils from '../../common/utils'

export default {
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
        validator(rule, value, callback, source, options) {
          const errors = []
          if (_this.mode === 'create') {
            const dataIndex = RuntimeService.findEnvIndex({ name: value }, _this.addedEnvs)
            if (dataIndex !== -1) {
              errors.push(
                new Error(
                  _this.$t('Valid.Array.Unique', {
                    name: _this.$t('Admin.Runtime.Env.Name'),
                  }),
                ),
              )
            }
          }
          callback(errors)
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
      const _this = this
      _this.$refs.runtimeEnvForm.validate(valid => {
        if (valid) {
          _this.$emit('get-env', _this.filterEnvs(_this.runtimeEnvForm, _this.addedEnvs, _this.mode))
          _this.isRender = false
        } else {
          return false
        }
      })
    },
  },
}
</script>
