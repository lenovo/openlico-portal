<template lang="html">
  <div class="height--100 p-10">
    <file-manager init-path="MyFolder" height="600" />
  </div>
</template>

<script>
import FileManager from './../component/file-manager'

export default {
  name: 'FileManage',
  components: {
    'file-manager': FileManager,
  },
}
</script>
