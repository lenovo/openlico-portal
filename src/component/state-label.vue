<template>
  <span>
    <span class="state-label" :class="'state-label-bg-' + state">
      <a-icon :type="loading ? 'loading' : '-'" />
    </span>
    <slot />
  </span>
</template>
<script>
export default {
  props: {
    state: {
      type: String,
      required: true,
      validator: function (value) {
        return ['pending', 'normal', 'success', 'warning', 'error', 'fatal', 'unknown'].indexOf(value) >= 0
      },
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
<style>
.state-label {
  border-radius: 4px;
  display: inline-block;
  width: 16px;
  height: 16px;
  vertical-align: middle;
  text-align: center;
  font-size: 12px;
  line-height: 15px;
}
</style>
