<template>
  <div class="job-parameters-affinity-advanced">
    <a-row class="job-parameters-affinity-advanced-title">
      <a-col :span="10">
        {{ $t('JobTemplate.Affinity.Advanced.Parameters') }}
      </a-col>
      <a-col :span="10">
        {{ $t('JobTemplate.Affinity.Advanced.Value') }}
      </a-col>
      <a-col :span="4" class="affinity-advanced-action" style="padding-left: 10px">
        {{ $t('Action') }}
      </a-col>
    </a-row>
    <a-row v-for="(item, index) in value" :key="index" class="job-parameters-affinity-advanced-content m-t-10 m-b-10">
      <a-col :span="10" class="p-r-20">
        <a-input
          v-model="item.name"
          :class="{ 'affinity-advanced-error': !item.name && item.value }"
          :placeholder="!item.name && item.value ? $t('JobTemplate.Affinity.Advanced.Parameters.Message') : ''"
          :read-only="type == 'openmp' && index == 0"
          @change="onValueChange" />
      </a-col>
      <a-col :span="10" class="p-r-20">
        <a-input v-model="item.value" @change="onValueChange" />
      </a-col>
      <a-col :span="4" class="affinity-advanced-action">
        <a-button :disabled="disabledRemove(index)" type="link" @click="onRemoveEnv(index)">
          {{ $t('Action.Remove') }}
        </a-button>
      </a-col>
    </a-row>
    <a-row class="job-parameters-affinity-advanced-content m-t-10 m-b-10">
      <a-col :span="20" />
      <a-col :span="4" class="affinity-advanced-action">
        <a-button type="link" @click="onAddEnv()">
          {{ $t('Action.Add') }}
        </a-button>
      </a-col>
    </a-row>
  </div>
</template>
<script>
export default {
  props: ['value', 'type'],
  methods: {
    onAddEnv() {
      const data = this.value
      data.push({
        name: '',
        value: '',
      })
      this.$emit('input', data)
    },
    onRemoveEnv(index) {
      const data = this.value.filter((el, i) => i !== index)
      this.$emit('input', data)
    },
    onValueChange() {
      const result = this.value.filter(i => !i.name && i.value)
      if (result.length > 0) {
        this.$emit('submitStatus', false)
      } else {
        this.$emit('submitStatus', true)
      }
    },
    disabledRemove(i) {
      if (this.type === 'openmp') {
        return i === 0
      }
      if (this.type === 'intelmpi') {
        return this.value.length <= 1
      }
      return true
    },
  },
}
</script>
<style>
.affinity-advanced-error {
  border: 1px solid red !important;
}
.affinity-advanced-action {
  text-align: center;
}
</style>
