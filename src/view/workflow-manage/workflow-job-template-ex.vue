<template>
  <workflow-modal-component>
    <job-template-ex />
  </workflow-modal-component>
</template>

<script>
import WorkflowModal from './workflow-modal-component'
import JobTemplateEx from '../job-template-ex'
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

<style>
.workflow-job-template-store-modal .submit-job-bottom-button {
  margin-bottom: 20px;
}
</style>
