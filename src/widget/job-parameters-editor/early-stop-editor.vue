<template>
  <div class="job-template-early-stop">
    <a-checkbox v-model="innerData.early_stop" @change="onChange" />
    <span v-if="value.early_stop" class="job-template-early-stop-settings" @click="onSettingsClick">{{
      $t('Menu.Setting')
    }}</span>
    <early-stop-dialog ref="earlyStopDialog" :settings="settings" />
  </div>
</template>
<script>
import EarlyStopDialog from './early-stop-dialog.vue'

export default {
  components: { EarlyStopDialog },
  props: ['value', 'settings'],
  data() {
    return {
      innerData: this.value,
    }
  },
  methods: {
    onSettingsClick() {
      this.innerData = this.value
      this.$refs.earlyStopDialog.doSetting(this.innerData).then(
        res => {
          this.$emit('input', { ...this.innerData, ...res })
        },
        _ => {},
      )
    },
    onChange() {
      this.innerData.early_stop && this.onSettingsClick()
      this.$emit('input', this.innerData)
    },
  },
}
</script>
<style scoped>
.job-template-early-stop-settings {
  color: #1890ff;
  margin-left: 20px;
  cursor: pointer;
}
</style>
