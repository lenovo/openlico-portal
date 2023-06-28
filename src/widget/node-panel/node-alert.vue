<template>
  <composite-table
    id="tid_node-alert-table"
    ref="alertTable"
    row-key="id"
    :columns="columns"
    :page-sizes="['5', '10', '20', '50']"
    :page-size="5"
    :table-data-fetcher="tableDataFetcher"
    :selection-enable="false"
    :external-filter="dataFilter"
    :controller-header-enable="false"
    :auto-refresh="30 * 1000">
    <template slot="policyLevel" slot-scope="{ policyLevel }">
      <alert-table-level alert-level-size="normal" :level="policyLevel" />
    </template>
  </composite-table>
</template>
<script>
import CompositeTable from '../../component/composite-table'
import AlertTablelevel from '../alert-policy-level-label.vue'
import AlertService from '../../service/alert'
import Format from '../../common/format'

export default {
  components: {
    'composite-table': CompositeTable,
    'alert-table-level': AlertTablelevel,
  },
  props: ['node'],
  data() {
    return {
      dataFilter: {
        status: {
          values: ['present', 'confirmed'],
          type: 'in',
        },
        nodeName: {
          values: [this.node.hostname],
          type: 'in',
        },
      },
      tableDataFetcher: AlertService.getAlertTableDataFetcher(),
      columns: [
        {
          title: this.$t('ID'),
          defaultSortOrder: 'ascend',
          dataIndex: 'id',
          sorter: true,
          width: 80,
        },
        {
          title: this.$t('Name'),
          dataIndex: 'policyName',
        },
        {
          title: this.$t('Level'),
          scopedSlots: { customRender: 'policyLevel' },
          dataIndex: 'policyLevel',
          sorter: true,
          align: 'left',
          width: 120,
        },
        {
          title: this.$t('Status'),
          dataIndex: 'status',
          sorter: true,
          customRender: val => this.$t(`Alert.Status.${val}`),
        },
        {
          title: this.$t('Time'),
          dataIndex: 'createTime',
          sorter: true,
          customRender: val => Format.formatDateTime(val),
        },
      ],
    }
  },
}
</script>
<style scoped></style>
