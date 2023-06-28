<template>
  <div class="height--100 p-10">
    <!-- alert condition -->
    <a-row class="alert-manage-condition p-20 b-w">
      <!-- first line ( status level ) -->
      <a-row class="alert-manage-condition-line">
        <!-- status -->
        <a-col :xs="24" :md="12" :lg="12" class="alert-condition-search">
          <span>{{ $t('Alert.Status') }}</span>
          <a-select
            id="tid_alert-status"
            v-model="dataFilter.status.values"
            :options="statusOptions"
            mode="multiple"
            show-arrow />
        </a-col>
        <!-- level -->
        <a-col :xs="24" :md="12" :lg="12" class="alert-condition-search">
          <span>{{ $t('Alert.PolicyLevel') }}</span>
          <a-select
            id="tid_alert-level"
            v-model="dataFilter.policyLevel.values"
            :options="policyLevelOptions"
            mode="multiple"
            show-arrow />
        </a-col>
      </a-row>
      <!-- two line ( date ) -->
      <a-row class="alert-search-date">
        <span class="alert-search-date-title">{{ $t('Alert.Screen.selectDate') }}</span>
        <date-region-picker
          ref="dateRegionPicker"
          v-model="pickerSearchDate"
          quick-pick="default"
          @date-change="onDateChange" />
      </a-row>
      <a-row class="alert-query-button">
        <a-button type="primary" @click="Query">
          {{ $t('Alert.Action.Query') }}
        </a-button>
      </a-row>
    </a-row>
    <!-- alert table -->
    <a-row class="table-styles">
      <composite-table
        id="tid_alert-manage-table"
        ref="alertTable"
        :columns="columns"
        :table-data-fetcher="tableDataFetcher"
        row-key="id"
        :selection-enable="true"
        :current-page="1"
        :page-sizes="['10', '20', '40', '50']"
        :page-size="20"
        :total="0"
        :search-enable="true"
        :search-props="['id', 'policyName', 'comment']"
        :external-filter="dataFilterTemp"
        :auto-refresh="30 * 1000"
        @selection-change="onSelectionChange">
        <ul slot="controller" class="composite-table-controller">
          <li class="alert-manage-action">
            <a-button id="tid_alert-confirm-btn" :disabled="alertActionIsDisabled" @click="alertConfirm('confirm')">
              {{ $t('Alert.Action.confirm') }}
            </a-button>
          </li>
          <li class="alert-manage-action">
            <a-button id="tid_alert-fix-btn" :disabled="alertActionIsDisabled" @click="alertFix('fix')">
              {{ $t('Alert.Action.fix') }}
            </a-button>
          </li>
          <li class="alert-manage-action">
            <a-button id="tid_alert-btn" :disabled="alertActionIsDisabled" @click="alertDelete('delete')">
              {{ $t('Alert.Action.delete') }}
            </a-button>
          </li>
          <a-dropdown>
            <a-menu slot="overlay" @click="alertAction">
              <a-menu-item v-for="action in actionsAll" :key="action">
                {{ $t(`Alert.Action.${action}`) }}
              </a-menu-item>
            </a-menu>
            <a-button style="margin-left: 8px" type="primary">
              {{ $t('Alert.Action.actionAll') }}
              <a-icon type="down" />
            </a-button>
          </a-dropdown>
        </ul>
        <template slot="policyLevel" slot-scope="{ policyLevel }">
          <alert-table-level :level="policyLevel" />
        </template>
        <template slot="comment" slot-scope="{ row }">
          <div class="ellipsis">
            <p class="alert-table-note" @click="alertEditComment(row)">
              {{ row.comment }}
              <span v-if="row.comment.length < 1">
                {{ $t('User.Password.edit') }}
              </span>
            </p>
          </div>
        </template>
        <a-dropdown slot="action" slot-scope="{ row }" :trigger="['click']">
          <a-menu slot="overlay" @click="({ key }) => onActionCommand(key, row.id)">
            <a-menu-item v-for="action in actions" :key="action" :disabled="canAction(row.status, action)">
              {{ $t(`Alert.Action.${action}`) }}
            </a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px">
            {{ $t('Action') }}
            <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </composite-table>
    </a-row>
    <!-- dialog comment -->
    <alert-dialog ref="alertDialog" />
  </div>
</template>
<script>
import CompositeTable from '../component/composite-table'
import DateRegionPicker from '../component/date-region-picker'
import AlertTablelevel from '../widget/alert-policy-level-label.vue'
import AlertDialog from '../widget/alert-dialog'
import AlertService from '../service/alert'
import AlertPolicyService from '../service/alert-policy'
import Format from '../common/format'

export default {
  components: {
    'composite-table': CompositeTable,
    'date-region-picker': DateRegionPicker,
    'alert-table-level': AlertTablelevel,
    'alert-dialog': AlertDialog,
  },
  data() {
    return {
      statusOptions: [],
      policyLevelOptions: [],
      dataFilter: {
        status: {
          values: ['present'],
          type: 'in',
        },
        policyLevel: {
          values: [],
          type: 'in',
        },
        createTime: {
          values: [new Date(0), new Date('2100/1/1')],
          type: 'range',
        },
      },
      dataFilterTemp: {},
      pickerSearchDate: ['', ''],
      dialogNoteVisible: false,
      alertActionIsDisabled: true,
      comment: '',
      alertActionIds: [],
      tableDataFetcher: AlertService.getAlertTableDataFetcher(),
      actionsAll: ['confirmAll', 'fixAll', 'deleteAll'],
      actions: ['confirm', 'fix', 'delete'],
      columns: [
        {
          dataIndex: 'id',
          title: this.$t('Alert.Table.title.id'),
          sorter: true,
        },
        {
          dataIndex: 'policyName',
          title: this.$t('Alert.Table.title.policyName'),
          sorter: true,
        },
        {
          dataIndex: 'policyLevel',
          title: this.$t('Alert.Table.title.policyLevel'),
          align: 'left',
          sorter: true,
          scopedSlots: {
            customRender: 'policyLevel',
          },
        },
        {
          dataIndex: 'status',
          title: this.$t('Alert.Table.title.status'),
          sorter: true,
          customRender: (text, record) => {
            return this.$t(`Alert.Status.${text}`)
          },
        },
        {
          dataIndex: 'createTime',
          title: this.$t('Alert.Table.title.createTime'),
          customRender: (text, recorde) => {
            return Format.formatDateTime(text)
          },
          sorter: true,
          defaultSortOrder: 'descend',
        },
        {
          dataIndex: 'nodeName',
          title: this.$t('Alert.Table.title.nodeName'),
          sorter: true,
          customRender: (text, record) => {
            if (record.gpuId) {
              return `${text}:gpu${record.gpuId}`
            }
            return text
          },
        },
        {
          dataIndex: 'comment',
          title: this.$t('Alert.Table.title.comment'),
          ellipsis: true,
          scopedSlots: { customRender: 'comment' },
        },
        {
          title: this.$t('Alert.Table.title.operation'),
          scopedSlots: {
            customRender: 'action',
          },
        },
      ],
    }
  },
  created() {
    AlertService.AlertStatusEnums.forEach(item => {
      this.statusOptions.push({
        value: item,
        label: this.$t('Alert.Status.' + item),
      })
    })
    AlertPolicyService.AlertPolicyLevelEnums.forEach(item => {
      this.policyLevelOptions.push({
        value: AlertPolicyService.AlertPolicyLevelValueParse[item],
        label: this.$t('Alert.PolicyLevel.' + item),
      })
    })
    this.Query()
  },
  methods: {
    captilize(str) {
      return str ? str.replace(str[0], str[0].toUpperCase()) : ''
    },
    onDateChange(pickerDate) {
      const newDate = []
      newDate[0] = pickerDate[0] ? pickerDate[0] : new Date(0)
      newDate[1] = pickerDate[1] ? pickerDate[1] : new Date()
      this.dataFilter.createTime.values = newDate
    },
    alertEditComment(alert) {
      this.$refs.alertDialog.doEdit(alert).then(
        res => {
          this.$refs.alertTable.fetchTableData()
        },
        res => {
          // Do nothing
        },
      )
    },
    alertConfirm(command, id) {
      const ids = id !== undefined ? [id] : this.alertActionIds
      this.$refs.alertDialog.doConfirm(command, ids, this.dataFilter).then(
        res => {
          this.$refs.alertTable.fetchTableData()
          this.$refs.alertTable.clearSelection()
        },
        res => {
          // Do nothing
        },
      )
    },
    alertFix(command, id) {
      const ids = id !== undefined ? [id] : this.alertActionIds
      this.$refs.alertDialog.doFix(command, ids, this.dataFilter).then(
        res => {
          this.$refs.alertTable.fetchTableData()
          this.$refs.alertTable.clearSelection()
        },
        res => {
          // Do nothing
        },
      )
    },
    alertDelete(command, id) {
      const ids = id !== undefined ? [id] : this.alertActionIds
      this.$refs.alertDialog.doDelete(command, ids, this.dataFilter).then(
        res => {
          this.$refs.alertTable.fetchTableData(true)
          this.$refs.alertTable.clearSelection(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    alertAction(e) {
      if (e.key === 'confirmAll') {
        this.alertConfirm(e.key)
      }
      if (e.key === 'fixAll') {
        this.alertFix(e.key)
      }
      if (e.key === 'deleteAll') {
        this.alertDelete(e.key)
      }
    },
    onActionDone(isrefresh) {
      this.$refs.alertTable.fetchTableData(isrefresh)
    },
    onSelectionChange(selection) {
      this.alertActionIds = []
      if (selection.length > 0) {
        selection.forEach(alert => {
          this.alertActionIds.push(alert.id)
        })
      }
      this.alertActionIsDisabled = selection.length <= 0
    },
    canAction(status, action) {
      if (action === 'confirm') {
        return status !== 'present'
      } else if (action === 'fix') {
        return status === 'resolved'
      } else {
        return false
      }
    },
    onActionCommand(action, id) {
      if (action === 'confirm') {
        this.alertConfirm(action, id)
      }
      if (action === 'fix') {
        this.alertFix(action, id)
      }
      if (action === 'delete') {
        this.alertDelete(action, id)
      }
    },
    Query() {
      this.dataFilterTemp = JSON.parse(JSON.stringify(this.dataFilter))
    },
  },
}
</script>
<style scoped>
.composite-table-controller > li {
  float: left;
  list-style: none;
}

.alert-manage > .a-row {
  border-radius: 3px;
}

.alert-manage-condition {
  margin-bottom: 20px;
}

.alert-manage-condition-line {
  margin-bottom: 20px;
}

.alert-manage-condition >>> .ant-select-selection {
  box-sizing: border-box;
  width: 188px;
}

.alert-condition-search {
  display: flex;
}

.alert-condition-search > span {
  width: 100px;
  line-height: 36px;
  margin-right: 20px;
  color: #a0a0a0;
}

.alert-manage-action {
  margin-right: 20px;
}

.alertConditionSearch {
  float: right;
}

.alert-search-date {
  display: flex;
  margin-left: 0;
}

.alert-search-date > div {
  margin-left: 0;
}

.alert-search-date-title {
  width: 100px;
  margin-right: 20px;
  line-height: 36px;
  color: #a0a0a0;
}

.dialogNote-cont {
  height: 80px;
  width: 100%;
  resize: none;
}

.actionall-icon {
  margin-left: 8px;
  color: #fff;
}

.alert-dropdown-menu {
  padding: 0;
  border-radius: 2px;
}

.alert-dropdown-menu > li {
  padding: 10px 20px 0;
  border-top: 1px dashed #eee;
}

.alert-dropdown-menu > li:first-child {
  border: none;
}
.alert-query-button {
  margin-top: 20px;
}
</style>
