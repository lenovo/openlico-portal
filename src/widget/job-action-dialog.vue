<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="500px"
    :form-model="{}"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter"
    :failed-close-dialog="failedCloseDialog"
    type="confirm">
    <div>{{ confirmMsg }}</div>
  </composite-form-dialog>
</template>

<script>
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import JobService from '@/service/job'
import AccessService from '@/service/access'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    return {
      title: '',
      jobId: [],
      jobName: '',
      action: '',
      confirmMsg: '',
      batch: false,
      scheduler: AccessService.getScheduler(),
    }
  },
  computed: {
    failedCloseDialog() {
      const closeAction = ['Cancel', 'Requeue', 'Hold', 'Release', 'Suspend', 'Resume', 'Delete']
      return closeAction.includes(this.action)
    },
  },
  methods: {
    submitForm() {
      if (this.action === 'Cancel') {
        if (this.batch) {
          return JobService.cancelBatchJob(this.jobId)
        }
        return JobService.cancelJob(this.jobId[0])
      } else if (this.action === 'Requeue') {
        return JobService.requeueJob(this.jobId)
      } else if (this.action === 'BatchCancel') {
        return JobService.batchCancelJob(this.jobId[0])
      } else if (this.action === 'Delete') {
        if (this.batch) {
          return JobService.deleteBatchJob(this.jobId)
        }
        return JobService.deleteJob(this.jobId[0])
      } else if (this.action === 'Rerun') {
        return JobService.rerunJob(this.jobId[0])
      } else if (this.action === 'Hold') {
        return JobService.holdJob(this.jobId)
      } else if (this.action === 'Release') {
        return JobService.releaseJob(this.jobId)
      } else if (this.action === 'Suspend') {
        return JobService.suspendJob(this.jobId)
      } else if (this.action === 'Resume') {
        return JobService.resumeJob(this.jobId)
      }
    },
    successMessageFormatter(res) {
      const job = res
      const mapActions = ['Cancel', 'Requeue', 'BatchCancel', 'Delete', 'Hold', 'Release', 'Suspend', 'Resume']
      if (this.batch) {
        return this.batchSuccessMessage(res)
      } else if (mapActions.includes(this.action)) {
        return this.$T(`JobManage.${this.action}.Success`, {
          name: this.jobName,
        })
      } else if (this.action === 'Rerun') {
        if (job.schedulerId && job.schedulerId.length > 0) {
          return this.$T('JobManage.Rerun.Success', {
            name: this.jobName,
          })
        } else {
          const title = this.$t('Job.Submit.Error')
          const message = job.errmsg
          return message || title
        }
      }
    },
    batchSuccessMessage(res) {
      let msgSuffix = 'Succeeded'
      let action = this.$t(`Action.${this.action}`)
      if (res.action_status === 'partial') {
        msgSuffix = 'Partial'
        action = action.toLowerCase()
      }
      return this.$T(`Job.Batch.${msgSuffix}`, { action })
    },
    errorMessageFormatter(res) {
      if (this.batch) {
        if (this.scheduler === 'pbs' && this.action === 'Requeue') {
          return res
        }
        return this.$T('Job.Batch.Failed', {
          action: this.$t(`Action.${this.action}`).toLowerCase(),
        })
      } else if (['Release', 'Hold', 'Suspend', 'Resume'].includes(this.action)) {
        return this.$t(`JobManage.${this.action}.Failed`)
      }
      return res
    },
    doCancel(job, batch) {
      return this.actionConfirm(job, 'Cancel', batch)
    },
    doRelease(job, batch) {
      return this.actionConfirm(job, 'Release', batch)
    },
    doRequeue(job, batch) {
      return this.actionConfirm(job, 'Requeue', batch)
    },
    doHold(job, batch) {
      return this.actionConfirm(job, 'Hold', batch)
    },
    doSuspend(job, batch) {
      return this.actionConfirm(job, 'Suspend', batch)
    },
    doResume(job, batch) {
      return this.actionConfirm(job, 'Resume', batch)
    },
    doDelete(job, batch) {
      return this.actionConfirm(job, 'Delete', batch)
    },
    doBatchCancel(jobCancel) {
      this.action = 'BatchCancel'
      this.confirmMsg = this.$t('JobManage.BatchCancel.Confirm')
      this.jobId = [jobCancel.id]
      this.jobName = jobCancel.name.length
      this.title = this.$T('JobManage.BatchCancel.Title', {
        count: this.jobName,
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doRerun(jobRerun) {
      this.action = 'Rerun'
      this.confirmMsg = this.$t('JobManage.Rerun.Confirm')
      this.jobId = [jobRerun.id]
      this.jobName = jobRerun.name
      this.title = this.$T('JobManage.Rerun.Title', {
        name: jobRerun.name,
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    actionConfirm(job, action, batch) {
      this.batch = batch
      this.action = action
      if (batch) {
        this.confirmMsg = this.$T('Job.Batch.Confirm', {
          action: this.$t(`Action.${action}`).toLowerCase(),
          count: job.length,
        })
        this.title = this.$T('Job.Batch.Title', {
          action: this.$t(`Action.${action}`),
        })
        this.jobId = job
      } else {
        this.confirmMsg = this.$t(`JobManage.${action}.Confirm`)
        this.jobId = [job.id]
        this.jobName = job.name
        this.title = this.$T(`JobManage.${action}.Title`, {
          name: job.name,
        })
      }
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
