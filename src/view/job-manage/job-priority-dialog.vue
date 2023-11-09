<template>
  <composite-form-dialog
    ref="innerDialog"
    size="500px"
    :title="title"
    :failed-close-dialog="true"
    :form-model="formModel"
    :form-rules="formRules"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-item :label="$t('Job.Priority')" name="priority">
      <a-select v-model:value="formModel.priority" :default-value="priorityList[0].label" @change="clearCustomValue">
        <a-select-option v-for="(item, index) in priorityList" :key="index" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-if="formModel.priority === 'custom'" ref="priorityForm" name="priorityValue">
      <template #label>
        <span>
          {{ $t('Job.Priority.Custom.label') }}
          <a-tooltip
            :title="
              $T('Job.Priority.Custom.Help', {
                min: priorityMin,
                max: priorityMax,
              })
            "
            placement="topLeft"
            :get-popup-container="n => n.ownerDocument.body">
            <question-circle-outlined />
          </a-tooltip>
        </span>
      </template>
      <a-input
        v-model:value="formModel.priorityValue"
        :placeholder="$T('Job.Priority.Custom.Placeholder', { min: priorityMin, max: priorityMax })"
        class="num"
        allow-clear />
    </a-form-item>
  </composite-form-dialog>
</template>

<script>
import JobService from '@/service/job'
import ValidRoleFactory from '@/common/valid-role-factory'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'

export default {
  components: {
    CompositeFormDialog,
  },
  data() {
    return {
      title: this.$t('Job.Priority.Dialog.Title'),
      priorityList: [
        {
          value: 'highest',
          label: this.$t('Job.Priority.Highest'),
        },
        {
          value: 'lowest',
          label: this.$t('Job.Priority.Lowest'),
        },
        {
          value: 'custom',
          label: this.$t('Job.Priority.Custom'),
        },
      ],
      formModel: {
        priority: '',
        priorityValue: '',
      },
      formRules: {},
      jobs: [],
      priorityMin: 0,
      priorityMax: 0,
    }
  },
  created() {
    this.getSchedulerPriorityValue()
  },
  methods: {
    submitForm() {
      let tempJobPriority = 0
      if (this.formModel.priority === 'highest') {
        tempJobPriority = this.priorityMax
      } else if (this.formModel.priority === 'lowest') {
        tempJobPriority = this.priorityMin
      } else if (this.formModel.priority === 'custom') {
        tempJobPriority = this.formModel.priorityValue
      }
      const req = {
        job_ids: this.jobs,
        priority_value: tempJobPriority,
      }
      return JobService.setJobPriority(req)
    },
    successMessageFormatter(res) {
      if (res.action_status === 'success') {
        return this.$t('Job.Priority.Succeeded')
      } else if (res.action_status === 'partial') {
        return this.$t('Job.Batch.Priority.Partial')
      }
    },
    errorMessageFormatter(res) {
      return this.$t('Job.Priority.Failed')
    },
    doOpen(schedulerIds) {
      this.formModel = {
        priority: 'highest',
        priorityValue: '',
      }
      this.jobs = schedulerIds
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    getSchedulerPriorityValue() {
      JobService.getSchedulerPriority().then(
        res => {
          this.priorityMin = res.min
          this.priorityMax = res.max
          this.formRules = {
            priorityValue: [
              ValidRoleFactory.getRequireRoleForText(this.$t('Job.Priority.Custom.label')),
              ValidRoleFactory.getVaildMustInteger(this.$t('Job.Priority.Custom.label')),
              ValidRoleFactory.getNumberRangeRoleForText(
                this.$t('Job.Priority.Custom.label'),
                this.priorityMin,
                this.priorityMax,
              ),
            ],
          }
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    clearCustomValue() {
      this.formModel.priorityValue = ''
    },
  },
}
</script>
