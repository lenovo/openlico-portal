<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="500px"
    :form-model="actionForm"
    :success-message-formatter="successMessageFormatter">
    <div>{{ getConfirmMessage() }}</div>
  </composite-form-dialog>
</template>

<script>
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import NodeService from '@/service/node'

export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
  },
  data() {
    return {
      mode: 'on',
      title: '',
      nodeId: '',
      actionForm: {
        hostname: '',
      },
      nextDevice: null,
    }
  },
  methods: {
    submitForm() {
      let nodePromiseArr
      if (this.mode === 'on') {
        if (this.nodeId instanceof Array) {
          nodePromiseArr = []
          this.nodeId.forEach(id => {
            nodePromiseArr.push(NodeService.powerOnNode(id, this.nextDevice))
          })
          return Promise.all(nodePromiseArr)
        } else {
          return NodeService.powerOnNode(this.nodeId, this.nextDevice)
        }
      }
      if (this.mode === 'off') {
        if (this.nodeId instanceof Array) {
          nodePromiseArr = []
          this.nodeId.forEach(id => {
            nodePromiseArr.push(NodeService.powerOffNode(id, this.nextDevice))
          })
          return Promise.all(nodePromiseArr)
        } else {
          return NodeService.powerOffNode(this.nodeId)
        }
      }
    },
    getConfirmMessage() {
      if (this.mode === 'on') {
        if (this.nextDevice === 'setup') {
          return this.$T('Node.Action.PowerOn.Setup.Confirm', {
            name: this.actionForm.hostname,
          })
        } else if (this.nextDevice === 'network') {
          return this.$T('Node.Action.PowerOn.Network.Confirm', {
            name: this.actionForm.hostname,
          })
        } else if (this.nextDevice === 'cd') {
          return this.$T('Node.Action.PowerOn.CD.Confirm', {
            name: this.actionForm.hostname,
          })
        } else {
          return this.$T('Node.Action.PowerOn.Confirm', {
            name: this.actionForm.hostname,
          })
        }
      } else {
        return this.$T('Node.Action.PowerOff.Confirm', {
          name: this.actionForm.hostname,
        })
      }
    },
    successMessageFormatter(res) {
      if (this.mode === 'on') {
        return this.$T('Node.Action.PowerOn.Success', {
          name: this.actionForm.hostname,
        })
      }
      if (this.mode === 'off') {
        return this.$T('Node.Action.PowerOff.Success', {
          name: this.actionForm.hostname,
        })
      }
    },
    doPowerOn(node, nextDevice) {
      this.mode = 'on'
      this.nodeId = node.hostname
      this.nextDevice = nextDevice
      this.actionForm = {
        hostname: node.hostname,
      }
      this.title = this.$T('Node.Action.PowerOn.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doMultiPowerOn(nodes, nodeList, nextDevice) {
      const nodeName = []
      nodes.forEach(function (item, index) {
        nodeName.push(item.hostname)
      })
      this.mode = 'on'
      this.nodeId = nodeList
      this.nextDevice = nextDevice
      this.actionForm = {
        hostname: nodeName.toString(),
      }
      this.title = this.$T('Node.Action.PowerOn.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doPowerOff(node) {
      this.mode = 'off'
      this.nodeId = node.hostname
      this.actionForm = {
        hostname: node.hostname,
      }
      this.title = this.$T('Node.Action.PowerOff.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doMultiPowerOff(nodes, nodeList) {
      const nodeName = []
      nodes.forEach(function (item, index) {
        nodeName.push(item.hostname)
      })
      this.mode = 'off'
      this.nodeId = nodeList
      this.actionForm = {
        hostname: nodeName.toString(),
      }
      this.title = this.$T('Node.Action.PowerOff.Title')
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>
