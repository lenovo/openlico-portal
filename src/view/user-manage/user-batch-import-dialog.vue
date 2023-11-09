<template>
  <a-modal
    :open="dialogFormVisible"
    :title="$t('User.BatchImport.Title')"
    width="700px"
    class="batch-import-manage-dialog"
    @cancel="dialogFormVisible = false">
    <a-form v-if="status == 'idle'" label-width="140px" label-align="right">
      <a-form-item :colon="false" :label="$t('User.Import.Title.ImportFile')" class="file-select-container">
        <div class="file-info">
          <span v-if="file">{{ file.name }}</span>
        </div>
        <a-button class="file-select-button" type="primary" @click="selectFile">
          {{ $t('Action.Browse') }}
        </a-button>
        <input ref="fileInput" type="file" class="real-file-input" accept=".csv" @input="setFile($event)" />
      </a-form-item>
      <div class="sample-file-container">
        <a class="sample-file" href="/static/settings/example/user-import-sample.csv" download="">{{
          $t('User.Import.Title.SampleFile')
        }}</a>
      </div>
    </a-form>
    <div v-if="status == 'importing'">
      <p class="progress-title">
        {{ $t('User.Import.Title.Importing') }}
      </p>
      <a-progress :stroke-width="20" :percent="percent" status="active" :show-info="false" />
      <p class="progress-percentage">{{ finished }}/{{ total }}</p>
    </div>
    <div v-if="status != 'importing' && status != 'idle'">
      <p>{{ $t('User.Import.Occupied.Tips') }}</p>
    </div>
    <template #footer>
      <a-button
        v-show="last_importing && status != 'importing'"
        type="primary"
        class="view-last-result"
        @click="viewLastResult">
        {{ $t('User.BatchImport.ViewLastResult') }}
      </a-button>
      <a-button key="back" @click="close">
        {{ $t('Action.Close') }}
      </a-button>
      <a-button
        v-show="status == 'idle'"
        key="submit"
        type="primary"
        :loading="loading"
        :disabled="!file"
        @click="uploadFile">
        {{ $t('Action.Import') }}
      </a-button>
      <a-button v-show="status == 'importing'" key="cancel" type="primary" @click="cancel">
        {{ $t('Action.Cancel') }}
      </a-button>
    </template>
  </a-modal>
</template>

<script>
import UserBatchImportService from '@/service/user-batch-import'
export default {
  emits: ['import-complete', 'show-import-result'],
  data() {
    return {
      title: '',
      status: '',
      last_importing: '',
      loading: false,
      dialogFormVisible: false,
      file: null,
      percent: 0,
      finished: 0,
      total: 0,
      timer: null,
    }
  },
  watch: {
    dialogFormVisible: function (val, oldVal) {
      if (!val) {
        clearTimeout(this.timer)
      }
    },
    status: function (val, oldVal) {
      if (val === 'idle' && oldVal === 'importing') {
        this.$emit('import-complete')
        this.viewLastResult()
      }
    },
  },
  methods: {
    show({ status, lastImporting }) {
      this.status = status
      this.last_importing = lastImporting
      this.dialogFormVisible = true
      if (status === 'idle') {
        this.file = null
        this.$nextTick(() => {
          this.$refs.fileInput.value = ''
        })
      } else if (status === 'importing') {
        this.refreshUploadStatus()
      }
    },
    selectFile() {
      this.$refs.fileInput.click()
    },
    setFile(event) {
      this.file = event.target.files[0]
    },
    uploadFile() {
      UserBatchImportService.importUsers(this.file).then(
        topRes => {
          this.loading = false
          UserBatchImportService.getUsersImportStatu().then(
            res => {
              this.status = res.status
              if (res.status === 'idle') {
                this.$emit('import-complete')
                this.viewLastResult()
              } else {
                this.refreshUploadStatus()
              }
            },
            err => {
              this.$message.error(err)
            },
          )
        },
        topErr => {
          this.$message.error(topErr)
        },
      )
    },
    refreshUploadStatus() {
      const $this = this
      this.timer = setTimeout(function refresh() {
        UserBatchImportService.getUsersImportStatu().then(
          res => {
            $this.status = res.status
            $this.last_importing = res.last_importing
            if (res.status === 'importing' && res.progress) {
              $this.finished = res.progress.finished
              $this.total = res.progress.total
              const computedPercent = (res.progress.finished / res.progress.total) * 100
              $this.percent = Object.is(NaN, computedPercent) ? 0 : computedPercent
              clearTimeout($this.timer)
              $this.timer = setTimeout(refresh, 1000)
            } else {
              clearTimeout($this.timer)
            }
          },
          err => {
            $this.$message.error(err)
          },
        )
      }, 0)
    },
    viewLastResult() {
      this.$emit('show-import-result')
      this.dialogFormVisible = false
    },
    cancel() {
      const $this = this
      this.$confirm({
        title: this.$t('User.Import.Cancel.Title'),
        content: this.$t('User.Import.Cancel.Tips'),
        okText: this.$t('Action.Confirm'),
        cancelText: this.$t('Action.Cancel'),
        onOk() {
          UserBatchImportService.cancelUsersImport().then(
            res => {
              $this.$message.success($this.$t('User.Import.Cancel.Success'))
              $this.refreshUploadStatus()
            },
            err => {
              $this.$message.error(err)
            },
          )
        },
        onCancel() {},
      })
    },
    close() {
      this.dialogFormVisible = false
    },
  },
}
</script>

<style scoped>
.batch-import-manage-dialog {
  padding: 20px;
}
.batch-import-manage-dialog .real-file-input[type='file'] {
  display: none;
}
.file-select-container {
  position: relative;
  margin-bottom: 0;
}
.file-info {
  position: absolute;
  top: -0;
  left: 0;
  width: 464px;
  height: 32px;
  line-height: 32px;
  border: 1px solid #ccc;
  overflow: hidden;
  border-radius: 4px;
  padding: 0 10px;
}
.file-select-button {
  position: absolute;
  left: 474px;
  top: 0;
}
.sample-file-container {
  margin-top: 30px;
}
.sample-file {
  line-height: 40px;
  text-decoration: underline;
}
.view-last-result {
  position: absolute;
  left: 18px;
}
.progress-percentage {
  text-align: right;
  line-height: 40px;
}
.progress-title {
  line-height: 40px;
}
</style>
