<template>
  <div class="height--100 p-10">
    <div class="table-style">
      <composite-table
        id="tid_billgroup-table"
        ref="billGroupTable"
        :columns="columns"
        :row-key="row => row.id"
        :table-data-fetcher="tableDataFetcher"
        :search-enable="true"
        :search-props="['name']"
        :current-page="1"
        :page-sizes="['10', '20', '40', '50']"
        :page-size="20"
        :total="0"
        :auto-refresh="freshInterval">
        <template #controller>
          <a-button id="tid_billgroup-create" type="primary" style="margin-right: 10px" @click="onCreateClick">
            {{ $t('BillGroup.Action.Create') }}
          </a-button>
          <a-button id="tid_billgroup-settings" type="primary" @click="onSettingsClick">
            {{ $t('BillGroup.Action.Settings') }}
          </a-button>
        </template>
        <template #name="{ row }">
          <a-button type="link" @click="onDetailClick(row.id)">
            {{ row.name }}
          </a-button>
        </template>
        <template #balanceAlert="{ balanceAlert }">
          <span>
            <span :class="['status', balanceAlert ? 'on' : 'off']" />
            <span>&nbsp;{{ $t(`Status.${balanceAlert ? 'ON' : 'OFF'}`) }}</span>
          </span>
        </template>
        <template #action="{ row }">
          <a-dropdown placement="bottomLeft" :trigger="['click']">
            <a-button>
              {{ $t('Action') }}
              <down-outlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item :disabled="row.accountStatus == 'operating'" @click="onCopyClick(row)">
                  {{ $t('Action.Copy') }}
                </a-menu-item>
                <a-menu-item :disabled="row.accountStatus == 'operating'" @click="onAccountOperateClick(row)">
                  {{ $t('Action.Accounting') }}
                </a-menu-item>
                <a-menu-item :disabled="row.accountStatus == 'operating'" @click="onAccountStatementClick(row)">
                  {{ $t('Action.Accounting.Statement') }}
                </a-menu-item>
                <a-menu-item :disabled="row.accountStatus == 'operating'" @click="onDeleteClick(row)">
                  {{ $t('Action.Delete') }}
                </a-menu-item>
                <a-menu-item :disabled="row.accountStatus == 'operating'" @click="onAlertSwitchClick(row)">
                  {{ $t(`Action.Alert${row.balanceAlert ? 'Off' : 'On'}`) }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </composite-table>
      <bill-group-dialog id="tid_billgroup-dialog" ref="billGroupDialog" />
      <bill-group-settings-dialog id="tid_billgroup-settings-dialog" ref="billGroupSettingsDialog" />
      <account-operate-dialog id="tid_billgroup-operate-dialog" ref="accountOperateDialog" />
      <account-statement id="tid_billgroup-account-statement" ref="accountStatement" />
    </div>
  </div>
</template>
<script>
import Format from '@/common/format'
import { useKeepAlive, clearKeepAliveByRoute } from '@/keep-alive/set-keep-alive'
import CompositeTable from '@/component/composite-table.vue'
import BillGroupService from '@/service/bill-group'
import BillGroupDialog from './bill-group-manage/bill-group-dialog.vue'
import BillGroupSettingsDialog from './bill-group-manage/bill-group-settings-dialog.vue'
import AccountOperateDialog from './bill-group-manage/account-operate-dialog.vue'
import AccountStatement from './bill-group-manage/account-statement.vue'
const name = 'bill-group-manage'

export default {
  name,

  components: {
    'composite-table': CompositeTable,
    'bill-group-dialog': BillGroupDialog,
    'bill-group-settings-dialog': BillGroupSettingsDialog,
    'account-operate-dialog': AccountOperateDialog,
    AccountStatement,
  },
  beforeRouteEnter(to, from, next) {
    clearKeepAliveByRoute(to, from, to.name).then(res => {
      next()
    })
  },
  setup() {
    useKeepAlive()
  },
  data() {
    const columns = [
      {
        align: 'center',
        title: this.$t('BillGroup.Name'),
        dataIndex: 'name',
        sorter: true,
        defaultSortOrder: 'ascend',
        customSlot: true,
      },
      {
        align: 'right',
        width: 180,
        sorter: true,
        title: this.$t('BillGroup.AccountBalance'),
        dataIndex: 'accountBalance',
        customRender: ({ text }) => Format.formatMoney(text),
      },
      {
        align: 'center',
        sorter: true,
        title: this.$t('BillGroup.LastUpdateTime'),
        dataIndex: 'updateTime',
        customRender: ({ text }) => Format.formatDateTime(text),
      },
      {
        align: 'left',
        title: this.$t('BillGroup.BalanceAlert'),
        dataIndex: 'balanceAlert',
        customSlot: true,
        // customRender: ({ text }) => this.$t(`Status.${text ? 'ON' : 'OFF'}`),
      },
      {
        width: 220,
        title: this.$t('Action'),
        key: 'action',
        customSlot: true,
      },
    ]
    return {
      tableDataFetcher: BillGroupService.getBillGroupsTableDataFetcher(),
      columns,
      freshInterval: 30 * 1000,
    }
  },
  methods: {
    onDetailClick(id) {
      this.$router.push({ path: '/main/bill-group/' + id })
    },
    onCreateClick() {
      this.$refs.billGroupDialog.doCreate().then(
        res => {
          // Reload table data
          this.$refs.billGroupTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onSettingsClick() {
      this.$refs.billGroupSettingsDialog.doSettings().then(
        res => {
          // Reload table data
          this.$refs.billGroupTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onCopyClick(billGroup) {
      this.$refs.billGroupDialog.doCopy(billGroup).then(
        res => {
          // Reload table data
          this.$refs.billGroupTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onDeleteClick(billGroup) {
      this.$refs.billGroupDialog.doDelete(billGroup).then(
        res => {
          // Reload table data
          this.$refs.billGroupTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onAlertSwitchClick(billGroup) {
      BillGroupService.switchBalanceAlert(billGroup.id, !billGroup.balanceAlert).then(
        res => {
          this.$message.success(
            this.$T(`BillGroup.BalanceAlert.${billGroup.balanceAlert ? 'Off' : 'On'}.Success`, {
              name: billGroup.name,
            }),
          )
          // Reload table data
          this.$refs.billGroupTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onAccountOperateClick(billGroup) {
      this.$refs.accountOperateDialog.doOperate(billGroup).then(
        res => {
          // Reload table data
          this.$refs.billGroupTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onAccountStatementClick(billGroup) {
      this.$refs.accountStatement.showModel(billGroup)
    },
  },
}
</script>
<style scoped>
.status {
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  display: inline-block;
  width: 16px;
  height: 16px;
  vertical-align: middle;
  margin-top: -3px;
}
.on {
  background-color: #45cb84;
}
.off {
  background-color: #999999;
}
</style>
