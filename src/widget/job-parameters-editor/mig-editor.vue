<template>
  <a-select v-model="migType" class="jobtempalte-mig-select" @change="$emit('input', migType)">
    <a-select-option v-for="item in migOptions" :key="item.key" :value="item.value">
      {{ item.label }}
    </a-select-option>
  </a-select>
</template>
<script>
export default {
  props: ['value', 'migOptions'],
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
}
</script>
<style scoped>
.jobtempalte-mig-select {
  width: 300px;
}
</style>
