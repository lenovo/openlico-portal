<template>
  <div style="display: flex" class="job-template-icon-select">
    <a-input v-show="!iconShow" v-model="imageValue" read-only class="select-file-input" />
    <img v-if="iconShow" :src="value" class="create-jobtemplate-logo-show" />
    <a-button id="Icon_Select_Button" style="margin-left: 10px" @click="dialogTableVisible = true">
      {{ $t('FileSelect.Select') }}
    </a-button>
    <a-button v-if="restoreIcon && restoreIcon != value" id="Icon_Restore_Button" @click="onRestoreIcon(restoreIcon)">
      {{ $t('FileSelect.Restore') }}
    </a-button>
    <a-modal
      width="660px"
      :visible.sync="dialogTableVisible"
      left
      class="template-icon-select-modal"
      @cancel="dialogTableVisible = false">
      <span slot="title" class="dialog-footer" style="text-align: left">Select Icon</span>
      <div class="showImgs">
        <img
          v-for="logo in defaultIcon"
          v-show="!image"
          :key="logo"
          :src="logo"
          class="selectImg"
          @click="selectIcon(logo)" />
      </div>
      <image-input
        ref="imageInput"
        v-model="image"
        :image-quality="0.85"
        :image-width="200"
        :image-height="200"
        :class="image ? '' : 'selectImg'"
        overlay-border-color="#91d5ff"
        clearable
        image-format="jpeg" />
      <div slot="footer" ref="footer" class="dialog-footer" style="text-align: left">
        <a-button
          :disabled="!($refs.imageInput && $refs.imageInput.internalImageData)"
          type="primary"
          @click="saveImage">
          {{ $t('Action.Upload') }}
        </a-button>
        <a-button v-show="image" @click="$refs.imageInput && $refs.imageInput.clear()">
          {{ $t('Action.Clear') }}
        </a-button>
      </div>
    </a-modal>
    <file-manager-dialog ref="fileManagerDialog" />
  </div>
</template>
<script>
import FileManagerDialog from './file-manager-dialog'
import ImageInput from './ImageInput/index.js'

export default {
  components: {
    'file-manager-dialog': FileManagerDialog,
    ImageInput,
  },
  props: ['value', 'restoreIcon'],
  data() {
    return {
      defaultIcon: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => {
        return `static/img/system/template/template_logo_${i}.png`
      }),
      dialogTableVisible: false,
      iconShow: false,
      image: null,
    }
  },
  computed: {
    imageValue: {
      get() {
        return this.value
      },
      set(newValue) {
        const copyValue = this.value.slice()
        copyValue.push(newValue)
        this.$emit('input', copyValue)
      },
    },
  },
  watch: {
    value(val, oldVal) {
      if (this.value.includes('data:image')) {
        this.iconShow = true
      }
    },
    image(value) {
      const footer = document.getElementsByClassName('ant-modal-footer')[0]
      if (value) {
        footer.style.display = 'block'
      } else {
        footer.style.display = 'none'
      }
    },
  },
  methods: {
    selectIcon(logo) {
      const _this = this
      _this.dialogTableVisible = false
      _this.convertImgToBase64(logo, function (base64Img) {
        _this.iconShow = true
        _this.$emit('input', base64Img)
      })
    },
    saveImage() {
      this.dialogTableVisible = false
      this.iconShow = true
      this.$emit('input', this.image)
    },
    onCustomClick() {
      this.dialogTableVisible = false
      this.$refs.fileManagerDialog.selectFile(this.defaultFolder).then(path => {
        this.iconShow = false
        this.$emit('input', path)
      })
    },
    onRestoreIcon(icon) {
      this.$emit('input', icon)
    },
    convertImgToBase64(url, callback, outputFormat) {
      let canvas = document.createElement('CANVAS')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = function () {
        canvas.height = img.height
        canvas.width = img.width
        ctx.drawImage(img, 0, 0)
        const dataURL = canvas.toDataURL(outputFormat || 'image/jpeg')
        callback.call(this, dataURL)
        canvas = null
      }
      img.src = url
    },
  },
}
</script>

<style lang="css" scoped>
.job-template-icon-select >>> .select-file-input {
  width: 300px;
}
.dialog-footer {
  padding-left: 10px;
  color: #333;
  font-size: 18px;
}
.selectImg {
  border: 1px solid transparent;
  padding: 10px;
  width: 100px;
  height: 100px;
}
.selectImg:hover {
  box-shadow: 0px 0px 2px 3px #f1f1f1;
  border-radius: 2px;
  cursor: pointer;
  opacity: 9;
}
.create-jobtemplate-logo-show {
  box-sizing: border-box;
  border: 1px solid #eee;
  border-radius: 8px;
  width: 80px;
  height: 80px;
  line-height: 0;
  object-fit: contain;
}
.template-icon-select-modal >>> .ant-modal-footer {
  display: none;
}
</style>
