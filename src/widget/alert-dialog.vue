<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    :size="mode == 'edit' ? '500px' : '300px'"
    :form-model="alertForm"
    :form-rules="alertRules"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-item v-if="mode == 'edit'" prop="comment" :label="$t('Alert.Table.title.comment')">
      <a-input v-model="alertForm.comment" type="textarea" :disabled="mode == 'delete'" />
    </a-form-item>
    <div v-if="mode != 'edit'">
      {{ $t('Alert.Action.tips') }}
    </div>
  </composite-form-dialog>
</template>

<script>
import AlertService from '../service/alert'
import CompositeFormDialog from '../component/composite-form-dialog'
import ValidRoleFactory from '../common/valid-role-factory'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    return {
      title: '',
      mode: '',
      alertId: 0,
      actionAll: 'All',
      idList: [],
      statusList: [],
      levelList: [],
      timeRange: [],
      alertForm: {
        comment: '',
      },
      alertRules: {
        comment: [ValidRoleFactory.getLengthRoleForText(this.$t('Alert.Table.title.comment'), 0, 100)],
      },
    }
  },
  methods: {
    submitForm() {
      if (this.mode === 'edit') {
        return AlertService.updateAlertComment(this.alertId, this.alertForm.comment)
      }
      if (this.mode === 'confirm') {
        return AlertService.confirmAlerts(this.idList, this.statusList, this.levelList, this.timeRange)
      }
      if (this.mode === 'fix') {
        return AlertService.fixAlerts(this.idList, this.statusList, this.levelList, this.timeRange)
      }
      if (this.mode === 'delete') {
        return AlertService.deleteAlerts(this.idList, this.statusList, this.levelList, this.timeRange)
      }
    },
    successMessageFormatter(res) {
      if (this.mode === 'edit') {
        return this.$t('Alert.Comment.Edit.Success')
      } else {
        return this.$t('Alert.Action.Success', {
          action: this.$t('Alert.Action.' + this.mode),
        })
      }
    },
    errorMessageFormatter(res) {
      const errMsg = res
      return this.$t(errMsg)
    },
    setAction(action, idList, filter) {
      this.title = this.$t('Alert.Action.' + action)
      if (action.indexOf(this.actionAll) !== -1) {
        idList = []
      }
      this.idList = idList
      this.statusList = filter.status.values
      this.levelList = filter.policyLevel.values
      this.timeRange = filter.createTime.values
    },
    doEdit(alert) {
      this.mode = 'edit'
      this.alertId = alert.id
      this.alertForm = {
        comment: alert.comment,
      }
      this.title = this.$t('Alert.Comment.Edit.Title', { id: alert.id })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doConfirm(action, idList, filter) {
      this.mode = 'confirm'
      this.setAction(action, idList, filter)
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doFix(action, idList, filter) {
      this.mode = 'fix'
      this.setAction(action, idList, filter)
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doDelete(action, idList, filter) {
      this.mode = 'delete'
      this.setAction(action, idList, filter)
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
