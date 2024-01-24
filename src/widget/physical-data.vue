<template>
  <a-table
    row-key="hostname"
    :columns="columns"
    :data-source="data"
    :pagination="data.length > 14"
    @change="handleTableChange">
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'status'">
        <node-power-status-label :power-status="record.status" />
      </template>
    </template>
  </a-table>
</template>
<script>
import NodePowerStatusLabel from '@/widget/nodes-table/node-power-status-label.vue'
import Format from '@/common/format'

export default {
  components: {
    'node-power-status-label': NodePowerStatusLabel,
  },
  props: ['mode', 'rackInfo'],
  data() {
    return {
      data: this.rackInfo.nodes,
      sortedInfo: null,
      filteredInfo: null,
      dataMap: {
        temperature: 'temperature',
        temperature_label: this.$t('Monitor.Temp'),
        temperature_unit: this.$t('Monitor.Temp.Unit'),
        ram: 'memoryUsed',
        ram_label: this.$t('Monitor.Ram'),
        ram_unit: this.$t('Monitor.Ram.Unit'),
        disk: 'diskUsed',
        disk_label: this.$t('Monitor.Disk'),
        disk_unit: this.$t('Monitor.Disk.Unit'),
        cpu: 'cpuUsed',
        cpu_label: this.$t('Monitor.Cpu'),
        cpu_unit: this.$t('Monitor.Cpu.Unit'),
        load: 'load',
        load_label: this.$t('Monitor.Load'),
        load_unit: '',
        energy: 'energy',
        energy_label: this.$t('Monitor.Ene'),
        energy_unit: this.$t('Monitor.Ene.Unit'),
        network: 'network',
        network_label: this.$t('Monitor.Net'),
        network_unit: this.$t('Monitor.Net.Unit'),
      },
    }
  },
  computed: {
    columns() {
      const sortedInfo = this.sortedInfo || {}
      const filteredInfo = this.filteredInfo || {}
      const columns = [
        {
          title: this.$t('Rack'),
          dataIndex: 'hostname',
          align: 'left',
          defaultSortOrder: 'ascend',
          key: 'hostname',
          filteredValue: filteredInfo[this.dataMap[this.mode]] || null,
          sorter: (a, b) => a.hostname.localeCompare(b.hostname, 'zh-CN', { numeric: true }),
          sortOrder: sortedInfo.columnKey === 'hostname' && sortedInfo.order,
        },
      ]
      if (this.mode === 'network') {
        ;['In', 'Out'].forEach((n, i) => {
          columns.push({
            title: this.$t(`Monitor.Net.${n}`),
            dataIndex: this.dataMap[this.mode],
            align: 'right',
            key: n,
            sorter: (a, b) => {
              const valA = a.network[i] + a.network[i + 2]
              const valB = b.network[i] + b.network[i + 2]
              return valA - valB
            },
            sortOrder: sortedInfo.columnKey === n && sortedInfo.order,
            customRender: ({ text }) => {
              if (text[i] === null || text[i + 2] === null) return '-'
              return `${Format.formatNumber(text[i] + text[i + 2], 2)}${this.dataMap[this.mode + '_unit']}`
            },
          })
        })
      } else if (this.mode === 'common') {
        columns.push({
          title: this.$t('Status'),
          dataIndex: 'status',
          align: 'right',
          key: 'status',
          sorter: (a, b) => a.status.localeCompare(b.status),
          sortOrder: sortedInfo.columnKey === 'status' && sortedInfo.order,
        })
      } else {
        columns.push({
          title: this.dataMap[`${this.mode}_label`],
          dataIndex: this.dataMap[this.mode],
          align: 'right',
          key: this.dataMap[this.mode],
          sorter: (a, b) => a[this.dataMap[this.mode]] - b[this.dataMap[this.mode]],
          sortOrder: sortedInfo.columnKey === this.dataMap[this.mode] && sortedInfo.order,
          customRender: ({ text }) =>
            text === null || text === 'NaN' ? '-' : `${text}${this.dataMap[this.mode + '_unit']}`,
        })
      }
      return columns
    },
  },
  watch: {
    rackInfo(val, oldVal) {
      this.data = this.rackInfo.nodes
    },
    mode(val) {
      this.sortedInfo = {
        order: 'ascend',
        columnKey: 'hostname',
      }
    },
  },
  methods: {
    handleTableChange(pagination, filters, sorter) {
      this.sortedInfo = sorter
    },
  },
}
</script>
<style>
.pyhsical-table {
  width: 302px;
  padding: 0 !important;
}
</style>
