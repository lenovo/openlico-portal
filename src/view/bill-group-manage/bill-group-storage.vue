<template>
  <composite-table
    id="tid_billgroup-storage-table"
    ref="billGroupTable"
    :columns="columns"
    :row-key="row => row.id"
    :table-data="tableData"
    :pagination-enable="false"
    :page-sizes="[]">
    <template #action="{ row }">
      <a-dropdown :trigger="['click']" placement="bottomLeft">
        <a-button>{{ $t('Action') }}</a-button>
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
  <storage-policy-dialog ref="storagePolifyDialog" />
</template>
<script>
import CompositeTable from '@/component/composite-table.vue'
import Format from '@/common/format'
import StoragePolicyDialog from './set-storage-policy-dialog.vue'
export default {
  components: {
    'composite-table': CompositeTable,
    'storage-policy-dialog': StoragePolicyDialog,
  },
  props: ['billGroup'],
  emits: ['update-billgroup'],
  data() {
    return {
      tableData: [],
      columns: [
        {
          align: 'center',
          title: this.$t('BillGroup.StoragePath'),
          dataIndex: 'pathList',
          customRender: ({ text }) => text.toString(),
        },
        {
          align: 'center',
          title: this.$t('BillGroup.StorageChargeRate'),
          dataIndex: 'storageChargeRate',
          customRender: ({ text, record }) => {
            return (
              Format.formatBillingRate(
                record.storageChargeRate,
                window.gApp.$store.getters['settings/getCurrency'],
                true,
              ) +
              ' ' +
              this.$t('BillGroup.StorageChargeRate.Unit')
            )
          },
          sorter: true,
        },
        {
          align: 'center',
          title: this.$t('BillGroup.UpdateTime'),
          dataIndex: 'updateTime',
          customRender: ({ text }) => Format.formatDateTime(text),
          sorter: true,
          defaultSortOrder: 'ascend',
        },
        {
          width: 120,
          title: this.$t('Action'),
          key: 'action',
          customSlot: true,
        },
      ],
    }
  },
  watch: {
    billGroup(val, oldVal) {
      if (val) {
        this.tableData = val.storagePolicy
      }
    },
  },
  mounted() {
    this.tableData = this.billGroup.storagePolicy
  },
  methods: {
    onCreateClick() {
      this.$refs.storagePolifyDialog.doCreate(this.billGroup).then(
        res => {
          // Reload billgroup table data
          this.$emit('update-billgroup')
        },
        res => {
          // Do nothing
        },
      )
    },
    onEditClick(row) {
      this.$refs.storagePolifyDialog.doEdit(this.billGroup, row).then(
        res => {
          // Reload billgroup table data
          this.$emit('update-billgroup')
        },
        res => {
          // Do nothing
        },
      )
    },
    onDeleteClick(row) {
      this.$refs.storagePolifyDialog.doDelete(this.billGroup, row).then(
        res => {
          // Reload billgroup table data
          this.$emit('update-billgroup')
        },
        res => {
          // Do nothing
        },
      )
    },
  },
}
</script>
