<template>
  <a-config-provider :locale="locale" :get-popup-container="getPopupContainer">
    <router-view />
  </a-config-provider>
</template>
<script>
import messageAntd from './locale/message-antd'

import moment from 'moment'
import 'moment/locale/zh-cn'

export default {
  data() {
    return {
      locale: messageAntd[this.$i18n.locale],
      moment,
      refreshLicense: null,
    }
  },
  watch: {
    '$i18n.locale'(val, old) {
      this.locale = messageAntd[val]
    },
  },
  created() {
    // Setting language
    this.$i18n.locale = this.$store.state.settings.langCode
  },
  mounted() {
    moment.locale(this.$i18n.locale)
  },
  beforeDestroy() {
    clearTimeout(this.refreshLicense)
  },
  methods: {
    getPopupContainer(triggerNode) {
      return triggerNode ? triggerNode.parentNode : document.body
    },
  },
}
</script>
