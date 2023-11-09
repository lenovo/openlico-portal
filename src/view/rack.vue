<template>
  <div v-if="rack != null" class="p-10">
    <a-row class="rack-top">
      <a-col :span="18" class="rack-top-left">
        <span class="rack-top-left-one">{{ rack.name }}</span>
        <span class="rack-top-left-two">{{ formatLocation(rack.location.rowIndex, rack.location.colIndex) }}</span>
        <div class="rack-top-bottom">
          <a-radio-group v-model:value="modeSelected" button-style="solid" style="color: #999">
            <a-radio-button
              v-for="modeOpt in modeOptions"
              :key="modeOpt.value"
              :value="modeOpt.value"
              :title="modeOpt.label">
              <i :class="modeOpt.icon" class="el-erp-mode-icon" />
            </a-radio-button>
          </a-radio-group>
        </div>
      </a-col>
      <a-col :span="3">
        <span class="rack-right-span">{{ formatCount(rack.nodeCount) }}</span>
        <div style="margin-top: 20px">
          {{ $t('Rack.TotalNodes') }}
        </div>
      </a-col>
      <a-col :span="3">
        <span class="rack-right-span"
          >{{ formatCount(formatEnergy(rack.energy)) }}{{ $t('Monitor.Group.Ene.Unit') }}</span
        >
        <br />
        <div style="margin-top: 20px">
          {{ $t('Rack.TotalEnergy') }}
        </div>
      </a-col>
    </a-row>
    <a-row class="rack-center-content">
      <div class="rack-border">
        <div class="rack-content-inner">
          <a-row class="rack">
            <div class="mode-font">
              {{ modeName }}
            </div>
            <div class="rack-tab-div" :title="$t('Rack.Data')" @click="type = 'data'">
              <i class="el-erp-data rack-tab" :class="{ active: type == 'data' }" />
            </div>
            <div class="rack-tab-div" :title="$t('Rack.View')" @click="type = 'view'">
              <i class="el-erp-view rack-tab" :class="{ active: type == 'view' }" />
            </div>
          </a-row>
          <physical-rack v-if="type == 'view'" class="" :rack-info="rack" :mode="mode" @node-click="onNodeClick" />
          <physical-data v-if="type == 'data'" :rack-info="rack" :mode="mode" />
        </div>
      </div>
      <div class="rack-top rack-top-content">
        <node-panel v-if="nodeName" :node-name="nodeName" />
      </div>
    </a-row>
  </div>
</template>
<script>
import RackService from '@/service/rack'
import NodePanel from '@/widget/node-panel.vue'
import PhysicalRack from '@/widget/physical-rack.vue'
import Format from '@/common/format'
import PhysicalData from '@/widget/physical-data.vue'

export default {
  components: {
    'node-panel': NodePanel,
    'physical-rack': PhysicalRack,
    'physical-data': PhysicalData,
  },
  data() {
    return {
      rack: null,
      totalNodes: 0,
      totalEnergy: 0,
      mode: 'common',
      modeSelected: 'common',
      nodeName: null,
      modeOptions: [
        {
          value: 'common',
          label: this.$t('Rack.Mode.Common'),
          icon: 'el-erp-rack',
        },
        {
          value: 'temperature',
          label: this.$t('Monitor.Temp'),
          icon: 'el-erp-temperature',
        },
        {
          value: 'energy',
          label: this.$t('Monitor.Ene'),
          icon: 'el-erp-monitor_power',
        },
        {
          value: 'load',
          label: this.$t('Monitor.Load'),
          icon: 'el-erp-load',
        },
        {
          value: 'cpu',
          label: this.$t('Monitor.Cpu'),
          icon: 'el-erp-cpu',
        },
        {
          value: 'ram',
          label: this.$t('Monitor.Ram'),
          icon: 'el-erp-memory',
        },
        {
          value: 'disk',
          label: this.$t('Monitor.Disk'),
          icon: 'el-erp-storage_1',
        },
        {
          value: 'network',
          label: this.$t('Monitor.Net'),
          icon: 'el-erp-network',
        },
      ],
      type: 'view',
      nodesToShow: [],
      refreshId: null,
      refreshInterval: 30 * 1000,
    }
  },
  computed: {
    modeName() {
      return this.modeOptions.filter(i => i.value === this.modeSelected)[0].label
    },
  },
  watch: {
    modeSelected(val, oldVal) {
      this.mode = val
    },
  },
  mounted() {
    this.init(this.$route.params.id)
  },
  beforeUnmount() {
    clearTimeout(this.refreshId)
  },
  methods: {
    init(rackId) {
      RackService.getRackConf().then(resp => {
        RackService.getRackById(rackId, resp).then(
          res => {
            this.rack = res
            this.refreshId = setTimeout(() => {
              this.init(rackId)
            }, this.refreshInterval)
          },
          res => {
            // this.$message.error(res)
          },
        )
      })
    },
    formatLocation(row, column) {
      return this.$T('Rack.Location', {
        row,
        column,
      })
    },
    formatCount(count) {
      return Format.formatCount(count)
    },
    onNodeClick(nodeName) {
      this.nodeName = nodeName
    },
    changeType(val, oldVal) {
      this.type = val
    },
    formatEnergy(energy) {
      return Format.formatEnergy(energy, 1000) // 1000w = 1kw
    },
  },
}
</script>
<style scoped>
.rack-top {
  background: #fff;
  margin-bottom: 20px;
  padding: 20px;
}

.rack-top-left-one {
  font-weight: bold;
  font-size: 16px;
}

.rack-top-left-two {
  font-size: 12px;
  color: #999;
  padding-left: 20px;
}

.rack-top-bottom {
  margin-top: 20px;
}

.rack-center-content {
  display: flex;
  flex-wrap: initial;
  /* height: 100%;*/
}

.el-erp-mode-icon {
  margin: 0;
  /*color:#999;*/
}

.el-erp-mode-icon:checked {
  background: #40aaff;
  color: #fff;
}

.rack-top-content {
  margin-bottom: 0;
  padding-bottom: 0;
  width: 100%;
}

.rack-border {
  background: white;
  min-width: 342px;
  margin-right: 20px;
}

.rack-content-inner {
  padding: 16px;
}

.a-row.rack {
  margin-bottom: 15px;
}

.a-row.rack:last-child {
  margin-bottom: 15px;
}

.active {
  color: #40aaff;
  border: 1px #40aaff solid !important;
  border-radius: 5px;
}

.rack-tab {
  padding: 4px 6px;
  border: 1px #dcdfe6 solid;
  border-radius: 5px;
  margin: 5px;
}

.rack {
  display: flex;
  margin-bottom: 3px;
}
.mode-font {
  font-size: 20px;
  font-weight: 600;
  flex: 5;
}
.rack-tab-div {
  flex: 1;
  cursor: pointer;
  text-align: right;
}
</style>
