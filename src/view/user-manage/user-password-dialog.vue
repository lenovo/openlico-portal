<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="$t('User.ChangePassword.Title')"
    size="500px"
    :form-model="userForm"
    :form-rules="userRules"
    :success-message-formatter="successMessageFormatter">
    <a-form-item :label="$t('User.Username')" name="username">
      <a-input id="tid_user-change-password-username" v-model:value="userForm.username" :disabled="true" />
    </a-form-item>
    <a-form-item :label="$t('User.Password')" name="password">
      <a-input
        id="tid_user-change-password-password"
        v-model:value="userForm.password"
        type="password"
        autocomplete="new-password" />
    </a-form-item>
    <a-form-item :label="$t('User.Password.Check')" name="passwordCheck">
      <a-input
        id="tid_user-change-password-password-check"
        v-model:value="userForm.passwordCheck"
        type="password"
        autocomplete="new-password" />
    </a-form-item>
  </composite-form-dialog>
</template>
<script>
import UserService from '@/service/user'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import ValidRoleFactory from '@/common/valid-role-factory'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    const validatePasswordCheck = (rule, value) => {
      return new Promise((resolve, reject) => {
        if (this.userForm.password !== this.userForm.passwordCheck) {
          reject(new Error(this.$t('User.Password.Check.Valid')))
        } else {
          resolve()
        }
      })
    }

    return {
      userId: 0,
      userForm: {
        username: '',
        password: '',
        passwordCheck: '',
      },
      userRules: {
        username: [
          ValidRoleFactory.getRequireRoleForText(this.$t('User.Username')),
          ValidRoleFactory.getLengthRoleForText(this.$t('User.Username'), 3, 32),
        ],
        password: [
          ValidRoleFactory.getRequireRoleForText(this.$t('User.Password')),
          ValidRoleFactory.getPasswordRole(this.$t('User.Password')),
        ],
        passwordCheck: [
          ValidRoleFactory.getRequireRoleForText(this.$t('User.Password.Check')),
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
      return UserService.changeUserPassword(this.userId, this.userForm.password)
    },
    successMessageFormatter(res) {
      return this.$T('User.ChangePassword.Success', { name: this.userForm.username })
    },
    doChangePassword(user) {
      this.userId = user.id
      this.userForm = {
        username: user.username,
        password: '',
        passwordCheck: '',
      }
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
