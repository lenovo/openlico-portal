<template>
  <div class="">
    <a-form-model-item :label="$t('JobTemplate.Parameters.Min.Value')" prop="minValue">
      <a-input id="tid_jobTemplate-parameter-minValue" v-model="formParam.minValue" @change="minValueFunction" />
    </a-form-model-item>
    <a-form-model-item :label="$t('JobTemplate.Parameters.Max.Value')" prop="maxValue">
      <a-input id="tid_jobTemplate-parameter-maxValue" v-model="formParam.maxValue" @change="maxValueFunction" />
    </a-form-model-item>
    <a-form-model-item :label="$t('JobTemplate.Parameters.Float.Length')" prop="floatLength">
      <a-input id="tid_jobTemplate-parameter-floatLength" v-model="formParam.floatLength" />
    </a-form-model-item>
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
