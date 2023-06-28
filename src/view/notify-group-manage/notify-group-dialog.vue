<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="500px"
    :form-model="notifyGroupForm"
    :form-rules="notifyGroupRules"
    :external-validate="externalValidate"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-model-item :label="$t('NotifyGroup.Name')" prop="name">
      <a-input id="tid_notify-group-name" v-model="notifyGroupForm.name" :disabled="mode == 'delete'" />
    </a-form-model-item>
    <a-form-model-item ref="emailsFormItem" :label="$t('NotifyGroup.Emails')" prop="emails">
      <multi-tags-input
        id="tid_notify-group-emails"
        ref="emailsInput"
        v-model="notifyGroupForm.emails"
        :new-tag-button-text="$t('Action.Add')"
        :valid-roles="emailRules"
        :disabled="mode == 'delete'" />
    </a-form-model-item>
    <a-form-model-item ref="mobilesFormItem" :label="$t('NotifyGroup.Mobiles')" prop="mobiles">
      <multi-phone-number-input
        id="tid_notify-group-mobiles"
        ref="mobilesInput"
        v-model="notifyGroupForm.mobiles"
        :new-tag-button-text="$t('Action.Add')"
        :disabled="mode == 'delete'" />
      <div v-if="externalErrorMessage.length > 0" class="ant-form-item-control has-error">
        <div class="ant-form-item-children">
          <div class="ant-form-explain">
            {{ externalErrorMessage }}
          </div>
        </div>
      </div>
    </a-form-model-item>
  </composite-form-dialog>
</template>
<script>
import NotifyGroupService from '../../service/notify-group'
import CompositeFormDialog from '../../component/composite-form-dialog'
import ValidRoleFactory from '../../common/valid-role-factory'
import MultiTagsInput from '../../component/multi-tags-input'
import MultiPhoneNumberInput from '../../component/multi-phone-number-input'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
    'multi-tags-input': MultiTagsInput,
    'multi-phone-number-input': MultiPhoneNumberInput,
  },
  data() {
    return {
      title: '',
      mode: '',
      notifyGroupId: 0,
      notifyGroupForm: {
        name: '',
        emails: [],
        mobiles: [],
      },
      emailRules: [ValidRoleFactory.getEmailRole(this.$t('NotifyGroup.Emails'))],
      notifyGroupRules: {
        name: [
          ValidRoleFactory.getRequireRoleForText(this.$t('NotifyGroup.Name')),
          ValidRoleFactory.getLengthRoleForText(this.$t('NotifyGroup.Name'), 3, 20),
          ValidRoleFactory.getValidIdentityNameRoleForText(this.$t('NotifyGroup.Name')),
        ],
        emails: [
          // ValidRoleFactory.getRequireRoleForArray(this.$t('NotifyGroup.Emails')),
          ValidRoleFactory.getLengthRoleForArray(this.$t('NotifyGroup.Emails'), 0, 200),
          ValidRoleFactory.getUniqueRoleForArray(this.$t('NotifyGroup.Emails')),
        ],
        mobiles: [
          // ValidRoleFactory.getRequireRoleForArray(this.$t('NotifyGroup.Mobiles')),
          ValidRoleFactory.getLengthRoleForArray(this.$t('NotifyGroup.Mobiles'), 0, 200),
          ValidRoleFactory.getUniqueRoleForArray(this.$t('NotifyGroup.Mobiles')),
        ],
      },
      externalErrorMessage: '',
    }
  },
  watch: {
    'notifyGroupForm.emails'(val, oldVal) {
      if (val.length === 0 && oldVal.length === 0) {
        return
      }
      this.$nextTick(() => {
        this.$refs.emailsFormItem.validate()
        // this.validateEmailsAndMobiles();
      })
    },
    'notifyGroupForm.mobiles'(val, oldVal) {
      if (val.length === 0 && oldVal.length === 0) {
        return
      }
      this.$nextTick(() => {
        this.$refs.mobilesFormItem.validate()
        // this.validateEmailsAndMobiles();
      })
    },
  },
  methods: {
    externalValidate(callbackFunc) {
      if (this.$refs.emailsInput.validate() && this.$refs.mobilesInput.validate()) {
        callbackFunc(this.validateEmailsAndMobiles())
      } else {
        callbackFunc(false)
      }
    },
    validateEmailsAndMobiles() {
      if (this.notifyGroupForm.emails.length + this.notifyGroupForm.mobiles.length <= 0) {
        this.externalErrorMessage = this.$t('NotifyGroup.Valid.EmailOrMobile.Require')
        return false
      } else {
        this.externalErrorMessage = ''
        return true
      }
    },
    submitForm() {
      if (this.mode === 'create') {
        return NotifyGroupService.createNotifyGroup(
          this.notifyGroupForm.name,
          this.notifyGroupForm.emails,
          this.notifyGroupForm.mobiles,
        )
      }
      if (this.mode === 'edit') {
        return NotifyGroupService.updateNotifyGroup(
          this.notifyGroupId,
          this.notifyGroupForm.name,
          this.notifyGroupForm.emails,
          this.notifyGroupForm.mobiles,
        )
      }
      if (this.mode === 'delete') {
        return NotifyGroupService.deleteNotifyGroup(this.notifyGroupId)
      }
    },
    successMessageFormatter() {
      if (this.mode === 'create') {
        return this.$t('NotifyGroup.Create.Success', {
          name: this.notifyGroupForm.name,
        })
      }
      if (this.mode === 'edit') {
        return this.$t('NotifyGroup.Edit.Success', {
          name: this.notifyGroupForm.name,
        })
      }
      if (this.mode === 'delete') {
        return this.$t('NotifyGroup.Delete.Success', {
          name: this.notifyGroupForm.name,
        })
      }
    },
    errorMessageFormatter(res) {
      const errMsg = res
      return this.$t(errMsg)
    },
    doCreate() {
      this.mode = 'create'
      this.notifyGroupId = 0
      this.notifyGroupForm = {
        name: '',
        emails: [],
        mobiles: [],
      }
      this.externalErrorMessage = ''
      this.title = this.$t('NotifyGroup.Create.Title')
      this.$nextTick(() => {
        this.$refs.emailsInput.cleanInput()
        this.$refs.mobilesInput.cleanInput()
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEdit(notifyGroup) {
      this.mode = 'edit'
      this.notifyGroupId = notifyGroup.id
      this.notifyGroupForm = {
        name: notifyGroup.name,
        emails: notifyGroup.emails.slice(),
        mobiles: notifyGroup.mobiles.slice(),
      }
      this.externalErrorMessage = ''
      this.title = this.$t('NotifyGroup.Edit.Title', {
        id: notifyGroup.id,
      })
      this.$nextTick(() => {
        this.$refs.emailsInput.cleanInput()
        this.$refs.mobilesInput.cleanInput()
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doDelete(notifyGroup) {
      this.mode = 'delete'
      this.notifyGroupId = notifyGroup.id
      this.notifyGroupForm = {
        name: notifyGroup.name,
        emails: notifyGroup.emails.slice(),
        mobiles: notifyGroup.mobiles.slice(),
      }
      this.externalErrorMessage = ''
      this.title = this.$t('NotifyGroup.Delete.Title', {
        id: notifyGroup.id,
      })
      this.$nextTick(() => {
        this.$refs.emailsInput.cleanInput()
        this.$refs.mobilesInput.cleanInput()
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
