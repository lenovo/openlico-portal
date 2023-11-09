<template>
  <div class="about-dialog">
    <a-modal ref="innerDialog" :open="isRender" width="440px" :footer="false" @cancel="isRender = false">
      <div class="about-info">
        <div class="logo">
          <img src="/static/img/system/about/logo.png" :alt="$t('Login.Lico.Logo')" />
        </div>
      </div>
      <about-source-info></about-source-info>
    </a-modal>
  </div>
</template>

<script>
import AoutSourceInfo from './about-source-info.vue'

export default {
  components: {
    'about-source-info': AoutSourceInfo,
  },
  data() {
    return {
      isRender: false,
    }
  },
  methods: {
    open() {
      this.isRender = true
    },
  },
}
</script>
<style scoped>
.about-info {
  padding: 0px 96px;
}
.logo {
  text-align: center;
}
.about-dialog :deep(.ant-modal-content) {
  max-height: 800px;
  overflow-y: auto;
}
.about-dialog :deep(.ant-modal-body) {
  padding: 32px 40px 40px 40px;
}
</style>
