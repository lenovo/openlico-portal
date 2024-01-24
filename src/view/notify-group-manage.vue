<template>
  <div class="height--100 p-10">
    <div class="table-style">
      <composite-table
        id="tid_notify-group-table"
        ref="notifyGroupTable"
        :row-key="row => row.name"
        :columns="columns"
        :table-data-fetcher="tableDataFetcher"
        :default-sort="{ prop: 'name', order: 'ascending' }"
        :search-enable="true"
        :search-props="['name']">
        <template #controller>
          <a-button id="tid_notify-group-create" type="primary" @click="onCreateClick">
            {{ $t('UserGroup.Action.Create') }}
          </a-button>
        </template>
        <template #action="{ row }">
          <a-dropdown placement="bottomLeft" :trigger="['click']">
            <a-button>
              {{ $t('Action') }}
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="onEditClick(row)">
                  {{ $t('Action.Edit') }}
                </a-menu-item>
                <a-menu-item @click="onDeleteClick(row)">
                  {{ $t('Action.Delete') }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </composite-table>
      <notify-group-dialog ref="notifyGroupDialog" />
    </div>
  </div>
</template>
<script>
import Format from '@/common/format'
import NotifyGroupService from '@/service/notify-group'
import CompositeTable from '@/component/composite-table.vue'
import NotifyGroupDialog from './notify-group-manage/notify-group-dialog.vue'

export default {
  components: {
    'composite-table': CompositeTable,
    'notify-group-dialog': NotifyGroupDialog,
  },
  data() {
    return {
      tableDataFetcher: NotifyGroupService.getNotifyGroupsTableDataFetcher(),
      columns: [
        {
          title: this.$t('NotifyGroup.Name'),
          dataIndex: 'name',
          defaultSortOrder: 'ascend',
        },
        {
          title: this.$t('NotifyGroup.Table.Emails'),
          dataIndex: 'emails',
          customRender: ({ text }) => Format.formatCount(text.length),
          align: 'center',
        },
        {
          title: this.$t('NotifyGroup.Table.Mobiles'),
          dataIndex: 'mobiles',
          customRender: ({ text }) => Format.formatCount(text.length),
          align: 'center',
        },
        {
          title: this.$t('Action'),
          key: 'action',
          customSlot: true,
          width: 200,
        },
      ],
    }
  },
  methods: {
    columnFormatter(row, column) {
      if (column.property === 'emails') {
        return Format.formatCount(row.emails.length)
      }
      if (column.property === 'mobiles') {
        return Format.formatCount(row.mobiles.length)
      }
    },
    onCreateClick() {
      this.$refs.notifyGroupDialog.doCreate().then(
        res => {
          // Reload table data
          this.$refs.notifyGroupTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onEditClick(notifyGroup) {
      this.$refs.notifyGroupDialog.doEdit(notifyGroup).then(
        res => {
          // Reload table data
          this.$refs.notifyGroupTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onDeleteClick(notifyGroup) {
      this.$refs.notifyGroupDialog.doDelete(notifyGroup).then(
        res => {
          // Reload table data
          this.$refs.notifyGroupTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
  },
}
</script>
<style></style>
