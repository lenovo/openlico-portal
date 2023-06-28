<template>
  <a-modal
    width="500px"
    :title="$t('JobManage.ShowErrorMessage.Title')"
    :visible.sync="dialogVisible"
    @cancel="dialogVisible = false">
    <span>{{ errmsg }}</span>
    <span slot="footer" class="dialog-footer">
      <a-button type="primary" @click="dialogVisible = false"> {{ $t('Dialog.Ok') }}</a-button>
    </span>
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
