<template>
  <div class="multi-node-selector">
    <a-input-group compact>
      <a-input v-model="inputValue" read-only :placeholder="placeholderAll" style="width: 80%" />
      <a-button type="primary" style="width: 20%" @click="onSelectClick(nodeValueObj)">
        {{ $t('Action.Select') }}
      </a-button>
    </a-input-group>
    <multi-node-selector-dialog
      ref="multiNodeSelectorDialog"
      :filter-type="filterType"
      :hostname-max="hostnameMax"
      :rack-max="rackMax"
      :node-group-max="nodeGroupMax"
      :allable="allable" />
  </div>
</template>
<script>
import MultiNodeSelectorDialog from '../widget/multi-node-selector/multi-node-selector-dialog'
import RackService from '../service/rack'
export default {
  components: {
    'multi-node-selector-dialog': MultiNodeSelectorDialog,
  },
  props: {
    filterType: { default: 'hostname,rack,nodegroup' },
    hostnameMax: { default: 10 },
    rackMax: { default: 10 },
    nodeGroupMax: { default: 10 },
    allable: { default: true },
    nodes: {
      default: () => {
        return { value_type: 'hostname', values: [] }
      },
    },
  },
  data() {
    return {
      nodeValueObj: '',
      inputValue: '',
    }
  },
  computed: {
    placeholderAll() {
      if (this.allable === true) {
        return this.$t('MultNode.Select.All')
      } else {
        return this.$t('MultNode.Select.Placeholder')
      }
    },
  },
  watch: {
    nodeValueObj: function (val) {
      this.$emit('nodes-selected-change', val)
      this.renderingData(this.nodeValueObj)
    },
    nodes: function (val) {
      this.handleNodes()
    },
  },
  mounted() {
    this.handleNodes()
    this.renderingData(this.nodeValueObj)
  },
  methods: {
    onSelectClick(nodeValueObj, filterValue) {
      this.$refs.multiNodeSelectorDialog.selectNode(nodeValueObj, filterValue)
    },
    renderingData(nodeValueObj) {
      this.inputValue = ''
      const index = ''
      const rackOptions = []
      if (nodeValueObj.values.length === 0) {
        this.inputValue = ''
      } else {
        if (nodeValueObj.value_type === 'hostname') {
          for (const i in nodeValueObj.values) {
            this.inputValue += nodeValueObj.values[i] + ','
          }
        } else if (nodeValueObj.value_type === 'rack') {
          this.escapeRack(nodeValueObj, index, rackOptions)
        } else {
          for (const i in nodeValueObj.values) {
            this.inputValue += nodeValueObj.values[i] + ','
          }
        }
      }
      this.inputValue = this.inputValue.slice(0, this.inputValue.length - 1)
    },
    escapeRack(nodeValueObj, index, rackOptions) {
      RackService.getAllRacks()
        .then(res => {
          for (const i in res) {
            rackOptions.push({
              name: res[i].name,
              value: res[i].id,
            })
          }
        })
        .then(() => {
          this.inputValue = ''
          nodeValueObj.values.forEach((value, index) => {
            for (const i in rackOptions) {
              if (rackOptions[i].name === value) {
                this.inputValue += rackOptions[i].name + ','
              }
            }
          })
          this.inputValue = this.inputValue.slice(0, this.inputValue.length - 1)
        })
    },
    handleNodes() {
      if (this.nodes.length === 0) {
        this.nodeValueObj = { value_type: 'hostname', values: [] }
      } else {
        this.nodeValueObj = this.nodes
      }
    },
  },
}
</script>
<style>
.multi-node-selector {
  display: flex;
}
</style>
