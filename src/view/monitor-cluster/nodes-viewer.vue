<template>
  <div class="nodes-viewer">
    <div ref="nodesContainer" class="nodes-container" @scroll="loadMoreData">
      <div
        v-for="item in innerData"
        :key="item.hostname"
        class="nodes-item"
        @mouseenter="showMoreIcon(item)"
        @mouseleave="hideMoreIcon(item)">
        <p class="node-name">
          {{ item.hostname }}
        </p>
        <div class="node-detail-container">
          <a-tooltip :title="$t('Action.Info')" placement="left">
            <i
              :ref="item.hostname + 'more'"
              class="el-more-icon el-erp-more2"
              style="display: none"
              @click="onDetailClick(item)" />
          </a-tooltip>
        </div>
        <ResourceUtilization
          v-if="showItem[0] && item[showItem[0]]"
          class="bar-chart"
          :text="[item.hostname, getLabel(showItem[0])]"
          :color="'rgb(68,159,255)'"
          :bar-height="10"
          :data="item[showItem[0]]" />
        <div v-else class="placeholder-bar" />
        <ResourceUtilization
          v-if="showItem[1] && item[showItem[1]]"
          class="bar-chart"
          :text="[item.hostname, getLabel(showItem[1])]"
          :color="'rgb(26,188,156)'"
          :bar-height="10"
          :data="item[showItem[1]]" />
        <div v-else class="placeholder-bar" />
      </div>
    </div>
    <span v-if="loadMessage.length" class="load-message">{{ loadMessage }}</span>
    <NodeDetailDialog ref="detailDialog" />
  </div>
</template>

<script>
import ResourceUtilization from '../../widget/resource-utilization'
import NodeDetailDialog from '../../widget/nodes-table/node-detail-dialog'
export default {
  components: {
    ResourceUtilization,
    NodeDetailDialog,
  },
  props: ['nodes', 'showItem'],
  data() {
    return {
      innerData: [],
      lodaData: [],
      columns: 0,
      loadMessage: '',
      resourcesOptions: [],
      page: 1,
      scrollTop: 0,
      documentScrollTop: 0,
    }
  },
  computed: {
    gResource() {
      return window.gApp.$store.getters['settings/getGResource']
    },
  },
  watch: {
    nodes(val, oldVal) {
      this.innerData = []
      this.lodaData = []
      this.$nextTick(() => {
        this.init()
      })
    },
    showItem(val, oldVal) {
      this.init()
    },
  },
  mounted() {
    this.page = 1
    this.init()
    this.resourcesOptions = [
      {
        label: this.$t('Monitor.Cluster.CPU'),
        value: 'cpu',
      },
      {
        label: this.$t('Monitor.Cluster.Memory'),
        value: 'mem',
      },
    ]
    this.gResource.forEach(el => {
      this.resourcesOptions.push({
        label: el.display_name,
        value: el.code,
      })
    })
  },
  methods: {
    init() {
      this.columns = this.getColumns()
      this.innerData = []
      this.lodaData = [...this.nodes]
      this.innerData = this.lodaData.splice(0, this.columns * 10 * this.page)
      this.$nextTick(() => {
        this.$refs.nodesContainer.scrollTop = this.scrollTop
        document.documentElement.scrollTop = this.documentScrollTop
      })
    },
    getColumns() {
      const width = parseInt(window.getComputedStyle(this.$refs.nodesContainer, null).getPropertyValue('width'))
      let n = parseInt(width / 120)
      while (140 * n > width + 20) {
        n--
      }
      return n
    },
    getLabel(val) {
      for (let i = 0; i < this.resourcesOptions.length; i++) {
        const element = this.resourcesOptions[i]
        if (element.value === val) {
          return element.label
        }
      }
      return ''
    },
    loadMoreData() {
      const scrollTop = this.$refs.nodesContainer.scrollTop
      this.scrollTop = scrollTop
      this.documentScrollTop = document.documentElement.scrollTop
      const clientHeight = this.$refs.nodesContainer.clientHeight
      const scrollHeight = this.$refs.nodesContainer.scrollHeight
      if (scrollHeight > clientHeight && scrollTop + clientHeight === scrollHeight) {
        const data = this.lodaData.splice(0, this.columns * 10)
        if (!data.length) {
          this.loadMessage = this.$t('Monitor.Cluster.Load.Nodata')
          setTimeout(() => {
            this.loadMessage = ''
          }, 500)
        } else {
          this.loadMessage = this.$t('Monitor.Cluster.Load.Loading')
          this.innerData.push(...data)
          this.page++
          setTimeout(() => {
            this.loadMessage = ''
          }, 500)
        }
      }
    },
    onDetailClick(node) {
      this.$refs.detailDialog.showDetail(node.hostname)
      const popoverCOntainer = document.querySelectorAll(`.${node.hostname}-cluster-node-action-list`)
      if (popoverCOntainer[0]) {
        popoverCOntainer[0].style = 'display: none'
      }
    },
    showMoreIcon(item) {
      this.$refs[item.hostname + 'more'][0].style = 'display: block'
    },
    hideMoreIcon(item) {
      this.$refs[item.hostname + 'more'][0].style = 'display: none'
    },
  },
}
</script>

<style scoped>
.nodes-viewer {
  width: 100%;
  position: relative;
}
.nodes-container {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, 120px);
  grid-row-gap: 20px;
  grid-column-gap: 20px;
  overflow: auto;
  max-height: 500px;
}
.nodes-item {
  width: 120px;
  height: 100px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
}
.nodes-item .node-name {
  margin-bottom: 10px;
  padding-right: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.el-more-icon {
  position: absolute;
  top: -36px;
  right: 0;
  font-size: 20px;
  margin: 0;
  background: #f8f8f8;
  border-radius: 2px;
  cursor: pointer;
}
.load-message {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
}
.node-detail-container {
  position: relative;
}
.placeholder-bar {
  width: 100px;
  height: 22px;
}
</style>
