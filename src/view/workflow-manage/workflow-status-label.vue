<template>
  <state-label :state="currentState.state" :loading="currentState.loading">
    {{ currentState.display }}
  </state-label>
</template>
<script>
import StateLabel from '../../component/state-label'

export default {
  components: {
    'state-label': StateLabel,
  },
  props: ['status'],
  data() {
    return {
      currentState: {
        state: 'success',
        loading: false,
        display: '',
      },
      statusMapping: {
        created: {
          state: 'normal',
          loading: false,
          display: this.$t('Workflow.Status.Created'),
        },
        starting: {
          state: 'normal',
          loading: true,
          display: this.$t('Workflow.Status.Starting'),
        },
        running: {
          state: 'normal',
          loading: true,
          display: this.$t('Workflow.Status.Running'),
        },
        completed: {
          state: 'success',
          loading: false,
          display: this.$t('Workflow.Status.Completed'),
        },
        failed: {
          state: 'fatal',
          loading: false,
          display: this.$t('Workflow.Status.Failed'),
        },
        cancelled: {
          state: 'warning',
          loading: false,
          display: this.$t('Workflow.Status.Cancelled'),
        },
        cancelling: {
          state: 'warning',
          loading: true,
          display: this.$t('Workflow.Status.Cancelling'),
        },
      },
    }
  },
  watch: {
    status(val) {
      this.currentState = this.getCurrentState()
    },
  },
  mounted() {
    this.currentState = this.getCurrentState()
  },
  methods: {
    getCurrentState() {
      return this.statusMapping[this.status]
    },
  },
}
</script>
<style scoped></style>
