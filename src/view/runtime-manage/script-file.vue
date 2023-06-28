<template>
  <div style="display: flex; margin: 4px 0" class="script-file-container">
    <a-input-group compact style="width: 100%">
      <a-input v-model="currentPath" class="script-file-input" :disabled="disabled" style="width: 85%" size="small" />
      <a-button style="width: 15%" :disabled="disabled" size="small" @click="onBrowserClick">
        {{ $t('FileSelect.Browser') }}
      </a-button>
    </a-input-group>
    <template v-if="!disabled">
      <a-dropdown :trigger="['hover']" style="text-align: right; width: 15%">
        <span class="el-erp-more" style="margin: 0 10px" @click="e => e.preventDefault()" />
        <a-menu slot="overlay">
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
      </a-dropdown>
    </template>
    <file-manager-dialog ref="fileManagerDialog" />
  </div>
</template>
<script>
import FileManagerDialog from '../../component/file-manager-dialog'
export default {
  components: {
    'file-manager-dialog': FileManagerDialog,
  },
  props: ['value', 'disabled', 'special_character', 'canMoveUp', 'canMoveDown'],
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
    moveUp() {
      this.$emit('move-up')
    },
    moveDown() {
      this.$emit('move-down')
    },
  },
}
</script>
<style scoped></style>
