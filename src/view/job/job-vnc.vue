<template>
  <div class="job-detail-vnc">
    <div class="job-detail-vnc-item">
      <span class="job-detail-vnc-item-label">{{ $t('User.Password') }}</span>
      <span class="job-detail-vnc-item-value">{{ showPass ? job.pass : '******************' }}</span>
      <span :title="$t('Action.Copy')" class="job-detail-vnc-item-action el-erp-copy m-l-20" @click="onCopyPass" />
      <span
        class="job-detail-vnc-item-action m-l-20"
        :class="`el-erp-${showPass ? 'display' : 'hide'}`"
        @click="showPass = !showPass" />
    </div>
    <a-button v-if="job.vnc" type="link" style="padding-left: 0" @click="openVNC">
      {{ $t('JobDetail.Intel.ToVNC') }}
    </a-button>
  </div>
</template>
<script>
export default {
  props: ['job'],
  data() {
    return {
      showPass: false,
    }
  },
  methods: {
    onCopyPass() {
      const input = document.createElement('input')
      input.setAttribute('value', this.job.pass)
      document.body.appendChild(input)
      input.select()
      if (document.execCommand('copy')) {
        document.execCommand('copy')
        this.$message.success(this.$t('Action.Copy.Msg.Success'))
      } else {
        this.$message.error(this.$t('Action.Copy.Msg.Failed'))
      }
      document.body.removeChild(input)
      input.remove()
    },
    openVNC() {
      window.open(this.job.vnc)
    },
  },
}
</script>
<style scoped>
.job-detail-vnc-item {
  margin: 20px 0;
  display: flex;
}
.job-detail-vnc-item-label,
.job-detail-vnc-item-value {
  min-width: 160px;
  line-height: 24px;
}
.job-detail-vnc-item-action:hover {
  cursor: pointer;
  color: #1890ff;
}
</style>
