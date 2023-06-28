<template>
  <div class="">
    <composite-form-dialog
      ref="innerDialog"
      :title="title"
      size="500px"
      :composite-height="compositeHeight"
      :form-model="imageForm"
      :form-rules="imageRules"
      :success-message-formatter="successMessageFormatter"
      :error-message-formatter="errorMessageFormatter">
      <a-form-model-item v-if="mode == 'delete'" :label="$t('Image.Name')" prop="name">
        <a-input v-model="imageForm.name" disabled />
      </a-form-model-item>
      <a-form-model-item v-if="mode == 'download'" :label="$t('Image.Download.Name')" prop="targetName">
        <a-input v-model="imageForm.targetName" />
      </a-form-model-item>
      <a-form-model-item v-if="mode == 'download'" :label="$t('Image.Download.path')" prop="targetPath">
        <file-select v-model="imageForm.targetPath" type="folder" />
      </a-form-model-item>
      <a-form-model-item v-if="mode == 'reupload'" :label="$t('Image.SourceFile')" prop="sourceFile">
        <file-select v-model="imageForm.sourceFile" type="file" />
      </a-form-model-item>
    </composite-form-dialog>
    <file-manager-dialog ref="ImagefileManagerDialog" />
  </div>
</template>
<script>
import FileSelect from '../../component/file-select'
import FileManagerDialog from '../../component/file-manager-dialog'
import ImageService from '../../service/image'
import CompositeFormDialog from '../../component/composite-form-dialog'
import ValidRoleFactory from '../../common/valid-role-factory'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
    'file-manager-dialog': FileManagerDialog,
    'file-select': FileSelect,
  },
  data() {
    return {
      title: '',
      mode: '',
      imageId: 0,
      imageForm: {
        name: '',
        sourceFile: '',
        targetFile: '',
      },
      status: '',
      exist: '',
      imageRules: {
        name: [ValidRoleFactory.getRequireRoleForText(this.$t('Image.Name'))],
        targetName: [ValidRoleFactory.getRequireRoleForText(this.$t('Image.Download.Name'))],
        sourceFile: [ValidRoleFactory.getRequireRoleForText(this.$t('Image.SourceFile'))],
        targetFile: [ValidRoleFactory.getRequireRoleForText(this.$t('Image.targetFile'))],
        targetPath: [ValidRoleFactory.getRequireRoleForText(this.$t('Image.Download.path'))],
      },
    }
  },
  computed: {
    compositeHeight() {
      let retval
      if (this.mode === 'delete') retval = 280
      if (this.mode === 'download') retval = 370
      if (this.mode === 'reupload') retval = 280
      return retval
    },
  },
  methods: {
    submitForm() {
      if (this.mode === 'delete') {
        return ImageService.deleteImage(this.imageId)
      }
      if (this.mode === 'download') {
        return ImageService.downloadImage(
          this.imageId,
          this.imageForm.targetName,
          this.imageForm.targetPath.replace('MyFolder/', ''),
        )
      }
      if (this.mode === 'reupload') {
        return ImageService.imageReupload(this.imageId, this.imageForm.sourceFile.replace('MyFolder/', ''))
      }
    },
    successMessageFormatter(res) {
      if (this.mode === 'delete') {
        return this.$t('Image.Delete.Success', { name: this.imageForm.name })
      }
      if (this.mode === 'download') {
        return this.$t('Image.Download.Ready', { name: this.imageForm.targetName })
      }
      if (this.mode === 'reupload') {
        return this.$t('Image.Reupload.Ready', { name: this.imageForm.name })
      }
    },
    errorMessageFormatter(res) {
      const errMsg = res
      return this.$t(errMsg)
    },
    doDelete(data) {
      this.mode = 'delete'
      this.imageId = data.id
      this.status = data.status
      this.imageForm = {
        name: data.name,
      }
      this.title = this.$t('Image.Delete.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doDownload(data) {
      this.mode = 'download'
      this.imageId = data.id
      this.imageForm = {
        targetName: data.name + '.image',
        targetPath: '',
      }
      this.title = this.$t('Image.Download.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doReupload(data) {
      this.mode = 'reupload'
      this.imageId = data.id
      this.imageForm = {
        name: '',
        sourceFile: '',
        targetFile: '',
      }
      this.title = this.$t('Image.Reupload.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
