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
          <a-button id="tid_billgroup-create" type="primary" @click="onCreateClick">
            {{ $t('BillGroup.Action.Create') }}
          </a-button>
        </template>
        <template #name="{ row }">
          <a-button type="link" @click="onDetailClick(row.id)">
            {{ row.name }}
          </a-button>
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
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </composite-table>
      <bill-group-dialog id="tid_billgroup-dialog" ref="billGroupDialog" />
      <account-operate-dialog id="tid_billgroup-operate-dialog" ref="accountOperateDialog" />
      <account-statement id="tid_billgroup-account-statement" ref="accountStatement" />
    </div>
  </div>
</template>
<script>
import CompositeTable from '@/component/composite-table.vue'
import BillGroupService from '@/service/bill-group'
import Format from '@/common/format'
import BillGroupDialog from './bill-group-manage/bill-group-dialog.vue'
import AccountOperateDialog from './bill-group-manage/account-operate-dialog.vue'
import Mixins from '@/mixins/set-keep-alive-pages'
import AccountStatement from './bill-group-manage/account-statement.vue'
const name = 'bill-group-manage'

export default {
  name,
  components: {
    'composite-table': CompositeTable,
    'bill-group-dialog': BillGroupDialog,
    'account-operate-dialog': AccountOperateDialog,
    AccountStatement,
  },
  mixins: [Mixins(name, 'billGroupTable')],
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
<style></style>
