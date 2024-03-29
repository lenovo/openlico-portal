<template>
  <div>
    <a-modal
      :open="visible"
      :title="$t('Action.Accounting.Statement')"
      :footer="null"
      :width="1000"
      :body-style="{ 'min-height': '450px' }"
      destroy-on-close
      class="accounting-statement-modal"
      @cancel="visible = false">
      <p class="m-b-20">
        <span class="statement-label">{{ $t('BillGroup') }}</span
        ><span style="font-weight: bold">{{ billingGroup.name }}</span>
      </p>
      <composite-table
        id="tid_accounting-statement-table"
        ref="accountingStatementTable"
        :columns="columns"
        :table-data-fetcher="tableDataFetcher"
        row-key="id"
        :current-page="1"
        :page-sizes="['10', '20', '40', '50']"
        :page-size="20"
        :total="0"
        :search-enable="true"
        :search-props="['displayType', 'description', 'user']"
        :external-filter="dataFilterTemp">
        <template #controller>
          <span class="statement-label">{{ $t('BillGroup.Statement.Month') }}</span>
          <a-date-picker
            v-model:value="filterMonth"
            format="YYYY/MM"
            picker="month"
            :allow-clear="false"
            :disabled-date="disabledDate"
            @change="onMonthChange"></a-date-picker>
          <a-button type="link" style="padding: 10px" @click="exportClick">
            {{ $t('BillGroup.Statement.Export') }}
          </a-button>
          <a-button type="link" style="padding: 0px" @click="exportAllClick">
            {{ $t('BillGroup.Statement.ExportAll') }}
          </a-button>
        </template>
      </composite-table>
    </a-modal>
    <a-modal
      :open="downloadVisible"
      :title="$t('BillGroup.Statement.Download')"
      centered
      destroy-on-close
      class="statement-download-modal"
      :confirm-loading="loading"
      @cancel="downloadVisible = false"
      @ok="download">
      <div class="m-b-20">
        {{ $t('BillGroup.Statement.Download.Format') }}
      </div>
      <div style="display: flex">
        <div class="m-r-20">
          <input id="tid_reportFormatExcel" v-model="type" type="radio" value="xlsx" class="reportFormatExcel" />
          <label for="tid_reportFormatExcel" />
        </div>
        <div class="m-r-20">
          <input id="tid_reportFormatPDF" v-model="type" type="radio" value="pdf" class="reportFormatPDF" />
          <label for="tid_reportFormatPDF" />
        </div>
        <div class="m-r-20">
          <input id="tid_reportFormatHTML" v-model="type" type="radio" value="html" class="reportFormatHTML" />
          <label for="tid_reportFormatHTML" />
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script>
import dayjs from '@/dayjs'
import Format from '@/common/format'
import compositeTable from '@/component/composite-table.vue'
import BillingService from '@/service/bill-group'
export default {
  components: { compositeTable },
  data() {
    return {
      visible: false,
      downloadVisible: false,
      tableData: [],
      columns: [
        {
          dataIndex: 'approvedTime',
          title: this.$t('BillGroup.Statement.Date'),
          sorter: true,
          customRender: ({ text, record }) => {
            return Format.formatDateTime(text)
          },
          defaultSortOrder: 'descend',
        },
        {
          dataIndex: 'displayType',
          title: this.$t('BillGroup.Statement.Type'),
          // sorter: true
        },
        {
          dataIndex: 'description',
          title: this.$t('BillGroup.Statement.Description'),
          align: 'left',
        },
        {
          dataIndex: 'user',
          title: this.$t('BillGroup.Statement.User'),
          sorter: true,
        },
        {
          dataIndex: 'credits',
          title: this.$t('BillGroup.Statement.Amount'),
          align: 'right',
          sorter: true,
          customRender: ({ text, record }) => {
            return Format.formatMoney(text)
          },
        },
        {
          dataIndex: 'balance',
          title: this.$t('BillGroup.Statement.Balance'),
          align: 'right',
          sorter: true,
          customRender: ({ text, record }) => {
            return Format.formatMoney(text)
          },
        },
      ],
      dataFilterTemp: {
        applyTime: {},
      },
      filterMonth: dayjs(),
      billingGroup: {},
      exportall: false,
      type: 'xlsx',
      loading: false,
    }
  },
  computed: {
    tableDataFetcher() {
      return BillingService.getStatementTableDataFetcher(this.billingGroup.id, this.dataFilterTemp.applyTime.values)
    },
  },
  created() {
    this.setFilterMonth(dayjs())
  },
  methods: {
    exportClick() {
      this.exportall = false
      this.downloadVisible = true
    },
    exportAllClick() {
      this.exportall = true
      this.downloadVisible = true
    },
    showModel(data) {
      this.setFilterMonth(this.filterMonth)
      this.billingGroup = data
      this.visible = true
    },
    onMonthChange(val) {
      this.setFilterMonth(val)
    },
    download() {
      this.loading = true
      let time = this.dataFilterTemp.applyTime.values
      if (this.exportall) {
        time = [dayjs('2000/01/01'), dayjs()]
      }
      BillingService.downloadStatement(this.billingGroup.id, this.type, time).then(
        res => {
          this.downloadVisible = false
          this.loading = false
        },
        err => {
          this.loading = false
          this.$message.error(err)
        },
      )
    },
    disabledDate(current) {
      return current && current > dayjs().endOf('month')
    },
    setFilterMonth(date) {
      this.dataFilterTemp.applyTime = {
        values: [dayjs(date).startOf('month'), dayjs(date).endOf('month')],
        type: 'range',
      }
    },
  },
}
</script>
<style>
.accounting-statement-modal .composite-table {
  padding: 0;
}
.statement-label {
  min-width: 100px;
  display: inline-block;
  margin-right: 5px;
}
.statement-download-modal input[type='radio'] {
  display: none;
}
.statement-download-modal input[type='radio'] ~ label {
  display: inline-block;
  width: 60px;
  height: 60px;
}
.statement-download-modal .reportFormatExcel ~ label {
  background-image: url('/static/img/system/report/xlsx.png');
}
.statement-download-modal .reportFormatExcel:checked ~ label {
  background-image: url('/static/img/system/report/xlsx_check.png');
}
.statement-download-modal .reportFormatPDF ~ label {
  background-image: url('/static/img/system/report/pdf.png');
}
.statement-download-modal .reportFormatPDF:checked ~ label {
  background-image: url('/static/img/system/report/pdf_check.png');
}
.statement-download-modal .reportFormatHTML ~ label {
  background-image: url('/static/img/system/report/html.png');
}
.statement-download-modal .reportFormatHTML:checked ~ label {
  background-image: url('/static/img/system/report/html_check.png');
}
</style>
