<template>
  <a-modal :title="title" width="800px" :open="visible" :footer="null" destroy-on-close @cancel="onCancel">
    <file-manager ref="fileManager" :mode="mode" :init-path="initPath" height="400" @selected="onSelected" />
  </a-modal>
</template>
<script>
import FileManager from './file-manager.vue'
import FileManagerService from '@/service/file-manager'

export default {
  components: {
    'file-manager': FileManager,
  },
  data() {
    return {
      title: '',
      visible: false,
      mode: '',
      initPath: '',
      innerResolve: null,
      innerReject: null,
    }
  },
  methods: {
    selectFile(initPath) {
      this.setOptions(initPath, 'file')
      return new Promise((resolve, reject) => {
        this.innerResolve = resolve
        this.innerReject = reject
      })
    },
    selectFolder(initPath) {
      this.setOptions(initPath, 'folder')
      return new Promise((resolve, reject) => {
        this.innerResolve = resolve
        this.innerReject = reject
      })
    },
    setOptions(path, mode, title) {
      if (title) {
        this.title = this.$t('Elfinder.Select.' + title)
      } else {
        this.title = mode ? this.$t('Elfinder.Select.' + mode) : this.$t('Elfinder.Manager')
      }
      this.initPath = path || FileManagerService.getRecentSelectedPath()
      this.mode = mode
      this.visible = true
    },
    onCancel() {
      this.visible = false
    },
    onSelected(path) {
      FileManagerService.setRecentSelectedPath(path)
      this.innerResolve(path)
      this.visible = false
    },
  },
}
</script>
