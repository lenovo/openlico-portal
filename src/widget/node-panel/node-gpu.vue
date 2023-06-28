<template>
  <div class="node-gpu-tab">
    <a-radio-group
      v-if="isDev"
      v-model="viewType"
      :disabled="loading"
      button-style="solid"
      class="m-b-20"
      @change="onViewTypeChange">
      <a-radio-button value="gpu">{{ $t('NodePanel.GPU.GPU') }}</a-radio-button>
      <a-radio-button value="dev">{{ $t('NodePanel.GPU.DEV') }}</a-radio-button>
    </a-radio-group>

    <a-table
      ref="innerTable"
      expand-row-by-click
      :row-key="({ index, devId }) => (devId === null ? index : `${index}-${devId}`)"
      :columns="columns"
      :data-source="tableData"
      :pagination="false"
      :expanded-row-keys="expandRowkeys"
      :loading="loading"
      @expandedRowsChange="onExpandChange">
      <template slot="expandedRowRender" slot-scope="record">
        <a-row :gutter="10" style="width: 100%">
          <a-col :lg="8" :md="12" :sm="24" :xs="24" class="node-gpu-chart">
            <node-gpu-used ref="nodeGpuUsed" :gpu-data="record.util.history" />
          </a-col>
          <a-col :lg="8" :md="12" :sm="24" :xs="24" class="node-gpu-chart">
            <node-gpu-memory ref="nodeGpuMemory" :gpu-data="record.memory.history" />
          </a-col>
          <a-col :lg="8" :md="12" :sm="24" :xs="24" class="node-gpu-chart">
            <node-gpu-temp ref="nodeGpuTemp" :gpu-data="record.temperature.history" />
          </a-col>
        </a-row>
      </template>
      <template slot="used" slot-scope="text, record">
        <node-status-label v-if="record.used != '-'" :status="record.used" />
        <span v-else>{{ record.used }}</span>
      </template>
    </a-table>
  </div>
</template>

<script>
import NodeStatusLabel from '../node-status-label.vue'
import NodeGpuUsed from './node-gpu/node-gpu-used'
import NodeGpuMemory from './node-gpu/node-gpu-memory'
import NodeGpuTemp from './node-gpu/node-gpu-temperature'
import GpuService from '../../service/monitor-data'
export default {
  components: {
    'node-status-label': NodeStatusLabel,
    'node-gpu-used': NodeGpuUsed,
    'node-gpu-memory': NodeGpuMemory,
    'node-gpu-temp': NodeGpuTemp,
  },
  props: ['node'],
  data() {
    return {
      tableData: [],
      expandRowkeys: [],
      data: this.node,
      gpus: [],
      viewType: 'gpu',
      loading: false,
    }
  },
  computed: {
    isDev() {
      return this.node.gpus.filter(i => i.devId !== null).length > 0
    },
    columns() {
      const columns = [
        {
          title: this.$t('NodePanel.GPU.Index'),
          dataIndex: 'index',
          customRender: (val, rows) => {
            return `${this.$t('Monitor.Gpu')}
              #${val}${rows.devId !== null ? ' ' + GpuService.VendorMap[rows.vendor].prefix + rows.devId : ''}`
          },
        },
        {
          title: this.$t('NodePanel.GPU.Type'),
          dataIndex: 'type',
        },
        {
          title: this.$t('NodePanel.GPU.Vendor'),
          dataIndex: 'vendor',
          customRender: val => {
            return this.$t(`NodePanel.GPU.Vendor.${GpuService.VendorMap[val].vendor}`)
          },
        },
        {
          title: this.$t('Monitor.Util'),
          dataIndex: 'util',
          customRender: val => val.current,
        },
        {
          title: this.$t('NodePanel.GPU.Memory'),
          dataIndex: 'memory',
          customRender: val => val.current,
        },
        {
          title: this.$t('Monitor.Temp'),
          dataIndex: 'temperature',
          customRender: val => val.current,
        },
      ]
      if (!this.isDev) {
        console.log(111)
        columns.splice(3, 0, {
          title: this.$t('NodePanel.GPU.Status'),
          dataIndex: 'used',
          scopedSlots: { customRender: 'used' },
        })
      }
      return columns
    },
  },
  watch: {
    node(val, oldVal) {
      if (val !== null) {
        this.data = this.node
        this.gpus = this.data.gpus
        if (oldVal && oldVal.hostname !== val.hostname) {
          this.viewType = 'gpu'
        }
        this.refresh()
      }
    },
  },
  mounted() {
    if (this.data !== null) {
      this.gpus = this.data.gpus
      this.loading = true
      this.refresh()
    }
  },
  methods: {
    refresh() {
      this.getTableData().then(res => {
        this.loading = false
        this.tableData = res
        // this.expandRowkeys = [res[0].index]
      })
    },
    getTableData() {
      return new Promise((resolve, reject) => {
        const dataReqs = []
        const gpus = []
        this.gpus.forEach(item => {
          if (this.viewType === 'dev' || !gpus.includes(item.index)) {
            gpus.push(item.index)
            dataReqs.push(
              this.getGpuData(
                this.data.hostname,
                item.devId !== null && this.viewType === 'dev' ? item.index + ',' + item.devId : item.index,
                item.type,
                this.viewType === 'dev' ? item.devUsed : item.used,
                item.vendor,
              ),
            )
          }
        })
        Promise.all(dataReqs).then(res => {
          resolve(res)
        })
      })
    },
    getGpuData(id, index, type, used, vendor) {
      const _this = this
      return new Promise((resolve, reject) => {
        const ramReq = GpuService.getNodeGpuDataByHour(id, index, 'ram')
        const utilReq = GpuService.getNodeGpuDataByHour(id, index, 'util')
        const tempReq = GpuService.getNodeGpuDataByHour(id, index, 'temperature')
        Promise.all([ramReq, utilReq, tempReq]).then(
          res => {
            resolve({
              index: String(index).split(',')[0],
              devId: String(index).split(',')[1] || null,
              vendor,
              type,
              used: used === 1 ? 'busy' : used === 0 ? 'idle' : '-',
              memory: {
                current: _this.formatter(res[0].current, 'memory'),
                history: res[0].data,
              },
              util: {
                current: _this.formatter(res[1].current, 'util'),
                history: res[1].data,
              },
              temperature: {
                current: _this.formatter(res[2].current, 'temperature'),
                history: res[2].data,
              },
            })
          },
          res => {
            this.$message.error(res)
          },
        )
      })
    },
    formatter(value, type) {
      let unit = ''
      if (value || value === 0) {
        if (type === 'memory' || type === 'util') {
          unit = '%'
        } else if (type === 'temperature') {
          unit = '℃'
        }
        return Math.round(value * 10) / 10 + unit
      } else {
        return '-'
      }
    },
    onExpandChange(expandedRows) {
      if (expandedRows.length > 1) {
        this.expandRowkeys = [expandedRows.pop()]
      } else {
        this.expandRowkeys = expandedRows
      }
    },
    resizeChart() {
      // refresh the node gpus charts
      if (this.gpus.length > 0 && this.tableData.length > 0) {
        this.onResize(this.$refs.nodeGpuUsed)
        this.onResize(this.$refs.nodeGpuMemory)
        this.onResize(this.$refs.nodeGpuTemp)
      }
    },
    onResize(doms) {
      if (doms) {
        if (doms.length > 1) {
          doms.forEach(dom => {
            dom.onResize()
          })
        } else {
          doms.onResize()
        }
      }
    },
    onViewTypeChange() {
      this.loading = true
      this.refresh()
    },
  },
}
</script>

<style lang="css" scoped>
.node-gpu-chart {
  height: 200px;
}

.node-gpu-tab tr.current-row > td {
  background: #dfeaf3;
}
</style>
