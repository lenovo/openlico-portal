<template>
  <div class="dev-tools-table height--100 p-10">
    <div class="height--100 p-20 b-w">
      <a-spin :spinning="loading" style="height: 100%">
        <a-row>
          <a-col :span="12">
            <span class="cloud-tools-project">{{ $t('CloudTools.Project') }}</span>
            <a-select v-model="defaultValue" class="antionsButton">
              <div slot="dropdownRender" slot-scope="menu">
                <v-nodes :vnodes="menu" />
                <a-divider style="margin: 4px 0" />
                <div
                  style="padding: 4px 8px; cursor: pointer; color: #449fff"
                  @mousedown="e => e.preventDefault()"
                  @click="createProject">
                  {{ $t('CloudTools.Workspace.Create.Title') }}
                </div>
              </div>
              <a-select-option
                v-for="item in workspaceType"
                :key="item.id"
                :value="item.name"
                @click="selectValue(item)">
                {{ item.name }}
              </a-select-option>
            </a-select>
            <span class="cloud-tools-settings" @click="projectSettingClick">{{ $t('CloudTools.Settings') }}</span>
          </a-col>
        </a-row>
        <a-row class="m-t-20">
          <div v-for="item in workspaceInfo" :key="item.id" class="create-job-box">
            <img :src="`/api/template/jobtemplates/${item.code}/logo/`" :alt="item.name" />
            <div class="box-title">
              {{ item.name }}
            </div>
            <div class="box-status">
              <cloudtools-status-label :status="item.status" />
            </div>
            <div v-if="item.status == 'running' && item.gpus == 0" class="box-cores">{{ item.cores }} cores</div>
            <div v-if="item.status == 'running' && item.gpus > 0" class="box-cores">
              {{ item.cores }} cores | {{ item.gpus }} gpus
            </div>
            <div v-if="item.status !== 'running'" class="box-cores" />
            <div v-if="item.status == 'running'" class="box-time">
              {{ item.time }}
            </div>
            <div v-if="item.status !== 'running'" class="box-time" />
            <div class="box-button">
              <a-button class="launch" :disabled="item.launchStatus" type="primary" @click="launchButton(item, $event)">
                <p
                  v-if="
                    item.status == 'running' ||
                    item.status == 'queueing' ||
                    item.status == 'cancelling' ||
                    item.status == 'suspending'
                  ">
                  {{ launchText }}
                </p>
                <p v-else>
                  {{ $t('CloudTools.Launch') }}
                </p>
              </a-button>
              <a-button
                v-if="
                  item.status == 'running' ||
                  item.status == 'cancelling' ||
                  item.status == 'queueing' ||
                  item.status == 'suspending'
                "
                type="primary"
                icon="poweroff"
                :disabled="item.closeStatus"
                class="poweroff"
                @click="closeButton(item)" />
            </div>
            <div class="box-setting" @click="settingButton(item)">
              <a-tooltip placement="rightTop">
                <template #title>
                  <span>{{ $t('CloudTools.Settings') }}</span>
                </template>
                <i class="el-erp-Setting" />
              </a-tooltip>
            </div>
            <div class="box-share" @click="shareButton(item)">
              <a-tooltip placement="rightTop">
                <template #title>
                  <span>{{ $t('CloudTools.Share') }}</span>
                </template>
                <i class="el-erp-Share" />
              </a-tooltip>
            </div>
          </div>
        </a-row>
        <a-row class="dev-tools-table-footer">
          <a-col :span="24" style="text-align: right">
            <a-pagination
              v-model="pagination.current"
              class="totalStyle"
              size="small"
              show-quick-jumper
              :page-size-options="pagination.pageSizeOptions"
              :page-size.sync="pagination.pageSize"
              :total="pagination.total"
              :show-total="pagination.showTotal" />
          </a-col>
        </a-row>
      </a-spin>
      <div>
        <a-modal class="waitBox" :visible="waitLoading" width="300px" :closable="false" @cancel="waitCancel">
          <template slot="footer">
            <a-button type="primary" @click="waitCancel">
              {{ okText }}
            </a-button>
          </template>
          <div style="text-align: center">
            <img src="/static/img/system/main/wait.gif" alt="" />
          </div>
          <h2 style="text-align: center; font-size: 16px; color: #999">
            {{ ModalText }}
          </h2>
        </a-modal>
      </div>
      <div>
        <a-modal
          class="shareBox"
          :visible="shareLoading"
          width="600px"
          :title="$t('CloudTools.Share.Title')"
          :cancel-text="$t('CloudTools.Share.Close')"
          :ok-button-props="{ style: { display: 'none' } }"
          @cancel="shareCloseButton">
          <p class="share-title">
            {{ $t('CloudTools.Share.Url') }}
          </p>
          <div class="share-url">
            {{ urlValue }}
          </div>
          <a-button type="primary" class="testCopy" :disabled="copyDisabled" @click="copyButton">
            {{ $t('CloudTools.Share.Copy') }}
          </a-button>
        </a-modal>
      </div>
      <cloudtools-create-dialog
        ref="cloudtoolsCreateDialog"
        @createSonCloudGetProjects="createSonCloudGetProjects"
        @createSonCloudGetProjectsInfo="createSonCloudGetProjectsInfo" />
      <cloudtools-setting-dialog
        ref="cloudtoolsSettingDialog"
        @setSonCloudGetProjectsInfo="setSonCloudGetProjectsInfo"
        @editSonCloudGetProjectsInfo="editSonCloudGetProjectsInfo" />
      <cloud-tools-close-dialog id="tid_job-manange-action-dialog" ref="cloudToolsCloseDialog" />
    </div>
  </div>
</template>
<script>
import CloudToolsService from '../service/cloud-tools'
import JobService from '../service/job'
import Format from '../common/format'
import CloudtoolsStatusLabel from './cloud-tools/cloudtools-status-label'
import CloudtoolsSettingDialog from './cloud-tools/cloudtools-setting-dialog.vue'
import CloudToolsCloseDialog from '../widget/cloud-tools-close-dialog'
import CloudtoolsCreateDialog from './cloud-tools/cloudtools-create-dialog.vue'
export default {
  components: {
    'cloudtools-create-dialog': CloudtoolsCreateDialog,
    'cloudtools-status-label': CloudtoolsStatusLabel,
    'cloudtools-setting-dialog': CloudtoolsSettingDialog,
    'cloud-tools-close-dialog': CloudToolsCloseDialog,
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes,
    },
  },
  data() {
    return {
      loading: false,
      refreshTimeout: null,
      refreshJobRun: null,
      refreshInterval: 15000,
      defaultValue: '',
      workspaceType: [
        {
          id: null,
          name: '',
        },
      ],
      workspaceInfo: [],
      pagination: {
        total: 0,
        pageSizeOptions: ['10', '20', '40', '50'],
        pageSize: 10,
        defaultCurrent: 1,
        current: 1,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: total =>
          this.$t('CompositeTable.Footer.Total', {
            total,
          }),
      },
      projectAllInfo: {},
      firstCallFlag: true,
      postCloudtoolsResId: '',
      waitText: '',
      launchText: this.$t('CloudTools.Open'),
      waitLoading: false,
      shareLoading: false,
      urlValue: '',
      copyDisabled: false,
      waitShow: true,
      ModalText: this.$t('CloudTools.Please.Wait'),
      okText: this.$t('CloudTools.Not.Wait'),
      onceLaunchId: '',
      pendingStatus: true,
    }
  },
  watch: {
    urlValue: {
      deep: true,
      immediate: true,
      handler(newV) {
        this.copyDisabled = !(newV.length > 0)
      },
    },
  },
  beforeDestroy() {
    clearTimeout(this.refreshTimeout)
    clearTimeout(this.refreshJobRun)
    this.refreshTimeout = null
    this.refreshJobRun = null
    this.pendingStatus = false
  },
  mounted() {
    this.init()
  },
  methods: {
    waitCancel() {
      this.waitLoading = false
      this.waitShow = false
      this.waitText = ''
      this.pendingStatus = true
      clearTimeout(this.refreshJobRun)
      this.refreshJobRun = null
    },
    createProject() {
      this.$refs.cloudtoolsCreateDialog.doCreate().then(
        res => {
          this.getProjectList(res)
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    projectSettingClick() {
      this.$refs.cloudtoolsCreateDialog.doSetting(this.projectAllInfo).then(
        res => {
          this.getProjectList(res)
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    getProjectList(res) {
      CloudToolsService.getProject().then(
        projectRes => {
          this.workspaceType = projectRes
          this.cloudGetProjectsInfo(res.id)
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    selectValue(res) {
      sessionStorage.setItem('projectId', res.id)
      sessionStorage.setItem('projectName', res.name)
      this.loading = true
      this.cloudGetProjectsInfo(res.id, 1)
    },
    cloudGetProjects() {
      CloudToolsService.getProject().then(
        res => {
          this.workspaceType = res
          if (Object.keys(this.workspaceType).length > 0) {
            this.defaultValue = sessionStorage.getItem('projectName')
            this.cloudGetProjectsInfo(this.workspaceType[0].id, 1)
          } else {
            this.loading = true
            const req = {
              name: 'default',
              workspace: 'MyFolder',
              environment: 'MyFolder/.lico_env',
            }
            CloudToolsService.postProject(req).then(
              res => {
                this.workspaceType = [
                  {
                    id: res.id,
                    name: res.name,
                  },
                ]
                this.defaultValue = res.name
                this.cloudGetProjectsInfo(res.id, 1)
              },
              err => {
                this.$message.error(err)
                this.loading = false
              },
            )
          }
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    cloudGetProjectsInfo(id, selectTrue) {
      let cloudProjectId = ''
      if (sessionStorage.getItem('projectId') !== 'undefined' && sessionStorage.getItem('projectId') !== null) {
        cloudProjectId = sessionStorage.getItem('projectId')
        this.workspaceType.forEach((item, index) => {
          if (cloudProjectId === item.id) {
            this.defaultValue = item.name
          }
        })
      } else {
        cloudProjectId = this.workspaceType[0].id
        this.defaultValue = this.workspaceType[0].name
      }
      CloudToolsService.getProjectInfo(cloudProjectId).then(
        res => {
          this.projectAllInfo = res
          this.pagination.total = this.projectAllInfo.tools.length
          const workspaceInfo = this.projectAllInfo.tools.map(item => {
            return {
              project_id: this.projectAllInfo.id,
              tool_id: item.id,
              name: item.name,
              code: item.code,
              job: item.instance.job,
              id: item.instance.job,
              setting_params: item.setting_params.split(','),
              settings: item.settings,
              instance: item.instance,
              job_template: item.job_template,
              entrance_uri: item.instance.entrance_uri,
              status: 'unknown',
              toolItem: '',
            }
          })
          const promiseList = []
          workspaceInfo.forEach((item, index) => {
            if (item.job) {
              promiseList[index] = new Promise((resolve, reject) => {
                JobService.getJobById(item.job, false).then(
                  res => {
                    item.status =
                      res.status === 'cancelled' ||
                      res.status === 'unknown' ||
                      res.status === 'createfailed' ||
                      res.status === 'completed'
                        ? 'unknown'
                        : res.status
                    item.cores = res.numberOfCpuCores
                    item.gpus = res.numberOfGpus
                    item.launchStatus = !!(
                      res.status === 'cancelling' ||
                      res.status === 'queueing' ||
                      res.status === 'suspending'
                    )
                    item.closeStatus = res.status === 'cancelling'
                    item.time = Format.formatDuration.call(this, res.runDuration)
                    if (this.onceLaunchId === res.id && res.status === 'createfailed') {
                      this.onceLaunchId = -1
                      this.$message.error(this.$t('CloudTools.Start.Failed'))
                    }
                    resolve(res)
                  },
                  err => {
                    console.log('Cloud Tools' + '(' + item.code + ') ' + 'job' + '(' + item.job + '):' + err)
                    item.status = 'unknown'
                    this.loading = false
                    resolve()
                  },
                )
              })
            }
          })
          Promise.all(promiseList).then(values => {
            this.workspaceInfo = workspaceInfo
            if (selectTrue) {
              this.init()
              this.loading = false
            } else {
              this.init()
            }
          })
        },
        err => {
          this.$message.error(err)
          this.loading = false
          this.createSonCloudGetProjects()
        },
      )
    },
    launchButton(res, event) {
      this.waitText = event.currentTarget.innerText
      if (res.settings.is_initialized) {
        if (!Object.keys(res.instance).length && !Object.keys(res.settings).length) {
          this.$refs.cloudtoolsSettingDialog.launchInfo(res).then(doCreateRes => {})
        } else if (res.status === 'running') {
          this.waitLoading = true
          this.waitShow = true
          if (this.waitText === this.$t('CloudTools.Open')) {
            this.pendingStatus = true
            if (res.entrance_uri) {
              this.getUrlTrue(res.entrance_uri)
            } else {
              this.getInstanceId(res.instance.id)
            }
          }
        } else if (
          (!Object.keys(res.instance).length && Object.keys(res.settings).length) ||
          (Object.keys(res.instance).length && Object.keys(res.settings).length)
        ) {
          this.loading = true
          const cloudtoolsrId = {
            project_id: res.project_id,
            tool_id: res.tool_id,
          }
          this.getHandCloudtools(cloudtoolsrId)
        } else if (res.status === 'completed' || res.status === 'failed') {
          this.loading = false
        }
      } else {
        this.$refs.cloudtoolsSettingDialog.launchInfo(res).then(doCreateRes => {})
      }
    },
    settingButton(res) {
      this.$refs.cloudtoolsSettingDialog.launchInfo(res).then(
        res => {},
        err => {
          this.$message.error(err)
        },
      )
    },
    shareButton(res) {
      const req = {
        project_id: res.project_id,
        tool_id: res.tool_id,
      }
      CloudToolsService.postShareUrl(req).then(
        res => {
          this.urlValue = location.origin + res.url
        },
        err => {
          this.$message.error(err)
        },
      )
      this.shareLoading = true
    },
    shareCloseButton() {
      this.shareLoading = false
      this.urlValue = ''
    },
    copyButton() {
      const copyStr = this.urlValue
      const oInput = document.createElement('input')
      oInput.value = copyStr
      document.body.appendChild(oInput)
      oInput.select()
      const copyResult = document.execCommand('copy')
      document.body.removeChild(oInput)
      if (copyResult) {
        this.copyDisabled = true
        setTimeout(() => {
          this.copyDisabled = false
        }, 3000)
        this.$message.success(this.$t('CloudTools.Share.Clipboard'))
      } else {
        this.$message.error(this.$t('CloudTools.Share.Clipboard'))
      }
    },
    getHandCloudtools(cloudtoolsreq) {
      CloudToolsService.postCloudtools(cloudtoolsreq).then(
        postCloudtoolsRes => {
          JobService.getJobById(postCloudtoolsRes.job).then(resJobById => {
            this.onceLaunchId = resJobById.id
            if (resJobById.status === 'createfailed' || resJobById.status === 'completed') {
              this.cloudGetProjectsInfo(this.projectAllInfo.id, 1)
            } else {
              this.postCloudtoolsResId = postCloudtoolsRes.id
              this.cloudGetProjectsInfo(this.projectAllInfo.id, 1)
            }
          })
        },
        err => {
          this.$message.error(err)
          this.loading = false
        },
      )
    },
    getInstanceId(id) {
      CloudToolsService.getInstance(id).then(
        resInstance => {
          JobService.getJobById(resInstance.job).then(resJobStatus => {
            if (resJobStatus.status === 'completed' || resJobStatus.status === 'createfailed') {
              this.waitLoading = false
            } else {
              if (resInstance.entrance_uri) {
                this.getUrlTrue(resInstance.entrance_uri)
              } else {
                this.refreshJobRun = setTimeout(() => {
                  this.getInstanceId(id)
                }, this.refreshInterval)
              }
            }
          })
        },
        err => {
          this.$message.error(err)
          this.waitLoading = false
        },
      )
    },
    getUrlTrue(url) {
      CloudToolsService.getWorkspaceStatus(url).then(
        urlRes => {
          if (urlRes === 'ready') {
            if (this.waitShow) {
              window.open(window.location.origin + url)
              this.waitLoading = false
              this.waitShow = false
            }
          } else {
            this.refreshJobRun = setTimeout(() => {
              this.getUrlTrue(url)
            }, this.refreshInterval)
          }
        },
        () => {
          this.refreshJobRun = setTimeout(() => {
            this.getUrlTrue(url)
          }, this.refreshInterval)
        },
      )
    },
    closeButton(item) {
      this.$refs.cloudToolsCloseDialog.doClose(item).then(res => {
        this.loading = true
        if (res.id) {
          this.cloudGetProjectsInfo(item.project_id, 1)
        }
      })
    },
    init() {
      if (!this.refreshTimeout) {
        if (this.firstCallFlag) {
          this.cloudGetProjects()
          this.firstCallFlag = false
        } else {
          this.refreshTimeout = setTimeout(() => {
            this.refreshTimeout = null
            this.cloudGetProjectsInfo(this.projectAllInfo.id)
          }, this.refreshInterval)
        }
      }
    },
    createSonCloudGetProjects() {
      sessionStorage.setItem('projectId', this.workspaceType[0].id)
      sessionStorage.setItem('projectName', this.workspaceType[0].name)
      this.loading = true
      this.cloudGetProjects()
    },
    createSonCloudGetProjectsInfo(val) {
      sessionStorage.setItem('projectId', val.id)
      sessionStorage.setItem('projectName', val.name)
      this.defaultValue = val.name
      this.cloudGetProjectsInfo(val.id)
    },
    setSonCloudGetProjectsInfo(val) {
      this.cloudGetProjectsInfo(val.project.id)
      const cloudtoolsrId = {
        project_id: val.project.id,
        tool_id: val.tool.id,
      }
      this.loading = true
      this.getHandCloudtools(cloudtoolsrId)
    },
    editSonCloudGetProjectsInfo(val) {
      this.cloudGetProjectsInfo(val)
    },
  },
}
</script>

<style lang="less" scoped>
.dev-tools-table .workspace-logo img {
  width: 120px;
  height: 90px;
  border: 1px solid rgb(238, 238, 238);
}
.workspace-info-title {
  margin-top: 20px;
}
.dev-tools-table-footer div:first-child .ant-pagination-item,
.dev-tools-table-footer div:first-child .ant-pagination-prev,
.dev-tools-table-footer div:first-child .ant-pagination-next {
  display: none;
}
.textAlighRight {
  text-align: left;
}
.cloud-tools-project {
  font-size: 14px;
  font-family: Arial;
  font-weight: 600;
}
.cloud-tools-settings {
  font-size: 14px;
  font-family: Arial;
  color: #449fff;
  cursor: pointer;
}
.antionsButton {
  margin: 0 10px;
  width: 200px;
  text-align: left;
}
.create-job-box {
  width: 200px;
  height: 250px;
  background: #ffffff;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  float: left;
  margin-right: 24px;
  text-align: center;
  position: relative;
  margin-bottom: 24px;
}
.create-job-box img {
  width: 100%;
  height: 100px;
}
.box-title {
  font-family: Arial;
  font-style: normal;
  font-weight: normal;
  height: 16px;
  line-height: 16px;
  font-size: 14px;
  color: #333;
  margin: 12px 0 8px 0;
}
.box-status {
  height: 14px;
}
.box-cores {
  margin: 8px 0 8px 0;
  height: 14px;
}
.box-time {
  margin-bottom: 12px;
  height: 14px;
}
.box-button .launch {
  width: 72px;
}
.box-button .poweroff {
  margin-left: 12px;
}
.box-setting {
  position: absolute;
  top: 5px;
  right: 15px;
  cursor: pointer;
  width: 10px;
  height: 10px;
  /deep/ .ant-tooltip-inner {
    min-width: 50px;
  }
}
.box-setting .anticon {
  color: #666;
}
.box-share {
  position: absolute;
  top: 5px;
  right: 40px;
  cursor: pointer;
  width: 10px;
  height: 10px;
  /deep/ .ant-tooltip-inner {
    min-width: 50px;
  }
}
.waitBox {
  /deep/ .ant-modal-footer {
    text-align: center;
  }
  /deep/ .ant-btn-primary {
    width: 100px;
  }
  /deep/ .ant-modal-footer {
    border-top: 1px solid #fff;
  }
  /deep/ .ant-modal-body {
    padding: 16px 0 0 0;
  }
}
.shareBox {
  .share-title {
    font-weight: 600;
  }
  .share-url {
    width: 100%;
    border: 1px solid #ccc;
    min-height: 100px;
    padding: 5px 10px;
    margin: 10px 0;
    word-break: break-all;
  }
}
.totalStyle {
  overflow: hidden;
  /deep/ .ant-pagination-total-text {
    float: left;
  }
}
</style>
