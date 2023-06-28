<template>
  <a-modal
    :title="title"
    :visible.sync="dialogVisible"
    :width="mode == 'browse' ? '40%' : '30%'"
    custom-class="image-message"
    closable
    @cancel="dialogVisible = false">
    <a-row v-if="mode == 'browse'" class="message-row">
      <p class="image-title">
        {{ $t('Image.Path') }}
      </p>
      <p class="image-info">
        {{ image.imagePath }}
      </p>
    </a-row>
    <a-row v-if="mode == 'browse' && image.description" class="message-row">
      <p class="image-title">
        {{ $t('Image.Description') }}
      </p>
      <p class="image-info">
        {{ image.description }}
      </p>
    </a-row>
    <span slot="footer" class="dialog-footer">
      <a-button type="primary" @click="dialogVisible = false">{{ $t('Operation.Module.confirm') }}</a-button>
    </span>
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

<style>
.image-message .message-row {
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
