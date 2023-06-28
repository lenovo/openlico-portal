<template>
  <state-label class="stateLabel" :state="currentState.state" :loading="currentState.loading">
    {{ currentState.display }}
  </state-label>
</template>
<script>
import StateLabel from '../../component/state-label'
export default {
  components: {
    'state-label': StateLabel,
  },
  props: ['arch', 'status', 'operateStatus', 'aiOperateStatus'],
  data() {
    return {
      currentState: {
        state: 'success',
        loading: false,
        display: '',
      },
      statusMapping: {
        completed: {
          state: 'success',
          loading: false,
          display: this.$t('Job.Status.Completed'),
        },
        queueing: {
          state: 'normal',
          loading: true,
          display: this.$t('Job.Status.Queueing'),
        },
        creating: {
          state: 'normal',
          loading: true,
          display: this.$t('Job.Status.Creating'),
        },
        running: {
          state: 'normal',
          loading: true,
          display: this.$t('Job.Status.Running'),
        },
        suspending: {
          state: 'normal',
          loading: true,
          display: this.$t('CloudTools.Status.Suspended'),
        },
        waiting: {
          state: 'normal',
          loading: true,
          display: this.$t('Job.Status.Waiting'),
        },
        holding: {
          state: 'normal',
          loading: true,
          display: this.$t('Job.Status.Holding'),
        },
        error: {
          state: 'fatal',
          loading: false,
          display: this.$t('Job.Status.Error'),
        },
        failed: {
          state: 'fatal',
          loading: false,
          display: this.$t('Job.Status.CreateFailed'),
        },
        cancelled: {
          state: 'warning',
          loading: false,
          display: this.$t('Job.Status.Cancelled'),
        },
        createfailed: {
          state: 'fatal',
          loading: false,
          display: this.$t('Job.Status.CreateFailed'),
        },
        unknown: {
          state: 'unknown',
          loading: false,
          display: this.$t('Cloud.Workspace.Status.Unknown'),
        },
        cancelling: {
          state: 'warning',
          loading: true,
          display: this.$t('Job.Status.Cancelling'),
        },
      },
    }
  },
  watch: {
    status(val) {
      this.currentState = this.getCurrentState()
    },
    operateStatus(val) {
      this.currentState = this.getCurrentState()
    },
    aiOperateStatus(val) {
      this.currentState = this.getCurrentState()
    },
  },
  mounted() {
    this.currentState = this.getCurrentState()
  },
  methods: {
    getCurrentState() {
      if (this.operateStatus === 'cancelling' || (this.operateStatus === 'cancelled' && this.status === 'running')) {
        if (this.aiOperateStatus === 'paused') {
          return {
            state: 'warning',
            loading: true,
            display: this.$t('Job.Status.Pausing'),
          }
        }
        return {
          state: 'warning',
          loading: true,
          display: this.$t('Job.Status.Cancelling'),
        }
      } else {
        if (this.aiOperateStatus === 'holding') {
          return {
            state: 'warning',
            loading: true,
            display: this.$t('Job.Status.Holding'),
          }
        }
        if (this.aiOperateStatus === 'hold') {
          return {
            state: 'warning',
            loading: false,
            display: this.$t('Job.Status.Hold'),
          }
        }
        if (this.aiOperateStatus === 'paused') {
          return {
            state: 'warning',
            loading: false,
            display: this.$t('Job.Status.Paused'),
          }
        }
        return this.statusMapping[this.status]
      }
    },
  },
}
</script>

<style scoped>
.stateLabel >>> .state-label {
  margin-right: 5px;
}
</style>
