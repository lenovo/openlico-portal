<template>
  <div class="job-parameters-affinity-editor">
    <a-input-group compact>
      <a-select v-model:value="defaultValue" class="job-parameters-affinity-select" style="width: 80%">
        <a-select-option value="notbind">
          {{ $t('JobTemplate.Affinity.NotBind') }}
        </a-select-option>
        <a-select-option v-for="item in affinityOptions" :key="item.id">
          {{ item.name }}
        </a-select-option>
        <a-select-option value="add" @click="onAddNewSettings">
          {{ $t('JobTemplate.Affinity.NewSetting') }}
        </a-select-option>
      </a-select>
      <a-button :disabled="disabled" class="job-parameters-affinity-button-edit" @click="onEditSettings">
        {{ $t('Action.Edit') }}
      </a-button>
    </a-input-group>
    <affinity-openmp-dialog ref="affinityDialog.openmp" @delete="onDeleteSettings" />
    <affinity-intelmpi-dialog ref="affinityDialog.intelmpi" @delete="onDeleteSettings" />
  </div>
</template>
<script>
import AffinityService from '@/service/job-template-affiity'
import affinityIntelmpiDialog from './affinity/affinity-intelmpi-dialog.vue'
import affinityOpenmpDialog from './affinity/affinity-openmp-dialog.vue'
export default {
  components: { affinityOpenmpDialog, affinityIntelmpiDialog },
  props: ['value', 'type'],
  emits: ['input', 'update:value'],
  data() {
    return {
      defaultValue: 'notbind',
      affinityOptions: [],
    }
  },
  computed: {
    disabled() {
      return this.defaultValue === 'add' || this.defaultValue === 'notbind'
    },
  },
  watch: {
    defaultValue(val, old) {
      if (val === 'add') {
        this.defaultValue = 'notbind'
      } else {
        this.$emit('input', val === 'notbind' ? null : val)
        this.$emit('update:value', val === 'notbind' ? null : val)
      }
    },
  },
  mounted() {
    this.getAffinityOptions()
    this.defaultValue = this.value === null ? 'notbind' : this.value
  },
  methods: {
    onAddNewSettings() {
      this.defaultValue = 'notbind'
      this.$refs[`affinityDialog.${this.type}`].doAdd().then(
        res => {
          this.getAffinityOptions()
          this.$nextTick(() => {
            this.defaultValue = res
          })
        },
        _ => {},
      )
    },
    onEditSettings() {
      const setttings = this.affinityOptions.filter(i => i.id === this.defaultValue)[0]
      this.$refs[`affinityDialog.${this.type}`].doEdit(setttings).then(
        res => {
          this.getAffinityOptions()
        },
        _ => {},
      )
    },
    onDeleteSettings() {
      this.getAffinityOptions()
      this.$nextTick(() => {
        this.defaultValue = 'notbind'
      })
    },
    getAffinityOptions() {
      AffinityService.getAffinityByRuntime(this.type).then(
        res => {
          this.affinityOptions = res
        },
        err => {
          this.$message.error(err)
        },
      )
    },
  },
}
</script>
<style>
.job-parameters-affinity-editor {
  width: 375px;
}
.job-parameters-affinity-button-edit {
  width: 20%;
  border-top-right-radius: 4px !important;
  border-bottom-right-radius: 4px !important;
}
.job-parameters-affinity-dialog {
}
.job-parameters-affinity-dialog .ant-form-item {
  margin-bottom: 10px;
}
.job-parameters-affinity-environment {
  text-align: right;
}
.job-parameters-affinity-layout-content {
  width: 100%;
  height: 400px;
  border: 1px solid #eee;
}
.job-parameters-affinity-advanced-title {
  background-color: #f8f8f8;
  padding: 10px;
}
</style>
