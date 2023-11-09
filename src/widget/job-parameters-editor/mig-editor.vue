<template>
  <a-select v-model:value="migType" class="jobtempalte-mig-select" @change="emitChange">
    <a-select-option v-for="item in migOptions" :key="item.key" :value="item.value">
      {{ item.label }}
    </a-select-option>
  </a-select>
</template>
<script>
export default {
  props: ['value', 'migOptions'],
  emits: ['input', 'update:value'],
  data() {
    return {
      migType: this.value,
    }
  },
  watch: {
    value(val) {
      this.migType = val
    },
  },
  methods: {
    emitChange() {
      this.$emit('input', this.migType)
      this.$emit('update:value', this.migType)
    },
  },
}
</script>
<style scoped>
.jobtempalte-mig-select {
  width: 300px;
}
</style>
