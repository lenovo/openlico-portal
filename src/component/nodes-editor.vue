<template>
  <div>
    <a-form-model-item :label="$t('Scheduler.Nodes')" :prop="modelItemProp">
      <a-textarea v-model="textarea" :disabled="disabled" />

      <a @click.prevent="modal.add = true">
        <a-icon type="plus" />
        {{ $t('Action.Add') }}
      </a>
      <a style="margin-left: 8px; color: gray" @click.prevent="modal.clear = true">
        <a-icon type="close" />
        {{ $t('Action.Clear') }}
      </a>
    </a-form-model-item>

    <a-modal
      v-model="modal.add"
      :confirm-loading="loading"
      :title="$t('NodeEditor.Title')"
      centered
      @ok="add"
      @cancel="reset">
      <div class="" v-text="$t('NodeEditor.FilterType')" />
      <a-select v-model="select" default-value="group" style="width: 100%">
        <a-select-option v-for="filter in filters" :key="filter.key" :value="filter.key">
          {{ filter.label }}
        </a-select-option>
      </a-select>

      <div v-if="select === 'group'" key="group">
        <div class="mt-4" v-text="$t('NodeEditor.Group')" />
        <a-select v-model="selected.group" mode="multiple" style="width: 100%">
          <a-select-option v-for="group in groups" :key="group.id" :value="group.name">
            {{ group.name }}
          </a-select-option>
        </a-select>
      </div>
      <div v-if="select === 'rack'" key="rack">
        <div class="mt-4" v-text="$t('NodeEditor.Rack')" />
        <a-tree-select v-model="selected.rack" :tree-data="treeData" style="width: 100%" tree-checkable />
      </div>
      <div v-if="select === 'hardware' && hardware != null" key="hardware">
        <a-divider />
        <a-row>
          <a-col span="12">
            {{ $t('NodeEditor.CPU') }}
          </a-col>
          <a-col span="12" class="text-right"> {{ selected.hardware.cpu }} {{ $t('NodeEditor.Cores') }} </a-col>
        </a-row>
        <a-row>
          <a-col span="24">
            <a-slider
              v-model="selected.hardware.cpu"
              :min="hardware.cpu.min"
              :max="hardware.cpu.max"
              range
              class="flex-grow-1" />
          </a-col>
        </a-row>

        <a-row>
          <a-col span="12">
            {{ $t('NodeEditor.Memory') }}
          </a-col>
          <a-col span="12" class="text-right"> {{ selected.hardware.mem }} GB </a-col>
        </a-row>
        <a-row>
          <a-col span="24">
            <!-- slider values are in GB -->
            <a-slider
              v-model="selected.hardware.mem"
              :min="kbToGb(hardware.mem.min)"
              :max="getSliderMax(kbToGb(hardware.mem.max, 'ceil'), kbToGb(hardware.mem.min))"
              :step="8"
              range
              class="flex-grow-1" />
            <!-- <a-slider
              v-model="selected.hardware.mem"
              :min="Math.floor(kbToGb(hardware.mem.min))"
              :max="Math.ceil(kbToGb(hardware.mem.max) / 8) * 8 + Math.floor(kbToGb(hardware.mem.min))"
              :step="8"
              range
              class="flex-grow-1"
            /> -->
          </a-col>
        </a-row>

        <a-row>
          <a-col span="12">
            {{ $t('NodeEditor.Disk') }}
          </a-col>
          <a-col span="12" class="text-right"> {{ selected.hardware.disk }} GB </a-col>
        </a-row>
        <a-row>
          <a-col span="24">
            <a-slider
              v-model="selected.hardware.disk"
              :min="Math.floor(hardware.disk.min)"
              :max="getSliderMax(hardware.disk.max, hardware.disk.min, 64)"
              :step="64"
              range
              class="flex-grow-1" />
            <!-- <a-slider
              v-model="selected.hardware.disk"
              :min="Math.floor(hardware.disk.min)"
              :max="Math.ceil(hardware.disk.max / 64) * 64 + Math.floor(hardware.disk.min) "
              :step="64"
              range
              class="flex-grow-1"
            /> -->
          </a-col>
        </a-row>

        <a-row>
          <a-col span="12">
            {{ $t('NodeEditor.GPU') }}
          </a-col>
          <a-col span="12" class="text-right"> {{ selected.hardware.gpu }} {{ $t('NodeEditor.Card') }} </a-col>
        </a-row>
        <a-row>
          <a-col span="24">
            <a-slider
              v-model="selected.hardware.gpu"
              :min="hardware.gpu.min"
              :max="hardware.gpu.max"
              range
              class="flex-grow-1" />
          </a-col>
        </a-row>
      </div>

      <div class="red" v-text="errorMessage" />
    </a-modal>

    <a-modal
      v-model="modal.clear"
      :title="$t('NodeEditor.Clear.Title')"
      centered
      @ok="clear"
      @cancel="modal.clear = false">
      <p>{{ $t('NodeEditor.Msg.Clear') }}</p>
      <!-- Clear Nodes -->
      <!-- This operation is irreversible. Are you sure you want to clear? -->
    </a-modal>
  </div>
</template>

<script>
import Request from '../request/https'

export default {
  name: 'NodesEditor',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    modelItemProp: {
      type: String,
      default: 'nodes',
    },
    editMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      textarea: '',
      modal: {
        add: false,
        clear: false,
      },
      select: 'group',
      filters: [
        { key: 'group', label: this.$t('NodeEditor.Group') },
        { key: 'rack', label: this.$t('NodeEditor.Rack') },
        { key: 'hardware', label: this.$t('NodeEditor.Hardware') },
      ],

      loading: false,
      errorMessage: '',
      errors: {
        NO_NODES_FOUND: this.$t('NodeEditor.Msg.NotFound'),
        SELECT_ITEM: this.$t('NodeEditor.Msg.SelectItem'),
        // NO_NODES_FOUND: 'Cannot find any nodes. Try different filters.',
        // SELECT_ITEM: 'Must select at least one item.',
      },

      // below are refreshed on mounted
      groups: [],
      rooms: [],
      hardware: null,

      // this is what the user selects
      selected: {
        group: [],
        rack: [], // from room tree data
        hardware: {},
      },
    }
  },
  computed: {
    treeData() {
      return this.rooms.map(room => {
        return {
          title: room.name,
          key: `room-${room.id}`,
          value: room.id,
          children: room.rows.map(row => {
            return {
              title: row.name,
              key: `row-${row.id}`,
              value: row.id,
              children: row.racks.map(rack => {
                return {
                  title: rack.name,
                  key: `rack-${rack.id}`,
                  value: rack.id,
                }
              }),
            }
          }),
        }
      })
    },
    canSubmit() {
      const selected = this.selected[this.select]
      if (Array.isArray(selected)) {
        return selected.length !== 0
      }
      return true
    },
  },
  watch: {
    canSubmit(yes) {
      if (yes) {
        this.errorMessage = ''
      }
    },
    textarea(value) {
      this.$emit('selected', value)
    },
    select() {
      this.loading = false
    },
  },
  async created() {
    let resp = await Request.get('/api/cluster/node-editor-fixtures/')
    this.groups = resp.data.groups
    this.rooms = resp.data.rooms

    resp = await Request.get('/api/monitor/node/node-editor-fixtures/')
    this.hardware = resp.data.hardware
    this.selected.hardware = this.getInnerHardWare()
  },
  methods: {
    getInnerHardWare() {
      const hardware = {}
      for (const key in this.hardware) {
        const min = key !== 'mem' ? parseInt(this.hardware[key].min) : this.kbToGb(this.hardware[key].min)
        const max = key !== 'mem' ? parseInt(this.hardware[key].max) : this.kbToGb(this.hardware[key].max, 'ceil')
        hardware[key] = [min, max]
      }
      return hardware
    },
    getSliderMax(max, min, step = 8) {
      return max + step - ((max - min) % step)
    },
    kbToGb(kbValue, type = 'floor') {
      return Math[type](kbValue / Math.pow(2, 20))
    },
    gbToKb(gbValue) {
      return gbValue * Math.pow(2, 20)
    },
    clear() {
      this.textarea = ''
      this.$emit('cleared')
      this.modal.clear = false
    },
    async add() {
      this.loading = true
      this.errorMessage = ''

      if (!this.canSubmit) {
        this.errorMessage = this.errors.SELECT_ITEM
        this.loading = false
        return false
      }

      const nodes = []

      if (this.select === 'group') {
        const groups = this.groups.filter(group => this.selected.group.includes(group.name))

        for (const group of groups) {
          nodes.push(...group.nodes)
        }
      } else if (this.select === 'rack') {
        for (const room of this.rooms) {
          for (const row of room.rows) {
            for (const rack of row.racks) {
              if (this.selected.rack.includes(rack.id)) {
                nodes.push(...rack.nodes)
              }
            }
          }
        }
      } else {
        // send request to server to fetch nodes based on the hardware criteria
        const params = {
          cpu_min: this.selected.hardware.cpu[0],
          cpu_max: this.selected.hardware.cpu[1],
          mem_min: this.gbToKb(this.selected.hardware.mem[0]),
          mem_max: this.gbToKb(this.selected.hardware.mem[1]),
          disk_min: this.selected.hardware.disk[0],
          disk_max: this.selected.hardware.disk[1],
          gpu_min: this.selected.hardware.gpu[0],
          gpu_max: this.selected.hardware.gpu[1],
        }

        const { data } = await Request.get('/api/monitor/node/nodes-by-hardware/', { params })

        this.loading = false

        if (data.length === 0) {
          this.errorMessage = this.errors.NO_NODES_FOUND
          return false
        }

        nodes.push(...data)
      }

      // final check
      if (nodes.length === 0) {
        this.errorMessage = this.errors.NO_NODES_FOUND
        this.loading = false
        return false
      }

      let hosts = nodes.map(n => n.hostname)

      if (this.textarea !== '') {
        const { data } = await Request.post('/api/cluster/hostlist/expand/', { hosts: this.textarea })
        hosts.push(...data)
      }
      hosts = hosts.join(',')

      // all good, fold nodes then assign to textarea so it propagates from the watcher
      const { data } = await Request.post('/api/cluster/hostlist/fold/', { hosts })

      this.loading = false
      this.textarea = data
      this.modal.add = false
      this.reset()
    },
    closeAddModel() {
      this.reset()
    },
    reset() {
      this.select = 'group'
      this.selected = {
        group: [],
        rack: [], // from room tree data
        hardware: this.getInnerHardWare(),
      }
    },
    close() {
      // for some reason this method is missing here but used by parent queues-dialog
      // TODO find out why
    },
  },
}
</script>

<style>
.red {
  color: red;
}
.text-right {
  text-align: right;
}
.mt-4 {
  margin-top: 16px;
}
.ml-4 {
  margin-left: 16px;
}
.mb-4 {
  margin-bottom: 16px;
}
.mr-4 {
  margin-right: 16px;
}
.my-4 {
  margin-top: 16px;
  margin-bottom: 16px;
}
.mx-4 {
  margin-left: 16px;
  margin-right: 16px;
}
</style>
