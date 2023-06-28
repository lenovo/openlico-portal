<template>
  <a-modal :title="$t('User.Edit.Title')" :visible.sync="show" width="540px" @cancel="show = false">
    <a-form-model ref="submitUserForm" label-width="120px" :model="userForm" :rules="userRules">
      <a-form-model-item :label="$t('User.FirstName')" prop="firstName">
        <a-input id="tid_user-firstname" v-model="userForm.firstName" />
      </a-form-model-item>
      <a-form-model-item :label="$t('User.LastName')" prop="lastName">
        <a-input id="tid_user-lastname" v-model="userForm.lastName" />
      </a-form-model-item>
      <a-form-model-item :label="$t('User.Email')" prop="email">
        <a-input id="tid_user-email" v-model="userForm.email" />
      </a-form-model-item>
    </a-form-model>
    <div slot="footer" class="dialog-footer">
      <a-button @click="cancelDialog">
        {{ $t('Action.Cancel') }}
      </a-button>
      <a-button type="primary" @click="onSubmitClick">
        {{ $t('Action.Update') }}
      </a-button>
    </div>
  </a-modal>
</template>
<script>
import UserService from '../../service/user'
import ValidRoleFactory from '../../common/valid-role-factory'
import AccessService from '../../service/access'

export default {
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
        this.$refs.submitUserForm.resetFields()
        UserService.getUserById(this.userId).then(res => {
          this.userForm.firstName = res.firstName
          this.userForm.lastName = res.lastName
          this.userForm.email = res.email
          this.user = res
        })
      })
    },
    cancelDialog() {
      this.show = false
    },
    onSubmitClick() {
      const req = { ...this.user, ...this.userForm }
      // There is no need to update the relationship between users and billing groups.
      req.billGroupId = null
      this.$refs.submitUserForm.validate(valid => {
        if (valid) {
          UserService.updateUser(
            this.userId,
            req.username,
            req.role,
            req.firstName,
            req.lastName,
            req.billGroupId,
            req.email,
            req.userGroupName,
          ).then(
            res => {
              this.show = false
              this.userName = res.realName ? res.realName : res.username
              this.$message.success(
                this.$t('User.Edit.Success', {
                  name: this.userName,
                }),
              )
              this.$emit('on-change')
            },
            err => {
              this.$message.error(err)
            },
          )
        }
      })
    },
  },
}
</script>
