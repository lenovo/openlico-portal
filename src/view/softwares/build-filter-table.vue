<template>
  <a-spin :spinning="loading">
    <composite-table ref="softwaresTable" :columns="columns" row-key="index" :table-data="data" :search-enable="false">
      <template #action="{ row }">
        <a-button @click="onBuildClick(row)">{{ $t('Action.Build') }}</a-button>
      </template>
    </composite-table>
  </a-spin>
</template>
<script>
import SoftwaresService from '@/service/softwores'
import CompositeTable from '@/component/composite-table.vue'
export default {
  components: { CompositeTable },
  props: ['filter', 'loading'],
  emits: ['onBuildClick', 'update:loading'],
  data() {
    return {
      columns: [
        {
          title: this.$t('Name'),
          dataIndex: 'name',
          align: 'left',
          defaultSortOrder: 'descend',
        },
        {
          title: this.$t('Softwares.Build.Version'),
          dataIndex: 'version',
          align: 'left',
        },
        {
          title: this.$t('Softwares.Build.Toolchain'),
          dataIndex: 'toolchain',
          align: 'left',
        },
        {
          title: this.$t('Action'),
          key: 'action',
          align: 'right',
          customSlot: true,
        },
      ],
      data: [],
    }
  },
  mounted() {
    // this.refreshTable()
  },
  methods: {
    onBuildClick(row) {
      this.$emit('onBuildClick', row)
    },
    refreshTable() {
      this.$emit('update:loading', true)
      SoftwaresService.getBuildingSoftwareByFilter(this.filter.type, this.filter.value)
        .then(
          res => {
            this.data = res
            this.$refs.softwaresTable.fetchTableData()
          },
          err => {
            this.$message.error(err)
          },
        )
        .finally(() => {
          this.$emit('update:loading', false)
        })
    },
  },
}
</script>
<style></style>
