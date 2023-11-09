<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    :form-model="workflowForm"
    :form-rules="workflowRules"
    form-label-width="160px"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-item :label="$t('Workflow.Name')" name="name">
      <a-input v-model:value="workflowForm.name" />
    </a-form-item>
    <a-form-item name="maxSubmitJobs">
      <template #label>
        <span>
          {{ $t('Workflow.MaxSubmitJobs') }}
          <a-tooltip
            :title="$t('Workflow.MaxSubmitJobs.Help')"
            placement="topLeft"
            :get-popup-container="n => n.ownerDocument.body">
            <question-circle-outlined />
          </a-tooltip>
        </span>
      </template>
      <a-input v-model:value="workflowForm.maxSubmitJobs" />
    </a-form-item>
    <a-form-item :label="$t('Workflow.Description')" name="description">
      <a-textarea v-model:value="workflowForm.description" :auto-size="{ minRows: 2 }" />
    </a-form-item>

    <a-checkbox v-model:checked="recurrence.isOn">
      <a @click.prevent="recurrence.isOn = !recurrence.isOn">
        <UpCircleOutlined v-if="recurrence.isOn" />
        <DownCircleOutlined v-else />
        <span style="margin-left: 4px">{{ $t('Workflow.Recurrence.Appointment') }}</span>
      </a>
    </a-checkbox>

    <div v-if="recurrence.isOn" style="margin-top: 20px">
      <a-form-item v-show="recurrence.isOn" :label="$t('Workflow.Recurrence.Frequency')">
        <a-select v-model:value="recurrence.mode" default-value="Once">
          <a-select-option v-for="m in recurrence.modes" :key="m" :value="m">
            {{ $t(`Workflow.Recurrence.${m}`) }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
        :label="$t('Workflow.Recurrence.TriggerTime')"
        name="recurrence"
        class="workflow-create-recurrence"
        style="">
        <template v-if="recurrence.mode === 'Once'">
          <datetime-selector v-model:value="recurrence.timestamp" />
          <template v-if="recurrence.timestamp && expirationOnce">
            {{
              $T('Workflow.Recurrence.Once.Msg', {
                time:
                  dayjs(recurrence.timestamp).tz(localTimezone).format('YYYY-MM-DD HH:mm') +
                  ' ' +
                  getTimezoneShortByLang(localTimezone),
              })
            }}
          </template>
        </template>

        <template v-if="['Daily', 'Weekly', 'Monthly'].includes(recurrence.mode)">
          <a-time-picker v-model:value="recurrence.timestamp" format="HH:mm" style="width: 100%; margin-bottom: 8px" />
        </template>

        <template v-if="recurrence.mode == 'Daily' && recurrence.timestamp">
          {{
            $T('Workflow.Recurrence.Daily.Msg', { time: recurrence.timestamp.format('HH:mm'), tz: recurrence.timezone })
          }}
        </template>

        <a-form-item
          v-if="recurrence.mode === 'Weekly' || recurrence.mode === 'Monthly'"
          class="workflow-create-recurrence-item">
          <template v-if="recurrence.mode === 'Weekly'">
            <a-select
              v-model:value="recurrence.dow"
              mode="multiple"
              :placeholder="$t('Workflow.Recurrence.Weekly.Placeholder')">
              <a-select-option v-for="(day, i) in daysOfWeekMondayFirst" :key="i">
                {{ day }}
              </a-select-option>
            </a-select>
            <template v-if="recurrence.dow.length != 0 && recurrence.timestamp">
              {{
                $T('Workflow.Recurrence.Weekly.Msg', {
                  week: recurrence.dow.map(d => daysOfWeekMondayFirst[d]).join(', '),
                  time: recurrence.timestamp.format('HH:mm'),
                  tz: recurrence.timezone,
                })
              }}
            </template>
          </template>

          <template v-if="recurrence.mode === 'Monthly'">
            <a-select
              v-model:value="recurrence.dom"
              mode="multiple"
              :placeholder="$t('Workflow.Recurrence.Monthly.Placeholder')">
              <a-select-option v-for="(day, i) in daysOfMonth" :key="i">
                {{ day.format('D') }}
              </a-select-option>
            </a-select>
            <template v-if="recurrence.dom.length != 0 && recurrence.timestamp">
              {{
                $T('Workflow.Recurrence.Monthly.Msg', {
                  month: recurrence.dom.map(d => daysOfMonth[d].format('Do')).join(', '),
                  time: recurrence.timestamp.format('HH:mm'),
                  tz: recurrence.timezone,
                })
              }}
            </template>
          </template>
        </a-form-item>
      </a-form-item>
      <span v-show="recurrence.errorMessage !== ''" style="color: red" v-text="recurrence.errorMessage" />
    </div>
  </composite-form-dialog>
</template>

<script>
import dayjs from '@/dayjs/'
import Utils from '@/common/utils'
import WrokflowService from '@/service/workflow'
import ValidRoleFactory from '@/common/valid-role-factory'
import DatetimeSelector from '@/component/datetime-selector.vue'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
    'datetime-selector': DatetimeSelector,
  },
  data() {
    return {
      dayjs,
      mode: '',
      title: '',
      workflowForm: {
        name: '',
        maxSubmitJobs: 3,
        description: '',
        recurrence: null,
      },
      //
      recurrence: {
        isOn: false,
        modes: ['Once', 'Daily', 'Weekly', 'Monthly'],
        mode: 'Once',
        // 'Once' is clocked schedule rest is crontab schedule

        timestamp: null,
        timezone: null,
        dow: [], // chosen day(s) of week  - 0 index based
        dom: [], // chosen day(s) of month - 0 index based

        errorMessage: '',
      },
      workflowRules: {
        name: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Workflow.Name')),
          ValidRoleFactory.getLengthRoleForText(this.$t('Workflow.Name'), 3, 32),
          ValidRoleFactory.getValidIdentityNameRoleIncludeChineseText(this.$t('Workflow.Name')),
        ],
        maxSubmitJobs: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Workflow.MaxSubmitJobs')),
          ValidRoleFactory.getValidNaturalNumber(this.$t('Workflow.MaxSubmitJobs')),
          ValidRoleFactory.getRangeRoleForNumber(this.$t('Workflow.MaxSubmitJobs'), 1, 99999),
        ],
      },
      copyData: {},
      getTimezoneShortByLang: Utils.getTimezoneShortByLang,
      localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  },
  computed: {
    daysOfWeekMondayFirst() {
      return Utils.getDaysOfWeekMondayFirst().map(i => this.$t(i))
    },
    daysOfMonth() {
      return Utils.getDaysOfMonth()
    },
    expirationOnce() {
      if (this.recurrence.timestamp) {
        return dayjs(this.recurrence.timestamp) > dayjs()
      }
      return true
    },
  },
  watch: {
    'recurrence.isOn'() {
      this.validateRecurrenceFields()
    },
    'recurrence.timestamp'(value) {
      // datetime-selector sends bare date instances - convert to dayjs instance
      if (value && value.getDay) {
        this.recurrence.timestamp = dayjs(value)
      }
      this.validateRecurrenceFields()
    },
    'recurrence.mode'() {
      this.validateRecurrenceFields()
      this.recurrence.timezone = this.recurrence.timezone || this.getTimezoneShortByLang(this.localTimezone)
    },
    'recurrence.dow'() {
      this.validateRecurrenceFields()
    },
    'recurrence.dom'() {
      this.validateRecurrenceFields()
    },
  },
  methods: {
    submitForm() {
      if (this.mode === 'create') {
        if (this.recurrence.isOn) {
          const valid = this.validateRecurrenceFields()
          if (valid) {
            this.workflowForm.recurrence = this.getRecurrenceFields()
          }
        }
        return WrokflowService.createWorkflow(this.workflowForm)
      }
      if (this.mode === 'edit') {
        if (this.recurrence.isOn) {
          const valid = this.validateRecurrenceFields()
          if (valid) {
            this.workflowForm.recurrence = this.getRecurrenceFields()
          }
        }
        return WrokflowService.updateWorkflow(this.workflowForm)
      }
      if (this.mode === 'copy') {
        this.copyData.name = this.workflowForm.name
        this.copyData.maxSubmitJobs = this.workflowForm.maxSubmitJobs
        this.copyData.description = this.workflowForm.description
        this.copyData.recurrence = null

        if (this.recurrence.isOn) {
          const valid = this.validateRecurrenceFields()
          if (valid) {
            this.copyData.recurrence = this.getRecurrenceFields()
          }
        }
        return WrokflowService.copyWorkflow(this.copyData)
      }
    },
    validateRecurrenceFields() {
      const messages = {
        selectTriggerTime: this.$t('Workflow.Recurrence.Msg.Trigger'),
        selectValidTime: this.$t('Workflow.Recurrence.Msg.Valid'),
        selectDayOfWeek: this.$t('Workflow.Recurrence.Msg.Week'),
        selectDayOfMonth: this.$t('Workflow.Recurrence.Msg.Month'),
      }

      const mode = this.recurrence.mode
      const ts = this.recurrence.timestamp
      this.recurrence.errorMessage = ''
      this.$refs.innerDialog.enableSubmit()
      const valid = true

      if (!this.recurrence.isOn) {
        return valid
      }

      if (ts === null) {
        this.recurrence.errorMessage = messages.selectTriggerTime
        this.$refs.innerDialog.disableSubmit()
        return false
      }
      if (mode === 'Once' && ts.isBefore()) {
        this.recurrence.errorMessage = messages.selectValidTime
        this.$refs.innerDialog.disableSubmit()
        return false
      }
      if (mode === 'Weekly' && this.recurrence.dow.length === 0) {
        this.recurrence.errorMessage = messages.selectDayOfWeek
        this.$refs.innerDialog.disableSubmit()
        return false
      }
      if (mode === 'Monthly' && this.recurrence.dom.length === 0) {
        this.recurrence.errorMessage = messages.selectDayOfMonth
        this.$refs.innerDialog.disableSubmit()
        return false
      }
      return valid
    },
    getRecurrenceFields() {
      const mode = this.recurrence.mode
      const ts = this.recurrence.timestamp // in local timezone

      if (mode === 'Once') {
        return { clocked: ts.format() }
      }

      const mm = ts.format('mm')
      const hh = ts.format('HH')

      // crontab format: 'm h  dom mon dow'
      if (mode === 'Daily') {
        return { crontab: `${mm} ${hh} * * *` }
      }

      if (mode === 'Weekly') {
        // weeks in crontab are 0 index based and start with Sunday
        // we have 0 index based that start with Monday in our form
        // turn sunday on 0 position and increase rest of days, sort and join
        const dow = this.recurrence.dow
          .map(i => (i === 6 ? 0 : i + 1))
          .sort((a, b) => a - b)
          .join(',')

        return { crontab: `${mm} ${hh} * * ${dow}` }
      }

      if (mode === 'Monthly') {
        // months in crontab are not 0 index based
        const dom = this.recurrence.dom
          .map(i => Number(i) + 1)
          .sort((a, b) => a - b)
          .join(',')

        return { crontab: `${mm} ${hh} ${dom} * *` }
      }
    },
    successMessageFormatter(res) {
      const workflow = res
      if (this.mode === 'create' || this.mode === 'copy') {
        return this.$T('Workflow.Create.Success', {
          name: workflow.name,
        })
      }
      if (this.mode === 'edit') {
        return this.$T('Workflow.Update.Success', {
          name: workflow.name,
        })
      }
    },
    errorMessageFormatter(res) {
      const errMsg = res
      return this.$t(errMsg)
    },
    doCreate() {
      this.mode = 'create'
      this.workflowForm = {
        name: '',
        maxSubmitJobs: 3,
        description: '',
        recurrence: null,
      }
      this.recurrence = {
        isOn: false,
        modes: ['Once', 'Daily', 'Weekly', 'Monthly'],
        mode: 'Once',
        timestamp: null,
        timezone: this.getTimezoneShortByLang(this.localTimezone),
        dow: [], // chosen day(s) of week  - 0 index based
        dom: [], // chosen day(s) of month - 0 index based
        errorMessage: '',
      }
      this.title = this.$t('Workflow.Create.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEdit(workflow) {
      this.mode = 'edit'
      this.workflowForm = {
        id: workflow.id,
        name: workflow.name,
        maxSubmitJobs: workflow.maxSubmitJobs,
        description: workflow.description,
        recurrence: null,
      }
      this.setRecurrenceFor(workflow)
      this.title = this.$t('Workflow.Edit.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doCopy(workflow) {
      this.mode = 'copy'
      this.workflowForm = {
        name: '',
        maxSubmitJobs: workflow.maxSubmitJobs,
        description: workflow.description,
        recurrence: null,
      }
      this.setRecurrenceFor(workflow)
      this.title = this.$t('Workflow.Copy.Title')
      this.copyData.id = workflow.id
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    setRecurrenceFor(workflow) {
      if (workflow.periodic_task) {
        this.recurrence.isOn = true

        if (workflow.periodic_task.clocked) {
          this.recurrence.mode = 'Once'
          this.recurrence.timestamp = dayjs(workflow.periodic_task.clocked)
        } else {
          const crontab = workflow.periodic_task.crontab

          const time = crontab.hour + ':' + crontab.minute
          this.recurrence.timestamp = dayjs(time, 'HH:mm').tz(crontab.timezone).toDate()
          this.recurrence.timezone = this.getTimezoneShortByLang(crontab.timezone)
          console.log(this.recurrence)
          if (crontab.day_of_month !== '*') {
            this.recurrence.mode = 'Monthly'
            this.recurrence.dom = crontab.day_of_month.split(',').map(i => Number(i - 1))
          } else if (crontab.day_of_week !== '*') {
            this.recurrence.mode = 'Weekly'
            this.recurrence.dow = crontab.day_of_week
              .split(',')
              .map(i => (parseInt(i) === 0 ? 6 : parseInt(i) - 1))
              .sort((a, b) => a - b)
          } else {
            this.recurrence.mode = 'Daily'
          }
        }
      } else {
        this.recurrence.isOn = false
      }
    },
  },
}
</script>

<style scoped>
.workflow-create-recurrence {
  margin-top: 16px;
  margin-bottom: 0;
}
.workflow-create-recurrence-item {
  margin: 0;
}
</style>
