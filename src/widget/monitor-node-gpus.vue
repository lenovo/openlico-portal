<template>
  <div class="gpusView-charts-content">
    <a-spin :spinning="loading">
      <a-row v-if="nodes.length == 0" class="m-b-20">
        <a-col :span="24" class="ant-table-placeholder">
          <div class="ant-empty ant-empty-normal">
            <div class="ant-empty-image" />
            <p class="ant-empty-description">
              {{ $t('No.Data') }}
            </p>
          </div>
        </a-col>
      </a-row>
      <a-row v-else :gutter="20">
        <a-col
          v-for="(node, index) in nodes"
          :key="index"
          class="gpusView-monitor-gpu-chart"
          :xxl="3"
          :xl="4"
          :lg="6"
          :md="6"
          :sm="8"
          :xs="12">
          <node-gpu-card
            v-if="node.values.length > 0"
            ref="nodeGpuCard"
            :node="node"
            :value-type="valueType"
            :job="job" />
        </a-col>
      </a-row>
      <div class="gpusPagination">
        <a-pagination
          v-model:value="currentPage"
          :hide-on-single-page="true"
          :page-size="pageSize"
          :total="total"
          @show-size-change="handleSizeChange"
          @change="handleCurrentChange" />
      </div>
    </a-spin>
  </div>
</template>
<script>
import NodeGpuCard from './node-gpu-card.vue'
export default {
  components: {
    'node-gpu-card': NodeGpuCard,
  },
  props: ['monitorNodes', 'valueType', 'pageOffset', 'job', 'loading'],
  emits: ['offset-change'],
  data() {
    return {
      nodes: [],
      type: this.valueType || 'util',
      total: 0,
      pageSize: 18,
      currentPage: 1,
    }
  },
  watch: {
    monitorNodes(val, oldVal) {
      this.init()
    },
    pageOffset(val, oldVal) {
      this.init()
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.init()
    })
  },
  methods: {
    init() {
      this.nodes = this.monitorNodes
      this.total = this.pageOffset.total
      this.pageSize = this.pageOffset.pageSize
      this.currentPage = this.pageOffset.currentPage
    },
    onOffsetChange() {
      this.$emit('offset-change', {
        total: this.total,
        pageSize: this.pageSize,
        currentPage: this.currentPage,
      })
    },
    handleSizeChange(val) {
      this.onOffsetChange()
    },
    handleCurrentChange(val) {
      this.onOffsetChange()
    },
    onResize() {
      this.$nextTick(() => {
        if (this.$refs.nodeGpuCard && this.$refs.nodeGpuCard.length > 0) {
          this.$refs.nodeGpuCard.forEach(item => {
            item.onResize()
          })
        }
      })
    },
  },
}
</script>

<style scoped>
.gpusView-charts-content {
  padding: 20px;
}

.gpusView-charts-content :deep(.ant-row) {
  padding-top: 20px;
}
.gpusViewNoData {
  padding: 50px 0;
  text-align: center;
}
.gpusView-monitor-gpu-chart {
  height: 180px;
  margin-bottom: 20px;
}
.gpusPagination {
  text-align: center;
}
.gpusView-charts-content :deep(.ant-empty-normal) {
  margin: 70px 0 32px 0;
}
.gpusView-charts-content :deep(.ant-table-placeholder) {
  position: relative;
  z-index: 1;
  margin-top: -1px;
  padding: 16px 16px;
  color: rgba(0, 0, 0, 0.25);
  font-size: 14px;
  text-align: center;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  border-radius: 0 0 4px 4px;
}
</style>
