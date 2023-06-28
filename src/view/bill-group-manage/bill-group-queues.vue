<template lang="html">
  <div>
    <composite-table
      id="tid_billgroup-queue-table"
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
    <queue-policy-dialog ref="queuePolicyDialog" />
  </div>
</template>
<script>
import CompositeTable from '../../component/composite-table'
import Format from '../../common/format'
import QueuePolicyDialog from './set-queue-policy-dialog'
export default {
  components: {
    'composite-table': CompositeTable,
    'queue-policy-dialog': QueuePolicyDialog,
  },
  props: ['billGroup'],
  data() {
    const columns = [
      {
        align: 'center',
        title: this.$t('BillGroup.Queues'),
        dataIndex: 'queueList',
        customRender: val => val.toString(),
      },
      {
        align: 'center',
        title: this.$t('BillGroup.CpuChargeRate'),
        dataIndex: 'chargeRate',
        sorter: true,
        customRender: (val, row) => {
          if (row.chargeRateDisplayType === 'minute') {
            return (
              Format.formatBillingRate(row.chargeRateMinute, this.currency, true) +
              ' / ' +
              this.$t('BillGroup.CpuChargeRate.Unit') +
              '*' +
              this.$t(
                'BillGroup.ChargeRate.' +
                  row.chargeRateDisplayType.replace(
                    row.chargeRateDisplayType[0],
                    row.chargeRateDisplayType[0].toUpperCase(),
                  ),
              )
            )
          }
          return (
            Format.formatBillingRate(row.chargeRate, this.currency, true) +
            ' / ' +
            this.$t('BillGroup.CpuChargeRate.Unit') +
            '*' +
            this.$t(
              'BillGroup.ChargeRate.' +
                row.chargeRateDisplayType.replace(
                  row.chargeRateDisplayType[0],
                  row.chargeRateDisplayType[0].toUpperCase(),
                ),
            )
          )
        },
      },
      {
        align: 'center',
        title: this.$t('BillGroup.MemoryChargeRate'),
        dataIndex: 'memoryChargeRate',
        sorter: true,
        customRender: (val, row) => {
          if (row.memoryChargeRateDisplayType === 'minute') {
            return (
              Format.formatBillingRate(row.memoryChargeRateMinute, this.currency, true) +
              ' / ' +
              this.$t('BillGroup.MemoryChargeRate.Unit') +
              '*' +
              this.$t(
                'BillGroup.ChargeRate.' +
                  row.memoryChargeRateDisplayType.replace(
                    row.memoryChargeRateDisplayType[0],
                    row.memoryChargeRateDisplayType[0].toUpperCase(),
                  ),
              )
            )
          }
          return (
            Format.formatBillingRate(row.memoryChargeRate, this.currency, true) +
            ' / ' +
            this.$t('BillGroup.MemoryChargeRate.Unit') +
            '*' +
            this.$t(
              'BillGroup.ChargeRate.' +
                row.memoryChargeRateDisplayType.replace(
                  row.memoryChargeRateDisplayType[0],
                  row.memoryChargeRateDisplayType[0].toUpperCase(),
                ),
            )
          )
        },
      },
      {
        align: 'center',
        title: this.$t('BillGroup.UpdateTime'),
        dataIndex: 'updateTime',
        sorter: true,
        defaultSortOrder: 'ascend',
        customRender: val => Format.formatDateTime(val),
      },
      {
        width: 120,
        title: this.$t('Action'),
        key: 'action',
        scopedSlots: { customRender: 'action' },
      },
    ]
    const gresource = window.gApp.$store.getters['settings/getGResource']
    const gresColumns = []
    gresource.forEach(el => {
      gresColumns.push({
        align: 'center',
        title: this.$t('BillGroup.GresChargeRate', {
          value: el.display_name,
        }),
        dataIndex: el.code,
        key: el.id,
        customRender: (val, row) => {
          for (let index = 0; index < gresource.length; index++) {
            const element = gresource[index]
            if (el.code === element.code) {
              if (row.gresChargeRateDisplayType[element.code] === 'minute') {
                return (
                  Format.formatBillingRate(row.gresChargeRateMinute[element.code], this.currency, true) +
                  ' / ' +
                  element.unit +
                  '*' +
                  this.$t('BillGroup.ChargeRate.Minute')
                )
              }
              return (
                Format.formatBillingRate(row.gresChargeRate[element.code], this.currency, true) +
                ' / ' +
                element.unit +
                '*' +
                this.$t('BillGroup.ChargeRate.Hour')
              )
            }
          }
        },
      })
    })
    columns.splice(3, 0, ...gresColumns)
    return {
      currency: window.gApp.$store.getters['settings/getCurrency'],
      columns,
    }
  },
  computed: {
    tableData: function () {
      const data = []
      this.billGroup.queuePolicy.forEach(el => {
        const keys = Object.keys(el.gresChargeRate)
        keys.forEach(element => {
          el[element] = el.gresChargeRate[element]
        })
        data.push(el)
      })
      return data
    },
  },
  methods: {
    onCreateClick() {
      this.$refs.queuePolicyDialog.doCreate(this.billGroup).then(
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
      this.$refs.queuePolicyDialog.doEdit(this.billGroup, row).then(
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
      this.$refs.queuePolicyDialog.doDelete(this.billGroup, row).then(
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
