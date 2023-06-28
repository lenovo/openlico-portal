<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="500px"
    :form-model="jobForm"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter"
    type="confirm">
    <div>{{ jobActionConfirm }}</div>
  </composite-form-dialog>
</template>

<script>
import CompositeFormDialog from '../component/composite-form-dialog'
import JobService from '../service/job'

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
      } else if (this.jobActionType === 'batchCancel') {
        return JobService.batchCancelJob(this.jobId)
      } else if (this.jobActionType === 'delete') {
        return JobService.deleteJob(this.jobId)
      } else if (this.jobActionType === 'rerun') {
        return JobService.rerunJob(this.jobId)
      } else if (this.jobActionType === 'hold') {
        return JobService.holdJob(this.jobId)
      } else if (this.jobActionType === 'release') {
        return JobService.releaseJob(this.jobId)
      } else if (this.jobActionType === 'pause') {
        return JobService.pauseJob(this.jobId)
      } else if (this.jobActionType === 'resume') {
        return JobService.resumeJob(this.jobId)
      }
    },
    successMessageFormatter(res) {
      const job = res
      if (this.jobActionType === 'cancel') {
        return this.$t('JobManage.Cancel.Success', {
          name: this.jobName,
        })
      } else if (this.jobActionType === 'batchCancel') {
        return this.$t('JobManage.BatchCancel.Success', {
          count: this.jobName,
        })
      } else if (this.jobActionType === 'delete') {
        return this.$t('JobManage.Delete.Success', {
          name: this.jobName,
        })
      } else if (this.jobActionType === 'rerun') {
        if (job.schedulerId && job.schedulerId.length > 0) {
          return this.$t('JobManage.Rerun.Success', {
            name: this.jobName,
          })
        } else {
          const title = this.$t('Job.Submit.Error')
          const message = job.errmsg
          this.$message(message || title)
          return ''
          // return this.$message.error(this.$t('Job.Submit.Error', {id: job.id, name: job.name}));
        }
      } else if (this.jobActionType === 'hold') {
        return this.$t('JobManage.Hold.Success', {
          name: this.jobName,
        })
      } else if (this.jobActionType === 'release') {
        return this.$t('JobManage.Release.Success', {
          name: this.jobName,
        })
      } else if (this.jobActionType === 'pause') {
        return this.$t('JobManage.Pause.Success', {
          name: this.jobName,
        })
      } else if (this.jobActionType === 'resume') {
        return this.$t('JobManage.Resume.Success', {
          name: this.jobName,
        })
      }
    },
    errorMessageFormatter(res) {
      const errMsg = res
      return this.$t(errMsg)
    },
    doCancel(jobCancel) {
      this.jobActionType = 'cancel'
      this.jobActionConfirm = this.$t('JobManage.Cancel.Confirm')
      this.jobId = jobCancel.id
      this.jobName = jobCancel.name
      this.jobForm.name = jobCancel.name
      this.jobForm.id = jobCancel.id
      this.title = this.$t('JobManage.Cancel.Title', {
        name: jobCancel.name,
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doBatchCancel(jobCancel) {
      this.jobActionType = 'batchCancel'
      this.jobActionConfirm = this.$t('JobManage.BatchCancel.Confirm')
      this.jobId = jobCancel.id
      this.jobName = jobCancel.name.length
      this.jobForm.name = jobCancel.name.length
      this.jobForm.id = jobCancel.id.length
      this.title = this.$t('JobManage.BatchCancel.Title', {
        count: this.jobName,
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doDelete(jobDelete) {
      this.jobActionType = 'delete'
      this.jobActionConfirm = this.$t('JobManage.Delete.Confirm')
      this.jobId = jobDelete.id
      this.jobName = jobDelete.name
      this.jobForm.name = jobDelete.name
      this.jobForm.id = jobDelete.id
      this.title = this.$t('JobManage.Delete.Title', {
        name: jobDelete.name,
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doRerun(jobRerun) {
      this.jobActionType = 'rerun'
      this.jobActionConfirm = this.$t('JobManage.Rerun.Confirm')
      this.jobId = jobRerun.id
      this.jobName = jobRerun.name
      this.jobForm.name = jobRerun.name
      this.jobForm.id = jobRerun.id
      this.title = this.$t('JobManage.Rerun.Title', {
        name: jobRerun.name,
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
