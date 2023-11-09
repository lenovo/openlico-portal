<template>
  <a-modal
    v-model:open="dialogVisible"
    width="500px"
    :title="$t('JobManage.ShowErrorMessage.Title')"
    @cancel="dialogVisible = false">
    <span>{{ errmsg }}</span>
    <template #footer>
      <span class="dialog-footer">
        <a-button type="primary" @click="dialogVisible = false"> {{ $t('Dialog.Ok') }}</a-button>
      </span>
    </template>
  </a-modal>
</template>
<script>
export default {
  data() {
    return {
      dialogVisible: false,
      errmsg: '',
    }
  },
  methods: {
    showErrorMessage(job) {
      this.dialogVisible = true
      this.errmsg = job.errmsg
    },
  },
}
</script>
<style></style>
