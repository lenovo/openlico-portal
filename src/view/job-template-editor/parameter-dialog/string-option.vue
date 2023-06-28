<template>
  <div class="">
    <a-form-model-item :label="$t('JobTemplate.Parameters.Max.Length')" prop="maxLength">
      <a-input id="tid_jobTemplate-parameter-maxLength" v-model="formParam.maxLength" />
    </a-form-model-item>
    <a-form-model-item :label="$t('JobTemplate.Parameters.Invalid')" prop="Invalid">
      <a-select id="tid_jobTemplate-parameter-invalid" v-model="formParam.invalid">
        <a-select-option v-for="item in invalidOption" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
  </div>
</template>
<script>
export default {
  props: ['formParameter', 'formRules'],
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
