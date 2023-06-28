<template>
  <div v-if="current" class="image-version-tag">
    <ul v-if="current.version || current.tag.length > 0 || showImageType">
      <li v-if="showImageType" class="image-version-tag-list" :title="current.username">
        <span>{{ $t(`Image.Type.${current.username ? 'Private' : 'System'}`) }}</span>
      </li>
      <li v-if="current.version" class="image-version-tag-list"><i>&nbsp;</i>{{ 'v' + current.version }}</li>
      <li v-if="current.tag.length > 0" class="image-version-tag-list">
        <i>&nbsp;</i>
        <a-tag v-for="item in current.tag" :key="item">
          {{ item }}
        </a-tag>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  props: ['imageOptions', 'image', 'showImageType'],
  data() {
    return {}
  },
  computed: {
    current: function () {
      return this.imageOptions.filter(i => i.value === this.image)[0]
    },
  },
}
</script>
<style scoped>
.image-version-tag {
  display: inline-block;
}
.image-version-tag ul {
  display: flex;
  padding: 0 20px;
  border-radius: 4px;
  background: rgba(248, 248, 248, 1);
  color: rgba(153, 153, 153, 1);
}
.image-version-tag-list + .image-version-tag-list {
  margin-left: 20px;
}
.image-version-tag-list {
  height: 32px;
  line-height: 32px;
}
.image-version-tag .image-version-tag-list .ant-tag {
  padding: 0 10px;
}
.ant-tag + .ant-tag {
  margin-left: 10px;
}
</style>
