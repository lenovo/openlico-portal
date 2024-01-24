<template>
  <div class="height--100 p-10">
    <div class="b-w p-20">
      <a-row type="flex" justify="space-between">
        <a-col :span="12">
          <a-select
            v-model:value="topLevelValue"
            :title="topLevelValue"
            :placeholder="$t('Monitor.Cluster.All')"
            class="selector-cluster"
            @change="topLevelChange">
            <a-select-option v-for="item in topLevelOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
          <a-select
            v-if="topLevelValue == 'group'"
            v-model:value="subLevelValue"
            :title="subLevelValue"
            :placeholder="subLevelPlaceholder"
            class="selector-sub-cluster">
            <a-select-option v-for="item in groupOption" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
          <a-cascader
            v-else-if="topLevelValue == 'rack'"
            v-model:value="selectedRack"
            class="selector-sub-cluster"
            :options="rackOptions"
            :placeholder="subLevelPlaceholder"
            @change="setSelectRack" />
          <a-input
            v-else
            v-model:value="inputValue"
            class="selector-sub-cluster"
            :class="validInputMessage ? 'error-border' : ''"
            :placeholder="subLevelPlaceholder"
            :disabled="topLevelValue === undefined"
            @change="validInput"
            @blur="setInputValue"
            @press-enter="setInputValue" />
          <p v-if="validInputMessage" class="valid-input-message">
            {{ validInputMessage }}
          </p>
        </a-col>
        <a-col :span="12" style="text-align: right">
          <a-switch v-model:checked="autoReFresh" size="small" :loading="loading" />
          <span v-if="autoReFresh" class="fresn-text">{{
            loading
              ? $t('Monitor.Cluster.Refreshing')
              : $T('Monitor.Cluster.Refresh.Seconds.Tips', { number: reFreshSeconds })
          }}</span>
          <span v-else class="fresn-text">{{
            loading ? $t('Monitor.Cluster.Refreshing') : $t('Monitor.Cluster.AutoRefresh')
          }}</span>
          <a-button :disabled="loading" class="fresh-button" @click="freshImmediately">
            {{ $t('Monitor.Cluster.Refresh') }}
          </a-button>
        </a-col>
      </a-row>
    </div>
    <template v-if="nodes.length">
      <div class="b-w p-20 overview">
        <p class="overview-title">
          <span>{{ $t('Monitor.Cluster.Overview') }}</span>
          <span>{{ $T('Monitor.Cluster.Nodes.On.Tips', { number: nodes.length }) }}</span>
        </p>
        <a-row :gutter="[20, 10]">
          <a-col v-for="item in overViewData" :key="item.key" :span="6">
            <div class="resource-utilization">
              <p class="resource-name">
                <span class="name">{{ item.name }}</span>
                <span v-if="getIcon(item.key) !== ''" class="icon-container">
                  <span class="icon"><i :class="getIcon(item.key)" /></span>
                </span>
              </p>
              <ResourceUtilization
                :text="[
                  item.name,
                  item.key == 'mem' && item.exist
                    ? formatByKb(item.total)
                    : item.exist
                    ? item.total + ' ' + item.unit
                    : '-',
                ]"
                :data="item.exist ? item : {}"
                :bar-height="14" />
              <p class="resource-number">
                <span class="free">
                  {{ $t('Monitor.Cluster.Free') }}
                  <span v-if="item.key == 'mem'">{{ item.exist ? formatByKb(item.free) : '-' }}</span>
                  <span v-else-if="!item.exist">-</span>
                  <span v-else>{{ item.free + ' ' + item.unit }}</span>
                </span>
                <span class="total">
                  {{ $t('Monitor.Cluster.Total') }}
                  <span v-if="item.key == 'mem'">{{ item.exist ? formatByKb(item.total) : '-' }}</span>
                  <span v-else-if="!item.exist">-</span>
                  <span v-else>{{ item.total + ' ' + item.unit }}</span>
                </span>
              </p>
            </div>
          </a-col>
        </a-row>
      </div>
      <div class="b-w p-20 cluster-nodes">
        <p class="nodes-title">
          {{ $t('Monitor.Cluster.Nodes') }}
        </p>
        <ClusterNodesResource :nodes="nodes" />
      </div>
    </template>
    <a-spin v-if="!nodes.length" :spinning="loading">
      <div class="nodata">
        <div v-if="!loading">
          <div style="margin-top: 160px">
            <img src="/static/img/system/main/nodata.png" style="height: 60px; width: 80px" :alt="$t('No.Data')" />
          </div>
          <div style="margin-top: 20px; color: #ccc; font-size: 16px">
            {{ $t('No.Data') }}
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script>
import Format from '@/common/format'
import ValidRoleFactory from '@/common/valid-role-factory'
import RackService from '@/service/rack'
import NodeGroupService from '@/service/node-group'
import MonitorClusterService from '@/service/monitor-cluster'
import ResourceUtilization from '@/widget/resource-utilization.vue'
import ClusterNodesResource from './monitor-cluster/cluster-nodes-resource.vue'
import Schema from 'async-validator'
export default {
  components: {
    ResourceUtilization,
    ClusterNodesResource,
  },
  data() {
    return {
      topLevelValue: undefined,
      subLevelValue: undefined,
      inputValue: '',
      validInputMessage: null,
      selectedRack: [],
      autoReFresh: false,
      loading: false,
      reFreshSeconds: 30,
      reFreshTimer: null,
      nodes: [],
      overViewData: [],
      topLevelOptions: [
        {
          label: this.$t('Monitor.Cluster.All'),
          value: undefined,
        },
        {
          label: this.$t('Monitor.Cluster.Group'),
          value: 'group',
        },
        {
          label: this.$t('Monitor.Cluster.Job'),
          value: 'job',
        },
        {
          label: this.$t('Monitor.Cluster.Submitter'),
          value: 'submitter',
        },
        {
          label: this.$t('Monitor.Cluster.Rack'),
          value: 'rack',
        },
      ],
      subLevelPlaceholder: this.$t('Monitor.Cluster.All.Placeholder'),
      groupOption: [],
      rackOptions: [],
    }
  },
  computed: {
    gResource() {
      return window.gApp.$store.getters['settings/getGResource']
    },
  },
  watch: {
    subLevelValue(val, oldVal) {
      if (this.topLevelValue !== undefined) {
        this.nodes = []
        this.overViewData = []
        this.autoReFresh = false
        if (val !== undefined && val !== '') {
          this.$nextTick(() => {
            this.autoReFresh = true
          })
        }
      }
    },
    autoReFresh(val, oldVal) {
      this.switchAutoReFresh(val)
    },
  },
  mounted() {
    this.getRackHierarchy()
    this.getAllGroups()
    this.autoReFresh = true
  },
  beforeUnmount() {
    clearTimeout(this.reFreshTimer)
  },
  methods: {
    getIcon(name) {
      switch (name) {
        case 'cpu':
          return 'el-erp-spcpu'
        case 'mem':
          return 'el-erp-spmemory'
        case 'gpu':
          return 'el-erp-spgpu'
        default:
          return ''
      }
    },
    topLevelChange(val) {
      this.nodes = []
      this.overViewData = []
      this.subLevelValue = undefined
      this.inputValue = ''
      this.selectedRack = []
      this.autoReFresh = false
      this.validInputMessage = null
      switch (val) {
        case 'group':
          this.subLevelPlaceholder = this.$t('Monitor.Cluster.Group.Placeholder')
          break
        case 'job':
          this.subLevelPlaceholder = this.$t('Monitor.Cluster.Job.Placeholder')
          break
        case 'submitter':
          this.subLevelPlaceholder = this.$t('Monitor.Cluster.Submitter.Placeholder')
          break
        case 'rack':
          this.subLevelPlaceholder = this.$t('Monitor.Cluster.Rack.Placeholder')
          break
        default:
          this.subLevelPlaceholder = this.$t('Monitor.Cluster.All.Placeholder')
          this.$nextTick(() => {
            this.autoReFresh = true
          })
      }
    },
    setInputValue() {
      if (this.validInputMessage) {
        return false
      }
      this.subLevelValue = this.inputValue
    },
    setSelectRack() {
      this.subLevelValue = this.selectedRack[this.selectedRack.length - 1]
    },
    switchAutoReFresh(val) {
      const that = this
      clearTimeout(this.reFreshTimer)
      this.reFreshSeconds = 30
      if (val) {
        this.loading = true
        MonitorClusterService.getClusterNodesData(this.topLevelValue, this.subLevelValue, this.gResource).then(
          res => {
            this.loading = false
            this.nodes = res.nodes
            this.overViewData = res.overViewData
            this.reFreshTimer = setTimeout(function fresh() {
              that.reFreshSeconds--
              if (that.reFreshSeconds <= 0) {
                that.switchAutoReFresh(true)
              } else {
                that.reFreshTimer = setTimeout(fresh, 1000)
              }
            }, 1000)
          },
          err => {
            this.loading = false
            this.autoReFresh = false
            this.$message.error(err)
          },
        )
      } else {
        this.reFreshTimer = null
      }
    },
    freshImmediately() {
      if (this.autoReFresh) {
        this.switchAutoReFresh(true)
      } else {
        this.loading = true
        MonitorClusterService.getClusterNodesData(this.topLevelValue, this.subLevelValue, this.gResource).then(
          res => {
            this.loading = false
            this.nodes = res.nodes
            this.overViewData = res.overViewData
          },
          err => {
            this.loading = false
            this.$message.error(err)
          },
        )
      }
    },
    validInput() {
      this.validInputMessage = null
      const inputValue = this.inputValue
      let validRoles = null
      if (this.topLevelValue === 'job') {
        validRoles = [ValidRoleFactory.getValidNaturalNumber(this.$t('Monitor.Cluster.SchudelerId'))]
      }
      if (this.topLevelValue === 'submitter') {
        validRoles = [
          ValidRoleFactory.getLengthRoleForText(this.$t('Monitor.Cluster.Submitter'), 3, 31),
          ValidRoleFactory.getValidUserameForText(this.$t('Monitor.Cluster.Submitter'), true),
        ]
      }
      const validator = new Schema({ input: validRoles })
      validator.validate({ input: inputValue }, (errors, fields) => {
        if (errors) {
          this.validInputMessage = errors[0].message
        }
      })
    },
    formatByKb(val) {
      if (val >= 1073741824) {
        return parseFloat(Format.formatByteSize(val * 1024, 'tb')) + ' TB'
      } else if (val >= 1048576) {
        return parseFloat(Format.formatByteSize(val * 1024, 'gb')) + ' GB'
      } else if (val >= 1024) {
        return parseFloat(Format.formatByteSize(val * 1024, 'mb')) + ' MB'
      } else {
        return parseFloat(Format.formatByteSize(val * 1024, 'kb')) + ' KB'
      }
    },
    getRackHierarchy() {
      this.rackOptions = []
      RackService.getRackHierarchy().then(
        res => {
          res.forEach(room => {
            const option = {}
            option.label = room.name
            option.value = room.name
            option.children = []
            if (room.rows && room.rows.length) {
              room.rows.forEach(row => {
                const rowOption = {}
                rowOption.label = row.name
                rowOption.value = row.name
                rowOption.children = []
                if (row.racks && row.racks.length) {
                  row.racks.forEach(rack => {
                    const rackOption = {}
                    rackOption.label = rack.name
                    rackOption.value = rack.name
                    rowOption.children.push(rackOption)
                  })
                } else {
                  rowOption.disabled = true
                }
                option.children.push(rowOption)
              })
            } else {
              option.disabled = true
            }
            this.rackOptions.push(option)
          })
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    getAllGroups() {
      this.groupOption = []
      NodeGroupService.getAllNodeGroups().then(
        res => {
          res.forEach(el => {
            this.groupOption.push({
              label: el.name,
              value: el.name,
            })
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

<style scoped>
.overview {
  margin: 20px auto;
}
.overview-title {
  margin-bottom: 20px;
}
.overview-title span:last-child {
  color: #ccc;
}
.overview .ant-col .resource-utilization {
  border-radius: 4px;
  border: 1px solid #eee;
  padding: 20px;
}
.nodes-title {
  margin-bottom: 20px;
}
.cluster-nodes {
  min-width: 900px;
}
.resource-name {
  margin-bottom: 10px;
  padding: 0 3px;
  position: relative;
}
.resource-name .icon {
  display: block;
  width: 34px;
  height: 34px;
  color: #079aff;
  position: relative;
  border-radius: 50%;
  background: linear-gradient(138.54deg, #f9fcff 1.56%, #ffffff 47.35%, #edf6ff 96.09%);
  box-shadow: inset 0px 0px 4px #d9ebff;
}
.resource-name .icon-container {
  position: absolute;
  right: 0;
  top: -10px;
}
.resource-name .name {
  color: #666;
  font-weight: bold;
}
.resource-name .icon i {
  font-size: 26px;
}
.resource-name .icon i::before {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.resource-number {
  margin-top: 10px;
}
.resource-number .free,
.resource-number .total {
  color: #999;
}
.resource-number .free span,
.resource-number .total span {
  display: inline-block;
  margin-left: 4px;
  color: #333;
  font-weight: bold;
  font-family: Helvetica, Arial, sans-serif;
}
.overview-title,
.resource-number {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 3px;
}
.overview-title {
  padding: 0;
}
.selector-cluster {
  width: 110px;
}
.selector-cluster :deep(.ant-select-selection) {
  border-radius: 4px 0 0 4px;
  border-right: none;
}
.selector-sub-cluster :deep(.ant-select-selection),
.selector-sub-cluster.ant-input,
.selector-sub-cluster :deep(.ant-cascader-input) {
  border-radius: 0 4px 4px 0;
}
.selector-sub-cluster {
  width: 210px;
}
.fresn-text {
  margin: 0 10px;
  display: inline-block;
}
.fresh-button {
  color: #449fff;
}
.valid-input-message {
  color: #f5222d;
  margin-left: 110px;
}
.error-border {
  border-color: #f5222d;
}
</style>
