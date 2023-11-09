<template>
  <div ref="setclodtools" class="setdl">
    <a-modal
      :title="title"
      :open="visible"
      width="700px"
      :confirm-loading="confirmLoading"
      :ok-text="okText"
      :footer="!footerNull ? null : undefined"
      :get-container="() => $refs.setclodtools"
      @ok="handleOk"
      @cancel="handleCancel">
      <a-spin :spinning="setLoading">
        <job-parameters-editor
          ref="runningParamsEditor"
          form-id="Cloudtools_Task_Running_Form"
          :params="runningParams"
          :context="paramValues" />
      </a-spin>
    </a-modal>
    <a-modal :title="title" :open="visibleRun" @ok="handleOkRun" @cancel="handleCancelRun">
      <p style="height: 24px; line-height: 24px">
        <ExclamationCircleOutlined style="color: #1890ff; display: inline-block; margin-right: 10px; font-size: 24px" />
        {{ ModalText }}
      </p>
    </a-modal>
  </div>
</template>
<script>
import CloudToolsService from '@/service/cloud-tools'
import JobTemplate from '@/service/job-template'
import JobParametersEditor from '@/widget/job-parameters-editor.vue'

export default {
  components: {
    'job-parameters-editor': JobParametersEditor,
  },
  emits: ['setSonCloudGetProjectsInfo', 'editSonCloudGetProjectsInfo'],
  data() {
    return {
      runningParams: [],
      paramValues: {},
      settings: {},
      title: '',
      okText: this.$t('CloudTools.Apply'),
      visible: false,
      visibleRun: false,
      confirmLoading: false,
      ModalText: this.$t('CloudTools.Apply.Tips'),
      workspaceInfo: {},
      innerResolve: null,
      innerReject: null,
      is_initialized: false,
      footerNull: null,
      setLoading: false,
    }
  },
  methods: {
    handleOk() {
      this.$refs.runningParamsEditor.validate().then(
        () => {
          if (this.okText === this.$t('CloudTools.Apply')) {
            if (!this.workspaceInfo.settings.id) {
              let tempSettingData = {}
              tempSettingData = this.paramValues
              CloudToolsService.postSetting(tempSettingData).then(
                res => {
                  this.visible = false
                  this.$emit('setSonCloudGetProjectsInfo', res)
                },
                err => {
                  this.$message.error(err)
                },
              )
            } else {
              this.visibleRun = true
            }
          } else {
            let tempSettingData = {}
            tempSettingData = this.paramValues
            const initialized = {
              project: {
                id: tempSettingData.project_id,
              },
              tool: {
                id: tempSettingData.tool_id,
              },
            }
            if (this.is_initialized === false) {
              CloudToolsService.putSetting(this.workspaceInfo.settings.id, tempSettingData).then(
                res => {
                  this.visible = false
                  this.$emit('setSonCloudGetProjectsInfo', initialized)
                },
                err => {
                  this.visible = false
                  this.$message.error(err)
                },
              )
            } else {
              CloudToolsService.postSetting(tempSettingData).then(
                res => {
                  this.visible = false
                  this.$emit('setSonCloudGetProjectsInfo', res)
                },
                err => {
                  this.visible = false
                  this.$message.error(err)
                },
              )
            }
          }
        },
        () => {},
      )
    },
    handleCancel() {
      this.footerNull = null
      this.visible = false
    },
    handleOkRun() {
      this.visibleRun = false
      this.visible = false
      let tempSettingData = {}
      tempSettingData = this.paramValues
      CloudToolsService.putSetting(this.workspaceInfo.settings.id, tempSettingData).then(
        res => {
          this.$message.success(
            this.$T('CloudTools.Job.Edit.Success', {
              name: this.title,
            }),
          )
          this.$emit('editSonCloudGetProjectsInfo', this.workspaceInfo.project_id)
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    handleCancelRun() {
      this.visibleRun = false
    },
    launchInfo(res) {
      this.setLoading = true
      this.footerNull = null
      this.workspaceInfo = res
      this.visible = true
      this.title = this.$T('CloudTools.Settings.Title', {
        name: res.name,
      })
      this.runningParams = []
      this.paramValues = {}
      JobTemplate.getJobTemplate(res.job_template).then(
        templateRes => {
          const tempArr1 = res.setting_params
          const tempArr2 = templateRes.params
          const tempArr3 = []
          tempArr1.forEach(item => {
            tempArr2.forEach(element => {
              if (item === element.id) {
                tempArr3.push(element)
              }
            })
          })
          this.runningParams = tempArr3
          this.is_initialized = res.settings.is_initialized
          if (res.settings.is_initialized) {
            this.okText = this.$t('CloudTools.Apply')
            const tempObj = JSON.parse(JSON.stringify(res.settings.settings))
            this.paramValues = { ...tempObj, project_id: res.project_id, tool_id: res.tool_id }
          } else {
            this.okText = this.$t('CloudTools.Launch')
            this.paramValues = { ...res.settings.settings, project_id: res.project_id, tool_id: res.tool_id }
          }
          this.setLoading = false
          this.footerNull = 'true'
        },
        err => {
          this.$message.error(err)
        },
      )
      return new Promise((resolve, reject) => {
        this.innerResolve = resolve
        this.innerReject = reject
      })
    },
  },
}
</script>
<style scoped>
.setdl :deep(.job-parameters-editor-form) {
  padding-left: 0px;
}
.setdl :deep(.queue-selector) {
  width: 100% !important;
}
.setdl :deep(.container) {
  display: block !important;
}
.setdl :deep(.maxresourse) {
  margin-top: 5px;
}
.setdl :deep(.ant-form-item .ant-form-item-control-input) {
  display: block;
  width: 100% !important;
}
.setdl :deep(.ant-form .ant-input) {
  width: 100% !important;
}
.setdl :deep(.jobtempalte-mig-select) {
  width: 100% !important;
}
.setdl :deep(.ant-select-show-search) {
  width: 83% !important;
}
.setdl :deep(.ant-input-password) {
  width: 100% !important;
}
.setdl :deep(.load-module-editor) {
  width: 100% !important;
}
.setdl :deep(.file-select-container) {
  width: 100% !important;
}
.setdl :deep(.image-selection) {
  display: block;
}
.setdl :deep(.ant-input-group-compact) {
  width: 100% !important;
}
.setdl :deep(.image-version-tag) {
  margin-top: 5px;
}
.setdl :deep(.ant-input-group.ant-input-group-compact) {
  display: flex;
}
</style>
