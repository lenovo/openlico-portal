<template>
  <span v-if="notStaff" class="alertstatus" :title="$t('Alert')">
    <a-badge :count="alertCount" :overflow-count="99" class="alertstatus-item" @click="viewAlerts">
      <i
        :class="alertCount > 0 ? 'el-erp-alerts alertstatus-icon-yello' : 'el-erp-noalerts alertstatus-icon-default'" />
    </a-badge>
  </span>
</template>
<script>
import AlertService from './../service/alert'
export default {
  data() {
    return {
      notStaff: this.$store.state.auth.access !== 'staff',
      refreshInterval: 30000,
      refreshTimeout: null,
      alertCount: 0,
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    clearTimeout(this.refreshTimeout)
    this.refreshTimeout = null
  },
  methods: {
    init() {
      clearTimeout(this.refreshTimeout)
      if (this.notStaff) {
        AlertService.getUnresolvedAlertCount()
          .then(
            res => {
              this.alertCount = res
            },
            err => {
              this.$message.error(err)
            },
          )
          .finally(_ => {
            this.refreshTimeout = setTimeout(() => {
              this.init()
            }, this.refreshInterval)
          })
      }
    },
    viewAlerts(e) {
      if (this.$route.path === '/main/alert-manage') {
        return
      }
      this.$router.push({ path: '/main/alert-manage' })
    },
  },
}
</script>
<style media="screen" scoped>
.alertstatus {
  cursor: pointer;
}
.alertstatus-item i {
  display: inline-block;
  font-size: 24px;
}
.alertstatus-icon-default {
  color: #999;
}
.alertstatus-icon-yello {
  color: #ffc107;
}
.alertstatus-item >>> .ant-badge-count {
  top: 2px;
  right: 3px;
}
</style>
