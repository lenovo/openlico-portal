<template>
  <div class="height--100 gpus-view p-10">
    <div class="MonitorGroupAction p-20">
      <a-select
        id="tid_monitor-groups-group"
        v-model:value="nodeGroupId"
        style="min-width: 100px"
        :disabled="loading"
        @change="onNodeGroupChange">
        <a-select-option v-for="group in nodeGroups" :key="group.id" :value="group.name">
          {{ group.name }}
        </a-select-option>
      </a-select>
      <a-radio-group
        id="tid_monitor-gpus-type"
        v-model:value="selected"
        style="margin-left: 35px"
        button-style="solid"
        :disabled="loading"
        @change="onViewTypeChange">
        <a-radio-button value="util">
          {{ $t('NodeGpus.Tab.Title.Util') }}
        </a-radio-button>
        <a-radio-button value="memory">
          {{ $t('NodeGpus.Tab.Title.Mem') }}
        </a-radio-button>
        <a-radio-button value="temperature">
          {{ $t('NodeGpus.Tab.Title.Temp') }}
        </a-radio-button>
      </a-radio-group>
    </div>

    <div class="gpusView-content m-t-20">
      <div class="gpusView-content-title">
        <h3>{{ $t(`NodeGpus.Content.Title.${selected}`) }}</h3>
      </div>
      <div class="gpu-used-label">
        <div class="gpu-u-inner">
          <span class="gpu-u-pic" />&nbsp;
          <span class="gpu-u-word">{{ $t('NodePanel.Gpu.Used') }}</span>
        </div>
      </div>
      <monitor-node-gpus
        :monitor-nodes="nodes.filter(item => item.values.length)"
        :value-type="selected"
        :page-offset="offset"
        :loading="loading"
        @offset-change="onOffsetChange" />
    </div>
  </div>
</template>
<script>
import MonitorNdoeGpus from '@/widget/monitor-node-gpus.vue'
import NodeGroupService from '@/service/node-group'
import MonitorService from '@/service/monitor-data'

export default {
  components: {
    'monitor-node-gpus': MonitorNdoeGpus,
  },
  data() {
    return {
      nodeGroupId: '',
      nodeGroups: [],
      hostnames: [],
      selected: 'util',
      nodes: [],
      offset: {
        total: 0,
        pageSize: 24,
        currentPage: 1,
      },
      refreshTimeout: null,
      refreshInterval: 30000,
      loading: false,
    }
  },
  beforeUnmount() {
    clearTimeout(this.refreshTimeout)
  },
  mounted() {
    this.loading = true
    NodeGroupService.getAllNodeGroups().then(
      res => {
        if (res.length > 0) {
          this.nodeGroupId = res[0].name
        }
        this.getNodesByGroup(true)
        this.nodeGroups = res
      },
      res => {
        this.$message.error(res)
      },
    )
  },
  methods: {
    refresh(interval) {
      const $this = this
      MonitorService.getNodeGpuDataByhostnames(this.hostnames, this.selected, this.offset).then(res => {
        $this.nodes = res.gpuData
        $this.loading = false

        if (interval) {
          $this.refreshTimeout = setTimeout(() => {
            $this.refresh(true)
          }, $this.refreshInterval)
        }
      })
    },
    getNodesByGroup(interval) {
      MonitorService.getNodesByGroup(this.nodeGroupId, this.offset).then(
        res => {
          this.hostnames = res.data.map(node => node.hostname)
          this.offset = { ...this.offset, total: res.total }
          this.refresh(interval)
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    onNodeGroupChange() {
      this.offset.currentPage = 1
      this.loading = true
      this.getNodesByGroup()
    },
    onViewTypeChange(e) {
      this.refresh()
    },
    onOffsetChange(val) {
      this.loading = true
      this.offset = val
      this.getNodesByGroup()
    },
    stringToNumberArr(val) {
      const arr = []
      val.forEach(str => {
        arr.push(Number(str))
      })
      return arr
    },
  },
}
</script>
<style scoped>
.gpusView-content {
  position: relative;
}
.ColorInversion {
  padding-top: 8px;
}
.gpusView-content .gpu-used-label {
  height: 20px;
  padding-top: 20px;
  padding-right: 20px;
}
.gpusView-content .gpu-u-inner {
  text-align: center;
  width: 70px;
  height: 20px;
  line-height: 20px;
  border-radius: 4px;
  float: right;
}
.gpusView-content .gpu-u-pic {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 4px;
  transform: translateY(10%);
}
.gpusView-content .gpu-u-word {
  display: inline-block;
  font-size: 12px;
  transform: translateY(-10%);
  height: 12px;
}
.gpusView-content-title {
  position: absolute;
  padding-top: 20px;
  padding-left: 20px;
}
.gpusView-content-title h3 {
  font-weight: inherit;
}
</style>
