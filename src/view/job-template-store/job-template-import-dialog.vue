<template>
  <a-modal :title="title" :visible.sync="dialogVisible" :destroy-on-close="true" width="500px" @cancel="onCancelClick">
    <a-spin :spinning="loading">
      <a-form-model
        v-show="!loading"
        ref="templateImportForm"
        :model="templateForm"
        :rules="templateRules"
        class="template-import-form">
        <a-form-model-item :label="$t('JobTemplate.Name')" prop="name">
          <a-input v-model="templateForm.name" />
        </a-form-model-item>
        <a-form-model-item :label="$t('JobTemplate.Import.TemplateFile')" prop="fileName">
          <a-input-group compact>
            <a-input v-model="templateForm.fileName" style="width: 80%" read-only />
            <a-button style="width: 20%" type="primary" @click="chooseFile">
              {{ $t('Action.Browse') }}
            </a-button>
          </a-input-group>
          <input ref="fileInput" type="file" accept=".ljt" style="display: none" @change="setFile($event)" />
        </a-form-model-item>
      </a-form-model>
    </a-spin>
    <div slot="footer" class="dialog-footer">
      <a-button v-show="!loading" @click="onCancelClick">
        {{ $t('Dialog.Cancel') }}
      </a-button>
      <a-button :loading="loading" type="primary" @click="onImportClick">
        {{ $t('Dialog.Submit') }}
      </a-button>
    </div>
  </a-modal>
</template>

<script>
import ValidRoleFactory from '../../common/valid-role-factory'
import TemplateService from '../../service/job-template'

export default {
  data() {
    return {
      title: this.$t('JobTemplate.Import.Title'),
      dialogVisible: false,
      token: window.gApp.$store.state.auth.token,
      loading: false,
      file: {},
      templateForm: {},
      submitUrl: '/api/jobtemplates/import/',
      innerResolve: null,
      innerReject: null,
      templateRules: {
        name: [
          ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Name')),
          ValidRoleFactory.getLengthRoleForText(this.$t('JobTemplate.Name'), 3, 20),
        ],
        fileName: [ValidRoleFactory.getRequireRoleForText(this.$t('JobTemplate.Import.TemplateFile'))],
      },
    }
  },
  methods: {
    doImport() {
      this.dialogVisible = true
      this.templateForm = {
        name: '',
        fileName: '',
      }
      return new Promise((resolve, reject) => {
        this.innerResolve = resolve
        this.innerReject = reject
      })
    },
    onImportClick() {
      this.$refs.templateImportForm.validate(valid => {
        if (valid) {
          this.loading = true
          TemplateService.importTemplate(this.templateForm).then(
            res => {
              this.$message.success(
                this.$t('JobTemplate.Import.Success', {
                  name: this.templateForm.name,
                }),
              )
              this.loading = false
              this.dialogVisible = false
              this.innerResolve()
            },
            err => {
              this.$message.error(err)
              this.loading = false
              this.innerReject()
            },
          )
        }
      })
    },
    chooseFile() {
      this.$refs.fileInput.click()
    },
    setFile(event) {
      this.file = event.target.files[0] || null
      this.templateForm = {
        name: this.templateForm.name,
        fileName: this.file.name,
        file: this.file,
      }
    },
    onCancelClick() {
      if (this.loading) return
      this.loading = false
      this.$refs.templateImportForm.resetFields()
      this.dialogVisible = false
      this.innerReject()
    },
  },
}
</script>

<style>
.template-file-select-body {
  height: 40px;
  line-height: 40px;
  position: relative;
}

.template-file-select-body .el-upload--text {
  position: absolute;
  right: 0;
  top: 0;
}
.template-file-select-body .el-upload-list--text {
  width: 300px;
  position: absolute;
  top: -2px;
  right: 96px;
}
.template-file-select-body .el-upload-list__item:hover {
  background-color: #fff;
}
.template-import-form {
  padding-right: 20px;
}
</style>
