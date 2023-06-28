<template>
  <div v-if="showclusterStatus" class="clusterstatus">
    <a-popover
      placement="right"
      overlay-class-name="cluster-popover"
      trigger="hover"
      @visibleChange="updateDurationTime"
      @hide="clearFreshDurationTime()">
      <template slot="content">
        <ul class="clusterstatus-popover-ul" style="width: 250px">
          <li class="clusterstatus-item">
            <div class="cluster-popover-tips">
              <span class="cluster-text">{{ $t('Cluster.Update.DurationTime', { durationTime: durationTime }) }}</span>
              <a-popover placement="right" overlay-class-name="cluster-popover" trigger="hover" visible-arrow>
                <p slot="content" class="cluster-text cluster-tips">
                  <a-icon type="info-circle" class="m-r-10 cluster-text" />
                  <span class="cluster-text">{{ $t('Cluster.Update.Tips') }}</span>
                </p>
                <a-icon type="sync" class="cluster-refresh-icon" @click="refreshStatus" />
              </a-popover>
            </div>
          </li>
          <li class="clusterstatus-item">
            <a-popover
              v-if="sheduler != 'active'"
              placement="right"
              overlay-class-name="cluster-popover"
              trigger="hover">
              <p slot="content" class="cluster-text cluster-tips">
                {{ getDisplayErrorMessage(shedulerMessage) }}
              </p>
              <div class="cluster-popover-tips">
                <i
                  v-if="sheduler == 'inactive' && !clusterStatusLoading[0]"
                  class="cluster-status-icon cluster-refresh-icon status-error" />
              </div>
            </a-popover>
            <div class="cluster-popover-tips">
              <span class="cluster-text">{{ $t('Cluster.Sheduler') }}</span>
              <a-icon v-if="clusterStatusLoading[0]" type="loading" class="cluster-refresh-icon" />
              <i
                v-if="sheduler == 'active' && !clusterStatusLoading[0]"
                class="cluster-status-icon cluster-refresh-icon status-normal" />
            </div>
          </li>
          <li class="clusterstatus-item">
            <div class="cluster-popover-tips">
              <a-popover
                v-if="parallel != 'active'"
                placement="right"
                overlay-class-name="cluster-popover"
                trigger="hover">
                <p slot="content" class="cluster-text cluster-tips">
                  {{ getDisplayErrorMessage(parallelMessage) }}
                </p>
                <i
                  v-if="parallel == 'inactive' && !clusterStatusLoading[1]"
                  class="cluster-status-icon cluster-refresh-icon status-error" />
              </a-popover>
              <span class="cluster-text">{{ $t('Cluster.ParallelFileSystem') }}</span>
              <a-icon v-if="clusterStatusLoading[1]" type="loading" class="cluster-refresh-icon" />
              <i
                v-if="parallel == 'active' && !clusterStatusLoading[1]"
                class="cluster-status-icon cluster-refresh-icon status-normal" />
              <a-tooltip>
                <template slot="title">
                  {{ $t('Action.Deploy') }}
                </template>
                <a-icon
                  v-if="fmRestartShow && !clusterStatusLoading[1]"
                  type="play-circle"
                  class="cluster-refresh-icon"
                  @click="deployFM" />
              </a-tooltip>
            </div>
          </li>
        </ul>
      </template>
      <div v-if="isMinMenu" class="clusterstatus-cont">
        <i class="clusterstatus-statusmin" :class="getStatusClass([sheduler, parallel])" />
      </div>
      <div v-else class="clusterstatus-cont">
        <a-col :span="20" class="clusterstatus-title">
          {{ clusterName }}
        </a-col>
        <a-col :span="4" class="clusterstatus-statusmax">
          <i :class="getStatusClass([sheduler, parallel])" />
        </a-col>
      </div>
    </a-popover>
  </div>
</template>
<script type="text/javascript">
import Format from './../common/format'
import AccessService from './../service/access'
import MonitorService from './../service/monitor-data'
import FileManagerService from './../service/file-manager'

export default {
  data() {
    return {
      isMinMenu: window.gApp.isCollapse,
      notStaff: this.$store.state.auth.access !== 'staff',
      sheduler: '',
      parallel: '',
      shedulerMessage: '',
      parallelMessage: '',
      refreshTimeout: null,
      freshDurationTimerId: null,
      refreshInterval: 300000,
      updateTime: 0,
      durationTime: 0,
      clusterStatusLoading: [false, false],
      fmRestartShow: false,
      arch: AccessService.getSchedulerArch(),
    }
  },
  computed: {
    showclusterStatus: function () {
      if (!AccessService.getMatchFeatureCodes(['monitor.scheduler'], this.$store.state.auth.featureCodes).length > 0)
        return false

      if (this.arch === 'host' && this.notStaff) {
        return true
      }
      return false
    },
    clusterName() {
      return this.$store.state.auth.clusterName
    },
  },
  mounted() {
    const _this = this
    window.gApp.$watch('isCollapse', function (newValue, oldValue) {
      _this.isMinMenu = newValue
    })
    window.gApp.$on('refreshClusterStatus', this.init)
    this.init()
  },
  beforeDestroy() {
    window.gApp.$off('refreshClusterStatus', this.init)
    clearTimeout(this.refreshTimeout)
  },
  methods: {
    init() {
      clearTimeout(this.refreshTimeout)
      MonitorService.getClusterStatus()
        .then(res => {
          this.sheduler = res.shedulerStatus
          this.parallel = res.fileSystemStatus
          this.shedulerMessage = res.shedulerMessage
          this.parallelMessage = res.fileSystemMessage
          this.updateTime = new Date().getTime()
          this.fmRestartShow = false
          this.clusterStatusLoading = [false, false]
        })
        .catch(_ => {})
      if (this.showclusterStatus) {
        this.refreshTimeout = setTimeout(() => {
          this.init()
        }, this.refreshInterval)
      }
    },
    getStatusClass(status) {
      if (status.includes('inactive')) {
        return 'status-error'
      } else if (status.includes('active')) {
        return 'status-normal'
      } else {
        return ''
      }
    },
    updateDurationTime() {
      if (this.updateTime === 0) {
        this.durationTime = '--'
        return false
      }
      this.durationTime = Format.formatDurationTime(new Date().getTime() - this.updateTime)
      this.freshDurationTimerId = setTimeout(() => {
        this.updateDurationTime()
      }, 1000)
    },
    clearFreshDurationTime() {
      clearTimeout(this.freshDurationTimerId)
    },
    refreshStatus() {
      this.clusterStatusLoading = [true, true]
      clearTimeout(this.refreshTimeout)
      this.init()
    },
    getDisplayErrorMessage(message) {
      switch (message) {
        case 'WORKSPACE_ACCESS_ERROR':
          return this.$t('Cluster.Status.Error.WorkspaceAccess')
        case 'FS_ERROR':
          return this.$t('Cluster.Status.Error.Filesystem')
        case 'SCHEDULER_ERROR':
          return this.$t('Cluster.Status.Error.Scheduler')
        case 'USRE_INFO_ERROR':
          return this.$t('Cluster.Status.Error.UserInfo')
        default:
          return this.$t('Cluster.Status.Error.Default')
      }
    },
    deployFM() {
      this.clusterStatusLoading[1] = true
      FileManagerService.createFileManager()
        .then(res => {
          this.$message.success(this.$t('Admin.FileManager.Deploying'))
          this.fmRestartShow = false
          this.clusterStatusLoading[1] = true
        })
        .catch(err => {
          this.clusterStatusLoading[1] = false
          this.$message.error(err)
        })
    },
  },
}
</script>
<style media="screen">
.clusterstatus {
  flex: 0 0 auto;
  width: 100%;
  height: 50px;
  /* background-color: #343c4a; */
  /* color: #fff; */
}
.clusterstatus-cont {
  width: 100%;
  height: 100%;
}
.clusterstatus-title {
  line-height: 50px;
  text-indent: 1.8em;
}
.clusterstatus-statusmin {
  display: block;
  width: 16px;
  height: 16px;
  position: relative;
  top: 17px;
  left: 32px;
}
.clusterstatus-statusmax i {
  float: right;
  width: 5px;
  height: 25px;
  margin-top: 10px;
  margin-right: 5px;
}
.cluster-popover .ant-popover-inner-content {
  border-radius: 5px;
  padding: 0;
}
.clusterstatus-popover-ul {
  padding: 10px 0;
}
.cluster-popover-tips {
  padding: 2px 0 5px 20px;
}
.cluster-refresh-icon {
  float: right;
  margin-top: 3px;
  margin-right: 20px;
}
.cluster-status-icon {
  display: inline-block;
  width: 5px;
  height: 15px;
}
.cluster-popover .cluster-tips {
  width: 200px;
  padding: 10px;
  border-radius: 5px;
  font-style: normal;
}
</style>
