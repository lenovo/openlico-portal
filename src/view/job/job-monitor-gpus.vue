<template>
  <div>
    <a-row v-if="nodes.length > 0">
      <a-col :lg="12" :md="12" :sm="24" :xs="24" style="display: flex">
        <a-radio-group
          id="tid_job-gpus-type"
          v-model="selected"
          style="margin-left: 20px"
          button-style="solid"
          @change="onViewTypeChange">
          <a-radio-button value="util"> {{ $t('NodeGpus.Tab.Title.Util') }}</a-radio-button>
          <a-radio-button value="memory"> {{ $t('NodeGpus.Tab.Title.Mem') }}</a-radio-button>
          <a-radio-button value="temperature"> {{ $t('NodeGpus.Tab.Title.Temp') }}</a-radio-button>
        </a-radio-group>
        <div v-if="arch == 'host'" class="gpu-used-label" style="">
          <div class="gpu-u-inner">
            <span class="gpu-u-pic gpu-inuse"></span>
            <span class="gpu-u-word">{{ $t('NodePanel.Gpu.Using') }}</span>
          </div>
          <div class="gpu-u-inner">
            <span class="gpu-u-pic gpu-busy"></span>
            <span class="gpu-u-word">{{ $t('NodePanel.Gpu.Used') }}</span>
          </div>
        </div>
      </a-col>
    </a-row>
    <gpu-monitor
      ref="gpuMonitor"
      :monitor-nodes="nodes"
      :value-type="selected"
      :page-offset="offset"
      :job="innerJob"
      :loading="false"
      @offset-change="onOffsetChange">
    </gpu-monitor>
  </div>
</template>

<script>
import MonitorService from '../../service/monitor-data'
import GpuMonitor from '../../widget/monitor-node-gpus'
import Access from '../../service/access'
export default {
  components: {
    'gpu-monitor': GpuMonitor,
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
      autoRefreshInterval: 15 * 1000,
      autoRefreshTimerId: 0,
      arch: Access.getSchedulerArch(),
      scheduler: Access.getScheduler(),
    }
  },
  watch: {
    job(val, oldVal) {
      // Job will auto refresh by parent page.
      this.innerJob = val
      if (this.innerJob.numberOfGpus > 0 && this.innerJob.status === 'running') {
        this.getGpuMonitor()
      }
    },
  },
  mounted() {
    if (this.innerJob.numberOfGpus > 0 && this.innerJob.status === 'running') {
      this.getGpuMonitor()
    }
  },
  methods: {
    getGpuMonitor() {
      const apiList = [
        MonitorService.getNodeGpuDataByJob(this.job.id, this.job.gpuExecHosts, this.selected, this.offset),
        MonitorService.getUsingGPUByJob(this.job.schedulerId),
      ]
      Promise.all(apiList).then(res => {
        let nodes = res[0].gpuData
        if (this.arch === 'host') {
          const usingNodes = res[1]
          nodes = nodes.map(node => {
            const usingResult = usingNodes[node.hostname]
            if (usingResult) {
              usingResult.forEach(item => {
                node.used[item] = 2
              })
            }
            return node
          })
        }
        this.nodes = nodes
        const offset = {
          total: res[0].total,
          pageSize: res[0].pageSize,
          currentPage: res[0].currentPage,
        }
        this.offset = offset
        this.$refs.gpuMonitor.onResize()
      })
    },
    onOffsetChange(offset) {
      this.offset = offset
      this.getGpuMonitor()
    },
    onViewTypeChange(val) {
      this.getGpuMonitor()
    },
    stringToNumberArr(val) {
      const arr = []
      val.forEach(str => {
        arr.push(Number(str))
      })
      return arr
    },
    autoResize() {
      if (this.$refs.gpuMonitor) {
        this.$refs.gpuMonitor.onResize()
      }
    },
  },
}
</script>

<style scoped>
.gpu-used-label {
  padding-top: 8px;
  margin-left: 10px;
  display: flex;
}
.gpu-u-inner {
  text-align: center;
  width: 64px;
  height: 20px;
  border-radius: 4px;
  margin-left: 5px;
  display: flex;
  padding: 4px 0;
}
.gpu-u-pic {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 4px;
  transform: translateY(10%);
}
.gpu-u-word {
  display: inline-block;
  font-size: 12px;
  transform: translateY(10%);
  height: 12px;
  line-height: 12px;
}
</style>
