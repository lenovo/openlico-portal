<template>
  <div class="height--100 p-10">
    <div class="store-container">
      <div v-if="!isWorkflow" class="job-template-store-header m-b-20">
        <span class="job-template-store-title">{{ $t('JobTemplateStore.Title') }}</span>
      </div>
      <a-row class="store-container-top">
        <a-col :span="12" align="left" class="job-template-store-filter">
          <a-select
            v-model:value="filter"
            class="job-template-store-filter-select"
            size="large"
            popup-class-name="job-template-store-filter-select-menu"
            :title="filter"
            @change="onCategoryChange">
            <template v-for="(item, index) in filterOptions">
              <a-select-option
                v-if="index > 0"
                :key="`job-template-store-filter-hr${index}`"
                disabled
                class="job-template-store-filter-hr">
                <hr />
              </a-select-option>
              <a-select-option
                v-for="category in item"
                :key="category.key"
                class="job-template-store-filter-select-item">
                <div class="job-template-store-filter-select-item-label">
                  {{ `${category.label || category.key} (${category.counts})` }}
                </div>
                <a-checkbox
                  v-if="index > 0 && filter != category.key"
                  v-model:checked="filterChenk[category.key]"
                  style="width: 16px"
                  @click.stop
                  @change="onFilterChecked($event, category.key)" />
              </a-select-option>
            </template>
          </a-select>

          <a-dropdown v-if="!isWorkflow" overlay-class-name="job-template-store-action-menu">
            <template #overlay>
              <a-menu @click="onActionMenuClick">
                <a-menu-item key="create">
                  <i class="el-erp-createtemplate job-template-store-action-menu-icon" />{{ $t('Action.Create') }}
                </a-menu-item>
                <a-menu-item key="import">
                  <i class="el-erp-importtemplate job-template-store-action-menu-icon" />{{ $t('Action.Import') }}
                </a-menu-item>
              </a-menu>
            </template>
            <a-button style="margin-left: 16px" class="job-template-store-action" size="large" :title="$t('Action')">
              <i class="el-erp-moreaction" />
            </a-button>
          </a-dropdown>
        </a-col>
        <a-col :span="12" align="right">
          <span class="m-r-10" style="font-size: 16px">{{ $t('JobTemplateStore.Sort') }}</span>
          <a-select
            v-model:value="sort"
            style="width: 150px; text-align: left"
            popup-class-name="job-template-store-sort"
            size="large"
            @change="onSortChange">
            <a-select-option value="default">
              {{ $t('JobTemplateStore.Sort.Default') }}
            </a-select-option>
            <a-select-option value="latest_used">
              {{ $t('JobTemplateStore.Sort.Latest') }}
            </a-select-option>
            <a-select-option value="mostly_used">
              {{ $t('JobTemplateStore.Sort.Mostly') }}
            </a-select-option>
            <a-select-option value="alphabetical">
              {{ $t('JobTemplateStore.Sort.Alphabetical') }}
            </a-select-option>
          </a-select>
          <a-input
            v-model:value="search"
            class="job-template-store-search"
            :placeholder="$t('Action.Search')"
            :title="$t('Action.Search')"
            size="large"
            @change="onSearch">
            <template #prefix>
              <search-outlined />
            </template>
          </a-input>
        </a-col>
      </a-row>
      <a-row type="flex" :gutter="[20, 20]">
        <a-col v-for="jobTemplate in jobTemplates" :key="jobTemplate.code" :span="span" class="store-container-middle">
          <job-template-card
            :job-template="jobTemplate"
            @action-trigger="onCardActionClick"
            @toggle-favorite-click="toggleFavoriteClick" />
        </a-col>
      </a-row>
      <a-row class="m-t-10">
        <a-col :span="12">
          {{ $T('CompositeTable.Footer.Total', { total: total }) }}
        </a-col>
        <a-col :span="12" style="text-align: right">
          <a-pagination
            show-quick-jumper
            :show-size-changer="false"
            :current="currentPage"
            :page-size="pageSize"
            size="small"
            :total="total"
            style="margin-right: -8px"
            @show-size-change="handleSizeChange"
            @change="handleCurrentChange" />
        </a-col>
      </a-row>
    </div>
    <job-template-import-dialog id="tid_job-template-import-dialog" ref="importDialog" />
  </div>
</template>
<script>
import JobTemplateService from '@/service/job-template.js'
import JobTemplateCard from './job-template-store/job-template-card.vue'
import JobTemplateImportDialog from './job-template-store/job-template-import-dialog.vue'

export default {
  components: {
    'job-template-card': JobTemplateCard,
    'job-template-import-dialog': JobTemplateImportDialog,
  },
  data() {
    return {
      jobTemplates: [],
      filterOptions: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      filter: '',
      sort: 'default',
      search: '',
      span: this.getTemplateCardSpan(),
      filterChenk: {
        favorites: false,
        my_templates: false,
      },
      isWorkflow: Object.prototype.hasOwnProperty.call(this.$route.params, 'workflowId'),
    }
  },
  watch: {
    '$route.path': function (val) {
      this.init()
    },
  },
  mounted() {
    // var route = this.$route.path;
    window.addEventListener('resize', this.resizeTemplateSpan)

    this.init()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeTemplateSpan)
  },
  methods: {
    init() {
      this.filter = this.$route.params.category || ''
      const filtersCheck = this.$route.query.filters ? JSON.parse(this.$route.query.filters) : []
      for (const key in this.filterChenk) {
        this.filterChenk[key] = filtersCheck.includes(key)
      }
      this.getAllCategories('init')
    },
    initJobTemplates() {
      const { filter, sort, search, currentPage, pageSize } = this
      const filterCheck = []
      for (const key in this.filterChenk) {
        if (this.filterChenk[key]) filterCheck.push(key)
      }
      if (!filterCheck.includes(filter)) filterCheck.push(filter)
      JobTemplateService.getTemplatesByFilter(filterCheck, sort, search, currentPage, pageSize).then(
        res => {
          this.jobTemplates = res.data
          this.currentPage = res.currentPage
          this.total = res.total
        },
        res => {
          this.$message.error(res)
        },
      )
    },

    onCreateClick() {
      this.$router.push({ path: '/main/job-template-editor/' })
    },
    onImportClick() {
      this.$refs.importDialog.doImport().then(
        res => {
          this.getAllCategories()
          this.initJobTemplates()
        },
        _ => {},
      )
    },
    onCardActionClick([command, template]) {
      if (command === 'delete' || command === 'publish' || command === 'unpublish') {
        const msgKey =
          command === 'delete'
            ? 'Delete'
            : command === 'publish'
            ? 'Publish'
            : command === 'unpublish'
            ? 'Unpublish'
            : ''

        this.$confirm({
          title: this.$T(`JobTemplate.${msgKey}.Title`, { name: template.name }),
          content: this.$t(`JobTemplate.${msgKey}.Confirm`),
          centered: true,
          okText: this.$t('Action.Yes'),
          cancelText: this.$t('Action.No'),
          onOk: () => {
            JobTemplateService[`${command}JobTemplate`](template.code).then(
              res => {
                this.getAllCategories('init')
                this.$message.success(this.$T(`JobTemplate.${msgKey}.Success`, { name: template.name }))
              },
              err => {
                this.$message.error(err)
              },
            )
          },
        })
      }
    },
    toggleFavoriteClick(jobTemplate) {
      const actionList = ['addToFavorite', 'removeFromFavorite']
      const index = jobTemplate.favorite ? 1 : 0
      JobTemplateService[actionList[index]](jobTemplate.code).then(
        res => {
          this.getAllCategories()
          this.initJobTemplates()
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.initJobTemplates()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.initJobTemplates()
    },
    onActionMenuClick(e) {
      if (e.key === 'create') this.onCreateClick()
      if (e.key === 'import') this.onImportClick()
    },
    onCategoryChange(val) {
      if (Object.prototype.hasOwnProperty.call(this.filterChenk, val)) {
        this.filterChenk[val] = false
      }
      this.setFilterURL()
      this.initJobTemplates()
    },
    onFilterChecked({ target }, key) {
      this.setFilterURL()
      this.initJobTemplates()
    },
    onSortChange() {
      this.initJobTemplates()
    },
    onSearch() {
      clearTimeout(this.searchId)
      this.searchId = setTimeout(() => {
        this.currentPage = 1
        this.initJobTemplates()
      }, 200)
    },
    getAllCategories(type) {
      JobTemplateService.getTemplateCategory().then(
        res => {
          this.filterOptions = res
          const options = res.reduce((a, b) => a.concat(b))
          const favorites = options.filter(i => i.key === 'favorites')[0]
          this.filter =
            options.length && (!this.filter || options.map(i => i.key).indexOf(this.filter) === -1)
              ? favorites.counts
                ? favorites.key
                : options[0].key
              : this.filter
          if (type === 'init') {
            this.resizeTemplateSpan()
          }
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    resizeTemplateSpan() {
      clearTimeout(this.resizeId)

      const line = 5
      const span = this.getTemplateCardSpan()
      this.pageSize = (24 / span) * line
      this.currentPage = 1
      this.span = span

      this.resizeId = setTimeout(() => {
        this.initJobTemplates()
      }, 100)
    },
    getTemplateCardSpan() {
      let span = 6
      const width = document.documentElement.clientWidth
      if (width < 780) span = 24
      if (width >= 780) span = 12
      if (width >= 1260) span = 8
      if (width >= 1580) span = 6
      if (width >= 1900) span = 6
      if (width >= 2260) span = 4
      return span
    },
    setFilterURL() {
      const filters = []
      for (const key in this.filterChenk) {
        if (this.filterChenk[key]) filters.push(key)
      }
      this.$store.dispatch('settings/setpTemplateFilter', this.filter + '?filters=' + JSON.stringify(filters))
      this.$router.push({
        name: this.$route.name,
        params: { category: this.filter },
        query: { filters: JSON.stringify(filters) },
      })
    },
  },
}
</script>
<style scoped>
.store-container-top {
  margin-bottom: 20px;
}
.store-container {
  box-sizing: border-box;
}
.store-container :deep(.ant-row) {
  width: auto;
}
.job-template-store-header {
  height: 190px;
  width: 100%;
  background: url('/static/img/system/main/job-template.png') no-repeat;
  background-size: 100% 100%;
}
.job-template-store-title {
  margin: 65px 45px;
  display: inline-block;
  font-size: 36px;
  font-weight: 700;
  color: #fff;
}
.job-template-store-filter {
  display: flex;
}
.store-container :deep(.job-template-store-filter-hr.ant-select-dropdown-menu-item-disabled) {
  cursor: default !important;
}

.store-container :deep(.job-template-store-filter-hr),
.store-container :deep(.job-template-store-filter-hr > hr) {
  margin: 0;
  padding: 0 10px;
  height: 1px;
  min-height: 1px;
}
.store-container :deep(.job-template-store-filter-hr > div),
.store-container :deep(.job-template-store-filter-hr > span) {
  border: none;
  height: 1px;
  background: #eee;
}
.job-template-store-filter-select {
  min-width: 320px;
}
.job-template-store-filter-select :deep(.ant-select-selection-selected-value),
.job-template-store-sort :deep(.ant-select-selection-selected-value) {
  color: rgba(0, 0, 0, 0.8);
}
.store-container :deep(.job-template-store-filter-select-item > div) {
  display: flex;
  padding: 10px 20px;
}
.store-container :deep(.job-template-store-filter-select-item-label) {
  width: 100%;
}
.job-template-store-action {
  width: 40px;
}
.job-template-store-action > i {
  font-size: 12px;
  margin: 2px 0 0;
}
.job-template-store-action-menu .ant-dropdown-menu-item {
  width: 140px;
}
.store-container :deep(.job-template-store-sort) {
  text-align: left !important;
}
.job-template-store-search {
  width: 190px;
  margin-left: 10px;
}
</style>
