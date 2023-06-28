<template>
  <div class="m-10 p-20 b-w" style="min-height: 324px">
    <h3 class="m-b-20" style="font-size: 18px">
      {{ $t('Report.Cluster.Resource') }}
    </h3>
    <a-row class="cluster-resource">
      <a-table
        row-key="type"
        :columns="columns"
        :data-source="tableData"
        :row-class-name="() => 'cluster-resource-table-row'"
        :pagination="false" />
    </a-row>
  </div>
</template>
<script>
import Collection from './../../common/collection'
export default {
  props: ['data'],
  data() {
    return {
      resource: [{ code: 'cpu_cores', id: 0, display_name: 'CPU Cores' }],
      columns: [
        {
          title: this.$t('Report.Cluster.Resource.Type'),
          dataIndex: 'type',
        },
        {
          title: this.$t('Report.Cluster.Resource.JobConts'),
          dataIndex: 'jobConts',
          align: 'right',
        },
        {
          title: this.$t('Report.Cluster.Resource.Maximum'),
          dataIndex: 'maximum',
          align: 'right',
        },
        {
          title: this.$t('Report.Cluster.Resource.Average'),
          dataIndex: 'average',
          align: 'right',
        },
      ],
    }
  },
  computed: {
    tableData() {
      const arr = []
      if (!this.data) {
        return []
      }
      for (const key in this.data) {
        if (key !== 'submit' && key !== 'waiting') {
          const result = this.resource.filter(item => item.code === key)[0]
          if (result) {
            arr.push({
              type: result.display_name,
              jobConts: this.data[key][0],
              maximum: this.data[key][1],
              average: this.data[key][2],
            })
          }
        }
      }
      return arr
    },
  },
  mounted() {
    const options = this.resource.concat(this.$store.getters['settings/getGResource'])
    Collection.sortObjectsByProp(options, 'id', '')
    this.resource = options
  },
}
</script>
<style>
/* .cluster-resource {

  } */
.cluster-resource-col {
  line-height: 40px;
}
.cluster-resource-table-header {
  height: 80px;
}
.cluster-resource-table-header th {
  color: #000000;
  background-color: #e8e8e8 !important;
}
.cluster-resource-table-row {
  height: 48px;
}
</style>
