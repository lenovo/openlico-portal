<template>
  <a-row>
    <a-col :span="24">
      <div class="section">
        <a-form
          ref="innerform"
          layout="vertical"
          :model="mail"
          :rules="mailRules"
          class="notify-email-form"
          :colon="false">
          <a-radio-group
            id="tid_notify-adapter-email-enable"
            v-model:value="mail.status"
            :disabled="disabled"
            button-style="solid"
            size="small"
            class="notify-email-radio notify-header-radio"
            @change="changeStatus">
            <a-radio-button :value="true">
              {{ $t('Status.ON') }}
            </a-radio-button>
            <a-radio-button :value="false">
              {{ $t('Status.OFF') }}
            </a-radio-button>
          </a-radio-group>
          <div class="notify-settings-img">
            <img src="/static/img/system/notify/Mail.svg" alt="" />
            <div>{{ $t('AlertSetting.Title.Mail') }}</div>
          </div>

          <a-form-item :label="$t('AlertSetting.Label.Mail.SMTPAddress')" name="address" class="notify-email-ssl">
            <a-input
              v-model:value="mail.address"
              :title="$t('AlertSetting.Mail.Address')"
              :placeholder="$t('AlertSetting.Mail.Address')"
              :disabled="disabled || !mail.status" />
          </a-form-item>
          <a-form-item :label="$t('AlertSetting.Mail.SSL.Protocol')">
            <a-select
              v-model:value="mail.ssl"
              :disabled="disabled || !mail.status"
              :title="$t('AlertSetting.Mail.SSL.Protocol')"
              @change="changeProtocol">
              <a-select-option id="tid_notify-adapter-email-mode-null" value="NULL">
                {{ $t('AlertSetting.Mail.SSL.Null') }}
              </a-select-option>
              <a-select-option id="tid_notify-adapter-email-mode-ssl" value="SSL">
                {{ 'SSL' }}
              </a-select-option>
              <a-select-option id="tid_notify-adapter-email-mode-tls" value="TLS">
                {{ 'TLS' }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="$t('AlertSetting.Label.Mail.SMTPPort')" name="port">
            <a-input
              v-model:value="mail.port"
              :title="$t('AlertSetting.Mail.Port')"
              :placeholder="$t('AlertSetting.Mail.Port')"
              :disabled="disabled || !mail.status" />
          </a-form-item>
          <a-form-item :label="$t('AlertSetting.Label.Mail.Name')" name="id">
            <a-input
              v-model:value="mail.id"
              :title="$t('AlertSetting.Mail.ID')"
              :placeholder="$t('AlertSetting.Mail.ID')"
              :disabled="disabled || !mail.status" />
          </a-form-item>
          <a-form-item :label="$t('AlertSetting.Label.Mail.Password')" name="password">
            <a-input
              v-model:value="mail.password"
              type="password"
              :title="$t('AlertSetting.Mail.Password')"
              :placeholder="$t('AlertSetting.Mail.Password')"
              :disabled="disabled || !mail.status" />
          </a-form-item>
          <a-form-item :label="$t('AlertSetting.Mail.Sender')" name="mailbox">
            <a-input
              v-model:value="mail.mailbox"
              :title="$t('AlertSetting.Mail.Mailbox')"
              :placeholder="$t('AlertSetting.Mail.Mailbox')"
              :disabled="disabled || !mail.status" />
          </a-form-item>
          <div style="text-align: center; margin-bottom: 22px">
            <a-button
              id="tid_email-confirm"
              type="primary"
              :disabled="disabled || !mail.status"
              style="margin-right: 10px"
              @click="confirmMail">
              {{ $t('Action.Save') }}
            </a-button>
            <a-button id="tid_email-test" :disabled="testDisabled" @click="testMail">
              {{ $t('AlertSetting.Button.Test') }}
            </a-button>
          </div>
        </a-form>
      </div>
    </a-col>
    <EmailDialog ref="TestEmailDialog" />
  </a-row>
</template>
<script>
import ValidRoleFactory from '@/common/valid-role-factory'
import EmailService from '@/service/notify-email'
import EmailDialog from './notify-adapter-email-dialog.vue'

export default {
  components: {
    EmailDialog,
  },
  data() {
    return {
      disabled: true,
      testDisabled: true,
      resetData: {},
      mail: {
        status: false,
        ssl: 'NULL',
        id: '',
        password: '',
        address: '',
        port: '',
        mailbox: '',
      },
      mailRules: {
        address: [ValidRoleFactory.getRequireRoleForText(this.$t('AlertSetting.Mail.Address.Promot'))],
        port: [
          ValidRoleFactory.getRequireRoleForText(this.$t('AlertSetting.Mail.Port.Promot')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('AlertSetting.Mail.Port.Promot')),
        ],
        mailbox: [
          ValidRoleFactory.getRequireRoleForText(this.$t('AlertSetting.Mail.Mailbox.Promot')),
          ValidRoleFactory.getEmailRole(this.$t('AlertSetting.Mail.Mailbox.Promot')),
        ],
      },
      resMail: null,
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      EmailService.getNotifyEmail().then(
        res => {
          this.mail = { ...res }
          this.resMail = { ...res }
          this.resetData = { ...res }
          this.testDisabled = !res.status
          this.disabled = false
        },
        _ => {
          this.testDisabled = true
          this.disabled = true
        },
      )
    },
    testMail() {
      this.$refs.innerform.validate().then(
        _ => {
          this.$refs.TestEmailDialog.sendEmail(this.mail)
        },
        _ => {},
      )
    },
    changeStatus(e) {
      this.$refs.innerform.clearValidate()
      if (!e.target.value && this.resMail.status) {
        this.mail.status = true
        this.subMail('off')
      }
    },
    changeProtocol() {
      switch (this.mail.ssl) {
        case 'SSL':
          this.mail.port = 465
          break
        case 'TLS':
          this.mail.port = 25
          break
        default:
          this.mail.port = 25
          break
      }
    },
    confirmMail() {
      this.$refs.innerform.validate().then(
        _ => {
          this.subMail()
        },
        _ => {},
      )
    },
    subMail(status) {
      const mail = { ...this.mail, status: status === 'off' ? false : this.mail.status }
      this.$refs.TestEmailDialog.confirmSetting(mail).then(
        _ => {
          this.init()
        },
        err => {
          this.$message.error(err)
        },
      )
    },
  },
}
</script>
<style>
.notify-email-ssl {
  margin: 20px 0 20px;
}
</style>
