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
    <template slot="health" slot-scope="{ health }">
      <node-health-label :status="health" />
      {{ health | filterHealthLabel(healthOptions, $t('Node.Health.Status.Unknown')) }}
    </template>
  </composite-table>
</template>

<script>
import CompositeTable from '../../component/composite-table'
import MonitorDataService from '../../service/monitor-data'
import NodeHealthLabel from '../node-health-label'

export default {
  components: {
    'composite-table': CompositeTable,
    'node-health-label': NodeHealthLabel,
  },
  filters: {
    filterHealthLabel: function (val, filterOptions, unknownLabel) {
      const option = filterOptions.filter(v => v.status.includes(val))
      return option.length > 0 ? option[0].label : unknownLabel
    },
  },
  props: ['nodeId'],
  data() {
    return {
      innerNodeId: null,
      healthOptions: [
        {
          label: this.$t('Node.Health.Status.Ok'),
          status: ['ok'],
        },
        {
          label: this.$t('Node.Health.Status.Warning'),
          status: ['warning'],
        },
        {
          label: this.$t('Node.Health.Status.Critical'),
          status: ['critical'],
        },
        {
          label: this.$t('Node.Health.Status.Failed'),
          status: ['failed'],
        },
      ],
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
          sorter: true,
          scopedSlots: { customRender: 'health' },
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
