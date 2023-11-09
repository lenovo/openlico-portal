<template>
  <div ref="imageCropper" style="width: 100%; height: 100%">
    <div ref="imageCropperContainer" class="image-cropper-container">
      <canvas ref="image" style="display: block; max-width: 100%" />
    </div>
    <div class="image-cropper-action">
      <a-tooltip>
        <template #title>{{ $t('Action.ZoomIn') }}</template>
        <MinusOutlined class="image-cropper-action-item" @click="onDClick" />
      </a-tooltip>
      <a-tooltip>
        <template #title>{{ $t('Action.ZoomOut') }}</template>
        <PlusOutlined class="image-cropper-action-item" @click="onIClick" />
      </a-tooltip>
      <a-tooltip>
        <template #title>{{ $t('Action.RotateLeft') }}</template>
        <span class="image-cropper-action-item el-erp-Leftrotation" @click="onLClick"></span>
      </a-tooltip>
      <a-tooltip>
        <template #title>{{ $t('Action.RotateRight') }}</template>
        <span class="image-cropper-action-item el-erp-rightrotation" @click="onRClick"></span>
      </a-tooltip>
      <a-tooltip>
        <template #title>{{ $t('Action.FlipHorizontal') }}</template>
        <span class="image-cropper-action-item el-erp-Horizontalmirror" @click="onYClick"></span>
      </a-tooltip>
      <a-tooltip>
        <template #title>{{ $t('Action.FlipVertical') }}</template>
        <span class="image-cropper-action-item el-erp-mirrorvertically" @click="onXClick"></span>
      </a-tooltip>
    </div>
  </div>
</template>
<script>
import 'cropperjs/dist/cropper.css'
import Cropper from 'cropperjs'

export default {
  props: {
    image: {
      type: String,
      default: '',
    },
    imageQuality: {
      type: Number,
      default: 0.01,
    },
    imageWidth: {
      type: Number,
      default: 200,
    },
    imageHeight: {
      type: Number,
      default: 200,
    },
    outputType: {
      type: String,
      default: 'jpeg',
    },
    fixedNumber: {
      type: Array,
      default: () => {
        return [1, 1]
      },
    },
  },
  data() {
    return {
      instance: null,
      img: '',
      scaleY: 1,
      scaleX: 1,
      file: null,
    }
  },
  watch: {
    image(val) {
      this.pressFile()
    },
  },
  mounted() {
    this.pressFile()

    // .setCanvasData(this.image)

    // this.img = this.image
  },
  beforeUnmount() {
    if (this.instance) this.instance.destroy()
  },
  methods: {
    init() {
      if (this.instance) this.instance.destroy()
      const FHeight = this.file.height
      const FWidth = this.file.width
      const CHeight = this.$refs.imageCropperContainer.offsetHeight
      const CWidth = this.$refs.imageCropperContainer.offsetWidth
      this.instance = new Cropper(this.$refs.image, {
        viewMode: FHeight < CHeight || FWidth < CWidth ? 1 : 3,
        autoCrop: true,
        autoCropArea: 0.1,
        resizable: false,
        dragMode: 'move',
        cropBoxMovable: false,
        cropBoxResizable: false,
        zoomOnWheel: false,
        aspectRatio: this.fixedNumber[0] / this.fixedNumber[1],
        center: false,
        guides: false,
        minCropBoxWidth: this.imageWidth,
        minCropBoxHeight: this.imageHeight,
      }).replace(this.image)
    },
    onDClick() {
      const canvasBox = this.instance.getCanvasData()
      if (canvasBox.width <= this.imageWidth || canvasBox.height <= this.imageHeight) {
        return
      }

      this.instance.zoom(-1)
    },
    onIClick() {
      this.instance.zoom(1)
    },
    onLClick() {
      this.instance.rotate(-90)
    },
    onRClick() {
      this.instance.rotate(90)
    },
    onYClick() {
      this.scaleY = this.scaleY > 0 ? -1 : 1
      this.instance.scale(this.scaleY, this.scaleX)
    },
    onXClick() {
      this.scaleX = this.scaleX > 0 ? -1 : 1
      this.instance.scale(this.scaleY, this.scaleX)
    },
    getImageBase64() {
      return this.instance.getCroppedCanvas().toDataURL('image/' + this.outputType)
    },
    pressFile() {
      if (this.image) {
        if (this.image.startsWith('data:')) {
          const image = new Image()
          image.onload = () => {
            this.file = {
              dom: image,
              with: image.width,
              height: image.height,
            }
            this.init()
          }
          image.src = this.image
        } else {
          this.file = this.image
          this.init()
        }
      }
    },
  },
}
</script>
<style>
.image-cropper-container {
  height: calc(100% - 20px);
}
.image-cropper-action {
  padding: 5px 0;
}
.image-cropper-action-item {
  margin-right: 20px;
}
</style>
