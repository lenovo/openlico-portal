<template>
  <a-modal
    id="tid_popup-dialog"
    ref="popupDialog"
    wrap-class-name="composite-form-dialog"
    destroy-on-close
    :title="title"
    :width="size"
    :open="dialogVisible"
    :keyboard="!submitting"
    :mask-closable="!submitting"
    :closable="!submitting"
    :z-index="zIndex || 1000"
    @cancel="onCancelClick"
    @after-close="onDialogClose">
    <a-form
      v-show="onSubmitCode == 0 ? !submitting : !continueSubmitting"
      id="tid_popup-dialog-form"
      ref="innerForm"
      class="composite-form-content"
      auto-complete="new-password"
      :colon="false"
      :layout="'vertical'"
      :model="formModel"
      :rules="formRules"
      :label-col="labelCols"
      :wrapper-col="wrapperCols">
      <slot />
    </a-form>
    <a-spin v-show="submitting || continueSubmitting" style="height: 100%">
      <div class="spin-content">
        {{ loadingMessage }}
      </div>
    </a-spin>
    <template #footer>
      <div class="dialog-footer">
        <div class="composite-form-dialog-footer">
          <div name="customFooter" style="width: 100%; text-align: left; flex: 1">
            <slot name="footer" />
          </div>
          <div style="width: 100%; flex: 2">
            <a-button
              v-show="!submitting && !continueSubmitting && cancelButtonText"
              id="tid_popup-dialog-cancel"
              @click="onCancelClick">
              {{ cancelButtonText }}
            </a-button>
            <a-button
              v-show="!continueSubmitting && submitButtonText"
              id="tid_popup-dialog-submit"
              type="primary"
              :loading="submitting"
              :disabled="submitDisable"
              @click="onSubmitClick">
              {{ submitButtonText }}
            </a-button>
            <a-button
              v-show="submitContinue && !submitting && submitContinueButtonText"
              id="tid_popup-dialog-submit"
              type="primary"
              :loading="continueSubmitting"
              @click="onSubmitContinueClick">
              {{ submitContinueButtonText }}
            </a-button>
          </div>
        </div>
      </div>
    </template>
  </a-modal>
</template>
<script>
export default {
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'title',
    // eslint-disable-next-line vue/require-prop-types
    'size',
    // eslint-disable-next-line vue/require-prop-types
    'formModel',
    // eslint-disable-next-line vue/require-prop-types
    'formRules',
    // eslint-disable-next-line vue/require-prop-types
    'formLabelCol',
    // eslint-disable-next-line vue/require-prop-types
    'successMessageFormatter',
    // eslint-disable-next-line vue/require-prop-types
    'errorMessageFormatter',
    // eslint-disable-next-line vue/require-prop-types
    'appendToBody',
    // eslint-disable-next-line vue/require-prop-types
    'externalValidate',
    // eslint-disable-next-line vue/require-prop-types
    'type',
    // eslint-disable-next-line vue/require-prop-types
    'loadingMessage',
    // eslint-disable-next-line vue/require-prop-types
    'loading',
    // eslint-disable-next-line vue/require-prop-types
    'buttonsText',
    // eslint-disable-next-line vue/require-prop-types
    'labelCols',
    // eslint-disable-next-line vue/require-prop-types
    'wrapperCols',
    // eslint-disable-next-line vue/require-prop-types
    'submitContinue',
    'failedCloseDialog',
    'zIndex',
  ],
  emits: ['dialog-opened', 'dialog-closed'],
  data() {
    return {
      labelCol: this.formLabelCol ? this.formLabelCol : 6,
      submitting: false,
      dialogVisible: false,
      innerResolve: null,
      innerReject: null,
      autoReject: true,
      submitDisable: false,
      continueSubmitting: false,
      onSubmitCode: 0,
    }
  },
  computed: {
    cancelButtonText(val) {
      return this.getButtonsText(this.type)[1]
    },
    submitButtonText(val) {
      return this.getButtonsText(this.type)[0]
    },
    submitContinueButtonText(val) {
      return this.getButtonsText(this.type)[2]
    },
  },
  watch: {
    formLabelCol(val, oldVal) {
      this.labelCol = val || 6
    },
    loading(val, oldVal) {
      this.submitting = val
    },
    dialogVisible(visible) {
      if (visible) {
        this.$emit('dialog-opened')
      } else {
        this.$emit('dialog-closed')
      }
    },
  },
  methods: {
    getButtonsText(type) {
      let result = [this.$t('Action.Ok'), this.$t('Action.Cancel')]
      if (type) {
        if (type === 'confirm') {
          result = [this.$t('Action.Yes'), this.$t('Action.No')]
        }
        if (type === 'submit') {
          result = [this.$t('Action.Submit'), this.$t('Action.Cancel')]
        }
        if (type === 'submitContinue') {
          result = [this.$t('Action.Submit'), this.$t('Action.Cancel'), this.$t('Action.Submit.And.Continue')]
        }
      }
      if (Array.isArray(this.buttonsText)) {
        result = this.buttonsText
        // result = result.map((item, i) => this.buttonsText[i] || item)
      }
      return result
    },
    onCancelClick() {
      this.dialogVisible = false
    },
    onDialogClose() {
      if (this.autoReject) {
        this.innerReject()
      }
    },
    onSubmitContinueClick() {
      this.onSubmitCode = 1

      if (this.externalValidate) {
        this.externalValidate(extValid => {
          if (!extValid) return
        })
      }

      this.$refs.innerForm.validate().then(res => {
        this.doSubmit()
      })
    },
    onSubmitClick() {
      this.onSubmitCode = 0
      if (this.externalValidate) {
        this.externalValidate(extValid => {
          this.$refs.innerForm.validate().then(
            _ => {
              if (extValid) {
                this.doSubmit()
              } else {
                return false
              }
            },
            err => {
              return false
            },
          )
        })
      } else {
        this.$refs.innerForm.validate().then(
          _ => {
            this.doSubmit()
          },
          err => {
            return false
          },
        )
      }
    },
    doSubmit() {
      if (this.onSubmitCode) {
        this.continueSubmitting = true
      } else {
        this.submitting = true
      }
      if (this.submitHandler) {
        this.submitHandler().then(
          res => {
            this.autoReject = false
            if (this.onSubmitCode) {
              this.dialogVisible = true
              this.continueSubmitting = false
            } else {
              this.dialogVisible = false
            }
            let message = this.$t('Dialog.DefaultSubmitMessage.Success')
            if (this.successMessageFormatter) {
              message = this.successMessageFormatter(res)
            }
            if (message) {
              if (res && res.action_status === 'partial') {
                this.$message.warning(message)
              } else {
                this.$message.success(message)
              }
            }
            this.innerResolve(res)
          },
          res => {
            // Do not reject when error, then the promise is not broken user can resubmit.
            // this.autoReject = false;
            this.continueSubmitting = false
            this.submitting = false
            let message = res || this.$t('Dialog.DefaultSubmitMessage.Fail')
            if (this.errorMessageFormatter) {
              message = this.errorMessageFormatter(res)
            }
            this.$message.error(message)
            this.onSubmitCode = 0
            // Do not reject when error, then the promise is not broken user can resubmit.
            // this.innerReject(res);
            // Hide the dialog and refresh the job list immediately when the some requests fails(priority, hold, requeue and release action)
            if (this.failedCloseDialog) {
              this.dialogVisible = false
              this.innerReject(res)
            }
          },
        )
      } else {
        this.autoReject = false
        this.dialogVisible = false
        this.innerResolve(true)
      }
    },
    popup(submitHandler) {
      if (this.$refs.innerForm) {
        this.$refs.innerForm.resetFields()
      }
      this.submitHandler = submitHandler
      this.submitting = false
      this.dialogVisible = true
      return new Promise((resolve, reject) => {
        this.innerResolve = resolve
        this.innerReject = reject
      })
    },
    emptyPopup() {
      return this.popup(null)
    },
    disableSubmit() {
      this.submitDisable = true
    },
    enableSubmit() {
      this.submitDisable = false
    },
    validateItems(items = []) {
      if (!this.$refs.innerForm) return Promise.reject()
      if (items.length) {
        return this.$refs.innerForm.validate(items)
      } else {
        return this.$refs.innerForm.validate()
      }
    },
  },
}
</script>
<style scoped>
.composite-form-dialog-footer {
  display: flex;
}
</style>
<style>
.composite-form-dialog .ant-modal-content {
  padding: 0;
}
.composite-form-dialog .ant-modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}
.composite-form-dialog .ant-modal-body {
  padding: 24px;
}
.composite-form-dialog .ant-modal-footer {
  padding: 10px 16px;
  border-top: 1px solid #e8e8e8;
  text-align: right;
}
</style>
