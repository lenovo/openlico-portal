<template>
  <div class="job-template-license-feature">
    <template v-for="(val, index) in values">
      <div :key="index" class="job-template-license-feature-item" :class="{ 'm-t-10': index > 0 }">
        <a-input
          v-if="scheduler == 'pbs'"
          v-model="val.key"
          class="license-feature-item-license"
          @change="onValuesChange" />
        <a-select v-else v-model="val.key" class="license-feature-item-license" @change="onValuesChange">
          <a-select-option
            v-for="item in innerOptions"
            :key="item.key"
            :disabled="item.disabled && val.key != item.key"
            :title="`${item.label} (${item.used} / ${item.total})`">
            {{ `${item.label} (${item.used}` }}
            <!-- <span class="license-feature-option-item-temp">{{val.key==item.key&&Boolean(val.value)? `+ ${val.value}` : ""}}</span> -->
            {{ ` / ${item.total})` }}
          </a-select-option>
        </a-select>
        <a-input-number
          v-model="val.value"
          :min="0"
          :max="getCountsMax(val.key)"
          class="license-feature-item-counts m-l-10"
          @change="onValuesChange($event, index)" />
        <span class="license-feature-item-del m-l-10" @click="onDeleteClick(index)"><a-icon type="close" /></span>
      </div>
      <!-- <div :key="`license_item_err_msg_${index}`" class="license-item-err-msg" :class="{'license-item-err-msg-active': !Boolean(val.counts)}">{{"please input"}}</div> -->
    </template>
    <a-button type="link" :disabled="disabled" style="padding-left: 0" @click="onAddClick">
      + {{ $t('Action.Add') }}
    </a-button>
  </div>
</template>
<script>
import JobTemplateService from '../../service/job-template'
import AccessService from '../../service/access'

export default {
  props: ['value'],
  data() {
    return {
      scheduler: AccessService.getScheduler(),
      values: [],
      options: [],
    }
  },
  computed: {
    innerOptions() {
      return this.options.map((item, index) => ({
        label: item.name,
        total: item.total,
        used: item.used,
        key: item.name,
        disabled: this.values.filter(i => i.key === item.name).length > 0,
      }))
    },
    disabled() {
      if (this.scheduler === 'pbs') return false
      if (this.innerOptions.length === 0) return true

      const options = this.innerOptions.filter(i => !i.disabled)
      if (options.length === 0) return true

      return false
    },
  },
  watch: {
    value(val) {
      this.values = this.initValues(val || {})
    },
    options(val) {
      this.values = this.initValues(this.value || {})
    },
  },
  created() {
    this.getOptipns()
  },
  mounted() {
    this.values = this.initValues(this.value || {})
  },
  methods: {
    initValues(value) {
      const values = []
      for (const key in value) {
        if (this.scheduler === 'pbs') {
          values.push({ key, value: this.value[key] })
        } else {
          const result = this.innerOptions.filter(i => i.key === key)[0]
          if (result) {
            // let free = result.total - result.used;
            // values.push({key, value: free < this.value[key]? free : this.value[key]})
            values.push({ key, value: this.value[key] })
          }
        }
      }
      return values
    },
    emitValues(values) {
      const value = {}
      values.forEach(item => {
        value[item.key] = item.value
      })
      this.$emit('input', value)
    },
    getOptipns() {
      JobTemplateService.getJobLicenseFeature().then(
        res => {
          this.options = res
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    getCountsMax(key) {
      if (this.scheduler === 'pbs') return 99999
      const item = this.innerOptions.filter(i => i.key === key)[0]
      return item.total
    },
    onValuesChange(val, index) {
      if (val === '' || val === null) {
        this.values[index].value = 0
      }
      this.emitValues(this.values)
    },
    onAddClick() {
      if (this.scheduler === 'pbs') {
        this.values.push({ key: '', value: 0 })
      } else {
        const license = this.innerOptions.filter(i => !i.disabled)[0]
        if (license) {
          this.emitValues([...this.values, { key: license.key, value: 0 }])
        }
      }
    },
    onDeleteClick(index) {
      const val = this.values.filter((item, i) => i !== index)
      this.emitValues(val)
    },
  },
}
</script>
<style scoped>
.job-template-license-feature {
  width: 300px;
}
.job-template-license-feature-item {
  display: flex;
}
.license-feature-item-license {
  width: 190px;
  flex-shrink: 0;
}
.license-feature-option-item-temp {
  color: #449fff;
}
.job-template-license-feature-item .license-feature-item-counts {
  width: 80px;
  flex-shrink: 0;
}
.job-template-license-feature-item .license-feature-item-counts >>> .ant-input-number-handler-wrap {
  display: none;
}
.license-feature-item-del {
  font-size: 16px;
  line-height: 32px;
  cursor: pointer;
}
.license-item-err-msg {
  display: none;
  color: red;
  font-size: 12px;
}
.license-item-err-msg-active {
  display: block;
}
</style>
