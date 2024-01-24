<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="500px"
    :form-model="formModel"
    :form-rules="formRules"
    :external-validate="externalValidate"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-item v-if="mode == 'add'" name="tags" label="">
      <a-select
        ref="jobTagSelect"
        v-model:value="formModel.tags"
        mode="tags"
        :options="tagsOptions"
        :token-separators="[',']"
        :placeholder="$T('JobManager.Tag.Placeholder', { length: tagLength })"
        class="job-tags-select-action"
        @blur="onJobTagSelectBlur"
        @focus="onJobTagSelectFocus" />
    </a-form-item>
    <div v-if="mode == 'add'" style="height: 220px" />
    <div v-if="mode == 'delete'">
      <p>{{ $t('JobManager.Tags.Clear.Content') }}</p>
      <p>{{ $t('Job.Id') + ': ' + deleteJobId }}</p>
    </div>
  </composite-form-dialog>
</template>

<script>
import JobService from '@/service/job'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'

export default {
  components: {
    CompositeFormDialog,
  },
  data() {
    const validateTags = (rule, value) => {
      const errors = []
      if (value.length) {
        value.forEach(item => {
          if (item.length > this.tagLength) {
            errors.push(new Error(this.$T('JobManager.Tag.validate.Length', { length: this.tagLength })))
          }
        })
        if (value.length > this.tagsCounts) {
          errors.push(new Error(this.$T('JobManager.Tag.Length.Valid', { counts: this.tagsCounts })))
        }
      }
      if (errors.length) {
        return Promise.reject(errors)
      } else {
        return Promise.resolve()
      }
    }
    return {
      tagLength: 20,
      tagsCounts: 10,
      title: '',
      mode: '',
      tagsOptions: [],
      formModel: {
        tags: [],
      },
      formRules: {
        tags: [{ validator: validateTags, trigger: 'change' }],
      },
      jobs: [],
      deleteJobId: '',
    }
  },
  methods: {
    submitForm() {
      const jobId = this.jobs.map(job => job.id)
      if (this.mode === 'add') {
        return JobService.AddTagsforJob(jobId, this.formModel.tags)
      }
      if (this.mode === 'delete') {
        return JobService.DeleteTagsforJob(jobId)
      }
    },
    onJobTagSelectFocus() {
      this.$refs.innerDialog.disableSubmit()
    },
    onJobTagSelectBlur() {
      this.$refs.innerDialog.enableSubmit()
    },
    successMessageFormatter(res) {
      if (res.failed.length) {
        const message = this.$t('JobManager.Jobs.Tags.Failed')
        this.showErrorContent(message, res.failed.join())
        return ''
      }
      return this.$t('JobManager.Tags.Success')
    },
    errorMessageFormatter(res) {
      return res
    },
    doAdd(jobs) {
      this.getTagsOptions()
      this.mode = 'add'
      this.formModel = {
        tags: [],
      }
      this.jobs = jobs
      this.title = this.$t('JobManager.Add.Tags')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doDelete(jobs) {
      this.mode = 'delete'
      this.title = this.$t('JobManager.Clear.Tags')
      this.jobs = jobs
      this.deleteJobId = jobs.map(job => job.id).join(', ')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    getTagsOptions() {
      JobService.getAllJobTags().then(
        res => {
          this.tagsOptions = res.map(i => {
            return {
              label: i,
              value: i,
              key: i,
            }
          })
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    externalValidate(callbackFunc) {
      if (this.mode === 'add') {
        const validJobs = this.jobs.filter(job => job.tags.length + this.formModel.tags.length > this.tagsCounts)
        if (validJobs.length) {
          const jobs = validJobs.map(job => job.id).join(', ')
          const message = this.$T('JobManager.Tags.Length.Valid', { counts: this.tagsCounts })
          this.showErrorContent(message, jobs)
          callbackFunc(false)
        } else {
          callbackFunc(true)
        }
        return
      }
      callbackFunc(true)
    },
    showErrorContent(message, jobs) {
      this.$confirm({
        title: message,
        content: `${this.$t('Job.Id')}: ${jobs}`,
        type: 'error',
        icon: 'exclamation-circle',
        centered: true,
        okText: this.$t('Action.Confirm'),
        onOk: () => {},
      })
    },
  },
}
</script>
