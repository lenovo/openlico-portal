<template>
  <div class="optimizer-editor">
    <a-tag
      v-for="(optimizer, index) in optimizers"
      :key="getOptimizerDisplayName(optimizer.type) + index"
      :closable="multi"
      :close-transition="true"
      @close.prevent="onOptimizerRemove(optimizer)"
      @click="onOptimizerSetting(optimizer)">
      {{ getOptimizerDisplayName(optimizer.type) }}
    </a-tag>
    <a-button v-show="multi" class="new-optimizer-button" size="small" @click="onCreateClick"> + </a-button>
    <optimizer-dialog ref="settingDialog" />
  </div>
</template>
<script>
import Utils from '@/common/utils'
import OptimizerDefine from './optimizer-define'
import OptimizerDialog from './optimizer-dialog.vue'

export default {
  components: {
    OptimizerDialog,
  },
  props: ['value', 'multi'],
  emits: ['input', 'update:value'],
  data() {
    return {
      optimizers: this.multi ? this.value : [this.value],
    }
  },
  watch: {
    optimizers: {
      handler(val, oldVal) {
        if (this.multi) {
          this.$emit('input', this.optimizers)
          this.$emit('update:value', this.optimizers)
        } else {
          this.$emit('input', this.optimizers[0])
          this.$emit('update:value', this.optimizers[0])
        }
      },
    },
  },
  methods: {
    getOptimizerDisplayName(type) {
      let label = ''
      OptimizerDefine.optimizers.forEach(option => {
        if (option.key === type) {
          label = this.$t(option.label)
        }
      })
      return label
    },
    onOptimizerRemove(optimizer) {
      const optimizers = []
      this.optimizers.forEach(temp => {
        if (temp !== optimizer) {
          optimizers.push(temp)
        }
      })
      this.optimizers = optimizers
    },
    onOptimizerSetting(optimizer) {
      this.$refs.settingDialog.doSetting(optimizer).then(
        res => {
          const optimizers = []
          this.optimizers.forEach(temp => {
            if (temp !== optimizer) {
              optimizers.push(temp)
            } else {
              optimizers.push(res)
            }
          })
          this.optimizers = []
          optimizers.forEach(el => {
            this.optimizers = this.isPush(this.optimizers, el)
          })
        },
        res => {
          // Do nothing
        },
      )
    },
    onCreateClick() {
      const optimizer = this.getDefaultOptimizer()
      this.$refs.settingDialog.doSetting(optimizer).then(
        res => {
          const optimizers = []
          this.optimizers.forEach(temp => {
            optimizers.push(temp)
          })
          // Determines whether the array has the same object
          this.optimizers = this.isPush(optimizers, res)
        },
        res => {
          // Do nothing
        },
      )
    },
    isPush(arr, obj) {
      let isPush = true
      arr.forEach(item => {
        if (Utils.objectEquals(item, obj)) {
          isPush = false
        }
      })
      if (isPush) {
        arr.push(obj)
      }
      return arr
    },
    getDefaultOptimizer() {
      const optimizer = {}
      OptimizerDefine.optimizers.forEach(option => {
        optimizer[option.key] = {}
        option.params.forEach(param => {
          optimizer[option.key][param.key] = param.defaultValue
        })
        if (option.default) {
          optimizer.type = option.key
        }
      })
      return optimizer
    },
  },
}
</script>
<style>
.optimizer-editor .el-tag + .el-tag {
  margin-left: 10px;
}

.optimizer-editor .el-tag {
  cursor: pointer;
}

.optimizer-editor .new-optimizer-button {
  margin-left: 6px;
}
</style>
