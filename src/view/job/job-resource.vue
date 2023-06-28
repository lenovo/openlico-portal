<template>
  <div class="job-resource-container">
    <div class="filter">
      <div>
        <a-radio-group v-model="dataType" button-style="solid" :disabled="!isGpus" @change="setOptions(dataType)">
          <a-radio-button value="cpu"> CPU </a-radio-button>
          <a-radio-button value="gpu"> GPU </a-radio-button>
        </a-radio-group>
      </div>
      <div>
        <a-dropdown-button
          v-model="resource_select_visible"
          class="filter-button resource-filter-button"
          :trigger="['click']"
          @click="e => e.preventDefault()">
          <div slot="overlay" class="resource-filter-inner b-w">
            <a-checkbox-group v-model="selectedResource">
              <a-row>
                <a-col v-for="item in resourcesOptions[dataType]" :key="item.label" class="resource-check-item">
                  <a-checkbox :value="item.value">
                    {{ item.label }}
                  </a-checkbox>
                </a-col>
              </a-row>
            </a-checkbox-group>
            <p class="controller-bar">
              <a-button size="small" :disabled="!selectedResource.length" @click="selectResource">
                {{ $t('Action.Confirm') }}</a-button
              >
              <a-button size="small" @click="cancelSelectResource"> {{ $t('Action.Cancel') }}</a-button>
            </p>
          </div>
          <div slot="icon">
            <span
              v-for="(item, index) in filter.displayResources"
              :key="item"
              :class="'resource-selected' + (index + 1)">
              <span class="icon"></span>
              <span class="text">{{ getLabel(item) }}</span>
            </span>
            <a-icon type="down" />
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
          <a-popover
            v-if="filter.displayResources[0] in item"
            overlay-class-name="hover-chart"
            destroy-tooltip-on-hide
            :align="{ points: ['tl', 'tr'] }"
            @visibleChange="popoverVisibleChange($event, item, filter.displayResources[0])">
            <template slot="content">
              <a-spin :spinning="popoverLoading">
                <div v-if="dataType == 'cpu'">
                  <p class="chart-title">
                    {{ $t('Monitor.Resource.Title.' + filter.displayResources[0]) }}
                  </p>
                  <p class="current-value">
                    <span><i style="background: #77c6fe"></i>{{ $t('Monitor.Resource.Title.Current.Job') }}</span>
                    <span class="percentage">{{ formatNumber(current[0]) }}</span>
                  </p>
                  <p class="other-value">
                    <span><i style="background: #0070b1"></i>{{ $t('Monitor.Resource.Title.Others') }}</span>
                    <span class="percentage">{{ formatNumber(current[1]) }}</span>
                  </p>
                  <JobResourceChart
                    class="tendency-chart"
                    :color="['#77c6fe', '#0070b1']"
                    :init-data="hoverChartData"
                    :type="filter.displayResources[0]" />
                </div>
                <div v-else>
                  <p class="current-value">
                    <span>{{ $t('Monitor.Resource.Title.' + filter.displayResources[0]) }}</span>
                    <span class="percentage">{{ formatNumber(item[filter.displayResources[0]]) }}</span>
                  </p>
                  <p style="color: #999">{{ item.type }}</p>
                  <JobResourceChart
                    color="rgb(68,159,255)"
                    class="tendency-chart"
                    :init-data="hoverChartData"
                    :type="filter.displayResources[0]" />
                </div>
              </a-spin>
            </template>
            <a-progress
              class="square-progress"
              stroke-linecap="square"
              :show-info="false"
              stroke-color="rgb(68,159,255)"
              :percent="formatNumber(item[filter.displayResources[0]], null)" />
          </a-popover>
          <div v-else class="placeholder-bar"></div>
          <a-popover
            v-if="filter.displayResources[1] in item"
            overlay-class-name="hover-chart"
            destroy-tooltip-on-hide
            :align="{ points: ['tl', 'tr'] }"
            @visibleChange="popoverVisibleChange($event, item, filter.displayResources[1])">
            <template slot="content">
              <a-spin :spinning="popoverLoading">
                <div v-if="dataType == 'cpu'">
                  <p class="chart-title">
                    {{ $t('Monitor.Resource.Title.' + filter.displayResources[1]) }}
                  </p>
                  <p class="current-value">
                    <span><i style="background: #00d1bb"></i>{{ $t('Monitor.Resource.Title.Current.Job') }}</span>
                    <span class="percentage">{{ formatNumber(current[0]) }}</span>
                  </p>
                  <p class="other-value">
                    <span><i style="background: #00856f"></i>{{ $t('Monitor.Resource.Title.Others') }}</span>
                    <span class="percentage">{{ formatNumber(current[1]) }}</span>
                  </p>
                  <JobResourceChart
                    class="tendency-chart"
                    :color="['#00d1bb', '#00856f']"
                    :init-data="hoverChartData"
                    :type="filter.displayResources[1]" />
                </div>
                <div v-else>
                  <p class="current-value">
                    <span>{{ $t('Monitor.Resource.Title.' + filter.displayResources[1]) }}</span>
                    <span class="percentage">{{ formatNumber(item[filter.displayResources[1]]) }}</span>
                  </p>
                  <p style="color: #999">{{ item.type }}</p>
                  <JobResourceChart
                    color="rgb(26,188,156)"
                    class="tendency-chart"
                    :init-data="hoverChartData"
                    :type="filter.displayResources[1]" />
                </div>
              </a-spin>
            </template>
            <a-progress
              class="square-progress"
              stroke-linecap="square"
              :show-info="false"
              stroke-color="rgb(26,188,156)"
              :percent="formatNumber(item[filter.displayResources[1]], null)" />
          </a-popover>
          <div v-else class="placeholder-bar"></div>
        </div>
      </div>
      <a-pagination :page-size="offset" class="pagination" size="small" :total="total" @change="pageChange" />
    </div>
  </div>
</template>

<script>
import JobResourceChart from './job-resource/job-resource-chart'
import JobResourceService from '../../service/job-resource'
import MonitorService from '../../service/monitor-data'
import Format from '../../common/format'
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
          },
          {
            label: this.$t('Monitor.Cluster.Memory'),
            value: 'memory',
          },
        ],
        gpu: [
          {
            label: this.$t('Monitor.Resource.GPU'),
            value: 'gpu',
          },
          {
            label: this.$t('Monitor.Resource.GPU.Memory'),
            value: 'gmemory',
          },
        ],
      },
      filter: {
        displayResources: ['cpu', 'memory'],
      },
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
          this.filter.displayResources = [...this.selectedResource]
        } else {
          this.selectedResource = [...this.filter.displayResources]
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
      this.filter.displayResources = [...this.selectedResource]
      this.resource_select_visible = false
    },
    cancelSelectResource() {
      this.selectedResource = [...this.filter.displayResources]
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
        this.filter.displayResources = ['gpu', 'gmemory']
      } else {
        this.selectedResource = ['cpu', 'memory']
        this.filter.displayResources = ['cpu', 'memory']
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
.filter .resource-filter-button >>> .ant-dropdown-trigger {
  border-radius: 4px;
}
.controller-bar {
  margin-top: 40px;
  overflow: hidden;
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
  float: right;
  background-color: #fff;
  border: none;
  padding: 0;
}
.controller-bar .reset {
  float: left;
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
.resource-filter-button >>> .ant-btn-default:first-child {
  display: none;
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
}
.node-item .node-name {
  margin-bottom: 10px;
  padding-right: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
}
.square-progress >>> .ant-progress-inner {
  border-radius: 2px;
}
.placeholder-bar {
  width: 100%;
  height: 21px;
}
.node-item >>> .hover-chart .ant-popover-inner-content {
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
.node-item >>> .hover-chart {
  width: 400px;
}
.node-item >>> .hover-chart .tendency-chart {
  width: 100%;
  height: 150px;
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
