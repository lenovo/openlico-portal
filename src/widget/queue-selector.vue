<template>
  <div class="container jobtemplate-queue-selector">
    <a-select
      v-if="itemsList.includes('select')"
      v-model="innerValue"
      class="queue-selector m-r-10"
      :style="selectStyle"
      @change="onSelectChange">
      <a-select-option v-for="(item, index) in queueOptions" :key="index" :value="item.value"
        >{{ item.label }}
      </a-select-option>
    </a-select>
    <div v-if="itemsList.includes('info') && scheduler == 'slurm' && resourceShow()" class="queue-resource">
      <ul class="maxresourse">
        <li v-show="resourceShow('state')" class="state"><i class="el-erp-state"></i>&nbsp;{{ state }}</li>
        <a-tooltip>
          <template slot="title">
            <p>{{ $t('Queue.Resource.Total', { value: nodes }) }}</p>
          </template>
          <li v-show="resourceShow('nodes')" class="nodes"><i class="el-erp-monitor_node"></i>&nbsp;{{ nodes }}</li>
        </a-tooltip>
        <a-tooltip>
          <template slot="title">
            <p>{{ $t('Queue.Resource.Free', { value: cores.free }) }}</p>
            <p>{{ $t('Queue.Resource.Total', { value: cores.total }) }}</p>
          </template>
          <li v-show="resourceShow('cores')" class="cores">
            <i class="el-erp-cpu"></i>&nbsp;{{ scheduler == 'slurm' ? cores.free : cores.total }}
          </li>
        </a-tooltip>
        <a-tooltip>
          <template slot="title">
            <div class="gpu-type-item">
              <span>{{ $t('Queue.Resource.GPU.Type') }}</span>
              <span>{{ $t('Queue.Resource.GPU.Free') + '/' + $t('Queue.Resource.GPU.Total') }}</span>
            </div>
            <div v-for="item in gpu.options" :key="item.type" class="gpu-type-item">
              <span>{{ item.type }}</span>
              <span>{{ item.free + '/' + item.total }}</span>
            </div>
          </template>
          <li v-show="resourceShow('gpus')" class="gpus">
            <i class="el-erp-GPU"></i>&nbsp;{{ scheduler == 'slurm' ? gpu.free : gpu.total }}
          </li>
        </a-tooltip>
        <li v-show="resourceShow('memory')" class="memory"><i class="el-erp-memory"></i>&nbsp;{{ memory }}</li>
        <li v-show="resourceShow('walltime')" class="walltime"><i class="el-erp-time"></i>&nbsp;{{ wallTime }}</li>
      </ul>
    </div>
  </div>
</template>
<script>
import QueueService from '../service/queue'
import AccessService from '../service/access'

export default {
  props: {
    value: {
      type: String,
      default: function () {
        return ''
      },
    },
    itemsList: {
      type: Array,
      default: function () {
        return ['select', 'info']
      },
    },
    infoList: {
      type: Array,
      default: undefined,
    },
    selectStyle: {
      type: String,
      default: function () {
        return ''
      },
    },
  },
  data() {
    return {
      innerValue: this.value,
      queueOptions: [],
      refreshId: null,
      scheduler: AccessService.getScheduler(),
    }
  },
  computed: {
    queue: function () {
      return this.queueOptions.filter(q => q.value === this.value)[0]
    },
    state: function () {
      let state = ''
      if (this.queue) {
        state = this.queue.state
      }
      return state
    },
    nodes: function () {
      let nodes = ''
      if (this.queue) {
        nodes =
          this.queue.maxNodes === 'UNLIMITED' && this.queue.totalNodes === 'UNLIMITED'
            ? 'UNLIMITED'
            : this.queue.maxNodes === 'UNLIMITED'
            ? this.queue.totalNodes + ' nodes'
            : this.queue.maxNodes + ' nodes'
      }
      return nodes
    },
    cores: function () {
      let free = ''
      let total = ''
      if (this.queue) {
        total =
          this.queue.maxCoresPerNode === 'UNLIMITED' && this.queue.totalCores === 'UNLIMITED'
            ? 'UNLIMITED'
            : this.queue.maxCoresPerNode === 'UNLIMITED'
            ? this.queue.totalCores + ' cores'
            : parseInt(this.nodes) * this.queue.maxCoresPerNode + ' cores'

        free = this.queue.freeCores + ' cores'
      }
      return { free, total }
    },
    gpu: function () {
      let free = ''
      let total = ''
      let options = []
      if (this.queue) {
        total = this.queue.gpuNum + ' GPU'
        free = this.queue.freeGpu + ' GPU'
        options = this.queue.gpuOptions.map(item => {
          if (item.type === 'G/gpu') {
            item.type = '-'
          }
          return item
        })
      }
      return { free, total, options }
    },
    memory: function () {
      let memory = ''
      if (this.queue) {
        memory =
          this.queue.maxMemoryPerNode === 'UNLIMITED' && this.queue.defineMemoryPerNode === 'UNLIMITED'
            ? 'UNLIMITED'
            : this.queue.maxMemoryPerNode === 'UNLIMITED'
            ? this.queue.defineMemoryPerNode + ' / ' + this.queue.defineMemoryPerNode + ' MB'
            : this.queue.defineMemoryPerNode === 'UNLIMITED'
            ? this.queue.maxMemoryPerNode + ' MB' + ' / ' + this.queue.defineMemoryPerNode
            : this.queue.maxMemoryPerNode + ' / ' + this.queue.defineMemoryPerNode + ' MB'
      }
      return memory
    },
    wallTime: function () {
      let wallTime = ''
      if (this.queue) {
        wallTime = this.queue.walltime
      }
      return wallTime
    },
  },
  mounted() {
    this.getQueueOptions()
  },
  beforeDestroy() {
    clearTimeout(this.refreshId)
  },
  methods: {
    getQueueOptions() {
      QueueService.getAllQueues().then(res => {
        const options = res.map(queue => {
          return {
            state: queue.state,
            value: queue.name,
            label: queue.name,
            totalCores: queue.totalCores,
            freeCores: queue.freeCores,
            gpuNum: queue.gpuNum,
            freeGpu: queue.freeGpu,
            totalNodes: queue.totalNodes,
            maxNodes: queue.maxNodes,
            maxCoresPerNode: queue.maxCoresPerNode,
            defineMemoryPerNode: queue.defineMemoryPerNode,
            maxMemoryPerNode: queue.maxMemoryPerNode,
            walltime: queue.walltime,
            gpuOptions: queue.gpuOptions,
          }
        })
        this.queueOptions = options
        if (this.queueOptions.length > 0 && !this.value) {
          this.innerValue = this.queueOptions[0].value
          this.$emit('input', this.queueOptions[0].value)
        }
        this.refreshId = setTimeout(this.getQueueOptions.bind(this), 300000)
      })
    },
    resourceShow(type) {
      if (!type) {
        return this.nodes !== '' || this.cores !== '' || this.gpu !== '' || this.memory !== '' || this.wallTime !== ''
      }
      if (!this.infoList || this.infoList.indexOf(type) !== -1) {
        if (type === 'gpus') {
          return this.gpu.total.split(' ')[0] > 0
        } else {
          return true
        }
      } else {
        return false
      }
    },
    onSelectChange(val) {
      this.$emit('input', val)
    },
  },
}
</script>

<style scoped>
.maxresourse {
  border-radius: 4px;
  display: flex;
  background: rgba(248, 248, 248, 1);
  line-height: 32px;
}
.maxresourse li {
  margin-right: 20px;
  color: rgba(153, 153, 153, 1);
  white-space: nowrap;
}
.state {
  margin-left: 20px;
}
.container,
.queue-selector,
.queue-resource {
  display: inline-block;
}
.queue-resource-popover {
  border: 1px solid #dcdfe6;
}
.jobtemplate-queue-selector >>> .gpu-type-item {
  display: flex;
}
.jobtemplate-queue-selector >>> .gpu-type-item span {
  display: inline-block;
  white-space: nowrap;
}
.jobtemplate-queue-selector >>> .gpu-type-item span:first-child {
  min-width: 70px;
  width: 100%;
}
.jobtemplate-queue-selector >>> .gpu-type-item span:last-child {
  text-align: end;
  width: 100%;
  padding-left: 10px;
}
</style>
