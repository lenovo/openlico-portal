<template>
  <div class="parameters-add">
    <a-row class="m-b-20">
      <a-button id="Job_template_Parameters_Add_button" class="parameters-add-but" @click="addParameter">
        {{ $t('Action.Add') }}
      </a-button>
    </a-row>
    <a-row>
      <a-table
        id="Job_template_Parameters_Table"
        ref="parameterTable"
        style="width: 100%; max-width: 1200px"
        class="job-template-parameters-table"
        row-key="id"
        :columns="columns"
        :data-source="params"
        :bordered="true"
        :pagination="false">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'action'">
            <div v-if="shouldRenderActionSlot(record)">
              <span
                class="table-but-icon button-edit"
                :title="$t('JobTemplate.Parameters.Table.Edit')"
                @click="editParameter(record, index)">
                <i class="el-erp-edit" />
              </span>
              <span
                v-if="record.id !== 'run_time'"
                class="table-but-icon button-delete"
                :title="$t('JobTemplate.Parameters.Table.Delete')"
                @click="deleteParameter(record, index)">
                <i class="el-erp-delete" />
              </span>
              <span
                v-if="record.id != 'run_time'"
                class="table-but-icon button-Move-up"
                :class="{
                  'not-action': index - 1 == defaultIndex,
                }"
                :title="$t('JobTemplate.Parameters.Table.MoveUp')"
                @click="moveParametersUpAndDown(record, index, 'up')">
                <arrow-up-outlined style="color: rgba(0, 0, 0, 0.44)" />
              </span>
              <span
                v-if="record.id != 'run_time'"
                class="table-but-icon button-move-down"
                :class="{
                  'not-action': index + 1 == params.length,
                }"
                :title="$t('JobTemplate.Parameters.Table.MoveDown')"
                @click="moveParametersUpAndDown(record, index, 'down')">
                <arrow-down-outlined style="color: rgba(0, 0, 0, 0.44)" />
              </span>
            </div>
          </template>
        </template>
      </a-table>
    </a-row>
    <parameter-dialog ref="parameterDialog" :external-validator="duplicateParameterValidator" />
  </div>
</template>
<script>
import ParameterDialog from './parameter-dialog.vue'
export default {
  components: {
    'parameter-dialog': ParameterDialog,
  },
  props: ['parameters'],
  data() {
    return {
      parameter: null,
      // defaultIndex: 0,
      params: this.parameters,
      columns: [
        {
          title: this.$t('JobTemplate.Parameters.Table.Id'),
          dataIndex: 'id',
        },
        {
          title: this.$t('JobTemplate.Parameters.Table.Name'),
          dataIndex: 'name',
        },
        {
          title: this.$t('JobTemplate.Parameters.Class'),
          dataIndex: 'class',
          with: 200,
        },
        {
          title: this.$t('JobTemplate.Parameters.Table.DataType'),
          dataIndex: 'dataType',
          width: 150,
          customRender: ({ text }) => this.$t(`JobTemplate.Parameters.DataType.${text}`),
        },
        {
          title: this.$t('JobTemplate.Parameters.Table.Must'),
          dataIndex: 'must',
          width: 100,
          customRender: ({ text }) => this.$t(`JobTemplate.Parameters.Table.Must.${text ? 'Yes' : 'No'}`),
        },
        {
          title: this.$t('Action'),
          dataIndex: 'action',
          width: 150,
          align: 'center',
          // scopedSlots: { customRender: 'action' },
        },
      ],
    }
  },
  computed: {
    defaultIndex() {
      return this.params.filter(i => i.type === 'system').length - 1
    },
  },
  watch: {
    // params(val, oldVal) {
    //   for (let i = 0; i < val.length; i++) {
    //     if (val[i].type === 'system') {
    //       this.defaultIndex = i + 1
    //     } else {
    //       break
    //     }
    //   }
    // },
    parameters(val) {
      this.params = val
    },
  },
  methods: {
    addParameter() {
      this.$refs.parameterDialog.doAdd().then(res => {
        this.params.push(res.data)
      })
    },
    editParameter(row, index) {
      this.$refs.parameterDialog.doEdit(row, index).then(res => {
        this.params.splice(res.index, 1, res.data)
      })
    },
    deleteParameter(row, index) {
      this.$refs.parameterDialog.doDelete(row, index).then(res => {
        this.params.splice(res.index, 1)
      })
    },
    duplicateParameterValidator(parameter, index) {
      for (let i = 0; i < this.params.length; i++) {
        if (i !== index) {
          if (this.params[i].id === parameter.id) {
            return { name: 'Id', value: parameter.id }
          }
          if (this.params[i].name === parameter.name) {
            return { name: 'Name', value: parameter.name }
          }
        }
      }
      return null
    },
    columnFormatter(row, column) {
      return row[column.property] === 'base'
        ? this.$t('JobTemplate.BaseInformation')
        : row[column.property] === 'param'
        ? this.$t('JobTemplate.Parameters')
        : row[column.property] === 'resource'
        ? this.$t('JobTemplate.ResourceOptions')
        : row[column.property] === 'notify'
        ? this.$t('JobTemplate.NotifyOptions')
        : row[column.property]
    },
    // processParameter(data) {
    //   var obj = {};
    //   for(var key in data) {
    //     obj[key] = data[key];
    //   }
    //   return obj;
    // }
    moveParametersUpAndDown(row, i, type) {
      if ((i - 1 <= this.defaultIndex && type === 'up') || (i + 1 === this.params.length && type === 'down')) {
        return
      }
      const index = type === 'up' ? i - 1 : type === 'down' ? i + 1 : i
      this.params.splice(i, 1)
      this.params.splice(index, 0, row)
    },
    shouldRenderActionSlot(record) {
      if (record.id === 'run_time') {
        return true
      }
      return record.type !== 'system'
    },
  },
}
</script>

<style lang="css" scoped>
.job-template-parameters-table-header {
  background-color: #eeeeee !important;
}
/* .job-template-parameters-table :deep(.ant-table-cell) {
  padding: 8px;
} */
.parameters-add {
  margin: 20px;
}
.table-but-icon {
  cursor: pointer;
}
.not-action {
  cursor: not-allowed;
}
</style>
