<template>
  <a-modal
    ref="popupDialog"
    class="moduleSelect"
    :title="dialogTitle"
    :destroy-on-close="true"
    style="height: 85%"
    :visible="isRender"
    :append-to-body="true"
    @cancel="isRender = false">
    <a-tabs v-model="displayTab" :animated="false" @change="switchModuleItem">
      <a-tab-pane key="all" :tab="$t('Admin.Runtime.Module.Select.AllTab')" />
      <a-tab-pane v-if="isShowIntel" key="intel" :tab="$t('Admin.Runtime.Module.Select.IntelTab')" />
    </a-tabs>
    <a-input v-model="filterText" :placeholder="$t('Admin.Runtime.Module.Select.Placeholder')" allow-clear />
    <a-tree
      v-model="checkedModuleKeys"
      :default-expand-all="expandAll"
      multiple
      checkable
      :selected-keys.sync="checkedModuleKeys"
      :show-icon="true"
      @select="selectModules"
      @check="selectModules">
      <a-tree-node
        v-for="m in showModules"
        v-show="m.show"
        :key="m.code"
        :selectable="false"
        :checkable="false"
        :title="m.displayName">
        <img slot="icon" :src="m.iconPath" class="rcicon-smile" style="width: 15px; height: 15px" />
        <a-tree-node v-for="i in m.items" :key="i.code" :title="i.displayName" />
      </a-tree-node>
    </a-tree>

    <span slot="footer" class="dialog-footer">
      <a-button style="float: left" @click="resetSelected">
        {{ $t('Action.Reset') }}
      </a-button>
      <a-button @click="isRender = false"> {{ $t('Action.Cancel') }}</a-button>
      <a-button type="primary" @click="onSubmit"> {{ $t('Action.Confirm') }}</a-button>
    </span>
  </a-modal>
</template>

<script>
import RuntimeService from '../../service/runtime-manage'

export default {
  data() {
    return {
      isRender: false,
      dialogTitle: this.$t('Admin.Runtime.Module.Select.Title'),
      filterText: '',
      displayTab: 'all',
      expandAll: true,
      innerData: [],
      checkedModuleKeys: [],
      oldSelected: [],
      showModules: [],
    }
  },
  computed: {
    isShowIntel() {
      return this.$store.state.auth.featureCodes.includes('oneapi')
    },
  },
  watch: {
    filterText(val) {
      this.showModules = this.innerData.map(item => {
        const result = item.items.filter(i => i.displayName.toLowerCase().indexOf(val.toLowerCase()) >= 0)
        if (this.displayTab === 'intel' && item.items[0].moduleTag !== this.displayTab) {
          item.show = false
        } else {
          item.show = Boolean(result.length)
        }
        return item
      })
    },
    checkedModuleKeys(val, old) {
      this.oldSelected = val
    },
  },
  mounted() {
    this.$watch('isRender', (newVal, oldVal) => {
      if (!newVal) {
        this.filterText = ''
      }
    })
  },
  methods: {
    init() {
      this.isRender = false
      this.filterText = ''
      this.checkedModuleKeys = []
      this.showModules = []
    },
    resetSelected() {
      this.checkedModuleKeys = []
    },
    selectModules(data, node) {
      if (!data.length) return
      let addCodes = data.filter(i => !this.oldSelected.includes(i))
      let removeCodes = this.oldSelected.filter(i => !data.includes(i))
      let addModeles = this.getCheckedModules(addCodes)
      addModeles = addModeles.concat(this.getModulesParents(addModeles))
      addCodes = addModeles.map(i => i.code).filter(i => !this.oldSelected.includes(i))
      const oldSelected = this.getCheckedModules(this.oldSelected)
      // const removeSelected = oldSelected.filter(m => {
      //   for (let i = 0; i < addModeles.length; i++) {
      //     if (
      //       addModeles[i].name !== m.name && m.parentName === addModeles[i].parentName
      //     ) {
      //       return m
      //     }
      //   }
      // })
      const removeSelected = oldSelected.filter(m =>
        addModeles.some(am => am.name !== m.name && am.parentName === m.parentName),
      )
      removeCodes = removeSelected.map(i => i.code).concat(removeCodes)
      this.checkedModuleKeys = this.oldSelected.concat(addCodes).filter(i => !removeCodes.includes(i))
    },
    getCheckedModules(checkArr) {
      let result = []
      this.innerData.forEach(item => {
        const selected = item.items.filter(i => {
          return checkArr.includes(i.code)
        })
        result = [...result, ...selected]
      })
      return result
    },
    getModulesParents(checkModules) {
      const arr = []
      const modules = this.innerData.map(i => i.items).reduce((a, b) => a.concat(b))

      const parents = checkModules.map(i => i.parents)
      const parentsNames = parents.length ? parents.reduce((a, b) => a.concat(b)) : []
      modules.forEach(i => {
        if (parentsNames.includes(i.name) && !arr.includes(i)) {
          arr.push(i)
        }
      })
      return arr
    },
    onSubmit() {
      this.isRender = false
      this.$emit('get-checked-modules', this.getCheckedModules(this.checkedModuleKeys))
    },
    switchModuleItem(key) {
      this.filterText = ''
      this.$nextTick(() => {
        if (key === 'intel') {
          this.showModules = this.innerData.map(item => {
            item.show = Boolean(item.items[0].moduleTag === key)
            return item
          })
        } else {
          this.showModules = this.innerData.map(item => {
            item.show = true
            return item
          })
        }
      })
    },
    doOpen(selectedModules) {
      this.init()
      RuntimeService.listModules().then(
        res => {
          this.$nextTick(() => {
            this.displayTab = 'all'
            this.innerData = res
            this.expandAll = true
            this.showModules = res
            if (res.length) {
              const modules = res
                .map(i => i.items)

                .reduce((a, b) => a.concat(b))
              selectedModules.forEach(item => {
                modules.forEach(m => {
                  if (item.name === m.name) {
                    this.checkedModuleKeys.push(m.code)
                  }
                })
              })
            }
            this.isRender = true
          })
        },
        _ => {
          // do nothing
        },
      )
    },
  },
}
</script>

<style></style>
