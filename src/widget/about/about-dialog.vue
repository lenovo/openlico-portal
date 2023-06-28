<template>
  <a-modal
    ref="innerDialog"
    :visible="isRender"
    :title="$t('About')"
    :ok-text="$t('Action.Ok')"
    width="440px"
    :footer="false"
    @cancel="isRender = false">
    <div class="about-info">
      <div class="logo">
        <img src="/static/img/system/about/logo.png" :alt="$t('Login.Lico.Logo')" />
      </div>
    </div>
    <about-source-info></about-source-info>
  </a-modal>
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
<style lang="less" scoped>
.about-info {
  padding: 0px 96px;
  .logo {
    text-align: center;
  }
}
/deep/ .ant-modal-content {
  max-height: 800px;
  overflow-y: auto;
}
/deep/ .ant-modal-body {
  padding: 32px 40px 40px 40px;
}
</style>
