<template>
  <a-modal v-model="dialogFormVisible" :title="$t('User.Import.Detail.Title')" width="70%">
    <div>
      <ul class="import-table-title clearfix">
        <li>
          <span>{{ $t('User.Import.Title.FinishTime') }}: </span>
          <span>{{ finishTime }}</span>
        </li>
        <li>
          <span>{{ $t('User.Import.Title.Success') }}: </span>
          <span>{{ success }} users</span>
        </li>
        <li>
          <span>{{ $t('User.Import.Title.Fail') }}: </span>
          <span>{{ failUsers }} users</span>
        </li>
        <li>
          <a-checkbox v-model="showFailed" class="detailbox" @change="shouFailedUsers">
            {{ $t('User.Import.Title.OnlyShowFailedUsers') }}
          </a-checkbox>
        </li>
      </ul>
    </div>
    <div>
      <composite-table
        ref="importDetailViewTable"
        :columns="columns"
        :row-key="row => row.row"
        :table-data-fetcher="tableDataFetcher"
        :current-page="1"
        :external-filter="dataFilter"
        :page-sizes="['10', '20', '40', '50']"
        :page-size="20"
        :total="0" />
    </div>
    <template slot="footer">
      <a-button @click="dialogFormVisible = false">
        {{ $t('Action.Close') }}
      </a-button>
    </template>
  </a-modal>
</template>

<script>
import CompositeTable from '../../component/composite-table'
import UserBatchImportService from '../../service/user-batch-import'
import AccessService from '../../service/access'
import UserService from '../../service/user'

export default {
  components: {
    'composite-table': CompositeTable,
  },
  data() {
    let columns = []
    const columnsArr = [
      {
        align: 'center',
        title: this.$t('User.Import.Table.Title.Row'),
        sorter: true,
        dataIndex: 'row',
      },
      {
        align: 'center',
        title: this.$t('User.Import.Table.Title.Username'),
        dataIndex: 'username',
        sorter: true,
        defaultSortOrder: 'descend',
      },
      {
        align: 'center',
        title: this.$t('User.Import.Table.Title.Role'),
        dataIndex: 'role',
        customRender: val => UserService.getUserRoleDisplayName(val),
      },
      {
        align: 'center',
        title: this.$t('User.Import.Table.Title.LastName'),
        dataIndex: 'lastName',
      },
      {
        align: 'center',
        title: this.$t('User.Import.Table.Title.FirstName'),
        dataIndex: 'firstName',
      },
      {
        align: 'center',
        title: this.$t('User.Import.Table.Title.Email'),
        dataIndex: 'email',
      },
      {
        align: 'center',
        title: this.$t('User.Import.Table.Title.Result'),
        dataIndex: 'status',
        customRender: (val, row) => {
          if (val === true) return this.$t('Status.Success')
          if (val === false) return row.errorMessage
          return this.$t('Status.CanCeled')
        },
      },
    ]
    columns = columnsArr
    if (AccessService.getSchedulerArch() !== 'host') {
      columns = columnsArr.filter(el => {
        return el.dataIndex !== 'billGroup'
      })
    }
    return {
      tableDataFetcher: UserBatchImportService.getUsersTableDataFetcher(),
      dialogFormVisible: false,
      showFailed: false,
      dataFilter: {},
      success: 0,
      finishTime: '',
      failUsers: 0,
      columns,
    }
  },
  watch: {
    dialogFormVisible: function () {
      if (this.dialogFormVisible) {
        this.$nextTick(() => {
          this.showFailed = false
          this.$refs.importDetailViewTable.fetchTableData(true)
        })
        UserBatchImportService.getUsersImportStatu().then(
          res => {
            if (res.last_importing) {
              this.finishTime = res.last_importing.finish_time
              this.success = res.last_importing.success
              this.failUsers = res.last_importing.finished - res.last_importing.success
            }
          },
          err => {
            this.$message.error(err)
          },
        )
      }
    },
  },
  methods: {
    show() {
      this.dialogFormVisible = true
    },
    shouFailedUsers() {
      if (this.showFailed) {
        this.dataFilter = {
          ret: {
            values: [false],
            type: 'in',
          },
        }
      } else {
        this.dataFilter = {}
      }
    },
  },
}
</script>

<style>
.import-table-title {
  padding: 0 20px;
}
.import-table-title li {
  float: left;
}
.import-table-title li:last-child {
  float: right;
}
.import-table-title li:nth-child(2) {
  margin: 0 40px;
}
.clearfix:after {
  content: '020';
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
}
.clearfix {
  zoom: 1;
}
</style>