<template>
  <div class="b-w p-20 height--100">
    <div class="">
      <a-select
        v-model:value="selectedTimeDefalut"
        style="float: right; z-index: 10"
        size="small"
        @change="
          () => {
            $emit('onJobTimeChange', selectedTimeDefalut)
          }
        ">
        <a-select-option v-for="item in selectTimeOptions" :key="item.value" :value="item.value">
          {{ $t('Time.Select.' + item.label) }}
        </a-select-option>
      </a-select>
      <a-select
        v-model:value="jobQueueDefalut"
        class="dashboard-queue"
        size="small"
        @change="
          () => {
            $emit('onJobQueueChange', jobQueueDefalut)
          }
        ">
        <a-select-option v-for="item in initJobQueueData" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
      <span class="dashboard-card-title">{{ $t('Dashboard.Job.Chart.Title') }}</span>
    </div>
    <div id="tid_dashboard-job-chart" ref="container" style="width: 100%; height: 100%; min-height: 200px" />
  </div>
</template>
<script>
import Format from '@/common/format'
import DashboardService from '@/service/dashboard-monitor'
export default {
  inject: ['resize'],
  props: ['initData'],
  emits: ['onJobTimeChange', 'onJobQueueChange'],
  data() {
    return {
      innerChart: null,
      jobQueueDefalut: '',
      initJobQueueData: [{ label: this.$t('All'), value: '' }],
      selectedTimeDefalut: 3600,
      selectTimeOptions: [
        { label: 'Hour', value: 3600 },
        { label: 'Day', value: 3600 * 24 },
        { label: 'Week', value: 3600 * 24 * 7 },
        { label: 'Month', value: 3600 * 24 * 30 },
      ],
    }
  },
  watch: {
    initData(val, oldVal) {
      this.init()
    },
    resize(val) {
      this.onResize()
    },
  },
  mounted() {
    this.$nextTick(() => {
      DashboardService.getJobChartQueue().then(res => {
        res.forEach(item => {
          this.initJobQueueData.push({
            label: item.name,
            value: item.name,
          })
        })
      })
      this.$chart.init(this.$refs.container, window.gApp.echartsTheme.jobStatus)
      if (this.initData) {
        this.init()
      }
    })
  },
  methods: {
    onResize() {
      this.$chart.getInstanceByDom(this.$refs.container).resize()
    },

    init() {
      if (this.initData) {
        const data = {
          data: {
            waiting: [],
            running: [],
          },
          time: [],
        }
        this.initData.forEach(item => {
          data.data.waiting.push(item.waiting)
          data.data.running.push(item.running)
          data.time.push(Format.formatDateTime(item.time))
        })
        this.draw(data)
      }
    },
    draw(data) {
      const $this = this
      const option = {
        tooltip: {
          trigger: 'axis',
          fontFamily: 'Micsoft Yahei',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
          textStyle: {
            fontWeight: 'normal',
          },
        },
        legend: {
          top: '20px',
          right: '20px',
          fontFamily: 'Micsoft Yahei',
          data: (function (data) {
            const legend = []
            for (const key in data) {
              legend.push($this.$t('Dashboard.JobChart.Status.' + key.replace('_', '')))
            }
            return legend
          })(data.data),
        },

        grid: {
          top: '50px',
          left: '3%',
          right: '6%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            axisLabel: {
              fontFamily: 'Micsoft Yahei',
              formatter: function (value, index) {
                return value.split(' ')[0] + '\n' + value.split(' ')[1]
              },
              // rotate: -45
            },
            data: data.time,
          },
        ],
        yAxis: [
          {
            type: 'value',
            minInterval: 1,
            axisLabel: {
              fontFamily: 'Micsoft Yahei',
            },
          },
        ],
        series: (function (data) {
          const series = []
          for (let key in data) {
            key = key.replace('_', '')
            series.push({
              name: $this.$t('Dashboard.JobChart.Status.' + key),
              type: 'line',
              stack: 'occupied',
              areaStyle: {},
              data: data[key],
            })
          }
          return series
        })(data.data),
      }
      this.$chart.getInstanceByDom(this.$refs.container).setOption(option)
    },
  },
}
</script>

<style scoped>
.dashboard-queue {
  margin-right: 10px;
  float: right;
  z-index: 10;
  width: 150px;
}
</style>
