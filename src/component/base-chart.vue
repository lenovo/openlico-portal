<template>
  <div ref="container" />
</template>

<script>
export default {
  inject: ['resize'],
  props: {
    chartOption: {
      type: Object,
      default: null,
    },
    chartTheme: {
      type: String,
      default: window.gApp.echartsTheme.common,
    },
  },
  watch: {
    // deep watcher for any change in chart configuration options
    chartOption: {
      handler(newVal) {
        this.setData()
      },
      deep: true,
    },
    resize(val) {
      this.resizeChart()
    },
  },
  async mounted() {
    await this.$nextTick()
    this.$chart.init(this.$refs.container, this.chartTheme)
    this.resizeChart()
    this.setData()
  },
  methods: {
    resizeChart() {
      this.$chart.getInstanceByDom(this.$refs.container).resize()
    },
    setData() {
      this.$chart.getInstanceByDom(this.$refs.container).setOption(this.chartOption)
    },
  },
}
</script>
