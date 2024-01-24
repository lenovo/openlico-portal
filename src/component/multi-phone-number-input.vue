<template>
  <div class="multi-tags-input multi-tags">
    <a-tag v-for="tag in value" :key="tag" :closable="!disabled" :close-transition="true" @close="onTagClose(tag)">
      {{ tag }}
    </a-tag>
    <a-input-group
      v-show="inputVisible && !disabled"
      compact
      :size="size"
      :class="{ 'country-code-select': size == 'small' }">
      <a-form-item-rest>
        <a-select
          v-model:value="countryCode"
          show-search
          style="width: 30%"
          :options="countries"
          :field-names="fieldNames"
          :option-filter-prop="'name'"
          @change="onCountryCodeChange">
        </a-select>
      </a-form-item-rest>
      <a-input
        ref="newTagInput"
        v-model:value="inputValue"
        style="width: 50%"
        :placeholder="$t('NotifyGroup.Mobiles')"
        @keyup.enter="onNewTagInputConfirm"
        @change="onNewTagInputConfirm" />
      <a-button :size="size" style="width: 20%" type="primary" @click="onNewTagInputConfirm">
        {{ $t('Action.Ok') }}
      </a-button>
    </a-input-group>
    <a-button
      v-show="!inputVisible && !disabled"
      id="tid_multi-phone-new"
      class="new-tag-button m-r-10"
      :size="size || 'small'"
      @click="showInput">
      {{ newTagButtonText }}
    </a-button>
    <a-button
      v-if="!inputVisible && value.length > 0 && !disabled && allowClearAll"
      id="tid_multi-phone-clean"
      class="new-tag-button"
      type="primary"
      danger
      :size="size || 'small'"
      @click="cleanTags">
      {{ $t('Action.Clear') }}
    </a-button>
    <span v-if="errorMessage.length > 0" class="form-valid-error">{{ errorMessage }}</span>
  </div>
</template>
<script>
import Schema from 'async-validator'
// import ValidRoleFactory from '@/common/valid-role-factory'
import AboutService from '@/service/about'

export default {
  props: {
    value: Array,
    newTagButtonText: {
      type: String,
      default: '+',
    },
    disabled: {
      type: Boolean,
      default: true,
    },
    allowClearAll: {
      type: Boolean,
      default: true,
    },
    size: {
      type: String,
      default: null,
    },
  },
  emits: ['input', 'update:value'],
  data() {
    return {
      // tags: [],
      inputVisible: false,
      inputValue: '',
      errorMessage: '',
      countryCode: 'US',
      countries: [],
      fieldNames: {
        label: 'name',
        key: 'countryCode',
      },
    }
  },
  created() {
    const langCode = this.$store.state.settings.langCode
    this.countryCode = langCode === 'zh' ? 'CN' : 'US'
    AboutService.getCountryCode(this.$i18n.locale).then(
      res => {
        const countries = []
        for (const key in res.countries) {
          countries.push({
            value: key,
            name: res.countries[key],
          })
        }
        this.countries = countries
      },
      err => {
        this.$message.error(err)
      },
    )
  },
  methods: {
    onCountryCodeChange(val) {
      this.onNewTagInputConfirm({ type: 'input' })
    },
    copyArray(arr) {
      const newArr = []
      arr.forEach(item => {
        newArr.push(item)
      })
      return newArr
    },
    onTagClose(tag) {
      // this.value.splice(this.value.indexOf(tag), 1);
      const newValue = this.copyArray(this.value)
      newValue.splice(newValue.indexOf(tag), 1)
      this.$emit('input', newValue)
      this.$emit('update:value', newValue)
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(() => {
        this.$refs.newTagInput.focus()
      })
    },
    cleanTags() {
      // this.value.splice(0, this.value.length);
      this.$emit('input', [])
      this.$emit('update:value', [])
    },
    onNewTagInputConfirm(e) {
      const inputValue = this.inputValue
      // const validRoles = [ValidRoleFactory.getMobileRole(this.$t('NotifyGroup.Mobiles'), this.countryCode, true)]
      const validRoles = []
      if (validRoles.length > 0 && inputValue) {
        const validator = new Schema({ phone: validRoles })
        validator.validate({ phone: inputValue }, (errors, fields) => {
          if (errors) {
            this.errorMessage = errors[0].message
          } else {
            if (e.type !== 'input') {
              this.insertTag()
            }
            this.errorMessage = ''
          }
        })
      } else {
        if (e.type !== 'input') {
          this.insertTag()
        }
        this.errorMessage = ''
      }
    },
    insertTag() {
      const inputValue = this.inputValue
      if (inputValue && this.value.indexOf(inputValue) === -1) {
        // this.value.push(inputValue);
        const newValue = this.copyArray(this.value)
        newValue.push(inputValue)
        this.$emit('input', newValue)
        this.$emit('update:value', newValue)
      }
      this.inputVisible = false
      // this.inputVisible = true;
      this.inputValue = ''
    },
    validate() {
      if (this.errorMessage.length > 0) {
        return false
      } else {
        return true
      }
    },
    cleanInput() {
      this.inputVisible = false
      this.inputValue = ''
      this.errorMessage = ''
    },
  },
}
</script>
<style>
.country-code-select div,
.country-code-select input {
  line-height: 1.5 !important;
}
</style>
