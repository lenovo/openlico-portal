<template>
  <div class="cpusView-charts-content">
    <p v-if="nodes.length == 0" class="cpusViewNoData">
      {{ $t('No.Data') }}
    </p>
    <a-row v-else :gutter="20">
      <a-col
        v-for="(node, index) in nodes"
        :key="index"
        class="cpusView-monitor-cpu-chart"
        :xxl="3"
        :xl="4"
        :lg="6"
        :md="6"
        :sm="8"
        :xs="12">
        <node-cpu-card ref="nodeCpuCard" :node="node" :value-type="type" :job="job" />
      </a-col>
    </a-row>
    <div class="cpusPagination">
      <a-pagination
        :hide-on-single-page="true"
        :current="currentPage"
        :page-size="pageSize"
        :total="total"
        @show-size-change="handleSizeChange"
        @change="handleCurrentChange" />
    </div>
  </div>
</template>
<script>
import NodeCpuCard from './node-cpu-card'
export default {
  components: {
    'node-cpu-card': NodeCpuCard,
  },
  props: ['monitorNodes', 'pageOffset', 'job'],
  data() {
    return {
      nodes: [],
      type: 'util',
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
      // this.isReversal = val;
    },
  },
  mounted() {
    this.init()
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
        if (this.$refs.nodeCpuCard && this.$refs.nodeCpuCard.length > 0) {
          this.$refs.nodeCpuCard.forEach(item => {
            item.onResize()
          })
        }
      })
    },
  },
}
</script>

<style lang="css">
.cpusView-charts-content {
  /*width: 100%;*/
  padding: 20px;
}
.cpusViewNoData {
  padding: 20px 0;
  text-align: center;
}
.cpusPagination {
  text-align: center;
}
</style>
