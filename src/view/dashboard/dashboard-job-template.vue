<template>
  <div id="tid_dashboard-job-template" class="dashboard-template">
    <a-row class="dashboard-template-title m-b-20">
      <span class="dashboard-template-left dashboard-card-title">{{ $t('Dashboard.Job.Template.Title') }}</span>
      <a href="#/main/job-template-store" class="dashboard-template-right dashboard-more">{{ $t('More') }}</a>
    </a-row>
    <div v-if="templateData" class="dashboard-template-contenter">
      <a
        v-for="(item, index) in templateData"
        :key="index"
        :href="getTemplateLocation(item.code)"
        class="dashboard-template-card m-b-20">
        <img class="dashboard-template-logo" :src="getlogoByCode(item)" />
        <span class="dashboard-template-name" :title="item.name">{{ item.name }}</span>
      </a>
    </div>
  </div>
</template>
<script>
import DashboardService from '@/service/dashboard-monitor'
export default {
  props: ['initData'],
  data() {
    return {
      templateData: [],
      allTemplates: [],
      count: 5,
    }
  },
  watch: {
    initData(val, oldVal) {
      this.init()
    },
    allTemplates(val) {
      this.init()
    },
  },
  mounted() {
    this.init()
  },
  created() {
    this.getAllTempLates()
  },
  methods: {
    init() {
      const templateData = []
      this.initData.forEach(item => {
        this.allTemplates.forEach(resItem => {
          if (item.type === resItem.code && templateData.length < 5) {
            templateData.push(resItem)
          }
        })
      })
      this.templateData = templateData
    },
    getAllTempLates() {
      DashboardService.getTemplateEnums().then(
        res => {
          this.allTemplates = res
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    getTemplateLocation(code) {
      return '#/main/job-template-ex/' + code
    },
    getlogoByCode(template) {
      return `/api/template/${isNaN(template.code) ? 'job' : 'user'}templates/${template.code}/logo/`
    },
  },
}
</script>

<style lang="css" scoped>
.dashboard-template {
  overflow: hidden;
}
.dashboard-template-title {
  display: flex;
  justify-content: space-between;
}
.dashboard-template-card {
  padding: 15px 20px;
  /* background: #f8f8f8; */
  position: relative;
  display: flex;
}
.dashboard-template-line {
  width: 100%;
}

.dashboard-template-logo {
  /* width: 68px; */
  height: 40px;
  object-fit: contain;
  position: absolute;
  top: 22%;
}
.dashboard-template-name {
  line-height: 40px;
  /* color: #000; */
  margin-left: 90px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
