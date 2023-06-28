<template>
  <span>
    <span class="degree-label" :style="{ backgroundColor: bgColor }" />
    <slot />
  </span>
</template>
<script>
import GradientColor from '../common/gradient-color'

export default {
  props: {
    max: {
      type: Number,
      required: true,
    },
    // eslint-disable-next-line vue/require-default-prop
    current: {
      type: Number,
      required: false,
    },
  },
  data() {
    return {
      zeroColor: '#888888',
      beginColor: '#45CB84',
      endColor: '#FF0000',
    }
  },
  computed: {
    bgColor() {
      if (this.current === 0) {
        return this.zeroColor
      }
      const colors = GradientColor.getGradientColor(this.beginColor, this.endColor, this.max)
      return colors[this.current - 1]
    },
  },
  methods: {},
}
</script>
<style scoped>
.degree-label {
  border-radius: 4px;
  /* color: #fff; */
  display: inline-block;
  width: 16px;
  height: 16px;
  vertical-align: middle;
  font-size: 12px;
}
</style>
