<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="$t('User.Edit.Title')"
    size="530px"
    form-label-width="180px"
    :form-model="userForm"
    :form-rules="userRules"
    :success-message-formatter="successMessageFormatter"
    :buttons-text="[$t('Action.Update'), $t('Action.Cancel')]">
    <a-form-item :label="$t('User.FirstName')" name="firstName">
      <a-input v-model:value="userForm.firstName" />
    </a-form-item>
    <a-form-item :label="$t('User.LastName')" name="lastName">
      <a-input v-model:value="userForm.lastName" />
    </a-form-item>
    <a-form-item :label="$t('User.Email')" name="email">
      <a-input v-model:value="userForm.email" />
    </a-form-item>
  </composite-form-dialog>
</template>
<script>
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import UserService from '@/service/user'
import ValidRoleFactory from '@/common/valid-role-factory'
import AccessService from '@/service/access'

export default {
  components: { CompositeFormDialog },
  props: ['userId'],
  data() {
    return {
      arch: AccessService.getSchedulerArch(),
      show: false,
      user: null,
      userForm: {
        firstName: '',
        lastName: '',
        email: '',
      },
      userRules: {
        firstName: [ValidRoleFactory.getLengthRoleForText(this.$t('User.FirstName'), 1, 20)],
        lastName: [ValidRoleFactory.getLengthRoleForText(this.$t('User.LastName'), 1, 20)],
        email: [ValidRoleFactory.getEmailRole(this.$t('User.Email'))],
      },
    }
  },
  methods: {
    open() {
      this.show = true
      this.$nextTick(() => {
        // this.$refs.submitUserForm.resetFields()
        UserService.getUserById(this.userId).then(res => {
          this.userForm.firstName = res.firstName
          this.userForm.lastName = res.lastName
          this.userForm.email = res.email
          this.user = res
        })
      })
      return this.$refs.innerDialog.popup(this.onSubmit)
    },
    successMessageFormatter(res) {
      this.userName = res.realName ? res.realName : res.username
      return this.$T('User.Edit.Success', { name: this.userName })
    },
    onSubmit() {
      const req = { ...this.user, ...this.userForm }
      // There is no need to update the relationship between users and billing groups.
      req.billGroupId = null
      return UserService.updateUser(
        this.userId,
        req.username,
        req.role,
        req.firstName,
        req.lastName,
        req.billGroupId,
        req.email,
        req.userGroupName,
      )
    },
  },
}
</script>
