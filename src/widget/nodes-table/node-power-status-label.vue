<template>
  <state-label :state="status.state" :loading="status.loading">
    {{ status.display }}
  </state-label>
</template>
<script>
import StateLabel from '@/component/state-label.vue'

export default {
  components: {
    'state-label': StateLabel,
  },
  props: ['powerStatus'],
  data() {
    return {
      statusMapping: {
        off: {
          state: 'fatal',
          loading: false,
          display: this.$t('Node.PowerStatus.Off'),
        },
        on: {
          state: 'success',
          loading: false,
          display: this.$t('Node.PowerStatus.On'),
        },
      },
    }
  },
  computed: {
    status() {
      return this.statusMapping[this.powerStatus.toLowerCase()]
    },
  },
}
</script>
<style scoped></style>
