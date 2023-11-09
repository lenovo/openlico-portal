<template>
  <a-modal
    ref="popupDialog"
    v-model:open="isRender"
    class="moduleSelect"
    style="height: 85%"
    destroy-on-close
    :title="dialogTitle"
    :append-to-body="true"
    @cancel="isRender = false">
    <a-spin :spinning="loading">
      <a-tabs v-model:activeKey="displayTab" :animated="false" @change="switchModuleItem">
        <a-tab-pane key="all" :tab="$t('Admin.Runtime.Module.Select.AllTab')" />
        <a-tab-pane v-if="isShowIntel" key="intel" :tab="$t('Admin.Runtime.Module.Select.IntelTab')" />
      </a-tabs>
      <a-input v-model:value="filterText" :placeholder="$t('Admin.Runtime.Module.Select.Placeholder')" allow-clear />
      <template v-for="item in showModules" :key="item.code">
        <a-collapse v-show="item.show" v-model:activeKey="expandModules" :bordered="false">
          <template #expandIcon="{ isActive }">
            <caret-right-outlined :rotate="isActive ? 90 : 0" />
            <img :src="item.iconPath" class="rcicon-smile" />
          </template>
          <a-collapse-panel :key="item.code" :header="item.displayName">
            <p v-for="i in item.items" :key="i.code" class="runtime-item-module">
              <a-checkbox v-model:checked="i.checked" @change="onModuleCheck(i, item)">{{ i.displayName }}</a-checkbox>
            </p>
          </a-collapse-panel>
        </a-collapse>
      </template>
    </a-spin>
    <template #footer>
      <span class="dialog-footer">
        <a-button style="float: left" :disabled="loading" @click="resetSelected">
          {{ $t('Action.Reset') }}
        </a-button>
        <a-button @click="isRender = false"> {{ $t('Action.Cancel') }}</a-button>
        <a-button type="primary" :disabled="loading" @click="onSubmit"> {{ $t('Action.Confirm') }}</a-button>
      </span>
    </template>
  </a-modal>
</template>

<script>
import RuntimeService from '@/service/runtime-manage'

export default {
  emits: ['get-checked-modules'],
  data() {
    return {
      isRender: false,
      dialogTitle: this.$t('Admin.Runtime.Module.Select.Title'),
      filterText: '',
      displayTab: 'all',
      innerData: [],
      oldSelected: [],
      showModules: [],
      expandModules: [],
      loading: false,
    }
  },
  computed: {
    isShowIntel() {
      return this.$store.state.auth.featureCodes.includes('oneapi')
    },
    moduleOptions() {
      return this.showModules.filter(i => i.show)
    },
  },
  watch: {
    filterText(val) {
      if (!this.isRender) return
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
  },
  mounted() {
    // this.$watch('isRender', (newVal, oldVal) => {
    //   if (!newVal) {
    //     this.filterText = ''
    //   }
    // })
  },
  methods: {
    init() {
      this.isRender = true
      this.filterText = ''
      this.showModules = []
    },
    resetSelected() {
      this.showModules = this.innerData.map(item => {
        item.items = item.items.map(i => {
          i.checked = false
          return i
        })
        return item
      })
    },
    onModuleCheck(self, item) {
      item.items = item.items.map(i => {
        if (self.name !== i.name) {
          i.checked = false
        }
        return i
      })
      const parent = self.parents[0]
      if (parent) {
        this.innerData.forEach(el => {
          el.items.forEach(i => {
            if (i.name === parent) {
              i.checked = true
            }
          })
        })
      }
    },
    getCheckedModules() {
      let result = []
      this.showModules.forEach(item => {
        const selected = item.items.filter(i => {
          return i.checked
        })
        result = [...result, ...selected]
      })
      return result
    },
    onSubmit() {
      this.$emit('get-checked-modules', this.getCheckedModules())
      this.isRender = false
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
      this.loading = true
      RuntimeService.listModules().then(
        res => {
          this.$nextTick(() => {
            // this.isRender = true
            this.displayTab = 'all'
            this.expandModules = res.map(i => i.code)
            const checkedKeys = selectedModules.map(i => i.name)
            this.innerData = res.map(item => {
              item.items = item.items.map(i => {
                if (checkedKeys.includes(i.name)) {
                  i.checked = true
                }
                return i
              })
              return item
            })
            this.showModules = this.innerData
            this.loading = false
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

<style>
.ant-collapse-header,
.ant-collapse-content-box {
  padding: 4px 10px !important;
}
.ant-collapse-expand-icon {
  padding-inline-end: 3px !important;
}
.rcicon-smile {
  margin-left: 10px;
  width: 15px;
  height: 15px;
}
.runtime-item-module {
  padding-left: 40px;
}
</style>
