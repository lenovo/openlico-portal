<template>
  <a-modal
    ref="innerDialog"
    :title="title"
    :visible="isRender"
    :append-to-body="true"
    width="500px"
    class="build-settings"
    @cancel="isRender = false"
    @ok="onSubmit">
    <a-form-model ref="innerForm" label-width="120px" :model="innerForm" :rules="innerRole" :colon="false">
      <a-form-model-item prop="pythonLibs">
        <span slot="label">
          {{ $t('Image.Build.AdvancedSettings.Pythonlibs') }}
          <a-tooltip
            overlay-class-name="helpTooltip"
            placement="topLeft"
            :title="$t('Image.Build.Cert.Settings.Pythonlibs.Help')">
            <a-icon type="question-circle" theme="filled" class="help-icon" />
          </a-tooltip>
        </span>
        <a-textarea v-model="innerForm.pythonLibs" :disabled="disabled" />
      </a-form-model-item>
      <a-form-model-item prop="pipCommand">
        <span slot="label">
          {{ $t('Image.Build.AdvancedSettings.PipCommand') }}
          <a-tooltip
            overlay-class-name="helpTooltip"
            placement="topLeft"
            :title="$t('Image.Build.Cert.Settings.PipCommand.Help')">
            <a-icon type="question-circle" theme="filled" class="help-icon" />
          </a-tooltip>
        </span>
        <a-input v-model="innerForm.pipCommand" :disabled="disabled" />
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>
<script>
import ValidRoleFactory from '../../../common/valid-role-factory'
export default {
  props: ['disabled'],
  data() {
    return {
      compositeHeight: 300,
      title: '',
      isRender: false,
      innerForm: {
        pythonLibs: '',
        pipCommand: 'pip',
      },
      innerRole: {
        pythonLibs: [ValidRoleFactory.getLengthRoleForText(this.$t('Image.Build.AdvancedSettings.Pythonlibs'), 0, 255)],
        pipCommand: [ValidRoleFactory.getLengthRoleForText(this.$t('Image.Build.AdvancedSettings.PipCommand'), 0, 255)],
      },
      innerResolve: null,
      innerReject: null,
    }
  },
  methods: {
    submitForm() {
      return new Promise((resolve, reject) => {
        resolve(this.innerForm)
      })
    },
    open(setting) {
      this.title = this.$t('Image.Build.AdvancedSettings')
      this.isRender = true
      if (setting) {
        this.innerForm = {
          pythonLibs: setting.pythonLibs,
          pipCommand: setting.pipCommand,
        }
      }
      return new Promise((resolve, reject) => {
        this.innerResolve = resolve
        this.innerReject = reject
      })
    },
    onSubmit() {
      if (!this.innerForm.pipCommand) {
        this.innerForm.pipCommand = 'pip'
      }
      this.$refs.innerForm.validate(valid => {
        if (valid) {
          this.isRender = false
          this.innerResolve(this.innerForm)
        } else {
          // Do nothing
        }
      })
    },
  },
}
</script>
<style scoped>
.help-icon {
  color: #449fff;
}
.build-settings >>> .ant-form-item-label {
  overflow: inherit !important;
}
.build-settings >>> .helpTooltip {
  white-space: initial;
}
</style>
