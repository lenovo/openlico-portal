<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="500px"
    :form-model="queuePolicyForm"
    :form-rules="queuePolicyFormRules"
    :form-label-width="8"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter"
    class="set-queue-policy-dialog">
    <a-form-model-item ref="queuesFormItem" :label="$t('BillGroup.Queues')" prop="queueList">
      <multi-tags-input
        id=""
        ref="queuesInput"
        v-model="queuePolicyForm.queueList"
        :new-tag-button-text="$t('BillGroup.Policy.FormItemTags.Add')"
        :valid-roles="queueRules"
        :disabled="mode == 'delete'"
        @tag-change="tagChange" />
    </a-form-model-item>
    <a-form-model-item
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
    <a-form-model-item
      v-for="(item, index) in queuePolicyForm.gResourceChargeRate"
      :ref="'gResourceChargeRate' + index"
      :key="item.id"
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
  </composite-form-dialog>
</template>
<script>
import BillGroupService from '../../service/bill-group'
import CompositeFormDialog from '../../component/composite-form-dialog'
import MultiTagsInput from '../../component/multi-tags-input'
import BillingRateInput from './billing-rate-input'
import ValidRoleFactory from '../../common/valid-role-factory'
import Format from '../../common/format'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
    'multi-tags-input': MultiTagsInput,
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
      gresource: window.gApp.$store.getters['settings/getGResource'],
      queuePolicyForm: {
        chargeRate: '1.00',
        cpuChargeRateTimeType: 'hour',
        memoryChargeRate: '1.00',
        memoryChargeRateTimeType: 'hour',
        queueList: [],
        gResourceChargeRate: [],
        gResourceChargeRateTimeType: [],
      },
      queueRules: [
        ValidRoleFactory.getLengthRoleForText(this.$t('BillGroup.Queues'), 1, 20),
        ValidRoleFactory.getValidQueueNameRoleForText(this.$t('BillGroup.Queues')),
      ],
      queuePolicyFormRules: {
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
        queueList: [
          ValidRoleFactory.getRequireRoleForText(this.$t('BillGroup.Queues')),
          ValidRoleFactory.getUniqueRoleForArray(this.$t('BillGroup.Queues')),
          ValidRoleFactory.getLengthRoleForArray(this.$t('BillGroup.Queues'), 0, 200),
        ],
      },
    }
  },
  watch: {
    innerCpuChargeRate: {
      handler: function (val, oldVal) {
        this.queuePolicyForm.chargeRate = val.value
        this.queuePolicyForm.cpuChargeRateTimeType = val.timeUnit
        this.$nextTick(() => {
          this.$refs.chargeRateFormItem.validate()
        })
      },
      deep: true,
    },
    innerMemoryChargeRate: {
      handler: function (val, oldVal) {
        this.queuePolicyForm.memoryChargeRate = val.value
        this.queuePolicyForm.memoryChargeRateTimeType = val.timeUnit
        this.$nextTick(() => {
          this.$refs.memoryChargeRateFormItem.validate()
        })
      },
      deep: true,
    },
    innerGresRate: {
      handler: function (val, oldVal) {
        val.forEach((el, index) => {
          this.queuePolicyForm.gResourceChargeRate[index].value = el.value
          this.queuePolicyForm.gResourceChargeRateTimeType[index] = el.timeUnit
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
        this.queuePolicyForm.gResourceChargeRate.push({
          value: '1.00',
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
        this.queuePolicyForm.gResourceChargeRateTimeType.push('hour')
        this.innerGresRate.push({
          value: '0.0000',
          timeUnit: 'hour',
        })
      })
    },
    submitForm() {
      if (this.$refs.queuesInput.errorMessage.length > 0) {
        return new Promise((resolve, reject) => {
          reject(this.$refs.queuesInput.errorMessage)
        })
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
      this.queuePolicyForm.gResourceChargeRate.forEach((el, index) => {
        gresChargeRate[el.code] = parseFloat(el.value)
        data.gcr_display_type[el.code] = this.queuePolicyForm.gResourceChargeRateTimeType[index]
      })
      data.gresChargeRate = gresChargeRate
      data.gcr_minute = Object.assign(data.gcr_minute, gresChargeRate)
      data.cr_minute = this.queuePolicyForm.chargeRate
      data.cr_display_type = this.queuePolicyForm.cpuChargeRateTimeType
      data.mcr_minute = this.queuePolicyForm.memoryChargeRate
      data.mcr_display_type = this.queuePolicyForm.memoryChargeRateTimeType
      if (this.queuePolicyForm.cpuChargeRateTimeType === 'hour') {
        data.cr_minute = 0
      }
      if (this.queuePolicyForm.memoryChargeRateTimeType === 'hour') {
        data.mcr_minute = 0
      }
      this.queuePolicyForm.gResourceChargeRateTimeType.forEach((el, index) => {
        if (el === 'hour') {
          data.gcr_minute[this.queuePolicyForm.gResourceChargeRate[index].code] = 0
        }
      })
      const submitData = Object.assign(data, this.queuePolicyForm)
      if (this.mode === 'create') {
        return BillGroupService.createBillGroupQueuePolicy(submitData)
      }
      if (this.mode === 'edit') {
        return BillGroupService.updateBillGroupQueuePolicy(this.billGroupId, submitData)
      }
      if (this.mode === 'delete') {
        return BillGroupService.deleteBillGroupQueuePolicy(this.billGroupId, this.queuePolicyForm.queuePolicyId)
      }
    },
    successMessageFormatter() {
      if (this.mode === 'create') {
        return this.$t('BillGroup.Queue.Create.Success')
      }
      if (this.mode === 'edit') {
        return this.$t('BillGroup.Queue.Edit.Success')
      }
      if (this.mode === 'delete') {
        return this.$t('BillGroup.Queue.Delete.Success')
      }
    },
    errorMessageFormatter(res) {
      const errMsg = res
      if (this.mode === 'create') {
        return this.queuePolicyForm.queueList + ' ' + errMsg
      }
      return errMsg
    },
    doCreate(billGroup) {
      this.mode = 'create'
      this.billGroupId = 0
      this.innerCpuChargeRate = {
        value: '1.00',
        timeUnit: 'hour',
      }
      this.innerMemoryChargeRate = {
        value: '1.00',
        timeUnit: 'hour',
      }
      this.queuePolicyForm = {
        chargeRate: '',
        cpuChargeRateTimeType: '',
        memoryChargeRate: '',
        memoryChargeRateTimeType: '',
        queuePolicyId: billGroup.id,
        queueList: [],
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
        const element = this.queuePolicyForm.gResourceChargeRate[index].code
        if (billGroup.gresChargeRateDisplayType[element] === 'minute') {
          el.value = billGroup.gresChargeRateMinute[element]
            ? Format.formatBillingRate(billGroup.gresChargeRateMinute[element])
            : '0.00'
        } else {
          el.value = billGroup.gresChargeRate[element]
            ? Format.formatBillingRate(billGroup.gresChargeRate[element])
            : '0.00'
        }
        el.timeUnit = billGroup.gresChargeRateDisplayType[element]
          ? billGroup.gresChargeRateDisplayType[element]
          : 'hour'
        return el
      })
      this.$nextTick(() => {
        this.$refs.queuesInput.cleanInput()
      })
      this.title = this.$t('BillGroup.Queue.Create.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEdit(billGroup, policy) {
      this.mode = 'edit'
      this.billGroupId = billGroup.id
      this.queuePolicyForm = {
        chargeRate: '',
        cpuChargeRateTimeType: '',
        memoryChargeRate: '',
        memoryChargeRateTimeType: '',
        queuePolicyId: policy.id,
        queueList: policy.queueList,
        gResourceChargeRate: [],
        gResourceChargeRateTimeType: [],
      }
      this.initGResource()
      this.innerCpuChargeRate = {
        value:
          policy.chargeRateDisplayType === 'minute'
            ? Format.formatBillingRate(policy.chargeRateMinute, false)
            : Format.formatBillingRate(policy.chargeRate, false),
        timeUnit: policy.chargeRateDisplayType,
      }
      this.innerMemoryChargeRate = {
        value:
          policy.memoryChargeRateDisplayType === 'minute'
            ? Format.formatBillingRate(policy.memoryChargeRateMinute, false)
            : Format.formatBillingRate(policy.memoryChargeRate, false),
        timeUnit: policy.memoryChargeRateDisplayType,
      }
      this.innerGresRate = this.innerGresRate.map((el, index) => {
        const element = this.queuePolicyForm.gResourceChargeRate[index].code
        if (policy.gresChargeRateDisplayType[element] === 'minute') {
          el.value = policy.gresChargeRateMinute[element]
            ? Format.formatBillingRate(policy.gresChargeRateMinute[element])
            : '0.00'
        } else {
          el.value = policy.gresChargeRate[element] ? Format.formatBillingRate(policy.gresChargeRate[element]) : '0.00'
        }
        el.timeUnit = policy.gresChargeRateDisplayType[element] ? policy.gresChargeRateDisplayType[element] : 'hour'
        return el
      })
      this.$nextTick(() => {
        this.$refs.queuesInput.cleanInput()
      })
      this.title = this.$t('BillGroup.Queue.Edit.Title', {
        id: billGroup.id,
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doDelete(billGroup, policy) {
      this.mode = 'delete'
      this.billGroupId = billGroup.id
      this.queuePolicyForm = {
        chargeRate: '',
        cpuChargeRateTimeType: '',
        memoryChargeRate: '',
        memoryChargeRateTimeType: '',
        queuePolicyId: policy.id,
        queueList: policy.queueList,
        gResourceChargeRate: [],
        gResourceChargeRateTimeType: [],
      }
      this.initGResource()
      this.innerCpuChargeRate = {
        value:
          policy.chargeRateDisplayType === 'minute'
            ? Format.formatBillingRate(policy.chargeRateMinute, false)
            : Format.formatBillingRate(policy.chargeRate, false),
        timeUnit: policy.chargeRateDisplayType,
      }
      this.innerMemoryChargeRate = {
        value:
          policy.memoryChargeRateDisplayType === 'minute'
            ? Format.formatBillingRate(policy.memoryChargeRateMinute, false)
            : Format.formatBillingRate(policy.memoryChargeRate, false),
        timeUnit: policy.memoryChargeRateDisplayType,
      }
      this.innerGresRate = this.innerGresRate.map((el, index) => {
        const element = this.queuePolicyForm.gResourceChargeRate[index].code
        if (policy.gresChargeRateDisplayType[element] === 'minute') {
          el.value = policy.gresChargeRateMinute[element]
            ? Format.formatBillingRate(policy.gresChargeRateMinute[element])
            : '0.00'
        } else {
          el.value = policy.gresChargeRate[element] ? Format.formatBillingRate(policy.gresChargeRate[element]) : '0.00'
        }
        el.timeUnit = policy.gresChargeRateDisplayType[element] ? policy.gresChargeRateDisplayType[element] : 'hour'
        return el
      })
      this.$nextTick(() => {
        this.$refs.queuesInput.cleanInput()
      })
      this.title = this.$t('BillGroup.Queue.Delete.Title', {
        id: policy.id,
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    tagChange() {
      this.$refs.queuesFormItem.validate()
    },
  },
}
</script>
<style>
.bill-rate-input-item .ant-form-item-children .ant-select {
  width: 130px;
}
</style>
