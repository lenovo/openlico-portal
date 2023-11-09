<template>
  <span>
    <a-popover :title="node.hostname" width="200">
      <template #content>
        <p>{{ $t('Status') + ': ' + node.status }}</p>
        <div v-if="mode == 'network'">
          <p v-for="item in extra_property" :key="item">{{ item }}</p>
        </div>
        <p v-else>{{ extra_property }}</p>
        <p v-if="chassisName">
          {{ $t('Rack.Node.Chassis') + ': ' + chassisName }}
        </p>
        <p v-if="node.frontimage == 'default_1X.png'" style="color: #ffc107">
          {{ $T('Rack.Node.Machinetype.Error', { machineType: node.machinetype }) }}
        </p>
      </template>
      <template v-if="node_display">
        <span :style="{ width: '100%', height: '100%', display: 'block' }">
          <i class="node_status physical-node-status-icon" :class="`physical-node-status-${node.status}`" />
        </span>
      </template>
      <span v-if="!node_display" :style="{ width: '100%', height: '100%', background: node_color, display: 'block' }" />
    </a-popover>
  </span>
</template>

<script type="text/javascript">
export default {
  props: ['mode', 'nodetype', 'node', 'ranges', 'colors', 'chassisName'],
  data() {
    return {
      temp_range: this.ranges.temperature,
      energy_range: this.ranges.energy,
      load_range: this.ranges.load,
      cpu_range: this.ranges.cpu,
      mem_range: this.ranges.ram,
      storage_range: this.ranges.disk,
      network_range: this.ranges.network,
      node_color: '#BF444C',
      // node_display: false,
      extra_property: '',
      color_level: this.colors,
    }
  },
  computed: {
    node_display() {
      return this.mode === 'common'
    },
  },
  mounted() {
    this.set_node_color(this.mode, this.nodetype)
    this.$watch('mode', function (a, b) {
      this.set_node_color(this.mode, this.nodetype)
    })
  },
  methods: {
    set_node_color(mode, nodetype) {
      let index
      let i
      if (nodetype === 'switch') {
        this.node_color = '#FFFFFF'
        return
      }
      if (mode === 'temperature') {
        index = parseInt((this.node.temperature / this.temp_range[1]) * 10)
        i = 0
        index > this.color_level.length - 1 ? (i = this.color_level.length - 1) : (i = index)
        this.node_color = this.color_level[i]
        const temperature = this.node.temperature === null ? '-' : this.node.temperature + '℃\n'
        this.extra_property = this.$t('Monitor.Temp') + ': ' + temperature
      } else if (mode === 'energy') {
        if (parseInt(this.node.energy) >= parseInt(this.energy_range[1])) {
          this.energy_range[1] = parseInt(this.node.energy) + 500
        }
        index = parseInt((this.node.energy / this.energy_range[1]) * 10)
        i = 0
        index > this.color_level.length - 1 ? (i = this.color_level.length - 1) : (i = index)
        this.node_color = this.color_level[i]
        const energy = this.node.energy === null ? '-' : this.node.energy + 'W\n'
        this.extra_property = this.$t('Monitor.Ene') + ': ' + energy
      } else if (mode === 'load') {
        index = parseInt((this.node.load / this.load_range[1]) * 10)
        i = 0
        index > this.color_level.length - 1 ? (i = this.color_level.length - 1) : (i = index)
        this.node_color = this.color_level[i]
        const load = this.node.load === null ? '-' : this.node.load + '\n'
        this.extra_property = this.$t('Monitor.Load') + ': ' + load
      } else if (mode === 'cpu') {
        index = parseInt((this.node.cpuUsed / this.cpu_range[1]) * 10)
        i = 0
        index > this.color_level.length - 1 ? (i = this.color_level.length - 1) : (i = index)
        this.node_color = this.color_level[i]
        const cpu = this.node.cpuUsed === null ? '-' : this.node.cpuUsed + '%\n'
        this.extra_property = this.$t('Monitor.Cpu') + ': ' + cpu
      } else if (mode === 'ram') {
        index = parseInt((this.node.memoryUsed / this.mem_range[1]) * 10)
        i = 0
        index > this.color_level.length - 1 ? (i = this.color_level.length - 1) : (i = index)
        this.node_color = this.color_level[i]
        const ram = this.node.memoryUsed === null ? '-' : this.node.memoryUsed + '%\n'
        this.extra_property = this.$t('Monitor.Ram') + ': ' + ram
      } else if (mode === 'disk') {
        index = parseInt((this.node.diskUsed / this.storage_range[1]) * 10)
        i = 0
        index > this.color_level.length - 1 ? (i = this.color_level.length - 1) : (i = index)
        this.node_color = this.color_level[i]
        this.extra_property = this.$t('Monitor.Disk') + ': ' + this.node.diskUsed + '%\n'
      } else if (mode === 'network') {
        // var raw_string = this.node.network;
        // var raw_list = raw_string.split(",");
        const rawList = this.node.network
        const network = rawList.reduce((a, b, c, d) => parseInt(a) + parseInt(b) + parseInt(c) + parseInt(d), 0)
        index = parseInt((network / this.network_range[1]) * 10)
        i = 0
        index > this.color_level.length - 1 ? (i = this.color_level.length - 1) : (i = index)
        this.node_color = this.color_level[i]
        this.extra_property = [
          `${this.$t('Monitor.Eth')} ${this.$t('Monitor.Net.In')}: ${rawList[0]}${this.$t('Monitor.Eth.Unit')}`,
          `${this.$t('Monitor.Eth')} ${this.$t('Monitor.Net.Out')}: ${rawList[1]}${this.$t('Monitor.Eth.Unit')}`,
          `${this.$t('Monitor.IB')} ${this.$t('Monitor.Net.In')}: ${rawList[2]}${this.$t('Monitor.IB.Unit')}`,
          `${this.$t('Monitor.IB')} ${this.$t('Monitor.Net.Out')}: ${rawList[3]}${this.$t('Monitor.IB.Unit')}`,
        ]
      }
    },
  },
}
</script>

<style media="screen">
.node_status {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  left: 2px;
  z-index: 2;
}
.physical-node-status-icon {
  top: 6px;
  display: block;
}
.physical-node-status-on {
  background-color: greenyellow;
}
.physical-node-status-off {
  background-color: red;
}
</style>
