<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    :form-model="stepForm"
    :form-rules="stepFormRules"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-model-item :label="$t('Workflow.Step')" prop="step">
      <a-select v-model="stepForm.step">
        <a-select-option v-for="item in steps" :key="item.id" :value="item.id">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
  </composite-form-dialog>
</template>

<script>
import CompositeFormDialog from '../../component/composite-form-dialog'
import ValidRoleFactory from '../../common/valid-role-factory'
import WrokflowService from '../../service/workflow'
export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    return {
      title: this.$t('Workflow.Step.Select'),
      stepForm: {
        step: '',
      },
      stepFormRules: {
        step: [ValidRoleFactory.getRequireRoleForText(this.$t('Workflow.Step'))],
      },
      oldStepId: '',
      steps: [],
      job: null,
    }
  },
  methods: {
    submitForm() {
      return WrokflowService.moveWorkflowJob(this.oldStepId, this.stepForm.step, this.job.id)
    },
    successMessageFormatter(res) {
      return this.$t('Workflow.Job.Move.Success', {
        name: this.job.jobName,
      })
    },
    errorMessageFormatter(res) {
      const errMsg = res
      return this.$t(errMsg)
    },
    doMove(oldStepId, steps, job) {
      this.job = job
      this.oldStepId = oldStepId
      this.steps = [...steps]
      if (this.steps.length > 0) {
        this.$nextTick(() => {
          this.stepForm.step = this.steps[0].id
        })
      } else {
        this.stepForm.step = ''
      }
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>

<style></style>
