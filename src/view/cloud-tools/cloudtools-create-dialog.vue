<template>
  <div class="dev-tools-create-dialog">
    <composite-form-dialog
      ref="innerDialog"
      :title="title"
      :form-model="formModel"
      :form-rules="formRules"
      size="600px"
      :success-message-formatter="successMessageFormatter">
      <a-form-item :label="$t('CloudTools.Name')" name="name">
        <a-input v-model:value="formModel.name" :disabled="nameFalse" />
      </a-form-item>
      <a-form-item :label="$t('CloudTools.Workspace')" label-width="200px" name="workspace">
        <file-select
          v-model:value="formModel.workspace"
          :special_character="true"
          :disabled="workspaceDisabled"
          type="folder" />
      </a-form-item>
      <a-form-item :label="$t('CloudTools.Environment')" label-width="200px" name="environment">
        <file-select
          v-model:value="formModel.environment"
          :special_character="true"
          :disabled="workspaceDisabled"
          type="folder" />
      </a-form-item>
      <a-button :disabled="delteteFalse" class="delete" type="primary" danger @click="delteteButton">
        {{ $t('CloudTools.Delete') }}
      </a-button>
    </composite-form-dialog>
    <a-modal
      :title="deleteTitle"
      :open="visible"
      :footer="!isDetail ? null : undefined"
      :closable="!confirmLoading"
      :mask-closable="false"
      destroy-on-close
      @cancel="handleCancel">
      <template #footer>
        <div>
          <a-button @click="handleCancel">
            {{ $t('Action.Cancel') }}
          </a-button>
          <a-button type="primary" @click="handleOk">
            {{ $t('Action.Ok') }}
          </a-button>
        </div>
      </template>
      <a-spin :spinning="confirmLoading" style="height: 100%; z-index: 9999">
        <p style="margin-bottom: 15px">
          {{ ModalText }}
        </p>
        <a-checkbox v-model:checked="delete_completely" @change="onChange">
          {{ $t('CloudTools.Delete') }}{{ $t('Admin.Runtime.Env') }}
        </a-checkbox>
      </a-spin>
    </a-modal>
  </div>
</template>
<script>
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import ValidRoleFactory from '@/common/valid-role-factory'
import FileSelect from '@/component/file-select.vue'
import CloudToolsService from '@/service/cloud-tools'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
    'file-select': FileSelect,
  },
  emits: ['createSonCloudGetProjects', 'createSonCloudGetProjectsInfo'],
  data() {
    return {
      projectAllInfo: {},
      nameFalse: false,
      delteteFalse: false,
      workspaceDisabled: false,
      formModel: {
        name: '',
        workspace: '',
        environment: '',
        isSetting: false,
      },
      title: '',
      formRules: {
        name: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Platform.Name')),
          ValidRoleFactory.getValidIdentityNameRoleForText(this.$t('Platform.Name')),
          ValidRoleFactory.getLengthRoleForText(this.$t('Platform.Name'), 3, 40),
        ],
        workspace: [ValidRoleFactory.getRequireRoleForText(this.$t('CloudTools.Workspace'))],
        environment: [ValidRoleFactory.getRequireRoleForText(this.$t('CloudTools.Environment'))],
      },
      ModalText: 'Content of the modal',
      deleteTitle: '',
      visible: false,
      delete_completely: false,
      confirmLoading: false,
      isDetail: true,
    }
  },
  watch: {
    'formModel.workspace'(val) {
      if (val && !this.formModel.isSetting) {
        this.formModel.environment = val + '/.lico_env'
      }
    },
  },
  methods: {
    onChange(e) {
      this.delete_completely = e.target.checked
    },
    handleOk() {
      this.isDetail = false
      this.confirmLoading = true
      this.$refs.innerDialog.onCancelClick()
      CloudToolsService.deleteProject(this.projectAllInfo.id, this.delete_completely).then(
        res => {
          this.visible = false
          this.isDetail = true
          this.delete_completely = false
          this.confirmLoading = false
          this.$message.success(
            this.$T('CloudTools.Project.Delete.Success', {
              name: this.projectAllInfo.name,
            }),
          )
          this.$emit('createSonCloudGetProjects')
        },
        err => {
          this.visible = false
          this.isDetail = true
          this.delete_completely = false
          this.confirmLoading = false
          this.$refs.innerDialog.onCancelClick()
          this.$message.error(err)
        },
      )
    },
    handleCancel() {
      this.visible = false
      this.delete_completely = false
      this.confirmLoading = false
      this.isDetail = true
    },
    delteteButton() {
      this.visible = true
      this.deleteTitle = this.$T('CloudTools.Delete.Title', {
        name: this.formModel.name,
      })
      this.ModalText = this.$T('CloudTools.Delete.Confirm', {
        name: this.formModel.name,
      })
    },
    submitForm() {
      return new Promise((resolve, reject) => {
        if (this.projectAllInfo.id) {
          CloudToolsService.putProject(this.projectAllInfo.id, this.formModel.name).then(
            res => {
              this.$emit('createSonCloudGetProjectsInfo', res)
              resolve(res)
            },
            err => {
              reject(err)
            },
          )
        } else {
          CloudToolsService.postProject(this.formModel).then(
            res => {
              this.$emit('createSonCloudGetProjectsInfo', res)
              resolve(res)
            },
            err => {
              reject(err)
            },
          )
        }
      })
    },
    successMessageFormatter(res) {
      if (this.projectAllInfo.id) {
        return this.$T('CloudTools.Action.Put.Ready', {
          name: this.formModel.name,
        })
      } else {
        return this.$T('CloudTools.Action.Create.Ready', {
          name: this.formModel.name,
        })
      }
    },
    doCreate() {
      this.delteteFalse = true
      this.nameFalse = false
      this.title = this.$t('CloudTools.Workspace.Create.Title')
      this.workspaceDisabled = false
      this.formModel = {
        name: '',
        workspace: '',
        environment: '',
      }
      this.projectAllInfo = {}
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doSetting(res) {
      this.projectAllInfo = res
      this.title = this.$t('CloudTools.Workspace.Setting.Title')
      this.workspaceDisabled = true
      CloudToolsService.getProjectInfo(res.id).then(
        res => {
          if (res.name === 'default') {
            this.nameFalse = true
            this.delteteFalse = true
          } else {
            this.nameFalse = false
            this.delteteFalse = false
          }
          this.formModel = {
            name: res.name,
            workspace: res.workspace,
            environment: res.environment,
            isSetting: true,
          }
        },
        err => {
          this.$message.error(err)
        },
      )
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>

<style scoped>
.delete {
  position: absolute;
  bottom: 10px;
}
</style>
