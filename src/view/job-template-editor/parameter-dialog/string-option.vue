<template>
  <div class="">
    <a-form-item :label="$t('JobTemplate.Parameters.Max.Length')" name="maxLength">
      <a-input
        v-model:value="formParam.maxLength"
        :disabled="getDisabledStatus ? getDisabledStatus('maxLength') : false" />
    </a-form-item>
    <a-form-item :label="$t('JobTemplate.Parameters.Invalid')" name="Invalid">
      <a-select v-model:value="formParam.invalid" :disabled="getDisabledStatus ? getDisabledStatus('invalid') : false">
        <a-select-option v-for="item in invalidOption" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
  </div>
</template>
<script>
export default {
  props: ['formParameter', 'formRules', 'getDisabledStatus'],
  data() {
    return {
      invalid: ['none', 'default', 'phone', 'email'],
      invalidOption: [],
      formParam: this.formParameter,
    }
  },
  mounted() {
    this.invalidOption = this.processSelectOption(this.invalid)
  },
  methods: {
    processSelectOption(arr) {
      const array = []
      arr.forEach(item => {
        array.push({
          label: this.$t(`JobTemplate.Parameters.Invalid.${item}`),
          value: item,
        })
      })
      return array
    },
  },
}
</script>

<style lang="css"></style>
