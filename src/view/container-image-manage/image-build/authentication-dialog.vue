<template>
  <a-modal
    ref="innerDialog"
    v-model:open="isRender"
    :title="title"
    class="build-authentication"
    :append-to-body="true"
    width="500px"
    @cancel="isRender = false"
    @ok="onSubmit">
    <a-form ref="innerForm" layout="vertical" :model="innerForm" :colon="false">
      <a-form-item name="username">
        <template #label>
          <span>
            {{ $t('Image.Build.Authentication.Username') }}
            <a-tooltip
              overlay-class-name="helpTooltip"
              placement="topLeft"
              :title="$t('Image.Build.Cert.Authentication.Username.Help')">
              <QuestionCircleFilled class="help-icon" />
            </a-tooltip>
          </span>
        </template>
        <a-input v-model:value="innerForm.username" :disabled="disabled" />
      </a-form-item>
      <a-form-item name="password">
        <template #label>
          <span>
            {{ $t('Image.Build.Authentication.Password') }}
            <a-tooltip
              overlay-class-name="helpTooltip"
              placement="topLeft"
              :title="$t('Image.Build.Cert.Authentication.Password.Help')">
              <QuestionCircleFilled class="help-icon" />
            </a-tooltip>
          </span>
        </template>
        <a-input v-model:value="innerForm.password" :type="isPasswordShow ? 'text' : 'password'" :disabled="disabled">
          <template #suffix>
            <i
              class="el-input__icon"
              :class="isPasswordShow ? 'el-erp-display' : 'el-erp-hide'"
              @click="isPasswordShow = !isPasswordShow" />
          </template>
        </a-input>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script>
export default {
  props: ['disabled'],
  data() {
    return {
      compositeHeight: 300,
      title: '',
      isRender: false,
      innerForm: {
        username: '',
        password: '',
      },
      isPasswordShow: false,
      innerResolve: null,
      innerReject: null,
    }
  },
  methods: {
    resetForm() {
      // this.innerForm.resetFields();
      this.innerForm = {
        username: '',
        password: '',
      }
    },
    open(auth) {
      this.resetForm()
      this.title = this.$t('Image.Build.Authentication')
      this.isRender = true
      if (auth) {
        this.innerForm = {
          username: auth.username,
          password: auth.password,
        }
      }
      return new Promise((resolve, reject) => {
        this.innerResolve = resolve
        this.innerReject = reject
      })
    },
    onSubmit() {
      this.$refs.innerForm.validate().then(
        _ => {
          this.isRender = false
          this.innerResolve(this.innerForm)
        },
        _ => {},
      )
    },
  },
}
</script>
<style scoped>
.help-icon {
  color: #449fff;
}
.build-authentication :deep(.ant-form-item-label) {
  overflow: inherit !important;
}
</style>
