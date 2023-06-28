<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="520px"
    :form-model="alertPolicyForm"
    :form-rules="alertPolicyRules"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-model-item :label="$t('Alert.Policy.Name')" prop="name">
      <a-input id="tid_alert-policy-name" v-model="alertPolicyForm.name" :disabled="mode == 'delete'" />
    </a-form-model-item>
    <div v-if="mode != 'delete'">
      <a-form-model-item :label="$t('Alert.Policy.Monitor')" prop="monitor">
        <a-select
          id="tid_alert-policy-monitor"
          v-model="alertPolicyForm.monitor"
          :get-popup-container="trigger => trigger.parentNode"
          @change="monitorChange()">
          <a-select-option v-for="item in AlertTriggerMonitorEnums" :key="item" :value="item">
            {{ $t('Alert.Policy.' + item) }}
          </a-select-option>
        </a-select>
        <p v-if="['GPU', 'GPU_Temperature'].includes(alertPolicyForm.monitor)" style="color: #4798d1">
          {{ $t('Alert.Policy.Mig.Tip', { target: $t('Alert.Policy.' + alertPolicyForm.monitor) }) }}
        </p>
      </a-form-model-item>
      <a-form-model-item
        v-if="showCondition"
        :label="$t('Alert.Policy.Condition')"
        :prop="alertPolicyForm.AlertInputRole.value && mode != 'delete' ? 'value' : ''">
        <a-input-group compact>
          <a-select
            id="tid_alert-policy-condition"
            v-model="alertPolicyForm.condition"
            class="alert-policy-condition-select"
            :get-popup-container="trigger => trigger.parentNode"
            style="width: 20%">
            <a-select-option v-for="item in alertPolicyForm.AlertInputRole.typeOptions" :key="item" :value="item">
              {{ $t('Alert.Policy.' + item) }}
            </a-select-option>
          </a-select>
          <a-input
            v-if="alertPolicyForm.AlertInputRole.value"
            id="tid_alert-policy-condition-value"
            v-model="alertPolicyForm.value"
            style="width: 80%"
            :suffix="alertPolicyForm.AlertInputRole.unit" />
        </a-input-group>
      </a-form-model-item>
      <a-form-model-item :label="$t('Alert.Policy.Duration')" :prop="mode != 'delete' ? 'duration' : ''">
        <a-input
          id="tid_alert-policy-duration"
          v-model="alertPolicyForm.duration"
          :disabled="!alertPolicyForm.AlertInputRole.duration"
          suffix="S" />
      </a-form-model-item>
      <a-form-model-item :label="$t('Alert.Policy.Level')" :prop="mode != 'delete' ? 'level' : ''">
        <a-radio-group v-model="alertPolicyForm.level">
          <a-radio
            v-for="item in AlertLevelList"
            id="tid_alert-policy-level-fatal"
            :key="item"
            class="radio"
            :value="item">
            {{ $t(`Alert.PolicyLevel.${item}`) }}
          </a-radio>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item :label="$t('Alert.Policy.Nogify')">
        <a-select
          id="tid_alert-policy-notify"
          v-model="alertPolicyForm.nogify"
          allow-clear
          :get-popup-container="trigger => trigger.parentNode"
          mode="multiple">
          <a-select-option v-for="item in AlertNotifyList" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item :label="$t('Alert.Policy.Node')">
        <multi-node-selector
          id="tid_alert-policy-node"
          :nodes="alertPolicyForm.node"
          :hostname-max="50"
          @nodes-selected-change="nodeSelectChange" />
      </a-form-model-item>
      <a-form-model-item :label="$t('Alert.Policy.Script')">
        <a-select
          id="tid_alert-policy-script"
          v-model="alertPolicyForm.script"
          :get-popup-container="trigger => trigger.parentNode"
          allow-clear
          :placeholder="$t('Alert.Policy.Hint.Select')">
          <a-select-option v-for="script in AlertScriptList" :key="script" :value="script">
            {{ script }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item :label="$t('Alert.Policy.Status')">
        <a-checkbox id="tid_alert-policy-status" v-model="alertPolicyForm.status">
          {{ $t('Alert.Policy.Notice.Open') }}
        </a-checkbox>
      </a-form-model-item>
    </div>
  </composite-form-dialog>
</template>
<script>
import AlertPolicyService from '../../service/alert-policy'
import AlertScriptService from '../../service/alert-script'
import NotifuGroupService from '../../service/notify-group'
import CompositeFormDialog from '../../component/composite-form-dialog'
import ValidRoleFactory from '../../common/valid-role-factory'
import MultiNodeSelector from '../../widget/multi-node-selector'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
    'multi-node-selector': MultiNodeSelector,
  },
  data() {
    return {
      AlertTriggerMonitorEnums: AlertPolicyService.AlertTriggerMonitorEnums,
      AlertLevelList: AlertPolicyService.AlertPolicyLevelEnums,
      AlertScriptList: [],
      AlertNotifyList: [],
      getAlertPolicyById: AlertPolicyService.getAlertPolicyById,
      title: '',
      mode: '',
      id: 0,
      showCondition: true,
      alertPolicyForm: {
        name: '',
        monitor: 'CPU',
        condition: '',
        value: '50',
        duration: '60',
        level: '',
        nogify: '',
        node: [],
        script: '',
        status: false,
        AlertInputRole: AlertPolicyService.getTriggerInputRole('CPU'),
      },
      alertPolicyRules: {
        name: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Alert.Policy.Name')),
          ValidRoleFactory.getLengthRoleForText(this.$t('Alert.Policy.Name'), 3, 20),
          ValidRoleFactory.getValidIdentityNameRoleForText(this.$t('Alert.Policy.Name')),
        ],
        value: [
          ValidRoleFactory.getValidNumberRoleForText(this.$t('Alert.Policy.Value')),
          ValidRoleFactory.getRequireRoleForText(this.$t('Alert.Policy.Value')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('Alert.Policy.Value'), 0, 100),
          ValidRoleFactory.getNumberDecimalRoleForText(this.$t('Alert.Policy.Value'), 0),
        ],
        duration: [
          ValidRoleFactory.getValidNumberRoleForText(this.$t('Alert.Policy.Duration')),
          ValidRoleFactory.getRequireRoleForText(this.$t('Alert.Policy.Duration')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('Alert.Policy.Duration'), 0, 99999),
          ValidRoleFactory.getNumberDecimalRoleForText(this.$t('Alert.Policy.Value'), 0),
        ],
        level: [ValidRoleFactory.getRequireRoleForText(this.$t('Alert.Policy.Level'))],
      },
    }
  },
  mounted() {
    const $this = this
    AlertScriptService.getAllAlertScripts().then(function (res) {
      $this.AlertScriptList = res
    })
  },
  methods: {
    submitForm() {
      if (this.mode === 'create') {
        return AlertPolicyService.createAlertPolicy(this.alertPolicyForm)
      }
      if (this.mode === 'edit') {
        return AlertPolicyService.updateAlertPolicy(this.id, this.alertPolicyForm)
      }
      if (this.mode === 'delete') {
        return AlertPolicyService.deleteAlertPolicy(this.id)
      }
    },
    successMessageFormatter() {
      if (this.mode === 'create') {
        return this.$t('Alert.Policy.Create.Success', {
          name: this.alertPolicyForm.name,
        })
      }
      if (this.mode === 'edit') {
        return this.$t('Alert.Policy.Edit.Success', {
          name: this.alertPolicyForm.name,
        })
      }
      if (this.mode === 'delete') {
        return this.$t('Alert.Policy.Delete.Success', {
          name: this.alertPolicyForm.name,
        })
      }
    },
    errorMessageFormatter(res) {
      const errMsg = res
      return this.$t(errMsg)
    },
    initNotifyGroup() {
      const nogifyList = []
      NotifuGroupService.getAllNotifyGroups().then(res => {
        res.forEach(item => {
          nogifyList.push({
            name: item.name,
            id: item.id,
          })
        })
      })
      this.AlertNotifyList = nogifyList
    },
    doCreate() {
      this.initNotifyGroup()
      this.mode = 'create'
      this.alertPolicyForm = {
        name: '',
        monitor: 'CPU',
        condition: 'Greater',
        value: 50,
        duration: '60',
        level: '',
        nogify: [],
        node: [],
        script: '',
        status: false,
        AlertInputRole: AlertPolicyService.getTriggerInputRole('CPU'),
      }
      if (
        this.alertPolicyForm.monitor === 'Hardware' ||
        this.alertPolicyForm.monitor === 'Network' ||
        this.alertPolicyForm.monitor === 'HardwareDiff'
      ) {
        this.showCondition = false
      } else {
        this.showCondition = true
      }
      this.title = this.$t('Alert.Policy.Dialog.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEdit(id) {
      this.getAlertPolicyById(id).then(
        res => {
          const alertPolicy = res
          this.initNotifyGroup()
          this.mode = 'edit'
          this.id = alertPolicy.id
          this.alertPolicyForm = {
            name: alertPolicy.name,
            monitor: alertPolicy.trigger.monitor,
            condition: alertPolicy.trigger.type,
            value: alertPolicy.trigger.value,
            duration: alertPolicy.trigger.duration,
            level: alertPolicy.level,
            nogify: alertPolicy.targets,
            node: alertPolicy.node,
            script: alertPolicy.script,
            status: alertPolicy.status,
            AlertInputRole: AlertPolicyService.getTriggerInputRole(alertPolicy.trigger.monitor),
          }
          if (
            this.alertPolicyForm.monitor === 'Hardware' ||
            this.alertPolicyForm.monitor === 'Network' ||
            this.alertPolicyForm.monitor === 'HardwareDiff'
          ) {
            this.showCondition = false
          } else {
            this.showCondition = true
          }
          const maxLength = this.alertPolicyForm.AlertInputRole.unit === '%' ? 100 : 200
          this.alertPolicyRules.value = [
            ValidRoleFactory.getValidNumberRoleForText(this.$t('Alert.Policy.Value')),
            ValidRoleFactory.getRequireRoleForText(this.$t('Alert.Policy.Value')),
            ValidRoleFactory.getNumberRangeRoleForText(this.$t('Alert.Policy.Value'), 0, maxLength),
            ValidRoleFactory.getNumberDecimalRoleForText(this.$t('Alert.Policy.Value'), 0),
          ]
          this.title = this.$t('Alert.Policy.Edit.Title', {
            name: alertPolicy.name,
          })
        },
        res => {
          this.$message.error(res)
        },
      )
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doDelete(id) {
      this.getAlertPolicyById(id).then(
        res => {
          const alertPolicy = res
          this.mode = 'delete'
          this.id = alertPolicy.id
          this.alertPolicyForm = {
            name: alertPolicy.name,
            monitor: alertPolicy.type,
            condition: alertPolicy.trigger.type,
            value: alertPolicy.trigger.value,
            duration: alertPolicy.trigger.duration,
            AlertInputRole: AlertPolicyService.getTriggerInputRole(alertPolicy.type),
          }
          this.title = this.$t('Alert.Policy.Delete.Title', {
            name: alertPolicy.name,
          })
        },
        res => {
          this.$message.error(res)
        },
      )
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    monitorChange() {
      this.alertPolicyForm.AlertInputRole = AlertPolicyService.getTriggerInputRole(this.alertPolicyForm.monitor)
      if (!this.alertPolicyForm.AlertInputRole.typeOptions.includes(this.alertPolicyForm.condition)) {
        this.alertPolicyForm.condition = this.alertPolicyForm.AlertInputRole.typeOptions[0]
      }
      if (this.alertPolicyForm.monitor === 'HardwareDiff') {
        this.alertPolicyForm.duration = '300'
      }
      if (
        this.alertPolicyForm.monitor === 'Hardware' ||
        this.alertPolicyForm.monitor === 'Network' ||
        this.alertPolicyForm.monitor === 'HardwareDiff'
      ) {
        this.showCondition = false
      } else {
        this.showCondition = true
      }
      const maxLength = this.alertPolicyForm.AlertInputRole.unit === '%' ? 100 : 200
      this.alertPolicyRules.value = [
        ValidRoleFactory.getValidNumberRoleForText(this.$t('Alert.Policy.Value')),
        ValidRoleFactory.getRequireRoleForText(this.$t('Alert.Policy.Value')),
        ValidRoleFactory.getNumberRangeRoleForText(this.$t('Alert.Policy.Value'), 0, maxLength),
        ValidRoleFactory.getNumberDecimalRoleForText(this.$t('Alert.Policy.Value'), 0),
      ]
    },
    nodeSelectChange(val) {
      this.alertPolicyForm.node = val
    },
  },
}
</script>
<style>
.alert-policy-condition-select .ant-select-selection-selected-value {
  position: relative;
  left: 30%;
}
</style>
