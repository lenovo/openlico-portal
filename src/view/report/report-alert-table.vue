<template>
  <div>
    <composite-table
      ref="innerreportAlertTable"
      :table-data="dataReportAlertTable"
      :columns="columns"
      row-key="alertTime"
      :current-page="1"
      :page-sizes="['10', '20', '40', '50']"
      :page-size="20" />
  </div>
</template>
<script>
import CompositeTable from '../../component/composite-table'
export default {
  components: {
    'composite-table': CompositeTable,
  },
  props: ['dataReportAlertTable'],
  data() {
    return {
      columns: [
        {
          dataIndex: 'alertTime',
          title: this.$t('Alert.Table.title.createTime'),
          sorter: true,
          defaultSortOrder: 'descend',
        },
        {
          dataIndex: 'critical',
          title: this.$t('Alert.PolicyLevel.critical'),
          sorter: true,
        },
        {
          dataIndex: 'error',
          title: this.$t('Alert.PolicyLevel.error'),
          sorter: true,
        },
        {
          dataIndex: 'warning',
          title: this.$t('Alert.PolicyLevel.warning'),
          sorter: true,
        },
        {
          dataIndex: 'info',
          title: this.$t('Alert.PolicyLevel.info'),
          sorter: true,
        },
        {
          dataIndex: 'numTotal',
          title: this.$t('Alert.Table.title.Total'),
          sorter: true,
        },
      ],
    }
  },
  methods: {
    onDataFetchError(errMsg) {
      this.$message.error(this.$t(errMsg))
    },
    reLayout() {
      this.$refs.innerreportAlertTable.reLayout()
    },
  },
}
</script>
