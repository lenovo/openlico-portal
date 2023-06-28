<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="530px"
    form-label-width="180px"
    :form-model="formModel"
    :form-rules="formRules"
    :buttons-text="[$t('Action.Connect')]">
    <a-form-model-item prop="hostname" :label="$t('MainTools.Hostname')">
      <a-select v-model="formModel.hostname" :filter-option="filterOption" show-search>
        <a-select-option v-for="node in nodeOptions" :key="node.hostname">
          {{ node.hostname }}
        </a-select-option>
      </a-select>
    </a-form-model-item>

    <a-form-model-item v-if="showTerminalType" prop="terminalType" :label="$t('MainTools.TerminalType')">
      <a-select v-model="formModel.terminalType">
        <a-select-option value="shell">
          {{ $t('MainTools.TerminalType.Shell') }}
        </a-select-option>
        <a-select-option value="console">
          {{ $t('MainTools.TerminalType.Console') }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
  </composite-form-dialog>
</template>
<script>
import CompositeFormDialog from '../../../component/composite-form-dialog.vue'
import ValidRoleFactory from '../../../common/valid-role-factory'
import NodeService from '../../../service/node'

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
      showTerminalType: this.$store.state.auth.role === '300',
      access: this.$store.state.auth.access,
      nodeOptions: [],
    }
  },
  mounted() {},
  methods: {
    initNodeOptions() {
      const nodeType = this.access === 'staff' ? 'login' : ''
      NodeService.getAllNodes(nodeType).then(
        res => {
          this.nodeOptions = res
          if (nodeType && !res.length) {
            NodeService.getAllNodes('head').then(
              res => {
                this.nodeOptions = res
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
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
