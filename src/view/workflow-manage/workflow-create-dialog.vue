<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    :form-model="workflowForm"
    :form-rules="workflowRules"
    form-label-width="160px"
    :composite-height="400"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-model-item :label="$t('Workflow.Name')" prop="name">
      <a-input v-model="workflowForm.name" />
    </a-form-model-item>
    <a-form-model-item prop="maxSubmitJobs">
      <span slot="label">
        {{ $t('Workflow.MaxSubmitJobs') }}
        <a-tooltip
          :title="$t('Workflow.MaxSubmitJobs.Help')"
          placement="topLeft"
          :get-popup-container="n => n.ownerDocument.body">
          <a-icon type="question-circle-o" />
        </a-tooltip>
      </span>
      <a-input v-model.number="workflowForm.maxSubmitJobs" />
    </a-form-model-item>
    <a-form-model-item :label="$t('Workflow.Description')" prop="description">
      <a-textarea v-model="workflowForm.description" :auto-size="{ minRows: 2 }" />
    </a-form-model-item>

    <a-checkbox v-model="recurrence.isOn">
      <a @click.prevent="recurrence.isOn = !recurrence.isOn">
        <!-- <a-icon :type="recurrence.isOn ? 'up-circle' : 'down-circle'" /> -->
        <span style="margin-left: 4px">{{ $t('Workflow.Recurrence.Appointment') }}</span>
      </a>
    </a-checkbox>

    <div v-show="recurrence.isOn" style="margin-top: 20px">
      <a-form-model-item v-show="recurrence.isOn" :label="$t('Workflow.Recurrence.Frequency')">
        <a-select v-model="recurrence.mode" default-value="Once">
          <a-select-option v-for="m in recurrence.modes" :key="m" :value="m">
            {{ $t(`Workflow.Recurrence.${m}`) }}
          </a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item
        :label="$t('Workflow.Recurrence.TriggerTime')"
        prop="recurrence"
        style="margin-top: 16px; margin-bottom: 0">
        <template v-if="recurrence.mode === 'Once'">
          <datetime-selector v-model="recurrence.timestamp" />
          <template v-if="recurrence.timestamp && expirationOnce">
            {{
              $t('Workflow.Recurrence.Once.Msg', {
                time: moment
                  .tz(recurrence.timestamp, Intl.DateTimeFormat().resolvedOptions().timeZone)
                  .format('YYYY-MM-DD HH:mm z'),
              })
            }}
          </template>
        </template>

        <template v-if="['Daily', 'Weekly', 'Monthly'].includes(recurrence.mode)">
          <a-time-picker v-model="recurrence.timestamp" format="HH:mm" style="width: 100%; margin-bottom: 8px" />
        </template>

        <template v-if="recurrence.mode == 'Daily' && recurrence.timestamp">
          {{
            $t('Workflow.Recurrence.Daily.Msg', { time: recurrence.timestamp.format('HH:mm'), tz: recurrence.timezone })
          }}
        </template>

        <template v-if="recurrence.mode === 'Weekly'">
          <a-select
            v-model="recurrence.dow"
            mode="multiple"
            :placeholder="$t('Workflow.Recurrence.Weekly.Placeholder')">
            <a-select-option v-for="(day, i) in daysOfWeekMondayFirst" :key="i">
              {{ day }}
            </a-select-option>
          </a-select>
          <template v-if="recurrence.dow.length != 0 && recurrence.timestamp">
            {{
              $t('Workflow.Recurrence.Weekly.Msg', {
                week: recurrence.dow.map(d => daysOfWeekMondayFirst[d]).join(', '),
                time: recurrence.timestamp.format('HH:mm'),
                tz: recurrence.timezone,
              })
            }}
          </template>
        </template>

        <template v-if="recurrence.mode === 'Monthly'">
          <a-select
            v-model="recurrence.dom"
            mode="multiple"
            :placeholder="$t('Workflow.Recurrence.Monthly.Placeholder')">
            <a-select-option v-for="(day, i) in daysOfMonth" :key="i">
              {{ day.format('D') }}
            </a-select-option>
          </a-select>
          <template v-if="recurrence.dom.length != 0 && recurrence.timestamp">
            {{
              $t('Workflow.Recurrence.Monthly.Msg', {
                month: recurrence.dom.map(d => daysOfMonth[d].format('Do')).join(', '),
                time: recurrence.timestamp.format('HH:mm'),
                tz: recurrence.timezone,
              })
            }}
          </template>
        </template>
      </a-form-model-item>
      <span v-show="recurrence.errorMessage !== ''" style="color: red" v-text="recurrence.errorMessage" />
    </div>
  </composite-form-dialog>
</template>

<script>
import moment from 'moment'

import CompositeFormDialog from '../../component/composite-form-dialog'
import DatetimeSelector from '../../component/datetime-selector'
import ValidRoleFactory from '../../common/valid-role-factory'
import WrokflowService from '../../service/workflow'
import Utils from '../../common/utils'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
    'datetime-selector': DatetimeSelector,
  },
  data() {
    return {
      moment,
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
    }
  },
  computed: {
    daysOfWeekMondayFirst() {
      return Utils.getDaysOfWeekMondayFirst().map(i => this.$t(i))
    },
    daysOfWeek() {
      return Utils.getDaysOfWeek()
    },
    daysOfMonth() {
      return Utils.getDaysOfMonth()
    },
    expirationOnce() {
      if (this.recurrence.timestamp) {
        return moment(this.recurrence.timestamp) > moment()
      }
      return true
    },
  },
  watch: {
    'recurrence.isOn'() {
      this.validateRecurrenceFields()
    },
    'recurrence.timestamp'(value) {
      // datetime-selector sends bare date instances - convert to moment instance
      if (value && value.getDay) {
        this.recurrence.timestamp = moment(value)
      }
      this.validateRecurrenceFields()
    },
    'recurrence.mode'() {
      this.validateRecurrenceFields()
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
      this.recurrence.timezone = moment.tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('z')
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
        return this.$t('Workflow.Create.Success', {
          name: workflow.name,
        })
      }
      if (this.mode === 'edit') {
        return this.$t('Workflow.Update.Success', {
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
        timezone: moment.tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('z'),
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
          this.recurrence.timestamp = moment(workflow.periodic_task.clocked)
        } else {
          const crontab = workflow.periodic_task.crontab

          const time = crontab.hour + ':' + crontab.minute
          this.recurrence.timestamp = moment.tz(time, 'HH:mm', crontab.timezone).toDate()
          this.recurrence.timezone = moment.tz(time, 'HH:mm', crontab.timezone).format('z')

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

<style></style>
