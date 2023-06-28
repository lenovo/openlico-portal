<template>
  <div class="height--100 p-10">
    <div class="table-style">
      <composite-table
        id="tid_alert-script-table"
        ref="alertScriptTable"
        :columns="columns"
        :row-key="row => row.name"
        :table-data-fetcher="tableDataFetcher"
        :search-enable="true"
        :search-props="['name']" />
    </div>
  </div>
</template>
<script>
import CompositeTable from '../component/composite-table'
import AlertScriptService from '../service/alert-script'
import Format from '../common/format'

export default {
  components: {
    'composite-table': CompositeTable,
  },
  data() {
    return {
      tableDataFetcher: AlertScriptService.getAlertScriptsTableDataFetcher(),
      columns: [
        {
          title: this.$t('Alert.Script.Name'),
          dataIndex: 'name',
          sorter: true,
          defaultSortOrder: 'ascend',
        },
        {
          title: this.$t('Alert.Script.Size'),
          dataIndex: 'fileSize',
          sorter: true,
          customRender: val => Format.formatByteSize(val),
        },
        {
          title: this.$t('Alert.Script.Time'),
          dataIndex: 'createTime',
          sorter: true,
          customRender: val => Format.formatDateTime(val),
        },
      ],
    }
  },
  methods: {},
}
</script>
<style></style>
