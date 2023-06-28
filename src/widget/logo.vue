<template lang="html">
  <div class="main-logo">
    <a :href="logolink" :class="isMinLogo ? 'logo-min' : 'logo-max'" :title="$t('Menu.MonitorDashboard')" />
  </div>
</template>
<script>
export default {
  props: ['logoUrl'],
  data() {
    return {
      logolink: '',
    }
  },
  computed: {
    isMinLogo() {
      return window.gApp.isCollapse
    },
  },
  watch: {
    logoUrl(val, oldVal) {
      this.logolink = '#' + val
    },
  },
  mounted() {
    this.logolink = '#' + this.logoUrl
  },
  methods: {},
}
</script>

<style lang="css">
.main-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 60px;
  background-color: #001529;
}
.logo-max {
  background: url('static/img/brand/logo_small.png') no-repeat;
  height: 32px;
  width: 60%;
  display: inline-block;
  background-size: contain;
}
.logo-min {
  background: url('static/img/brand/logo_icon.png') no-repeat;
  height: 35px;
  display: inline-block;
  width: 40%;
}
</style>
