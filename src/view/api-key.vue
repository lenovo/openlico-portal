<template>
  <div v-if="requestStatus" id="API_Key_Container" class="height--100 p-10">
    <div v-if="apiKeys.length <= 0 && !createDialogVisable" class="table-style p-20 b-w" style="text-align: center">
      <div style="margin-top: 100px; margin-bottom: 35px">
        <img src="/static/img/system/main/api-key.svg" class="placeholder-img" />
      </div>
      <a-button id="API_Key_Create_Button" type="primary" @click="onCreate">
        {{ $t('APIKey.Create') }}
      </a-button>
    </div>
    <div v-if="apiKeys.length > 0 && !createDialogVisable" class="table-style p-20 b-w" style="text-align: center">
      <p class="api-key-title p-b-20">
        {{ $t('APIKey') }}
      </p>
      <div v-for="item in apiKeys" :key="item.id">
        <a-form
          id="API_Key_Edit_Form"
          ref="listForm"
          :model="item"
          layout="horizontal"
          :colon="false"
          :label-col="{ span: 4 }"
          class="m-t-20 m-b-20"
          style="border-bottom: 1px solid #eee">
          <a-form-item :label="$t('APIKey.Value')" class="input_align">
            <a-textarea
              v-model:value="item.value"
              class="input_width"
              read-only
              :auto-size="{ minRows: 2, maxRows: 4 }"
              style="resize: none" />
          </a-form-item>
          <a-form-item v-if="item.ultimate" :label="$t('APIKey.ExpireTime')" class="input_align">
            <a-checkbox v-model:checked="item.ultimate" disabled>
              <span style="color: rgba(51, 51, 51, 1)">{{ $t('APIKey.UnLimited') }} </span>
            </a-checkbox>
            <a-button type="primary" :disabled="!item.ultimate" class="m-l-20" @click="onChange(item)">
              {{ $t('APIKey.Change') }}
            </a-button>
          </a-form-item>
          <a-form-item v-if="!item.ultimate" :label="$t('APIKey.ExpireTime')" class="input_align">
            <a-date-picker
              v-model:value="item.expireTime"
              type="date"
              placeholder="Please choose a date"
              class="input_width"
              disabled />
            <a-button type="primary" :disabled="item.ultimate" style="margin-left: 5px" @click="onChange(item)">
              {{ $t('APIKey.Change') }}
            </a-button>
          </a-form-item>
          <a-form-item :label="$t('APIKey.Status')" class="input_align">
            <apikey-status-label :api-key-status="item.status ? 'valid' : 'invalid'" />
          </a-form-item>
        </a-form>
        <div class="input_align m-t-20">
          <a-button id="API_Key_Delete_Button" @click="onDelete(item)">
            {{ $t('APIKey.Delete') }}
          </a-button>
        </div>
      </div>
    </div>
    <div v-if="createDialogVisable" class="table-style p-20 b-w" style="text-align: center">
      <p class="title p-b-20">
        {{ $t('APIKey') }}
      </p>
      <a-form
        id="API_Key_Create_Form"
        ref="createForm"
        :model="apiKeyForm"
        :rules="apiKeyRules"
        layout="horizontal"
        :colon="false"
        :label-col="{ span: 4 }"
        class="m-t-20 m-b-20"
        style="border-bottom: 1px solid #eee">
        <a-form-item :label="$t('APIKey.Value')" class="input_align">
          <a-textarea
            v-model:value="apiKeyForm.value"
            class="input_width"
            read-only
            :auto-size="{ minRows: 2, maxRows: 4 }"
            style="resize: none" />
        </a-form-item>
        <a-form-item :label="$t('APIKey.ExpireTime')" class="input_align" name="ultimate">
          <a-checkbox v-model:checked="apiKeyForm.ultimate">
            <span style="color: rgba(51, 51, 51, 1)">{{ $t('APIKey.UnLimited') }} </span>
          </a-checkbox>
        </a-form-item>
        <a-form-item label=" " class="input_align" name="expireTime">
          <a-date-picker
            id="API_Key_Create_Expire_Date_Picker"
            v-model:value="apiKeyForm.expireTime"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="Please choose a date"
            :disabled="apiKeyForm.ultimate"
            :disabled-date="disabledDate"
            class="input_width" />
        </a-form-item>
      </a-form>
      <div class="input_align m-t-20">
        <a-button id="API_Key_Save_Button" type="primary" @click="doCreate">
          {{ $t('APIKey.Save') }}
        </a-button>
        <a-button id="API_Key_Cancel_Button" style="margin-left: 20px" @click="doCancel">
          {{ $t('APIKey.Cancel') }}
        </a-button>
      </div>
    </div>
    <api-key-dialog id="tid_api-key-dialog" ref="apiKeyDialog" />
  </div>
</template>

<script>
import dayjs from '@/dayjs'
import ApiKeyService from '@/service/api-key'
import ApiKeyStatusLabel from './api-key-manage/status-label.vue'
import ApiKeyDialog from './api-key-manage/api-key-dialog.vue'

export default {
  components: {
    'api-key-dialog': ApiKeyDialog,
    'apikey-status-label': ApiKeyStatusLabel,
  },
  data() {
    return {
      requestStatus: false,
      apiKeys: [],
      createDialogVisable: false,
      apiKeyForm: {
        value: '',
        ultimate: true,
        expireTime: '',
      },
      apiKeyRules: {},
      disabledDate(current) {
        return current && current < dayjs().startOf('day')
      },
    }
  },
  created() {
    this.syncKeys()
  },
  methods: {
    resetMyForm() {
      if (this.$refs.createForm) {
        this.$refs.createForm.resetFields()
      }
    },
    onCreate() {
      ApiKeyService.getKeyValue().then(result => {
        this.createDialogVisable = true
        this.apiKeyForm.value = result.api_key
      })
    },
    onDelete(item) {
      this.$refs.apiKeyDialog.doDelete(item).then(
        res => {
          this.syncKeys()
        },
        res => {},
      )
    },
    onChange(item) {
      this.$refs.apiKeyDialog.doEdit(item).then(
        res => {
          this.syncKeys()
        },
        res => {},
      )
    },
    syncKeys() {
      this.resetMyForm()
      ApiKeyService.listAPIKeys().then(
        res => {
          this.apiKeys = res
          this.requestStatus = true
        },
        _ => {},
      )
    },
    doCreate() {
      if (!this.apiKeyForm.ultimate && !this.apiKeyForm.expireTime) {
        this.$message.error(this.$t('APIKey.CreateForm.Invalidation.Msg'))
      } else {
        ApiKeyService.createAPIKey(this.apiKeyForm).then(res => {
          this.requestStatus = false
          this.createDialogVisable = false
          this.syncKeys()
          this.$message.success(this.$t('APIKey.Create.Success'))
        })
      }
    },
    doCancel() {
      this.syncKeys()
      this.createDialogVisable = false
    },
  },
}
</script>

<style scoped>
.api-key-title {
  position: relative;
  width: 100%;
  height: 22px;
  font-size: 16px;
  text-align: left;
  font-weight: 400;
  color: rgba(51, 51, 51, 1);
  line-height: 22px;
  border-bottom: 1px solid #eee;
}

.input_width {
  width: 300px;
}

.input_align {
  text-align: left;
}

.seperate_dashline {
  border-bottom: 1px dashed #eee;
}
</style>
