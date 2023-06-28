<template>
  <div class>
    <composite-form-dialog
      ref="innerDialog"
      :title="title"
      size="500px"
      :form-model="imageForm"
      :form-rules="imageRules"
      :success-message-formatter="successMessageFormatter"
      :error-message-formatter="errorMessageFormatter"
      :external-validate="externalValidate">
      <a-form-model-item :label="$t('Image.Name')" :prop="mode == 'import' ? 'name' : ''">
        <a-input v-model="imageForm.name" :disabled="mode != 'import'"> </a-input>
      </a-form-model-item>
      <a-form-model-item v-if="mode != 'edit'" :label="$t('Image.Framework')" prop="framework">
        <a-select v-model="imageForm.framework">
          <a-select-option v-for="item in frameworkOptions" :key="item.value" :value="item.value"
            >{{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item v-if="arch == 'host' && mode != 'edit'" :label="$t('Image.SourceFile')" prop="sourceFile">
        <file-select v-model="imageForm.sourceFile" type="file"></file-select>
      </a-form-model-item>
      <a-form-model-item v-if="arch == 'host' && mode != 'edit'" :label="$t('Image.targetFile')" prop="targetFile">
        <div class style="display: flex">
          <a-input v-model="targetFile" read-only></a-input>
        </div>
      </a-form-model-item>
      <a-form-model-item :label="$t('Image.Version')" prop="version">
        <a-input v-model="imageForm.version"></a-input>
      </a-form-model-item>
      <a-form-model-item ref="tagFormItem" :label="$t('Image.Tag')" class="image-container-tag" prop="dynamicTags">
        <multi-tags-input
          id="tid_image-tags"
          ref="tagInput"
          v-model="imageForm.dynamicTags"
          :new-tag-button-text="$t('Action.Add')"
          :valid-roles="tagRules"
          :disabled="false">
        </multi-tags-input>
      </a-form-model-item>
      <a-form-model-item :label="$t('Image.Description')" prop="description">
        <a-input v-model="imageForm.description" type="textarea" style="resize: none"></a-input>
      </a-form-model-item>
    </composite-form-dialog>
    <file-manager-dialog ref="ImagefileManagerDialog" />
  </div>
</template>

<script>
import CompositeFormDialog from '../../component/composite-form-dialog'
import FileManagerDialog from '../../component/file-manager-dialog'
import MultiTagsInput from '../../component/multi-tags-input'
import FileSelect from '../../component/file-select'
import ValidRoleFactory from '../../common/valid-role-factory'
import AccessService from '../../service/access'
import ImageService from '../../service/image'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
    'file-manager-dialog': FileManagerDialog,
    'file-select': FileSelect,
    'multi-tags-input': MultiTagsInput,
  },
  data() {
    const checkImagePath = (rule, value, callback) => {
      const pattern = /^[A-Za-z0-9_\.\-/:]*$/ // eslint-disable-line no-useless-escape
      const regExp = new RegExp(pattern)
      const errors = []
      if (value.toString().length > 0 && !regExp.test(value.toString())) {
        errors.push(
          new Error(
            this.$t('Image.Path.Value.Valid', {
              name: this.$t('Image.Path'),
            }),
          ),
        )
      }
      callback(errors)
    }
    return {
      inputVisible: false,
      inputValue: '',
      title: '',
      mode: '',
      imageForm: {
        description: '',
        sourceFile: '',
        imageSize: 0,
        name: '',
        framework: 'tensorflow',
        version: '',
        dynamicTags: [],
        imagePath: '',
      },
      frameworkOptions: [],
      frameworkOptionsDocker: [],
      frameworkOptionsSingularity: [],
      FrameworkTypeSingularity: ImageService.FrameworkTypeSingularity,
      arch: 'host',
      tagRules: [
        ValidRoleFactory.getLengthRoleForText(this.$t('Image.Name'), 3, 12),
        ValidRoleFactory.getValidIdentityNameRoleForText(this.$t('Image.Tag')),
      ],
      imageRules: {
        name: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Image.Name')),
          ValidRoleFactory.getLengthRoleForText(this.$t('Image.Name'), 3, 64),
          ValidRoleFactory.getValidSystemNameRoleForText(this.$t('Image.Name'), true),
        ],
        description: [ValidRoleFactory.getLengthRoleForText(this.$t('Image.Description'), 0, 200)],
        sourceFile: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Image.SourceFile')),
          ValidRoleFactory.getLengthRoleForText(this.$t('Image.SourceFile'), 1, 255),
        ],
        imagePath: [
          { required: true, trigger: 'change' },
          { validator: checkImagePath, trigger: 'change' },
          ValidRoleFactory.getLengthRoleForText(this.$t('Image.Path'), 1, 255),
        ],
        version: [ValidRoleFactory.getLengthRoleForText(this.$t('Image.Version'), 1, 32)],
        dynamicTags: [ValidRoleFactory.getLengthRoleForArray(this.$t('Image.Tag'), 0, 20)],
      },
    }
  },
  computed: {
    targetFile: function () {
      return this.imageForm.name + '.sif'
    },
  },
  watch: {
    'imageForm.dynamicTags'(val, oldVal) {
      if (val.length === 0 && oldVal.length === 0) {
        return
      }
      this.$nextTick(() => {
        this.$refs.tagFormItem.validate()
      })
    },
  },
  mounted() {
    this.frameworkOptions = this.frameworkOptionsSingularity
    this.arch = AccessService.getSchedulerArch()
    this.FrameworkTypeSingularity.forEach(item => {
      this.frameworkOptionsSingularity.push({
        value: item,
        label: this.$t('Image.Framework.' + item),
      })
    })
  },
  methods: {
    submitForm() {
      if (this.mode === 'import') {
        return ImageService.createImage(
          this.imageForm.name,
          this.imageForm.sourceFile ? this.imageForm.sourceFile.replace('MyFolder/', '') : '',
          this.imageForm.imagePath,
          this.imageForm.description,
          this.imageForm.framework,
          this.imageForm.version,
          this.imageForm.dynamicTags,
          this.targetFile,
          this.$store.state.auth.access,
        )
      } else if (this.mode === 'edit') {
        return ImageService.editImage(
          this.imageId,
          this.imageForm.imagePath,
          this.imageForm.version,
          this.imageForm.dynamicTags,
          this.imageForm.description,
        )
      }
    },
    successMessageFormatter(res) {
      const mode = this.mode === 'import' ? 'Import' : this.mode === 'edit' ? 'Edit' : this.mode
      return this.$t(`Image.${mode}.${this.arch === 'host' ? 'Ready' : 'Success'}`, { name: this.imageForm.name })
    },
    errorMessageFormatter(res) {
      return this.$t(res)
    },
    doImport(name, sourceFile, framework) {
      this.mode = 'import'
      this.imageId = 45
      this.imageForm = {
        name: name || '',
        description: '',
        framework: framework || 'tensorflow',
        version: '',
        dynamicTags: [],
      }
      if (this.arch === 'host') {
        this.$set(this.imageForm, 'sourceFile', sourceFile || '')
      } else {
        this.$set(this.imageForm, 'imagePath', sourceFile || '')
      }
      this.title = this.$t('Image.Import.Title')
      this.$nextTick(() => {
        this.$refs.tagInput.cleanInput()
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEdit(data) {
      this.mode = 'edit'
      this.$nextTick(() => {
        this.imageId = data.id
        this.imageForm = {
          name: data.name,
          description: data.description,
          framework: data.framework,
          version: data.version,
          dynamicTags: data.tags,
        }
        this.title = this.$t('Image.Edit.Title')
        this.$refs.tagInput.cleanInput()
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    externalValidate(callbackFunc) {
      if (this.$refs.tagInput.errorMessage) {
        callbackFunc(false)
        return false
      }
      if (this.mode !== 'import') {
        callbackFunc(true)
        return
      }
      ImageService.checkImage(this.targetFile, this.$store.state.auth.access).then(res => {
        if (res.exists) {
          this.$message.error(
            this.$t('Image.Check.message', {
              name: this.imageForm.name,
            }),
          )
        }
        callbackFunc(!res.exists)
      })
    },
  },
}
</script>
<style>
.image-container-tag .el-tag + .el-tag {
  margin-left: 10px;
}
.image-container-tag .button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.image-container-tag .input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
