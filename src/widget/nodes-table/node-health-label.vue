<template>
  <state-label :state="innerState">{{ label }}</state-label>
</template>

<script>
import StateLabel from '@/component/state-label.vue'

export default {
  components: {
    'state-label': StateLabel,
  },
  props: ['status'],
  data() {
    return {
      innerOptions: {
        ok: 'success',
        warning: 'warning',
        critical: 'error',
        failed: 'fatal',
        unknown: 'unknown',
      },
      healthOptions: [
        {
          label: this.$t('Node.Health.Status.Ok'),
          status: 'ok',
        },
        {
          label: this.$t('Node.Health.Status.Warning'),
          status: 'warning',
        },
        {
          label: this.$t('Node.Health.Status.Critical'),
          status: 'critical',
        },
        {
          label: this.$t('Node.Health.Status.Failed'),
          status: 'failed',
        },
        {
          label: this.$t('Node.Health.Status.Unknown'),
          status: 'unknown',
        },
      ],
    }
  },
  computed: {
    label() {
      let status = this.healthOptions.filter(v => v.status == this.status)[0]
      return status ? status.label : this.$t('Node.Health.Status.Unknown')
    },
    innerState: function () {
      return this.innerOptions[this.status] || 'unknown'
    },
  },
}
</script>

<style scoped></style>
