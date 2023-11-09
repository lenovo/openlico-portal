<template>
  <composite-form-dialog
    ref="innerDialog"
    size="500px"
    :title="$t('MultNode.Title')"
    :form-model="selectForm"
    :form-rules="selectRules">
    <!--Filter-->
    <a-form-item :label="$t('MultNode.Filter')">
      <a-select v-model:value="selectForm.filterValue" @change="resetFormValidation(selectForm.filterValue)">
        <a-select-option v-for="item in filterOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <!--By hostname-->
    <a-form-item
      v-if="selectForm.filterValue == 'hostname'"
      ref="hostnameValue"
      name="hostnameValue"
      :label="$t('MultNode.Nodes')"
      :auto-link="false">
      <p class="multNode-nodes-input-tips">
        <ExclamationCircleFilled />
        {{ $t('MultNode.Nodes.Tips') }}
      </p>
      <a-textarea
        v-model:value="selectForm.hostnameValue"
        :auto-size="{ minRows: 4, maxRows: 6 }"
        :placeholder="placeholderAll"
        @blur="
          () => {
            $refs.hostnameValue.onFieldBlur()
          }
        "
        @change="
          () => {
            $refs.hostnameValue.onFieldChange()
          }
        " />
    </a-form-item>
    <!--By rack-->
    <a-form-item v-if="selectForm.filterValue == 'rack'" :label="$t('MultNode.Racks')" name="rackValue">
      <a-select v-model:value="selectForm.rackValue" mode="multiple" :placeholder="placeholderAll" show-arrow>
        <a-select-option v-for="item in rackOptions" :key="item.value" :value="item.name">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <!--By node group-->
    <a-form-item v-if="selectForm.filterValue == 'nodegroup'" :label="$t('MultNode.NodeGroups')" name="nodeGroupValue">
      <a-select v-model:value="selectForm.nodeGroupValue" mode="multiple" :placeholder="placeholderAll" show-arrow>
        <a-select-option v-for="item in nodeGroupOptions" :key="item.value" :value="item.name">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item
      v-show="selectForm.hostnameValue || selectForm.rackValue.length > 0 || selectForm.nodeGroupValue.length > 0">
      <a-button type="primary" danger @click="onClearClick">
        {{ $t('Action.Clear') }}
      </a-button>
    </a-form-item>
  </composite-form-dialog>
</template>
<script>
import RackService from '@/service/rack'
import NodeGroupService from '@/service/node-group'
import ValidRoleFactory from '@/common/valid-role-factory'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'

export default {
  components: {
    CompositeFormDialog,
  },
  props: ['filterType', 'hostnameMax', 'rackMax', 'nodeGroupMax', 'allable'],
  data() {
    const vaildateMultiNodes = () => {
      return {
        validator: (rule, value) => {
          const errors = []
          if (value.length > this.rackMax) {
            errors.push(new Error(this.$t('MultNode.Error.Limit')))
          } else if (value.length === 0 && !this.allable) {
            errors.push(new Error(this.$t('MultNode.Error.Empty')))
          }

          return Promise[errors.length ? 'reject' : 'resolve'](errors)
        },
        required: true,
      }
    }
    return {
      filterOptions: [],
      rackOptions: [],
      nodeGroupOptions: [],
      selectForm: {
        filterValue: '',
        hostnameValue: '',
        rackValue: [],
        nodeGroupValue: [],
      },
      selectRules: {
        hostnameValue: [
          ValidRoleFactory.getvalidMultiHostName(false),
          {
            validator: (rule, value) => {
              let arrValueLength = 1
              const errors = []
              for (const i in value) {
                if (value[i] === ',') {
                  arrValueLength++
                }
              }
              if (arrValueLength > this.hostnameMax) {
                errors.push(new Error(this.$t('MultNode.Error.Limit')))
              }

              return Promise[errors.length ? 'reject' : 'resolve'](errors)
            },
            // required: true
          },
        ],
        rackValue: [vaildateMultiNodes()],
        nodeGroupValue: [vaildateMultiNodes()],
      },
    }
  },
  computed: {
    placeholderAll() {
      if (this.allable) {
        return this.$t('MultNode.Select.All')
      } else {
        if (this.selectForm.filterValue === 'hostname') {
          return this.$t('MultNode.Placeholder.Hostname')
        } else if (this.selectForm.filterValue === 'rack') {
          return this.$t('MultNode.Placeholder.Rack')
        } else {
          return this.$t('MultNode.Placeholder.NodeGroup')
        }
      }
    },
  },
  mounted() {
    this.initFilterOptions()
  },
  methods: {
    submitForm() {
      const _this = this
      switch (this.selectForm.filterValue) {
        case 'hostname':
          return {
            value_type: 'hostname',
            values: this.emptyIsAll(_this.selectForm.hostnameValue.split(',')),
          }
        case 'rack':
          return {
            value_type: 'rack',
            values: this.emptyIsAll(_this.selectForm.rackValue),
          }
        case 'nodegroup':
          return {
            value_type: 'nodegroup',
            values: this.emptyIsAll(_this.selectForm.nodeGroupValue),
          }
        default:
      }
    },
    selectNode(nodeValueObj, filterValue) {
      this.initOptions()
      // Reset the form data
      this.selectForm = {
        filterValue: filterValue || nodeValueObj.value_type,
        hostnameValue: '',
        rackValue: [],
        nodeGroupValue: [],
      }
      if (nodeValueObj.values === 'all') {
        this.selectForm.hostnameValue = ''
        this.selectForm.rackValue = []
        this.selectForm.nodeGroupValue = []
      } else {
        if (nodeValueObj.value_type === 'hostname') {
          let hostnameValue = ''
          for (const i in nodeValueObj.values) {
            hostnameValue += nodeValueObj.values[i] + ','
          }
          this.selectForm.hostnameValue = hostnameValue.slice(0, hostnameValue.length - 1)
        } else if (nodeValueObj.value_type === 'rack') {
          this.selectForm.rackValue = nodeValueObj.values
        } else {
          this.selectForm.nodeGroupValue = nodeValueObj.values
        }
      }
      // Close the dialog and assign the form data to the node-selector
      this.$refs.innerDialog.emptyPopup().then(
        res => {
          this.$parent.nodeValueObj = this.submitForm()
        },
        res => {
          // Do nothing
        },
      )
    },
    initOptions() {
      this.rackOptions = []
      this.nodeGroupOptions = []
      RackService.getAllRacks().then(res => {
        this.rackOptions = res.map(i => ({
          name: i.name,
          value: i.id,
        }))
      })
      NodeGroupService.getAllNodeGroups().then(res => {
        this.nodeGroupOptions = res.map(i => ({
          name: i.name,
          value: i.id,
        }))
      })
    },
    initFilterOptions() {
      const arrFilterType = this.filterType.split(',')
      for (const i in arrFilterType) {
        this.filterOptions.push({
          value: arrFilterType[i],
          label: this.$t(`MultNode.Select.By${arrFilterType[i]}`),
        })
      }
    },
    emptyIsAll(valuesArr) {
      if (valuesArr.length === 0 || (valuesArr.length === 1 && valuesArr[0] === '')) {
        return []
      } else {
        return valuesArr
      }
    },
    resetFormValidation(filterValue) {
      this.$parent.onSelectClick(this.$parent.nodeValueObj, filterValue)
    },
    onClearClick() {
      this.selectForm.hostnameValue = ''
      this.selectForm.rackValue = []
      this.selectForm.nodeGroupValue = []
    },
  },
}
</script>

<style scoped>
.multNode-nodes-input-tips {
  color: #606266;
  font-size: 14px;
  margin-left: 10px;
  margin-bottom: 6px;
}
.multNode-nodes-input-tips .anticon-exclamation-circle {
  color: #1890ff;
}
</style>
