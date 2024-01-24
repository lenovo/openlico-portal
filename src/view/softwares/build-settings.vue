<template>
  <div class="p-b-20">
    <BuildJobMonitoring ref="buildJobMonitoring"></BuildJobMonitoring>
    <a-form ref="innerForm" class="build-filter" :model="formModal" :rules="formRules">
      <p class="build-filter-title">{{ $t('Softwares.Build.Filter.Title') }}</p>
      <a-radio-group v-model:value="filterType" style="width: 100%" @change="onFilterChange">
        <div class="build-filter-item">
          <a-radio value="name">{{ $t('Softwares.Build.Filter.Name') }}</a-radio>
          <a-form-item v-if="filterType === 'name'" name="name">
            <div class="build-filter-item-content" style="display: flex">
              <a-input v-model:value="formModal.name" :disabled="loading" class="filter-name m-r-10"></a-input>
              <a-button :disabled="!formModal.name || loading" @click="refreshResultTable">{{
                $t('Action.Search')
              }}</a-button>
            </div>
          </a-form-item>
        </div>
        <div class="build-filter-item">
          <a-radio value="alnum">{{ $t('Softwares.Build.Filter.Acronym') }}</a-radio>
          <div v-if="filterType === 'alnum'" class="build-filter-item-content">
            <a-radio-group v-model:value="formModal.alnum" :disabled="loading" @change="refreshResultTable">
              <a-radio-button v-for="e in alnumOptions" :key="e" :value="e">{{ e }}</a-radio-button>
            </a-radio-group>
          </div>
        </div>
        <div class="build-filter-item">
          <a-radio value="file">{{ $t('Softwares.Build.Filter.File') }}</a-radio>
          <div v-if="filterType === 'file'" class="build-filter-item-content" style="display: flex">
            <a-form-item ref="buildFilerFile" name="file">
              <file-select v-model:value="formModal.file" type="file" class="filter-file" />
            </a-form-item>
            <a-button :disabled="!formModal.file || !nextEnable" class="m-l-10" @click="onNextClcik">{{
              $t('Action.Next')
            }}</a-button>
          </div>
        </div>
      </a-radio-group>
    </a-form>
    <BuildFilterTable
      v-if="showFilterResult"
      ref="buildFilterTable"
      v-model:loading="loading"
      :filter="{ type: filterType, value: formModal[filterType] }"
      @on-build-click="onBuildClick" />
    <BuildDialog ref="buildDialog" />
  </div>
</template>
<script>
import SoftwaresService from '@/service/softwores'
import FileSelect from '@/component/file-select.vue'
import BuildDialog from './build-dialog.vue'
import BuildFilterTable from './build-filter-table.vue'
import BuildJobMonitoring from './build-job-monitoring.vue'

export default {
  components: {
    FileSelect,
    BuildDialog,
    BuildFilterTable,
    BuildJobMonitoring,
  },
  data() {
    return {
      filterType: 'name',
      formModal: {
        name: '',
        alnum: '',
        file: '',
      },
      formRules: {
        file: [
          {
            validator: (rule, value) => {
              if (!/.*\.eb$/.test(value)) {
                return Promise.reject(new Error(this.$t('Softwares.Build.Filter.File.Vaild')))
              } else {
                return Promise.resolve()
              }
            },
          },
        ],
      },
      alnumOptions: [
        '0',
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
      ],
      nextEnable: false,
      showJobs: false,
      showFilterResult: false,
      loading: false,
    }
  },
  watch: {
    'formModal.file'(val) {
      this.onVaildDate()
    },
  },
  methods: {
    onFilterChange({ target }) {
      this.showFilterResult = false
      this.formModal = {
        name: '',
        alnum: '',
        file: '',
      }
    },
    refreshResultTable() {
      if (!this.showFilterResult) {
        this.showFilterResult = true
      }
      this.$nextTick(() => {
        this.$refs.buildFilterTable.refreshTable()
      })
    },
    onBuildClick(row) {
      SoftwaresService.getBuildingSoftwareByPath(row.path).then(
        res => {
          this.openBuildDialog({
            ...row,
            path: row.path,
            home: res.home,
            description: res.description,
          })
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    onVaildDate() {
      this.$refs.innerForm.validate().then(
        _ => {
          this.nextEnable = true
        },
        _ => {
          this.nextEnable = false
        },
      )
    },
    onNextClcik() {
      SoftwaresService.getBuildingSoftwareByPath(this.formModal.file).then(
        res => {
          // console.log(res)
          this.openBuildDialog({ ...res, path: this.formModal.file })
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    openBuildDialog(data) {
      this.$refs.buildDialog.doOpenBuild(data).then(
        res => {
          this.showJobs = true
          this.$refs.buildJobMonitoring.fetchBuildingJob(true)
        },
        _ => {},
      )
    },
  },
}
</script>
<style scoped>
.build-filter {
  padding: 10px;
  border: 1px solid #eee;
}
.build-filter .ant-form-item {
  margin-bottom: 0;
}
.build-filter-title {
  padding: 10px;
  font-weight: 500;
}
.build-filter-item {
  padding: 10px;
}
.build-filter-item-content {
  margin-top: 10px;
  padding-left: 25px;
}
.build-filter-item-content .filter-name,
.build-filter-item-content .filter-file {
  width: 530px;
}
</style>
