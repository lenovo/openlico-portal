<template>
  <workflow-modal-component>
    <job-template-ex />
  </workflow-modal-component>
</template>

<script>
import WorkflowModal from './workflow-modal-component.vue'
import JobTemplateEx from '../job-template-ex.vue'
export default {
  components: {
    'workflow-modal-component': WorkflowModal,
    'job-template-ex': JobTemplateEx,
  },
  data() {
    return {}
  },
}
</script>

<style scoped>
.workflow-job-template-store-modal .submit-job-bottom-button {
  margin-bottom: 20px;
}
</style>
