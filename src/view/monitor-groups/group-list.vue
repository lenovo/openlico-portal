<template>
  <nodes-table :node-external-filter="nodeExternalFilter" />
</template>
<script>
import NodesTable from '../../widget/nodes-table'
export default {
  components: {
    'nodes-table': NodesTable,
  },
  props: ['nodeExternalFilter'],
  data() {
    return {}
  },
}
</script>
<style></style>
