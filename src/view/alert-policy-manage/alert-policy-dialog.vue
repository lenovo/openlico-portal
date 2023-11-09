<template>
  <composite-form-dialog
    ref="innerDialog"
    size="520px"
    :title="title"
    :form-model="alertPolicyForm"
    :form-rules="alertPolicyRules"
    :success-message-formatter="successMessageFormatter">
    <a-form-item :label="$t('Alert.Policy.Name')" name="name">
      <a-input id="tid_alert-policy-name" v-model:value="alertPolicyForm.name" :disabled="mode == 'delete'" />
    </a-form-item>
    <div v-if="mode != 'delete'">
      <a-form-item :label="$t('Alert.Policy.Monitor')" name="monitor">
        <a-select
          id="tid_alert-policy-monitor"
          v-model:value="alertPolicyForm.monitor"
          :get-popup-container="trigger => trigger.parentNode"
          @change="monitorChange()">
          <a-select-option v-for="item in AlertTriggerMonitorEnums" :key="item" :value="item">
            {{ $t('Alert.Policy.' + item) }}
          </a-select-option>
        </a-select>
        <p v-if="['GPU', 'GPU_Temperature'].includes(alertPolicyForm.monitor)" style="color: #4798d1">
          {{ $T('Alert.Policy.Mig.Tip', { target: $t('Alert.Policy.' + alertPolicyForm.monitor) }) }}
        </p>
      </a-form-item>
      <a-form-item
        v-if="showCondition"
        :label="$t('Alert.Policy.Condition')"
        :name="alertPolicyForm.AlertInputRole.value && mode != 'delete' ? 'value' : ''">
        <a-input-group compact>
          <a-form-item-rest>
            <a-select
              id="tid_alert-policy-condition"
              v-model:value="alertPolicyForm.condition"
              class="alert-policy-condition-select"
              :get-popup-container="trigger => trigger.parentNode"
              style="width: 20%">
              <a-select-option v-for="item in alertPolicyForm.AlertInputRole.typeOptions" :key="item" :value="item">
                {{ $t('Alert.Policy.' + item) }}
              </a-select-option>
            </a-select>
          </a-form-item-rest>

          <a-input
            v-if="alertPolicyForm.AlertInputRole.value"
            id="tid_alert-policy-condition-value"
            v-model:value="alertPolicyForm.value"
            style="width: 80%"
            :suffix="alertPolicyForm.AlertInputRole.unit" />
        </a-input-group>
      </a-form-item>
      <a-form-item :label="$t('Alert.Policy.Duration')" :name="mode != 'delete' ? 'duration' : ''">
        <a-input
          id="tid_alert-policy-duration"
          v-model:value="alertPolicyForm.duration"
          :disabled="!alertPolicyForm.AlertInputRole.duration"
          suffix="S" />
      </a-form-item>
      <a-form-item :label="$t('Alert.Policy.Level')" :name="mode != 'delete' ? 'level' : ''">
        <a-radio-group v-model:value="alertPolicyForm.level">
          <a-radio
            v-for="item in AlertLevelList"
            id="tid_alert-policy-level-fatal"
            :key="item"
            class="radio"
            :value="item">
            {{ $t(`Alert.PolicyLevel.${item}`) }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="$t('Alert.Policy.Nogify')">
        <a-select id="tid_alert-policy-notify" v-model:value="alertPolicyForm.nogify" allow-clear mode="multiple">
          <a-select-option v-for="item in AlertNotifyList" :key="item.id" :value="item.id" :label="item.name">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('Alert.Policy.Node')">
        <multi-node-selector
          id="tid_alert-policy-node"
          :nodes="alertPolicyForm.node"
          :hostname-max="50"
          @nodes-selected-change="nodeSelectChange" />
      </a-form-item>
      <a-form-item :label="$t('Alert.Policy.Script')">
        <a-select
          id="tid_alert-policy-script"
          v-model:value="alertPolicyForm.script"
          :get-popup-container="trigger => trigger.parentNode"
          allow-clear
          :placeholder="$t('Alert.Policy.Hint.Select')">
          <a-select-option v-for="script in AlertScriptList" :key="script" :value="script">
            {{ script }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <!-- <a-form-item :label="$t('Alert.Policy.Notice')">
        <a-checkbox id="tid_alert-policy-notice-wechat" v-model:checked="alertPolicyForm.wechat">
          {{ $t('Alert.Policy.Notice.Wechat') }}
        </a-checkbox>
      </a-form-item> -->
      <a-form-item :label="$t('Alert.Policy.Status')">
        <a-checkbox id="tid_alert-policy-status" v-model:checked="alertPolicyForm.status">
          {{ $t('Alert.Policy.Notice.Open') }}
        </a-checkbox>
      </a-form-item>
    </div>
  </composite-form-dialog>
</template>
<script>
import AlertPolicyService from '@/service/alert-policy'
import AlertScriptService from '@/service/alert-script'
import NotifuGroupService from '@/service/notify-group'
import ValidRoleFactory from '@/common/valid-role-factory'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import MultiNodeSelector from '@/widget/multi-node-selector.vue'

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
        email: '',
        sms: '',
        script: '',
        wechat: false,
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
        return this.$T('Alert.Policy.Create.Success', {
          name: this.alertPolicyForm.name,
        })
      }
      if (this.mode === 'edit') {
        return this.$T('Alert.Policy.Edit.Success', {
          name: this.alertPolicyForm.name,
        })
      }
      if (this.mode === 'delete') {
        return this.$T('Alert.Policy.Delete.Success', {
          name: this.alertPolicyForm.name,
        })
      }
    },
    initNotifyGroup() {
      NotifuGroupService.getAllNotifyGroups().then(res => {
        this.AlertNotifyList = res.map(i => ({
          name: i.name,
          id: i.id,
        }))
      })
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
        email: '',
        sms: '',
        script: '',
        wechat: false,
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
            email: alertPolicy.email,
            sms: alertPolicy.sms,
            script: alertPolicy.script,
            wechat: alertPolicy.wechat,
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
          this.title = this.$T('Alert.Policy.Edit.Title', {
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
          this.title = this.$T('Alert.Policy.Delete.Title', {
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
