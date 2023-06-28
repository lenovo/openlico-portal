<template>
  <div class="table-style">
    <composite-table
      id="tid_nodes-table"
      ref="nodesTable"
      row-key="hostname"
      :columns="columns"
      :table-data-fetcher="tableDataFetcher"
      :selection-enable="true"
      :search-enable="true"
      :search-props="['hostname', 'bmcIP', 'osIP']"
      :external-filter="nodeExternalFilter"
      :auto-refresh="30 * 1000"
      @selection-change="onTableSelectionChange">
      <div slot="controller" class="composite-table-controller">
        <a-dropdown
          id="tid_nodes-multi-power-on"
          :disabled="hasNoSelectedNode"
          style="margin-right: 10px"
          placement="bottomLeft"
          :trigger="['click']">
          <a-button>
            {{ $t('Node.Action.PowerOn') }}
            <a-icon type="down" />
          </a-button>
          <a-menu slot="overlay">
            <a-menu-item @click="onMultiPowerOnCommand({ nextDevice: null })">
              {{ $t('Node.Action.PowerOn') }}
            </a-menu-item>
            <a-menu-item @click="onMultiPowerOnCommand({ nextDevice: 'setup' })">
              {{ $t('Node.Action.PowerOn.Setup') }}
            </a-menu-item>
            <a-menu-item @click="onMultiPowerOnCommand({ nextDevice: 'network' })">
              {{ $t('Node.Action.PowerOn.Network') }}
            </a-menu-item>
            <a-menu-item @click="onMultiPowerOnCommand({ nextDevice: 'cd' })">
              {{ $t('Node.Action.PowerOn.CD') }}
            </a-menu-item>
          </a-menu>
        </a-dropdown>
        <a-button
          id="tid_nodes-multi-power-off"
          style="margin-right: 10px"
          :disabled="hasNoSelectedNode"
          @click="onMultiPowerOffClick()">
          {{ $t('Node.Action.PowerOff') }}
        </a-button>
        <a-button
          id="tid_nodes-multi-console"
          style="margin-right: 10px"
          :disabled="hasNoSelectedNode"
          @click="onMultiConsoleClick()">
          {{ $t('Node.RemoteAccess.Console') }}
        </a-button>
        <a-button id="tid_nodes-multi-shell" :disabled="hasNoSelectedNode" @click="onMultiShellClick()">
          {{ $t('Node.RemoteAccess.Shell') }}
        </a-button>
      </div>
      <a-button slot="hostname" slot-scope="{ hostname, row }" type="link" @click="onDetailClick(row)">
        {{ hostname }}
      </a-button>
      <node-status-label slot="status" slot-scope="{ status }" :status="status" />
      <template v-if="health" slot="health" slot-scope="{ health }">
        <node-health-label :status="health" />
        {{ health | filterHealthLabel(healthOptions, $t('Node.Health.Status.Unknown')) }}
      </template>
      <node-power-status-label
        v-if="powerStatus !== ''"
        slot="powerStatus"
        slot-scope="{ powerStatus }"
        :power-status="powerStatus ? 'on' : 'off'" />
      <a-button v-if="bmcIP" slot="bmcIP" slot-scope="{ bmcIP }" type="link" @click="onBMCClick(bmcIP)">
        {{ bmcIP }}
      </a-button>
      <template slot="hardware" slot-scope="{ row }">
        <a-popover trigger="hover">
          <template slot="content">
            <p>{{ showHardware(row, 'cpuTotal') }}</p>
            <p>{{ showHardware(row, 'ramTotal') }}</p>
            <p>{{ showHardware(row, 'diskTotal') }}</p>
            <p v-if="row.gpus.length > 0">
              {{ showHardware(row, 'gpus') }}
            </p>
          </template>
          <span>{{ columnFormatter(row, 'hardware') }}</span>
        </a-popover>
      </template>
      <a-dropdown
        slot="action"
        slot-scope="{ row }"
        :disabled="row.onCloud"
        placement="bottomLeft"
        :trigger="['click']">
        <a-button>
          {{ $t('Action') }}
          <a-icon type="down" />
        </a-button>
        <a-menu slot="overlay">
          <a-menu-item v-if="row.powerStatus" @click="onPowerOffClick(row)">
            {{ $t('Node.Action.PowerOff') }}
          </a-menu-item>
          <a-menu-item @click="onConsoleClick(row)">
            {{ $t('Node.RemoteAccess.Console') }}
          </a-menu-item>
          <a-menu-item @click="onShellClick(row)">
            {{ $t('Node.RemoteAccess.Shell') }}
          </a-menu-item>
          <a-menu-item @click="onPowerOnCommand({ nextDevice: null, node: row })">
            {{ $t('Node.Action.PowerOn') }}
          </a-menu-item>
          <a-menu-item @click="onPowerOnCommand({ nextDevice: 'setup', node: row })">
            {{ $t('Node.Action.PowerOn.Setup') }}
          </a-menu-item>
          <a-menu-item @click="onPowerOnCommand({ nextDevice: 'network', node: row })">
            {{ $t('Node.Action.PowerOn.Network') }}
          </a-menu-item>
          <a-menu-item @click="onPowerOnCommand({ nextDevice: 'cd', node: row })">
            {{ $t('Node.Action.PowerOn.CD') }}
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </composite-table>
    <node-detail-dialog id="tid_node-detail-dialog" ref="detailDialog" />
    <node-action-dialog id="tid_node-action-dialog" ref="actionDialog" />
  </div>
</template>
<script>
import Format from '../common/format'
import NodeService from '../service/node'
import CompositeTable from '../component/composite-table'
import NodeStatusLabel from './node-status-label.vue'
import NodeHealthLabel from './node-health-label'
import NodePowerStatusLabel from './node-power-status-label'
import NodeDetailDialog from './nodes-table/node-detail-dialog'
import NodeActionDialog from './nodes-table/node-action-dialog'
import AccessService from './../service/access'

export default {
  components: {
    'composite-table': CompositeTable,
    'node-status-label': NodeStatusLabel,
    'node-power-status-label': NodePowerStatusLabel,
    'node-detail-dialog': NodeDetailDialog,
    'node-action-dialog': NodeActionDialog,
    'node-health-label': NodeHealthLabel,
  },
  filters: {
    filterHealthLabel: function (val, filterOptions, unknownLabel) {
      const option = filterOptions.filter(v => v.status.includes(val))
      return option.length > 0 ? option[0].label : unknownLabel
    },
  },
  props: ['nodeExternalFilter'],
  data() {
    return {
      tableDataFetcher: NodeService.getNodesTableDataFetcher(),
      hasNoSelectedNode: true,
      selectedNodeId: [],
      terminalData: [],
      columns: [
        {
          title: this.$t('Node.HostName'),
          dataIndex: 'hostname',
          sorter: true,
          defaultSortOrder: 'ascend',
          width: 120,
          scopedSlots: { customRender: 'hostname' },
        },
        {
          title: this.$t('Node.Health'),
          dataIndex: 'health',
          width: 120,
          align: 'left',
          scopedSlots: { customRender: 'health' },
        },
        {
          title: this.$t('Node.Power'),
          dataIndex: 'powerStatus',
          width: 80,
          align: 'left',
          scopedSlots: { customRender: 'powerStatus' },
        },
        {
          title: this.$t('Node.Type'),
          dataIndex: 'type',
          sorter: true,
          width: 120,
        },
        {
          title: this.$t('Node.IP.BMC'),
          dataIndex: 'bmcIP',
          sorter: true,
          width: 150,
          scopedSlots: { customRender: 'bmcIP' },
        },
        {
          title: this.$t('Node.IP.OS'),
          dataIndex: 'osIP',
          sorter: true,
          width: 150,
        },
        {
          title: this.$t('Node.Hardware'),
          dataIndex: 'hardwore',
          scopedSlots: { customRender: 'hardware' },
        },
        {
          title: this.$t('Node.CustomGroup'),
          dataIndex: 'groups',
        },
        {
          title: this.$t('Action'),
          key: 'action',
          scopedSlots: { customRender: 'action' },
        },
      ],
      healthOptions: [
        {
          label: this.$t('Node.Health.Status.Ok'),
          status: 'ok',
        },
        {
          label: this.$t('Node.Health.Status.Warning'),
          status: 'warning',
        },
        {
          label: this.$t('Node.Health.Status.Critical'),
          status: 'critical',
        },
        {
          label: this.$t('Node.Health.Status.Failed'),
          status: 'failed',
        },
        {
          label: this.$t('Node.Health.Status.Unknown'),
          status: 'unknown',
        },
      ],
      healthValue: [],
      formatByteSize: Format.formatByteSize,
    }
  },
  created() {
    if (AccessService.getMatchFeatureCodes(['monitor.scheduler'], this.$store.state.auth.featureCodes).length > 0) {
      this.columns.splice(1, 0, {
        title: this.$t('Node.Status'),
        dataIndex: 'status',
        width: 100,
        align: 'left',
        scopedSlots: { customRender: 'status' },
      })
    }
  },
  methods: {
    showHardware(row, type) {
      if (type === 'cpuTotal') {
        return `${this.$t('Monitor.Cpu')}: ${row[type]}`
      } else if (type === 'ramTotal') {
        return `${this.$t('Monitor.Ram')}: ${Format.formatByteSize(row[type])}`
      } else if (type === 'diskTotal') {
        return `${this.$t('Monitor.Disk')}: ${Format.formatByteSize(row[type])}`
      } else if (type === 'gpus') {
        return `${this.$t('Monitor.Gpu')}: ${row[type].length}`
      }
    },
    columnFormatter(row, column) {
      if (column === 'hardware') {
        const items = []
        if (row.cpuTotal !== null) {
          items.push(row.cpuTotal + ' ' + this.$t('Unit.CPU'))
        }
        if (row.ramTotal !== null) {
          items.push(Format.formatByteSize(row.ramTotal))
        }
        if (row.gpus && row.gpus.length > 0) {
          items.push(row.gpus.length + ' ' + this.$t('Monitor.Gpu'))
        }
        return items.join(' / ')
      }
    },
    onActionCommand(command) {
      const fn = command.fn
      const argument = command.argument
      fn(argument)
    },
    onPowerOnCommand(command) {
      this.$refs.actionDialog.doPowerOn(command.node, command.nextDevice).then(
        res => {
          // Reload table data
          this.$refs.nodesTable.fetchTableData(false)
        },
        res => {
          // Do nothing
        },
      )
    },
    onMultiPowerOnCommand(command) {
      this.$refs.actionDialog.doMultiPowerOn(this.terminalData, this.selectedNodeId, command.nextDevice).then(
        res => {
          // Reload table data
          this.$refs.nodesTable.fetchTableData(false)
        },
        res => {
          // Do nothing
        },
      )
    },
    onPowerOffClick(node) {
      this.$refs.actionDialog.doPowerOff(node).then(
        res => {
          // Reload table data
          this.$refs.nodesTable.fetchTableData(false)
        },
        res => {
          // Do nothing
        },
      )
    },
    onMultiPowerOffClick() {
      this.$refs.actionDialog.doMultiPowerOff(this.terminalData, this.selectedNodeId).then(
        res => {
          // Reload table data
          this.$refs.nodesTable.fetchTableData(false)
        },
        res => {
          // Do nothing
        },
      )
    },
    onConsoleClick(node) {
      const nodes = [
        {
          hostname: node.hostname,
          type: 'console',
        },
      ]
      this.openWebTerminal(nodes)
    },
    onMultiConsoleClick() {
      const nodes = this.terminalData.map(node => ({
        hostname: node.hostname,
        type: 'console',
      }))
      this.openWebTerminal(nodes)
    },
    onShellClick(node) {
      const nodes = [
        {
          hostname: node.hostname,
          type: 'shell',
        },
      ]
      this.openWebTerminal(nodes)
    },
    onMultiShellClick() {
      const nodes = this.terminalData.map(node => ({
        hostname: node.hostname,
        type: 'shell',
      }))
      this.openWebTerminal(nodes)
    },
    onBMCClick(ip) {
      window.open('https://' + ip)
    },
    onTableSelectionChange(selection) {
      const _this = this
      _this.terminalData.length = 0
      _this.selectedNodeId = []
      selection.forEach((node, index) => {
        _this.selectedNodeId.push(node.hostname)
        _this.terminalData.push({
          hostname: node.hostname,
          number: index,
          onCloud: node.onCloud,
        })
      })
      if (_this.selectedNodeId.length > 0 && this.terminalData.filter(n => n.onCloud).length === 0) {
        _this.hasNoSelectedNode = false
      } else {
        _this.hasNoSelectedNode = true
      }
    },
    onDetailClick(node) {
      // if(!node.bmcIP) return
      this.$refs.detailDialog.showDetail(node.hostname)
    },
    filterHealth() {
      this.$set(this.nodeExternalFilter, 'health', {
        values: this.healthValue,
        type: 'in',
      })
    },
    resetHealthFilter() {
      this.$delete(this.nodeExternalFilter, 'health')
      this.healthValue = []
    },
    openWebTerminal(nodes) {
      const event = new Event('onMainToolsVisible')
      event.visible = true
      event.nodes = nodes
      window.dispatchEvent(event)
    },
  },
}
</script>
<style>
.node-table-hostname {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.el-dropdown__caret-button {
  line-height: 20px;
  font-size: 12px;
}
</style>
