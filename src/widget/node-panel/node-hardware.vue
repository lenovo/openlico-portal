<template>
  <a-row v-if="node" class="node-panel">
    <a-col :lg="6" :md="8" :sm="24" :xs="24">
      <div class="node-panel-div">
        <div class="node-panel-div-icon">
          <span class="cpuStatus-icon">
            <i class="el-erp-cpu" />
          </span>
        </div>
        <ul>
          <li class="cell-left">
            <span class="cell-title">{{ $t('Monitor.Cpu') }}</span>
            <span class="cell-logo logo-cpu" />
          </li>
          <li class="cell-right">
            <span class="cell-content">
              {{ node.cpuTotal !== null ? `${node.cpuTotal} ${$t('Unit.CPU')}` : '-' }}
            </span>
          </li>
        </ul>
      </div>
    </a-col>

    <a-col v-if="node.gpuTotal > 0" :lg="6" :md="8" :sm="24" :xs="24">
      <div class="node-panel-div">
        <div class="node-panel-div-icon">
          <span class="cpuStatus-icon">
            <i class="el-erp-GPU" />
          </span>
        </div>
        <ul>
          <li class="cell-left">
            <span class="cell-title">{{ $t('Monitor.Gpu') }}</span>
            <span class="cell-logo logo-cpu" />
          </li>
          <li class="cell-right">
            <span class="cell-content">
              {{ `${node.gpuTotal} ${$t('Unit.GPU')}` }}
            </span>
          </li>
        </ul>
      </div>
    </a-col>

    <a-col :lg="6" :md="8" :sm="24" :xs="24">
      <div class="node-panel-div">
        <div class="node-panel-div-icon">
          <span class="cpuStatus-icon">
            <i class="el-erp-memory" />
          </span>
        </div>
        <ul>
          <li class="cell-left">
            <span class="cell-title">{{ $t('Monitor.Ram') }}</span>
            <span class="cell-logo logo-ram" />
          </li>
          <li class="cell-right">
            <span class="cell-content">
              {{ getDisplay(node.ramUsed, node.ramTotal) }}
            </span>
          </li>
        </ul>
      </div>
    </a-col>
    <a-col :lg="6" :md="8" :sm="24" :xs="24">
      <div class="node-panel-div">
        <div class="node-panel-div-icon">
          <span class="cpuStatus-icon">
            <i class="el-erp-storage" />
          </span>
        </div>
        <ul>
          <li class="cell-left">
            <span class="cell-title">{{ $t('Monitor.Disk') }}</span>
            <span class="cell-logo logo-disk" />
          </li>
          <li class="cell-right">
            <span class="cell-content">
              {{ getDisplay(node.diskUsed, node.diskTotal) }}
            </span>
          </li>
        </ul>
      </div>
    </a-col>
  </a-row>
</template>
<script>
import Format from '@/common/format'
export default {
  props: ['node'],
  methods: {
    getDisplay(used, total) {
      let u = '-'
      let t = '-'
      if (used !== null) u = Format.formatByteSize(used)
      if (total !== null) t = Format.formatByteSize(total)
      return `${u} / ${t}`
    },
  },
}
</script>
<style scoped>
.node-panel .cell span {
  display: block;
}
.node-panel .cell {
  background: #fff;
  padding: 20px;
}
.node-panel .cell li span:first-child {
  margin-bottom: 20px;
}
.node-panel .cell .cell-left {
  width: 120px;
}
.node-panel .cell .cell-right {
  width: 100%;
}
.node-panel .cell .cell-right span {
  text-align: right;
}
.cpuStatus-icon {
  display: block;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #5fb4f9;
  position: relative;
  line-height: 30px;
}
.cpuStatus-icon i {
  color: #fff;
  position: absolute;
  left: 5px;
  font-size: 20px;
}

.node-panel-div {
  display: flex;
  padding: 20px 10px;
  align-items: center;
  height: 100px;
  box-sizing: border-box;
}
.node-panel-div-icon {
  width: 25%;
}
.cell-right {
  margin-top: 10px;
}
</style>
