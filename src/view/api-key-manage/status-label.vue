<template>
  <state-label :state="statusMapping[apiKeyStatus].state" :loading="statusMapping[apiKeyStatus].loading">
    {{ statusMapping[apiKeyStatus].display }}
  </state-label>
</template>
<script>
import StateLabel from '@/component/state-label.vue'

export default {
  components: {
    'state-label': StateLabel,
  },
  props: ['apiKeyStatus'],
  data() {
    return {
      statusMapping: {
        invalid: {
          state: 'fatal',
          loading: false,
          display: this.$t('APIKey.Invalid'),
        },
        valid: {
          state: 'success',
          loading: false,
          display: this.$t('APIKey.Valid'),
        },
      },
    }
  },
}
</script>
<style scoped></style>
