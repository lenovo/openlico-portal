<template>
  <div style="display: flex" class="file-select-container">
    <a-input-group compact class="file-select-outer">
      <!-- eslint-disable -->
      <a-input
        v-model:value="currentPath"
        class="select-file-input"
        readOnly
        :disabled="disabled"
        style="width: 80%"
        @mouseover="showClearIcon"
        @mouseleave="hideClearIcon">
        <!-- eslint-enable -->
        <template #suffix>
          <close-circle-outlined
            ref="clearIcon"
            theme="filled"
            class="clear-icon"
            type="close-circle"
            @click="clearPath"
            @mouseover="hightLightIcon"
            @mouseleave="cancelhightLight" />
        </template>
      </a-input>
      <a-button style="width: 20%" :disabled="disabled" @click="onBrowserClick">
        {{ $t('FileSelect.Browser') }}
      </a-button>
    </a-input-group>
    <file-manager-dialog ref="fileManagerDialog" />
  </div>
</template>
<script>
import FileManagerDialog from './file-manager-dialog.vue'
import { Form } from 'ant-design-vue'
export default {
  components: {
    'file-manager-dialog': FileManagerDialog,
  },
  props: ['value', 'type', 'disabled', 'specialCharacter'],
  emits: ['input', 'change', 'update:value'],
  data() {
    return {
      currentPath: '',
      formItemContext: Form.useInjectFormItemContext(),
    }
  },
  watch: {
    value(val, oldVal) {
      this.currentPath = val
    },
    currentPath(val, oldVal) {
      if (val !== oldVal) {
        this.emitPath()
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
      if (this.specialCharacter) {
        if (pattern.test(path)) {
          this.currentPath = path
          this.emitPath()
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
        this.emitPath()
      }
    },
    clearPath() {
      this.currentPath = ''
      this.emitPath()
      this.hideClearIcon()
    },
    showClearIcon() {
      if (this.currentPath && this.currentPath.length) {
        this.$refs.clearIcon.style = 'display: block;'
      }
    },
    hideClearIcon() {
      this.$refs.clearIcon.style = 'display: none;'
    },
    hightLightIcon() {
      this.showClearIcon()
      this.$refs.clearIcon.classList.add('close-active')
    },
    cancelhightLight() {
      this.hideClearIcon()
      this.$refs.clearIcon.classList.remove('close-active')
    },
    emitPath() {
      this.$emit('input', this.currentPath)
      this.$emit('change', this.currentPath)
      this.$emit('update:value', this.currentPath)
      this.formItemContext.onFieldChange()
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
