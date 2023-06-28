<template>
  <a-modal
    ref="innerDialog"
    :title="title"
    :visible="isRender"
    class="build-authentication"
    :append-to-body="true"
    width="500px"
    @cancel="isRender = false"
    @ok="onSubmit">
    <a-form-model ref="innerForm" layout="vertical" :model="innerForm" :colon="false">
      <a-form-model-item prop="username">
        <span slot="label">
          {{ $t('Image.Build.Authentication.Username') }}
          <a-tooltip
            overlay-class-name="helpTooltip"
            placement="topLeft"
            :title="$t('Image.Build.Cert.Authentication.Username.Help')">
            <a-icon type="question-circle" theme="filled" class="help-icon" />
          </a-tooltip>
        </span>
        <a-input v-model="innerForm.username" :disabled="disabled" />
      </a-form-model-item>
      <a-form-model-item prop="password">
        <span slot="label">
          {{ $t('Image.Build.Authentication.Password') }}
          <a-tooltip
            overlay-class-name="helpTooltip"
            placement="topLeft"
            :title="$t('Image.Build.Cert.Authentication.Password.Help')">
            <a-icon type="question-circle" theme="filled" class="help-icon" />
          </a-tooltip>
        </span>
        <a-input v-model="innerForm.password" :type="isPasswordShow ? 'text' : 'password'" :disabled="disabled">
          <i
            slot="suffix"
            class="el-input__icon"
            :class="isPasswordShow ? 'el-erp-display' : 'el-erp-hide'"
            @click="isPasswordShow = !isPasswordShow" />
        </a-input>
      </a-form-model-item>
    </a-form-model>
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
      this.$refs.innerForm.validate(valid => {
        if (valid) {
          this.isRender = false
          this.innerResolve(this.innerForm)
        } else {
          // Do nothing
        }
      })
    },
  },
}
</script>
<style scoped>
.help-icon {
  color: #449fff;
}
.build-authentication >>> .ant-form-item-label {
  overflow: inherit !important;
}
</style>
