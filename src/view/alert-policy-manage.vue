<template>
  <div class="height--100 p-10">
    <div class="table-style">
      <composite-table
        id="tid_alert-policy-table"
        ref="alertPolicyTable"
        row-key="id"
        :columns="columns"
        :table-data-fetcher="tableDataFetcher"
        :search-enable="true"
        :search-props="['id', 'name']">
        <template #controller>
          <ul class="composite-table-controller">
            <a-button id="tid_alert-policy-create" type="primary" @click="onCreateClick">
              {{ $t('Action.Create') }}
            </a-button>
          </ul>
        </template>
        <template #level="{ level }">
          <alert-table-level :level="level" />
        </template>
        <template #status="{ status }">
          <span>
            <span :class="['status', status ? 'on' : 'off']" />
            <span>&nbsp;{{ $t(`Status.${status ? 'ON' : 'OFF'}`) }}</span>
          </span>
        </template>

        <template #action="{ row }">
          <a-dropdown :trigger="['click']" placement="bottomLeft">
            <a-button
              >{{ $t('Action') }}
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
      <alert-policy-dialog id="tid_alert-policy-dialog" ref="AlertPolicyDialog" />
    </div>
  </div>
</template>
<script>
import AlertPolicyService from '@/service/alert-policy'
import CompositeTable from '@/component/composite-table.vue'
import AlertTablelevel from '@/widget/alert-policy-level-label.vue'
import AlertPolicyDialog from './alert-policy-manage/alert-policy-dialog.vue'

export default {
  components: {
    'composite-table': CompositeTable,
    'alert-policy-dialog': AlertPolicyDialog,
    'alert-table-level': AlertTablelevel,
  },
  data() {
    return {
      tableDataFetcher: AlertPolicyService.getAlertPolicyTableDataFetcher(),
      columns: [
        {
          title: this.$t('Alert.Policy.Id'),
          dataIndex: 'id',
          sorter: true,
          defaultSortOrder: 'ascend',
          align: 'left',
          width: 100,
        },
        {
          title: this.$t('Alert.Policy.Name'),
          dataIndex: 'name',
          sorter: true,
        },
        {
          title: this.$t('Alert.Policy.Level'),
          dataIndex: 'level',
          sorter: true,
          customSlot: true,
          align: 'left',
        },
        {
          title: this.$t('Alert.Policy.Status'),
          dataIndex: 'status',
          sorter: true,
          customSlot: true,
          align: 'left',
        },
        {
          title: this.$t('Action'),
          key: 'action',
          customSlot: true,
          width: 120,
        },
      ],
    }
  },
  methods: {
    onCreateClick() {
      this.$refs.AlertPolicyDialog.doCreate().then(
        res => {
          // Reload table data
          this.$refs.alertPolicyTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onEditClick(row) {
      this.$refs.AlertPolicyDialog.doEdit(row.id).then(
        res => {
          // Reload table data
          this.$refs.alertPolicyTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onDeleteClick(row) {
      this.$refs.AlertPolicyDialog.doDelete(row.id).then(
        res => {
          // Reload table data
          this.$refs.alertPolicyTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    onActionCommand(command) {
      const fn = command.fn
      const argument = command.argument
      fn(argument)
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
}
.on {
  background-color: #45cb84;
}
.off {
  background-color: #999999;
}
</style>
