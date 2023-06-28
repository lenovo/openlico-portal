<template>
  <div>
    <file-select
      ref="jobFileSelector"
      v-model="fileFullPath"
      class="job-file-detail"
      type="file"
      style="width: 500px" />
    <div id="detail_edit" class="grid-content height--100" />
  </div>
</template>

<script>
import JobService from '../../service/job'
import FileSelect from '../../component/file-select'
import Format from '../../common/format'

export default {
  components: {
    'file-select': FileSelect,
  },
  props: ['job'],
  data() {
    return {
      editor: '',
      fileFullPath: this.job.jobFilename,
      filePath: Format.formatWorkspace(this.job.jobFilename),
      jobType: this.job.type,
    }
  },
  watch: {
    job(val) {
      this.fileFullPath = this.job.jobFilename
      this.filePath = Format.formatWorkspace(this.job.jobFilename)
      this.updateJobFile()
    },
  },
  mounted() {
    // if (this.jobType=='cmd') {
    //   this.fileFullPath='/'
    //   this.editor = ace.edit("detail_edit");
    //   this.editor.setFontSize(16);
    //   this.editor.setReadOnly(true);
    // } else {
    //   this.updateJobFile();
    // }
    this.updateJobFile()
    this.$refs.jobFileSelector.$on(
      'input',
      function (path) {
        this.filePath = Format.formatWorkspace(path)

        this.updateJobFile()
      }.bind(this),
    )
  },
  methods: {
    updateJobFile() {
      const that = this
      this.editor = ace.edit('detail_edit')
      this.editor.setFontSize(16)
      this.editor.setReadOnly(true)
      const path = this.filePath.replace(this.$store.state.auth.workspace + '/', '')
      JobService.getJobLog(path, 0, 0).then(function (res) {
        const contain = res.lines.join('\n')
        that.editor.setValue(contain, -1)
      })
    },
  },
}
</script>

<style scoped>
.grid-content {
  margin-top: 20px;
  min-height: 450px;
}

.job-file-detail >>> .select-file-input {
  width: 500px;
}
</style>
