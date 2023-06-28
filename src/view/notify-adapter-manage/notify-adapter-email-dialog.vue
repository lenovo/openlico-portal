<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="500px"
    :form-model="mail"
    :form-rules="mailRules"
    form-label-width="140px"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-model-item v-if="show" :label="$t('AlertSetting.Mail.Mailbox.Sender')" :prop="show ? 'address' : ''">
      <a-input id="tid_notify-adapter-email-sender" v-model="mail.address" />
    </a-form-model-item>
    <p v-if="!show">
      {{ $t('AlertSetting.Confirm.Message') }}
    </p>
  </composite-form-dialog>
</template>
<script>
import ValidRoleFactory from '../../common/valid-role-factory'
import EmailService from '../../service/notify-email'
import CompositeFormDialog from '../../component/composite-form-dialog'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    return {
      show: true,
      title: this.$t('AlertSetting.Button.Test'),
      mail: {
        address: '',
        config: {},
      },
      mailRules: {
        address: [
          ValidRoleFactory.getRequireRoleForText(this.$t('AlertSetting.Mail.Mailbox.Sender')),
          ValidRoleFactory.getEmailRole(this.$t('AlertSetting.Mail.Mailbox.Sender')),
        ],
      },
    }
  },
  methods: {
    submitForm() {
      if (this.show) {
        return EmailService.testMail(this.mail.address)
      } else {
        return EmailService.updateMail(this.mail.config)
      }
    },
    successMessageFormatter(res) {
      if (this.show) {
        return this.$t('AlertSetting.Mail.Test.Success', {
          number: this.mail.address,
        })
      } else {
        return this.$t('AlertSetting.Mail.Success')
      }
    },
    errorMessageFormatter(res) {
      const errMsg = res
      return this.$t(errMsg)
    },
    confirmSetting(config) {
      this.show = false
      this.compositeHeight = 220
      this.title = this.$t('AlertSetting.Button.Confirm.Dialog')
      this.mail = {
        config,
      }
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    sendEmail(config) {
      this.compositeHeight = 280
      this.show = true
      this.title = this.$t('AlertSetting.Button.Test')
      this.mail = {
        address: '',
        config,
      }
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
<style></style>
