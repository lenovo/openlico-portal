<template>
  <a-badge v-if="editorOptions.length" :count="editorOptions.length" :number-style="{ backgroundColor: '#5fbdfc' }">
    <span class="file-editor">
      <a-popover ref="fileEditor" placement="bottomRight">
        <template #content>
          <p
            v-for="(item, index) in editorOptions"
            :key="item.editor.instance.id"
            class="file-editor-item"
            :class="{ 'file-editor-item-border': editorOptions.length > 1 && editorOptions.length > index + 1 }">
            <span class="file-editor-item-name" @click="onNameClick(item)">{{ item.editor.file.name }}</span>
            <close-outlined @click="onCloseEditor(item)" />
          </p>
        </template>
        <i class="el-erp-FileManagerEdit" style="font-size: 20px; color: #5fbdfc; cursor: pointer" />
      </a-popover>
    </span>
  </a-badge>
</template>
<script>
export default {
  data() {
    return {
      visible: false,
      editorOptions: [],
      max: 10,
    }
  },
  mounted() {
    window.addEventListener('elEditorAction', this.getEditorOptions)
  },
  beforeUnmount() {
    window.removeEventListener('elEditorAction', this.getEditorOptions)
  },
  methods: {
    getEditorOptions(e) {
      const data = e.data
      const item = data.editor
      const action = data.type
      item[0].id = item.editor.instance.id
      if (action === 'open') {
        if (this.editorOptions.length < this.max) {
          this.editorOptions.push(item)
        } else {
          this.onCloseEditor(item)
          this.$warning({
            centered: true,
            title: this.$t('MainTools.MaxConnected.Msg'),
            okText: this.$t('Action.Ok'),
          })
        }
      }
      if (action === 'close') {
        this.editorOptions = this.editorOptions.filter(i => i.editor.instance.id !== item.editor.instance.id)
      }
    },
    onNameClick(item) {
      const dialog = $(item[0]).parents('.elfinder-dialog')
      if (dialog.is(':visible')) {
        dialog.trigger('mousedown')
      } else {
        dialog.find('.elfinder-titlebar-minimize').trigger('mousedown')
      }
    },
    onCloseEditor(item) {
      $(item[0]).parents('.elfinder-dialog').find('.ui-dialog-titlebar-close').trigger('mousedown')
    },
  },
}
</script>
<style scoped>
.file-editor :deep() .ant-popover-inner-content {
  padding: 0;
}
.file-editor-item {
  min-width: 150px;
  display: flex;
  box-sizing: border-box;
  padding: 5px 10px;
}
.file-editor-item:hover {
  background: #f3f3f3;
}
.file-editor-item-border {
  border-bottom: 1px solid #eee;
}
.file-editor-item-name {
  font-size: 12px;
  display: inline-block;
  width: 100%;
  cursor: pointer;
}
.file-editor-item-close {
  width: 14px;
}

.file-editor-item-name:hover,
.file-editor-item-close:hover {
  color: #5fbdfc;
}
</style>
