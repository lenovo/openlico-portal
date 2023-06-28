<template>
  <div style="display: flex" class="file-select-container">
    <a-input-group compact class="file-select-outer">
      <a-input
        v-model="currentPath"
        class="select-file-input"
        read-only
        :disabled="disabled"
        style="width: 80%"
        @mouseover="showClearIcon"
        @mouseleave="hideClearIcon">
        <a-icon
          ref="clearIcon"
          slot="suffix"
          theme="filled"
          class="clear-icon"
          type="close-circle"
          @click="clearPath"
          @mouseover="hightLightIcon"
          @mouseleave="cancelhightLight" />
      </a-input>
      <a-button style="width: 20%" :disabled="disabled" @click="onBrowserClick">
        {{ $t('FileSelect.Browser') }}
      </a-button>
    </a-input-group>
    <file-manager-dialog ref="fileManagerDialog" />
  </div>
</template>
<script>
import FileManagerDialog from './file-manager-dialog'
export default {
  components: {
    'file-manager-dialog': FileManagerDialog,
  },
  props: ['value', 'type', 'disabled', 'special_character'],
  data() {
    return {
      currentPath: '',
    }
  },
  watch: {
    value(val, oldVal) {
      this.currentPath = val
    },
    currentPath(val, oldVal) {
      if (val !== oldVal) {
        this.$emit('input', this.currentPath)
        this.$emit('change', this.currentPath)
      }
    },
  },
  mounted() {
    this.currentPath = this.value
  },
  methods: {
    onBrowserClick() {
      if (this.type === 'file') {
        this.$refs.fileManagerDialog
          .selectFile(this.currentPath)
          .then(res => {
            this.setPath(res)
          })
          .catch(_ => {})
      } else {
        this.$refs.fileManagerDialog
          .selectFolder(this.currentPath)
          .then(res => {
            this.setPath(res)
          })
          .catch(_ => {})
      }
    },
    setPath(path) {
      const self = this
      // eslint-disable-next-line no-useless-escape
      const pattern = /^[a-zA-Z0-9\/._\-\[\]]+$/
      if (this.special_character) {
        if (pattern.test(path)) {
          this.currentPath = path
          this.$emit('input', this.currentPath)
          this.$emit('change', this.currentPath)
        } else {
          this.$error({
            title: self.$t('FileSelect.Tips'),
            content: self.$t('FileSelect.Valid.Path.Message'),
            centered: true,
            okText: self.$t('Dialog.Ok'),
            onOk() {
              return new Promise((resolve, reject) => {
                self.onBrowserClick()
                resolve()
              })
            },
          })
        }
      } else {
        this.currentPath = path
        this.$emit('input', this.currentPath)
        this.$emit('change', this.currentPath)
      }
    },
    clearPath() {
      this.currentPath = ''
      this.$emit('input', this.currentPath)
      this.$emit('change', this.currentPath)
    },
    showClearIcon() {
      if (this.currentPath && this.currentPath.length) {
        this.$refs.clearIcon.$el.style = 'display: block;'
      }
    },
    hideClearIcon() {
      this.$refs.clearIcon.$el.style = 'display: none;'
    },
    hightLightIcon() {
      this.$refs.clearIcon.$el.style = 'display: block;'
      this.$refs.clearIcon.$el.classList.add('close-active')
    },
    cancelhightLight() {
      this.$refs.clearIcon.$el.classList.remove('close-active')
    },
  },
}
</script>
<style scoped>
.file-select-outer {
  position: relative;
}
.clear-icon {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.25);
  display: none;
}
.close-active {
  color: rgba(0, 0, 0, 0.65);
}
</style>
