<template>
  <div>
    <composite-table
      ref="reportTable"
      row-key="key"
      :columns="tableColumns"
      :table-data="table"
      :page-size="10"
      :search-enable="false"
      :controller-header-enable="false" />
  </div>
</template>
<script>
import CompositeTable from '../../component/composite-table'
export default {
  components: {
    'composite-table': CompositeTable,
  },
  props: ['table', 'job_type'],
  data() {
    return {
      columns: [
        {
          title: this.$t('Report.Table.Time'),
          dataIndex: 'start_time',
          sorter: true,
          defaultSortOrder: 'descend',
        },
        {
          title: '',
          dataIndex: 'name',
          sorter: true,
          align: 'right',
          customRender: text => text || '-',
        },
        {
          title: this.$t('Report.Table.Job'),
          dataIndex: 'job_count',
          sorter: true,
          align: 'right',
        },
        {
          title: this.$t('Report.Table.CPU'),
          dataIndex: 'cpu_count',
          sorter: true,
          align: 'right',
        },
        {
          title: this.$t('Report.Preview.CPU.RunTime'),
          dataIndex: 'cpu_runtime',
          sorter: true,
          align: 'right',
          customRender: val => val.toFixed(2),
        },
        {
          title: this.$t('Report.Table.GPU'),
          dataIndex: 'gpu_count',
          sorter: true,
          align: 'right',
        },
        {
          title: this.$t('Report.Preview.GPU.RunTime'),
          dataIndex: 'gpu_runtime',
          sorter: true,
          align: 'right',
          customRender: val => val.toFixed(2),
        },
      ],
      tableColumns: [],
    }
  },
  watch: {
    job_type(val, old) {
      this.initTableColumns()
    },
  },
  created() {
    this.initTableColumns()
  },
  methods: {
    initTableColumns() {
      let arr = []
      if (this.job_type === 'job') {
        arr = this.columns.filter(item => item.dataIndex !== 'name')
      } else {
        arr = this.columns.map(item => {
          if (item.dataIndex === 'name') {
            item.title = this.$t(this.job_type === 'user' ? 'Login.Username' : 'BillGroup')
          }
          return item
        })
      }
      this.tableColumns = arr
    },
  },
}
</script>
