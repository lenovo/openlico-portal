<template>
  <state-label :state="statusMapping[status].state" :loading="statusMapping[status].loading">
    {{ statusMapping[status].display }}
  </state-label>
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
      statusMapping: {
        success: {
          state: 'success',
          loading: false,
          display: this.$t('Status.Success'),
        },
        failure: {
          state: 'fatal',
          loading: false,
          display: this.$t('Status.Failed'),
        },
        uploading: {
          state: 'normal',
          loading: true,
          display: this.$t('Status.Uploading'),
        },
        waiting: {
          state: 'normal',
          loading: false,
          display: this.$t('Status.Waiting'),
        },
      },
    }
  },
}
</script>
<style scoped></style>
