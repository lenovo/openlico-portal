<template>
  <div class="height--100 p-10">
    <div class="table-style">
      <composite-table
        id="tid_user-group-table"
        ref="userGroupTable"
        row-key="id"
        :columns="columns"
        :table-data-fetcher="tableDataFetcher"
        :default-sort="{ prop: 'id', order: 'ascending' }"
        :search-enable="true"
        :search-props="['name']">
        <template #controller>
          <a-button v-show="isLDAPManaged" id="tid_user-group-create" type="primary" @click="onCreateClick">
            {{ $t('UserGroup.Create') }}
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
                <a-menu-item @click="onDeleteClick(row)">
                  {{ $t('Action.Delete') }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </composite-table>
      <user-group-dialog id="tid_user-group-dialog" ref="userGroupDialog" />
    </div>
  </div>
</template>
<script>
import CompositeTable from '@/component/composite-table.vue'
import UserGroupService from '@/service/user-group'
import UserGroupDialog from './user-group-manage/user-group-dialog.vue'
import AuthService from '@/service/auth'

export default {
  components: {
    'composite-table': CompositeTable,
    'user-group-dialog': UserGroupDialog,
  },
  data() {
    return {
      tableDataFetcher: UserGroupService.getUserGroupsTableDataFetcher(),
      isLDAPManaged: AuthService.isLDAPManaged(),
      columns: [
        {
          title: this.$t('UserGroup.Gid'),
          dataIndex: 'id',
          sorter: true,
          defaultSortOrder: 'ascend',
        },
        {
          title: this.$t('UserGroup.Name'),
          dataIndex: 'name',
          sorter: true,
        },
      ],
    }
  },
  mounted() {
    if (this.isLDAPManaged) {
      this.columns.push({
        title: this.$t('Action'),
        key: 'action',
        width: 200,
        customSlot: true,
      })
    }
  },
  methods: {
    onCreateClick() {
      this.$refs.userGroupDialog.doCreate().then(
        res => {
          // Reload table data
          this.$refs.userGroupTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onEditClick(userGroup) {
      this.$refs.userGroupDialog.doEdit(userGroup).then(
        res => {
          // Reload table data
          this.$refs.userGroupTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onDeleteClick(userGroup) {
      this.$refs.userGroupDialog.doDelete(userGroup).then(
        res => {
          // Reload table data
          this.$refs.userGroupTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
  },
}
</script>
<style>
.user-group-controller {
  max-width: 100%;
  text-align: left;
}
</style>
