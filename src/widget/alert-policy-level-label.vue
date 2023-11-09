<template>
  <state-label v-if="level != null" :state="levelMapping[level].state" :loading="levelMapping[level].loading">
    {{ levelMapping[level].display }}
  </state-label>
</template>
<script>
import StateLabel from '@/component/state-label.vue'

export default {
  components: {
    'state-label': StateLabel,
  },
  props: ['level'],
  data() {
    return {
      levelMapping: {
        critical: {
          state: 'fatal',
          loading: false,
          display: this.$t('Alert.PolicyLevel.critical'),
        },
        error: {
          state: 'error',
          loading: false,
          display: this.$t('Alert.PolicyLevel.error'),
        },
        warning: {
          state: 'warning',
          loading: false,
          display: this.$t('Alert.PolicyLevel.warning'),
        },
        info: {
          state: 'normal',
          loading: false,
          display: this.$t('Alert.PolicyLevel.info'),
        },
      },
    }
  },
}
</script>
<style scoped></style>
