<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="540px"
    :form-model="userForm"
    :form-rules="userRules"
    :composite-height="compositeHeight"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter"
    :external-validate="externalValidate">
    <a-form-model-item
      v-if="mode != 'unfreezed'"
      :label="$t('User.Username')"
      :prop="mode == 'delete' ? '' : 'username'">
      <a-input
        id="tid_user-username"
        v-model="userForm.username"
        :disabled="mode == 'edit' || mode == 'delete' || mode == 'freezed'" />
    </a-form-model-item>
    <a-form-model-item v-if="freezed() && mode != 'delete'" :label="$t('User.Role')" prop="role">
      <a-select
        id="tid_user-role"
        v-model="userForm.role"
        :disabled="mode == 'delete' || (userForm.username == $store.state.auth.username && mode == 'edit')">
        <a-select-option v-for="item in roleOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item v-if="freezed() && mode != 'delete'" :label="$t('User.FirstName')" prop="firstName">
      <a-input id="tid_user-firstname" v-model="userForm.firstName" :disabled="mode == 'delete'" />
    </a-form-model-item>
    <a-form-model-item v-if="freezed() && mode != 'delete'" :label="$t('User.LastName')" prop="lastName">
      <a-input id="tid_user-lastname" v-model="userForm.lastName" :disabled="mode == 'delete'" />
    </a-form-model-item>
    <a-form-model-item
      v-if="freezed() && arch == 'host' && mode != 'delete' && isScheduler"
      :label="$t('BillGroup')"
      prop="billGroupId">
      <a-select
        id="tid_user-billgroup"
        v-model.number="userForm.billGroupId"
        show-search
        option-filter-prop="children"
        :disabled="mode == 'delete'">
        <a-select-option v-for="item in billGroupOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item v-if="freezed() && mode != 'delete'" :label="$t('User.Email')" prop="email">
      <a-input id="tid_user-email" v-model="userForm.email" :disabled="mode == 'delete'" />
    </a-form-model-item>
    <!-- <a-form-model-item :label="$t('User.HomeDirectory')" prop="homeDirectory" v-if="mode == 'import'">
    <a-input id="tid_user-home-directory" v-model="userForm.homeDirectory" :disabled="mode == 'delete'"></a-input>
  </a-form-model-item> -->
    <a-form-model-item
      v-if="ldapManaged && freezed() && arch == 'host' && mode != 'delete'"
      :label="$t('UserGroup')"
      prop="userGroupName">
      <a-select
        id="tid_user-usergroup"
        v-model="userForm.userGroupName"
        show-search
        option-filter-prop="children"
        :disabled="mode == 'delete'">
        <a-select-option v-for="item in userGroupOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item v-if="mode == 'create'" :label="$t('User.Password')" prop="password">
      <a-input id="tid_user-password" v-model="userForm.password" type="password" />
    </a-form-model-item>
    <a-form-model-item v-if="mode == 'create'" :label="$t('User.Password.Check')" prop="passwordCheck">
      <a-input id="tid_user-password-check" v-model="userForm.passwordCheck" type="password" />
    </a-form-model-item>

    <a-form-model-item v-if="mode == 'freezed'" :label="$t('User.Freezed.Time')" prop="freezedTimeDay">
      <a-input-group compact>
        <a-input
          id="tid_user-freezed-day"
          v-model="userForm.freezedTimeDay"
          style="width: 25%"
          :addon-after="$t('User.Freezed.Time.Days')" />
        <a-input
          id="tid_user-freezed-hour"
          v-model="userForm.freezedTimeHour"
          style="width: 25%; margin-left: 10px"
          :addon-after="$t('User.Freezed.Time.Hours')" />
      </a-input-group>
    </a-form-model-item>
    <p v-if="mode == 'unfreezed'">
      {{ $t('User.Unfreezed.Text', { name: userForm.username }) }}
    </p>
  </composite-form-dialog>
</template>
<script>
import UserService from '../../service/user'
import UserGroupService from '../../service/user-group'
import BillGroupService from '../../service/bill-group'
import CompositeFormDialog from '../../component/composite-form-dialog'
import ValidRoleFactory from '../../common/valid-role-factory'
import AuthService from '../../service/auth'
import AccessService from '../../service/access'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  props: ['isScheduler'],
  data() {
    const validatePasswordCheck = (rule, value, callback) => {
      if (this.userForm.password !== this.userForm.passwordCheck) {
        return callback(new Error(this.$t('User.Password.Check.Valid')))
      } else {
        callback()
      }
    }
    const validateFreezedTime = (rule, value, callback) => {
      const label = this.$t('User.Freezed.Time')
      const decimal = 0
      const max = 999
      const min = 0
      const freezedD = String(this.userForm.freezedTimeDay).split('.')
      const freezedH = String(this.userForm.freezedTimeHour).split('.')
      const errors = []
      if (isNaN(this.userForm.freezedTimeHour)) {
        errors.push(new Error(this.$t('Valid.Number', { name: label })))
      }
      if (
        (freezedD.length > 1 && freezedD[1].length > decimal) ||
        (freezedH.length > 1 && freezedH[1].length > decimal)
      ) {
        errors.push(new Error(this.$t('Valid.Number.Decimal', { name: label, decimal })))
      }
      const num = Number(this.userForm.freezedTimeHour)
      if (num < min || num > max) {
        if (!max && max !== 0) {
          errors.push(new Error(this.$t('Valid.Number.Range.Min', { name: label, min })))
        } else if (!min && min !== 0) {
          errors.push(new Error(this.$t('Valid.Number.Range.Max', { name: label, max })))
        } else {
          errors.push(new Error(this.$t('Valid.Number.Range', { name: label, min, max })))
        }
      }
      callback(errors)
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
        userGroupName: [ValidRoleFactory.getRequireRoleForText(this.$t('UserGroup'))],
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
    compositeHeight() {
      if (this.mode === 'freezed') {
        return 415
      }
      if (this.mode === 'unfreezed') {
        return 210
      }
      if (this.mode === 'delete') {
        return 280
      }
      return 0
    },
  },
  methods: {
    submitForm() {
      if (this.mode === 'create') {
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
      if (this.mode === 'edit') {
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
      if (this.mode === 'delete') {
        return UserService.deleteUser(this.userId, this.userForm.username)
      }
      if (this.mode === 'import') {
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
      if (this.mode === 'freezed') {
        return UserService.freezedUserByName(this.userId, this.userForm.freezedTimeDay, this.userForm.freezedTimeHour)
      }
      if (this.mode === 'unfreezed') {
        return UserService.unfreezedUserByName(this.userId)
      }
    },
    successMessageFormatter(res) {
      if (this.mode === 'create') {
        return this.$t('User.Create.Success', {
          name: this.userForm.username,
        })
      }
      if (this.mode === 'edit') {
        return this.$t('User.Edit.Success', {
          name: this.userForm.username,
        })
      }
      if (this.mode === 'delete') {
        return this.$t('User.Delete.Success', {
          name: this.userForm.username,
        })
      }
      if (this.mode === 'import') {
        return this.$t('User.Import.Success', {
          name: this.userForm.username,
        })
      }
      if (this.mode === 'freezed') {
        return this.$t('User.Freezed.Success', {
          name: this.userForm.username,
        })
      }
      if (this.mode === 'unfreezed') {
        return this.$t('User.Unfreezed.Success', {
          name: this.userForm.username,
        })
      }
    },
    errorMessageFormatter(res) {
      return res
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
      if (this.mode !== 'freezed' && this.mode !== 'unfreezed') {
        return true
      } else {
        return false
      }
    },
    externalValidate(callbackFunc) {
      if (this.mode === 'freezed' && this.userForm.freezedTimeDay === 0 && this.userForm.freezedTimeHour === 0) {
        this.$message.error(this.$t('User.Freezed.Time.Error'))
        callbackFunc(false)
      } else {
        callbackFunc(true)
      }
    },
    doCreate() {
      this.mode = 'create'
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
      this.title = this.$t('User.Create.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEdit(user) {
      this.mode = 'edit'
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
      this.getUserInfo(user.id)
      this.initBillGroupOptions(user.billGroupId)
      this.title = this.$t('User.Edit.Title', { id: user.id })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doDelete(user) {
      this.mode = 'delete'
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
      this.getUserInfo(user.id)
      this.initBillGroupOptions(user.billGroupId)
      this.title = this.$t('User.Delete.Title', { id: user.id })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doImport() {
      this.mode = 'import'
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
      this.usernameOptions = []
      //   this.initUserListOption();
      this.initUserGroupOptions()
      this.initBillGroupOptions()
      this.title = this.$t('User.Import.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doFreezed(user) {
      this.mode = 'freezed'
      this.userId = user.id
      this.userForm = {
        username: user.username,
        role: '',
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
      }
      this.title = this.$t('User.Freezed.Title', { id: user.id })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doUnfreezed(user) {
      this.mode = 'unfreezed'
      this.userId = user.id
      this.userForm = {
        username: user.username,
        role: '',
        firstName: '',
        lastName: '',
        billGroupId: null,
        userGroupName: '',
        email: '',
        homeDirectory: '',
        password: '',
        passwordCheck: '',
      }
      this.title = this.$t('User.Unfreezed.Title', { id: user.id })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
