<template>
  <div>
    <CompositeTable
      id="tid_job-process-table"
      ref="jobProcessTable"
      row-key="pid"
      :columns="columns"
      :table-data="tableData"
      :search-enable="true"
      :search-props="['pid', 'runProgram']"
      :page-sizes="['10', '20', '40', '50']"
      :page-size="20">
      <template #controller>
        <div class="process-controller">
          <a-select v-model:value="node" class="job-nodes-select" :show-arrow="true" show-search>
            <a-select-option v-for="item in nodesOptions" :key="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
          <a-switch v-model:checked="autoReFresh" size="small" class="switch-refresh" :loading="loading" />
          <span v-if="autoReFresh" class="refresh-text">{{
            loading
              ? $t('Monitor.Cluster.Refreshing')
              : $T('Monitor.Cluster.Refresh.Seconds.Tips', { number: reFreshSeconds })
          }}</span>
          <span v-else class="refresh-text">{{ $t(`Monitor.Cluster.${loading ? 'Refreshing' : 'AutoRefresh'}`) }}</span>
          <a-button
            :disabled="loading"
            class="fresh-button"
            style="margin-left: 10px"
            @click="switchAutoReFresh('manual')">
            {{ $t('Monitor.Cluster.Refresh') }}
          </a-button>
        </div>
      </template>
      <template #gpus="{ gpus }">
        <span v-if="!gpus.length">-</span>
        <a-popover v-else placement="right">
          <template #content>
            <p class="gpu-detail-title">GPU</p>
            <div v-for="gpu in gpus" :key="gpu.index" class="gpu-detail-item">
              <p class="gpu-detail-item-self">
                <span>{{ `#${gpu.index} ${gpu.type}` }}</span>
                <span>{{ `${gpu.util}%` }}</span>
              </p>
              <p v-for="mig in gpu.migDevs" :key="mig.index" class="gpu-detail-mig-item">
                <span>{{ `#${mig.index} ${mig.type}` }}</span>
                <span>{{ `${mig.util}%` }}</span>
              </p>
            </div>
          </template>
          <a href="javascript:;">{{ getMultiGPUValue(gpus) }}</a>
        </a-popover>
      </template>
    </CompositeTable>
  </div>
</template>

<script>
import ProcessService from '@/service/process'
import CompositeTable from '@/component/composite-table.vue'
export default {
  components: {
    CompositeTable,
  },
  props: ['isGpus', 'job'],
  data() {
    let columns = [
      {
        title: this.$t('Monitor.Process.Id'),
        dataIndex: 'pid',
        align: 'left',
        width: 120,
        sorter: true,
        show: true,
      },
      {
        title: this.$t('Monitor.Process.CPU'),
        dataIndex: 'cpu',
        sorter: true,
        defaultSortOrder: 'descend',
        show: true,
        customRender: ({ text }) => text + '%',
      },
      {
        title: this.$t('Monitor.Process.Memory'),
        dataIndex: 'memory',
        sorter: true,
        show: true,
        customRender: ({ text }) => text + '%',
      },
      {
        title: this.$t('Monitor.Process.GPU'),
        dataIndex: 'gpus',
        sorter: function (a, b) {
          let preVal = 0
          let nextVal = 0
          if (a.gpus.length) {
            preVal = a.gpuUtil
          }
          if (b.gpus.length) {
            nextVal = b.gpuUtil
          }
          return preVal - nextVal
        },
        show: this.isGpus,
        customSlot: true,
      },
      {
        title: this.$t('Monitor.Process.Runtime'),
        dataIndex: 'runTime',
        align: 'left',
        sorter: (a, b) => {
          const preVal = a.runTime.replace(/:|-/g, '') - 0
          const nextVal = b.runTime.replace(/:|-/g, '') - 0
          return preVal - nextVal
        },
        show: true,
      },
      {
        title: this.$t('Monitor.Process.RunProgram'),
        dataIndex: 'runProgram',
        width: 400,
        align: 'left',
        ellipsis: true,
        show: true,
      },
    ]
    columns = columns.filter(el => el.show)
    return {
      columns,
      tableData: [],
      node: '',
      autoReFresh: false,
      loading: false,
      reFreshSeconds: 30,
      reFreshTimer: null,
      nodesOptions: [],
    }
  },
  watch: {
    job(val, oldVal) {
      this.setNodesOptions()
    },
    autoReFresh(val, oldVal) {
      this.switchAutoReFresh(val)
    },
    node(val, oldVal) {
      if (val.length) {
        if (this.autoReFresh) {
          clearTimeout(this.reFreshTimer)
          this.reFreshSeconds = 30
          this.switchAutoReFresh(true)
        } else {
          this.autoReFresh = true
        }
      } else {
        this.tableData = []
        this.autoReFresh = false
      }
    },
  },
  created() {
    this.setNodesOptions()
  },
  mounted() {
    if (this.nodesOptions.length) {
      this.node = this.nodesOptions[0].value
    }
  },
  beforeUnmount() {
    clearTimeout(this.reFreshTimer)
  },
  methods: {
    getMultiGPUValue(val) {
      let value = null
      for (const el in val) {
        const itemValue = Number.isNaN(Number(val[el].util)) ? 0 : Number(val[el].util)
        value += itemValue
      }
      return value + '%'
    },
    switchAutoReFresh(val) {
      const that = this
      clearTimeout(this.reFreshTimer)
      this.reFreshSeconds = 30
      if (!val) return
      this.loading = true
      ProcessService.getJobProcesses(this.node, this.job.schedulerId).then(
        res => {
          this.loading = false
          this.tableData = res
          if (this.autoReFresh) {
            this.reFreshTimer = setTimeout(function fresh() {
              that.reFreshSeconds--
              if (that.reFreshSeconds <= 0) {
                that.switchAutoReFresh(true)
              } else {
                that.reFreshTimer = setTimeout(fresh, 1000)
              }
            }, 1000)
          }
        },
        err => {
          this.loading = false
          this.autoReFresh = false
          this.$message.error(err)
        },
      )
    },
    setNodesOptions() {
      const nodesOptions = []
      this.job.usedNodes.forEach(el => {
        nodesOptions.push({
          value: el,
          label: el,
        })
      })
      this.nodesOptions = nodesOptions
    },
  },
}
</script>

<style scoped>
.job-nodes-select {
  width: 240px;
}
.switch-refresh {
  margin: 0 10px;
}
.gpu-detail-title {
  margin-bottom: 10px;
}
.gpu-detail-item {
  /* display: flex; */
  /* justify-content: space-between; */
  width: 250px;
  /* margin-bottom: 6px; */
}
.gpu-detail-item p {
  display: flex;
  justify-content: space-between;
  /* width: 250px; */
  margin-bottom: 6px;
}
.gpu-detail-mig-item {
  text-indent: 1.5em;
}
.gpu-detail-item:last-child {
  margin-bottom: 0;
}
</style>
