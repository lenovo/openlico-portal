<template>
  <div class="job-tag-popover">
    <a-popover placement="right">
      <template #content>
        <div style="max-width: 350px">
          <a-tag v-for="tag in tags" :key="tag.id" style="margin: 5px">
            {{ tag.name }}
          </a-tag>
        </div>
      </template>
      <a-tag v-for="tag in displayTags" v-show="displayTags.length" :key="tag.id">
        {{ tagNameFormat(tag.name) }}
      </a-tag>
      <span v-if="showEllipsis()">...</span>
    </a-popover>
  </div>
</template>
<script>
export default {
  props: ['tags', 'displayCount', 'displayTagLength'],
  data() {
    return {
      tagNameLength: this.displayTagLength || 10,
    }
  },
  computed: {
    displayTags() {
      const tags = this.tags.filter((tag, index, arr) => index >= arr.length - this.displayCount)
      return tags.reverse()
    },
  },
  methods: {
    tagNameFormat(name) {
      if (name.length > this.tagNameLength) {
        return name.substr(0, this.tagNameLength) + '...'
      }
      return name
    },
    showEllipsis() {
      const tags = this.displayTags
      if (!tags.length) return false
      return this.tags.length > this.displayCount
    },
  },
}
</script>
<style scoped>
.job-tag-popover :deep(.ant-popover-inner-content) {
  padding: 5px;
}
</style>
