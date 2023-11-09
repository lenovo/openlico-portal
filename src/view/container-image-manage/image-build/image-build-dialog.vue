<template>
  <div>
    <a-modal
      ref="innerDialog"
      v-model:open="isRender"
      width="980px"
      :title="title"
      :footer="null"
      destroy-on-close
      @cancel="onCancel">
      <div class="build-image">
        <div class="build-image-collapse" :class="{ active: collapse }">
          <a-form
            ref="imageBuildForm"
            layout="vertical"
            class="build-image-form"
            :model="imageForm"
            :rules="imageRules"
            :colon="false">
            <a-form-item :label="$t('Image.Name')" name="name">
              <a-input v-model:value="imageForm.name" :addon-after="imageSuffix" :disabled="!isEditable" />
            </a-form-item>
            <a-form-item :label="$t('Image.Build.Workspace')" name="workspace">
              <file-select
                v-model:value="imageForm.workspace"
                type="folder"
                :default-folder="imageForm.workspace"
                :disabled="!isEditable" />
            </a-form-item>
            <a-form-item :label="$t('Image.Build.Source')" name="source">
              <a-select v-model:value="imageForm.source" :disabled="!isEditable" @change="onSourceChange">
                <a-select-option v-for="item in sourceOpts" :key="item.index">
                  {{ $t(`Image.Build.Source.${item.label}`) }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item
              v-if="showImagepath('local')"
              :label="$t('Image.Build.ImagePath')"
              name="imagePath"
              class="build-image-select-image">
              <image-selection
                v-model:value="imageForm.imagePath"
                :arch="arch"
                :images="imageOptions"
                :disabled="!isEditable"
                :dispalay-image-type="false" />
            </a-form-item>
            <a-form-item v-if="showImagepath('hub')" :label="$t('Image.Build.ImagePath')" name="imagePath">
              <a-input v-model:value="imageForm.imagePath" :disabled="!isEditable" />
            </a-form-item>
            <a-form-item v-if="showImagepath('file')" :label="$t('Image.Build.DefFile')" name="definitionFile">
              <file-select
                v-model:value="imageForm.definitionFile"
                type="file"
                default-folder="MyFolder"
                :disabled="!isEditable" />
            </a-form-item>
            <a-form-item>
              <div class="btns">
                <span v-if="canSetAuth" class="sub-btn" @click="onOpenAuthDialog">
                  <i class="el-erp-Authentication" />
                  {{ $t('Image.Build.Authentication') }}
                </span>
                <span v-if="canSetAuth && canSetAdvanced" style="width: 10px" />
                <span v-if="canSetAdvanced" class="sub-btn" @click="onOpenSettingDialog">
                  <i class="el-erp-AdvancedSetting" />
                  {{ $t('Image.Build.AdvancedSettings') }}
                </span>
              </div>
            </a-form-item>
            <a-form-item>
              <a-checkbox
                v-if="canShowHttps"
                v-model:checked="imageForm.enableHttps"
                :disabled="!isEditable"
                @change="onCertChange">
                {{ $t('Image.Build.Cert.HTTPS') }}
                <a-tooltip placement="topLeft" overlay-class-name="helpTooltip">
                  <template #title>
                    {{ $t('Image.Build.Cert.HTTPS.Help') }}
                  </template>
                  <QuestionCircleFilled class="help-icon" />
                </a-tooltip>
              </a-checkbox>
            </a-form-item>
            <a-form-item align="right" class="build-image-form-submit-item">
              <a-button class="m-r-10" :disabled="!isEditable || loading" @click="onReset">
                {{ $t('Action.Reset') }}
              </a-button>
              <a-button type="primary" :disabled="!isEditable" :loading="loading" @click="onStartBuild">
                {{ $t('Image.Build.Action.Start') }}
              </a-button>
            </a-form-item>
          </a-form>
          <div class="build-form-action" :class="{ active: collapse }">
            <img
              class="build-form-action-icon"
              :src="`/static/img/system/main/build-image-${collapse ? 'inactive' : 'active'}.png`"
              @click="onCollapse" />
          </div>
        </div>
        <div class="build-log">
          <build-logview
            ref="imageBuildLog"
            :file-path="logFilePath"
            :can-import="canImport"
            :can-cancel="canCancel"
            :start-time="startTime"
            @get-build-status="getBuildStatus"
            @import-image-dialog-show="importImageDialogShow" />
        </div>
      </div>
    </a-modal>
    <file-manager-dialog ref="ImagefileManagerDialog" />
    <auth-dialog ref="authenticationDialog" :disabled="!isEditable" />
    <setting-dialog ref="advancedSettingDialog" :disabled="!isEditable" />
    <import-image-dialog ref="importImageDialog" />
  </div>
</template>
<script>
import Format from '@/common/format'
import ValidRoleFactory from '@/common/valid-role-factory'
import ImageService from '@/service/image'
import AccessService from '@/service/access'
import FileSelect from '@/component/file-select.vue'
import FileManagerDialog from '@/component/file-manager-dialog.vue'
import ImageSelection from '@/widget/image-selection.vue'
import BuildLogView from './image-build-logview.vue'
import ImportImageDialog from '../image-create-dialog.vue'
import AuthenticationDialog from './authentication-dialog.vue'
import AdvancedSettingDialog from './setting-dialog.vue'

export default {
  components: {
    'file-manager-dialog': FileManagerDialog,
    'file-select': FileSelect,
    'build-logview': BuildLogView,
    'auth-dialog': AuthenticationDialog,
    'setting-dialog': AdvancedSettingDialog,
    'import-image-dialog': ImportImageDialog,
    'image-selection': ImageSelection,
  },
  emits: ['refreshContainerImageStoreTable'],
  data() {
    return {
      title: '',
      isRender: false,
      collapse: false,
      buildStatus: '',
      logFilePath: '',
      imageExist: false,
      startTime: '',
      imageSuffix: ImageService.imageSuffix,
      compositeHeight: 500,
      arch: AccessService.getSchedulerArch(),
      sourceOpts: ImageService.buildSourceOptions,
      imageOptions: [],
      imageForm: {
        name: '',
        workspace: '',
        source: 1,
        imagePath: '',
        definitionFile: '',
        docker: {
          username: '',
          password: '',
        },
        packages: {
          pythonLibs: '',
          pipCommand: 'pip',
        },
        enableHttps: true,
      },
      imageRules: {
        name: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Image.Name')),
          ValidRoleFactory.getLengthRoleForText(this.$t('Image.Name'), 3, 64),
          ValidRoleFactory.getValidSystemNameRoleForText(this.$t('Image.Name'), true),
        ],
        workspace: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Image.Build.Workspace')),
          ValidRoleFactory.getLengthRoleForText(this.$t('Image.Build.Workspace'), 1, 255),
        ],
        source: [ValidRoleFactory.getRequireRoleForText(this.$t('Image.Build.Source'))],
        imagePath: [ValidRoleFactory.getRequireRoleForText(this.$t('Image.Build.ImagePath'))],
        definitionFile: [ValidRoleFactory.getRequireRoleForText(this.$t('Image.Build.DefFile'))],
      },
      loading: false,
      setTimeoutId: null,
      interval: 15 * 1000,
      imagePathCache: {},
    }
  },
  computed: {
    isEditable() {
      return !!(!this.buildStatus || ['completed', 'failed', 'unknown'].includes(this.buildStatus))
    },
    ImagePath() {
      return `${this.imageForm.workspace}/${this.imageForm.name}${this.imageSuffix}`
    },
    canImport() {
      return ['completed', 'unknown'].includes(this.buildStatus) && this.imageExist
    },
    canCancel() {
      return ['pending', 'running'].includes(this.buildStatus)
    },
    canSetAuth() {
      return [1, 3].includes(this.imageForm.source)
    },
    canSetAdvanced() {
      return this.imageForm.source !== 3
    },
    canShowHttps() {
      return [1, 3].includes(this.imageForm.source)
    },
  },
  watch: {
    buildStatus(val, oldV) {
      this.isImageFileExist()
    },
    'imageForm.imagePath'(val, old) {
      this.imagePathCache[this.imageForm.source] = val
    },
  },
  beforeUnmount() {
    clearTimeout(this.setTimeoutId)
  },
  methods: {
    getImageOptions() {
      ImageService.getAllImages().then(
        res => {
          this.imageOptions = res
            .filter(image => {
              return (this.imageForm.source === 4 && !image.username) || (this.imageForm.source === 5 && image.username)
            })
            .map(image => {
              return {
                username: image.username,
                tag: image.tags,
                version: image.version,
                value: image.imagePath,
                label: image.name,
              }
            })
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    importImageDialogShow() {
      // this.onCancel();
      this.$refs.importImageDialog
        .doImport(this.imageForm.name, `${this.imageForm.workspace}/${this.imageForm.name}${this.imageSuffix}`, 'other')
        .then(
          res => {
            this.$emit('refreshContainerImageStoreTable')
          },
          res => {
            // Do nothing
          },
        )
    },
    getBuildInfo() {
      ImageService.getBuildInfo()
        .then(res => {
          this.logFilePath = res.logFile
          this.startTime = Format.formatDateTime(res.startTime)
          delete res.logFile
          const form = Object.assign({}, this.imageForm, res)
          this.imageForm = form
          this.getBuildStatus()
        })
        .catch(err => {
          this.$message.error(err)
        })
    },
    getBuildStatus() {
      this.setTimeoutId = null
      ImageService.getBuildStatus().then(
        res => {
          this.buildStatus = res
          if (['pending', 'running'].includes(res)) {
            this.setTimeoutId = setTimeout(this.getBuildStatus, this.interval)
          }
          if (this.logFilePath && this.$refs.imageBuildLog) {
            this.$refs.imageBuildLog.getLogs(this.logFilePath)
          }
          this.loading = false
        },
        err => {
          this.loading = false
          this.$message.error(err)
        },
      )
    },
    isImageFileExist() {
      ImageService.isImageFileExist(this.ImagePath).then(
        res => {
          this.imageExist = res
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    onCertChange(e) {
      this.imageForm.enableHttps = e.target.checked
    },
    onSourceChange(val) {
      this.$refs.imageBuildForm.clearValidate(['imagePath', 'definitionFile'])
      if (val !== 3) {
        this.imageForm.imagePath = this.imagePathCache[val] || ''
      }
      if (val > 3) {
        this.getImageOptions()
      }
    },
    onReset() {
      this.$refs.imageBuildForm.resetFields()
      this.imageForm = {
        name: '',
        workspace: '',
        source: 1,
        imagePath: '',
        definitionFile: '',
        docker: {
          username: '',
          password: '',
        },
        packages: {
          pythonLibs: '',
          pipCommand: 'pip',
        },
        enableHttps: true,
      }
      this.imagePathCache = {}
      // this.$refs.imageBuildLog.cleanBuildLog();
    },
    onStartBuild() {
      const self = this
      this.$refs.imageBuildForm.validate().then(
        _ => {
          this.loading = true
          ImageService.isImageFileExist(this.ImagePath).then(
            res => {
              if (!res) {
                self.kickBuild()
              } else {
                this.imageExist = res
                self.$confirm({
                  content: self.$T('Image.Build.ImageExist', {
                    file: this.ImagePath,
                  }),
                  centered: true,
                  onOk: self.kickBuild,
                  onCancel: () => {
                    this.loading = false
                  },
                })
              }
            },
            err => {
              this.loading = false
              this.$message.error(err)
            },
          )
        },
        _ => {},
      )
    },
    kickBuild() {
      const form = this.imageForm
      ImageService.startBuild(
        form.name,
        form.workspace,
        form.source,
        form.imagePath,
        form.definitionFile,
        form.docker.username,
        form.docker.password,
        form.enableHttps,
        form.packages,
      ).then(
        res => {
          this.getBuildInfo()
        },
        err => {
          this.loading = false
          this.$message.error(err)
        },
      )
    },
    doBuild() {
      this.title = this.$t('Image.Build.Title')
      this.isRender = true
      this.$nextTick(() => {
        this.getBuildInfo()
        this.getImageOptions()
      })
      return new Promise((resolve, reject) => {
        this.$refs.innerDialog.validate().then(
          _ => {
            this.isRender = false
            resolve()
          },
          _ => {
            reject(new Error('Error'))
          },
        )
      })
    },
    onOpenAuthDialog() {
      if (!this.canSetAuth) return
      this.$refs.authenticationDialog
        .open({
          username: this.imageForm.docker.username,
          password: this.imageForm.docker.password,
        })
        .then(res => {
          this.imageForm.docker.username = res.username
          this.imageForm.docker.password = res.password
        })
        .catch(_ => {
          // do nothing
        })
    },
    onOpenSettingDialog() {
      // if(!this.canSetAdvanced) return
      this.$refs.advancedSettingDialog
        .open(this.imageForm.packages)
        .then(res => {
          this.imageForm.packages = res
        })
        .catch(_ => {
          // do nothing
        })
    },
    onCancel() {
      this.isRender = false
      clearTimeout(this.setTimeoutId)
    },
    onCollapse() {
      this.collapse = !this.collapse
    },
    showImagepath(type) {
      if (type === 'hub') {
        const hubTypeList = this.sourceOpts.filter(item => item.index < 3).map(i => i.index)
        return hubTypeList.includes(this.imageForm.source)
      } else if (type === 'file') {
        const fileTypeList = this.sourceOpts.filter(item => item.index === 3).map(i => i.index)
        return fileTypeList.includes(this.imageForm.source)
      } else if (type === 'local') {
        const localTypeList = this.sourceOpts.filter(item => item.index > 3).map(i => i.index)
        return localTypeList.includes(this.imageForm.source)
      }
      return false
    },
  },
}
</script>
<style scoped>
.btns {
  width: 100%;
  display: inline-flex;
}

.sub-btn {
  display: inline-block;
  flex: 1;
  width: 50%;
  height: 32px;
  line-height: 32px;
  text-align: center;
  cursor: pointer;
  /* background: #f0f9ff; */
  /* color: #449fff; */
  box-sizing: border-box;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  display: flex;
  justify-content: center;
}
.sub-btn:hover {
  color: #449fff;
  border-color: #449fff;
}
.build-image :deep(.helpTooltip),
.build-authentication :deep(.helpTooltip),
.build-settings :deep(.helpTooltip) {
  width: 500px !important;
  z-index: 10;
}

.help-icon {
  color: #449fff;
}
.build-image {
  display: flex;
  overflow: hidden;
}
.build-image-collapse {
  display: flex;
  position: relative;
  flex-shrink: 0;
  transition: 0.6s;
}
.build-image-collapse.active {
  /* width: 20px; */
  margin-left: -281px;
}
.build-log {
  width: 100%;
  height: 100%;
}
.build-form-action {
  width: 20px;
  position: relative;
  color: transparent;
}
.build-form-action-icon {
  position: absolute;
  top: 50%;
  margin-top: -30px;
  right: 0;
}
.build-form-action-icon:hover {
  /* color: #3af; */
  cursor: pointer;
}
.build-image-form-submit-item {
  position: absolute;
  bottom: 0;
  right: 20px;
  margin-bottom: 20px;
  padding-bottom: 0;
}
.build-image-form {
  width: 280px;
  height: 100%;
}

.build-action-disabled {
  background-color: #f5f5f5;
  color: #d9d9d9;
  cursor: not-allowed;
}
.build-image-select-image :deep(.image-version-tag) {
  width: 100%;
}
.build-image-select-image :deep(.image-version-tag > ul) {
  padding: 5px;
}
</style>
