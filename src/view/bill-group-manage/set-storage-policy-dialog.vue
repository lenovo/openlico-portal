<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="500px"
    :form-model="billGroupForm"
    :form-rules="billGroupRules"
    form-label-width="160px"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-item ref="storageFormItem" :label="$t('BillGroup.StoragePath')" name="pathList">
      <multi-tags-input
        ref="storageInput"
        v-model:value="billGroupForm.pathList"
        :new-tag-button-text="$t('BillGroup.Policy.FormItemTags.Add')"
        :valid-roles="pathRules"
        :disabled="mode == 'delete'" />
    </a-form-item>
    <a-form-item :label="$t('BillGroup.StorageChargeRate')" name="storageChargeRate">
      <a-input
        id="tid_billgroup-memory-charge-rate"
        v-model:value="billGroupForm.storageChargeRate"
        :disabled="mode == 'delete'"
        :addon-before="currency"
        :addon-after="$t('BillGroup.StorageChargeRate.Unit')" />
    </a-form-item>
  </composite-form-dialog>
</template>
<script>
import BillGroupService from '@/service/bill-group'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import MultiTagsInput from '@/component/multi-tags-input.vue'
import ValidRoleFactory from '@/common/valid-role-factory'
import Format from '@/common/format'
export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
    'multi-tags-input': MultiTagsInput,
  },
  data() {
    return {
      currency: this.$store.getters['settings/getCurrency'],
      title: '',
      mode: '',
      billGroupId: 0,
      billGroupForm: {
        storageChargeRate: '1.00',
        pathList: [],
      },
      pathRules: [ValidRoleFactory.getPathRole(this.$t('BillGroup.StoragePath'))],
      billGroupRules: {
        storageChargeRate: [
          ValidRoleFactory.getRequireRoleForText(this.$t('BillGroup.StorageChargeRate')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('BillGroup.StorageChargeRate')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('BillGroup.StorageChargeRate'), 0.0001, 999999.9999),
          ValidRoleFactory.getNumberDecimalRoleForText(this.$t('BillGroup.StorageChargeRate'), 4),
        ],
        pathList: [
          ValidRoleFactory.getRequireRoleForArray(this.$t('BillGroup.StoragePath')),
          ValidRoleFactory.getUniqueRoleForArray(this.$t('BillGroup.StoragePath')),
          ValidRoleFactory.getLengthRoleForArray(this.$t('BillGroup.StoragePath'), 0, 200),
        ],
      },
    }
  },
  methods: {
    submitForm() {
      if (this.$refs.storageInput.errorMessage.length > 0) {
        return new Promise((resolve, reject) => {
          reject(this.$refs.storageInput.errorMessage)
        })
      }
      if (this.mode === 'create') {
        return BillGroupService.createBillGroupStoragePolicy(this.billGroupForm)
      }
      if (this.mode === 'edit') {
        return BillGroupService.updateBillGroupStoragePolicy(this.billGroupForm)
      }
      if (this.mode === 'delete') {
        return BillGroupService.deleteBillGroupStoragePolicy(this.billGroupId, this.billGroupForm.id)
      }
    },
    successMessageFormatter() {
      if (this.mode === 'create') {
        return this.$t('BillGroup.Storage.Create.Success')
      }
      if (this.mode === 'edit') {
        return this.$t('BillGroup.Storage.Edit.Success')
      }
      if (this.mode === 'delete') {
        return this.$t('BillGroup.Storage.Delete.Success')
      }
    },
    errorMessageFormatter(res) {
      const errMsg = res
      if (this.mode === 'create') {
        return this.billGroupForm.pathList + this.$t(errMsg)
      }
      return res
    },
    doCreate(billGroup) {
      this.mode = 'create'
      this.billGroupId = 0
      this.billGroupForm = {
        billGroupId: billGroup.id,
        storageChargeRate: Format.formatBillingRate(billGroup.storageChargeRate, false),
        pathList: [],
      }
      this.$nextTick(() => {
        this.$refs.storageInput.cleanInput()
      })
      this.title = this.$t('BillGroup.Storage.Create.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEdit(billGroup, policy) {
      this.mode = 'edit'
      this.billGroupForm = {
        billGroupId: billGroup.id,
        id: policy.id,
        storageChargeRate: policy.storageChargeRate,
        pathList: policy.pathList,
      }
      this.$nextTick(() => {
        this.$refs.storageInput.cleanInput()
      })
      this.title = this.$T('BillGroup.Storage.Edit.Title', {
        id: billGroup.id,
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doDelete(billGroup, policy) {
      this.mode = 'delete'
      this.billGroupId = billGroup.id
      this.billGroupForm = {
        id: policy.id,
        storageChargeRate: policy.storageChargeRate,
        pathList: policy.pathList,
      }
      this.$nextTick(() => {
        this.$refs.storageInput.cleanInput()
      })
      this.title = this.$T('BillGroup.Storage.Delete.Title', {
        id: policy.id,
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
