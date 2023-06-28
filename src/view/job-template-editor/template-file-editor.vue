<template>
  <div id="parameter-file-editor" class="parameter-file-editor" />
</template>
<script>
export default {
  props: ['content'],
  data() {
    return {
      aceEditor: null,
    }
  },
  watch: {
    content(val, oldVal) {
      this.aceEditor.setValue(val, -1)
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.aceEditor = ace.edit('parameter-file-editor')
      this.aceEditor.setFontSize(18)
      // tEditor.setValue(this.fileTemplate, -1)
      // this.aceEditor.setValue("{name: 'ACE', value: 'file template'}", -1)
      if (this.content) {
        this.aceEditor.setValue(this.content, -1)
      }
    },
    getContent() {
      return this.aceEditor.getValue()
    },
  },
}
</script>
<style lang="css">
.parameter-file-editor {
  margin: 20px;
  min-height: 400px;
}
</style>
