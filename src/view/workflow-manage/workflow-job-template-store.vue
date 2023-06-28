<template>
  <workflow-modal-component>
    <job-template-store />
  </workflow-modal-component>
</template>

<script>
import WorkflowModal from './workflow-modal-component'
import JobTemplateStore from '../job-template-store'
export default {
  components: {
    'workflow-modal-component': WorkflowModal,
    'job-template-store': JobTemplateStore,
  },
  data() {
    return {}
  },
}
</script>

<style></style>
