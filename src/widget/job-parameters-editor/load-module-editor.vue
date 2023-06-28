<template>
  <div class="load-module-editor">
    <a-input-group compact>
      <a-select
        v-model="collection"
        style="width: 67%"
        mode="multiple"
        :filter-option="filterOption"
        :placeholder="$t('JobTemplate.LoadModule.DefaultCollection')"
        @change="onSelectChange">
        <div slot="clearIcon">
          <a-icon type="menu" />
        </div>
        <a-select-option
          v-for="option in options"
          :key="String(option.id)"
          :value="option.id"
          :disabled="collection.length == maxSelected && !collection.includes(option.id)">
          <a-popover v-if="popoverEnable(option)">
            <template slot="content">
              <span style="margin-right: 10px">{{ option.name }}</span>
              <a-button type="link" style="padding: 0" @click="viewRuntimeDetail(option.id, $event)">
                {{ $t('Runtime.Detail') }}
              </a-button>
            </template>
            <div class="module-option-item">
              <span class="module-option-name">
                <img :src="getSrc(option.tag.includes('sys:intel'))" class="rcicon" style="width: 15px; height: 15px" />
                {{ option.name }}
              </span>
              <span class="jobtemplate-runitme-item-type" style="color: transparent">{{ option.type }}</span>
              <!-- <span style="margin-left:5px; color: #6fbfff;">{{option.type}}</span> -->
            </div>
          </a-popover>
          <div v-if="!popoverEnable(option)" class="module-option-item">
            <span class="module-option-name">
              <img :src="getSrc(option.tag.includes('sys:intel'))" class="rcicon" style="width: 15px; height: 15px" />
              {{ option.name }}
            </span>
            <span class="jobtemplate-runitme-item-type" style="color: transparent">{{ option.type }}</span>
          </div>
        </a-select-option>
      </a-select>
      <a-button :disabled="!allDetailenable" style="width: 17%" @click="viewRuntimeDetail()">
        {{ $t('Runtime.Detail') }}
      </a-button>
      <a-button v-if="allDetailenable" type="link" style="width: 16%" @click="clearSelected">
        {{ $t('Action.Clear') }}
      </a-button>
    </a-input-group>
    <runtime-view-dialog ref="runtimeViewDialog" />
  </div>
</template>
<script>
import RuntimeService from '../../service/runtime-manage'
import RuntimeViewDialog from './load-module-detail'

export default {
  components: {
    'runtime-view-dialog': RuntimeViewDialog,
  },
  props: {
    value: {},
    param: {},
    maxSelected: {
      default: 10,
    },
  },
  data() {
    return {
      collection: [],
      options: [],
    }
  },
  computed: {
    allDetailenable() {
      return this.collection !== null && (typeof this.collection === 'number' || this.collection.length)
    },
    mode() {
      let mode = 'new'
      if (Object.prototype.hasOwnProperty.call(this.$route.params, 'jobId')) {
        mode = 'copy'
      }
      return mode
    },
  },
  mounted() {
    this.initOptions()
  },
  methods: {
    onSelectChange(val) {
      let value = (this.collection = val)

      if (!Array.isArray(value)) {
        value = [value]
      }

      if (!value.length) {
        value = null
      }
      this.$emit('input', value)
    },
    clearSelected() {
      this.collection = []
      this.$emit('input', null)
    },
    initSelected() {
      let selected = null
      if (Array.isArray(this.value)) {
        selected = this.options.filter(i => this.value.includes(i.id))
        const names = this.value.filter(i => typeof i === 'string')
        selected.concat(this.options.filter(i => names.includes(i.name)))
      }
      if (typeof this.value === 'number') {
        selected = this.options.filter(i => i.id === this.value)
      }
      if (typeof this.value === 'string') {
        selected = this.options.filter(i => i.name.toLowerCase() === this.value.toLowerCase())
      }
      if (this.value && !selected.length)
        this.$message.warn(`${this.$t('Error.14028')} ${this.param.name}: ${this.value}`)
      if (selected && Array.isArray(this.value)) selected = this.value.filter(i => selected.includes(i))
      if (this.mode === 'new') {
        if (selected && selected.length) {
          selected = selected.filter(i => i.type === 'System')
        }
      }
      this.onSelectChange(selected && selected.length ? selected.map(i => i.id) : this.value ? this.value : [])
    },
    initOptions() {
      RuntimeService.listRuntime().then(
        res => {
          res.forEach(collection => {
            this.options.push(collection)
          })
          this.initSelected()
        },
        res => {
          this.$message.error(res)
        },
      )
    },
    viewRuntimeDetail(id, e) {
      if (e) e.stopPropagation()
      let runtimeId = id !== undefined ? id : this.collection
      if (typeof runtimeId === 'number') runtimeId = [runtimeId]
      this.$refs.runtimeViewDialog.viewDetail(runtimeId)
    },
    getSrc(showCondition) {
      return RuntimeService.imgSet(showCondition)
    },
    popoverEnable(option) {
      if (typeof this.collection === 'number') return this.collection === option.id
      if (Array.isArray(this.collection)) return this.collection.includes(option.id)
      return false
    },
    filterOption(input, option) {
      const labelElement = option.componentOptions.children
      let label = labelElement[0].elm ? labelElement[0].elm.textContent : ''
      if (!label) {
        label = labelElement[1].children ? labelElement[1].children[0].children[1].text : ''
      }
      return label.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
  },
}
</script>
<style scoped>
/* .module-type {
    width: 100%;
    float: right;
    position: relative;
}
.module-type span{
    position: absolute;
    right: calc(20% + 30px);
    z-index: 10;
    top: 5px;
    pointer-events: none
} */
.module-option-item {
  display: flex;
}
.module-option-name {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.module-option-type {
  width: 100px;
  background: #fafafa;
  text-align: center;
}
.load-module-editor >>> .ant-select-selection-selected-value {
  width: 100%;
}
.load-module-editor >>> .ant-select-selection__choice,
.load-module-editor >>> .ant-select-dropdown-menu-item {
  overflow: unset;
}
.ant-select-selection__choice .jobtemplate-runitme-item-type {
  display: none;
}
.load-module-editor .ant-select-dropdown-menu-item-active:hover .jobtemplate-runitme-item-type {
  color: #6fbfff !important;
  display: inline-block;
}
.load-module-editor >>> .ant-popover-content {
  width: calc(100% + 25px);
}
.load-module-editor >>> .ant-popover-inner-content {
  padding: 5px 10px;
}
/* .ant-select-dropdown-menu-item-active:hover .jobtemplate-runitme-item-type {
    color: #6fbfff !important;
} */
</style>
