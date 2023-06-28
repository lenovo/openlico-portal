<template>
  <span class="main-tools">
    <i
      style="font-size: 20px; color: #5fbdfc; cursor: pointer"
      :class="`el-erp-Tools${visible ? 'off' : 'on'}`"
      :title="$t('Menu.SystemTools')"
      @click="onClick" />
  </span>
</template>
<script>
export default {
  computed: {
    visible() {
      return window.gApp.mainToolsVisible
    },
  },
  methods: {
    onClick() {
      const event = new Event('onMainToolsVisible')
      window.dispatchEvent(event)
    },
  },
}
</script>
