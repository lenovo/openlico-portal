<template>
  <a-modal v-model="visible" :title="title" :footer="null" width="450px" centered>
    <p v-for="msg in message" :key="msg.name">
      {{ msg.name + '=' + msg.value }}
    </p>
  </a-modal>
</template>
<script>
export default {
  data() {
    return {
      visible: false,
      title: this.$t('JobTemplate.Affinity.Environment'),
      message: '',
    }
  },
  methods: {
    onShow(data) {
      this.message = data
      this.visible = true
    },
  },
}
</script>
<style></style>
