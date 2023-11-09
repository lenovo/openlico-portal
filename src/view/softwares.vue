<template>
  <div class="m-10 p-l-20 p-r-20 b-w">
    <a-tabs default-active-key="modules" :animated="false">
      <a-tab-pane key="modules" :tab="$t('Softwares.Tabs.Modules')">
        <ModulesList />
      </a-tab-pane>
      <a-tab-pane key="easybuild" :tab="$t('Softwares.Tabs.EasyBuild')">
        <EasyBuild />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
import EasyBuild from './softwares/easy-build.vue'
import ModulesList from './softwares/modules-list.vue'
export default {
  components: { ModulesList, EasyBuild },
}
</script>
<style scoped></style>
