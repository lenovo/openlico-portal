<template lang="html">
  <div>
    <composite-table
      id="tid_billgroup-storage-table"
      ref="billGroupTable"
      :columns="columns"
      :row-key="row => row.id"
      :table-data="tableData"
      :pagination-enable="false"
      :page-sizes="[]">
      <a-dropdown slot="action" slot-scope="{ row }" :trigger="['click']" placement="bottomLeft">
        <a-button>{{ $t('Action') }}</a-button>
        <a-menu slot="overlay">
          <a-menu-item @click="onEditClick(row)">
            {{ $t('Action.Edit') }}
          </a-menu-item>
          <a-menu-item @click="onDeleteClick(row)">
            {{ $t('Action.Delete') }}
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </composite-table>
    <storage-policy-dialog ref="storagePolifyDialog" />
  </div>
</template>
<script>
import CompositeTable from '../../component/composite-table'
import Format from '../../common/format'
import StoragePolicyDialog from './set-storage-policy-dialog'
export default {
  components: {
    'composite-table': CompositeTable,
    'storage-policy-dialog': StoragePolicyDialog,
  },
  props: ['billGroup'],
  data() {
    return {
      tableData: [],
      columns: [
        {
          align: 'center',
          title: this.$t('BillGroup.StoragePath'),
          dataIndex: 'pathList',
          customRender: val => val.toString(),
        },
        {
          align: 'center',
          title: this.$t('BillGroup.StorageChargeRate'),
          dataIndex: 'storageChargeRate',
          customRender: (val, row) => {
            return (
              Format.formatBillingRate(
                row.storageChargeRate,
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
          customRender: val => Format.formatDateTime(val),
          sorter: true,
          defaultSortOrder: 'ascend',
        },
        {
          width: 120,
          title: this.$t('Action'),
          key: 'action',
          scopedSlots: { customRender: 'action' },
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

<style lang="css"></style>
