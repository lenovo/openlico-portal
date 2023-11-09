<template>
  <composite-form-dialog
    ref="innerDialog"
    size="500px"
    form-label-width="140px"
    :title="title"
    :form-model="mail"
    :form-rules="mailRules"
    :success-message-formatter="successMessageFormatter">
    <a-form-item v-if="show" :label="$t('AlertSetting.Mail.Mailbox.Sender')" :name="show ? 'address' : ''">
      <a-input id="tid_notify-adapter-email-sender" v-model:value="mail.address" />
    </a-form-item>
    <p v-if="!show">
      {{ $t('AlertSetting.Confirm.Message') }}
    </p>
  </composite-form-dialog>
</template>
<script>
import ValidRoleFactory from '@/common/valid-role-factory'
import EmailService from '@/service/notify-email'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'

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
        return this.$T('AlertSetting.Mail.Test.Success', {
          number: this.mail.address,
        })
      } else {
        return this.$t('AlertSetting.Mail.Success')
      }
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
