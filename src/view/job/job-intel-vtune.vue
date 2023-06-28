<template>
  <div v-if="show" class="job-intel-vtune">
    <a-spin :spinning="loading">
      <a-row v-if="data.help.length" class="job-intel-item">
        <a-alert type="info" show-icon style="width: 100%; color: #0798f1; padding-left: 50px">
          <p slot="icon" style="font-size: 16px">
            <a-icon type="question-circle" />
          </p>
          <p slot="message" style="color: #0798f1">
            {{ $t('Help') }}
          </p>
          <div slot="description">
            <template v-for="item in data.help">
              <p v-if="item == 'command'" :key="item" class="job-intel-vtune-command">{{ data.command }}</p>
              <p v-else-if="item" :key="item">
                {{ item }}
              </p>
            </template>
          </div>
        </a-alert>
      </a-row>
      <a-row class="job-intel-item">
        <span class="intel-item-label">{{ $t('JobDetail.Intel.Tool') }}</span>
        <span class="intel-item-content">{{ toolMap[data.tool] }}</span>
      </a-row>
      <a-row v-if="data.tool == 'vtune_profiler'" class="job-intel-item">
        <span class="intel-item-label">{{ $t('JobDetail.Intel.VTuneType') }}</span>
        <span class="intel-item-content">{{ vtuneTypeMap[data.vtuneType] }}</span>
      </a-row>
      <a-row v-show="data.result.length > 0" class="job-intel-item">
        <span class="intel-item-label">{{ $t('JobDetail.Intel.Result') }}</span>
        <div class="intel-item-content">
          <div v-for="(item, index) in data.result" :key="item[0] + index" class="intel-item-result">
            <span class="intel-item-result-path">{{ item[0] }}</span>
            <span class="intel-item-result-action">
              <a-button v-if="data.tool != 'tac'" type="link" @click="onViewClick(item[2])">{{
                $t('Action.View')
              }}</a-button>
              <a-button type="link" @click="onDownloadClick(item[2])">{{ $t('Action.Download') }}</a-button>
            </span>
          </div>
        </div>
      </a-row>
      <a-row class="job-intel-item">
        <span class="intel-item-label" />
        <span class="intel-item-content">
          <a-button v-if="vtune" type="link" @click="onGotoVTune">{{ $t('JobDetail.Intel.ToVTune') }}</a-button>
          <a-button v-if="deleteBtn" type="link" style="color: red" @click="onDeleteClick">{{
            $t('JobDetail.Intel.ClearData')
          }}</a-button>
        </span>
      </a-row>
    </a-spin>
  </div>
  <div v-else style="height: 200px; text-align: center; padding-top: 80px">
    {{ $t('No.Data') }}
  </div>
</template>
<script>
import IntelService from '../../service/intel-analyzer'

export default {
  props: ['job'],
  data() {
    return {
      data: {
        tool: this.job.req.params.parameters.intel_analyzer,
        vtuneType: this.job.req.params.parameters.vtune_analysis_type,
        result: [],
        toolData: [],
        help: [],
        command: '',
      },
      helpMap: IntelService.HelpKeysMap,
      toolMap: IntelService.IntelAnalysisToolsMap,
      vtuneTypeMap: IntelService.IntelAnalysisToolTypeMap,
      token: this.$store.state.auth.token,
      show: Boolean(),
      loading: false,
    }
  },
  computed: {
    vtune() {
      return this.data.tool === 'vtune_profiler' && this.deleteBtn
    },
    deleteBtn() {
      return Boolean(this.data.toolData.length)
    },
  },
  methods: {
    onViewClick(path) {
      IntelService.previewAnalysisResult(this.job.id, path.split('/').pop())
    },
    onDownloadClick(path) {
      IntelService.downloadAnalysisResult(path)
      // .then(res => {
      //     // Do nothing
      // }, err => {
      //     this.$message.error(err);
      // })
    },
    onDeleteClick(e, msg = '') {
      let message = msg
      if (this.show) {
        if (['vtune_profiler'].includes(this.data.tool)) {
          message += this.$t('JobDetail.Intel.Help.vtune_profiler.3')
        }
        if (['tac', 'advisor'].includes(this.data.tool)) {
          message += this.$t('JobDetail.Intel.Help.advisor.4')
        }
      }
      this.$confirm({
        title: message + ' ' + this.$t('JobDetail.Intel.ClearData.Confirm'),
        centered: true,
        okText: this.$t('Action.Yes'),
        cancelText: this.$t('Action.No'),
        onOk: () => {
          this.deleteAnalysisData()
        },
      })
    },
    onGotoVNC() {
      const params = this.processTemplateParams()
      this.$router.push(`/main/job-template-ex/tigervnc${params}`)
    },
    onGotoVTune() {
      // let params = this.processTemplateParams([], {
      //     "data_directory": this.data.toolData[0][0]
      // });
      // this.$router.push(`/main/job-template-ex/vtune${params}`);

      this.loading = true
      const data = {
        id: this.job.id,
        dataDirectory: this.data.toolData[0][0],
      }

      IntelService.getVTuneUrl(data)
        .then(
          res => {
            if (res.redirect_url) {
              window.open(res.redirect_url)
            }
          },
          err => {
            this.$message.error(err)
          },
        )
        .finally(() => {
          this.loading = false
        })
    },
    getJobIntelResult() {
      IntelService.getIntelAnalyzerById(this.job.id).then(
        res => {
          const data = this.data
          const type = this.data.tool
          const { result, dataFiles, command } = res
          const help = this.helpMap[type].map((key, index) => {
            if (this.vtuneTypeMap[data.vtuneType] === 'Platform Profiler') {
              if (index !== 0) {
                return key === 'command' ? key : key - 1 + '. ' + this.$t(`JobDetail.Intel.Help.${type}.${key}`)
              } else {
                return ''
              }
            }
            return key === 'command' ? key : key + '. ' + this.$t(`JobDetail.Intel.Help.${type}.${key}`)
          })
          this.data = { ...data, result, toolData: dataFiles, help, command }
          this.show = res.show
          if (!this.show && dataFiles.length) {
            this.onDeleteClick('', this.$t('JobDetail.Intel.Analysis.Error'))
          }
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    deleteAnalysisData() {
      const pathList = this.data.toolData.map(i => i[2])
      IntelService.deleteAnalysisData(pathList).then(
        res => {
          this.$message.success(this.$t('JobDetail.Intel.Clear.Success'))
          this.data.toolData = []
        },
        err => {
          this.$message.error(err || this.$t('JobDetail.Intel.Clear.Error'))
        },
      )
    },
    processTemplateParams(jobParamsList = [], params = {}) {
      let args = {}
      const paramsList = ['job_workspace', 'runtime_id'].concat(jobParamsList)
      const jobParams = this.job.req.params.parameters
      paramsList.forEach(i => {
        args[i] = jobParams[i]
      })
      args = { ...args, ...params }
      return `/?params_string=${JSON.stringify(args)}`
    },
  },
}
</script>
<style scoped>
.job-intel-item {
  display: flex;
  /* margin-bottom: 1px; */
  /* height: 32px; */
  line-height: 32px;
}
.intel-item-label {
  display: inline-block;
  width: 150px;
}
.intel-item-content {
  /* display: inline-block; */
  color: #333333;
}
.intel-item-content > :first-child {
  padding-left: 0;
}
.intel-item-result-path {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.job-intel-vtune-command {
  white-space: break-spaces;
  padding-left: 25px;
}
</style>
