<template>
  <div class="multi-tags-input multi-tags">
    <a-tag v-for="tag in value" :key="tag" :closable="!disabled" :close-transition="true" @close="onTagClose(tag)">
      {{ tag }}
    </a-tag>
    <a-input-group v-show="inputVisible && !disabled" compact :size="size || null">
      <a-input
        id="tid_multi-tags-input"
        ref="newTagInput"
        v-model="inputValue"
        class="new-tag-input"
        style="width: 80%"
        @change="onNewTagInputConfirm"
        @keyup.enter.native="onNewTagInputConfirm" />
      <a-button :size="size" style="width: 20%" type="primary" @click="onNewTagInputConfirm">
        {{ $t('Action.Ok') }}
      </a-button>
    </a-input-group>

    <a-button
      v-show="!inputVisible && !disabled"
      id="tid_multi-tags-new"
      class="new-tag-button m-r-10"
      :size="size || 'small'"
      @click="showInput">
      {{ newTagButtonText }}
    </a-button>
    <a-button
      v-if="!inputVisible && value.length > 0 && !disabled && allowClearAll"
      id="tid_multi-tags-clean"
      class="new-tag-button"
      :size="size || 'small'"
      type="danger"
      @click="cleanTags">
      {{ $t('Action.Clear') }}
    </a-button>
    <span v-if="errorMessage.length > 0" class="form-valid-error">{{ errorMessage }}</span>
  </div>
</template>
<script>
import Schema from 'async-validator'

export default {
  props: {
    value: Array,
    newTagButtonText: {
      type: String,
      default: '+',
    },
    validRoles: Array,
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
  data() {
    return {
      // tags: [],
      inputVisible: false,
      inputValue: '',
      errorMessage: '',
    }
  },
  methods: {
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
      this.$emit('change', newValue)
      this.$emit('tag-change')
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(() => {
        this.$refs.newTagInput.$refs.input.focus()
      })
    },
    cleanTags() {
      // this.value.splice(0, this.value.length);
      this.$emit('input', [])
      this.$emit('change', [])
      this.$emit('tag-change')
    },
    onNewTagInputConfirm(e) {
      const inputValue = this.inputValue
      const validRoles = this.validRoles
      if (validRoles) {
        const descriptor = {
          item: validRoles,
        }
        const validator = new Schema(descriptor)
        validator.validate({ item: inputValue }, (errors, fields) => {
          if (errors) {
            this.errorMessage = errors[0].message
          } else {
            this.errorMessage = ''
            if (e.type !== 'input') {
              this.insertTag()
            }
          }
        })
      } else {
        if (e.type !== 'input') {
          this.insertTag()
        }
      }
    },
    insertTag() {
      const inputValue = this.inputValue
      if (inputValue && this.value.indexOf(inputValue) === -1) {
        // this.value.push(inputValue);
        const newValue = this.copyArray(this.value)
        newValue.push(inputValue)
        this.$emit('input', newValue)
        this.$emit('change', newValue)
        this.$emit('tag-change')
      }
      this.inputVisible = false
      this.inputValue = ''
      this.errorMessage = ''
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
<style></style>
