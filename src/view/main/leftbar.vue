<template>
  <div class="sidebar lico-left-bar">
    <logo :logo-url="logoUrl" />
    <cluster ref="cluster" />
    <a-menu
      v-model="defaultSelected"
      mode="inline"
      theme="dark"
      :open-keys="defaultOpenKeys"
      :inline-collapsed="collapsed"
      :force-sub-menu-render="true"
      @openChange="onOpenChange"
      @select="handleSelect"
      @click="selectMenu">
      <template v-for="item in filterDisplayMenu(menu.concat(quickLinkMenu))">
        <a-sub-menu v-if="item.children.length > 0" :id="'Menu_' + item.label" :key="item.label">
          <li slot="title" class="menu-item-content" role="list">
            <a-icon class="menu-item-content" :component="getMenuIcon(item.icon)" />
            <span class="menu-item-content">{{ formatLabel(item) }}</span>
          </li>
          <a-menu-item v-for="child in filterDisplayMenu(item.children)" :id="'Menu_' + child.label" :key="child.path">
            <a-icon class="menu-item-content" :component="getMenuIcon(child.icon)" />
            <span class="menu-item-content">{{ formatLabel(child) }}</span>
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item v-else :id="'Menu_' + item.label" :key="item.path">
          <a-icon class="menu-item-content" :component="getMenuIcon(item.icon)">
            {{ outLogoUrl(item) }}
          </a-icon>
          <span :id="item.label" class="menu-item-content" style="white-space: nowrap">{{ formatLabel(item) }}</span>
        </a-menu-item>
      </template>
    </a-menu>
  </div>
</template>
<script>
import AuthService from './../../service/auth'
import AccessService from './../../service/access'
import menu from './../../menu/menu'
import Logo from './../../widget/logo'
import Cluster from './../../widget/cluster-status'

export default {
  components: { Logo, Cluster },
  data() {
    const access = this.$store.state.auth.access
    return {
      menu: AccessService.getMenuByAccess(access),
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
        this.setDefaultMenu()
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
    // this.defaultSelected = window.location.hash.replace('#','');
    this.setDefaultMenu()
    this.initQuickLinkMenu()
  },
  methods: {
    getMenuIcon(icon) {
      return {
        template: `<span class="el-erp-${icon}"></span>`,
      }
    },
    logout() {
      AuthService.logout()
    },
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
    outLogoUrl(item) {
      if (item.icon === 'home') {
        this.logoUrl = item.path
      }
    },
    setDefaultMenu() {
      // If the license invalid, hide the menu except the license, and set the license-manage as the default menu
      // ------------------
      const access = this.$store.state.auth.access
      let onlyShowLicense = false
      if (
        this.license.status === 'invalid' ||
        (this.license.licenseCode &&
          this.license.licenseCode.includes('Evaluation') &&
          this.license.status === 'expired')
      ) {
        onlyShowLicense = true
      }
      if (onlyShowLicense) {
        if (access !== 'admin') {
          // this.logout();
        } else {
          this.menu = [
            {
              path: '/main/license-manage',
              label: 'LicenseManage',
              icon: 'License',
              children: [],
            },
          ]
          this.$router.push({ path: '/main/license-manage' })
          this.logoUrl = '/main/license-manage'
          this.defaultSelected = ['/main/license-manage']
        }
        // ------------------
      } else {
        const route = this.$route
        this.menu = AccessService.getMenuByAccess(access)
        const currentMenu = menu[access]
        const defaultMenu = this.findMenu(route, currentMenu)
        if (defaultMenu !== null) {
          this.defaultSelected = [defaultMenu.path]
        }
      }
    },
    findMenu(route, subItems) {
      for (let i = 0; i < subItems.length; i++) {
        const subItem = subItems[i]
        // Need improve this function to fit param better
        if (route.path.indexOf(subItem.path) === 0) {
          return subItem
        }
        if (subItem.details) {
          for (let j = 0; j < subItem.details.length; j++) {
            const detail = subItem.details[j]
            if (route.path.indexOf(detail.path) === 0) {
              return subItem
            }
          }
        }
        const result = this.findMenu(route, subItem.children)
        if (result !== null) {
          return result
        }
      }
      return null
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
  },
}
</script>
<style>
.sidebar {
  display: flex;
  flex-direction: column;
}
.menu-item-content {
  display: inline-block;
  height: 16px !important;
  line-height: 16px !important;
  font-size: 14px !important;
}
</style>
