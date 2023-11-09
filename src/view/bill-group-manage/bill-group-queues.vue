<template>
  <composite-table
    id="tid_billgroup-queue-table"
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
  <queue-policy-dialog ref="queuePolicyDialog" />
</template>
<script>
import CompositeTable from '@/component/composite-table.vue'
import Format from '@/common/format'
import QueuePolicyDialog from './set-queue-policy-dialog.vue'
export default {
  components: {
    'composite-table': CompositeTable,
    'queue-policy-dialog': QueuePolicyDialog,
  },
  props: ['billGroup'],
  emits: ['update-billgroup'],
  data() {
    const columns = [
      {
        align: 'center',
        title: this.$t('BillGroup.Queues'),
        dataIndex: 'queueList',
        customRender: ({ text }) => text.toString(),
      },
      {
        align: 'center',
        title: this.$t('BillGroup.CpuChargeRate'),
        dataIndex: 'chargeRate',
        sorter: true,
        customRender: ({ text, record }) => {
          if (record.chargeRateDisplayType === 'minute') {
            return (
              Format.formatBillingRate(record.chargeRateMinute, this.currency, true) +
              ' / ' +
              this.$t('BillGroup.CpuChargeRate.Unit') +
              '*' +
              this.$T(
                'BillGroup.ChargeRate.' +
                  record.chargeRateDisplayType.replace(
                    record.chargeRateDisplayType[0],
                    record.chargeRateDisplayType[0].toUpperCase(),
                  ),
              )
            )
          }
          return (
            Format.formatBillingRate(record.chargeRate, this.currency, true) +
            ' / ' +
            this.$t('BillGroup.CpuChargeRate.Unit') +
            '*' +
            this.$T(
              'BillGroup.ChargeRate.' +
                record.chargeRateDisplayType.replace(
                  record.chargeRateDisplayType[0],
                  record.chargeRateDisplayType[0].toUpperCase(),
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
        customRender: ({ text, record }) => {
          if (record.memoryChargeRateDisplayType === 'minute') {
            return (
              Format.formatBillingRate(record.memoryChargeRateMinute, this.currency, true) +
              ' / ' +
              this.$t('BillGroup.MemoryChargeRate.Unit') +
              '*' +
              this.$T(
                'BillGroup.ChargeRate.' +
                  record.memoryChargeRateDisplayType.replace(
                    record.memoryChargeRateDisplayType[0],
                    record.memoryChargeRateDisplayType[0].toUpperCase(),
                  ),
              )
            )
          }
          return (
            Format.formatBillingRate(record.memoryChargeRate, this.currency, true) +
            ' / ' +
            this.$t('BillGroup.MemoryChargeRate.Unit') +
            '*' +
            this.$T(
              'BillGroup.ChargeRate.' +
                record.memoryChargeRateDisplayType.replace(
                  record.memoryChargeRateDisplayType[0],
                  record.memoryChargeRateDisplayType[0].toUpperCase(),
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
        customRender: ({ text }) => Format.formatDateTime(text),
      },
      {
        width: 120,
        title: this.$t('Action'),
        key: 'action',
        customSlot: true,
      },
    ]
    const gresource = window.gApp.$store.getters['settings/getGResource']
    const gresColumns = []
    gresource.forEach(el => {
      gresColumns.push({
        align: 'center',
        title: this.$T('BillGroup.GresChargeRate', {
          value: el.display_name,
        }),
        dataIndex: el.code,
        key: el.id,
        customRender: ({ text, record }) => {
          for (let index = 0; index < gresource.length; index++) {
            const element = gresource[index]
            if (el.code === element.code) {
              if (record.gresChargeRateDisplayType[element.code] === 'minute') {
                return (
                  Format.formatBillingRate(record.gresChargeRateMinute[element.code], this.currency, true) +
                  ' / ' +
                  element.unit +
                  '*' +
                  this.$t('BillGroup.ChargeRate.Minute')
                )
              }
              return (
                Format.formatBillingRate(record.gresChargeRate[element.code], this.currency, true) +
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
