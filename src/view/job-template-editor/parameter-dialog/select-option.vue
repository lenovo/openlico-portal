<template>
  <a-form-item :label="$t('JobTemplate.Parameters.Select.Option')">
    <!-- <el-input style="display: none;" v-model="formParameter.selectOption"></el-input> -->
    <a-table
      id="Parameter_SelectOptions_Table"
      :bordered="true"
      :pagination="false"
      :columns="columns"
      :data-source="tableData"
      header-row-class-name="jobTemplate-parameter-select-option-table">
      <template #bodyCell="{ column, record, index }">
        <template v-if="['name', 'value'].includes(column.dataIndex)">
          <a-input
            :key="column.dataIndex"
            v-model:value="record[column.dataIndex]"
            @change="
              e =>
                processData(
                  Object.defineProperty(record, column.dataIndex, {
                    value: e.target.value,
                  }),
                  index,
                )
            " />
        </template>
        <template v-if="column.dataIndex === 'action'">
          <span
            v-if="tableData.length > 1"
            class="table-but-icon button-delete"
            :title="$t('Action.Delete')"
            @click="deleteOption(record, index)"
            ><i class="el-erp-delete" />
          </span>
        </template>
      </template>
    </a-table>
    <a-button
      id="Parameter_SelectOptions_Add_Button"
      style="width: 100%"
      :disabled="tableData.length >= 10"
      @click="addOption">
      {{ $t('Action.Add') }}
    </a-button>
  </a-form-item>
</template>
<script>
export default {
  props: ['formParameter', 'formRules'],
  data() {
    return {
      columns: [
        {
          title: this.$t('JobTemplate.Parameters.Select.Option.Name'),
          dataIndex: 'name',
          width: 180,
          // scopedSlots: { customRender: 'name' },
        },
        {
          title: this.$t('JobTemplate.Parameters.Select.Option.Value'),
          dataIndex: 'value',
          width: 180,
          // scopedSlots: { customRender: 'value' },
        },
        {
          title: this.$t('Action'),
          dataIndex: 'action',
          align: 'center',
          // scopedSlots: { customRender: 'action' },
        },
      ],
      tableData: [],
      formParam: this.formParameter,
    }
  },
  watch: {
    formParam: {
      handler: function (val, oldVal) {
        this.tableData = []
        val.selectOption.length <= 0
          ? this.addOption()
          : val.selectOption.forEach(item => {
              this.addOption(item)
            })
      },
      deep: true,
    },
  },
  mounted() {
    this.formParam.selectOption.length <= 0
      ? this.addOption()
      : this.formParam.selectOption.forEach(item => {
          this.addOption(item)
        })
  },
  methods: {
    onLabelChange(name, row, index) {
      const temp = { name }
      this.processData({ ...row, ...temp }, index)
    },
    onValueChange(value, row, index) {
      const temp = { value }
      this.processData({ ...row, ...temp }, index)
    },
    addOption(item) {
      this.tableData.push({
        name: item ? item.label : '',
        value: item ? item.value : '',
      })
    },
    deleteOption(row, index) {
      this.tableData.splice(index, 1)
      this.formParam.selectOption.splice(index, 1)
    },
    processData(row, index) {
      const option = {}
      option.label = row.name || ''
      option.value = row.value || ''
      for (let i = 0; i < this.formParam.selectOption.length; i++) {
        if (this.formParam.selectOption[i].label === option.label && i !== index) {
          this.$message.error(
            this.$T('JobTemplate.Parameters.Select.Option.Repeat', {
              name: option.label,
            }),
          )
          return
        }
      }
      for (let i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].name === option.label && i !== index) {
          this.$message.error(
            this.$T('JobTemplate.Parameters.Select.Option.Repeat', {
              name: option.label,
            }),
          )
          return
        }
      }
      if (index >= this.formParam.selectOption.length) {
        this.formParam.selectOption.push(option)
        // if (option.label != "" && option.value != "") {
        //     this.formParameter.selectOption.push(option);
        // }
      } else {
        this.formParam.selectOption[index].label = option.label
        this.formParam.selectOption[index].value = option.value
      }
    },
  },
}
</script>

<style lang="css">
.jobTemplate-parameter-select-option-table th {
  padding: 0;
}
</style>
