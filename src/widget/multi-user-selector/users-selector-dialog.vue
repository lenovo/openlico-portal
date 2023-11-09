<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="$t('Multi.User.Title')"
    size="500px"
    :form-model="usersForm"
    :form-rules="usersRules">
    <a-form-item :label="$t('Multi.User.Filter')">
      <a-select v-model:value="usersForm.Filter" @change="clearState">
        <a-select-option v-for="item in filterList" :key="item.toString()" :value="item">
          {{ $t('Multi.User.' + item) }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-if="usersForm.Filter == 'username'" :label="$t('Multi.User.username')" name="username">
      <a-textarea
        v-model:value="usersForm.username"
        resize="none"
        :placeholder="$t(allable ? 'Multi.User.All' : 'Multi.User.PleaseSelect')"
        :auto-size="{ minRows: 2 }" />
    </a-form-item>
    <a-form-item v-if="usersForm.Filter == 'usergroup'" :label="$t('Multi.User.usergroup')" name="usergroup">
      <a-select
        v-model:value="usersForm.usergroup"
        :placeholder="$t(allable ? 'Multi.User.All' : 'Multi.User.PleaseSelect')"
        :filter-option="filterOption"
        mode="multiple"
        show-arrow
        @change="selectUserByUserGroup">
        <a-select-option v-for="item in usersData.usergroup" :key="item.id" :value="item.name">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-if="usersForm.Filter == 'billinggroup'" :label="$t('Multi.User.billinggroup')" name="billinggroup">
      <a-select
        v-model:value="usersForm.billinggroup"
        :placeholder="$t(allable ? 'Multi.User.All' : 'Multi.User.PleaseSelect')"
        :filter-option="filterOption"
        mode="multiple"
        show-arrow
        @change="selectUserByBillGroup">
        <a-select-option v-for="item in usersData.billinggroup" :key="item.id" :value="item.id">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-if="clearable" style="margin-top: 10px">
      <a-button type="primary" danger size="small" @click="onClearClick">
        {{ $t('Action.Clear') }}
      </a-button>
    </a-form-item>
  </composite-form-dialog>
</template>

<script>
import UserGroupService from '@/service/user-group'
import BillGroupService from '@/service/bill-group'
import ValidRoleFactory from '@/common/valid-role-factory'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'

export default {
  components: {
    CompositeFormDialog,
  },
  props: ['formValue', 'filterList', 'allable', 'maxValue'],
  emits: ['on-selected'],
  data() {
    return {
      usersForm: {
        Filter: this.FilterKey,
        usergroup: [],
        billinggroup: [],
        username: '',
      },
      usersData: {
        usergroup: [],
        billinggroup: [],
      },
      usersRules: {
        username: [ValidRoleFactory.getValidUsersName(this.allable, this.maxValue.username)],
        usergroup: [ValidRoleFactory.getValidMultiSelect(this.allable)],
        billinggroup: [ValidRoleFactory.getValidMultiSelect(this.allable)],
      },
    }
  },
  computed: {
    clearable() {
      let retval
      if (this.usersForm.Filter === 'username') {
        retval = this.usersForm.username
      }
      if (this.usersForm.Filter === 'usergroup') {
        retval = this.usersForm.usergroup.length > 0
      }
      if (this.usersForm.Filter === 'billinggroup') {
        retval = this.usersForm.billinggroup.length > 0
      }
      return retval
    },
  },
  methods: {
    init() {
      this.usersForm = {
        Filter: this.formValue.value_type,
        usergroup: this.formValue.value_type === 'usergroup' ? this.formValue.values : [],
        billinggroup: this.formValue.value_type === 'billinggroup' ? this.formValue.values : [],
        username: this.formValue.value_type === 'username' ? this.formValue.values.join(',') : [],
      }
      this.getGroups()
      this.$refs.innerDialog
        .emptyPopup()
        .then(() => {
          const data = this.doConfirm()
          this.$emit('on-selected', data)
        })
        .catch(_ => {
          // do Nothing
        })
    },
    clearState() {
      this.usersForm = {
        Filter: this.usersForm.Filter,
        usergroup: [],
        billinggroup: [],
        username: '',
      }
      this.$refs.innerDialog.$refs.innerForm.clearValidate()
    },
    getGroups() {
      if (this.filterList.includes('usergroup')) {
        UserGroupService.getAllUserGroups().then(res => {
          this.usersData.usergroup = res.sort((a, b) => a.name.localeCompare(b.name))
        })
      }
      if (this.filterList.includes('billinggroup')) {
        BillGroupService.getAllBillGroups().then(res => {
          this.usersData.billinggroup = res.sort((a, b) => a.name.localeCompare(b.name))
        })
      }
    },
    doConfirm() {
      const newData = {
        values: [],
        value_type: this.usersForm.Filter,
      }
      let values = []
      if (this.usersForm.Filter === 'username') {
        values = this.usersForm.username === '' ? [] : this.usersForm.username.split(',')
      } else {
        values = this.usersForm[this.usersForm.Filter]
      }
      newData.values = values

      return newData
    },
    onClearClick() {
      this.usersForm.usergroup = []
      this.usersForm.billinggroup = []
      this.usersForm.username = ''
      this.$refs.innerDialog.$refs.innerForm.clearValidate()
    },
    selectUserByUserGroup(val) {
      // multiple-limit
      if (val.length > this.maxValue.usergroup) {
        this.$message.warning(
          this.$T('Multi.User.tooLong', {
            value: this.maxValue.usergroup,
          }),
        )
        this.usersForm.usergroup = this.usersForm.usergroup.slice(0, this.maxValue.usergroup)
      }
    },
    selectUserByBillGroup(val) {
      // multiple-limit
      if (val.length > this.maxValue.billinggroup) {
        this.$message.warning(
          this.$T('Multi.User.tooLong', {
            value: this.maxValue.billinggroup,
          }),
        )
        this.usersForm.billinggroup = this.usersForm.billinggroup.slice(0, this.maxValue.billinggroup)
      }
    },
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
  },
}
</script>
