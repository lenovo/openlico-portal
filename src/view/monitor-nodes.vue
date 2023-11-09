<template>
  <div class="height--100 p-10">
    <nodes-table :node-external-filter="dataFilter" />
  </div>
</template>
<script>
import NodesTable from '@/widget/nodes-table.vue'
export default {
  components: {
    'nodes-table': NodesTable,
  },
  data() {
    return {
      dataFilter: {},
    }
  },
}
</script>
<style scoped></style>
