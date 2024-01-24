<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="530px"
    form-label-width="180px"
    :z-index="3000"
    :form-model="formModel"
    :form-rules="formRules"
    :buttons-text="[$t('Action.Connect')]">
    <a-form-item name="hostname" :label="$t('MainTools.Hostname')">
      <a-select v-model:value="formModel.hostname" :filter-option="filterOption" show-search>
        <a-select-option v-for="node in nodeOptions" :key="node.id" :value="node.hostname">
          {{ node.hostname }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item v-if="showTerminalType" name="terminalType" :label="$t('MainTools.TerminalType')">
      <a-select v-model:value="formModel.terminalType">
        <a-select-option value="shell">
          {{ $t('MainTools.TerminalType.Shell') }}
        </a-select-option>
        <a-select-option value="console">
          {{ $t('MainTools.TerminalType.Console') }}
        </a-select-option>
      </a-select>
    </a-form-item>
  </composite-form-dialog>
</template>
<script>
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import ValidRoleFactory from '@/common/valid-role-factory'
import NodeService from '@/service/node'

export default {
  components: {
    CompositeFormDialog,
  },
  data() {
    return {
      title: '',
      formModel: {
        hostname: '',
        terminalType: 'shell',
      },
      formRules: {
        hostname: [ValidRoleFactory.getRequireRoleForText(this.$t('MainTools.Hostname'))],
      },
      access: this.$store.state.auth.access,
      nodeOptions: [],
    }
  },
  computed: {
    showTerminalType() {
      return this.$store.state.auth.access !== 'staff'
    },
  },
  mounted() {},
  methods: {
    initNodeOptions() {
      const nodeType = this.access === 'staff' ? 'login' : ''
      NodeService.getAllNodes(nodeType).then(
        res => {
          this.nodeOptions = res.filter(node => !node.disabled)
          if (nodeType && !res.length) {
            NodeService.getAllNodes('head').then(
              res => {
                this.nodeOptions = res.filter(node => !node.disabled)
              },
              err => {
                this.$message.error(err)
              },
            )
          }
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    filterOption(input, option) {
      return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
    onConnect() {
      this.initNodeOptions()
      this.title = this.$t('Action.Connect')
      this.formModel = {
        hostname: '',
        terminalType: 'shell',
      }
      return new Promise((resolve, reject) => {
        this.$refs.innerDialog.emptyPopup().then(
          () => {
            resolve(this.formModel)
          },
          () => {
            reject(new Error('Error'))
          },
        )
      })
    },
  },
}
</script>
