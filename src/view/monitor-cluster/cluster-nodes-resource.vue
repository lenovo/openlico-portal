<template>
  <div class="cluster-nodes-viewer">
    <div class="filter">
      <a-row>
        <a-col :span="16">
          <a-dropdown
            v-model="vacant_select_visible"
            class="filter-button vacant-filter-button"
            :trigger="['click']"
            overlay-class-name="b-w vacant-filter-inner"
            @click="e => e.preventDefault()">
            <div slot="overlay">
              <div v-for="item in vacantFilterValue" :key="item.name">
                <div class="filter-title" style="display: flex">
                  <span>{{ getLabel(item.name) }}</span>
                  <span class="filter-range">{{ `${item.value[0]}%~${item.value[1]}%` }}</span>
                </div>
                <a-slider v-model="item.value" range :tooltip-visible="false" />
              </div>
              <div class="controller-bar">
                <a-button
                  size="small"
                  :disabled="disable(vacantFilterValue)"
                  class="reset"
                  @click="resetItem('vacant')">
                  {{ $t('Action.Reset') }}
                </a-button>
                <a-button size="small" @click="confirmVacantFilter">
                  {{ $t('Action.Confirm') }}
                </a-button>
                <a-button size="small" @click="closedrop('vacant')">
                  {{ $t('Action.Cancel') }}
                </a-button>
              </div>
            </div>
            <a-popover v-if="!disable(filter.vacant)" placement="topLeft">
              <template slot="content">
                <p v-for="(item, index) in getPopoverContent(filter.vacant)" :key="index" class="popover-content">
                  <span>{{ item.name }}</span
                  ><span>{{ item.value }}</span>
                </p>
              </template>
              <a-button type="primary">
                {{ $t('Monitor.Cluster.Resources.Vacant') }}
                <a-icon type="down" />
              </a-button>
            </a-popover>
            <a-button v-else>
              {{ $t('Monitor.Cluster.Resources.Vacant') }}
              <a-icon type="down" />
            </a-button>
          </a-dropdown>
          <a-dropdown
            v-model="system_select_visible"
            class="filter-button systemused-filter-button"
            :trigger="['click']"
            overlay-class-name="b-w systemused-filter-inner"
            @click="e => e.preventDefault()">
            <div slot="overlay">
              <div v-for="item in systemUsedFilterValue" :key="item.name">
                <div class="filter-title" style="display: flex">
                  <span>{{ getLabel(item.name) }}</span>
                  <span class="filter-range">{{ `${item.value[0]}%~${item.value[1]}%` }}</span>
                </div>
                <a-slider v-model="item.value" range :tooltip-visible="false" />
              </div>
              <div class="controller-bar">
                <a-button
                  size="small"
                  :disabled="disable(systemUsedFilterValue)"
                  class="reset"
                  @click="resetItem('system')">
                  {{ $t('Action.Reset') }}
                </a-button>
                <a-button size="small" @click="confirmSystemUsedFilter">
                  {{ $t('Action.Confirm') }}
                </a-button>
                <a-button size="small" @click="closedrop('system')">
                  {{ $t('Action.Cancel') }}
                </a-button>
              </div>
            </div>
            <a-popover v-if="!disable(filter.systemUsed)">
              <template slot="content">
                <p v-for="(item, index) in getPopoverContent(filter.systemUsed)" :key="index" class="popover-content">
                  <span>{{ item.name }}</span
                  ><span>{{ item.value }}</span>
                </p>
              </template>
              <a-button type="primary">
                {{ $t('Monitor.Cluster.Resources.SystemUsed') }}
                <a-icon type="down" />
              </a-button>
            </a-popover>
            <a-button v-else>
              {{ $t('Monitor.Cluster.Resources.SystemUsed') }}
              <a-icon type="down" />
            </a-button>
          </a-dropdown>
          <a-dropdown
            v-model="job_select_visible"
            class="filter-button jobused-filter-button"
            :trigger="['click']"
            overlay-class-name="b-w jobused-filter-inner"
            @click="e => e.preventDefault()">
            <div slot="overlay">
              <div v-for="item in jobUsedFilterValue" :key="item.name">
                <div class="filter-title" style="display: flex">
                  <span>{{ getLabel(item.name) }}</span>
                  <span class="filter-range">{{ `${item.value[0]}%~${item.value[1]}%` }}</span>
                </div>
                <a-slider v-model="item.value" range :tooltip-visible="false" />
              </div>
              <div class="controller-bar">
                <a-button size="small" :disabled="disable(jobUsedFilterValue)" class="reset" @click="resetItem('job')">
                  {{ $t('Action.Reset') }}
                </a-button>
                <a-button size="small" @click="confirmJobUsedFilter">
                  {{ $t('Action.Confirm') }}
                </a-button>
                <a-button size="small" @click="closedrop('job')">
                  {{ $t('Action.Cancel') }}
                </a-button>
              </div>
            </div>
            <a-popover v-if="!disable(filter.jobUsed)">
              <template slot="content">
                <p v-for="(item, index) in getPopoverContent(filter.jobUsed)" :key="index" class="popover-content">
                  <span>{{ item.name }}</span
                  ><span>{{ item.value }}</span>
                </p>
              </template>
              <a-button type="primary">
                {{ $t('Monitor.Cluster.Resources.JobUsed') }}
                <a-icon type="down" />
              </a-button>
            </a-popover>
            <a-button v-else>
              {{ $t('Monitor.Cluster.Resources.JobUsed') }}
              <a-icon type="down" />
            </a-button>
          </a-dropdown>
          <a-dropdown
            v-model="hostname_select_visible"
            class="filter-button hostname-filter-button"
            :trigger="['click']"
            overlay-class-name="b-w hostname-filter-inner"
            @click="e => e.preventDefault()">
            <div slot="overlay">
              <p>{{ $t('Monitor.Cluster.Hostname') }}</p>
              <p class="multNode-nodes-input-tips">
                <a-icon type="exclamation-circle" theme="filled" />
                {{ $t('MultNode.Nodes.Tips') }}
              </p>
              <a-textarea
                v-model="inputHostName"
                :placeholder="$t('MultNode.Placeholder.Hostname')"
                :auto-size="{ minRows: 3 }"
                @change="validHostName" />
              <p v-if="hostNameValidMessage" class="hostname-valid-message">
                {{ hostNameValidMessage }}
              </p>
              <div class="controller-bar">
                <a-button size="small" :disabled="!!hostNameValidMessage" @click="confirmHostName">
                  {{ $t('Action.Confirm') }}
                </a-button>
                <a-button size="small" @click="closedrop('hostname')">
                  {{ $t('Action.Cancel') }}
                </a-button>
              </div>
            </div>
            <a-popover v-if="filter.hostName.length">
              <template slot="content">
                <p class="hostname-popover-content">
                  {{ filter.hostName.join(',') }}
                </p>
              </template>
              <a-button type="primary">
                {{ $t('Monitor.Cluster.Hostname') }}
                <a-icon type="down" />
              </a-button>
            </a-popover>
            <a-button v-else>
              {{ $t('Monitor.Cluster.Hostname') }}
              <a-icon type="down" />
            </a-button>
          </a-dropdown>
          <a-button class="filter-button reset-all-filter" :disabled="resetAllAble()" @click="resetAll">
            {{ $t('Action.ResetAll') }}
          </a-button>
          <span v-if="!resetAllAble()" class="filter-result-nodes">{{
            $t('Monitor.Cluster.Filter.Nodes', { number: filterData.length })
          }}</span>
        </a-col>
        <a-col :span="8" class="display-type-col">
          <a-dropdown-button
            v-model="resource_select_visible"
            class="filter-button resource-filter-button"
            :trigger="['click']"
            @click="e => e.preventDefault()">
            {{ $t('Monitor.Cluster.Resources.Show') }}
            <div slot="overlay" class="resource-filter-inner b-w">
              <a-checkbox-group v-model="selectedResource" @change="onChange">
                <a-row>
                  <a-col v-for="item in resourcesOptions" :key="item.label" class="resource-check-item">
                    <a-checkbox :disabled="item.disabled" :value="item.value">
                      {{ item.label }}
                    </a-checkbox>
                  </a-col>
                </a-row>
              </a-checkbox-group>
              <p class="controller-bar">
                <a-button
                  size="small"
                  :disabled="!selectedResource.length"
                  style="cursor: pointer"
                  @click="selectResource">
                  {{ $t('Action.Confirm') }}
                </a-button>
                <a-button size="small" @click="closedrop('resource')">
                  {{ $t('Action.Cancel') }}
                </a-button>
              </p>
            </div>
            <div slot="icon">
              <span
                v-for="(item, index) in filter.displayResources"
                :key="item"
                :class="'resource-selected' + (index + 1)">
                <span class="icon" />
                <span class="text">{{ getLabel(item) }}</span>
              </span>
              <a-icon type="down" />
            </div>
          </a-dropdown-button>
        </a-col>
      </a-row>
    </div>
    <div style="width: 100%">
      <NodesViewer :nodes="filterData" :show-item="filter.displayResources" />
    </div>
  </div>
</template>

<script>
import NodesViewer from './nodes-viewer'
import Schema from 'async-validator'
import ValidRoleFactory from '../../common/valid-role-factory'
export default {
  components: {
    NodesViewer,
  },
  props: {
    nodes: {
      type: Array,
      default: function () {
        return []
      },
    },
  },
  data() {
    return {
      filterData: [],
      vacant_select_visible: false,
      system_select_visible: false,
      job_select_visible: false,
      hostname_select_visible: false,
      resource_select_visible: false,
      selectedResource: ['cpu', 'mem'],
      resourcesOptions: [],
      vacantFilterValue: [],
      systemUsedFilterValue: [],
      jobUsedFilterValue: [],
      inputHostName: '',
      hostNameValidMessage: null,
      filter: {
        vacant: [],
        systemUsed: [],
        jobUsed: [],
        hostName: [],
        displayResources: ['cpu', 'mem'],
      },
    }
  },
  computed: {
    gResource() {
      return window.gApp.$store.getters['settings/getGResource']
    },
  },
  watch: {
    nodes() {
      this.$nextTick(() => {
        this.init()
      })
    },
    vacant_select_visible(val, oldVal) {
      if (!val) {
        // this.confirmVacantFilter();
        // Bug 245359
        this.closedrop('vacant')
      }
    },
    system_select_visible(val, oldVal) {
      if (!val) {
        // this.confirmSystemUsedFilter();
        // Bug 245359
        this.closedrop('system')
      }
    },
    job_select_visible(val, oldVal) {
      if (!val) {
        // this.confirmJobUsedFilter();
        // Bug 245359
        this.closedrop('job')
      }
    },
    hostname_select_visible(val, oldVal) {
      if (!val) {
        // this.confirmHostName();
        // Bug 245359
        this.closedrop('hostname')
      }
      this.validHostName()
    },
    resource_select_visible(val, oldVal) {
      if (!val) {
        // if (this.selectedResource.length) {
        //     this.filter.displayResources = [...this.selectedResource];
        // } else {
        //     this.selectedResource = [...this.filter.displayResources];
        //     this.onChange(this.selectedResource);
        // }
        // Bug 245359
        this.closedrop('resource')
      }
    },
    filter: {
      handler: function (val, oldVal) {
        this.init()
      },
      deep: true,
    },
  },
  created() {
    this.resourcesOptions = [
      {
        label: this.$t('Monitor.Cluster.CPU'),
        value: 'cpu',
        disabled: false,
      },
      {
        label: this.$t('Monitor.Cluster.Memory'),
        value: 'mem',
        disabled: false,
      },
    ]
    this.gResource.forEach(el => {
      this.resourcesOptions.push({
        label: el.display_name,
        value: el.code,
        disabled: false,
      })
    })
    this.vacantFilterValue = []
    this.systemUsedFilterValue = []
    this.jobUsedFilterValue = []
    this.filter.vacant = []
    this.filter.systemUsed = []
    this.filter.jobUsed = []
    this.resourcesOptions.forEach(el => {
      this.vacantFilterValue.push({
        name: el.value,
        value: [0, 100],
      })
      this.systemUsedFilterValue.push({
        name: el.value,
        value: [0, 100],
      })
      this.jobUsedFilterValue.push({
        name: el.value,
        value: [0, 100],
      })
      this.filter.vacant.push({
        name: el.value,
        value: [0, 100],
      })
      this.filter.systemUsed.push({
        name: el.value,
        value: [0, 100],
      })
      this.filter.jobUsed.push({
        name: el.value,
        value: [0, 100],
      })
    })
  },
  mounted() {
    this.init()
    this.onChange(this.selectedResource)
  },
  methods: {
    init() {
      this.filterData = this.nodes.filter(el => {
        if (this.filter.hostName.length) {
          if (this.filter.hostName.includes(el.hostname)) {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      })
      if (!this.disable(this.filter.vacant)) {
        this.filterData = this.filterData.filter(el => {
          return this.handlerCompare('vacant', el)
        })
      }
      if (!this.disable(this.filter.systemUsed)) {
        this.filterData = this.filterData.filter(el => {
          return this.handlerCompare('systemUsed', el)
        })
      }
      if (!this.disable(this.filter.jobUsed)) {
        this.filterData = this.filterData.filter(el => {
          return this.handlerCompare('jobUsed', el)
        })
      }
    },
    onChange(val) {
      if (val.length >= 2) {
        this.resourcesOptions = this.resourcesOptions.map(el => {
          el.disabled = true
          if (val.indexOf(el.value) !== -1) {
            el.disabled = false
          }
          return el
        })
      } else {
        this.resourcesOptions = this.resourcesOptions.map(el => {
          el.disabled = false
          return el
        })
      }
    },
    closedrop(val) {
      switch (val) {
        case 'vacant':
          this.vacantFilterValue = []
          this.filter.vacant.forEach(el => {
            const item = Object.assign({}, el)
            this.vacantFilterValue.push(item)
          })
          this.vacant_select_visible = false
          break
        case 'system':
          this.systemUsedFilterValue = []
          this.filter.systemUsed.forEach(el => {
            const item = Object.assign({}, el)
            this.systemUsedFilterValue.push(item)
          })
          this.system_select_visible = false
          break
        case 'job':
          this.jobUsedFilterValue = []
          this.filter.jobUsed.forEach(el => {
            const item = Object.assign({}, el)
            this.jobUsedFilterValue.push(item)
          })
          this.job_select_visible = false
          break
        case 'hostname':
          this.inputHostName = this.filter.hostName.join(',')
          this.hostname_select_visible = false
          break
        case 'resource':
          this.selectedResource = [...this.filter.displayResources]
          this.onChange(this.selectedResource)
          this.resource_select_visible = false
          break
      }
    },
    getLabel(val) {
      for (let i = 0; i < this.resourcesOptions.length; i++) {
        const element = this.resourcesOptions[i]
        if (element.value === val) {
          return element.label
        }
      }
      return ''
    },
    getmarks(val) {
      const marks = {}
      marks[val[0]] = val[0] + '%'
      marks[val[1]] = val[1] + '%'
      return marks
    },
    resetItem(val) {
      switch (val) {
        case 'vacant':
          this.vacantFilterValue.forEach(el => {
            el.value = [0, 100]
          })
          break
        case 'system':
          this.systemUsedFilterValue.forEach(el => {
            el.value = [0, 100]
          })
          break
        case 'job':
          this.jobUsedFilterValue.forEach(el => {
            el.value = [0, 100]
          })
          break
      }
    },
    disable(val) {
      let disabled = true
      for (let i = 0; i < val.length; i++) {
        if (val[i].value[0] !== 0 || val[i].value[1] !== 100) {
          disabled = false
          break
        }
      }
      return disabled
    },
    resetAll() {
      this.resetItem('vacant')
      this.resetItem('system')
      this.resetItem('job')
      this.confirmVacantFilter()
      this.confirmSystemUsedFilter()
      this.confirmJobUsedFilter()
      this.inputHostName = ''
      this.filter.hostName = []
    },
    resetAllAble() {
      const filters = [
        !this.disable(this.filter.vacant),
        !this.disable(this.filter.systemUsed),
        !this.disable(this.filter.jobUsed),
        !!this.filter.hostName.length,
      ]
      return !filters.includes(true)
    },
    confirmVacantFilter() {
      this.filter.vacant = []
      this.vacantFilterValue.forEach(el => {
        const item = Object.assign({}, el)
        this.filter.vacant.push(item)
      })
      this.closedrop('vacant')
    },
    confirmSystemUsedFilter() {
      this.filter.systemUsed = []
      this.systemUsedFilterValue.forEach(el => {
        const item = Object.assign({}, el)
        this.filter.systemUsed.push(item)
      })
      this.closedrop('system')
    },
    confirmJobUsedFilter() {
      this.filter.jobUsed = []
      this.jobUsedFilterValue.forEach(el => {
        const item = Object.assign({}, el)
        this.filter.jobUsed.push(item)
      })
      this.closedrop('job')
    },
    confirmHostName() {
      if (!this.hostNameValidMessage && this.inputHostName.length) {
        this.filter.hostName = this.inputHostName.split(',')
      } else if (!this.inputHostName.length) {
        this.filter.hostName = []
      } else {
        this.inputHostName = this.filter.hostName.join(',')
      }
      this.closedrop('hostname')
    },
    selectResource() {
      this.filter.displayResources = [...this.selectedResource]
      this.closedrop('resource')
    },
    getPopoverContent(val) {
      const content = []
      for (let i = 0; i < val.length; i++) {
        if (val[i].value[0] !== 0 || val[i].value[1] !== 100) {
          content.push({
            name: this.getLabel(val[i].name),
            value: val[i].value[0] + '%' + '~' + val[i].value[1] + '%',
          })
        }
      }
      return content
    },
    validHostName() {
      this.hostNameValidMessage = null
      const inputValue = this.inputHostName
      const validRoles = [ValidRoleFactory.getvalidMultiHostName()]
      const validator = new Schema({ hostname: validRoles })
      validator.validate({ hostname: inputValue }, (errors, fields) => {
        if (inputValue && errors) {
          this.hostNameValidMessage = errors[0].message
        }
      })
    },
    handlerCompare(filterType, node) {
      const filterValue = this.filter[filterType]
      for (let i = 0; i < filterValue.length; i++) {
        const range = filterValue[i].value
        if (range[0] === 0 && range[1] === 100) {
          continue
        }
        if ((range[0] !== 0 || range[1] !== 100) && !node[filterValue[i].name]) {
          return false
        }
        const value = node[filterValue[i].name][filterType]
        if (value === null || value === undefined || value === '') {
          return false
        }
        if (value >= range[0] && value <= range[1]) {
          continue
        } else {
          return false
        }
      }
      return true
    },
  },
}
</script>

<style scoped>
.filter {
  margin-bottom: 20px;
}
.filter >>> .vacant-filter-inner,
.filter >>> .systemused-filter-inner,
.filter >>> .jobused-filter-inner,
.filter >>> .hostname-filter-inner {
  width: 272px;
  padding: 16px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}
.filter-button {
  margin-right: 10px;
}
.display-type-col {
  text-align: right;
  padding-right: 10px;
}
.display-type-filter {
  display: inline-block;
}
.resource-selected1,
.resource-selected2 {
  display: inline-block;
  position: relative;
  margin-right: 10px;
}
.resource-selected1 .icon,
.resource-selected2 .icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}
.resource-selected2 {
  /* margin-left: 10px; */
}
.resource-selected1 .text,
.resource-selected2 .text {
  display: inline-block;
  margin-left: 16px;
}
.resource-selected1 .icon {
  background-color: #449fff;
}
.resource-selected2 .icon {
  background-color: #1abc9c;
}
.resource-filter-button .ant-dropdown-trigger {
  border-radius: 0 4px 4px 0;
}
.filter .resource-filter-inner {
  width: 180px;
  padding: 16px;
  text-align: left;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}
.controller-bar {
  margin-top: 40px;
  overflow: hidden;
}
.hostname-filter-inner .controller-bar,
.resource-filter-inner .controller-bar {
  text-align: right;
}
.controller-bar .ant-btn {
  border: none;
  padding: 0;
}
.multNode-nodes-input-tips {
  margin: 10px 0;
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 4px;
}
.multNode-nodes-input-tips .anticon-exclamation-circle {
  color: #1890ff;
}
.controller-bar .ant-btn {
  float: right;
  background-color: #fff;
}
.controller-bar .reset {
  float: left;
}
.controller-bar .ant-btn:last-child {
  margin-right: 10px;
}
.popover-content {
  width: 200px;
  height: 24px;
  line-height: 24px;
}
.popover-content span:nth-child(1) {
  float: left;
}
.popover-content span:nth-child(2) {
  float: right;
}
.hostname-valid-message {
  color: #f5222d;
  margin-top: 2px;
}
.filter-result-nodes {
  color: #ccc;
}
.filter >>> .vacant-filter-inner .ant-slider-mark,
.filter >>> .systemused-filter-inner .ant-slider-mark,
.filter >>> .jobused-filter-inner .ant-slider-mark {
  font-size: 12px;
}
.hostname-popover-content {
  max-width: 200px;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}
.resource-check-item {
  margin-bottom: 6px;
}
.resource-filter-inner .controller-bar {
  margin-top: 20px;
}
.resource-filter-button >>> .ant-btn:first-child:hover {
  cursor: default;
  color: rgba(0, 0, 0, 0.65);
  background-color: #fff;
  border-color: #d9d9d9;
}
.filter-title span {
  display: block;
  width: 100%;
}
.filter-range {
  font-size: 12px;
  text-align: right;
}
</style>
