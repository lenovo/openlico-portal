<template>
  <a-select v-model="innerValue" :allow-clear="true" class="default-select" :placeholder="innerPlaceholder">
    <a-select-option v-for="item in options" :key="item.value" :value="item.value">
      {{ item.label }}
    </a-select-option>
  </a-select>
</template>
<script>
import QueueService from '../service/queue'

export default {
  props: ['value', 'gpu', 'placeholder'],
  data() {
    return {
      options: [],
      innerValue: undefined,
      innerPlaceholder: this.placeholder ? this.placeholder : this.$t('Placeholder.PlaseSelect'),
    }
  },
  watch: {
    innerValue: {
      handler: function (val, oldVal) {
        // if(this.compareValues(this.value, val)) {
        //   return;
        // }
        // this.value.splice(0, this.value.length);
        // this.innerValue.forEach((one) => {
        //   this.value.push(one);
        // });
        // [Bug 182485] wengmh1 2019/09/17
        // Fix job queuing can't recovery from clear queue selection.
        if (!this.innerValue) {
          this.$emit('input', [])
        } else {
          this.$emit('input', [this.innerValue])
        }
      },
      deep: false,
    },
    value(val) {
      if (Array.isArray(val) && val.length) {
        this.innerValue = val[0]
      } else if (!Array.isArray(val) && this.options.length) {
        this.innerValue = this.options[0].value
        this.$emit('input', [this.innerValue])
      } else {
        this.innerValue = undefined
      }
    },
  },
  created() {
    this.initOptions()
  },
  methods: {
    initOptions() {
      this.options = []
      QueueService.getAllQueues().then(
        res => {
          let options = res
          if (this.gpu) {
            options = res.filter(q => q.gpuNum)
          }
          options.forEach(queue => {
            this.options.push({
              value: queue.name,
              label: queue.name,
            })
          })
          if (this.value.length > 0) {
            this.innerValue = this.value[0]
          } else if (!Array.isArray(this.value) && this.options.length) {
            this.innerValue = this.options[0].value
          }
        },
        res => {
          this.$message.error(res)
        },
      )
    },
    compareValues(arr1, arr2) {
      if (arr1.length !== arr2.length) {
        return false
      }
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[0] !== arr2[0]) {
          return false
        }
      }
      return true
    },
  },
}
</script>
