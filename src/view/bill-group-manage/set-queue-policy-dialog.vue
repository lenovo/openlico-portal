<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="500px"
    :form-model="queuePolicyForm"
    :form-rules="queuePolicyFormRules"
    :form-label-width="8"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-item ref="queuesFormItem" :label="$t('BillGroup.Queues')" name="queueList">
      <multi-tags-input
        ref="queuesInput"
        v-model:value="queuePolicyForm.queueList"
        :new-tag-button-text="$t('BillGroup.Policy.FormItemTags.Add')"
        :valid-roles="queueRules"
        :disabled="mode == 'delete'" />
    </a-form-item>
    <a-form-item class="bill-rate-input-item" :label="$t('BillGroup.CpuChargeRate')" name="chargeRate">
      <bill-rate-minute-hour-input
        v-model:value="queuePolicyForm.chargeRate"
        v-model:timeType="queuePolicyForm.cpuChargeRateTimeType"
        :currency="currency"
        :unit="$t('BillGroup.CpuChargeRate.Unit')"
        :disabled="mode == 'delete'" />
    </a-form-item>
    <a-form-item class="bill-rate-input-item" :label="$t('BillGroup.MemoryChargeRate')" name="memoryChargeRate">
      <bill-rate-minute-hour-input
        v-model:value="queuePolicyForm.memoryChargeRate"
        v-model:timeType="queuePolicyForm.memoryChargeRateTimeType"
        :currency="currency"
        :unit="$t('BillGroup.MemoryChargeRate.Unit')"
        :disabled="mode == 'delete'" />
    </a-form-item>
    <div v-for="(item, index) in queuePolicyForm.gResourceChargeRate" :key="item.id">
      <a-form-item
        class="bill-rate-input-item"
        :label="$T('BillGroup.GresChargeRate', { value: item.label })"
        :name="['gResourceChargeRate', index, 'value']"
        :rules="item.rules">
        <bill-rate-minute-hour-input
          v-model:value="item.value"
          v-model:timeType="queuePolicyForm.gResourceChargeRateTimeType[index]"
          :currency="currency"
          :unit="item.unit"
          :disabled="mode == 'delete'" />
      </a-form-item>
    </div>
  </composite-form-dialog>
</template>
<script>
import BillGroupService from '@/service/bill-group'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import MultiTagsInput from '@/component/multi-tags-input.vue'
import BillingRateInput from './billing-rate-input.vue'
import ValidRoleFactory from '@/common/valid-role-factory'
import Format from '@/common/format'
export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
    'multi-tags-input': MultiTagsInput,
    'bill-rate-minute-hour-input': BillingRateInput,
  },
  data() {
    return {
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
        ValidRoleFactory.getValidQueueNameRoleForText(this.$t('BillGroup.Queues')),
        ValidRoleFactory.getLengthRoleForText(this.$t('BillGroup.Queues'), 1, 20),
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
          ValidRoleFactory.getRequireRoleForArray(this.$t('BillGroup.Queues')),
          ValidRoleFactory.getUniqueRoleForArray(this.$t('BillGroup.Queues')),
          ValidRoleFactory.getLengthRoleForArray(this.$t('BillGroup.Queues'), 0, 200),
        ],
      },
    }
  },
  mounted() {
    this.initGResource()
  },
  methods: {
    initGResource(rate) {
      this.gresource.forEach(el => {
        this.queuePolicyForm.gResourceChargeRate.push({
          value: rate ? String(rate[el.code]) : '1.00',
          code: el.code,
          label: el.display_name,
          unit: el.unit,
          id: el.id,
          rules: [
            ValidRoleFactory.getRequireRoleForText(
              this.$T('BillGroup.GresChargeRate', {
                value: el.code.toUpperCase(),
              }),
            ),
            ValidRoleFactory.getValidNumberRoleForText(
              this.$T('BillGroup.GresChargeRate', {
                value: el.code.toUpperCase(),
              }),
            ),
            ValidRoleFactory.getNumberRangeRoleForText(
              this.$T('BillGroup.GresChargeRate', {
                value: el.code.toUpperCase(),
              }),
              0,
              999999.9999,
            ),
            ValidRoleFactory.getNumberDecimalRoleForText(
              this.$T('BillGroup.GresChargeRate', {
                value: el.code.toUpperCase(),
              }),
              4,
            ),
          ],
        })
        this.queuePolicyForm.gResourceChargeRateTimeType.push('hour')
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
      this.queuePolicyForm = {
        chargeRate: billGroup.chargeRate,
        cpuChargeRateTimeType: billGroup.cpuChargeRateTimeType,
        memoryChargeRate: billGroup.memoryChargeRate,
        memoryChargeRateTimeType: billGroup.memoryChargeRateDisplayType,
        queuePolicyId: billGroup.id,
        queueList: [],
        gResourceChargeRate: [],
        gResourceChargeRateTimeType: [],
      }
      this.initGResource(billGroup.gresChargeRate)
      ;(this.queuePolicyForm.chargeRate =
        billGroup.chargeRateDisplayType === 'minute'
          ? Format.formatBillingRate(billGroup.chargeRateMinute, false)
          : Format.formatBillingRate(billGroup.chargeRate, false)),
        (this.queuePolicyForm.cpuChargeRateTimeType = billGroup.chargeRateDisplayType),
        (this.queuePolicyForm.memoryChargeRate =
          billGroup.memoryChargeRateDisplayType === 'minute'
            ? Format.formatBillingRate(billGroup.memoryChargeRateMinute, false)
            : Format.formatBillingRate(billGroup.memoryChargeRate, false)),
        (this.queuePolicyForm.memoryChargeRateTimeType = billGroup.memoryChargeRateDisplayType),
        this.$nextTick(() => {
          this.$refs.queuesInput.cleanInput()
        })
      this.title = this.$t('BillGroup.Queue.Create.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEdit(billGroup, policy) {
      console.log(billGroup)
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
      this.initGResource(policy.gresChargeRate)
      ;(this.queuePolicyForm.chargeRate =
        policy.chargeRateDisplayType === 'minute'
          ? Format.formatBillingRate(policy.chargeRateMinute, false)
          : Format.formatBillingRate(policy.chargeRate, false)),
        (this.queuePolicyForm.cpuChargeRateTimeType = policy.chargeRateDisplayType),
        (this.queuePolicyForm.memoryChargeRate =
          policy.memoryChargeRateDisplayType === 'minute'
            ? Format.formatBillingRate(policy.memoryChargeRateMinute, false)
            : Format.formatBillingRate(policy.memoryChargeRate, false)),
        (this.queuePolicyForm.memoryChargeRateTimeType = policy.memoryChargeRateDisplayType),
        this.$nextTick(() => {
          this.$refs.queuesInput.cleanInput()
        })
      this.title = this.$T('BillGroup.Queue.Edit.Title', {
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
      this.initGResource(policy.gresChargeRate)
      ;(this.queuePolicyForm.chargeRate =
        policy.chargeRateDisplayType === 'minute'
          ? Format.formatBillingRate(policy.chargeRateMinute, false)
          : Format.formatBillingRate(policy.chargeRate, false)),
        (this.queuePolicyForm.cpuChargeRateTimeType = policy.chargeRateDisplayType),
        (this.queuePolicyForm.memoryChargeRate =
          policy.memoryChargeRateDisplayType === 'minute'
            ? Format.formatBillingRate(policy.memoryChargeRateMinute, false)
            : Format.formatBillingRate(policy.memoryChargeRate, false)),
        (this.queuePolicyForm.memoryChargeRateTimeType = policy.memoryChargeRateDisplayType),
        this.$nextTick(() => {
          this.$refs.queuesInput.cleanInput()
        })
      this.title = this.$T('BillGroup.Queue.Delete.Title', {
        id: policy.id,
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
