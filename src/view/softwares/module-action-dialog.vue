<template>
  <div>
    <composite-form-dialog
      ref="innerDialog"
      :title="title"
      :form-model="formModel"
      :form-rules="formRules"
      :success-message-formatter="successMessageFormatter">
      <div v-if="mode === 'Location'">
        <p class="software-modules-item">
          <span class="software-modules-item-title">{{ $t('Name') }}</span>
          <span class="software-modules-item-content">{{ formModel.name }}</span>
        </p>
        <p class="software-modules-item">
          <span class="software-modules-item-title">{{ $t('Softwares.Modules.Location') }}</span>
          <span class="software-modules-item-content">{{ formModel.location }}</span>
        </p>
      </div>
      <p v-if="mode === 'Delete'">{{ $T('Softwares.Modules.Delete.Msg', { module: formModel.name }) }}</p>
    </composite-form-dialog>
  </div>
</template>
<script>
import Format from '@/common/format'
import SoftwaresService from '@/service/softwores'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
export default {
  components: { CompositeFormDialog },
  data() {
    return {
      Format,
      title: '',
      mode: '',
      formModel: {},
      formRules: {},
    }
  },
  methods: {
    doSubmit() {
      if (this.mode === 'Delete') {
        return SoftwaresService.removeModule(this.formModel)
      }
    },
    successMessageFormatter(res) {
      return this.$T(`Softwares.Modules.${this.mode}.Success`, { module: this.formModel.name })
    },
    doLocation(data) {
      this.title = this.$t('Softwares.Modules.Location.Title')
      this.mode = 'Location'
      this.formModel = data
      this.$refs.innerDialog.emptyPopup().catch(_ => {})
    },
    doRemove(data) {
      this.title = this.$t('Softwares.Modules.Delete.Title')
      this.mode = 'Delete'
      this.formModel = data
      return this.$refs.innerDialog.popup(this.doSubmit)
    },
  },
}
</script>
<style scoped>
.software-modules-item {
  display: flex;
  padding: 5px 0;
}
.software-modules-item-title {
  width: 80px;
  flex-shrink: 0;
}
.software-modules-item-content {
  white-space: break-spaces;
}
</style>
