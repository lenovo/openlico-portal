<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="$t('Job.Comment')"
    size="500px"
    :form-model="commentForm"
    :form-rules="commentRules"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-model-item prop="comment">
      <a-textarea
        v-model="commentForm.comment"
        :auto-size="{ minRows: 6, maxRows: 10 }"
        :placeholder="$t('JobManager.Comment.Placeholder')"
        style="resize: none" />
    </a-form-model-item>
  </composite-form-dialog>
</template>
<script>
import JobService from '../../service/job'
import CompositeFormDialog from '../../component/composite-form-dialog'
import ValidRoleFactory from '../../common/valid-role-factory'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    return {
      jobId: null,
      commentForm: {
        comment: '',
      },
      commentRules: {
        comment: [ValidRoleFactory.getLengthRoleForText(this.$t('Job.Comment'), 0, 500)],
      },
    }
  },
  methods: {
    submitForm() {
      return JobService.editCommentForJob(this.jobId, this.commentForm.comment)
    },
    successMessageFormatter() {
      return this.$t('JobManager.Comment.Update.Success')
    },
    errorMessageFormatter(res) {
      const errMsg = res
      return this.$t(errMsg)
    },
    doEdit(job) {
      this.jobId = job.id
      this.commentForm = {
        comment: job.comment,
      }
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
