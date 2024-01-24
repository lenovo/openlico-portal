<template>
  <div v-if="innerNode != null" id="tid_node-panel" class="node-detail-panel">
    <a-row class="node-panel-top">
      <a-col :span="12">
        <span style="font-size: 14px; line-height: 22px">{{ innerNode.hostname }}</span>
        <node-status-label v-if="isScheduler" id="tid_node-panel-status" :status="innerNode.status" />
        <alert-policy-level-label
          id="tid_node-panel-alert-level"
          :level="innerNode.alertPolicyLevel"
          style="margin-left: 10px" />
      </a-col>
      <a-col :span="12" align="right">
        <i v-if="arch == 'host' && isScheduler && nodesState" class="el-erp-scheduler el-icon--right" />
        {{ isScheduler ? nodesState : '' }}
        <a-dropdown
          id="tid_nodes-multi-power-on"
          style="margin-right: 10px"
          placement="bottomRight"
          :trigger="['click']">
          <a-button :disabled="innerNode.disabled">
            {{ $t('Action') }}
            <down-outlined />
          </a-button>
          <template #overlay>
            <a-menu style="width: 150px">
              <a-menu-item v-if="innerNode.powerStatus === false" id="tid_node-panel-power-on" @click="onPowerOnClick">
                {{ $t('Node.Action.PowerOn') }}
              </a-menu-item>
              <a-menu-item v-if="innerNode.powerStatus === true" id="tid_node-panel-power-off" @click="onPowerOffClick">
                {{ $t('Node.Action.PowerOff') }}
              </a-menu-item>
              <a-menu-item id="tid_node-panel-console" @click="onConsoleClick">
                {{ $t('Node.RemoteAccess.Console') }}
              </a-menu-item>
              <a-menu-item id="tid_node-panel-Shell" @click="onShellClick">
                {{ $t('Node.RemoteAccess.Shell') }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="24">
        <div class="border-1px">
          <node-hardware id="tid_node-panel-hardware" :node="innerNode" />
        </div>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="24">
        <a-tabs id="tid_node-panel-tabs" v-model:activeKey="nodeMonitorTab" :animated="false">
          <a-tab-pane key="nodeMonitorMonitor" :tab="$t('NodePanel.Monitor')">
            <node-monitor
              id="tid_node-panel-monitor"
              ref="nodeMonitorMonitor"
              :node-id="innerNode.id"
              :node="innerNode" />
          </a-tab-pane>
          <a-tab-pane v-if="innerNode.gpus.length > 0" key="nodeMonitorGpu" :tab="$t('Monitor.Gpu')">
            <node-gpu v-if="innerNode.gpus.length > 0" id="tid_node-panel-gpu" ref="nodeMonitorGpu" :node="innerNode" />
          </a-tab-pane>
          <a-tab-pane key="nodeMonitorAlarm" :tab="$t('NodePanel.Alert')">
            <node-alert id="tid_node-panel-alarm" :node="innerNode" />
          </a-tab-pane>
          <a-tab-pane v-if="isScheduler" key="nodeMonitorJob" :tab="$t('Monitor.Job')">
            <node-job
              id="tid_node-panel-job"
              :node-id="innerNode.hostname"
              :is-gpus="Boolean(innerNode.gpus.length)"
              @view-process="ViewProcess" />
          </a-tab-pane>
          <a-tab-pane v-if="arch == 'host' && isScheduler" key="nodeMonitorProcess" :tab="$t('Monitor.Process')">
            <node-process
              id="tid_node-panel-process"
              ref="nodeMonitorProcess"
              :is-gpus="Boolean(innerNode.gpus.length)"
              :node-id="innerNode.hostname" />
          </a-tab-pane>
          <a-tab-pane key="nodeMonitorHealth" :tab="$t('NodePanel.Health')">
            <node-health id="tid_node-panel-health" :node-id="innerNode.hostname" />
          </a-tab-pane>
          <a-tab-pane key="nodeMonitorInfo" :tab="$t('NodePanel.Information')">
            <node-information id="tid_node-panel-information" :node="innerNode" />
          </a-tab-pane>
        </a-tabs>
      </a-col>
    </a-row>
    <node-action-dialog id="tid_node-panel-action-dialog" ref="actionDialog" />
  </div>
</template>
<script>
import NodeHardware from './node-panel/node-hardware.vue'
import NodeStatusLabel from './nodes-table/node-status-label.vue'
import AlertPolicyLevelLabel from './alert-policy-level-label.vue'
import NodeMonitor from './node-panel/node-monitor.vue'
import NodeGpu from './node-panel/node-gpu.vue'
import NodeAlert from './node-panel/node-alert.vue'
import NodeJob from './node-panel/node-job.vue'
import NodeHealth from './node-panel/node-health.vue'
import NodeProcess from './node-panel/node-process.vue'
import NodeInformation from './node-panel/node-information.vue'
import NodeActionDialog from './nodes-table/node-action-dialog.vue'
import NodeService from '@/service/node'
import AccessService from '@/service/access'

export default {
  components: {
    'node-hardware': NodeHardware,
    'node-status-label': NodeStatusLabel,
    'alert-policy-level-label': AlertPolicyLevelLabel,
    'node-monitor': NodeMonitor,
    'node-gpu': NodeGpu,
    'node-alert': NodeAlert,
    'node-job': NodeJob,
    'node-health': NodeHealth,
    'node-process': NodeProcess,
    'node-information': NodeInformation,
    'node-action-dialog': NodeActionDialog,
  },
  props: ['nodeName'],
  data() {
    return {
      innerNode: null,
      innerNodeName: this.nodeName,
      interval: 1000 * 30,
      nodeMonitorTab: 'nodeMonitorMonitor',
      timerId: 0,
      arch: AccessService.getSchedulerArch(),
      nodesState: '',
    }
  },
  computed: {
    isScheduler() {
      return (
        AccessService.getMatchFeatureCodes(['sc.host.*,monitor.scheduler'], this.$store.state.auth.featureCodes)
          .length > 0
      )
    },
  },
  watch: {
    nodeName: {
      handler: function (val, oldVal) {
        this.innerNodeName = val
        this.innerNode = null
        clearTimeout(this.timerId)
        this.refresh()
      },
      immediate: true,
    },
    nodeMonitorTab(val, oldVal) {
      if (val === 'nodeMonitorMonitor') {
        this.$nextTick(() => {
          this.$refs.nodeMonitorMonitor.resizeChart()
        })
      } else if (val === 'nodeMonitorGpu') {
        this.$nextTick(() => {
          this.$refs.nodeMonitorGpu.resizeChart()
        })
      }
    },
  },
  // mounted() {
  //   this.refresh()
  // },
  unmounted() {
    this.innerNodeName = ''
    clearTimeout(this.timerId)
    this.timerId = null
  },
  methods: {
    refresh() {
      clearTimeout(this.timerId)
      if (this.innerNodeName && !this._isDestroyed) {
        NodeService.getNodeByName(this.innerNodeName).then(
          res => {
            this.innerNode = res
            this.innerNodeName = res.hostname
            const self = this
            this.timerId = setTimeout(() => {
              self.refresh()
            }, this.interval)
          },
          res => {
            this.$message.error(res)
          },
        )
      }
    },
    onPowerOnClick() {
      this.$refs.actionDialog.doPowerOn(this.innerNode).then(
        res => {
          // Reload table data
          this.$refs.nodesTable.fetchTableData(false)
        },
        res => {
          // Do nothing
        },
      )
    },
    onPowerOffClick() {
      this.$refs.actionDialog.doPowerOff(this.innerNode).then(
        res => {
          // Reload table data
          this.$refs.nodesTable.fetchTableData(false)
        },
        res => {
          // Do nothing
        },
      )
    },
    onConsoleClick() {
      this.openTerminal([
        {
          hostname: this.innerNode.hostname,
          type: 'console',
        },
      ])
    },
    onShellClick() {
      this.openTerminal([
        {
          hostname: this.innerNode.hostname,
          type: 'shell',
        },
      ])
    },
    ViewProcess(job) {
      this.nodeMonitorTab = 'nodeMonitorProcess'
      this.$nextTick(() => {
        this.$refs.nodeMonitorProcess.selectedSchedulerIds = [job.schedulerId]
        this.$refs.nodeMonitorProcess.filterSchedulerId([job.schedulerId])
      })
    },
    openTerminal(nodes) {
      const event = new Event('onMainToolsVisible')
      event.nodes = nodes
      event.visible = true
      window.dispatchEvent(event)
    },
  },
}
</script>
<style scoped>
.border-1px {
  border: 1px solid #eee;
}
.node-panel-top {
  font-size: 16px;
  margin-bottom: 20px;
}
.actte {
  height: 20px;
}
.node-detail-panel .composite-table {
  padding-top: 0;
}
#tid_node-panel-monitor :deep(.composite-table),
#tid_node-panel-alarm :deep(.composite-table),
#tid_node-panel-job :deep(.composite-table),
#tid_node-panel-health :deep(.composite-table),
#tid_node-panel-process :deep(.composite-table) {
  padding: 0;
}
#tid_node-panel-status {
  margin-left: 10px;
}
.node-panel-top #tid_node-panel-status,
.node-panel-top #tid_node-panel-alert-level {
  font-size: 14px;
}
.node-detail-panel :deep(.composite-table) {
  padding: 0;
}
</style>
