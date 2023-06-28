<template>
  <div>
    <a-select v-model="selectedTimeDefalut" style="margin-bottom: 20px" @change="onTrendTimeIntervalChange">
      <a-select-option v-for="item in selectTimeOptions" :key="item.value" :value="item.value">
        {{ $t('Time.Select.' + item.label) }}
      </a-select-option>
    </a-select>
    <a-row :gutter="10">
      <a-col :lg="8" :md="12" :sm="24" :xs="24" class="col-style">
        <node-cpu-chart
          id="tid_node-monitor-cpu-chart"
          ref="chartCpu"
          :node-id="node.hostname"
          :interval="30 * 1000"
          :init-data="DataFun"
          :format-time="formatTime" />
      </a-col>
      <a-col :lg="8" :md="12" :sm="24" :xs="24" class="col-style">
        <node-load-chart
          id="tid_node-monitor-load-chart"
          ref="chartLoad"
          :node-id="node.hostname"
          :interval="30 * 1000"
          :init-data="DataFun"
          :format-time="formatTime" />
      </a-col>
      <a-col :lg="8" :md="12" :sm="24" :xs="24" class="col-style">
        <node-temperature-chart
          id="tid_node-monitor-temperature-chart"
          ref="chartTemp"
          :node-id="node.hostname"
          :interval="30 * 1000"
          :init-data="DataFun"
          :format-time="formatTime" />
      </a-col>
      <a-col :lg="8" :md="12" :sm="24" :xs="24" class="col-style">
        <node-energy-chart
          id="tid_node-monitor-energy-chart"
          ref="chartEnergy"
          :node-id="node.hostname"
          :interval="30 * 1000"
          :init-data="DataFun"
          :format-time="formatTime" />
      </a-col>
      <a-col :lg="8" :md="12" :sm="24" :xs="24" class="col-style">
        <node-ram-chart
          id="tid_node-monitor-ram-chart"
          ref="chartRam"
          :node-id="node.hostname"
          :interval="30 * 1000"
          :init-data="DataFun"
          :format-time="formatTime" />
      </a-col>
      <a-col :lg="8" :md="12" :sm="24" :xs="24" class="col-style">
        <node-eth-chart
          id="tid_node-monitor-network-chart"
          ref="chartNetwork"
          :node-id="node.hostname"
          :interval="30 * 1000"
          :init-data="DataFun"
          :format-time="formatTime" />
      </a-col>
      <a-col :lg="8" :md="12" :sm="24" :xs="24" class="col-style">
        <node-ib-chart
          id="tid_node-monitor-network-chart"
          ref="chartIB"
          :node-id="node.hostname"
          :interval="30 * 1000"
          :init-data="DataFun"
          :format-time="formatTime" />
      </a-col>
      <a-col :lg="8" :md="12" :sm="24" :xs="24" class="col-style">
        <node-disk-chart id="tid_node-monitor-disk-chart" ref="chartDisk" :node="node" />
      </a-col>
    </a-row>
  </div>
</template>
<script>
import Format from '../../common/format'
import MonitorDataService from '../../service/monitor-data'
import NodeCpuChart from './node-monitor/node-cpu-chart'
import NodeLoadChart from './node-monitor/node-load-chart'
import NodeTemperatureChart from './node-monitor/node-temperature-chart'
import NodeEnergyChart from './node-monitor/node-energy-chart'
import NodeRamChart from './node-monitor/node-ram-chart'
import NodeEthChart from './node-monitor/node-eth-chart'
import NodeIBChart from './node-monitor/node-ib-chart'
import NodeDiskChart from './node-monitor/node-disk-chart'
export default {
  components: {
    'node-cpu-chart': NodeCpuChart,
    'node-load-chart': NodeLoadChart,
    'node-temperature-chart': NodeTemperatureChart,
    'node-energy-chart': NodeEnergyChart,
    'node-ram-chart': NodeRamChart,
    'node-eth-chart': NodeEthChart,
    'node-ib-chart': NodeIBChart,
    'node-disk-chart': NodeDiskChart,
  },
  props: ['nodeId', 'node'],
  data() {
    return {
      selectedTimeDefalut: 3600,
      initTime: 3600,
      selectTimeOptions: [
        { label: 'Hour', value: 3600 },
        { label: 'Day', value: 3600 * 24 },
        { label: 'Week', value: 3600 * 24 * 7 },
        { label: 'Month', value: 3600 * 24 * 30 },
      ],
    }
  },
  computed: {
    DataFun() {
      const dataFunctions = {
        3600: MonitorDataService.getNodeDataByHour,
        86400: MonitorDataService.getNodeDataByDay,
        604800: MonitorDataService.getNodeDataByWeek,
        2592000: MonitorDataService.getNodeDataByMonth,
      }

      return dataFunctions[this.initTime] || MonitorDataService.getNodeDataByHour
    },
  },
  methods: {
    resizeChart() {
      this.$refs.chartDisk.resizeChart()
      this.$refs.chartNetwork.resizeChart()
      this.$refs.chartRam.resizeChart()
      this.$refs.chartEnergy.resizeChart()
      this.$refs.chartTemp.resizeChart()
      this.$refs.chartCpu.resizeChart()
      this.$refs.chartLoad.resizeChart()
      this.$refs.chartIB.resizeChart()
    },

    onTrendTimeIntervalChange(val) {
      this.initTime = val
    },
    formatTime(val) {
      if (this.initTime === 3600 || this.initTime === 86400) {
        return ' ' + Format.formatDateTime(new Date(val), 'hh:mm')
      }
      if (this.initTime === 604800 || this.initTime === 2592000) {
        return ' ' + Format.formatDateTime(new Date(val), 'MM-dd')
      }
    },
  },
}
</script>
<style scoped>
.col-style {
  height: 200px;
  /*width: 32%;
     border: 1px solid #eee;
    margin-left: 1%; */
  margin-bottom: 10px;
}
.node-monitor-chart-style {
  width: 100%;
  height: 100%;
  border: 1px solid #eee;
  box-sizing: border-box;
}
</style>
