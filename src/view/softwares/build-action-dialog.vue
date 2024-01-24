<template>
  <composite-form-dialog ref="buildInnerDialog" :title="title" size="500px" :form-model="{}" type="confirm">
    <div>{{ confirmMsg }}</div>
  </composite-form-dialog>
</template>

<script>
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import SoftwaresService from '@/service/softwores'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    return {
      title: '',
      jobId: '',
      jobName: '',
      action: '',
      confirmMsg: '',
    }
  },
  methods: {
    submitAction() {
      if (this.action === 'Cancel') {
        return SoftwaresService.doCancelJob(this.jobId)
      }
      if (this.action === 'Clear') {
        return SoftwaresService.doClearJob(this.jobId)
      }
    },
    actionConfirm(job, action) {
      this.action = action
      this.confirmMsg = this.$T(`JobManage.${action}.Confirm`)
      this.jobId = job.id
      this.jobName = job.name
      this.title = this.$T(`JobManage.${action}.Title`, { name: job.name })
      return this.$refs.buildInnerDialog.popup(this.submitAction)
    },
    doCancel(job) {
      return this.actionConfirm(job, 'Cancel')
    },
    doClear(job) {
      return this.actionConfirm(job, 'Clear')
    },
  },
}
</script>
