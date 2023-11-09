<template>
  <composite-form-dialog
    ref="innerDialog"
    size="500px"
    :title="title"
    :form-model="notifyGroupForm"
    :form-rules="notifyGroupRules"
    :external-validate="externalValidate"
    :success-message-formatter="successMessageFormatter">
    <a-form-item :label="$t('NotifyGroup.Name')" name="name">
      <a-input id="tid_notify-group-name" v-model:value="notifyGroupForm.name" :disabled="mode == 'Delete'" />
    </a-form-item>
    <a-form-item ref="emailsFormItem" :label="$t('NotifyGroup.Emails')" name="emails">
      <multi-tags-input
        id="tid_notify-group-emails"
        ref="emailsInput"
        v-model:value="notifyGroupForm.emails"
        :new-tag-button-text="$t('Action.Add')"
        :valid-roles="emailRules"
        :disabled="mode == 'Delete'" />
    </a-form-item>
    <a-form-item ref="mobilesFormItem" :label="$t('NotifyGroup.Mobiles')" name="mobiles">
      <multi-phone-number-input
        id="tid_notify-group-mobiles"
        ref="mobilesInput"
        v-model:value="notifyGroupForm.mobiles"
        :new-tag-button-text="$t('Action.Add')"
        :disabled="mode == 'Delete'" />
      <div v-if="externalErrorMessage.length > 0" class="ant-form-item-control has-error">
        <div class="ant-form-item-children">
          <div class="ant-form-item-explain-error">
            {{ externalErrorMessage }}
          </div>
        </div>
      </div>
    </a-form-item>
  </composite-form-dialog>
</template>
<script>
import NotifyGroupService from '@/service/notify-group'
import ValidRoleFactory from '@/common/valid-role-factory'
import MultiTagsInput from '@/component/multi-tags-input.vue'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import MultiPhoneNumberInput from '@/component/multi-phone-number-input.vue'

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
        this.validateEmailsAndMobiles()
      })
    },
    'notifyGroupForm.mobiles'(val, oldVal) {
      if (val.length === 0 && oldVal.length === 0) {
        return
      }
      this.$nextTick(() => {
        this.validateEmailsAndMobiles()
      })
    },
  },
  methods: {
    externalValidate(callbackFunc) {
      callbackFunc(this.validateEmailsAndMobiles())
    },
    validateEmailsAndMobiles() {
      this.$refs.innerDialog.validateItems(['mobiles'])
      this.$refs.innerDialog.validateItems(['mobiles'])
      if (this.notifyGroupForm.emails.length + this.notifyGroupForm.mobiles.length <= 0) {
        this.externalErrorMessage = this.$t('NotifyGroup.Valid.EmailOrMobile.Require')
        return false
      } else {
        this.externalErrorMessage = ''
        return true
      }
    },
    submitForm() {
      if (this.mode === 'Create') {
        return NotifyGroupService.createNotifyGroup(
          this.notifyGroupForm.name,
          this.notifyGroupForm.emails,
          this.notifyGroupForm.mobiles,
        )
      }
      if (this.mode === 'Edit') {
        return NotifyGroupService.updateNotifyGroup(
          this.notifyGroupId,
          this.notifyGroupForm.name,
          this.notifyGroupForm.emails,
          this.notifyGroupForm.mobiles,
        )
      }
      if (this.mode === 'Delete') {
        return NotifyGroupService.deleteNotifyGroup(this.notifyGroupId)
      }
    },
    successMessageFormatter() {
      return this.$T(`NotifyGroup.${this.mode}.Success`, {
        name: this.notifyGroupForm.name,
      })
    },
    doCreate() {
      this.mode = 'Create'
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
      this.mode = 'Edit'
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
      this.mode = 'Delete'
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
