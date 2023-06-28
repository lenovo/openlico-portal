<template>
  <a-modal :visible="visible" layout="vertical" width="400px" centered @ok="submitForm" @cancel="visible = false">
    <a-form-model ref="innerForm" :model="innerForm" :rules="rules">
      <a-form-model-item :label="$t('Node.HostName')" prop="hostname" :colon="false" :class="{ 'has-error': error }">
        <a-input v-model="innerForm.hostname" />
        <span v-if="error" class="ant-form-explain">{{ error }}</span>
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>
<script>
import AffinityService from './../../../service/job-template-affiity'
import ValidRoleFactory from './../../../common/valid-role-factory'
export default {
  data() {
    return {
      visible: false,
      innerForm: {
        hostname: '',
      },
      rules: {
        hostname: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Node.HostName')),
          ValidRoleFactory.getvalidMultiHostName(),
        ],
      },
      error: '',
      innerResolve: null,
      innerReject: null,
    }
  },
  methods: {
    submitForm() {
      this.$refs.innerForm.validate(vaild => {
        if (vaild) {
          AffinityService.getNodeHardware(this.innerForm.hostname).then(
            res => {
              this.error = ''
              this.innerResolve(res)
              this.visible = false
            },
            err => {
              this.error = err
            },
          )
        }
      })
    },
    doLoadNode() {
      return new Promise((resolve, reject) => {
        this.error = ''
        this.innerForm = {
          hostname: '',
        }
        this.innerResolve = resolve
        this.innerReject = reject
        this.visible = true
      })
    },
  },
}
</script>
<style></style>
