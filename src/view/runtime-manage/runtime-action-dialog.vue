<template>
  <div class="runtime-management">
    <composite-form-dialog
      ref="innerDialog"
      size="580px"
      :title="title"
      :loading="loading"
      :form-model="runtimeForm"
      :form-rules="runtimeRules"
      :success-message-formatter="successMessageFormatter"
      :external-validate="checkVerifyCount">
      <a-form-item :label="$t('Admin.Runtime.Name')" name="name">
        <a-input
          v-model:value="runtimeForm.name"
          class="runtime-dialog-list-item btn_bottom_0"
          :disabled="mode == 'delete'" />
      </a-form-item>
      <a-form-item
        :label="$t('Admin.Runtime.Items')"
        :label-positon="labelPosition"
        class="runtime-management-modules-item">
        <a-row class="runtime-dialog-list-item">
          <span>{{ $t('Admin.Runtime.Items.ModuleNameTitle') }}</span>
          <span>{{ $t('Admin.Runtime.Items.ModuleParentTitle') }}</span>
          <span />
        </a-row>
      </a-form-item>
      <a-form-item name="selectedModules">
        <a-row
          v-for="(module, index) in runtimeForm.selectedModules"
          :key="module.code"
          class="runtime-dialog-list-item">
          <span :title="module.name">
            <img :src="getSrc(module.moduleTag === 'intel')" class="rcicon" style="width: 15px; height: 15px" />
            {{ module.name }}
          </span>
          <span :title="module.parents.join(',')">{{ module.parents.length ? module.parents.join(',') : '' }}</span>
          <template v-if="mode != 'delete'">
            <a-dropdown :trigger="['hover']" style="text-align: right; flex: 1">
              <span class="el-erp-more" @click="e => e.preventDefault()" />
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="index > 0" @click="moduleMove(index, 'up')">
                    {{ $t('Action.MoveUp') }}
                  </a-menu-item>
                  <a-menu-item v-if="index < runtimeForm.selectedModules.length - 1" @click="moduleMove(index, 'down')">
                    {{ $t('Action.MoveDown') }}
                  </a-menu-item>
                  <a-menu-item @click="moduleDelete(module)">
                    {{ $t('Action.Delete') }}
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </a-row>
        <a-row v-if="mode !== 'delete'" class="runtime-dialog-list-item">
          <a-button id="Add_Modules_Button" type="link" :disabled="mode == 'delete'" @click="selectOpen">
            {{ $t('Action.Add') }}
          </a-button>
          <span />
          <a-button
            id="Verify_Modules_Button"
            style="text-align: right"
            type="link"
            :disabled="disableModulesOps() || mode == 'delete'"
            @click="onVerify()">
            {{ $t('Action.Verify') }}
          </a-button>
        </a-row>
      </a-form-item>
      <a-form-item
        :label="$t('Admin.Runtime.Env')"
        :label-positon="labelPosition"
        class="runtime-management-modules-item">
        <a-row class="runtime-dialog-list-item">
          <span>{{ $t('Admin.Runtime.Env.Name') }}</span>
          <span>{{ $t('Admin.Runtime.Env.Value') }}</span>
          <span />
        </a-row>
      </a-form-item>
      <a-form-item name="envs">
        <a-row v-for="env in runtimeForm.envs" :key="env.name" class="runtime-dialog-list-item">
          <span :title="env.name">{{ env.name }}</span>
          <span :title="env.value">{{ env.value }}</span>
          <template v-if="mode != 'delete'">
            <a-dropdown :trigger="['hover']" style="text-align: right; flex: 1">
              <span class="el-erp-more" @click="e => e.preventDefault()" />
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="envEdit(env)">
                    {{ $t('Action.Edit') }}
                  </a-menu-item>
                  <a-menu-item @click="envDelete(env)">
                    {{ $t('Action.Delete') }}
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </a-row>
        <a-row v-if="mode !== 'delete'" class="runtime-dialog-list-item">
          <a-button id="Add_Environment_Button" type="link" :disabled="mode == 'delete'" @click="envCreate">
            {{ $t('Action.Add') }}
          </a-button>
        </a-row>
      </a-form-item>
      <a-form-item
        :label="$t('Admin.Runtime.Scripts')"
        :label-positon="labelPosition"
        class="runtime-management-modules-item">
        <a-row class="runtime-dialog-list-item">
          <span>{{ $t('Admin.Runtime.Scripts.File') }}</span>
          <span />
        </a-row>
      </a-form-item>
      <a-form-item name="scripts">
        <a-row v-for="(file, index) in runtimeForm.scripts" :key="index" class="runtime-dialog-list-item">
          <script-file
            v-model:value="file.path"
            :disabled="mode == 'delete'"
            :can-move-up="index > 0"
            :can-move-down="index < runtimeForm.scripts.length - 1"
            @delete="fileRemove(index)"
            @move-up="scriptFileMove(index, 'up')"
            @move-down="scriptFileMove(index, 'down')" />
        </a-row>
        <a-row v-if="mode !== 'delete'" class="runtime-dialog-list-item">
          <a-button
            id="Add_File_Button"
            type="link"
            :disabled="mode == 'delete' || (runtimeForm.scripts && runtimeForm.scripts.length >= 10)"
            @click="fileAdd">
            {{ $t('Action.Add') }}
          </a-button>
        </a-row>
      </a-form-item>
    </composite-form-dialog>
    <module-select-dialog ref="moduleSelectDialog" @get-checked-modules="onModuleSelected" />
    <env-dialog ref="envDialog" @get-env="onEnvGeted" />
  </div>
</template>
<script>
import Utils from '@/common/utils'
import ValidRoleFactory from '@/common/valid-role-factory'
import RuntimeService from '@/service/runtime-manage'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import ModuleSelectDialog from './module-select-dialog.vue'
import EnvDialog from './env-dialog.vue'
import ScriptFile from './script-file.vue'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
    'module-select-dialog': ModuleSelectDialog,
    'env-dialog': EnvDialog,
    ScriptFile,
  },
  data() {
    return {
      title: '',
      mode: '',
      loading: false,
      labelPosition: 'top',
      runtimeId: null,
      runtimeForm: {},
      verifyErrors: 0,
      runtimeRules: {
        name: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Admin.Runtime.Name')),
          ValidRoleFactory.getLengthRoleForText(this.$t('Admin.Runtime.Name'), 3, 64),
          ValidRoleFactory.getValidIdentityNameRoleForText(this.$t('Admin.Runtime.Name')),
          this.validRuntimeName(this.$t('Admin.Runtime.Name')),
        ],
      },
      role: this.$store.state.auth.access,
    }
  },
  methods: {
    initData() {
      this.title = ''
      this.mode = ''
      this.runtimeId = ''
      this.runtimeForm = {}
      this.verifyErrors = 0
    },
    validRuntimeName(itemLabel) {
      const pattern = '^(D|d)efault$'
      return {
        validator(rule, value) {
          const errors = []
          const regExp = new RegExp(pattern)
          if (regExp.test(value.toString())) {
            errors.push(
              new Error(
                window.gApp.$t('Admin.Runtime.Name.Valid', {
                  name: itemLabel,
                }),
              ),
            )
          }
          return Promise[errors.length ? 'reject' : 'resolve'](errors)
        },
      }
    },
    checkVerifyCount(callbackFunc) {
      if (this.runtimeForm.selectedModules.length <= 0) {
        callbackFunc(true)
      } else {
        if (this.verifyErrors > 0) {
          this.$confirm({
            title: this.$t('Admin.Runtime.Module.Verify.Fail.title'),
            content: this.$t('Admin.Runtime.Action.Submit.Confirm'),
            okText: this.$t('Dialog.Submit'),
            cancelText: this.$t('Dialog.Cancel'),
            onOk() {
              callbackFunc(true)
            },
            onCancel() {
              callbackFunc(false)
            },
          })
        } else {
          callbackFunc(true)
        }
      }
    },
    submitForm() {
      this.onModuleSelected()
      if (this.mode === 'create' || this.mode === 'duplicate') {
        return RuntimeService.createRuntime(
          this.runtimeForm.name,
          this.runtimeForm.selectedModules,
          this.runtimeForm.envs,
          this.runtimeForm.scripts,
          this.runtimeForm.tag,
          this.role,
        )
      } else if (this.mode === 'edit') {
        return RuntimeService.updateRuntime(
          this.runtimeId,
          this.runtimeForm.name,
          this.runtimeForm.selectedModules,
          this.runtimeForm.envs,
          this.runtimeForm.scripts,
          this.runtimeForm.tag,
        )
      } else {
        return RuntimeService.deleteRuntime(this.runtimeId)
      }
    },
    successMessageFormatter(res) {
      if (this.mode === 'create') {
        return this.$T('Admin.Runtime.Create.Ready', {
          name: this.runtimeForm.name,
        })
      } else if (this.mode === 'edit') {
        return this.$T('Admin.Runtime.Edit.Ready', {
          name: this.runtimeForm.name,
        })
      } else if (this.mode === 'duplicate') {
        return this.$T('Admin.Runtime.Duplicate.Ready', {
          name: this.runtimeForm.name,
        })
      } else {
        return this.$T('Admin.Runtime.Delete.Ready', {
          name: this.runtimeForm.name,
        })
      }
    },
    getSelectedModules(items) {
      const result = []
      items.forEach(item => {
        const moduleItem = new RuntimeService.ModuleItem()
        moduleItem.name = item.module
        moduleItem.parents = item.parents
        moduleItem.displayName =
          item.parents && item.parents.length > 0
            ? item.module + RuntimeService.nameSpace + item.parents.join(',')
            : item.module
        moduleItem.moduleTag = item.moduleTag
        result.push(moduleItem)
      })
      return result
    },
    reOrderModules(selected) {
      return selected.sort((a, b) => {
        return a.displayName.length - b.displayName.length
      })
    },
    doCreate() {
      this.initData()
      this.mode = 'create'
      this.runtimeForm = {
        name: '',
        selectedModules: [],
        envs: [],
        scripts: [],
        tag: '',
      }
      this.title = this.$t('Admin.Runtime.Create.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEdit(data) {
      this.initData()
      this.mode = 'edit'
      this.runtimeId = data.id
      this.getRuntimeById(data.id)
      this.title = this.$t('Admin.Runtime.Edit.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doDuplicate(data) {
      this.initData()
      this.mode = 'duplicate'
      this.runtimeId = data.id
      this.getRuntimeById(data.id)
      this.title = this.$t('Admin.Runtime.Duplicate.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    disableModulesOps() {
      if (this.runtimeForm.selectedModules && this.runtimeForm.selectedModules.length > 0) {
        return false
      }
      return true
    },
    wrapMsg(data) {
      let result = ''
      if (data) {
        result = data.replace(/\n/g, '<br/>')
      }
      return result
    },
    onVerify() {
      this.loading = true
      RuntimeService.verifyModule(this.runtimeForm.selectedModules, this.role).then(
        res => {
          this.loading = false
          this.verifyErrors = 0
          this.$success({
            title: this.$t('Admin.Runtime.Module.Verify.Success.title', {
              name: this.runtimeForm.name,
            }),
          })
        },
        res => {
          this.loading = false
          this.verifyErrors++
          this.$error({
            title: this.$t('Admin.Runtime.Module.Verify.Fail.title', {
              name: this.runtimeForm.name,
            }),
            content: res.body.output,
          })
        },
      )
    },
    doDelete(data) {
      this.initData()
      this.mode = 'delete'
      this.runtimeId = data.id
      this.getRuntimeById(data.id)
      this.title = this.$t('Admin.Runtime.Delete.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    selectOpen() {
      // this.loading = true
      const dialog = this.$refs.moduleSelectDialog
      dialog.doOpen(this.runtimeForm.selectedModules)
    },
    onModuleSelected(selected) {
      if (selected) {
        this.runtimeForm.selectedModules = this.reOrderModules(selected)
      }
      this.runtimeForm.selectedModules.forEach(item => {
        if (item.moduleTag === 'intel') {
          this.runtimeForm.tag = 'sys:intel'
        }
      })
    },
    envCreate() {
      const dialog = this.$refs.envDialog
      dialog.doCreate(Utils.deepCopy(this.runtimeForm.envs))
    },
    envEdit(data) {
      const dataIndex = RuntimeService.findEnvIndex(data, this.runtimeForm.envs)
      if (dataIndex !== -1) {
        this.$refs.envDialog.doEdit(data, Utils.deepCopy(this.runtimeForm.envs))
      }
    },
    envDelete(data) {
      const dataIndex = RuntimeService.findEnvIndex(data, this.runtimeForm.envs)
      if (dataIndex !== -1) {
        this.runtimeForm.envs.splice(dataIndex, 1)
      }
    },
    fileRemove(index) {
      const deleteScriptFile = () => {
        this.runtimeForm.scripts = this.runtimeForm.scripts.filter((f, i) => i !== index)
      }
      if (!this.runtimeForm.scripts[index].path) {
        deleteScriptFile()
        return
      }
      this.$confirm({
        title: this.$t('Runtime.Script.Delete.Title'),
        content: this.$t('Runtime.Script.Delete.Msg'),
        centered: true,
        okText: this.$t('Action.Yes'),
        cancelText: this.$t('Action.No'),
        onOk: () => {
          deleteScriptFile()
        },
      })
    },
    fileAdd() {
      this.runtimeForm.scripts.push({ path: '' })
    },
    onEnvGeted(envs) {
      this.runtimeForm.envs = envs
    },
    onActionCommand(command) {
      const fn = command.fn
      const argument = command.argument
      fn(argument)
    },
    scriptFileMove(index, action) {
      this.runtimeForm.scripts = this.dataItemMove(index, action, this.runtimeForm.scripts)
    },
    moduleMove(index, action) {
      this.runtimeForm.selectedModules = this.dataItemMove(index, action, this.runtimeForm.selectedModules)
    },
    dataItemMove(index, action, data) {
      const result = data
      let spliceIndex = index
      const dataItem = data[index]
      result.splice(spliceIndex, 1)
      if (action === 'up') spliceIndex = spliceIndex - 1
      if (action === 'down') spliceIndex = spliceIndex + 1
      result.splice(spliceIndex, 0, dataItem)
      return result
    },
    moduleDelete(data) {
      const dataIndex = RuntimeService.findModuleIndex(data, this.runtimeForm.selectedModules)
      if (dataIndex !== -1) {
        this.runtimeForm.selectedModules.splice(dataIndex, 1)
      }
    },
    getSrc(showCondition) {
      return RuntimeService.imgSet(showCondition)
    },
    getRuntimeById(id) {
      this.loading = true
      RuntimeService.getRuntime(id)
        .then(res => {
          this.runtimeForm = {
            name: res.name,
            selectedModules: this.getSelectedModules(res.items),
            envs: res.envs,
            scripts: res.scripts,
            tag: '',
          }
        })
        .catch(err => {
          this.$message.error(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>
<style scoped>
.runtime-dialog-list-item,
.runtime-dialog-list-item + div {
  /* border-bottom: 1px solid rgba(0, 0, 0, 0.06); */
  align-items: center;
  display: flex;
  width: 500px;
}

.runtime-dialog-list-item > * {
  flex: 2;
  margin: auto 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.runtime-dialog-list-item > span + span {
  flex: 1;
}

.runtime-dialog-list-item > button {
  text-align: left;
}

.runtime-dialog-list-item + div.a-form-item__error {
  margin: auto 10px;
}

.module_verify_success_600,
.module_verify_warning_600 {
  width: 600px;
}

.module_verify_success_600 .el-message-box__title {
  color: green;
}

.module_verify_warning_600 .el-message-box__title {
  color: #e6a23c;
}
.module_verify_warning_600 .el-message-box__title::before {
  content: '\e7a3';
  font-family: 'element-icons' !important;
  margin-right: 5px;
}
.runtime-management-modules-item {
  padding-bottom: 5px;
  margin-bottom: 0;
}
.runtime-file-path {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* .btn_bottom_0 {
    border-bottom: 0;
} */
</style>
