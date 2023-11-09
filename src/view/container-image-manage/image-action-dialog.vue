<template>
  <div class="">
    <composite-form-dialog
      ref="innerDialog"
      :title="title"
      size="500px"
      :form-model="imageForm"
      :form-rules="imageRules"
      :success-message-formatter="successMessageFormatter">
      <a-form-item v-if="mode == 'delete'" :label="$t('Image.Name')" name="name">
        <a-input v-model:value="imageForm.name" disabled />
      </a-form-item>
      <a-form-item v-if="mode == 'download'" :label="$t('Image.Download.Name')" name="targetName">
        <a-input v-model:value="imageForm.targetName" />
      </a-form-item>
      <a-form-item v-if="mode == 'download'" :label="$t('Image.Download.path')" name="targetPath">
        <file-select v-model:value="imageForm.targetPath" type="folder" />
      </a-form-item>
      <a-form-item v-if="mode == 'reupload'" :label="$t('Image.SourceFile')" name="sourceFile">
        <file-select v-model:value="imageForm.sourceFile" type="file" />
      </a-form-item>
    </composite-form-dialog>
    <file-manager-dialog ref="ImagefileManagerDialog" />
  </div>
</template>
<script>
import ImageService from '@/service/image'
import ValidRoleFactory from '@/common/valid-role-factory'
import FileSelect from '@/component/file-select.vue'
import FileManagerDialog from '@/component/file-manager-dialog.vue'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'

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
  // computed: {
  //   compositeHeight() {
  //     let retval
  //     if (this.mode === 'delete') retval = 280
  //     if (this.mode === 'download') retval = 370
  //     if (this.mode === 'reupload') retval = 280
  //     return retval
  //   },
  // },
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
        return this.$T('Image.Delete.Success', { name: this.imageForm.name })
      }
      if (this.mode === 'download') {
        return this.$T('Image.Download.Ready', { name: this.imageForm.targetName })
      }
      if (this.mode === 'reupload') {
        return this.$T('Image.Reupload.Ready', { name: this.imageForm.name })
      }
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
        name: data.name,
        sourceFile: '',
        targetFile: '',
      }
      this.title = this.$t('Image.Reupload.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
