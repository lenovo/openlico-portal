<template>
  <div id="Job_Detail_Container" class="p-10">
    <div v-if="job != null">
      <a-row class="inner-box b-w">
        <job-info-banner :job="job" :arch="arch">
          <a-dropdown id="Job_Action_Select" slot="controller" :trigger="['click']">
            <a-menu slot="overlay" @click="({ key }) => onActionCommand(key)">
              <a-menu-item v-for="i in actionOptions" :key="i.value" :disabled="i.value == 'NoAction'">
                {{ i.label }}
              </a-menu-item>
            </a-menu>
            <a-button style="margin-left: 8px">
              {{ $t('Action') }}
              <a-icon type="down" />
            </a-button>
          </a-dropdown>
        </job-info-banner>
      </a-row>
      <a-row class="inner-box b-w">
        <a-tabs id="Job_Detail_Tabs" v-model="defaultDisplay" :animated="false" class="job-detail-tab">
          <a-tab-pane key="log" :tab="$t('JobDetail.Monitor')" style="padding-left: 10px; padding-right: 10px">
            <job-log-viewer ref="jobLogViewer" :job="job"> </job-log-viewer>
          </a-tab-pane>
          <a-tab-pane
            v-if="isShowVNC"
            key="vnc"
            :tab="$t('JobDetail.VNC')"
            style="padding-left: 10px; padding-right: 10px">
            <job-vnc ref="jobVNC" :job="job" />
          </a-tab-pane>
          <a-tab-pane
            v-if="isShowProcessTab"
            key="process"
            :tab="$t('Monitor.Process')"
            style="padding-left: 10px; padding-right: 10px">
            <job-process ref="jobProcess" :is-gpus="job.numberOfGpus" :job="job" />
          </a-tab-pane>
          <a-tab-pane
            v-if="isShowResourceTab"
            key="resource"
            :tab="$t('Monitor.Resource')"
            style="padding-left: 10px; padding-right: 10px">
            <job-resource ref="jobResource" :job="job" />
          </a-tab-pane>
          <a-tab-pane v-if="isShowCpuTab" key="cpu" :tab="$t('Job.Cpu')">
            <job-monitor-cpu ref="monitorCpu" :job="job"> </job-monitor-cpu>
          </a-tab-pane>
          <a-tab-pane v-if="isShowGpuTab" key="gpu" :tab="$t('Job.Gpu')">
            <job-monitor-gpus ref="monitorGpus" :job="job"> </job-monitor-gpus>
          </a-tab-pane>
          <a-tab-pane
            v-if="job.jobFilename"
            key="jobFile"
            :tab="$t('JobDetail.JobFile')"
            style="padding-left: 10px; padding-right: 10px">
            <job-file-viewer :job="job"></job-file-viewer>
          </a-tab-pane>
          <a-tab-pane
            v-if="isShowTensorboard"
            key="tensorboard"
            :tab="$t('JobDetail.Tensorboard')"
            style="padding-left: 10px; padding-right: 10px">
            <job-tensorboard :job="job" :arch="arch"> </job-tensorboard>
          </a-tab-pane>
          <a-tab-pane
            v-if="isIntelvTuneJob"
            key="intel"
            :tab="$t('JobDetail.IntelvTune')"
            style="padding-left: 10px; padding-right: 10px">
            <job-intel-vtune ref="intelvTune" :job="job" />
          </a-tab-pane>
          <a-tab-pane v-if="isShowDebugTab" key="Debug" :tab="$t('Monitor.Remotely.Debug')">
            <job-remotely-debug ref="jobRemotelyDebug" :job="job" />
          </a-tab-pane>
          <a-tab-pane
            key="information"
            :tab="$t('JobDetail.Information')"
            style="padding-left: 10px; padding-right: 10px">
            <job-infomation :detail-information="null" :job="job" @refresh-job="refreshJob" />
          </a-tab-pane>
        </a-tabs>
      </a-row>
    </div>
    <job-action-dialog ref="jobActionDialog" />
    <file-manager-dialog ref="fileManagerDialog" />
    <job-error-message-dialog id="tid_job-manange-error-message-dialog" ref="jobErrorMessageDialog" />
  </div>
</template>

<script>
import JobService from '../service/job'
import AccessService from '../service/access'
import JobLogViewer from './job/job-log-viewer'
import JobInfoBanner from './job/job-info-banner'
import JobTensorboard from './job/job-tensorboard'
import JobFileViewer from './job/job-file-viewer'
import JobInfomation from './job/job-infomation'
import JobMonitorCpu from './job/job-monitor-cpu'
import JobMonitorGpus from './job/job-monitor-gpus'
import JobProcess from './job/job-process'
import JobRemotelyDebug from './job/job-remotely-debug'
import JobResource from './job/job-resource'
import JobActionDialog from '../widget/job-action-dialog'
import FileManagerDialog from '../component/file-manager-dialog'
import ErrorMessageDialog from './job-manage/job-error-message-dialog'
import JobIntelVtune from './job/job-intel-vtune.vue'
import JobVnc from './job/job-vnc.vue'
export default {
  components: {
    'job-info-banner': JobInfoBanner,
    'job-log-viewer': JobLogViewer,
    'job-tensorboard': JobTensorboard,
    'job-file-viewer': JobFileViewer,
    'job-monitor-gpus': JobMonitorGpus,
    'job-monitor-cpu': JobMonitorCpu,
    'job-action-dialog': JobActionDialog,
    'file-manager-dialog': FileManagerDialog,
    'job-error-message-dialog': ErrorMessageDialog,
    'job-infomation': JobInfomation,
    'job-process': JobProcess,
    'job-remotely-debug': JobRemotelyDebug,
    'job-resource': JobResource,
    JobIntelVtune,
    JobVnc,
  },
  data() {
    return {
      jobId: 0,
      job: null,
      access: this.$store.state.auth.access,
      featureCodes: this.$store.state.auth.featureCodes,
      defaultDisplay: 'log',
      actionOptions: [],
      arch: AccessService.getSchedulerArch(),
      autoRefreshInterval: 30 * 1000,
      autoRefreshTimerId: 0,
      task_map_job: null,
      availableMetrics: this.$store.state.auth.availableMetrics.split(',') || [],
      jobStatusMap: JobService.JobWebStatusEnums,
      refresh: true,
    }
  },
  computed: {
    isShowTensorboard() {
      if (typeof this.job.realType === 'string') {
        if (
          (!this.job.realType.includes('modelzoo') && this.job.realType.includes('tensorflow')) ||
          (this.job.realType.indexOf('letrain_') === 0 && !this.job.type.split('_').includes('export'))
        ) {
          return true
        }
      }
      return false
    },
    isShowGpuTab() {
      const show = false
      return show
    },
    isShowCpuTab() {
      const show = false
      return show
    },
    isSaveable() {
      return ['completed', 'cancelled'].indexOf(this.job.status) >= 0
    },
    isShowProcessTab() {
      let show = false
      if (AccessService.getMatchFeatureCodes('monitor.cluster', this.featureCodes).length > 0) {
        show = this.arch === 'host' && this.job && this.job.status === 'running'
      }
      return show
    },
    isShowDebugTab() {
      let show = false
      if (AccessService.getMatchFeatureCodes('monitor.cluster', this.featureCodes).length > 0) {
        show =
          this.arch === 'host' &&
          this.job &&
          this.job.status === 'running' &&
          this.job.req &&
          this.job.req.params &&
          this.job.req.params.parameters &&
          this.job.req.params.parameters.intel_analyzer === 'None' &&
          this.job.req.params.parameters.remotely_debug &&
          this.job.req.params.parameters.remotely_debug !== 'None'
      }
      return show
    },
    isShowResourceTab() {
      let show = false
      if (AccessService.getMatchFeatureCodes('monitor.cluster', this.featureCodes).length > 0) {
        show = this.job && this.job.status === 'running'
      }
      return show
    },
    isIntelvTuneJob() {
      const { status, req } = this.job
      return (
        status === 'completed' &&
        req &&
        req.params &&
        req.params.parameters.intel_analyzer &&
        req.params.parameters.intel_analyzer !== 'None'
      )
    },
    isShowVNC() {
      return this.job.type === 'ansys_pre_post' && ['r', 'c'].includes(this.job.state)
    },
  },
  watch: {
    '$route.params.id'(val, oldVal) {
      this.jobId = parseInt(val)
      this.refreshJob()
    },
    defaultDisplay(val, oldVal) {
      this.$nextTick(() => {
        if (val === 'gpu' && this.$refs.monitorGpus) {
          this.$refs.monitorGpus.autoResize()
        }
        if (val === 'cpu' && this.$refs.monitorCpu) {
          this.$refs.monitorCpu.autoResize()
        }
        if (val === 'log') {
          this.$refs.jobLogViewer.initJobLog()
        }
        if (val === 'job-monitor') {
          this.$refs.jobMonitor.resizeChildrenChart()
        }
        if (val === 'intel') {
          this.$refs.intelvTune.getJobIntelResult()
        }
      })
    },
  },
  mounted() {
    this.jobId = parseInt(this.$route.params.id)
    this.refreshJob()
  },
  beforeDestroy() {
    if (this.autoRefreshTimerId > 0) {
      clearTimeout(this.autoRefreshTimerId)
    }
  },
  methods: {
    refreshJob() {
      if (this.autoRefreshTimerId > 0) {
        clearTimeout(this.autoRefreshTimerId)
      }
      this.initJob(this.jobId, 'log')
    },
    initJob(jobid, defaultDisplay) {
      JobService.getJobById(jobid).then(
        res => {
          this.job = res
          if (
            (this.defaultDisplay === 'gpu' || this.defaultDisplay === 'cpu' || this.defaultDisplay === 'resource') &&
            this.job.status !== 'running'
          ) {
            this.defaultDisplay = defaultDisplay
          }
          this.initJobAction()
          if (this.autoRefreshInterval > 0 && !this.jobStatusMap.finished.includes(this.job.status)) {
            const self = this
            this.autoRefreshTimerId = setTimeout(self.refreshJob, this.autoRefreshInterval)
          }
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    async initJobAction() {
      const actions = await JobService.getJobActions(
        this.access,
        this.job.operateStatus,
        this.job.status,
        this.job.type,
        this.job.errmsg,
      )
      const deleteIndex = actions.indexOf('Delete')
      if (deleteIndex !== -1) {
        // remove delete action
        actions.splice(deleteIndex, 1)
      }
      const commentIndex = actions.indexOf('Comment')
      if (commentIndex !== -1) {
        // remove comment action
        actions.splice(commentIndex, 1)
      }
      if (actions.length <= 0) actions.push('NoAction')
      this.actionOptions = actions.map(a => {
        return {
          value: a,
          label: this.$t(`Action.${a}`),
        }
      })
    },
    onActionCommand(command) {
      if (command === 'Browse') {
        this.onBrowseClick()
      }
      if (command === 'Cancel') {
        this.onCancelClick()
      }
      if (command === 'Rerun') {
        this.onRerunClick()
      }
      if (command === 'Copy') {
        this.onCopyClick()
      }
      if (command === 'Errmsg') {
        this.onErrMessageClick()
      }
    },
    onBrowseClick() {
      const event = new Event('onMainToolsVisible')
      event.workspace = this.job.workingDirectory
      event.visible = true
      window.dispatchEvent(event)
    },
    onCancelClick() {
      this.$refs.jobActionDialog.doCancel(this.job).then(
        res => {
          this.refreshJob()
          window.gApp.updateImmediate = true
        },
        _ => {
          this.refreshJob()
        },
      )
    },
    onRerunClick() {
      this.$refs.jobActionDialog.doRerun(this.job).then(
        res => {
          this.$router.push({ path: '/main/job/' + res.id })
          window.gApp.updateImmediate = true
        },
        res => {
          // Do nothing
        },
      )
    },
    onCopyClick() {
      this.$router.push({
        path: '/main/job-template-ex/copy/' + this.job.id,
      })
    },
    onErrMessageClick() {
      this.$refs.jobErrorMessageDialog.showErrorMessage(this.job)
    },
  },
}
</script>

<style>
.inner-box {
  border-radius: 2px;
  margin-bottom: 20px;
}

.job-detail-tab {
  padding: 5px 20px;
  overflow: inherit !important;
}
</style>
