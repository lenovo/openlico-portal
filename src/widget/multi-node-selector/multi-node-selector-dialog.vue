<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="$t('MultNode.Title')"
    size="500px"
    composite-height="460"
    :form-model="selectForm"
    :form-rules="selectRules">
    <!--Filter-->
    <a-form-model-item :label="$t('MultNode.Filter')">
      <a-select v-model="selectForm.filterValue" @change="resetFormValidation(selectForm.filterValue)">
        <a-select-option v-for="item in filterOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
    <!--By hostname-->
    <a-form-model-item
      v-if="selectForm.filterValue == 'hostname'"
      ref="hostnameValue"
      :label="$t('MultNode.Nodes')"
      prop="hostnameValue"
      :auto-link="false">
      <p class="multNode-nodes-input-tips">
        <a-icon type="exclamation-circle" theme="filled" />
        {{ $t('MultNode.Nodes.Tips') }}
      </p>
      <a-input
        v-model="selectForm.hostnameValue"
        type="textarea"
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
    </a-form-model-item>
    <!--By rack-->
    <a-form-model-item v-if="selectForm.filterValue == 'rack'" :label="$t('MultNode.Racks')" prop="rackValue">
      <a-select v-model="selectForm.rackValue" mode="multiple" :placeholder="placeholderAll" show-arrow>
        <a-select-option v-for="item in rackOptions" :key="item.value" :value="item.name">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
    <!--By node group-->
    <a-form-model-item
      v-if="selectForm.filterValue == 'nodegroup'"
      :label="$t('MultNode.NodeGroups')"
      prop="nodeGroupValue">
      <a-select v-model="selectForm.nodeGroupValue" mode="multiple" :placeholder="placeholderAll" show-arrow>
        <a-select-option v-for="item in nodeGroupOptions" :key="item.value" :value="item.name">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item
      v-show="selectForm.hostnameValue || selectForm.rackValue.length > 0 || selectForm.nodeGroupValue.length > 0">
      <a-button type="danger" @click="onClearClick">
        {{ $t('Action.Clear') }}
      </a-button>
    </a-form-model-item>
  </composite-form-dialog>
</template>
<script>
import CompositeFormDialog from '../../component/composite-form-dialog'
import RackService from '../../service/rack'
import NodeGroupService from '../../service/node-group'
import ValidRoleFactory from '../../common/valid-role-factory'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  props: ['filterType', 'hostnameMax', 'rackMax', 'nodeGroupMax', 'allable'],
  data() {
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
            validator: (rule, value, callback) => {
              let arrValueLength = 1
              for (const i in value) {
                if (value[i] === ',') {
                  arrValueLength++
                }
              }
              if (arrValueLength > this.hostnameMax) {
                callback(new Error(this.$t('MultNode.Error.Limit')))
              } else if (value.length === 0) {
                callback()
                // if (this.allable) {
                //     callback();
                // } else {
                //     callback(
                //         new Error(
                //             this.$t("MultNode.Error.Empty")
                //         )
                //     );
                // }
              } else {
                callback()
              }
            },
            // required: true
          },
        ],
        rackValue: [
          {
            validator: (rule, value, callback) => {
              if (value.length > this.rackMax) {
                callback(new Error(this.$t('MultNode.Error.Limit')))
              } else if (value.length === 0) {
                if (this.allable) {
                  callback()
                } else {
                  callback(new Error(this.$t('MultNode.Error.Empty')))
                }
              } else {
                callback()
              }
            },
            required: true,
          },
        ],
        nodeGroupValue: [
          {
            validator: (rule, value, callback) => {
              if (value.length > this.nodeGroupMax) {
                callback(new Error(this.$t('MultNode.Error.Limit')))
              } else if (value.length === 0) {
                if (this.allable) {
                  callback()
                } else {
                  callback(new Error(this.$t('MultNode.Error.Empty')))
                }
              } else {
                callback()
              }
            },
            required: true,
          },
        ],
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
        for (const i in res) {
          this.rackOptions.push({
            name: res[i].name,
            value: res[i].id,
          })
        }
      })
      NodeGroupService.getAllNodeGroups().then(res => {
        for (const i in res) {
          this.nodeGroupOptions.push({
            name: res[i]._name,
            value: res[i]._id,
          })
        }
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
