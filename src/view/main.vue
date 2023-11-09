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
        <router-view v-slot="{ Component }">
          <keep-alive :max="4">
            <component :is="Component" v-if="$route.meta.keepAlive" />
          </keep-alive>
          <component :is="Component" v-if="!$route.meta.keepAlive" />
        </router-view>
      </div>
    </div>
    <main-tools />
  </div>
</template>
<script>
import leftbar from './main/leftbar.vue'
import topbar from './main/topbar.vue'
import MainTools from './main/main-tools.vue'
import BreadcrumbBar from '@/widget/breadcrumb-bar.vue'

export default {
  components: {
    leftbar,
    topbar,
    'breadcrumb-bar': BreadcrumbBar,
    MainTools,
  },
  computed: {
    isMin() {
      return window.gApp.isCollapse
    },
  },
}
</script>
<style>
.main-wrapper {
  min-height: 100%;
  position: relative;
  /* display: flex; */
  overflow: hidden;
}
.main-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  min-height: 100%;
  width: 236px;
  display: block;
  /* background-color: #001529; */
  transition:
    transform 0.3s ease-in-out,
    width 0.3s ease-in-out;
}
.main-sidebar-min {
  width: 80px;
}
.main-content-wrapper {
  height: 100%;
  /* width: 100%; */
  margin-left: 236px;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.3s ease-in-out,
    margin 0.3s ease-in-out;
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
