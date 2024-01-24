<template>
  <div class="sidebar lico-left-bar">
    <logo :logo-url="'/main'" />
    <cluster ref="cluster" />
    <a-menu
      v-model:selectedKeys="defaultSelected"
      mode="inline"
      theme="dark"
      :open-keys="defaultOpenKeys"
      :inline-collapsed="collapsed"
      @open-change="onOpenChange"
      @select="handleSelect"
      @click="selectMenu">
      <template v-for="item in filterDisplayMenu(menu.concat(quickLinkMenu))">
        <a-sub-menu
          v-if="item.children.length > 0"
          :id="'Menu_' + item.label"
          :key="item.label"
          popup-class-name="menu-sub-popup">
          <template #title>
            <li class="menu-item-content" role="list">
              <icon class="menu-item-content" :alt="formatLabel(item)">
                <template #component>
                  <span :class="`el-erp-${item.icon}`"></span>
                </template>
              </icon>
              <span class="menu-item-content">{{ formatLabel(item) }}</span>
            </li>
          </template>
          <a-menu-item v-for="child in filterDisplayMenu(item.children)" :id="'Menu_' + child.label" :key="child.path">
            <icon class="menu-item-content" :alt="formatLabel(child)">
              <template #component>
                <span :class="`el-erp-${child.icon}`"></span>
              </template>
            </icon>
            <span class="menu-item-content">{{ formatLabel(child) }}</span>
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item v-else :id="'Menu_' + item.label" :key="item.path" :title="formatLabel(item)">
          <icon class="menu-item-content" :alt="formatLabel(item)">
            <template #component>
              <span :class="`el-erp-${item.icon}`"></span>
            </template>
          </icon>
          <span :id="item.label" class="menu-item-content" style="white-space: nowrap">{{ formatLabel(item) }}</span>
        </a-menu-item>
      </template>
    </a-menu>
  </div>
</template>
<script>
import AccessService from '@/service/access'
import Logo from '@/widget/logo.vue'
import Cluster from '@/widget/cluster-status.vue'
import Icon from '@ant-design/icons-vue'

export default {
  components: { Icon, Logo, Cluster },
  data() {
    return {
      menu: [],
      quickLinkMenu: [],
      defaultSelected: [],
      openKeys: [],
      logoUrl: '',
      defaultOpenKeys: [],
    }
  },
  computed: {
    collapsed() {
      return window.gApp.isCollapse
    },
    license() {
      return this.$store.getters['settings/getLicense']
    },
  },
  watch: {
    collapsed(val) {
      if (!val) {
        this.defaultOpenKeys = this.openKeys
      } else {
        this.defaultOpenKeys = []
      }
    },
    $route(val) {
      this.setDefaultMenu()
    },
    license: {
      handler: function (val, oldVal) {
        this.setDefaultMenu('license')
      },
      deep: true,
    },
    defaultSelected(val) {
      this.menu.forEach(item => {
        item.children.forEach(subItem => {
          if (subItem.path === val[0]) {
            this.openKeys = [item.label]
            this.defaultOpenKeys = [item.label]
          }
        })
      })
    },
  },
  mounted() {
    this.setDefaultMenu()
    this.initQuickLinkMenu()
  },
  methods: {
    onOpenChange(openKeys) {
      if (openKeys.length > 1) {
        const latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1)
        this.openKeys = latestOpenKey ? [latestOpenKey] : []
      } else {
        this.openKeys = openKeys
      }
      this.defaultOpenKeys = this.openKeys
    },

    handleSelect(item) {
      this.defaultSelected = item.selectedKeys
    },
    selectMenu(item) {
      if (item.key === '/monitor-screen') {
        window.open(window.location.origin + '/#/monitor-screen')
        return false
      }
      if (item.key.indexOf('http') === 0) {
        window.open(item.key)
      } else {
        if (this.$route.fullPath === item.key) {
          return false
        }
        window.gApp.$router.push({ path: item.key })
      }
    },
    setDefaultMenu(type) {
      let path = this.$route.path
      // const reg = RegExp(`\/${}`)
      // for (const key in this.$route.params) {
      //   if (this.$route.params[key]) path = path.replace('/' + this.$route.params[key], '')
      // }
      if (type !== 'license' && this.defaultSelected.length && this.defaultSelected[0] === path) return
      const access = this.$store.state.auth.access
      this.menu = AccessService.getMenuByAccess(access)
      const menuItem = this.filterMenuByPath(this.menu, path)
      if (menuItem) {
        this.defaultSelected = [menuItem.path]
      }

      if (/\/main(\/)?$/.test(this.$route.path)) {
        this.$router.push({ path: this.menu[0].path })
      }
    },
    initQuickLinkMenu() {
      AccessService.getQuickLinkMenu(this.$store.state.auth.access).then(
        res => {
          this.quickLinkMenu = res
        },
        res => {
          this.$message.error(res)
        },
      )
    },
    formatLabel(menu) {
      if (menu.quickLink) {
        return menu.label
      }
      return this.$t('Menu.' + menu.label)
    },
    filterDisplayMenu(menuList) {
      const filterMenuList = []
      menuList.forEach(function (item) {
        if (item.display !== 'none') {
          filterMenuList.push(item)
        }
      })
      return filterMenuList
    },
    filterMenuByPath(menu, path) {
      let result = false
      for (let i = 0; i < menu.length; i++) {
        const paramKey = menu[i].param
        let temp_path = path.replace(/\/$/, '')
        if (paramKey && this.$route.params[paramKey]) {
          let arr = path.split(`/${this.$route.params[paramKey]}`)
          if (arr.length > 2) {
            temp_path = `${arr[0]}/${this.$route.params[paramKey]}${arr[1]}`
          } else {
            temp_path = arr[0]
          }
        }
        if (menu[i].path === temp_path) {
          result = menu[i]
          break
        }
        if (menu[i].children) {
          result = this.filterMenuByPath(menu[i].children, path)
          if (result) break
        }
        if (menu[i].details) {
          result = this.filterMenuByPath(menu[i].details, path)
          if (result) {
            result = menu[i]
            break
          }
        }
      }
      return result
    },
  },
}
</script>
<style>
.sidebar {
  display: flex;
  flex-direction: column;
}
.menu-sub-popup {
  width: 200px;
}
.menu-item-content {
  display: inline-block;
  height: 16px !important;
  width: 16px !important;
  line-height: 16px !important;
  font-size: 14px !important;
}
</style>
