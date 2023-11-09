<template>
  <div style="display: flex; margin: 4px 0" class="script-file-container">
    <a-input-group compact style="width: 100%">
      <a-input
        v-model:value="currentPath"
        class="script-file-input"
        :disabled="disabled"
        style="width: 85%"
        size="small" />
      <a-button style="width: 15%" :disabled="disabled" size="small" @click="onBrowserClick">
        {{ $t('FileSelect.Browser') }}
      </a-button>
    </a-input-group>
    <template v-if="!disabled">
      <a-dropdown :trigger="['hover']" style="text-align: right; width: 15%">
        <span class="el-erp-more" style="margin: 0 10px" @click="e => e.preventDefault()" />
        <template #overlay>
          <a-menu>
            <a-menu-item v-if="canMoveUp" @click="moveUp">
              {{ $t('Action.MoveUp') }}
            </a-menu-item>
            <a-menu-item v-if="canMoveDown" @click="moveDown">
              {{ $t('Action.MoveDown') }}
            </a-menu-item>
            <a-menu-item @click="ondeleteClick">
              {{ $t('Action.Delete') }}
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>
    <file-manager-dialog ref="fileManagerDialog" />
  </div>
</template>
<script>
import FileManagerDialog from '@/component/file-manager-dialog.vue'
export default {
  components: {
    'file-manager-dialog': FileManagerDialog,
  },
  props: ['value', 'disabled', 'specialCharacter', 'canMoveUp', 'canMoveDown'],
  emits: ['input', 'change', 'delete', 'update:value', 'move-up', 'move-down'],
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
        this.emitPath()
      }
    },
  },
  mounted() {
    this.currentPath = this.value
  },
  methods: {
    onBrowserClick() {
      this.$refs.fileManagerDialog.selectFile(this.currentPath).then(res => {
        this.setPath(res)
      })
    },
    ondeleteClick() {
      this.$emit('delete', this.currentPath)
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
    },
    moveUp() {
      this.$emit('move-up')
    },
    moveDown() {
      this.$emit('move-down')
    },
    emitPath() {
      this.$emit('input', this.currentPath)
      this.$emit('change', this.currentPath)
      this.$emit('update:value', this.currentPath)
    },
  },
}
</script>
<style scoped></style>
