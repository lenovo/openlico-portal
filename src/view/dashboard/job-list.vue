<template>
  <div id="tid_dashboard-joblist" class="b-w p-20 height--100">
    <a-row class="">
      <a-radio-group
        v-model="jobStatus"
        style="float: right"
        size="small"
        button-style="solid"
        @change="
          () => {
            $emit('onStatusChange', jobStatus)
          }
        ">
        <a-radio-button value="running">
          {{ $t('Dashboard.JobList.Status.running') }}
        </a-radio-button>
        <a-radio-button value="waiting">
          {{ $t(`Dashboard.JobList.Status.waiting`) }}
        </a-radio-button>
      </a-radio-group>
      <span class="dashboard-card-title">{{ $t('Dashboard.Job.List.Title') }}</span>
    </a-row>
    <div class="dashboard-joblist-title">
      <a-row class="dashboard-joblist-row">
        <span class="dashboard-joblist-line dashboard-joblist-col-left">{{ $t('Dashboard.JobList.Name') }}</span>
        <span v-if="status == 'running'" class="dashboard-joblist-line dashboard-joblist-col-right">{{
          $t('Job.RunDuration')
        }}</span>
        <span v-else class="dashboard-joblist-line dashboard-joblist-col-right">{{ $t('Job.WaitDuration') }}</span>
      </a-row>
    </div>
    <div v-if="initJobListData" class="dashboard-joblist-content">
      <a-row v-for="(item, index) in initJobListData" :key="index" class="dashboard-joblist-row">
        <span class="dashboard-joblist-line dashboard-joblist-col-left dashboard-joblist-job-name">
          <a
            href="javascript:;"
            :class="notStaff ? 'defaultCursor' : ''"
            :title="item.name"
            @click="processJobHref(item)"
            >{{ item.name }}</a
          >
        </span>
        <span class="dashboard-joblist-line dashboard-joblist-col-right">{{ item.showTime }}</span>
      </a-row>
    </div>
    <a-row class="dashboard-joblist-row" style="border: 0">
      <a
        href="javascript:;"
        class="dashboard-joblist-line dashboard-joblist-col-right dashboard-more"
        @click="onMoreClick()"
        >{{ $t('More') }}</a
      >
    </a-row>
  </div>
</template>
<script>
import Format from './../../common/format'
import JobService from './../../service/job'
import AccessService from './../../service/access'
export default {
  props: ['initData', 'status'],
  data() {
    return {
      notStaff: this.$store.state.auth.access !== 'staff',
      arch: AccessService.getSchedulerArch(),
      jobStatus: this.status,
      initJobListData: null,
      jobHref: '#/main/',
      moreHref: '#/main/job-manage/' + this.status,
    }
  },
  watch: {
    initData(val, oldVal) {
      this.init()
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      if (this.initData && this.initData !== [] && this.initData !== true) {
        this.initJobListData = []
        const status = this.status === 'running' ? 'runDuration' : 'waitDuration'
        this.initData.forEach(item => {
          item.showTime = Format.formatDuration(item[status])
          this.initJobListData.push(item)
        })
      }
    },
    processJobHref(job) {
      if (this.notStaff) {
        return
      }
      JobService.initTemplateJobFields(job).finally(() => {
        this.$router.push({ path: '/main/job/' + job.id })
      })
    },
    onMoreClick() {
      this.$router.push({ path: `/main/job-manage/${this.status}` })
    },
  },
}
</script>

<style lang="css">
.dashboard-joblist-title {
  font-weight: bold;
  font-size: 12px;
}
.dashboard-joblist-col-left {
  float: left;
}
/* .dashboard-joblist-col-left a {
    color: #666;
} */
.dashboard-joblist-col-right {
  float: right;
}
/* .dashboard-joblist-row {
    border-bottom: 1px solid #eeeeee;
} */
.dashboard-joblist-line {
  height: 32px;
  line-height: 32px;
}
.dashboard-joblist-content {
  font-size: 12px;
  /* color: #666; */
}
.defaultCursor {
  cursor: default;
}
#tid_dashboard-joblist {
  width: 100%;
}
.dashboard-joblist-job-name {
  width: 80%;
}
.dashboard-joblist-job-name a {
  width: 100%;
  height: 32px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
