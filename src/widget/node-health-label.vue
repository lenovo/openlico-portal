<template>
  <state-label :state="innerState" />
</template>

<script>
import StateLabel from '../component/state-label'

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
    }
  },
  computed: {
    innerState: function () {
      return this.innerOptions[this.status]
    },
  },
}
</script>

<style scoped></style>
