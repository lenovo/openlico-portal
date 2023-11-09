<template>
  <a-modal
    ref="innerDialog"
    v-model:open="isRender"
    :title="title"
    :append-to-body="true"
    width="500px"
    class="build-settings"
    destroy-on-close
    @cancel="isRender = false"
    @ok="onSubmit">
    <a-form ref="innerForm" layout="vertical" label-width="120px" :model="innerForm" :rules="innerRole" :colon="false">
      <a-form-item name="pythonLibs">
        <template #label>
          <span>
            {{ $t('Image.Build.AdvancedSettings.Pythonlibs') }}
            <a-tooltip
              root-class-name="helpTooltip"
              placement="topLeft"
              :title="$t('Image.Build.Cert.Settings.Pythonlibs.Help')">
              <QuestionCircleFilled class="help-icon" />
            </a-tooltip>
          </span>
        </template>
        <a-textarea v-model:value="innerForm.pythonLibs" :disabled="disabled" />
      </a-form-item>
      <a-form-item name="pipCommand">
        <template #label>
          <span>
            {{ $t('Image.Build.AdvancedSettings.PipCommand') }}
            <a-tooltip
              root-class-name="helpTooltip"
              placement="topLeft"
              :title="$t('Image.Build.Cert.Settings.PipCommand.Help')">
              <QuestionCircleFilled class="help-icon" />
            </a-tooltip>
          </span>
        </template>
        <a-input v-model:value="innerForm.pipCommand" :disabled="disabled" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script>
import ValidRoleFactory from '@/common/valid-role-factory'
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
      this.$refs.innerForm.validate().then(
        _ => {
          this.isRender = false
          this.innerResolve(this.innerForm)
        },
        _ => {},
      )
    },
  },
}
</script>
<style scoped>
.help-icon {
  color: #449fff;
}
/* .build-settings :deep(.ant-form-item-label),
.build-settings-dialog .ant-form-item-label {
  overflow: unset !important;
} */
.build-settings :deep(.helpTooltip) {
  white-space: initial;
}
</style>
