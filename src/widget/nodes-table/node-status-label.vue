<template>
  <degree-label :max="statusSortList.length - 1" :current="statusSortList.indexOf(status)">
    {{ statusDisplay }}
  </degree-label>
</template>
<script>
import DegreeLabel from '@/component/degree-label.vue'

export default {
  components: {
    'degree-label': DegreeLabel,
  },
  props: ['status'],
  data() {
    return {
      statusSortList: ['off', 'idle', 'busy'],
      // statusSortList: ['off', 'idle', 'used', 'busy']
    }
  },
  computed: {
    statusDisplay() {
      let retVal
      if (this.status === 'off') {
        retVal = this.$t('NodeStatus.Off')
      }
      if (this.status === 'idle') {
        retVal = this.$t('NodeStatus.Idle')
      }
      // if (this.status == 'used') {
      //   return this.$t('NodeStatus.Used');
      // }
      if (this.status === 'busy') {
        retVal = this.$t('NodeStatus.Busy')
      }
      return retVal
    },
  },
}
</script>
<style scoped>
.node-status {
  margin-left: 5px;
  display: inline-block;
  line-height: 16px;
  font-size: 14px;
}
</style>
