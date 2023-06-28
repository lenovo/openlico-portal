<template>
  <div>
    <cpu-monitor
      ref="cpuMonitor"
      :monitor-nodes="nodes"
      :value-type="selected"
      :page-offset="offset"
      :job="job"
      @offset-change="onOffsetChange" />
  </div>
</template>

<script>
import MonitorService from '../../service/monitor-data'
import CpuMonitor from '../../widget/monitor-node-cpus'
export default {
  components: {
    'cpu-monitor': CpuMonitor,
  },
  props: ['job'],
  data() {
    return {
      innerJob: this.job,
      nodes: [],
      offset: {
        total: 0,
        pageSize: 24,
        currentPage: 1,
      },
      selected: 'util',
    }
  },
  watch: {
    job(val, oldVal) {
      // Job will auto refresh by parent page.
      this.innerJob = val
      if (this.innerJob.numberOfCpuCores > 0 && this.innerJob.status === 'running') {
        this.getCpuMonitor()
      }
    },
  },
  mounted() {
    if (this.innerJob.numberOfCpuCores > 0 && this.innerJob.status === 'running') {
      this.getCpuMonitor()
    }
  },
  methods: {
    getCpuMonitor() {
      MonitorService.getCpuDataByJob(this.job.execHosts, this.selected, this.offset).then(
        res => {
          this.nodes = res.cpuData
          this.offset = {
            total: res.total,
            pageSize: res.pageSize,
            currentPage: res.currentPage,
          }
          this.$refs.cpuMonitor.onResize()
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    onOffsetChange(offset) {
      this.offset = offset
      this.getCpuMonitor()
    },
    stringToNumberArr(val) {
      const arr = []
      val.forEach(str => {
        arr.push(Number(str))
      })
      return arr
    },
    autoResize() {
      if (this.$refs.cpuMonitor) {
        this.$refs.cpuMonitor.onResize()
      }
    },
  },
}
</script>

<style></style>
