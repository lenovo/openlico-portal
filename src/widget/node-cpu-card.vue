<template>
  <a-spin :spinning="current == null">
    <div class="node-cpu-card" style="height: 180px">
      <div class="node-cpu-card-header">
        <div class="node-cpu-card-title" :title="node.name">
          {{ node.name }}
        </div>
        <div class="node-cpu-card-value">
          {{ value }}
        </div>
      </div>
      <div v-show="data.length > 0" class="node-cpu-card-content">
        <node-cpu-line ref="nodeCpuLine" :node="node" :data="data" />
      </div>
    </div>
  </a-spin>
</template>

<script type="text/javascript">
import NodeCpuLine from './node-cpu-card/node-cpu-card-line'
import MonitorService from './../service/monitor-data'

export default {
  components: {
    NodeCpuLine,
  },
  props: ['node', 'valueType', 'job'],
  data() {
    const pods = MonitorService.execHostsDecode(this.job.execHosts)
    return {
      current: null,
      data: [],
      resourceCount: pods.filter(i => i.pod === this.node.name)[0].RC,
    }
  },
  computed: {
    value() {
      if (isNaN(this.current) || this.current === null) {
        return '-'
      }
      return this.current + this.$t('Monitor.Cpu.Unit')
    },
  },
  watch: {
    node(val, oldVal) {
      this.getChartData()
    },
  },
  mounted() {
    this.getChartData()
  },
  methods: {
    onResize() {
      this.$nextTick(() => {
        // this.$refs.nodeCpuBar.onResize();
        this.$refs.nodeCpuLine.onResize()
      })
    },
    getChartData() {
      MonitorService.getCpuDataByPod(this.job.id, this.node.name, this.valueType).then(
        res => {
          this.current = (res.current / this.resourceCount / 10).toFixed(0)
          this.data = res.data.filter(item => {
            const jobBeginTime = new Date(this.job.beginTime).getTime()
            const time = new Date(item.time).getTime()
            if (jobBeginTime <= time) {
              item.values = item.values.map(i => {
                const val = i / this.resourceCount / 10
                return val > 100 ? 100 : val.toFixed(1)
              })
              return true
            } else {
              return false
            }
          })
        },
        err => {
          this.$message.error(err)
        },
      )
    },
  },
}
</script>

<style>
.node-cpu-card {
  width: 100%;
  height: 100%;
  border: 1px solid #eee;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.node-cpu-card-header {
  height: 40px;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
}
.node-cpu-card-title {
  width: 100%;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.node-cpu-card-value {
  height: 100%;
  width: 100px;
  color: #44acff;
  text-align: right;
}
.node-cpu-card-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
}
</style>
