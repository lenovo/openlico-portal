<template>
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
            v-model:value="ModuleSelectedOptions"
            :title="$t('Multi.User.PleaseSelect')"
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
        <date-region-picker v-model:value="pickerSearchDate" quick-pick="default" @date-change="onDateChange" />
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
        style="width: 100%"
        :columns="columns"
        row-key="logId"
        :table-data-fetcher="tableDataFetcher"
        :external-filter="dataFilterTemp" />
    </a-row>
  </div>
</template>

<script>
import Format from '@/common/format'
import AccessService from '@/service/access'
import OperationService from '@/service/operation'
import CompositeTable from '@/component/composite-table.vue'
import DateRegionPicker from '@/component/date-region-picker.vue'
import MultiUserSelector from '@/widget/multi-user-selector.vue'

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
          customRender: ({ text }) => (text ? this.$t('Operation.Module.' + text) : '-'),
        },
        {
          align: 'center',
          sorter: true,
          title: this.$t('Operation.Table.title.action'),
          dataIndex: 'action',
          customRender: ({ text }) => this.$t('Operation.Module.' + text),
        },
        {
          title: this.$t('Operation.Table.title.target'),
          dataIndex: 'target',
          customRender: ({ text }) => {
            let target = ''
            text.forEach((obj, index) => {
              if (index === text.length - 1) {
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
          customRender: ({ text }) => Format.formatDateTime(text),
        },
      ],
      filterType: '',
      arch: AccessService.getSchedulerArch(),
      ModuleSelectedOptions: undefined, // Set to undefined to display placeholder
      dataFilter: {},
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
      this.dataFilter.module = {
        values: val ? [val[0]] : [],
        type: 'in',
      }
      this.dataFilter.action = {
        values: val ? [val[1].split('-')[1]] : [],
        type: 'in',
      }
    },
    onDateChange(dateRange) {
      this.dataFilter.actionTime = {
        values: dateRange,
        type: 'range',
      }
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
      this.dataFilter.userName = {
        value_type: val.value_type,
        values: val.values,
        type: 'in',
      }
    },
    Query() {
      const dataFilter = { ...this.dataFilter }
      if (dataFilter.actionTime) {
        const values = dataFilter.actionTime.values.map((e, i) => {
          if (!e) {
            return i === 0 ? new Date(0) : new Date()
          } else {
            return e
          }
        })
        dataFilter.actionTime = { values, type: 'range' }
      }
      this.dataFilterTemp = JSON.parse(JSON.stringify(dataFilter))
    },
  },
}
</script>

<style>
.operationLog-manage .ant-spin-nested-loading {
  width: 100%;
}
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
