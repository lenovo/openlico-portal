<template>
  <a-modal
    :title="$t('Node.Detail.Title')"
    width="1400px"
    destroy-on-close
    :open="dialogVisible"
    :footer="null"
    @cancel="dialogVisible = false">
    <node-panel v-if="nodeName" id="tid_node-detail-panel" :node-name="nodeName" style="min-width: 850px" />
  </a-modal>
</template>
<script>
import NodePanel from '../node-panel.vue'

export default {
  components: {
    'node-panel': NodePanel,
  },
  props: [],
  data() {
    return {
      nodeName: 0,
      dialogVisible: false,
    }
  },
  methods: {
    showDetail(name) {
      this.nodeName = name
      this.dialogVisible = true
    },
  },
}
</script>
<style></style>
