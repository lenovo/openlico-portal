<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="540px"
    :form-model="userForm"
    :form-rules="userRules"
    :success-message-formatter="successMessageFormatter"
    :external-validate="externalValidate">
    <a-form-item v-if="mode != 'Unfreezed'" :label="$t('User.Username')" :name="mode == 'Delete' ? '' : 'username'">
      <a-input v-model:value="userForm.username" :disabled="mode == 'Edit' || mode == 'Delete' || mode == 'Freezed'" />
    </a-form-item>
    <a-form-item v-if="freezed() && mode != 'Delete'" :label="$t('User.Role')" name="role">
      <a-select
        v-model:value="userForm.role"
        :disabled="mode == 'Delete' || (userForm.username == $store.state.auth.username && mode == 'Edit')">
        <a-select-option v-for="item in roleOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-if="freezed() && mode != 'Delete'" :label="$t('User.FirstName')" name="firstName">
      <a-input v-model:value="userForm.firstName" :disabled="mode == 'Delete'" />
    </a-form-item>
    <a-form-item v-if="freezed() && mode != 'Delete'" :label="$t('User.LastName')" name="lastName">
      <a-input v-model:value="userForm.lastName" :disabled="mode == 'Delete'" />
    </a-form-item>
    <a-form-item
      v-if="freezed() && arch == 'host' && mode != 'Delete' && isScheduler"
      :label="$t('BillGroup')"
      name="billGroupId">
      <a-select
        v-model:value.number="userForm.billGroupId"
        show-search
        :filter-option="filterOption"
        :disabled="mode == 'Delete'">
        <a-select-option v-for="item in billGroupOptions" :key="item.value" :label="item.label" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-if="freezed() && mode != 'Delete'" :label="$t('User.Email')" name="email">
      <a-input v-model:value="userForm.email" :disabled="mode == 'Delete'" autocomplete="new-email" />
    </a-form-item>
    <a-form-item
      v-if="ldapManaged && freezed() && arch == 'host' && mode != 'Delete'"
      :label="$t('UserGroup')"
      name="userGroupName"
      :rules="userGroupNameRules">
      <a-checkbox v-if="mode === 'Create'" :checked="autoUserGroup" @change="autoUserGroup = !autoUserGroup">
        {{ $t('User.AutoUserGroup') }}
      </a-checkbox>
      <a-form-item-rest>
        <a-select
          v-if="!autoUserGroup"
          v-model:value="userForm.userGroupName"
          show-search
          option-filter-prop="title"
          :disabled="mode == 'Delete'">
          <a-select-option v-for="item in userGroupOptions" :key="item.value" :value="item.value" :title="item.label">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item-rest>
    </a-form-item>
    <a-form-item v-if="mode == 'Create'" :label="$t('User.Password')" name="password">
      <a-input v-model:value="userForm.password" type="password" autocomplete="new-password" />
    </a-form-item>
    <a-form-item v-if="mode == 'Create'" :label="$t('User.Password.Check')" name="passwordCheck">
      <a-input v-model:value="userForm.passwordCheck" type="password" autocomplete="new-password" />
    </a-form-item>

    <a-form-item v-if="mode === 'Freezed' && ldapManaged" :label="$t('User.Freezed.Mode')" name="suspensionType">
      <a-select v-model:value="userForm.suspensionType" default-value="portal">
        <a-select-option value="portal">{{ $t('User.Freezed.Mode.Portal') }}</a-select-option>
        <a-select-option value="all">{{ $t('User.Freezed.Mode.All') }}</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item
      v-if="mode === 'Freezed' && userForm.suspensionType !== 'all'"
      :label="$t('User.Freezed.Time')"
      name="freezedTimeDay">
      <a-input-group compact>
        <a-input
          v-model:value="userForm.freezedTimeDay"
          style="width: 25%"
          :addon-after="$t('User.Freezed.Time.Days')" />
        <a-input
          v-model:value="userForm.freezedTimeHour"
          style="width: 25%; margin-left: 10px"
          :addon-after="$t('User.Freezed.Time.Hours')" />
      </a-input-group>
    </a-form-item>
    <p v-if="mode == 'Unfreezed'">
      {{ $T('User.Unfreezed.Text', { name: userForm.username }) }}
    </p>
  </composite-form-dialog>
</template>
<script>
import UserService from '@/service/user'
import UserGroupService from '@/service/user-group'
import BillGroupService from '@/service/bill-group'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import ValidRoleFactory from '@/common/valid-role-factory'
import AuthService from '@/service/auth'
import AccessService from '@/service/access'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  props: ['isScheduler'],
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
    const validateFreezedTime = (rule, value) => {
      return new Promise((resolve, reject) => {
        const label = this.$t('User.Freezed.Time')
        const decimal = 0
        const max = 999
        const min = 0
        const freezedD = String(this.userForm.freezedTimeDay).split('.')
        const freezedH = String(this.userForm.freezedTimeHour).split('.')
        const errors = []

        if (isNaN(this.userForm.freezedTimeHour)) {
          errors.push(new Error(this.$T('Valid.Number', { name: label })))
        }

        if (
          (freezedD.length > 1 && freezedD[1].length > decimal) ||
          (freezedH.length > 1 && freezedH[1].length > decimal)
        ) {
          errors.push(new Error(this.$T('Valid.Number.Decimal', { name: label, decimal })))
        }

        const num = Number(this.userForm.freezedTimeHour)

        if (num < min || num > max) {
          if (!max && max !== 0) {
            errors.push(new Error(this.$T('Valid.Number.Range.Min', { name: label, min })))
          } else if (!min && min !== 0) {
            errors.push(new Error(this.$T('Valid.Number.Range.Max', { name: label, max })))
          } else {
            errors.push(new Error(this.$T('Valid.Number.Range', { name: label, min, max })))
          }
        }

        if (errors.length > 0) {
          reject(errors)
        } else {
          resolve()
        }
      })
    }
    return {
      arch: AccessService.getSchedulerArch(),
      title: '',
      mode: '',
      ldapManaged: AuthService.isLDAPManaged(),
      userId: 0,
      userForm: {
        username: '',
        role: 300,
        firstName: '',
        lastName: '',
        billGroupId: null,
        userGroupName: '',
        email: '',
        homeDirectory: '',
        password: '',
        passwordCheck: '',
        freezedTimeDay: 0,
        freezedTimeHour: 0,
        suspensionType: null,
      },
      usernameOptions: [],
      userGroupOptions: [],
      billGroupOptions: [],
      userRules: {
        username: [
          ValidRoleFactory.getRequireRoleForText(this.$t('User.Username')),
          ValidRoleFactory.getLengthRoleForText(this.$t('User.Username'), 3, 31),
          ValidRoleFactory.getValidUserameForText(this.$t('User.Username'), true),
        ],
        role: [ValidRoleFactory.getRequireRoleForText(this.$t('User.Role'))],
        firstName: [ValidRoleFactory.getLengthRoleForText(this.$t('User.FirstName'), 1, 20)],
        lastName: [ValidRoleFactory.getLengthRoleForText(this.$t('User.LastName'), 1, 20)],
        email: [ValidRoleFactory.getEmailRole(this.$t('User.Email'))],
        homeDirectory: [ValidRoleFactory.getLengthRoleForText(this.$t('User.HomeDirectory'), 0, 255)],
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
        freezedTimeDay: [
          ValidRoleFactory.getValidNumberRoleForText(this.$t('User.Freezed.Time')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('User.Freezed.Time'), 0, 999),
          { validator: validateFreezedTime },
        ],
      },
      autoUserGroup: true,
      modeActions: ['Create', 'Edit', 'Delete', 'Import', 'Freezed', 'Unfreezed'],
    }
  },
  computed: {
    roleOptions() {
      const arr = []
      UserService.UserRoleEnums.forEach(role => {
        if (this.arch === 'host' || role !== 200) {
          arr.push({
            value: role,
            label: UserService.getUserRoleDisplayName(role),
          })
        }
      })
      return arr
    },
    userGroupNameRules() {
      return !this.autoUserGroup
        ? [{ required: true, message: this.$T('Valid.Require', { name: 'User Group' }), trigger: 'change' }]
        : []
    },
  },
  methods: {
    filterOption(input, option) {
      return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
    async submitForm() {
      if (this.mode === 'Create') {
        await this.assignOrCreateUserGroup()
        return UserService.createUser(
          this.userForm.username,
          this.userForm.role,
          this.userForm.firstName,
          this.userForm.lastName,
          this.userForm.billGroupId,
          this.userForm.email,
          this.userForm.userGroupName,
          this.userForm.password,
        )
      }
      if (this.mode === 'Edit') {
        this.assignOrCreateUserGroup()
        return UserService.updateUser(
          this.userId,
          this.userForm.username,
          this.userForm.role,
          this.userForm.firstName,
          this.userForm.lastName,
          this.userForm.billGroupId,
          this.userForm.email,
          this.userForm.userGroupName,
        )
      }
      if (this.mode === 'Delete') {
        return UserService.deleteUser(this.userId, this.userForm.username)
      }
      if (this.mode === 'Import') {
        return UserService.importUser(
          this.userForm.username,
          this.userForm.role,
          this.userForm.firstName,
          this.userForm.lastName,
          this.userForm.billGroupId,
          this.userForm.email,
          this.userForm.homeDirectory,
        )
      }
      if (this.mode === 'Freezed') {
        if (this.userForm.suspensionType === 'portal') {
          return UserService.freezedUserByName(this.userId, this.userForm.freezedTimeDay, this.userForm.freezedTimeHour)
        } else if (this.userForm.suspensionType === 'all') {
          return UserService.fullLockUser(this.userId)
        }
      }
      if (this.mode === 'Unfreezed') {
        return UserService.unfreezedUserByName(this.userId)
      }
    },
    successMessageFormatter(res) {
      if (this.modeActions.includes(this.mode)) {
        return this.$T(`User.${this.mode}.Success`, {
          name: this.userForm.username,
        })
      }
    },
    getUserInfo(id) {
      UserService.getUserById(id).then(res => {
        this.initUserGroupOptions(res.userGroupName)
      })
    },
    initUserListOption() {
      UserService.getUserImportList().then(res => {
        res.forEach(role => {
          this.usernameOptions.push({
            value: role,
            label: role,
          })
        })
      })
    },
    initUserGroupOptions(defaultUserGroupName) {
      if (this.ldapManaged) {
        UserGroupService.getAllUserGroups().then(
          res => {
            const options = []
            res.forEach(userGroup => {
              options.push({
                value: userGroup.name,
                label: userGroup.name,
              })
            })
            this.userGroupOptions = options
            if (defaultUserGroupName) {
              this.userForm.userGroupName = defaultUserGroupName
            } else if (this.userGroupOptions.length > 0) {
              this.userForm.userGroupName = this.userGroupOptions[0].value
            } else {
              this.userForm.userGroupName = ''
            }
          },
          res => {
            this.$message.error(res)
          },
        )
      } else {
        this.userForm.userGroupName = defaultUserGroupName
      }
    },
    initBillGroupOptions(defaultBillGroupId) {
      if (this.arch !== 'host') return
      BillGroupService.getAllBillGroups().then(
        res => {
          const options = []
          res.forEach(billGroup => {
            options.push({
              value: billGroup.id,
              label: billGroup.name,
            })
          })
          this.billGroupOptions = options
          if (defaultBillGroupId) {
            this.userForm.billGroupId = defaultBillGroupId
          } else {
            this.userForm.billGroupId = null
          }
        },
        res => {
          this.$message.error(res)
        },
      )
    },
    freezed() {
      if (this.mode !== 'Freezed' && this.mode !== 'Unfreezed') {
        return true
      } else {
        return false
      }
    },
    externalValidate(callbackFunc) {
      if (
        this.mode === 'Freezed' &&
        this.userForm.freezedTimeDay === 0 &&
        this.userForm.freezedTimeHour === 0 &&
        this.userForm.suspensionType !== 'all'
      ) {
        this.$message.error(this.$t('User.Freezed.Time.Error'))
        callbackFunc(false)
      } else {
        callbackFunc(true)
      }
    },
    doCreate() {
      this.mode = 'Create'
      this.autoUserGroup = true
      return this.doInitInfo()
    },
    doImport() {
      this.mode = 'Import'
      this.usernameOptions = []
      return this.doInitInfo()
    },
    doInitInfo() {
      this.userId = 0
      this.userForm = {
        username: '',
        role: 100,
        firstName: '',
        lastName: '',
        billGroupId: null,
        userGroupName: '',
        email: '',
        homeDirectory: '',
        password: '',
        passwordCheck: '',
      }
      this.initUserGroupOptions()
      this.initBillGroupOptions()
      this.title = this.$t(`User.${this.mode}.Title`)
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEdit(user) {
      this.mode = 'Edit'
      this.autoUserGroup = false
      return this.doFoundInfo(user)
    },
    doDelete(user) {
      this.mode = 'Delete'
      return this.doFoundInfo(user)
    },
    doFreezed(user) {
      this.mode = 'Freezed'
      return this.doFoundInfo(user, this.mode)
    },
    doUnfreezed(user) {
      this.mode = 'Unfreezed'
      return this.doFoundInfo(user, this.mode)
    },
    doFoundInfo(user, model = 'null') {
      this.userId = user.id
      this.userForm = {
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        billGroupId: null,
        userGroupName: '',
        email: user.email,
        homeDirectory: '',
        password: '',
        passwordCheck: '',
      }
      if (model === 'Freezed' || model === 'Unfreezed') {
        this.userForm.role = ''
        this.userForm.firstName = ''
        this.userForm.lastName = ''
        this.userForm.email = ''
      }
      if (model === 'Freezed') {
        this.userForm.freezedTimeDay = 0
        this.userForm.freezedTimeHour = 0
        this.userForm.suspensionType = 'portal'
      }
      this.getUserInfo(user.id)
      this.initBillGroupOptions(user.billGroupId)
      this.title = this.$T(`User.${this.mode}.Title`, { id: user.id })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    async assignOrCreateUserGroup() {
      if (this.autoUserGroup) {
        this.userForm.userGroupName = this.userForm.username
        if (!this.userGroupOptions.some(x => x.label === this.userForm.userGroupName)) {
          await UserGroupService.createUserGroup(this.userForm.userGroupName)
        }
      }
    },
  },
}
</script>
