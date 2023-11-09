<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="500px"
    :form-model="jobForm"
    :success-message-formatter="successMessageFormatter"
    type="confirm">
    <div>{{ jobActionConfirm }}</div>
  </composite-form-dialog>
</template>

<script>
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import JobService from '@/service/job'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    return {
      title: '',
      jobId: '',
      jobName: '',
      jobForm: {
        name: '',
        id: 0,
      },
      jobActionType: '',
      jobActionConfirm: '',
    }
  },
  methods: {
    submitForm() {
      if (this.jobActionType === 'cancel') {
        return JobService.cancelJob(this.jobId)
      }
    },
    successMessageFormatter(res) {
      if (this.jobActionType === 'cancel') {
        return this.$T('CloudTools.Close.Success', {
          name: this.jobName,
        })
      }
    },
    doClose(cloudClose) {
      this.jobActionType = 'cancel'
      this.jobActionConfirm = this.$t('CloudTools.Close.Confirm')
      this.jobId = cloudClose.id
      this.jobName = cloudClose.name
      this.jobForm.name = cloudClose.name
      this.jobForm.id = cloudClose.id
      this.title = this.$T('CloudTools.Close.Title', {
        name: cloudClose.name,
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
