<template>
  <div class="">
    <a-form-item :label="$t('JobTemplate.Parameters.Min.Value')" name="minValue">
      <a-input v-model:value="formParam.minValue" @change="minValueFunction" />
    </a-form-item>
    <a-form-item :label="$t('JobTemplate.Parameters.Max.Value')" name="maxValue">
      <a-input v-model:value="formParam.maxValue" @change="maxValueFunction" />
    </a-form-item>
    <a-form-item :label="$t('JobTemplate.Parameters.Float.Length')" name="floatLength">
      <a-input v-model:value="formParam.floatLength" />
    </a-form-item>
  </div>
</template>
<script>
export default {
  props: ['formParameter', 'formRules', 'maxValueFunction', 'minValueFunction'],
  data() {
    return {
      formParam: this.formParameter,
    }
  },
}
</script>

<style></style>
