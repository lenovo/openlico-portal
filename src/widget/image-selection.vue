<template>
  <div class="image-selection">
    <a-input-group compact class="image-select-content">
      <a-select
        v-if="imageType == 'system'"
        v-model:value="path"
        :disabled="disabled"
        :placeholder="$t('ImageSelection.Select.Placeholder')"
        :show-search="false"
        allow-clear
        :style="{ width: '100%' }"
        @change="submit"
        @blur="changeInput">
        >
        <a-select-option v-for="(item, index) in images" :key="index" :value="item.value">{{
          item.label
        }}</a-select-option>
      </a-select>
      <a-input
        v-if="imageType == 'private'"
        v-model:value="privatePath"
        style="width: 70%"
        :placeholder="$t('ImageSelection.Input.Placeholder')"
        @blur="changeInput"></a-input>
    </a-input-group>
    <image-version-tag :image-options="images" :image="path" :show-image-type="showImageType" />
  </div>
</template>

<script>
import imageVersionTag from './image-version-tag.vue'

export default {
  components: {
    'image-version-tag': imageVersionTag,
  },
  props: {
    value: String,
    images: {
      type: Array,
      default: () => {
        return []
      },
    },
    disabled: Boolean,
    dispalayImageType: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['input', 'update:value'],
  data() {
    return {
      defaultValue: this.value,
      path: '',
      privatePath: '',
      imageType: 'system',
      showImageType: this.dispalayImageType === undefined ? true : this.dispalayImageType,
    }
  },
  watch: {
    defaultValue: function (newVal, oldVal) {
      this.init(newVal)
    },
    images(val, old) {
      this.init(this.value)
    },
  },
  mounted() {
    this.init(this.value)
  },
  methods: {
    init(path) {
      const image = this.filterImages(path)
      this.path = image ? image.value : path
      this.$emit('input', this.path)
      this.$emit('update:value', this.path)
    },
    filterImages(path) {
      if (path) {
        return this.images.filter(el => el.username === '' && (el.value === path || el.label === path))[0]
      } else {
        if (this.images.length) {
          return this.images[0]
        } else {
          // nothing
        }
      }
    },
    submit() {
      if (this.path === undefined) {
        this.$emit('input', '')
        this.$emit('update:value', '')
      } else {
        this.$emit('input', this.path.trim())
        this.$emit('update:value', this.path.trim())
      }
    },
    changeInput() {},
  },
}
</script>

<style scoped>
.image-select-content {
  margin-right: 10px;
}
.image-select-content :deep(.ant-select-selection) {
  border-radius: 4px !important;
}
</style>
