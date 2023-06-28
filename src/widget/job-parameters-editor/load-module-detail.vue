<template>
  <div class="runtime-management">
    <a-modal
      ref="innerDialog"
      centered
      :title="title"
      width="580px"
      :visible="isRender"
      :footer="false"
      @cancel="isRender = false">
      <a-tabs v-model="defaultKey" :animated="false">
        <a-tab-pane
          v-for="option in tabsOptions"
          :key="option.key"
          :tab="$t(`Admin.Runtime.${option.title}`)"
          force-render>
          <a-form-model-item label="" :label-positon="labelPosition">
            <a-row class="list-item" style="background: #fafafa">
              <span v-for="(item, index) in option.labels" :key="item + index">{{
                $t(`Admin.Runtime.${option.title}.${item}`)
              }}</span>
            </a-row>
          </a-form-model-item>
          <a-form-model-item>
            <a-row v-for="(item, index) in runtimeForm[option.key]" :key="index" class="list-item">
              <template v-for="(key, idx) in option.dataIndex">
                <span v-if="option.key == 'modules' && key == 'name'" :key="key + idx">
                  <img :src="getSrc(item.moduleTag)" class="rcicon" style="width: 15px; height: 15px" />
                  {{ item.name }}</span
                >
                <span v-else :key="key + idx" :title="item[key]" :class="option.calss">
                  {{ item[key] }}
                </span>
              </template>
            </a-row>
          </a-form-model-item>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>

<script>
import RuntimeService from '../../service/runtime-manage'

export default {
  data() {
    return {
      title: this.$t('Admin.Runtime.View.Title'),
      labelPosition: 'top',
      isRender: false,
      defaultKey: 'modules',
      runtimeForm: {
        modules: [],
        envs: [],
        scripts: [],
      },
      tabsOptions: [
        {
          title: 'Items',
          labels: ['ModuleNameTitle', 'ModuleParentTitle'],
          dataIndex: ['name', 'parents'],
          calss: {},
          key: 'modules',
        },
        {
          title: 'Env',
          labels: ['Name', 'Value'],
          dataIndex: ['name', 'value'],
          calss: {},
          key: 'envs',
        },
        {
          title: 'Scripts',
          labels: ['File'],
          dataIndex: ['path'],
          class: { path: 'runtime-file-path' },
          key: 'scripts',
        },
      ],
    }
  },
  methods: {
    getSelectedModules(items) {
      const result = []
      items.forEach(item => {
        const moduleItem = new RuntimeService.ModuleItem()
        moduleItem.name = item.module
        moduleItem.parents = item.parents ? item.parents.join(',') : null
        moduleItem.displayName =
          item.parents && item.parents.length > 0
            ? item.module + RuntimeService.nameSpace + item.parents.join(',')
            : item.module
        moduleItem.moduleTag = item.moduleTag
        result.push(moduleItem)
      })
      return result
    },
    viewDetail(ids) {
      RuntimeService.getTemplateRuntimeInfo(ids)
        .then(res => {
          const modules = this.getSelectedModules(res.modules)
          this.runtimeForm = { ...res, modules }
          this.$nextTick(() => {
            this.isRender = true
          })
        })
        .catch(err => {
          this.$message.error(err)
        })
    },
    getSrc(showCondition) {
      return RuntimeService.imgSet(showCondition)
    },
  },
}
</script>
<style scoped>
.list-item,
.list-item + div {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  align-items: center;
  display: flex;
  /* width: 500px; */
}

.list-item > * {
  flex: 1;
  margin: auto 30px;
}

.list-item > button {
  text-align: left;
}

.runtime-file-path {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
