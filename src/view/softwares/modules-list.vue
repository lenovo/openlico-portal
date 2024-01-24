<template>
  <div>
    <composite-table
      ref="softwaresTable"
      :columns="columns"
      row-key="index"
      :table-data-fetcher="tableDataFetcher"
      :search-enable="true"
      :search-props="['name']">
      <template #controller>
        <div>
          <span class="m-r-20">{{ $t('Softwares.Modules.Filter') }}</span>
          <a-select v-model:value="moduleType" style="width: 150px" @change="onFilterChange">
            <a-select-option value="all">{{ $t('Category.All') }}</a-select-option>
            <a-select-option value="public">{{ $t('Category.Public') }}</a-select-option>
            <a-select-option value="private">{{ $t('Category.Private') }}</a-select-option>
          </a-select>
        </div>
      </template>
      <template #action="{ row }">
        <a-dropdown v-if="!row.children" :trigger="['click']">
          <template #overlay>
            <a-menu>
              <a-menu-item style="white-space: nowrap" @click="onViewLoaction(row)">{{
                $t('Action.Location')
              }}</a-menu-item>
              <a-menu-item v-if="row.parentType === 'private'" @click="onRemoveClick(row)">{{
                $t('Action.Remove')
              }}</a-menu-item>
            </a-menu>
          </template>
          <a-button style="margin-left: 8px">
            {{ $t('Action') }}
            <DownOutlined />
          </a-button>
        </a-dropdown>
      </template>
    </composite-table>
    <ModuleActionDialog ref="moduleDialog" />
  </div>
</template>
<script>
import SoftwareService from '@/service/softwores'
import CompositeTable from '@/component/composite-table.vue'
import ModuleActionDialog from './module-action-dialog.vue'

export default {
  components: {
    CompositeTable,
    ModuleActionDialog,
  },
  data() {
    return {
      moduleType: this.$store.state.auth.access === 'admin' ? 'public' : 'all',
      columns: [
        {
          title: this.$t('Softwares.Modules.Module'),
          dataIndex: 'name',
          align: 'left',
          width: '50%',
          defaultSortOrder: 'descend',
        },
        {
          title: this.$t('Softwares.Modules.Type'),
          dataIndex: 'type',
          align: 'left',
          customRender: ({ text }) => {
            const value = text || this.moduleType
            return value === 'private'
              ? this.$t('Category.Private')
              : value === 'public'
              ? this.$t('Category.Public')
              : ''
          },
        },
        {
          title: this.$t('Action'),
          key: 'action',
          width: 120,
          customSlot: true,
        },
      ],
    }
  },
  computed: {
    tableDataFetcher() {
      return SoftwareService.getSoftwareModulesTableDataFetcher(this.moduleType)
    },
  },
  methods: {
    onFilterChange() {
      this.$nextTick(() => {
        this.$refs.softwaresTable.clearExpanded()
        this.$refs.softwaresTable.fetchTableData(true)
      })
    },
    onViewLoaction(row) {
      this.$refs.moduleDialog.doLocation(row)
    },
    onRemoveClick(row) {
      this.$refs.moduleDialog.doRemove(row).finally(_ => {
        this.$refs.softwaresTable.fetchTableData()
      })
    },
  },
}
</script>
<style></style>
