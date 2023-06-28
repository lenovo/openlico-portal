<template>
  <ul class="" style="flex-grow: 1">
    <li class="cell-top">
      <span class="cell-title" style="width: 55px">{{ $t(`Monitor.${data.type}`) }}</span>
      <span v-if="data.type != 'Net'" class="cell-rate">{{ data.util }}</span>
      <div v-else>
        <span class="cell-content-span" style="font-size: 12px">{{ `${data.in}/${$t('Unit.Second')}` }}</span>
        <i
          class="el-erp-read cell-content-icon"
          :title="$t(`Monitor.${data.type}.In`)"
          :class="getNetworkIconColor(data.in)" />
      </div>
    </li>
    <li class="cell-bottom">
      <span class="cell-logo logo-cpu">
        <i class="cell-icon" :class="`el-erp-${data.icon}`" />
      </span>
      <span v-if="data.type != 'Net'" class="cell-content cell-content-cpu" :title="getTitle()">{{
        data.display || '-'
      }}</span>
      <div v-else>
        <span class="cell-content-span" style="font-size: 12px">{{ `${data.out}/${$t('Unit.Second')}` }}</span>
        <i
          class="el-erp-write cell-content-icon"
          :title="$t(`Monitor.${data.type}.Out`)"
          :class="getNetworkIconColor(data.out)" />
      </div>
    </li>
  </ul>
</template>
<script>
export default {
  props: ['data'],
  data() {
    return {
      titleUnitMap: {
        Cpu: this.$t('Unit.CPU'),
        Gpu: this.$t('Unit.GPU'),
      },
    }
  },
  methods: {
    getNetworkIconColor(num) {
      if (parseFloat(num) > 0) {
        return 'cell-content-icon-notnull'
      } else {
        return 'cell-content-icon-null'
      }
    },
    getTitle() {
      if (!this.data.display) return ''
      if (this.titleUnitMap[this.data.type]) {
        return this.data.display + ' ' + this.titleUnitMap[this.data.type]
      }
      return this.data.display
    },
  },
}
</script>
<style scoped>
ul {
  margin: 10px;
  width: 50%;
}

li {
  display: flex;
}

li span + span,
li span + div {
  display: block;
  width: 100%;
  text-align: right;
}
.cell-title {
  display: block;
  flex-shrink: 0;
}
.cell-top {
  margin-bottom: 20px;
  height: 24px;
}
.cell-logo {
  display: block;
  flex-shrink: 0;
  width: 16px;
}
.cell-icon {
  height: 20px;
  width: 20px;
}
.cell-content-span {
  display: inline;
}
</style>
