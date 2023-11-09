<template>
  <composite-form-dialog
    id="tid_change-password-dialog"
    ref="innerDialog"
    :title="$t('Auth.ChangePassword.Title')"
    size="540px"
    :form-model="userForm"
    :form-rules="userRules"
    :success-message-formatter="successMessageFormatter">
    <a-form-item :label="$t('Auth.CurrentPassword')" name="currentPassword">
      <a-input id="tid_change-password-current-password" v-model:value="userForm.currentPassword" type="password" />
    </a-form-item>
    <a-form-item :label="$t('Auth.NewPassword')" name="password">
      <a-input id="tid_change-password-password" v-model:value="userForm.password" type="password" />
    </a-form-item>
    <a-form-item :label="$t('Auth.NewPassword.Check')" name="passwordCheck">
      <a-input id="tid_change-password-password-check" v-model:value="userForm.passwordCheck" type="password" />
    </a-form-item>
  </composite-form-dialog>
</template>
<script>
import AuthService from '@/service/auth'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import ValidRoleFactory from '@/common/valid-role-factory'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    const validatePasswordCheck = (rule, value, callback) => {
      if (this.userForm.password !== this.userForm.passwordCheck) {
        return callback(new Error(this.$t('Auth.NewPassword.Check.Valid')))
      } else {
        callback()
      }
    }
    return {
      userId: 0,
      userForm: {
        currentPassword: '',
        password: '',
        passwordCheck: '',
      },
      userRules: {
        currentPassword: [ValidRoleFactory.getRequireRoleForText(this.$t('Auth.CurrentPassword'))],
        password: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Auth.NewPassword')),
          ValidRoleFactory.getPasswordRole(this.$t('Auth.NewPassword')),
        ],
        passwordCheck: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Auth.NewPassword.Check')),
          {
            validator: validatePasswordCheck,
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    submitForm() {
      return AuthService.changePassword(this.userForm.currentPassword, this.userForm.password)
    },
    successMessageFormatter(res) {
      return this.$t('Auth.ChangePassword.Success')
    },
    doChangePassword() {
      this.userForm = {
        currentPassword: '',
        password: '',
        passwordCheck: '',
      }
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
