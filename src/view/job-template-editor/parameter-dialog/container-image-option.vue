<template>
  <div class="">
    <a-form-model-item v-if="showFramework" :label="$t('JobTemplate.Parameters.framework')" prop="framework">
      <a-select id="tid_jobTemplate-parameter-framework" v-model="formParam.framework">
        <a-select-option v-for="item in frameworkOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item
      ref="tagFormItem"
      :label="$t('JobTemplate.Parameters.FilterTags')"
      class="jobTemplate-parameter-image-tag"
      prop="tags">
      <multi-tags-input
        id="tid_image-tags"
        ref="tagInput"
        v-model="formParam.tags"
        :new-tag-button-text="$t('Action.Add')"
        :valid-roles="tagRules"
        :disabled="false" />
    </a-form-model-item>
  </div>
</template>
<script>
import MultiTagsInput from '../../../component/multi-tags-input'
import ValidRoleFactory from '../../../common/valid-role-factory'
export default {
  components: {
    'multi-tags-input': MultiTagsInput,
  },
  props: ['formParameter', 'formRules', 'showFramework'],
  data() {
    return {
      framework: [
        'tensorflow',
        'tensorflow2',
        'caffe',
        'intel-caffe',
        'mxnet',
        'neon',
        'letrain',
        'chainer',
        'pytorch',
        'scikit',
        'tensorrt',
        'paddlepaddle',
        'other',
      ],
      frameworkOptions: [],
      tagRules: [
        ValidRoleFactory.getLengthRoleForText(this.$t('JobTemplate.Parameters.FilterTags'), 3, 12),
        ValidRoleFactory.getValidIdentityNameRoleForText(this.$t('JobTemplate.Parameters.FilterTags')),
      ],
      formParam: this.formParameter,
    }
  },
  mounted() {
    this.frameworkOptions = this.processSelectOption(this.framework)
  },
  methods: {
    processSelectOption(arr) {
      const array = []
      arr.forEach(item => {
        array.push({
          label: this.$t(`Image.Framework.${item}`),
          value: item,
        })
      })
      return array
    },
  },
}
</script>

<style></style>
