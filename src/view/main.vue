<template>
  <div class="main-wrapper">
    <div class="main-sidebar" :class="{ 'main-sidebar-min': isMin }">
      <leftbar />
    </div>
    <div class="main-content-wrapper" :class="{ 'main-content-wrapper-max': isMin }">
      <a-row>
        <topbar />
      </a-row>
      <div class="main-contents">
        <breadcrumb-bar />
        <keep-alive :include="keepAlivePages" :max="4">
          <router-view v-if="$route.meta.keepAlive" />
        </keep-alive>
        <router-view v-if="!$route.meta.keepAlive" />
      </div>
    </div>
    <main-tools />
  </div>
</template>
<script>
import leftbar from './main/leftbar'
import topbar from './main/topbar'
import MainTools from './main/main-tools'
import AccessService from '../service/access'
import BreadcrumbBar from '../widget/breadcrumb-bar'

export default {
  components: {
    leftbar,
    topbar,
    'breadcrumb-bar': BreadcrumbBar,
    MainTools,
  },
  beforeRouteLeave(to, from, next) {
    if (
      this.license.status === 'invalid' ||
      (this.license.licenseCode && this.license.licenseCode.includes('Evaluation') && this.license.status !== 'valid')
    ) {
      if (to.path === '/login') {
        next()
      } else {
        this.$message.error(this.license.licenseMessage)
      }
    } else {
      next()
    }
  },
  data() {
    return {
      arch: AccessService.getSchedulerArch(),
    }
  },
  computed: {
    isMin() {
      return window.gApp.isCollapse
    },
    license() {
      return this.$store.getters['settings/getLicense']
    },
    keepAlivePages() {
      return this.$store.getters['settings/getKeepAlivePages']
    },
  },
  mounted() {
    this.selectDefaultMenu()
  },
  methods: {
    selectDefaultMenu() {
      if (this.$route.path === '/main') {
        const menuList = AccessService.getMenuByAccess(this.$store.state.auth.access)
        if (
          this.license.status === 'invalid' ||
          (this.license.licenseCode &&
            this.license.licenseCode.includes('Evaluation') &&
            this.license.status === 'expired')
        ) {
          this.$router.push({ path: '/main/license-manage' })
        } else if (menuList.length > 0) {
          this.$router.push({ path: menuList[0].path })
        }
      }
    },
  },
}
</script>
<style>
/* @media (min-width:1000px) and (min-height: 750px) {
  .main-wrapper {
    height: 100%
  }
} */

.main-wrapper {
  min-height: 100%;
  position: relative;
  /*overflow: hidden;*/
}
.main-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  min-height: 100%;
  width: 236px;
  display: block;
  /* background-color: #001529; */
  transition: transform 0.3s ease-in-out, width 0.3s ease-in-out;
}
.main-sidebar-min {
  width: 80px;
}
.main-content-wrapper {
  height: 100%;
  margin-left: 236px;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease-in-out, margin 0.3s ease-in-out;
}
.main-content-wrapper-max {
  margin-left: 80px;
}
.main-contents {
  height: 100%;
  box-sizing: border-box;
  padding: 10px;
  display: flex;
  flex-direction: column;
}
</style>
