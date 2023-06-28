<template>
  <a-modal
    id="tid_popup-dialog"
    ref="popupDialog"
    :title="title"
    :width="size"
    :visible="dialogVisible"
    :keyboard="!submitting"
    :mask-closable="!submitting"
    :closable="!submitting"
    class="composite-form-dialog"
    @cancel="onCancelClick"
    @afterClose="onDialogClose">
    <a-form-model
      v-show="onSubmitCode == 0 ? !submitting : !continueSubmitting"
      id="tid_popup-dialog-form"
      ref="innerForm"
      class="composite-form-content"
      :colon="false"
      :layout="'vertical'"
      :model="formModel"
      :rules="formRules"
      :label-col="labelCols"
      :wrapper-col="wrapperCols">
      <slot />
    </a-form-model>
    <a-spin v-show="submitting || continueSubmitting" style="height: 100%">
      <div class="spin-content">
        {{ loadingMessage }}
      </div>
    </a-spin>
    <div slot="footer" class="dialog-footer">
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
  </a-modal>
</template>
<script>
// import Utils from '../common/utils'

export default {
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'title',
    // eslint-disable-next-line vue/require-prop-types
    'size',
    // eslint-disable-next-line vue/require-prop-types
    'compositeHeight',
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
  ],
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
          this.$refs.innerForm.validate(valid => {
            if (extValid && valid) {
              this.doSubmit()
            } else {
              return false
            }
          })
        })
      } else {
        this.$refs.innerForm.validate(valid => {
          if (valid) {
            this.doSubmit()
          } else {
            return false
          }
        })
      }
    },
    onSubmitClick() {
      this.onSubmitCode = 0
      if (this.externalValidate) {
        this.externalValidate(extValid => {
          this.$refs.innerForm.validate(valid => {
            if (extValid && valid) {
              this.doSubmit()
            } else {
              return false
            }
          })
        })
      } else {
        this.$refs.innerForm.validate(valid => {
          if (valid) {
            this.doSubmit()
          } else {
            return false
          }
        })
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
              this.$message.success(message)
            }
            this.innerResolve(res)
          },
          res => {
            // Do not reject when error, then the promise is not broken user can resubmit.
            // this.autoReject = false;
            this.continueSubmitting = false
            this.submitting = false
            let message = this.$t('Dialog.DefaultSubmitMessage.Fail')
            if (this.errorMessageFormatter) {
              message = this.errorMessageFormatter(res)
            }
            this.$message.error(message)
            this.onSubmitCode = 0
            // Do not reject when error, then the promise is not broken user can resubmit.
            // this.innerReject(res);
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
  },
}
</script>
<style>
/* .composite-form-dialog .ant-modal-content{
    height: 100%;
}
.composite-form-dialog .ant-modal-body{
    position: absolute;
    bottom: 53px;
    top: 55px;
    width: 100%;
    padding: 24px 40px;
    overflow: auto;
}
.composite-form-dialog .ant-modal-footer{
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100%;
} */
.composite-form-dialog-footer {
  display: flex;
}
</style>
