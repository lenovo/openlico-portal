<template>
  <div class="job-info-banner">
    <a-row style="height: 32px; line-height: 32px">
      <a-col :span="12" class="job-info-name" style="display: flex; width: 70%">
        <a-popover placement="topLeft">
          <template #content>
            <p class="job-name">
              {{ job.name }}
            </p>
          </template>
          <span id="Job_Info_Banner_Name" class="job-info-banner-name">{{ job.name }}</span>
        </a-popover>
        <div id="Job_Info_Banner_Status" class="job-info-banner-more">
          <job-status-label
            :arch="arch"
            :status="job.status"
            :operate-status="job.operateStatus"
            :ai-operate-status="job.aiOperateStatus" />
        </div>
      </a-col>
      <a-col :span="12" align="right" style="width: 30%">
        <div class="job-title-action">
          <slot name="controller" />
        </div>
      </a-col>
    </a-row>
    <a-row class="job-info-banner-split" />
    <a-row class="job-info-banner-subtitle" type="flex">
      <a-col :span="4" flex="auto" align="left">
        <span class="job-info-title">{{ $t('JobDetail.Template') }}</span>
      </a-col>
      <a-col :span="3" flex="auto" align="left">
        <span class="job-info-title">{{ $t('JobDetail.NumberOfCpuCores') }} / {{ $t('JobDetail.NumberOfNodes') }}</span>
      </a-col>
      <a-col v-if="job.numberOfGpus > 0" :span="2" flex="auto" align="left">
        <span class="job-info-title">{{ $t('Job.Gpu') }}</span>
      </a-col>
      <a-col :span="4" flex="auto" align="left">
        <span class="job-info-title">{{ $t('JobDetail.Queue') }} / {{ $t('Job.SchedulerId') }}</span>
      </a-col>
      <a-col :span="4" flex="auto" align="left">
        <span class="job-info-title">{{ $t('JobDetail.Submit.Time') }}</span>
      </a-col>
      <a-col
        v-if="jobStatusMap.waiting.includes(job.status) && scheduler == 'slurm'"
        :span="4"
        flex="auto"
        align="left">
        <span class="job-info-title">{{ $t('Job.BeginTime.waiting') }}</span>
      </a-col>
      <a-col v-if="jobStatusMap.finished.includes(job.status)" :span="4" flex="auto" align="left">
        <span class="job-info-title">{{ $t('JobDetail.End.Time') }}</span>
      </a-col>
      <a-col v-if="!jobStatusMap.waiting.includes(job.status)" :span="3" flex="auto" align="left">
        <span class="job-info-title">{{ $t('JobDetail.WallDuration') }}</span>
      </a-col>
    </a-row>
    <a-row type="flex" class="job-info-banner-values">
      <a-col :span="4" flex="auto" align="left" style="overflow: hidden; text-overflow: ellipsis">
        <span :title="jobDisplayType">{{ jobDisplayType || '&nbsp;' }}</span>
      </a-col>
      <a-col :span="3" flex="auto" align="left">
        <a-popover placement="bottom" :title="$t('JobDetail.ExecHosts.Title')" width="200" trigger="click">
          <template #content>
            <p>
              {{ formatExecHosts(job.execHostsDisplay) }}
            </p>
          </template>

          <a-button type="link" style="padding: 0px">
            {{ job.numberOfCpuCores }} /
            {{ job.numberOfNodes }}
          </a-button>
        </a-popover>
      </a-col>
      <a-col v-if="job.numberOfGpus > 0" :span="2" flex="auto" align="left">
        <a-popover
          ref="gpuExecPopover"
          placement="bottom"
          :title="$t('JobDetail.ExecHosts.Title')"
          width="200"
          trigger="click">
          <template #content>
            <p>
              {{ formatExecHosts(job.gpuExecHostsDisplay) }}
            </p>
          </template>

          <a-button type="link" style="padding: 0px">
            {{ job.numberOfGpus }}
          </a-button>
        </a-popover>
      </a-col>
      <a-col :span="4" flex="auto" align="left">
        <span>{{ job.queue }} / {{ job.schedulerId }}</span>
      </a-col>
      <a-col :span="4" flex="auto" align="left">
        <span>{{ formatTime(job.submitTime) }}</span>
      </a-col>
      <a-col
        v-if="jobStatusMap.waiting.includes(job.status) && scheduler == 'slurm'"
        :span="4"
        flex="auto"
        align="left">
        <span>{{ formatTime(job.beginTime) }}</span>
      </a-col>
      <a-col v-if="jobStatusMap.finished.includes(job.status)" :span="4" flex="auto" align="left">
        <span>{{ formatTime(job.finishTime) }}</span>
      </a-col>
      <a-col v-if="!jobStatusMap.waiting.includes(job.status)" :span="3" flex="auto" align="left">
        <span>{{ formatDurationTime(job.runDuration * 1000, 'day') }}</span>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import Format from '@/common/format'
import JobService from '@/service/job'
import AccessService from '@/service/access'
import JobStatusLabel from '@/widget/job-status-label.vue'
export default {
  components: {
    'job-status-label': JobStatusLabel,
  },
  props: ['job', 'arch'],
  data() {
    return {
      innerJob: this.job,
      jobStatusMap: JobService.JobWebStatusEnums,
      scheduler: AccessService.getScheduler(),
    }
  },
  computed: {
    jobDisplayType() {
      const innerKey = isNaN(this.innerJob.type) ? 'type' : 'realType'
      return this.innerJob[innerKey].replace('letrain_', '').replace('_inference', '')
    },
  },
  watch: {
    job(val, oldVal) {
      this.innerJob = val
    },
  },
  mounted() {},
  methods: {
    formatTime(time) {
      return Format.formatDateTime(time, 'yyyy-MM-dd hh:mm:ss')
    },
    formatExecHosts(hosts) {
      if (hosts === '') {
        return '-'
      }
      return hosts
    },
    formatDurationTime(duration) {
      let wallDuration = ''
      const durationTime = parseInt(duration / 1000)
      const seconds = durationTime % 60
      const minutes = ((durationTime % 3600) - (durationTime % 60)) / 60
      const hours = ((durationTime % 86400) - (durationTime % 3600)) / 3600
      const day = (durationTime - (durationTime % 86400)) / 86400

      if (day > 0) {
        wallDuration += day + this.$t('Unit.Day') + ' '
      }

      return wallDuration + format(hours) + ':' + format(minutes) + ':' + format(seconds)

      function format(time) {
        if (time < 0) {
          return '00'
        } else if (time < 10) {
          return '0' + time
        } else {
          return time
        }
      }
    },
  },
}
</script>

<style scoped>
.job-info-banner {
  padding: 20px;
  width: 100%;
}
.job-info-banner .job-info-name :deep(.ant-popover-inner) {
  max-width: 70%;
}
.job-name {
  word-break: break-all;
}
.job-info-banner-name {
  display: inline-block;
  max-width: 70%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.job-info-banner-more {
  display: inline-block;
  margin-left: 10px;
}

.job-info-banner-split {
  margin: 10px 0px 20px 0px;
  height: 1px;
}

.job-info-banner-action {
  margin-bottom: 10px;
}

.job-info-banner-subtitle {
  margin-bottom: 10px;
}
.job-title-action {
  cursor: pointer;
}
.job-info-banner-values :deep(.ant-col) {
  line-height: 32px;
}
.job-info-banner :deep(.ant-popover-title) {
  padding-bottom: 5px;
  border-bottom: 1px solid #ddd;
}
</style>
