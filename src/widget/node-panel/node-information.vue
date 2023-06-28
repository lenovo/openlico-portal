<template>
  <div>
    <a-row type="flex" class="node-information-line">
      <a-col class="node-information-item-name width200">
        <span>{{ $t('Node.Type') }}</span>
      </a-col>
      <a-col class="node-information-item-value">
        <span>{{ node.type }}</span>
      </a-col>
    </a-row>
    <a-row type="flex" class="node-information-line">
      <a-col class="node-information-item-name width200">
        <span>{{ $t('Node.IP.BMC') }}</span>
      </a-col>
      <a-col class="node-information-item-value">
        <span>{{ node.bmcIP }}</span>
      </a-col>
    </a-row>
    <a-row type="flex" class="node-information-line">
      <a-col class="node-information-item-name width200">
        <span>{{ $t('Node.IP.OS') }}</span>
      </a-col>
      <a-col class="node-information-item-value">
        <span>{{ node.osIP }}</span>
      </a-col>
    </a-row>
    <a-row type="flex" class="node-information-line">
      <a-col class="node-information-item-name width200">
        <span>{{ $t('Node.CustomGroup') }}</span>
      </a-col>
      <a-col class="node-information-item-value">
        <span>{{ node.groups }}</span>
      </a-col>
    </a-row>
    <a-row type="flex" class="node-information-line">
      <a-col class="node-information-item-name width200">
        <span>{{ $t('Node.MachineType') }}</span>
      </a-col>
      <a-col class="node-information-item-value">
        <span>{{ node.machineType }}</span>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import Format from '../../common/format'
export default {
  props: ['node'],
  data() {
    return {}
  },
  methods: {
    init() {
      this.cpuStatus = {
        total: this.node.cpuTotal,
        used: 0,
        rate: parseInt((0 / this.node.cpuTotal) * 100),
      }
      this.memoryStatus = {
        total: Format.formatByteSize(this.node.ramTotal),
        used: Format.formatByteSize(this.node.ramUsed),
        rate: parseInt((this.node.ramUsed / this.node.ramTotal) * 100),
      }
      this.diskStatus = {
        total: Format.formatByteSize(this.node.diskTotal),
        used: Format.formatByteSize(this.node.diskUsed),
        rate: parseInt((this.node.diskUsed / this.node.diskTotal) * 100),
      }
    },
    format(number) {
      return Format.formatCount(number)
    },
  },
}
</script>
<style scoped>
.node-information-line span {
  height: 36px;
  line-height: 36px;
}
.width200 {
  width: 200px;
}
</style>
