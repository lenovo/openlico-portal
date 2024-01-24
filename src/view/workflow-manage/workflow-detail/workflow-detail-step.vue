<template lang="">
  <li class="step-item">
    <div class="step-name-container">
      <h3 class="step-name">
        {{ step.name }}
      </h3>
    </div>
    <div class="step-container">
      <template v-for="item in step.stepJob" :key="item.id">
        <workflow-detail-job :step-job="item" />
      </template>
    </div>
  </li>
</template>
<script>
import workflowDetailJob from './workflow-detail-job.vue'
export default {
  components: {
    workflowDetailJob,
  },
  props: ['step'],
}
</script>
<style scoped>
.step-name {
  font-weight: bolder;
}
.step-item {
  padding: 10px;
  box-sizing: border-box;
}
.step-container {
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  height: 500px;
  overflow: auto;
}
</style>
