<template>
  <div class="runtime-management">
    <a-modal
      ref="innerDialog"
      :title="title"
      width="580px"
      :visible="isRender"
      :footer="false"
      @cancel="isRender = false">
      <a-form-model :model="runtimeForm" label-width="120px" :colon="false">
        <a-form-model-item :label="$t('Admin.Runtime.Name')" prop="name">
          <a-row class="list-item">
            <span>{{ runtimeForm.name }}</span>
          </a-row>
        </a-form-model-item>
        <a-form-model-item v-if="showModules()" :label="$t('Admin.Runtime.Items')" :label-positon="labelPosition">
          <a-row class="list-item">
            <span>{{ $t('Admin.Runtime.Items.ModuleNameTitle') }}</span>
            <span>{{ $t('Admin.Runtime.Items.ModuleParentTitle') }}</span>
          </a-row>
        </a-form-model-item>
        <a-form-model-item v-if="showModules()" prop="selectedModules">
          <a-row v-for="module in runtimeForm.selectedModules" :key="module.displayName" class="list-item">
            <span>
              <img :src="getSrc(module.moduleTag)" class="rcicon" style="width: 15px; height: 15px" />
              {{ module.name }}</span
            >
            <span>{{ module.parents ? module.parents.join(',') : '' }}</span>
          </a-row>
        </a-form-model-item>
        <a-form-model-item v-if="showEnvs()" :label="$t('Admin.Runtime.Env')" :label-positon="labelPosition">
          <a-row class="list-item">
            <span>{{ $t('Admin.Runtime.Env.Name') }}</span>
            <span>{{ $t('Admin.Runtime.Env.Value') }}</span>
          </a-row>
        </a-form-model-item>
        <a-form-model-item v-if="showEnvs()" prop="envs">
          <a-row v-for="env in runtimeForm.envs" :key="env.name" class="list-item">
            <span>{{ env.name }}</span>
            <span>{{ env.value }}</span>
          </a-row>
        </a-form-model-item>
        <a-form-model-item v-if="showScripts()" :label="$t('Admin.Runtime.Scripts')" :label-positon="labelPosition">
          <a-row class="list-item">
            <span>{{ $t('Admin.Runtime.Scripts.File') }}</span>
            <span />
          </a-row>
        </a-form-model-item>
        <a-form-model-item v-if="showScripts()" prop="scripts">
          <a-row v-for="(file, index) in runtimeForm.scripts" :key="index" class="list-item">
            <span :title="path" class="runtime-file-path">{{ file.path }}</span>
          </a-row>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import RuntimeService from '../../service/runtime-manage'

export default {
  data() {
    return {
      title: '',
      labelPosition: 'top',
      isRender: false,
      runtimeForm: {},
    }
  },
  methods: {
    getSelectedModules(items) {
      const result = []
      items.forEach(item => {
        const moduleItem = new RuntimeService.ModuleItem()
        moduleItem.name = item.module
        moduleItem.parents = item.parents ? item.parents : null
        moduleItem.displayName =
          item.parents && item.parents.length > 0
            ? item.module + RuntimeService.nameSpace + item.parents.join(',')
            : item.module
        moduleItem.moduleTag = item.moduleTag
        result.push(moduleItem)
      })
      return result
    },
    showModules() {
      if (this.runtimeForm.selectedModules && this.runtimeForm.selectedModules.length > 0) {
        return true
      }
      return false
    },
    showEnvs() {
      if (this.runtimeForm.envs && this.runtimeForm.envs.length > 0) {
        return true
      }
      return false
    },
    showScripts() {
      if (this.runtimeForm.scripts && this.runtimeForm.scripts.length > 0) {
        return true
      }
      return false
    },
    viewDetail(id) {
      this.mode = 'view'
      this.title = this.$t('Admin.Runtime.View.Title')
      this.isRender = true
      RuntimeService.getRuntime(id)
        .then(res => {
          this.runtimeForm = {
            name: res.name,
            selectedModules: this.getSelectedModules(res.items),
            envs: res.envs,
            scripts: res.scripts,
            tag: res.tag,
          }
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
  width: 500px;
}

.list-item > * {
  flex: 1;
  margin: auto 30px;
}

.list-item > button {
  text-align: left;
}

.list-item + div.a-form-model-item__error {
  margin: auto 10px;
}

.runtime-file-path {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
