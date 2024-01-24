<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="560px"
    :form-model="billGroupSettingsForm"
    :form-rules="billGroupSettingsRules"
    :form-label-col="8"
    :success-message-formatter="successMessageFormatter"
    class="billing-group-settings-dialog">
    <a-form-item :label="$t('BillGroup.Settings.BalanceAlert')" name="balanceAlert">
      <a-input v-model:value="billGroupSettingsForm.balanceAlert" :addon-before="currency" />
    </a-form-item>
    <a-form-item :label="$t('BillGroup.Settings.NotificationGroup')" name="notificationGroup">
      <a-select v-model:value="billGroupSettingsForm.notificationGroup" allow-clear mode="multiple">
        <a-select-option v-for="item in AlertNotifyList" :key="item.id" :value="item.id" :label="item.name">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </a-form-item>
  </composite-form-dialog>
</template>
<script>
import BillGroupService from '@/service/bill-group'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import ValidRoleFactory from '@/common/valid-role-factory'
import NotifuGroupService from '@/service/notify-group'
export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    return {
      title: '',
      currency: this.$store.getters['settings/getCurrency'],
      AlertNotifyList: [],
      billGroupSettingsForm: {
        balanceAlert: '0.00',
        notificationGroup: [],
      },
      billGroupSettingsRules: {
        balanceAlert: [
          ValidRoleFactory.getValidNumberRoleForText(this.$t('BillGroup.Settings.BalanceAlert')),
          ValidRoleFactory.getRequireRoleForText(this.$t('BillGroup.Settings.BalanceAlert')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('BillGroup.Settings.BalanceAlert'), 0, 99999999.99),
          ValidRoleFactory.getNumberDecimalRoleForText(this.$t('BillGroup.Settings.BalanceAlert'), 2),
        ],
      },
    }
  },
  methods: {
    submitForm() {
      return BillGroupService.settingBalanceAlert(this.billGroupSettingsForm)
    },
    successMessageFormatter() {
      return this.$t('BillGroup.Settings.Success')
    },
    initBillGroupSettings() {
      BillGroupService.getBillGroupSettings().then(res => {
        this.billGroupSettingsForm.balanceAlert = res.balance_threshold
        this.billGroupSettingsForm.notificationGroup = res.targets
      })
    },
    initNotifyGroup() {
      NotifuGroupService.getAllNotifyGroups().then(res => {
        this.AlertNotifyList = res.map(i => ({
          name: i.name,
          id: i.id,
        }))
      })
    },
    doSettings() {
      this.initNotifyGroup()
      this.initBillGroupSettings()
      this.title = this.$t('BillGroup.Settings.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
<style>
.bill-rate-input-item .ant-form-item-children .ant-select {
  width: 130px;
}
</style>
