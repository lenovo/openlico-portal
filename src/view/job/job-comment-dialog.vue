<template>
  <composite-form-dialog
    ref="innerDialog"
    size="500px"
    :title="$t('Job.Comment')"
    :form-model="commentForm"
    :form-rules="commentRules"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-item name="comment">
      <a-textarea
        v-model:value="commentForm.comment"
        :auto-size="{ minRows: 6, maxRows: 10 }"
        :placeholder="$t('JobManager.Comment.Placeholder')"
        style="resize: none" />
    </a-form-item>
  </composite-form-dialog>
</template>
<script>
import JobService from '@/service/job'
import ValidRoleFactory from '@/common/valid-role-factory'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'

export default {
  components: {
    CompositeFormDialog,
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
