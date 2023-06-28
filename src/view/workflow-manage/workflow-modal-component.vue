<template>
  <div ref="rootContainer" class="workflow-job-template-store">
    <a-modal
      :visible="true"
      class="workflow-job-template-store-modal"
      :footer="null"
      :closable="false"
      :keyboard="false"
      :mask-closable="false"
      :get-container="() => $refs.rootContainer">
      <div class="left-content">
        <a-button
          v-if="$route.path.includes('workflow-job-template-ex') && !$route.path.includes('edit')"
          class="back"
          @click="stepBack">
          {{ $t('Breadcrumb.Back') }}
        </a-button>
        <a-button class="back-to-workflow" type="primary" @click="onBackClick">
          {{ $t('Workflow.BackToWorkflow') }}
          <a-icon type="rollback" />
        </a-button>
      </div>
      <div id="Workflow-Scroll-Modal-Container" class="right-content" style="background: #eee">
        <slot />
      </div>
    </a-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      workflowId: this.$route.params.workflowId,
    }
  },
  methods: {
    onBackClick() {
      this.$store.dispatch('settings/setpTemplateFilter', '')
      if (this.workflowId || this.workflowId === 0) {
        this.$router.replace(`/main/workflow-editor/${this.workflowId}`)
      } else {
        console.log('Lost workflow id')
      }
    },
    stepBack() {
      this.$router.replace(
        `/main/workflow-job-template-store/${this.$route.params.workflowId}/${this.$route.params.stepId}/${
          this.$store.state.settings.backFilter || "''"
        }`,
      )
    },
  },
}
</script>

<style>
.workflow-job-template-store-modal .ant-modal-content,
.workflow-job-template-store-modal .ant-modal-body {
  height: 100%;
  padding: 0;
  border-radius: 0;
  background-color: rgba(0, 0, 0, 0);
}
.workflow-job-template-store-modal .ant-modal-content {
  padding-right: 20px;
}
.workflow-job-template-store-modal .ant-modal {
  width: 100% !important;
  height: calc(100% - 64px);
}
.workflow-job-template-store-modal .ant-modal-wrap {
  overflow: hidden;
}
.workflow-job-template-store-modal .left-content,
.workflow-job-template-store-modal .right-content {
  float: left;
  height: 100%;
  position: relative;
  width: calc(100% - 256px);
  padding: 20px 0;
  overflow: auto;
  top: -40px;
}
.workflow-job-template-store-modal .left-content {
  width: 236px;
  margin-right: 20px;
  position: relative;
}
.workflow-job-template-store-modal .left-content .back,
.workflow-job-template-store-modal .left-content .back-to-workflow {
  position: absolute;
  left: 50%;
  width: 140px;
  transform: translate(-50%, -50%);
}
.workflow-job-template-store-modal .left-content .back-to-workflow {
  top: 50%;
}
.workflow-job-template-store-modal .left-content .back {
  top: 45%;
}
.workflow-job-template-store .ant-modal-mask {
  background-color: rgba(0, 0, 0, 0.8);
}
#Workflow-Scroll-Modal-Container .job-template-container {
  height: auto;
}
</style>
