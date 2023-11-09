<template>
  <div class="height--100 p-10">
    <div class="height--100">
      <composite-table
        id="Run_time_Table"
        ref="runtimeTable"
        row-key="id"
        :table-loading="tableLoading"
        :columns="columns"
        :search-props="['name']"
        :table-data-fetcher="tableDataFetcher"
        :search-enable="true"
        @selection-change="onTableSelectionChange">
        <template #controller>
          <div class="composite-table-controller">
            <a-button id="Runtime_Create_Button" type="primary" @click="onCreate">
              {{ $t('Action.Create') }}
            </a-button>
          </div>
        </template>
        <template #name="{ name, row }">
          <div class="runtime-table-name" @click="onDetailClick(row)">
            <img :src="getSrc(row.tag.includes('sys:intel'))" class="rcicon" style="width: 15px; height: 15px" />
            {{ name }}
          </div>
        </template>
        <template #action="{ row }">
          <a-dropdown placement="bottomLeft" :trigger="['click']">
            <a-button>
              {{ $t('Action') }}
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item v-if="canAction(row)" @click="onEdit(row)">
                  {{ $t('Action.Edit') }}
                </a-menu-item>
                <a-menu-item @click="onDuplicate(row)">
                  {{ $t('Action.Duplicate') }}
                </a-menu-item>
                <a-menu-item v-if="canAction(row)" :disabled="row.items.length <= 0" @click="onVerify(row)">
                  {{ $t('Action.Verify') }}
                </a-menu-item>
                <a-menu-item v-if="canAction(row)" @click="onDelete(row)">
                  {{ $t('Action.Delete') }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </composite-table>
      <runtime-dialog ref="runtimeDialog" />
      <runtime-view-dialog ref="runtimeViewDialog" />
    </div>
  </div>
</template>
<script>
import RuntimeService from '@/service/runtime-manage'
import CompositeTable from '@/component/composite-table.vue'
import RuntimeDialog from './runtime-manage/runtime-action-dialog.vue'
import RuntimeViewDialog from './runtime-manage/runtime-view-dialog.vue'

export default {
  components: {
    'composite-table': CompositeTable,
    'runtime-dialog': RuntimeDialog,
    'runtime-view-dialog': RuntimeViewDialog,
  },
  data() {
    return {
      tableDataFetcher: RuntimeService.getRuntimesTableDataFetcher(),
      tableLoading: false,
      columns: [
        {
          title: this.$t('Admin.Runtime.Name'),
          dataIndex: 'name',
          sorter: true,
          align: 'left',
          defaultSortOrder: 'descend',
          customSlot: true,
        },
        {
          title: this.$t('Admin.Runtime.Items'),
          dataIndex: 'items',
          sorter: true,
          align: 'left',
          customRender: ({ text }) => this.displayProperties(text, 'module'),
        },
        {
          title: this.$t('Admin.Runtime.Type'),
          dataIndex: 'type',
          sorter: true,
          customRender: ({ text }) => this.$t(`Admin.Runtime.Type.${text}`),
        },
        {
          title: this.$t('Admin.Runtime.Env'),
          dataIndex: 'envs',
          sorter: true,
          customRender: ({ text }) => this.displayProperties(text, 'name'),
        },
        {
          title: this.$t('Admin.Runtime.CreateTime'),
          dataIndex: 'createTime',
          sorter: true,
        },
        {
          title: this.$t('Action'),
          key: 'action',
          customSlot: true,
        },
      ],
      show: false,
      path: '',
      access: this.$store.state.auth.access,
    }
  },
  methods: {
    onTableSelectionChange(selection) {
      const _this = this
      _this.terminalData.length = 0
      _this.selectedNodeId = []
      selection.forEach((node, index) => {
        _this.selectedNodeId.push(node.id)
        _this.terminalData.push({
          hostname: node.hostname,
          number: index,
        })
      })
      if (_this.selectedNodeId.length > 0) {
        _this.hasNoSelectedNode = false
      } else {
        _this.hasNoSelectedNode = true
      }
    },
    onDetailClick(data) {
      this.$refs.runtimeViewDialog.viewDetail(data.id)
    },
    displayProperties(data, propertyName) {
      let result = []
      data.forEach(item => {
        result.push(item[propertyName])
      })
      if (result.length > 2) {
        result = result.slice(0, 2).join(',') + '...'
      } else if (result.length > 0 && result.length <= 2) {
        result = result.join(',')
      } else {
        result = '-'
      }
      return result
    },
    onCreate() {
      this.$refs.runtimeDialog.doCreate().then(
        res => {
          // Reload table data
          this.$refs.runtimeTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onEdit(data) {
      this.$refs.runtimeDialog.doEdit(data).then(
        res => {
          this.$refs.runtimeTable.fetchTableData(true)
        },
        res => {},
      )
    },
    onDuplicate(data) {
      this.$refs.runtimeDialog.doDuplicate(data).then(
        res => {
          this.$refs.runtimeTable.fetchTableData(true)
        },
        res => {},
      )
    },
    wrapMsg(data) {
      let result = ''
      if (data) {
        result = data.replace(/\n/g, '<br/>')
      }
      return result
    },
    onVerify(data) {
      this.tableLoading = true
      RuntimeService.verifyRuntime(data.id, this.access).then(
        res => {
          this.tableLoading = false
          this.$success({
            title: this.$T('Admin.Runtime.Verify.Success.title', {
              name: data.name,
            }),
          })
        },
        res => {
          this.tableLoading = false
          this.$error({
            title: this.$T('Admin.Runtime.Verify.Fail.title', {
              name: data.name,
            }),
            content: res.body.output,
          })
        },
      )
    },
    onDelete(data) {
      this.$refs.runtimeDialog.doDelete(data).then(
        res => {
          this.$refs.runtimeTable.fetchTableData(true)
        },
        res => {},
      )
    },
    onActionCommand(command) {
      const fn = command.fn
      const argument = command.argument
      fn(argument)
    },
    getSrc(showCondition) {
      return RuntimeService.imgSet(showCondition)
    },
    canAction(data) {
      if (this.access === 'staff') {
        return data.type === 'Private'
      } else {
        return data.type === 'System'
      }
    },
  },
}
</script>
<style scoped>
.runtime-table-name {
  cursor: pointer;
}
.includes:hover {
  cursor: auto;
}
.description {
  width: 200px;
  word-wrap: break-word;
}
.nova:hover {
  text-overflow: inherit;
  overflow: visible;
  white-space: pre-line;
}
.module_verify_success_600 {
  width: 600px;
}
.module_verify_warning_600 {
  width: 600px;
}
.module_verify_success_600 .el-message-box__title {
  color: green;
}
.module_verify_warning_600 .el-message-box__title {
  color: #e6a23c;
}
.module_verify_warning_600 .el-message-box__title::before {
  content: '\e7a3';
  font-family: 'element-icons' !important;
  margin-right: 5px;
}
</style>
