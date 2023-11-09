<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
      v-if="!readOnly"
      style="border-bottom: 1px solid #ccc"
      :mode="mode"
      :editor="editorRef"
      :default-config="toolbarConfig" />
    <Editor
      v-model="valueHtml"
      style="height: 500px; overflow-y: hidden"
      :mode="mode"
      :default-config="editorConfig"
      @on-change="onContentChange"
      @on-created="handleCreated" />
  </div>
</template>
<script setup>
import { onBeforeUnmount, ref, shallowRef } from 'vue'

const props = defineProps({
  content: String,
  readOnly: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:content'])
const editorRef = shallowRef()
const toolbarConfig = {
  toolbarKeys: [
    'headerSelect',
    'bold',
    'italic',
    'underline',
    'through',
    'justifyLeft',
    'justifyCenter',
    'justifyRight',
    'justifyJustify',
    'blockquote',
    'code',
    'numberedList',
    'bulletedList',
    'delIndent',
    'indent',
    'color',
    'bgColor',
    'insertLink',
    'uploadImage',
    'clearStyle',
  ],
}
const editorConfig = {
  readOnly: props.readOnly,
  MENU_CONF: {
    uploadImage: {
      async customUpload(file, insertFn) {
        new Promise(resolve => {
          const render = new FileReader()
          render.onload = e => {
            resolve(e.target.result)
          }
          render.readAsDataURL(file)
        }).then(res => {
          insertFn(res)
        })
      },
    },
  },
}

const mode = 'simple'

const valueHtml = ref(props.content)

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const onContentChange = editor => {
  emit('update:content', editor.getHtml())
}
const handleCreated = editor => {
  editorRef.value = editor
}
</script>
<script>
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
export default {
  components: { Editor, Toolbar },
}
</script>

<style>
.w-e-bar-item.w-e-bar-item-group .w-e-bar-item .title {
  position: unset;
}
</style>
