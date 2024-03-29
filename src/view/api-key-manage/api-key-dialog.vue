<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="450px"
    composite-height="440"
    :form-model="apiKeyForm"
    :form-rules="apiKeyRule"
    :external-validate="validateForm"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <template v-if="mode == 'edit'">
      <a-form-item v-if="apiKeyForm.ultimate" :label="$t('APIKey.EditDialog.OldExpireTime')">
        <a-checkbox v-model:checked="apiKeyForm.ultimate" disabled>
          {{ $t('APIKey.UnLimited') }}
        </a-checkbox>
      </a-form-item>
      <a-form-item v-else :label="$t('APIKey.EditDialog.OldExpireTime')">
        <a-date-picker v-model:value="apiKeyForm.expireTime" format="YYYY-MM-DD" disabled />
      </a-form-item>
      <a-form-item :label="$t('APIKey.EditDialog.NewExpireTime')" name="newUltimate">
        <a-checkbox v-model:checked="apiKeyForm.newUltimate">
          {{ $t('APIKey.UnLimited') }}
        </a-checkbox>
      </a-form-item>
      <a-form-item label=" " name="newExpireTime">
        <a-date-picker
          v-model:value="apiKeyForm.newExpireTime"
          format="YYYY-MM-DD"
          :disabled="apiKeyForm.newUltimate"
          :disabled-date="disabledDate" />
      </a-form-item>
    </template>
    <p v-if="mode == 'delete'" style="text-indent: 1em">
      <i class="a-icon-warning" style="color: red; font-size: 19px" />
      <span>{{ $t('APIKey.Delete.Msg') }}</span>
    </p>
  </composite-form-dialog>
</template>
<script>
import dayjs from '@/dayjs'
import APIKeyService from '@/service/api-key'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    return {
      title: '',
      mode: '',
      apiKeyForm: {
        ultimate: true,
        expireTime: '',
        newUltimate: false,
        newExpireTime: '',
      },
      apiKeyRule: {},
      disabledDate(current) {
        return current && current < dayjs().startOf('day')
      },
    }
  },
  methods: {
    submitForm() {
      if (this.mode === 'edit') {
        return APIKeyService.updateAPIKey(this.apiKeyForm)
      }
      if (this.mode === 'delete') {
        return APIKeyService.deleteAPIKey(this.apiKeyForm.id)
      }
    },
    successMessageFormatter(res) {
      if (this.mode === 'create') {
        return this.$t('APIKey.Create.Success')
      }
      if (this.mode === 'edit') {
        return this.$t('APIKey.Edit.Success')
      }
      if (this.mode === 'delete') {
        return this.$t('APIKey.Delete.Success')
      }
    },
    errorMessageFormatter(res) {
      const errMsg = res
      return this.$t(errMsg)
    },
    doEdit(apiKey) {
      this.mode = 'edit'
      this.apiKeyForm = {
        id: apiKey.id,
        value: apiKey.value,
        ultimate: apiKey.ultimate,
        expireTime: apiKey.expireTime,
        newUltimate: !apiKey.ultimate,
        newExpireTime: dayjs().endOf('day'),
      }
      this.title = this.$t('APIKey.EditDialog.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doDelete(apiKey) {
      this.mode = 'delete'
      this.apiKeyForm = {
        id: apiKey.id,
        value: apiKey.value,
      }
      this.title = this.$t('APIKey.DeleteDialog.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    validateForm(callbackFunc) {
      if (this.mode !== 'delete' && !this.apiKeyForm.newUltimate && !this.apiKeyForm.newExpireTime) {
        this.$message.error(this.$t('APIKey.CreateForm.Invalidation.Msg'))
        return false
      } else {
        callbackFunc(true)
      }
    },
  },
}
</script>
