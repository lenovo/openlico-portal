<template>
  <div ref="fileIconSelect" style="display: flex" class="job-template-icon-select">
    <a-input v-show="!iconShow" v-model:value="imageValue" read-only class="select-file-input" />
    <img v-if="iconShow" :src="value" class="create-jobtemplate-logo-show" />
    <a-button id="Icon_Select_Button" style="margin-left: 10px" @click="dialogTableVisible = true">
      {{ $t('FileSelect.Select') }}
    </a-button>
    <a-button v-if="restoreIcon && restoreIcon != value" id="Icon_Restore_Button" @click="onRestoreIcon(restoreIcon)">
      {{ $t('FileSelect.Restore') }}
    </a-button>
    <a-modal
      width="660px"
      :open="dialogTableVisible"
      left
      class="template-icon-select-modal"
      :get-container="() => $refs.fileIconSelect"
      @cancel="dialogTableVisible = false">
      <template #title>
        <span class="dialog-footer" style="text-align: left">{{ $t('Select.Icon') }}</span>
      </template>

      <div v-if="!image" class="showImgs">
        <img v-for="logo in defaultIcon" :key="logo" :src="logo" class="selectImg" @click="selectIcon(logo)" />
        <a-form-item-rest>
          <a-upload
            :show-upload-list="false"
            :before-upload="beforeUpload"
            list-type="picture-card"
            accept=".jpg, .jpeg, .png, .bmp"
            class="file-select-upload">
            <img src="/static/img/system/template/Add.png" class="selectImg" />
          </a-upload>
        </a-form-item-rest>
      </div>
      <div v-else style="width: 612px; height: 400px">
        <ImageCropper ref="imageCropper" :image="image" />
      </div>

      <template #footer>
        <div v-if="image" ref="footer" class="dialog-footer" style="text-align: left">
          <a-button type="primary" @click="saveImage">
            {{ $t('Action.Upload') }}
          </a-button>
          <a-button v-show="image" @click="image = ''">
            {{ $t('Action.Clear') }}
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>
<script>
import Utils from '@/common/utils'
import ImageCropper from './image-cropper.vue'

export default {
  components: {
    ImageCropper,
  },
  props: ['value', 'restoreIcon'],
  emits: ['input', 'update:value'],
  data() {
    return {
      defaultIcon: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => {
        return `/static/img/system/template/template_logo_${i}.png`
      }),
      dialogTableVisible: false,
      iconShow: false,
      image: null,
      fileList: [],
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
        this.$emit('update:value', copyValue)
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
      this.dialogTableVisible = false
      Utils.getBase64ByImgUrl(logo, base64Img => {
        this.iconShow = true
        this.$emit('input', base64Img)
        this.$emit('update:value', base64Img)
      })
    },
    saveImage() {
      this.dialogTableVisible = false
      this.iconShow = true
      const image = this.$refs.imageCropper.getImageBase64()
      this.$emit('input', image)
      this.$emit('update:value', image)
    },
    onRestoreIcon(icon) {
      this.$emit('input', icon)
      this.$emit('update:value', icon)
    },
    beforeUpload(file) {
      if (!file.type.startsWith('image/')) {
        this.$message.error(this.$t('Select.Image.Vaild'))
        return false
      }
      Utils.getBase64ByFile(file, res => {
        this.image = res
      })
      return false
    },
  },
}
</script>

<style scoped>
.job-template-icon-select :deep(.select-file-input) {
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
.template-icon-select-modal :deep(.ant-modal-footer) {
  display: none;
}
.job-template-icon-select :deep(.ant-upload-select) {
  border: none !important;
  background-color: transparent !important;
}
</style>
