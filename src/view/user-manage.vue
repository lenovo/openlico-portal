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
        :search-props="['username']">
        <div slot="controller">
          <a-button v-if="ldapManaged" id="user-create-btn" type="primary" class="action-button" @click="onCreateClick">
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
        <template slot="username" slot-scope="{ row }">
          <a-popover trigger="hover" @visibleChange="getUserInfo($event, row.id)">
            <div slot="content">
              <a-spin :spinning="tips.loading">
                <div v-if="tips.data[row.id]" class="user-manager-tips">
                  <div class="user-manager-tips-item">
                    <div class="user-manager-tips-item-label">
                      {{ $t('Menu.Admin') }}
                    </div>
                    <div class="user-manager-tips-item-value">
                      {{ `${row.username}(${tips.data[row.id].uid})` }}
                    </div>
                  </div>
                  <div class="user-manager-tips-item m-t-10">
                    <div class="user-manager-tips-item-label">
                      {{ $t('Menu.UserGroupManage') }}
                    </div>
                    <div class="user-manager-tips-item-value">
                      {{ `${tips.data[row.id].userGroup.name}(${tips.data[row.id].userGroup.gid})` }}
                    </div>
                  </div>
                </div>
              </a-spin>
            </div>
            <a-button type="link">
              {{ row.username }}
            </a-button>
          </a-popover>
        </template>
        <a-dropdown slot="action" slot-scope="{ row }" placement="bottomLeft" :trigger="['click']">
          <a-button>
            {{ $t('Action') }}
            <a-icon type="down" />
          </a-button>
          <a-menu slot="overlay">
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
              {{ $t('Action.Suspend') }}
            </a-menu-item>
            <a-menu-item v-if="row.role != 300 && row.freezed" @click="onResume(row)">
              {{ $t('Action.Resume') }}
            </a-menu-item>
          </a-menu>
        </a-dropdown>
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
import Format from '../common/format'
import AuthService from '../service/auth'
import UserService from '../service/user'
import AccessService from './../service/access'
import UserBatchImportService from './../service/user-batch-import'
import CompositeTable from '../component/composite-table'
import UserDialog from './user-manage/user-dialog'
import UserBatchImportDialog from './user-manage/user-batch-import-dialog'
import UserBatchImportResultTable from './user-manage/user-batch-import-result-table'
import UserPasswordDialog from './user-manage/user-password-dialog'
import Mixins from '../mixins/set-keep-alive-pages'
const name = 'user-manage'
export default {
  name,
  components: {
    'composite-table': CompositeTable,
    'user-dialog': UserDialog,
    'user-password-dialog': UserPasswordDialog,
    'user-batch-import-dialog': UserBatchImportDialog,
    'user-batch-import-result-table': UserBatchImportResultTable,
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
          scopedSlots: { customRender: 'username' },
        },
        {
          title: this.$t('User.Role'),
          dataIndex: 'role',
          sorter: true,
          customRender: val => UserService.getUserRoleDisplayName(val),
        },
        {
          title: this.$t('User.LoginTime'),
          dataIndex: 'loginTime',
          sorter: true,
          customRender: val => Format.formatDateTime(val),
        },
        {
          title: this.$t('User.ThawTime'),
          dataIndex: 'thawTime',
          customRender: (val, row) => (row.freezed ? Format.formatDateTime(val) : '-'),
        },
        {
          title: this.$t('User.Freezed.Status'),
          dataIndex: 'freezed',
          customRender: val => (val ? this.$t('User.Freezed.Suspended') : '-'),
        },
        {
          title: this.$t('Action'),
          key: 'action',
          scopedSlots: { customRender: 'action' },
        },
      ],
      exportDisabled: false,
      tips: {
        requestId: null,
        loading: false,
        visible: false,
        data: {},
      },
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
        customRender: val => (val.name ? val.name : '-'),
      })
    }
  },
  methods: {
    onCreateClick() {
      this.$refs.userDialog.doCreate().then(
        res => {
          // Reload table data
          this.$refs.userTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onEditClick(user) {
      this.$refs.userDialog.doEdit(user).then(
        res => {
          // Reload table data
          this.$refs.userTable.fetchTableData(true)
          if (this.tips.data[user.id]) {
            delete this.tips.data[user.id]
          }
        },
        res => {
          // Do nothing
        },
      )
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
      this.$refs.userDialog.doDelete(user).then(
        res => {
          // Reload table data
          this.$refs.userTable.fetchTableData(true)
          if (this.tips.data[user.id]) {
            delete this.tips.data[user.id]
          }
        },
        res => {
          // Do nothing
        },
      )
    },
    onImportClick() {
      this.$refs.userDialog.doImport().then(
        res => {
          // Reload table data
          this.$refs.userTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onSuspend(row) {
      this.$refs.userDialog.doFreezed(row).then(
        res => {
          // Reload table data
          this.$refs.userTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onResume(row) {
      this.$refs.userDialog.doUnfreezed(row).then(
        res => {
          // Reload table data
          this.$refs.userTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onBatchImportClick() {
      UserBatchImportService.getUsersImportStatu().then(
        res => {
          this.$refs.userBatchImportDialog.show(res)
        },
        err => {
          this.$message.error(err)
        },
      )
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
    getUserInfo(val, id) {
      if (val) {
        clearTimeout(this.tips.requestId)
        this.tips.loading = true
        if (!Object.prototype.hasOwnProperty.call(this.tips.data, id)) {
          this.tips.requestId = setTimeout(() => {
            this.tips = { ...this.tips, visible: true }
            UserService.getUserById(id)
              .then(
                res => {
                  this.tips.data[id] = res
                },
                err => {
                  this.$message.error(err)
                },
              )
              .finally(() => {
                this.tips.loading = false
              })
          }, 500)
        } else {
          this.tips.loading = false
        }
      }
    },
  },
}
</script>
<style>
.user-manage .action-button {
  margin-right: 10px;
}
.user-manager-tips-item {
  display: flex;
}
.user-manager-tips-item-label {
  margin-right: 20px;
  min-width: 50px;
  color: #999;
}
.user-manager-tips-item-value {
  font-weight: 400;
  color: #333;
}
</style>
