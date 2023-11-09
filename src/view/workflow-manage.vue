<template>
  <div class="height--100 p-10">
    <div class="b-w workflow-manage">
      <composite-table
        id="tid_workflow-manage-table"
        ref="workflowManageTable"
        :columns="columns"
        :row-key="row => row.id"
        :table-data-fetcher="tableDataFetcher"
        :search-enable="true"
        :search-props="['id', 'name', 'description', 'createTime']"
        :current-page="1"
        :page-sizes="['10', '20', '40', '50']"
        :page-size="20"
        :total="0"
        :auto-refresh="15 * 1000">
        <template #controller>
          <a-button type="primary" @click="onCreateClick">
            {{ $t('Action.Create') }}
          </a-button>
        </template>
        <template #name="{ row }">
          <a-button :title="row.name" type="link" @click="onDetailClick(row.id)">
            {{ row.name }}
          </a-button>
        </template>
        <template #status="{ row }">
          <workflow-status-label :status="row.status" />
        </template>
        <template #periodic_task="{ row }">
          <a-tooltip>
            <template v-if="row.periodic_task" #title>
              {{ row.getRecurrencePattern() }}
            </template>
            <span class="ellipsis-container" v-text="row.periodic_task ? row.getRecurrencePattern() : '-'" />
          </a-tooltip>
        </template>

        <template #action="{ row }">
          <a-dropdown :trigger="['click']" placement="bottomLeft">
            <a-button>
              {{ $t('Action') }}
              <down-outlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item v-if="row.status == 'created'" key="run" @click="onRunClick(row)">
                  {{ $t('Action.Run') }}
                </a-menu-item>
                <a-menu-item
                  v-if="row.status == 'completed' || row.status == 'cancelled' || row.status == 'failed'"
                  key="Rerun"
                  @click="onRerunClick(row)">
                  {{ $t('Action.Rerun') }}
                </a-menu-item>
                <a-menu-item
                  v-if="row.status != 'running' && row.status != 'cancelling' && row.status != 'starting'"
                  key="edit"
                  @click="onEditClick(row)">
                  {{ $t('Action.Edit') }}
                </a-menu-item>
                <a-menu-item key="copy" @click="onCopyClick(row)">
                  {{ $t('Action.Copy') }}
                </a-menu-item>
                <a-menu-item
                  v-if="row.status == 'running' || row.status == 'starting'"
                  key="cancel"
                  @click="onCancelClick(row)">
                  {{ $t('Action.Cancel') }}
                </a-menu-item>
                <a-menu-item
                  v-if="row.status != 'running' && row.status != 'cancelling' && row.status != 'starting'"
                  key="delete"
                  @click="onDeleteClick(row)">
                  {{ $t('Action.Delete') }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </composite-table>
      <workflow-create-dialog ref="workflowCreateDialog" />
    </div>
  </div>
</template>

<script>
import Format from '@/common/format'
import WorkflowService from '@/service/workflow'
import CompositeTable from '@/component/composite-table.vue'
import WorkflowCreateDialog from './workflow-manage/workflow-create-dialog.vue'
import WorkflowStatusLabel from './workflow-manage/workflow-status-label.vue'
export default {
  components: {
    'composite-table': CompositeTable,
    'workflow-create-dialog': WorkflowCreateDialog,
    'workflow-status-label': WorkflowStatusLabel,
  },
  data() {
    return {
      tableDataFetcher: WorkflowService.getWrokflowTableDataFetcher(),
      columns: [
        {
          title: this.$t('ID'),
          dataIndex: 'id',
          sorter: true,
        },
        {
          title: this.$t('Workflow.Name'),
          dataIndex: 'name',
          width: 260,
          ellipsis: true,
          customSlot: true,
        },
        {
          title: this.$t('Workflow.Status'),
          dataIndex: 'status',
          sorter: true,
          align: 'left',
          customSlot: true,
        },
        {
          title: this.$t('Workflow.CreateTime'),
          dataIndex: 'createTime',
          sorter: true,
          defaultSortOrder: 'descend',
          customRender: ({ text }) => Format.formatDateTime(new Date(text * 1000)),
        },
        {
          title: this.$t('Workflow.Recurrence.Pattern'),
          dataIndex: 'periodic_task',
          customSlot: true,
        },
        {
          title: this.$t('Workflow.Description'),
          dataIndex: 'description',
          ellipsis: true,
        },
        {
          title: this.$t('Action'),
          key: 'action',
          customSlot: true,
        },
      ],
    }
  },
  methods: {
    onCreateClick() {
      this.$refs.workflowCreateDialog.doCreate().then(
        res => {
          this.$router.push(`/main/workflow-editor/${res.id}`)
        },
        _ => {
          //
        },
      )
    },
    onEditClick(row) {
      this.$router.push(`/main/workflow-editor/${row.id}`)
    },
    onCopyClick(row) {
      this.$refs.workflowCreateDialog.doCopy(row).then(
        res => {
          this.$refs.workflowManageTable.fetchTableData(true)
        },
        _ => {
          //
        },
      )
    },
    onRunClick(row) {
      WorkflowService.operateWorkflow(row.id, 'run').then(
        res => {
          this.$message.success(this.$t('Workflow.Operate.Success'))
          this.$refs.workflowManageTable.fetchTableData()
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    onRerunClick(row) {
      WorkflowService.operateWorkflow(row.id, 'rerun').then(
        res => {
          this.$message.success(this.$t('Workflow.Operate.Success'))
          this.$refs.workflowManageTable.fetchTableData()
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    onCancelClick(row) {
      this.$confirm({
        title: this.$t('Workflow.Cancel.Title'),
        content: this.$T('Workflow.Cancel.Tips', { name: row.name }),
        okText: this.$t('Action.Confirm'),
        cancelText: this.$t('Action.Cancel'),
        onOk: () => {
          WorkflowService.operateWorkflow(row.id, 'cancel').then(
            res => {
              this.$message.success(this.$t('Workflow.Operate.Success'))
              this.$refs.workflowManageTable.fetchTableData()
            },
            err => {
              this.$message.error(err)
            },
          )
        },
      })
    },
    onDeleteClick(row) {
      this.$confirm({
        title: this.$t('Workflow.Delete.Title'),
        content: this.$T('Workflow.Delete.Tips', { name: row.name }),
        okText: this.$t('Action.Confirm'),
        cancelText: this.$t('Action.Cancel'),
        onOk: () => {
          WorkflowService.deleteWorkflow(row.id).then(
            res => {
              this.$refs.workflowManageTable.fetchTableData(true)
              this.$message.success(
                this.$T('Workflow.Delete.Success', {
                  name: row.name,
                }),
              )
            },
            err => {
              this.$message.error(err)
            },
          )
        },
      })
    },
    onDetailClick(id) {
      this.$router.push(`/main/workflow-detail/${id}`)
    },
  },
}
</script>
<style>
.ellipsis-container {
  max-width: 100%;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
</style>
