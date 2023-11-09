<template>
  <a-modal
    v-model:open="dialogVisible"
    :title="title"
    :width="mode == 'browse' ? '40%' : '30%'"
    closable
    @cancel="dialogVisible = false">
    <div v-if="mode == 'browse'" class="message-row">
      <p class="image-title">
        {{ $t('Image.Path') }}
      </p>
      <p class="image-info">
        {{ image.imagePath }}
      </p>
    </div>
    <div v-if="mode == 'browse' && image.description" class="message-row">
      <p class="image-title">
        {{ $t('Image.Description') }}
      </p>
      <p class="image-info">
        {{ image.description }}
      </p>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <a-button type="primary" @click="dialogVisible = false">{{ $t('Operation.Module.confirm') }}</a-button>
      </span>
    </template>
  </a-modal>
</template>
<script>
export default {
  data() {
    return {
      mode: '',
      title: '',
      dialogVisible: false,
      image: this.data,
    }
  },
  methods: {
    doBrowse(data) {
      this.mode = 'browse'
      this.image = data
      this.title = this.$t('Image.Information')
      this.dialogVisible = true
    },
  },
}
</script>

<style scoped>
.message-row {
  margin: 10px 0 10px 20px;
}
.image-title {
  color: #999;
  font-size: 14px;
  line-height: 24px;
}
.image-info {
  color: #333;
  font-size: 14px;
  line-height: 24px;
  margin-bottom: 8px;
}
</style>
