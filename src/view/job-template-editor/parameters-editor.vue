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
        row-key="id"
        :columns="columns"
        :data-source="params"
        :bordered="true"
        :pagination="false"
        header-cell-class-name="job-template-parameters-table-header"
        style="max-width: 1200px">
        <template v-if="record.type != 'system'" slot="action" slot-scope="text, record, index">
          <span
            class="table-but-icon button-edit"
            :title="$t('JobTemplate.Parameters.Table.Edit')"
            @click="editParameter(record, index)"
            ><i class="el-erp-edit"
          /></span>
          <span
            class="table-but-icon button-delete"
            :title="$t('JobTemplate.Parameters.Table.Delete')"
            @click="deleteParameter(record, index)"
            ><i class="el-erp-delete"
          /></span>
          <span
            class="table-but-icon button-Move-up"
            :class="{
              'not-action': index - 1 == defaultIndex,
            }"
            :title="$t('JobTemplate.Parameters.Table.MoveUp')"
            @click="moveParametersUpAndDown(record, index, 'up')">
            <a-icon type="arrow-up"
          /></span>
          <span
            class="table-but-icon button-move-down"
            :class="{
              'not-action': index + 1 == params.length,
            }"
            :title="$t('JobTemplate.Parameters.Table.MoveDown')"
            @click="moveParametersUpAndDown(record, index, 'down')">
            <a-icon type="arrow-down"
          /></span>
        </template>
      </a-table>
    </a-row>
    <parameter-dialog ref="parameterDialog" :external-validator="duplicateParameterValidator" />
  </div>
</template>
<script>
import ParameterDialog from './parameter-dialog'
export default {
  components: {
    'parameter-dialog': ParameterDialog,
  },
  props: ['parameters'],
  data() {
    return {
      parameter: null,
      defaultIndex: 0,
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
          customRender: val => this.$t(`JobTemplate.Parameters.DataType.${val}`),
        },
        {
          title: this.$t('JobTemplate.Parameters.Table.Must'),
          dataIndex: 'must',
          width: 100,
          customRender: val => this.$t(`JobTemplate.Parameters.Table.Must.${val ? 'Yes' : 'No'}`),
        },
        {
          title: this.$t('Action'),
          dataIndex: 'action',
          width: 150,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
    }
  },
  watch: {
    params(val, oldVal) {
      for (let i = 0; i < val.length; i++) {
        if (val[i].type === 'system') {
          this.defaultIndex = i
        } else {
          break
        }
      }
    },
    parameters(val) {
      this.params = val
    },
  },
  mounted() {},
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
  },
}
</script>

<style lang="css">
.job-template-parameters-table-header {
  background-color: #eeeeee !important;
}
.parameters-add {
  margin: 20px;
}
.not-action {
  cursor: not-allowed;
}
</style>
