<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="500px"
    :form-model="userGroupForm"
    :form-rules="userGroupRules"
    :success-message-formatter="successMessageFormatter">
    <a-form-item :label="$t('UserGroup.Name')" name="name">
      <a-input id="tid_user-group-name" v-model:value="userGroupForm.name" :disabled="mode == 'delete'" />
    </a-form-item>
  </composite-form-dialog>
</template>
<script>
import UserGroupService from '@/service/user-group'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import ValidRoleFactory from '@/common/valid-role-factory'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    return {
      title: '',
      mode: '',
      userGroupName: '',
      userGroupForm: {
        name: '',
      },
      userGroupRules: {
        name: [
          ValidRoleFactory.getRequireRoleForText(this.$t('UserGroup.Name')),
          ValidRoleFactory.getLengthRoleForText(this.$t('UserGroup.Name'), 3, 31),
          ValidRoleFactory.getValidUserameForText(this.$t('UserGroup.Name'), true),
        ],
      },
    }
  },
  methods: {
    submitForm() {
      if (this.mode === 'create') {
        return UserGroupService.createUserGroup(this.userGroupForm.name)
      }
      if (this.mode === 'edit') {
        return UserGroupService.updateUserGroup(this.userGroupName, this.userGroupForm.name)
      }
      if (this.mode === 'delete') {
        return UserGroupService.deleteUserGroup(this.userGroupName)
      }
    },
    successMessageFormatter(res) {
      const userGroup = res
      if (this.mode === 'create') {
        return this.$T('UserGroup.Create.Success', { name: userGroup.name })
      }
      if (this.mode === 'edit') {
        return this.$T('UserGroup.Edit.Success', { name: userGroup.name })
      }
      if (this.mode === 'delete') {
        return this.$T('UserGroup.Delete.Success', { name: userGroup.name })
      }
    },
    doCreate() {
      this.mode = 'create'
      this.userGroupName = ''
      this.userGroupForm = {
        name: '',
      }
      this.title = this.$t('UserGroup.Create.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEdit(userGroup) {
      this.mode = 'edit'
      this.userGroupName = userGroup.name
      this.userGroupForm = {
        name: userGroup.name,
      }
      this.title = this.$T('UserGroup.Edit.Title', { id: userGroup.name })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doDelete(userGroup) {
      this.mode = 'delete'
      this.userGroupName = userGroup.name
      this.userGroupForm = {
        name: userGroup.name,
      }
      this.title = this.$T('UserGroup.Delete.Title', { id: userGroup.name })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
