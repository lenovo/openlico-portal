<template>
  <div class="multi-user-selector">
    <a-input-group compact>
      <!-- eslint-disable -->
      <a-input
        ref="input"
        :addon-before="addonBeforeText"
        style="width: 70%"
        readOnly
        :placeholder="$t(allable ? 'Multi.User.All' : 'Multi.User.PleaseSelect')"
        :value="result"
        @change="inputValueChange" />
      <!-- eslint-enable -->
      <a-button type="primary" @click="Select">
        {{ $t('Multi.User.select') }}
      </a-button>
      <a-button
        v-if="formValue.values.length > 0 && clearable"
        class="clear-button"
        type="primary"
        danger
        @click="onClear">
        {{ $t('Action.Clear') }}
      </a-button>
    </a-input-group>
    <users-selector-dialog
      ref="userDialog"
      :form-value="formValue"
      :filter-list="filterList"
      :max-value="maxValue"
      :allable="allable || false"
      @on-selected="onSelected" />
  </div>
</template>

<script>
import UserSelectorDialog from './multi-user-selector/users-selector-dialog.vue'
import BillGroupService from '@/service/bill-group'

export default {
  components: {
    'users-selector-dialog': UserSelectorDialog,
  },
  props: [
    'usersValue',
    'usersType',
    'filterType',
    'usernameMax',
    'usergroupMax',
    'billinggroupMax',
    'allable',
    'clearable',
  ],
  emits: ['change'],
  data() {
    return {
      formValue: {
        values: this.usersValue || [],
        value_type: this.usersType || 'username',
      },
      maxValue: {
        username: Number(this.usernameMax) || 50,
        usergroup: Number(this.usergroupMax) || 10,
        billinggroup: Number(this.billinggroupMax) || 10,
      },
      result: this.formatValue({
        values: this.usersValue,
        value_type: this.usersType || 'username',
      }),
      filterList: this.filterType.split(','),
    }
  },
  computed: {
    addonBeforeText() {
      let text = ''
      if (
        this.formValue.values.length > 0 &&
        (this.formValue.value_type === 'usergroup' || this.formValue.value_type === 'billinggroup')
      ) {
        const type = this.formValue.value_type
        text = type === 'usergroup' ? this.$t('UserGroup') : type === 'billinggroup' ? this.$t('BillGroup') : ''
      }
      return text
    },
  },
  methods: {
    Select() {
      this.$refs.userDialog.init()
    },
    onSelected(res) {
      this.formValue = res
      this.$emit('change', this.formValue)
      this.formatValue(res)
    },
    formatValue(data) {
      let result
      if (data.value_type === 'billinggroup') {
        BillGroupService.getAllBillGroups().then(res => {
          result = res
            .filter(item => {
              return data.values.find(ele => {
                return ele === item.id
              })
            })
            .map(item => {
              return item.name
            })
            .join(',')
          this.result = result
        })
      } else {
        this.result = data.values.join(',')
      }
    },
    inputValueChange(e) {
      if (e.target.value === '') {
        this.onClear()
      }
    },
    onClear() {
      this.formValue.values = []
      this.$emit('change', this.formValue)
      this.formatValue(this.formValue)
    },
    setUsername(username) {
      this.formValue.values = [username]
      this.formValue.value_type = 'username'
      this.$emit('change', this.formValue)
      this.formatValue(this.formValue)
    },
  },
}
</script>

<style scoped>
.multi-user-selector {
  display: inline-block;
  vertical-align: middle;
  width: 400px;
  position: relative;
}
/* .clear-button{
    margin-left: 10px;
} */
</style>
