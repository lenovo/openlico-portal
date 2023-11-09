<template>
  <span>
    <span class="state-status" :class="'state-label-bg-' + state">
      <loading-outlined v-if="loading" />
    </span>
    <span style="margin-left: 5px; font-size: 14px; line-height: 16px">
      <slot></slot>
    </span>
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
.state-status {
  border-radius: 4px;
  display: inline-block;
  width: 16px;
  height: 16px;
  vertical-align: text-bottom;
  text-align: center;
  font-size: 12px;
  line-height: 15px;
}
</style>
