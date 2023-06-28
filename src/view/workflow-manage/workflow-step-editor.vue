<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    :form-model="workflowForm"
    :form-rules="workflowRules"
    form-label-width="160px"
    :composite-height="400">
    <a-form-model-item :label="$t('Workflow.Name')" prop="name">
      <a-input v-model="workflowForm.name" />
    </a-form-model-item>
    <a-form-model-item :label="$t('Workflow.Description')" prop="description">
      <a-textarea v-model="workflowForm.description" :auto-size="{ minRows: 2 }" />
    </a-form-model-item>
  </composite-form-dialog>
</template>

<script>
import CompositeFormDialog from '../../component/composite-form-dialog'
import ValidRoleFactory from '../../common/valid-role-factory'
export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    return {
      mode: '',
      title: '',
      workflowForm: {
        name: '',
        order: '',
        description: '',
      },
      workflowRules: {
        name: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Workflow.Name')),
          ValidRoleFactory.getLengthRoleForText(this.$t('Workflow.Name'), 3, 32),
          ValidRoleFactory.getValidIdentityNameRoleIncludeChineseText(this.$t('Workflow.Name')),
        ],
      },
    }
  },
  methods: {
    submitForm() {
      return new Promise((resolve, reject) => {
        this.$refs.innerDialog.emptyPopup().then(
          res => {
            resolve(this.workflowForm)
          },
          err => {
            reject(err)
          },
        )
      })
    },
    doCreate(order) {
      this.title = this.$t('Workflow.CreateStep')
      this.workflowForm = {
        name: '',
        order,
        description: '',
      }
      return this.submitForm()
    },
    doEdit(step) {
      this.title = this.$t('Workflow.EditStep')
      this.workflowForm = {
        id: step.id,
        name: step.name,
        order: step.order,
        description: step.description,
      }
      return this.submitForm()
    },
  },
}
</script>

<style></style>
