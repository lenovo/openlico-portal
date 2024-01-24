<template>
  <div class="job-resource-container">
    <div class="filter">
      <div>
        <a-radio-group v-model:value="dataType" button-style="solid" :disabled="!isGpus" @change="setOptions(dataType)">
          <a-radio-button value="cpu"> CPU </a-radio-button>
          <a-radio-button value="gpu"> GPU </a-radio-button>
        </a-radio-group>
      </div>
      <div>
        <a-dropdown-button
          v-model:open="resource_select_visible"
          class="filter-button resource-filter-button"
          :trigger="['click']"
          @click="e => e.preventDefault()">
          <template #overlay>
            <div class="resource-filter-inner b-w">
              <a-checkbox-group
                v-model:value="selectedResource"
                class="resource-filter-checkbox-group"
                :options="resourcesOptions[dataType]">
              </a-checkbox-group>
              <p class="controller-bar">
                <a-button size="small" @click="cancelSelectResource"> {{ $t('Action.Cancel') }}</a-button>
                <a-button
                  size="small"
                  type="link"
                  class="m-l-20"
                  :disabled="!selectedResource.length"
                  @click="selectResource">
                  {{ $t('Action.Confirm') }}
                </a-button>
              </p>
            </div>
          </template>
          <template #icon>
            <down-outlined />
          </template>
          <div>
            <span v-for="(item, index) in displayResources" :key="item" :class="'resource-selected' + (index + 1)">
              <span class="icon"></span>
              <span class="text">{{ getLabel(item) }}</span>
            </span>
          </div>
        </a-dropdown-button>
      </div>
    </div>
    <div>
      <div class="nodes-container">
        <div v-for="(item, index) in data" :key="index" class="node-item">
          <p class="node-name" :title="item.hostname">
            {{ item.hostname }}
            <span v-if="'gpuIndex' in item" class="gpu-index">{{ '#' + item.gpuIndex }}</span>
          </p>
          <template v-for="progress in resourcesOptions[dataType]" :key="progress.value">
            <a-popover
              v-if="displayResources.includes(progress.value)"
              overlay-class-name="hover-chart"
              destroy-tooltip-on-hide
              :align="{ points: ['tl', 'tr'] }"
              @open-change="popoverVisibleChange($event, item, progress.value)">
              <template #content>
                <a-spin :spinning="popoverLoading">
                  <div v-if="dataType == 'cpu'">
                    <p class="chart-title">
                      {{ $t('Monitor.Resource.Title.' + progress.value) }}
                    </p>
                    <p class="current-value">
                      <span
                        ><i :style="{ background: progress.historyColor[0] }"></i
                        >{{ $t('Monitor.Resource.Title.Current.Job') }}</span
                      >
                      <span class="percentage">{{ formatNumber(current[0]) }}</span>
                    </p>
                    <p class="other-value">
                      <span
                        ><i :style="{ background: progress.historyColor[1] }"></i
                        >{{ $t('Monitor.Resource.Title.Others') }}</span
                      >
                      <span class="percentage">{{ formatNumber(current[1]) }}</span>
                    </p>
                  </div>
                  <div v-else>
                    <p class="current-value">
                      <span>{{ $t('Monitor.Resource.Title.' + progress.value) }}</span>
                      <span class="percentage">{{ formatNumber(item[progress.value]) }}</span>
                    </p>
                    <p style="color: #999">{{ item.type }}</p>
                  </div>
                  <JobResourceChart
                    class="tendency-chart"
                    :color="progress.historyColor"
                    :init-data="hoverChartData"
                    :type="progress.value" />
                </a-spin>
              </template>
              <a-progress
                class="square-progress"
                stroke-linecap="square"
                :show-info="false"
                :stroke-color="progress.progressColor"
                :percent="formatNumber(item[progress.value], null)" />
            </a-popover>
            <div v-else class="placeholder-bar"></div>
          </template>
        </div>
      </div>
      <a-pagination :page-size="offset" class="pagination" size="small" :total="total" @change="pageChange" />
    </div>
  </div>
</template>

<script>
import Format from '@/common/format'
import MonitorService from '@/service/monitor-data'
import JobResourceService from '@/service/job-resource'
import JobResourceChart from './job-resource/job-resource-chart.vue'
export default {
  components: {
    JobResourceChart,
  },
  props: ['job'],
  data() {
    return {
      dataType: 'cpu',
      resource_select_visible: false,
      selectedResource: ['cpu', 'memory'],
      resourcesOptions: {
        cpu: [
          {
            label: this.$t('Monitor.Cluster.CPU'),
            value: 'cpu',
            progressColor: 'rgb(68,159,255)',
            historyColor: ['#77c6fe', '#0070b1'],
          },
          {
            label: this.$t('Monitor.Cluster.Memory'),
            value: 'memory',
            progressColor: 'rgb(26,188,156)',
            historyColor: ['#00d1bb', '#00856f'],
          },
        ],
        gpu: [
          {
            label: this.$t('Monitor.Resource.GPU'),
            value: 'gpu',
            progressColor: 'rgb(68,159,255)',
            historyColor: 'rgb(68,159,255)',
          },
          {
            label: this.$t('Monitor.Resource.GPU.Memory'),
            value: 'gmemory',
            progressColor: 'rgb(26,188,156)',
            historyColor: 'rgb(26,188,156)',
          },
        ],
      },
      displayResources: ['cpu', 'memory'],
      data: [],
      popoverLoading: false,
      loadTimer: null,
      hoverChartData: null,
      current: ['-', '-'],
      page: 1,
      offset: 20,
      total: 0,
      resource: MonitorService.execHostsDecode(this.job.execHosts),
    }
  },
  computed: {
    isGpus() {
      return this.job.numberOfGpus && !this.$store.state.auth.featureCodes.includes('mig')
    },
  },
  watch: {
    job(val, oldVal) {
      if (oldVal.jobId !== val.jobId) {
        this.page = 1
      }
      this.getData()
    },
    resource_select_visible(val, oldVal) {
      if (!val) {
        if (this.selectedResource.length) {
          this.displayResources = [...this.selectedResource]
        } else {
          this.selectedResource = [...this.displayResources]
        }
      }
    },
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      JobResourceService.getJobNodeResources(
        this.job.usedNodes,
        this.dataType,
        this.job.schedulerId,
        this.page,
        this.offset,
      ).then(
        res => {
          this.data = res.nodes
          this.total = res.total
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    selectResource() {
      this.displayResources = [...this.selectedResource]
      this.resource_select_visible = false
    },
    cancelSelectResource() {
      this.selectedResource = [...this.displayResources]
      this.resource_select_visible = false
    },
    getLabel(val) {
      for (let i = 0; i < this.resourcesOptions[this.dataType].length; i++) {
        const element = this.resourcesOptions[this.dataType][i]
        if (element.value === val) {
          return element.label
        }
      }
      return val
    },
    setOptions(val) {
      if (val === 'gpu') {
        this.selectedResource = ['gpu', 'gmemory']
        this.displayResources = ['gpu', 'gmemory']
      } else {
        this.selectedResource = ['cpu', 'memory']
        this.displayResources = ['cpu', 'memory']
      }
      this.getData()
    },
    popoverVisibleChange(visible, item, type) {
      this.hoverChartData = null
      this.current = ['-', '-']
      if (visible) {
        this.popoverLoading = true
        if (this.loadTimer) {
          clearTimeout(this.loadTimer)
        }
        this.$nextTick(() => {
          this.loadTimer = setTimeout(() => {
            if (type === 'gpu' || type === 'gmemory') {
              const category = type === 'gpu' ? 'util' : 'ram'
              const gpuIndex = item.gpuIndex.split('-').join(',')
              MonitorService.getNodeGpuDataByHour(item.hostname, gpuIndex, category)
                .then(
                  res => {
                    this.hoverChartData = { ...res, data: this.filterJobHistoryData(res.data) }
                  },
                  err => {
                    this.$message.error(err)
                  },
                )
                .finally(() => {
                  this.popoverLoading = false
                })
            } else {
              JobResourceService.getHistoryChartData(item.hostname, type, this.job.schedulerId)
                .then(
                  res => {
                    this.hoverChartData = { ...res, data: this.filterJobHistoryData(res.data) }
                    this.current = res.current
                  },
                  _ => {},
                )
                .finally(() => {
                  this.popoverLoading = false
                })
            }
          }, 500)
        })
      } else {
        this.popoverLoading = false
      }
    },
    pageChange(val) {
      this.page = val
      this.getData()
    },
    formatNumber(val, unit = '%') {
      if (val === undefined && unit) {
        return '-'
      }
      if (typeof val === 'number') {
        return Format.formatNumber(val, 1) + unit
      }
      return val
    },
    filterJobHistoryData(data) {
      if (this.job.submitTime) {
        return data.filter(i => i.time >= this.job.submitTime)
      }
      return data
    },
  },
}
</script>

<style scoped>
.filter {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
.filter-button {
  margin-right: 10px;
}
.resource-filter-inner {
  width: 180px;
  padding: 20px;
  text-align: left;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}
.filter .resource-filter-button :deep(.ant-dropdown-trigger) {
  border-radius: 4px;
  width: 100%;
}
.controller-bar {
  margin-top: 40px;
  /* overflow: hidden; */
}
.resource-filter-checkbox-group {
  display: flex;
  flex-direction: column;
}
.resource-filter-inner .controller-bar {
  text-align: right;
}
.resource-selected1,
.resource-selected2 {
  display: inline-block;
  position: relative;
}
.resource-selected1 .icon,
.resource-selected2 .icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}
.resource-selected1 {
  margin-right: 10px;
}
.resource-selected2 {
  /* margin-left: 10px; */
  margin-right: 10px;
}
.resource-selected1 .text,
.resource-selected2 .text {
  display: inline-block;
  margin-left: 16px;
}
.resource-selected1 .icon {
  background-color: #449fff;
}
.resource-selected2 .icon {
  background-color: #1abc9c;
}
.controller-bar .ant-btn {
  background-color: #fff;
  border: none;
  padding: 0;
}
.controller-bar .ant-btn:last-child {
  margin-right: 10px;
}
.resource-check-item {
  margin-bottom: 10px;
}
.resource-filter-inner .controller-bar {
  margin-top: 20px;
}
.nodes-container {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, 120px);
  grid-row-gap: 20px;
  grid-column-gap: 20px;
  overflow: auto;
  height: 500px;
}
.node-item {
  width: 120px;
  height: 100px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
  box-sizing: border-box;
}
.node-item .node-name {
  margin-bottom: 10px;
  padding-right: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
}
.square-progress :deep(.ant-progress-inner) {
  border-radius: 2px;
}
.placeholder-bar {
  width: 100%;
  height: 21px;
}
.node-item :deep(.hover-chart .ant-popover-inner-content) {
  padding: 10px;
}
.current-value,
.other-value {
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
}
.current-value .percentage,
.other-value .percentage {
  color: #000;
}
.current-value i,
.other-value i {
  display: inline-block;
  width: 11px;
  height: 11px;
  margin-right: 5px;
}
.node-item :deep(.hover-chart) {
  width: 400px;
}
.node-item :deep(.hover-chart .tendency-chart) {
  width: 100%;
  height: 150px;
}
.node-item :deep(.ant-progress-line) {
  margin-bottom: 0px;
}
.chart-title {
  margin-bottom: 8px;
}
.pagination {
  margin: 16px 0 10px 0;
}
.gpu-index {
  position: absolute;
  right: 0;
  top: 0;
  color: #999;
}
</style>
