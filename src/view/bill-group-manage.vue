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
        <div slot="controller">
          <a-button id="tid_billgroup-create" type="primary" @click="onCreateClick">
            {{ $t('BillGroup.Action.Create') }}
          </a-button>
        </div>
        <a-button slot="name" slot-scope="{ row }" type="link" @click="onDetailClick(row.id)">
          {{ row.name }}
        </a-button>
        <a-dropdown slot="action" slot-scope="{ row }" :trigger="['click']" placement="bottomLeft">
          <a-button>
            {{ $t('Action') }}
            <a-icon type="down" />
          </a-button>
          <a-menu slot="overlay">
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
        </a-dropdown>
      </composite-table>
      <bill-group-dialog id="tid_billgroup-dialog" ref="billGroupDialog" />
      <account-operate-dialog id="tid_billgroup-operate-dialog" ref="accountOperateDialog" />
      <account-statement id="tid_billgroup-account-statement" ref="accountStatement" />
    </div>
  </div>
</template>
<script>
import CompositeTable from '../component/composite-table'
import BillGroupService from '../service/bill-group'
import Format from '../common/format'
import BillGroupDialog from './bill-group-manage/bill-group-dialog'
import AccountOperateDialog from './bill-group-manage/account-operate-dialog'
import Mixins from '../mixins/set-keep-alive-pages'
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
        scopedSlots: { customRender: 'name' },
      },
      {
        align: 'right',
        width: 180,
        sorter: true,
        title: this.$t('BillGroup.AccountBalance'),
        dataIndex: 'accountBalance',
        customRender: val => Format.formatMoney(val),
      },
      {
        align: 'center',
        sorter: true,
        title: this.$t('BillGroup.LastUpdateTime'),
        dataIndex: 'updateTime',
        customRender: val => Format.formatDateTime(val),
      },
      {
        width: 120,
        title: this.$t('Action'),
        key: 'action',
        scopedSlots: { customRender: 'action' },
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
