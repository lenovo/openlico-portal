<template>
  <div class="height--100 p-10 user-manage">
    <div class="table-style b-w">
      <composite-table
        id="tid_user-table"
        ref="userTable"
        :columns="columns"
        :row-key="row => row.id"
        :table-data-fetcher="tableDataFetcher"
        :search-enable="true"
        :search-props="['username', 'fullName']">
        <template #controller>
          <div>
            <a-button
              v-if="ldapManaged"
              id="user-create-btn"
              type="primary"
              class="action-button"
              @click="onCreateClick">
              {{ $t('Action.Create') }}
            </a-button>
            <a-button
              v-if="!ldapManaged"
              id="user-import-btn"
              type="primary"
              class="action-button"
              @click="onImportClick">
              {{ $t('Action.Import') }}
            </a-button>
            <a-button id="user-batch-import-btn" type="primary" class="action-button" @click="onBatchImportClick">
              {{ $t('Action.BatchImport') }}
            </a-button>
            <a-button
              id="user-export-btn"
              type="primary"
              class="action-button"
              :disabled="exportDisabled"
              :loading="exportDisabled"
              @click="onExportClick">
              {{ $t('Action.Export') }}
            </a-button>
          </div>
        </template>
        <template #username="{ row }">
          <user-data-tooltip :ref="`${row.username}Info`" :username="row.username">
            <a-button type="link"> {{ row.username }}</a-button>
          </user-data-tooltip>
        </template>
        <template #action="{ row }">
          <a-dropdown placement="bottomLeft" :trigger="['click']">
            <a-button>
              {{ $t('Action') }}
              <down-outlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="onInfoClick(row)">
                  {{ $t('Action.Info') }}
                </a-menu-item>
                <a-menu-item v-if="row.username == name || row.role != 300" @click="onEditClick(row)">
                  {{ $t('Action.Edit') }}
                </a-menu-item>
                <a-menu-item v-if="row.role != 300" @click="onChangePasswordClick(row)">
                  {{ $t('User.Action.ChangePassword') }}
                </a-menu-item>
                <a-menu-item v-if="row.username == name || row.role != 300" @click="onDeleteClick(row)">
                  {{ $t('Action.Delete') }}
                </a-menu-item>
                <a-menu-item v-if="row.role != 300 && !row.freezed" @click="onSuspend(row)">
                  {{ $t('User.Action.Suspend') }}
                </a-menu-item>
                <a-menu-item v-if="row.role != 300 && row.freezed" @click="onResume(row)">
                  {{ $t('User.Action.Resume') }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </composite-table>
    </div>
    <user-dialog id="tid_user-dialog" ref="userDialog" :is-scheduler="isScheduler" />
    <user-password-dialog id="tid_user-password-dialog" ref="userPasswordDialog" />
    <user-batch-import-dialog
      ref="userBatchImportDialog"
      @import-complete="importComplete"
      @show-import-result="showImportResult" />
    <user-batch-import-result-table ref="userBatchImportResultTable" />
  </div>
</template>
<script>
import Format from '@/common/format'
import AuthService from '@/service/auth'
import UserService from '@/service/user'
import AccessService from '@/service/access'
import UserBatchImportService from '@/service/user-batch-import'
import CompositeTable from '@/component/composite-table.vue'
import UserDialog from './user-manage/user-dialog.vue'
import UserBatchImportDialog from './user-manage/user-batch-import-dialog.vue'
import UserBatchImportResultTable from './user-manage/user-batch-import-result-table.vue'
import UserPasswordDialog from './user-manage/user-password-dialog.vue'
import Mixins from '@/mixins/set-keep-alive-pages'
import UserDataTooltip from '@/component/user-data-tooltip.vue'
import { use } from 'echarts/core'
const name = 'user-manage'
export default {
  name,
  components: {
    'composite-table': CompositeTable,
    'user-dialog': UserDialog,
    'user-password-dialog': UserPasswordDialog,
    'user-batch-import-dialog': UserBatchImportDialog,
    'user-batch-import-result-table': UserBatchImportResultTable,
    'user-data-tooltip': UserDataTooltip,
  },
  mixins: [Mixins(name)],
  data() {
    return {
      tableDataFetcher: UserService.getUsersTableDataFetcher(),
      name: this.$store.state.auth.username,
      arch: AccessService.getSchedulerArch(),
      ldapManaged: AuthService.isLDAPManaged(),
      columns: [
        {
          title: this.$t('User.Id'),
          dataIndex: 'id',
          defaultSortOrder: 'descend',
        },
        {
          title: this.$t('User.Username'),
          dataIndex: 'username',
          sorter: true,
          customSlot: true,
        },
        {
          title: this.$t('User.Fullname'),
          dataIndex: 'fullName',
          sorter: true,
          customRender: ({ text }) => text || '-',
        },
        {
          title: this.$t('User.Role'),
          dataIndex: 'role',
          sorter: true,
          customRender: ({ text }) => UserService.getUserRoleDisplayName(text),
        },
        {
          title: this.$t('User.LoginTime'),
          dataIndex: 'loginTime',
          sorter: true,
          customRender: ({ text }) => Format.formatDateTime(text),
        },
        {
          title: this.$t('User.ThawTime'),
          dataIndex: 'thawTime',
          customRender: ({ text, record }) => (record.freezed ? Format.formatDateTime(text) : '-'),
        },
        {
          title: this.$t('User.Freezed.Status'),
          dataIndex: 'freezed',
          customRender: ({ text }) => (text ? this.$t('User.Freezed.Suspended') : '-'),
        },
        {
          title: this.$t('Action'),
          key: 'action',
          customSlot: true,
        },
      ],
      exportDisabled: false,
    }
  },
  computed: {
    isScheduler() {
      return AccessService.getMatchFeatureCodes(['monitor.scheduler'], this.$store.state.auth.featureCodes).length > 0
    },
  },
  created() {
    if (this.arch === 'host' && this.isScheduler) {
      this.columns.splice(3, 0, {
        title: this.$t('User.Detail.BillGroup'),
        dataIndex: 'billGroup',
        customRender: ({ text }) => (text.name ? text.name : '-'),
      })
    }
  },
  methods: {
    onCreateClick() {
      this.$refs.userDialog
        .doCreate()
        .then(
          res => {
            // Reload table data
            this.$refs.userTable.fetchTableData(true)
          },
          res => {
            // Do nothing
          },
        )
        .catch(_ => {})
    },
    onEditClick(user) {
      this.$refs.userDialog
        .doEdit(user)
        .then(
          res => {
            // Reload table data
            this.$refs.userTable.fetchTableData(true)
            if (this.$refs[`${user.username}Info`]) {
              this.$refs[`${user.username}Info`].clearUserData()
            }
          },
          res => {
            // Do nothing
          },
        )
        .catch(_ => {})
    },
    onInfoClick(user) {
      this.$router.push({ path: `/main/user/${user.id}` })
    },
    onChangePasswordClick(user) {
      this.$refs.userPasswordDialog.doChangePassword(user).then(
        res => {
          // Reload table data
          this.$refs.userTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onDeleteClick(user) {
      this.$refs.userDialog
        .doDelete(user)
        .then(
          res => {
            // Reload table data
            this.$refs.userTable.fetchTableData(true)
          },
          res => {
            // Do nothing
          },
        )
        .catch(_ => {})
    },
    onImportClick() {
      this.$refs.userDialog
        .doImport()
        .then(
          res => {
            // Reload table data
            this.$refs.userTable.fetchTableData(true)
          },
          res => {
            // Do nothing
          },
        )
        .catch(_ => {})
    },
    onSuspend(row) {
      this.$refs.userDialog
        .doFreezed(row)
        .then(
          res => {
            // Reload table data
            this.$refs.userTable.fetchTableData(true)
          },
          res => {
            // Do nothing
          },
        )
        .catch(_ => {})
    },
    onResume(row) {
      this.$refs.userDialog
        .doUnfreezed(row)
        .then(
          res => {
            // Reload table data
            this.$refs.userTable.fetchTableData(true)
          },
          res => {
            // Do nothing
          },
        )
        .catch(_ => {})
    },
    onBatchImportClick() {
      UserBatchImportService.getUsersImportStatu()
        .then(
          res => {
            this.$refs.userBatchImportDialog.show(res)
          },
          err => {
            this.$message.error(err)
          },
        )
        .catch(_ => {})
    },
    importComplete() {
      this.$refs.userTable.fetchTableData(true)
    },
    showImportResult() {
      this.$refs.userBatchImportResultTable.show()
    },
    onExportClick() {
      this.exportDisabled = true
      UserBatchImportService.getUsersExport().finally(() => {
        this.exportDisabled = false
      })
    },
  },
}
</script>
<style>
.user-manage .action-button {
  margin-right: 10px;
}
</style>
