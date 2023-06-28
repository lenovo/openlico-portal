<template>
  <div :id="`tid_${jobTemplate.code}`" class="card-container">
    <div class="job-template-card b-w" @click="onUseClick">
      <div class="job-template-card-logo">
        <img :src="getlogoByCode(jobTemplate)" :alt="`${jobTemplate.name} logo`" />
      </div>
      <div class="job-template-card-info">
        <div>
          <p class="job-template-card-name" :tatle="jobTemplate.name">
            {{ jobTemplate.name }}
          </p>
          <p class="job-template-card-category" :title="jobTemplate.category">
            {{ jobTemplate.categoryDisplay }}
          </p>
        </div>
      </div>
      <div
        class="job-template-card-favorite"
        :class="{ 'job-template-card-favorite-display': jobTemplate.favorite }"
        @click.stop>
        <a-rate :default-value="jobTemplate.favorite ? 1 : 0" :count="1" @change="toggleFavorite" />
      </div>
      <div
        v-if="jobTemplate.type != 'system' && username == jobTemplate.username && !isWorkflow"
        class="job-template-card-action"
        @click.stop>
        <a-dropdown overlay-class-name="job-template-card-action-menu">
          <a class="ant-dropdown-link" @click="e => e.preventDefault()">
            <i class="el-erp-templateCardAction job-template-card-action-icon" />
          </a>
          <a-menu slot="overlay" @click="doAction">
            <a-menu-item v-if="jobTemplate.type == 'private'" key="edit">
              {{ $t('Action.Edit') }}
            </a-menu-item>
            <a-menu-item key="copy">
              {{ $t('Action.Copy') }}
            </a-menu-item>
            <a-menu-item v-if="jobTemplate.type == 'private' && $store.state.auth.role == 300" key="publish">
              {{ $t('Action.Publish') }}
            </a-menu-item>
            <a-menu-item v-if="jobTemplate.type == 'public'" key="unpublish">
              {{ $t('Action.Unpublish') }}
            </a-menu-item>
            <a-menu-item key="export">
              {{ $t('Action.Export') }}
            </a-menu-item>
            <a-menu-item v-if="jobTemplate.type == 'private'" key="delete">
              {{ $t('Action.Delete') }}
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </div>
  </div>
</template>
<script>
import JobTemplateService from '../../service/job-template'

export default {
  props: ['jobTemplate', 'workflowId', 'workflowStepId'],
  data() {
    return {
      username: this.$store.state.auth.username,
      isWorkflow: Object.prototype.hasOwnProperty.call(this.$route.params, 'workflowId'),
    }
  },
  watch: {
    jobTemplate: {
      handler: function () {
        this.$nextTick(() => {
          this.favoriteLoading = false
        })
        this.favorite = this.jobTemplate.favorite ? 1 : 0
      },
      deep: true,
    },
  },
  methods: {
    onUseClick() {
      const code = this.jobTemplate.code
      if (this.workflowId || this.workflowId === 0) {
        this.$router.replace({
          path: `/main/workflow-job-template-ex/${this.workflowId}/${this.workflowStepId}/` + code,
        })
      } else {
        this.$router.push({ path: '/main/job-template-ex/' + code })
      }
    },
    doAction({ key }) {
      if (key === 'edit') {
        this.$router.push({
          path: '/main/job-template-editor/' + this.jobTemplate.code,
        })
      } else if (key === 'copy') {
        this.$router.push({
          path: '/main/job-template-editor/copy/' + this.jobTemplate.code,
        })
      } else if (key === 'export') {
        JobTemplateService.getTemplateDownLoadUrl(this.jobTemplate.code).then(
          res => {
            // window.open("/download/" + res.data);
          },
          _ => {},
        )
      } else if (key === 'delete' || key === 'publish' || key === 'unpublish') {
        this.$emit('action-trigger', [key, this.jobTemplate])
      } else {
        this.$emit(`${key}-click`, this.jobTemplate)
      }
    },
    toggleFavorite() {
      if (this.favoriteLoading) {
        return
      }
      this.favoriteLoading = true
      this.$emit('toggle-favorite-click', this.jobTemplate)
    },
    getlogoByCode(template) {
      return `/api/template/${template.type === 'system' ? 'job' : 'user'}templates/${template.code}/logo/`
    },
  },
}
</script>
<style>
.job-template-card {
  position: relative;
  display: flex;
  border-radius: 8px;
  cursor: pointer;
}
.job-template-card:hover {
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.05), 0px 2px 20px rgba(0, 0, 0, 0.1), 0px 0px 10px rgba(0, 0, 0, 0.05);
}
.job-template-card-logo {
  padding: 12px 16px 12px 20px;
}
.job-template-card-logo > img {
  height: 80px;
  width: 80px;
  object-fit: contain;
}
.job-template-card-info {
  width: 100%;
  padding-right: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.job-template-card-name {
  font-weight: bold;
  color: #333;
}
.job-template-card-category {
  color: #999;
}
.job-template-card-favorite {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  display: none;
}
.job-template-card:hover .job-template-card-favorite,
.job-template-card:hover .job-template-card-action,
.job-template-card-favorite-display {
  display: block;
}
.job-template-card-action {
  display: none;
  position: absolute;
  bottom: 10px;
  right: 15px;
}
.job-template-card:hover .job-template-card-action .job-template-card-action-icon {
  color: #ccc;
}
.job-template-card:hover .job-template-card-action:hover .job-template-card-action-icon {
  color: #1890ff;
}
.job-template-card-action-menu li {
  width: 100px;
}
</style>
