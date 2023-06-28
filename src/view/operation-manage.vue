<template lang="html">
  <div id="tid_operation-manage" class="operationLog-manage table-top-manage p-10">
    <!--Search screen -->
    <a-row class="operation-search b-w p-20">
      <a-row class="operation-search-line">
        <!-- operator select -->
        <a-col :span="12" class="operation-flex">
          <span class="operation-search-condition">{{ $t('Operation.Screen.operator') }}</span>
          <multi-user-selector
            :allable="true"
            :filter-type="filterType"
            :users-value="[]"
            :users-type="'username'"
            @change="userSelectChange" />
        </a-col>
        <!-- module & operation select -->
        <a-col :span="12" class="operation-flex">
          <span class="operation-search-condition width-150">{{ $t('Operation.Screen.module') }}</span>
          <a-cascader
            id="tid_opertion-module"
            v-model="ModuleSelectedOptions"
            :placeholder="$t('Multi.User.PleaseSelect')"
            expand-trigger="hover"
            :clearable="true"
            :options="ModuleOptions"
            @change="onScreenModuleChenge" />
        </a-col>
      </a-row>
      <a-row class="operation-flex">
        <!-- date select -->
        <span class="operation-search-condition">{{ $t('Operation.Screen.date') }}</span>
        <date-region-picker v-model="pickerSearchDate" quick-pick="default" @date-change="onDateChange" />
      </a-row>
      <a-row class="operation-query-button">
        <a-button type="primary" @click="Query">
          {{ $t('Operation.Action.Query') }}
        </a-button>
      </a-row>
    </a-row>
    <!-- operation table -->
    <a-row class="table-styles">
      <composite-table
        id="tid_operation-manage-table"
        ref="operationTable"
        :columns="columns"
        row-key="logId"
        :table-data-fetcher="tableDataFetcher"
        :external-filter="dataFilterTemp" />
    </a-row>
  </div>
</template>

<script>
import CompositeTable from '../component/composite-table'
import DateRegionPicker from '../component/date-region-picker'
import OperationService from './../service/operation'
import Format from '../common/format'
import MultiUserSelector from './../widget/multi-user-selector'
import AccessService from '../service/access'

export default {
  components: {
    'composite-table': CompositeTable,
    'date-region-picker': DateRegionPicker,
    'multi-user-selector': MultiUserSelector,
  },
  data() {
    return {
      columns: [
        {
          align: 'center',
          width: 100,
          sorter: true,
          title: this.$t('Operation.Table.title.logId'),
          dataIndex: 'logId',
        },
        {
          align: 'center',
          sorter: true,
          title: this.$t('Operation.Table.title.userName'),
          dataIndex: 'userName',
        },
        {
          align: 'center',
          sorter: true,
          title: this.$t('Operation.Table.title.module'),
          dataIndex: 'module',
          customRender: val => (val ? this.$t('Operation.Module.' + val) : '-'),
        },
        {
          align: 'center',
          sorter: true,
          title: this.$t('Operation.Table.title.action'),
          dataIndex: 'action',
          customRender: val => this.$t('Operation.Module.' + val),
        },
        {
          title: this.$t('Operation.Table.title.target'),
          dataIndex: 'target',
          customRender: val => {
            let target = ''
            val.forEach((obj, index) => {
              if (index === val.length - 1) {
                target += obj.name
              } else {
                target += obj.name + ', '
              }
            })
            return target
          },
        },
        {
          align: 'center',
          width: 200,
          sorter: true,
          defaultSortOrder: 'descend',
          title: this.$t('Operation.Table.title.actionTime'),
          dataIndex: 'actionTime',
          customRender: val => Format.formatDateTime(val),
        },
      ],
      filterType: '',
      arch: AccessService.getSchedulerArch(),
      ModuleSelectedOptions: undefined, // Set to undefined to display placeholder
      dataFilter: {
        userName: {
          value_type: 'username',
          values: [],
          type: 'in',
        },
        module: {
          values: [],
          type: 'in',
        },
        action: {
          values: [],
          type: 'in',
        },
        actionTime: {
          values: [new Date(0), new Date()],
          type: 'range',
        },
      },
      dataFilterTemp: {},
      ModuleOptions: [],
      pickerSearchDate: [],
      tableDataFetcher: OperationService.getOperationTableDataFetcher(),
    }
  },
  created() {
    this.filterType = 'username,usergroup,billinggroup'
  },
  mounted() {
    this.ModuleOptions = this.analyzeModule(OperationService.ModuleEnums)
  },
  methods: {
    onScreenModuleChenge(val) {
      if (val.length > 0) {
        this.dataFilter.module.values = [val[0]]
        this.dataFilter.action.values = [val[1].split('-')[1]]
      } else {
        this.dataFilter.module.values = []
        this.dataFilter.action.values = []
      }
    },
    onDateChange(dateRange) {
      const newDate = []
      newDate[0] = dateRange[0] ? dateRange[0] : new Date(0)
      newDate[1] = dateRange[1] ? dateRange[1] : new Date()
      this.dataFilter.actionTime.values = newDate
    },
    analyzeModule(modules, type = false) {
      const options = []
      modules.forEach(m => {
        if (m.children) {
          m.children = this.analyzeModule(m.children, m.value)
        }
        if (m.featureCode) {
          if (AccessService.getMatchFeatureCodes(m.featureCode, this.$store.state.auth.featureCodes).length <= 0) {
            return
          }
        }
        const value = m.value.split('-').length > 1 ? m.value.split('-').pop() : m.value
        options.push({
          value: !type ? value : type + '-' + value,
          label: this.$t('Operation.Module.' + value),
          children: m.children,
        })
      })
      return options
    },
    userSelectChange(val) {
      this.dataFilter.userName.value_type = val.value_type
      this.dataFilter.userName.values = val.values
    },
    Query() {
      this.dataFilterTemp = JSON.parse(JSON.stringify(this.dataFilter))
    },
  },
}
</script>

<style lang="css">
.composite-table-controller > li {
  float: left;
  list-style: none;
}
.operationLog-manage > .ant-row {
  border-radius: 3px;
}
.operation-search {
  margin-bottom: 20px;
}
.operationLog-manage .composite-table-header {
  margin: 0;
}
.operation-search-condition {
  display: inline-block;
  width: 100px;
  height: 36px;
  line-height: 36px;
  margin-right: 20px;
  color: #a0a0a0;
}
.width-150 {
  width: 150px;
}
.operation-flex {
  display: flex;
}
.operation-search > div {
  margin-left: 0;
}
.operation-dialog-content {
  height: 100px;
  overflow-y: scroll;
}
.operation-dialog-content p {
  margin-bottom: 5px;
}
.operation-search-line {
  margin-bottom: 20px;
}
.tid_operation-operator > div {
  text-overflow: ellipsis;
  overflow: hidden;
}
.operation-query-button {
  margin-top: 20px;
}
#tid_operation-manage .multi-user-selector {
  width: 350px;
}
</style>