<template>
  <composite-table
    id="tid_node-health-table"
    ref="healthTable"
    row-key="name"
    :columns="columns"
    :table-data-fetcher="tableDataFetcher"
    :selection-enable="false"
    :default-sort="{ prop: 'id', order: 'ascending' }"
    :controller-header-enable="false"
    :auto-refresh="30 * 1000">
    <template #health="{ health }">
      <node-health-label :status="health" />
    </template>
  </composite-table>
</template>

<script>
import CompositeTable from '@/component/composite-table.vue'
import MonitorDataService from '@/service/monitor-data'
import NodeHealthLabel from '../nodes-table/node-health-label.vue'

export default {
  components: {
    'composite-table': CompositeTable,
    'node-health-label': NodeHealthLabel,
  },
  props: ['nodeId'],
  data() {
    return {
      innerNodeId: null,
      tableDataFetcher: MonitorDataService.getNodeHealthTableDataFetcher(this.nodeId),
      columns: [
        {
          title: this.$t('Health.Table.title.name'),
          dataIndex: 'name',
          defaultSortOrder: 'ascend',
          sorter: true,
        },
        {
          title: this.$t('Health.Table.title.health'),
          dataIndex: 'health',
          align: 'center',
          sorter: true,
          customSlot: true,
        },
        {
          title: this.$t('Health.Table.title.states'),
          dataIndex: 'states',
        },
      ],
    }
  },
  watch: {
    nodeId: function (val) {
      this.innerNodeId = val
      // this.tableDataFetcher = MonitorDataService.getNodeHealthTableDataFetcher(val);
    },
  },
}
</script>

<style scoped></style>
