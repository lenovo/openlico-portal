<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="560px"
    :form-model="billGroupForm"
    :form-rules="billGroupRules"
    :form-label-col="8"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter"
    :external-validate="externalValidate"
    class="billing-group-create-dialog">
    <a-form-model-item :label="$t('BillGroup.Name')" prop="name">
      <a-input id="tid_billgroup-name" v-model="billGroupForm.name" :disabled="mode == 'delete'" />
    </a-form-model-item>
    <a-form-model-item
      v-if="mode != 'copy'"
      ref="chargeRateFormItem"
      class="bill-rate-input-item"
      :label="$t('BillGroup.CpuChargeRate')"
      prop="chargeRate">
      <bill-rate-minute-hour-input
        v-model="innerCpuChargeRate"
        :currency="currency"
        :unit="$t('BillGroup.CpuChargeRate.Unit')"
        :disabled="mode == 'delete'" />
    </a-form-model-item>
    <a-form-model-item
      v-if="mode != 'copy'"
      ref="memoryChargeRateFormItem"
      class="bill-rate-input-item"
      :label="$t('BillGroup.MemoryChargeRate')"
      prop="memoryChargeRate">
      <bill-rate-minute-hour-input
        v-model="innerMemoryChargeRate"
        :currency="currency"
        :unit="$t('BillGroup.MemoryChargeRate.Unit')"
        :disabled="mode == 'delete'" />
    </a-form-model-item>
    <template>
      <div v-for="(item, index) in billGroupForm.gResourceChargeRate" :key="item.id">
        <a-form-model-item
          v-if="mode != 'copy'"
          :ref="'gResourceChargeRate' + index"
          class="bill-rate-input-item"
          :label="$t('BillGroup.GresChargeRate', { value: item.label })"
          :prop="'gResourceChargeRate.' + index + '.value'"
          :rules="item.rules">
          <bill-rate-minute-hour-input
            v-model="innerGresRate[index]"
            :currency="currency"
            :unit="item.unit"
            :disabled="mode == 'delete'" />
        </a-form-model-item>
      </div>
    </template>
    <a-form-model-item
      v-if="mode == 'create' || mode == 'copy'"
      :label="$t('BillGroup.AccountInitAmount')"
      prop="accountInitAmount">
      <a-input id="tid_billgroup-init-amount" v-model="billGroupForm.accountInitAmount" :addon-before="currency">
      </a-input>
    </a-form-model-item>
    <a-form-model-item v-if="mode != 'copy'" :label="$t('BillGroup.Description')" prop="description">
      <a-input
        id="tid_billgroup-description"
        v-model="billGroupForm.description"
        type="textarea"
        :disabled="mode == 'delete'" />
    </a-form-model-item>
  </composite-form-dialog>
</template>
<script>
import BillGroupService from '../../service/bill-group'
import CompositeFormDialog from '../../component/composite-form-dialog'
import ValidRoleFactory from '../../common/valid-role-factory'
import Format from '../../common/format'
import BillingRateInput from './billing-rate-input'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
    'bill-rate-minute-hour-input': BillingRateInput,
  },
  data() {
    return {
      innerCpuChargeRate: {
        value: '1.00',
        timeUnit: 'hour',
      },
      innerMemoryChargeRate: {
        value: '1.00',
        timeUnit: 'hour',
      },
      innerGresRate: [],
      currency: this.$store.getters['settings/getCurrency'],
      title: '',
      mode: '',
      billGroupId: 0,
      deleteForce: false,
      gresource: window.gApp.$store.getters['settings/getGResource'],
      billGroupForm: {
        name: '',
        chargeRate: '1.00',
        cpuChargeRateTimeType: 'hour',
        memoryChargeRate: '1.00',
        memoryChargeRateTimeType: 'hour',
        storageChargeRate: '1.00',
        accountInitAmount: '0.00',
        gResourceChargeRate: [],
        gResourceChargeRateTimeType: [],
        description: '',
      },
      billGroupRules: {
        name: [
          ValidRoleFactory.getRequireRoleForText(this.$t('BillGroup.Name')),
          ValidRoleFactory.getLengthRoleForText(this.$t('BillGroup.Name'), 3, 20),
          ValidRoleFactory.getValidIdentityNameRoleIncludeChineseText(this.$t('BillGroup.Name')),
        ],
        chargeRate: [
          ValidRoleFactory.getRequireRoleForText(this.$t('BillGroup.CpuChargeRate')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('BillGroup.CpuChargeRate')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('BillGroup.CpuChargeRate'), 0, 999999.9999),
          ValidRoleFactory.getNumberDecimalRoleForText(this.$t('BillGroup.CpuChargeRate'), 4),
        ],
        memoryChargeRate: [
          ValidRoleFactory.getRequireRoleForText(this.$t('BillGroup.MemoryChargeRate')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('BillGroup.MemoryChargeRate')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('BillGroup.MemoryChargeRate'), 0, 999999.9999),
          ValidRoleFactory.getNumberDecimalRoleForText(this.$t('BillGroup.MemoryChargeRate'), 4),
        ],
        storageChargeRate: [
          ValidRoleFactory.getRequireRoleForText(this.$t('BillGroup.StorageChargeRate')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('BillGroup.StorageChargeRate')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('BillGroup.StorageChargeRate'), 0, 999999.9999),
          ValidRoleFactory.getNumberDecimalRoleForText(this.$t('BillGroup.StorageChargeRate'), 4),
        ],
        accountInitAmount: [
          ValidRoleFactory.getRequireRoleForText(this.$t('BillGroup.AccountInitAmount')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('BillGroup.AccountInitAmount')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('BillGroup.AccountInitAmount'), 0, 99999999.99),
          ValidRoleFactory.getNumberDecimalRoleForText(this.$t('BillGroup.AccountInitAmount'), 2),
        ],
        description: [ValidRoleFactory.getLengthRoleForText(this.$t('BillGroup.Description'), 0, 200)],
      },
    }
  },
  watch: {
    innerCpuChargeRate: {
      handler: function (val, oldVal) {
        this.billGroupForm.chargeRate = val.value
        this.billGroupForm.cpuChargeRateTimeType = val.timeUnit
        this.$nextTick(() => {
          this.$refs.chargeRateFormItem.validate()
        })
      },
      deep: true,
    },
    innerMemoryChargeRate: {
      handler: function (val, oldVal) {
        this.billGroupForm.memoryChargeRate = val.value
        this.billGroupForm.memoryChargeRateTimeType = val.timeUnit
        this.$nextTick(() => {
          this.$refs.memoryChargeRateFormItem.validate()
        })
      },
      deep: true,
    },
    innerGresRate: {
      handler: function (val, oldVal) {
        val.forEach((el, index) => {
          this.billGroupForm.gResourceChargeRate[index].value = el.value
          this.billGroupForm.gResourceChargeRateTimeType[index] = el.timeUnit
          this.$nextTick(() => {
            if (this.$refs['gResourceChargeRate' + index] && this.$refs['gResourceChargeRate' + index][0]) {
              this.$refs['gResourceChargeRate' + index][0].validate()
            }
          })
        })
      },
      deep: true,
    },
  },
  mounted() {
    this.initGResource()
  },
  methods: {
    initGResource() {
      this.innerGresRate = []
      this.gresource.forEach(el => {
        this.billGroupForm.gResourceChargeRate.push({
          value: '1.0000',
          code: el.code,
          label: el.display_name,
          unit: el.unit,
          id: el.id,
          rules: [
            ValidRoleFactory.getRequireRoleForText(
              this.$t('BillGroup.GresChargeRate', {
                value: el.code.toUpperCase(),
              }),
            ),
            ValidRoleFactory.getValidNumberRoleForText(
              this.$t('BillGroup.GresChargeRate', {
                value: el.code.toUpperCase(),
              }),
            ),
            ValidRoleFactory.getNumberRangeRoleForText(
              this.$t('BillGroup.GresChargeRate', {
                value: el.code.toUpperCase(),
              }),
              0,
              999999.9999,
            ),
            ValidRoleFactory.getNumberDecimalRoleForText(
              this.$t('BillGroup.GresChargeRate', {
                value: el.code.toUpperCase(),
              }),
              4,
            ),
          ],
        })
        this.billGroupForm.gResourceChargeRateTimeType.push('hour')
        this.innerGresRate.push({
          value: '0.0000',
          timeUnit: 'hour',
        })
      })
    },
    submitForm() {
      if (this.mode === 'copy') {
        return BillGroupService.copyBillGroup(this.billGroupForm)
      }
      const data = {
        gcr_minute: {},
        gcr_display_type: {},
        cr_minute: 0,
        cr_display_type: '',
        mcr_minute: 0,
        mcr_display_type: '',
      }
      const gresChargeRate = {}
      this.billGroupForm.gResourceChargeRate.forEach((el, index) => {
        gresChargeRate[el.code] = parseFloat(el.value)
        data.gcr_display_type[el.code] = this.billGroupForm.gResourceChargeRateTimeType[index]
      })
      data.gresChargeRate = gresChargeRate
      data.gcr_minute = Object.assign(data.gcr_minute, gresChargeRate)
      data.cr_minute = this.billGroupForm.chargeRate
      data.cr_display_type = this.billGroupForm.cpuChargeRateTimeType
      data.mcr_minute = this.billGroupForm.memoryChargeRate
      data.mcr_display_type = this.billGroupForm.memoryChargeRateTimeType
      if (this.billGroupForm.cpuChargeRateTimeType === 'hour') {
        data.cr_minute = 0
      }
      if (this.billGroupForm.memoryChargeRateTimeType === 'hour') {
        data.mcr_minute = 0
      }
      this.billGroupForm.gResourceChargeRateTimeType.forEach((el, index) => {
        if (el === 'hour') {
          data.gcr_minute[this.billGroupForm.gResourceChargeRate[index].code] = 0
        }
      })
      const submitData = Object.assign(data, this.billGroupForm)
      if (this.mode === 'create') {
        return BillGroupService.createBillGroup(submitData)
      }
      if (this.mode === 'edit') {
        return BillGroupService.updateBillGroup(submitData)
      }
      if (this.mode === 'delete') {
        return BillGroupService.deleteBillGroup(this.billGroupId, this.deleteForce)
      }
    },
    externalValidate(callbackFunc) {
      if (this.mode === 'delete' && this.billGroupId !== '') {
        BillGroupService.checkBillGroup(this.billGroupId).then(
          res => {
            if (res[this.billGroupId] && res[this.billGroupId].length) {
              this.$confirm({
                title: this.title,
                content: this.$t('User.Delete.Confirm', { name: res[this.billGroupId].join(',') }),
                centered: true,
                okText: this.$t('Action.Confirm'),
                cancelText: this.$t('Action.Cancel'),
                onOk: () => {
                  this.deleteForce = true
                  callbackFunc(true)
                },
                onCancel: () => {
                  callbackFunc(false)
                  this.$refs.innerDialog.onCancelClick()
                },
              })
            } else {
              callbackFunc(true)
            }
          },
          err => {
            this.$message.error(err)
          },
        )
      } else {
        callbackFunc(true)
      }
    },
    successMessageFormatter(res) {
      const billGroup = res
      if (this.mode === 'create') {
        return this.$t('BillGroup.Create.Success', {
          name: billGroup.name,
        })
      }
      if (this.mode === 'edit') {
        return this.$t('BillGroup.Edit.Success', {
          name: billGroup.name,
        })
      }
      if (this.mode === 'copy') {
        return this.$t('BillGroup.Create.Success', {
          name: this.billGroupForm.name,
        })
      }
      if (this.mode === 'delete') {
        return this.$t('BillGroup.Delete.Success', {
          name: this.billGroupForm.name,
        })
      }
    },
    errorMessageFormatter(res) {
      const errMsg = res
      return this.$t(errMsg)
    },
    doCreate() {
      this.mode = 'create'
      this.billGroupId = 0
      this.innerCpuChargeRate = {
        value: '1.0000',
        timeUnit: 'hour',
      }
      this.innerMemoryChargeRate = {
        value: '1.0000',
        timeUnit: 'hour',
      }
      this.billGroupForm = {
        name: '',
        chargeRate: '1.0000',
        cpuChargeRateTimeType: 'hour',
        memoryChargeRate: '1.0000',
        memoryChargeRateTimeType: 'hour',
        storageChargeRate: '1.0000',
        accountInitAmount: '0.00',
        description: '',
        gResourceChargeRate: [],
        gResourceChargeRateTimeType: [],
      }
      this.initGResource()
      this.title = this.$t('BillGroup.Create.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEdit(billGroup) {
      this.mode = 'edit'
      this.billGroupId = billGroup.id
      this.billGroupForm = {
        id: billGroup.id,
        name: billGroup.name,
        chargeRate: '',
        cpuChargeRateTimeType: '',
        memoryChargeRate: '',
        memoryChargeRateTimeType: '',
        storageChargeRate: Format.formatBillingRate(billGroup.storageChargeRate, false),
        description: billGroup.description,
        gResourceChargeRate: [],
        gResourceChargeRateTimeType: [],
      }
      this.initGResource()
      this.innerCpuChargeRate = {
        value:
          billGroup.chargeRateDisplayType === 'minute'
            ? Format.formatBillingRate(billGroup.chargeRateMinute, false)
            : Format.formatBillingRate(billGroup.chargeRate, false),
        timeUnit: billGroup.chargeRateDisplayType,
      }
      this.innerMemoryChargeRate = {
        value:
          billGroup.memoryChargeRateDisplayType === 'minute'
            ? Format.formatBillingRate(billGroup.memoryChargeRateMinute, false)
            : Format.formatBillingRate(billGroup.memoryChargeRate, false),
        timeUnit: billGroup.memoryChargeRateDisplayType,
      }
      this.innerGresRate = this.innerGresRate.map((el, index) => {
        const element = this.billGroupForm.gResourceChargeRate[index].code
        if (billGroup.gresChargeRateDisplayType[element] === 'minute') {
          el.value = billGroup.gresChargeRateMinute[element]
            ? Format.formatBillingRate(billGroup.gresChargeRateMinute[element])
            : '0'
        } else {
          el.value = billGroup.gresChargeRate[element]
            ? Format.formatBillingRate(billGroup.gresChargeRate[element])
            : '0'
        }
        el.timeUnit = billGroup.gresChargeRateDisplayType[element]
          ? billGroup.gresChargeRateDisplayType[element]
          : 'hour'
        return el
      })
      this.title = this.$t('BillGroup.Edit.Title', { id: billGroup.id })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doCopy(billGroup) {
      this.mode = 'copy'
      this.billGroupForm = {
        id: billGroup.id,
        name: '',
        accountInitAmount: '',
      }
      this.title = this.$t('BillGroup.Copy.Title', { id: billGroup.id })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doDelete(billGroup) {
      this.mode = 'delete'
      this.deleteForce = false
      this.billGroupId = billGroup.id
      this.billGroupForm = {
        name: billGroup.name,
        chargeRate: '',
        cpuChargeRateTimeType: '',
        memoryChargeRate: '',
        memoryChargeRateTimeType: '',
        storageChargeRate: Format.formatBillingRate(billGroup.storageChargeRate, false),
        accountInitAmount: '0.00',
        description: billGroup.description,
        gResourceChargeRate: [],
        gResourceChargeRateTimeType: [],
      }
      this.initGResource()
      this.innerCpuChargeRate = {
        value:
          billGroup.chargeRateDisplayType === 'minute'
            ? Format.formatBillingRate(billGroup.chargeRateMinute, false)
            : Format.formatBillingRate(billGroup.chargeRate, false),
        timeUnit: billGroup.chargeRateDisplayType,
      }
      this.innerMemoryChargeRate = {
        value:
          billGroup.memoryChargeRateDisplayType === 'minute'
            ? Format.formatBillingRate(billGroup.memoryChargeRateMinute, false)
            : Format.formatBillingRate(billGroup.memoryChargeRate, false),
        timeUnit: billGroup.memoryChargeRateDisplayType,
      }
      this.innerGresRate = this.innerGresRate.map((el, index) => {
        const element = this.billGroupForm.gResourceChargeRate[index].code
        if (billGroup.gresChargeRateDisplayType[element] === 'minute') {
          el.value = billGroup.gresChargeRateMinute[element]
            ? Format.formatBillingRate(billGroup.gresChargeRateMinute[element])
            : '0.0000'
        } else {
          el.value = billGroup.gresChargeRate[element]
            ? Format.formatBillingRate(billGroup.gresChargeRate[element])
            : '0.0000'
        }
        el.timeUnit = billGroup.gresChargeRateDisplayType[element]
          ? billGroup.gresChargeRateDisplayType[element]
          : 'hour'
        return el
      })
      this.title = this.$t('BillGroup.Delete.Title', {
        id: billGroup.id,
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
<style>
.bill-rate-input-item .ant-form-item-children .ant-select {
  width: 130px;
}
</style>
