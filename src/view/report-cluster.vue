<template>
  <div class="report-cluster">
    <!-- filter -->
    <a-row class="b-w m-10 p-20">
      <report-cluster-filter v-model="filters" @filter-change="onFilterChange" />
    </a-row>

    <a-row v-if="summaryData && resourceData">
      <!-- summary -->
      <a-col :span="12">
        <report-cluster-summary :data="summaryData" />
      </a-col>
      <!-- resource -->
      <a-col :span="12">
        <report-cluster-resource :data="resourceData" />
      </a-col>
    </a-row>
    <!-- trend chart -->
    <a-row v-if="trendChartData" class="b-w m-10 p-20">
      <report-cluster-trend :data="trendChartData" />
    </a-row>
    <!-- time chart -->
    <a-row v-if="timeChartData" class="b-w m-10 m-t-20 p-20">
      <report-cluster-time :data="timeChartData" />
    </a-row>

    <a-row>
      <!-- time distribution chart -->
      <a-col v-if="timeDistributionData" :span="12" style="position: relative">
        <report-cluster-time-distribution :data="timeDistributionData" />
      </a-col>
      <!-- resource map chart -->
      <a-col v-if="resourceMapData" :span="12" style="position: relative">
        <report-cluster-resource-map :data="resourceMapData" />
      </a-col>
    </a-row>
    <div v-if="isNoData" class="cluster-nodata b-w m-10 p-20">
      <div style="margin-top: 100px">
        <img src="/static/img/system/main/nodata.png" />
      </div>
      <p style="color: rgb(204, 204, 204); font-size: 16px">
        {{ $t('No.Data') }}
      </p>
    </div>
  </div>
</template>
<script>
import ReportClusterService from './../service/report-cluster'
import ReportClusterFilter from './report-cluster/report-cluster-filter'
import ReportClusterSummary from './report-cluster/report-cluster-summary'
import ReportClusterResource from './report-cluster/report-cluster-resource'
import ReportClusterTime from './report-cluster/report-cluster-time'
import ReportClusterTrend from './report-cluster/report-cluster-trend'
import ReportClusterResourceMap from './report-cluster/report-cluster-resource-map'
import ReportClusterTimeDistribution from './report-cluster/report-cluster-time-distribution'

export default {
  components: {
    'report-cluster-filter': ReportClusterFilter,
    'report-cluster-summary': ReportClusterSummary,
    'report-cluster-resource': ReportClusterResource,
    'report-cluster-trend': ReportClusterTrend,
    'report-cluster-time': ReportClusterTime,
    'report-cluster-time-distribution': ReportClusterTimeDistribution,
    'report-cluster-resource-map': ReportClusterResourceMap,
  },
  data() {
    return {
      filters: null,
      summaryData: null,
      resourceData: null,
      trendChartData: null,
      timeChartData: null,
      timeDistributionData: null,
      resourceMapData: null,
      isNoData: false,
    }
  },
  watch: {
    filters(val, oldVal) {
      this.onPreview(val)
    },
  },
  methods: {
    onFilterChange() {
      this.summaryData = null
      this.resourceData = null
      this.trendChartData = null
      this.timeChartData = null
      this.timeDistributionData = null
      this.resourceMapData = null
    },
    onPreview(filters) {
      const apiList = [
        ReportClusterService.getCluserOver(filters),
        ReportClusterService.getClusterTrend(filters),
        ReportClusterService.getClusterTime(filters),
        ReportClusterService.getClusterDistribution(filters),
      ]
      Promise.all(apiList).then(
        res => {
          this.isNoData = !(res[0] && res[1] && res[2] && res[3])
          this.summaryData = res[0]
          this.resourceData = res[0]
          this.trendChartData = res[1]
          this.timeChartData = res[2]
          this.timeDistributionData = res[3]
          this.resourceMapData = res[3]
        },
        err => {
          this.$message.error(err)
        },
      )
    },
  },
}
</script>
<style>
.cluster-nodata {
  text-align: center;
  height: 400px;
  /* margin-top: 100px; */
}
</style>
