<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="500px"
    :composite-height="mode == 'publish' ? 400 : 300"
    :form-model="jobTemplateForm"
    :form-rules="jobTemplateRules"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-model-item :label="$t('JobTemplate.Name')" prop="name">
      <a-input id="tid_job-template-name" v-model="jobTemplateForm.name" :disabled="true" />
    </a-form-model-item>
  </composite-form-dialog>
</template>
<script>
import JobTemplateService from '../../service/job-template'
import CompositeFormDialog from '../../component/composite-form-dialog'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    return {
      title: '',
      mode: '',
      jobTemplate: null,
      jobTemplateForm: {},
      jobTemplateRules: {},
    }
  },
  methods: {
    submitForm() {
      return JobTemplateService[`${this.mode}JobTemplate`](this.jobTemplate.code)
    },
    successMessageFormatter() {
      if (this.mode === 'delete') {
        return this.$t('JobTemplate.Delete.Success', {
          name: this.jobTemplate.name,
        })
      }
      if (this.mode === 'publish') {
        return this.$t('JobTemplate.Publish.Success', {
          name: this.jobTemplate.name,
        })
      }
      if (this.mode === 'unpublish') {
        return this.$t('JobTemplate.Unpublish.Success', {
          name: this.jobTemplate.name,
        })
      }
    },
    errorMessageFormatter(res) {
      const errMsg = res
      return this.$t(errMsg)
    },
    doDelete(jobTemplate) {
      this.mode = 'delete'
      this.jobTemplate = jobTemplate
      this.jobTemplateForm = {
        name: jobTemplate.name,
      }
      this.title = this.$t('JobTemplate.Delete.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doPublish(jobTemplate) {
      this.mode = 'publish'
      this.jobTemplate = jobTemplate
      this.$nextTick(() => {
        this.jobTemplateForm = {
          name: jobTemplate.name,
        }
      })
      this.title = this.$t('JobTemplate.Publish.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doUnpublish(jobTemplate) {
      this.mode = 'unpublish'
      this.jobTemplate = jobTemplate
      this.jobTemplateForm = {
        name: jobTemplate.name,
      }
      this.title = this.$t('JobTemplate.Unpublish.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
