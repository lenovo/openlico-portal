<template>
  <div style="text-align: center; padding: 30px 0">
    <div>
      <img :src="`/static/img/system/main/launch.png`" alt="" />
    </div>
    <a-button type="primary" style="margin-top: 25px" @click="onViewClick">{{ $t('Action.View') }}</a-button>
  </div>
</template>
<script>
export default {
  props: ['launchUrl'],
  methods: {
    onViewClick() {
      window.open(window.location.origin + this.launchUrl)
    },
  },
}
</script>
