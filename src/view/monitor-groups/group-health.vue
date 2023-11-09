<template>
  <div class="HealthContainer">
    <div>
      <a-button-group id="tid_group-health-mode-select">
        <a-button
          v-for="(item, index) in healthCategoryEnum"
          :key="index"
          :type="currentSelectedHealthCategory == item ? 'primary' : 'default'"
          :title="chartBtnTitle[item]"
          @click="onHealthActionButtonClick(item)">
          <i :class="itemBtnIcon[item]" />
        </a-button>
      </a-button-group>
    </div>
    <div class="HealthChartContent">
      <health-chart :health-category="currentSelectedHealthCategory" :group-id="groupName" />
    </div>
  </div>
</template>
<script>
import HealthChart from './group-health/health-chart.vue'
import Constants from '@/common/constants'
export default {
  components: {
    'health-chart': HealthChart,
  },
  props: ['groupName'],
  data() {
    return {
      currentSelectedHealthCategory: 'temperature',
      healthCategoryEnum: this.sortHealthCategoryEnum(Constants.DataCategoryEnums),
      itemBtnIcon: {
        load: 'el-erp-load',
        cpu: 'el-erp-cpu',
        ram: 'el-erp-memory',
        disk: 'el-erp-storage',
        network: 'el-erp-network',
        energy: 'el-erp-monitor_power',
        temperature: 'el-erp-temperature',
        job: 'el-erp-job',
      },
      chartBtnTitle: {
        load: this.$t('Monitor.Load'),
        cpu: this.$t('Monitor.Cpu'),
        ram: this.$t('Monitor.Ram'),
        disk: this.$t('Monitor.Disk'),
        network: this.$t('Monitor.Net'),
        energy: this.$t('Monitor.Ene'),
        temperature: this.$t('Monitor.Temp'),
        job: this.$t('NodeGroup.Trend.Job'),
      },
    }
  },
  methods: {
    onHealthActionButtonClick(category) {
      this.currentSelectedHealthCategory = category
    },
    sortHealthCategoryEnum(healthCategoryEnum) {
      const sortRule = {
        load: 3,
        cpu: 4,
        ram: 5,
        disk: 6,
        network: 7,
        energy: 2,
        temperature: 1,
        job: 8,
      }
      return healthCategoryEnum.sort((a, b) => sortRule[a] - sortRule[b])
    },
  },
}
</script>
<style>
.HealthContainer {
  background: #fff;
  padding: 20px;
}
.HealthChartContent {
  margin-top: 20px;
}
.HealthContainer .ant-btn [class^='el-erp'] {
  margin: 0;
}
</style>
