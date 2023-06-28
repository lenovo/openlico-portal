<template>
  <div class="job-parameters-affinity-layout-content">
    <a-spin :spinning="loading">
      <div class="job-parameters-affinity-layout-params">
        <span>
          <i>{{ $t('JobTemplate.Affinity.Layout.Cores') }}</i>
          <a-input v-model.number="params.coresPerSocket" size="small" />
        </span>
        <span>
          <i>{{ $t('JobTemplate.Affinity.Layout.Sockets') }}</i>
          <a-input v-model.number="params.socketsPerNode" size="small" />
        </span>
        <span>
          <i>{{ $t('JobTemplate.Affinity.Layout.Hyper') }}</i>
          <a-switch v-model="params.hyperThreading" size="small" />
        </span>
        <span>
          <i>{{ $t('JobTemplate.Affinity.Layout.LoadNodeSet') }}</i>
          <a-button type="link" style="padding: 0" @click="onLoadNodeClick">
            <i class="el-erp-add affinity-load-node-icon" />
          </a-button>
        </span>
        <span class="full-screen">
          <i class="el-erp-zuidahua" @click="openChartModal" />
        </span>
      </div>
      <relation-chart v-if="initData" ref="affinityLayoutChart" :type="type" :init-data="initData" />
    </a-spin>
    <a-modal
      class="full-screen-modal"
      :visible="showChartModal"
      :closable="false"
      width="1400px"
      dialog-class="affinity-layout-modal"
      :footer="null"
      @cancel="showChartModal = false">
      <div class="job-parameters-affinity-layout-params">
        <span>
          <i>{{ $t('JobTemplate.Affinity.Layout.Cores') }}</i>
          <a-input v-model.number="params.coresPerSocket" size="small" />
        </span>
        <span>
          <i>{{ $t('JobTemplate.Affinity.Layout.Sockets') }}</i>
          <a-input v-model.number="params.socketsPerNode" size="small" />
        </span>
        <span>
          <i>{{ $t('JobTemplate.Affinity.Layout.Hyper') }}</i>
          <a-switch v-model="params.hyperThreading" size="small" />
        </span>
        <span>
          <i>{{ $t('JobTemplate.Affinity.Layout.LoadNodeSet') }}</i>
          <a-button type="link" style="padding: 0" @click="onLoadNodeClick">
            <i class="el-erp-add affinity-load-node-icon" />
          </a-button>
        </span>
        <span class="full-screen-zuixiaohua">
          <i class="el-erp-zuixiaohua" @click="showChartModal = false" />
        </span>
      </div>
      <relation-chart v-if="initData" ref="affinityLayoutChartFull" :type="type" :init-data="initData" />
    </a-modal>
    <load-node-dialog ref="loadNodeDialog" />
  </div>
</template>
<script>
import AffinityService from './../../../service/job-template-affiity'
import LoadNodeDialog from './load-node-dialog.vue'
import relationChart from './relation-chart.vue'
export default {
  components: { relationChart, LoadNodeDialog },
  props: ['form', 'type'],
  data() {
    return {
      dataMap: {
        openmp: AffinityService.getOpenmpLayoutInfo,
        intelmpi: AffinityService.getIntelmpiLayoutInfo,
      },
      params: {
        socketsPerNode: 2,
        coresPerSocket: 4,
        hyperThreading: true,
      },
      initData: null,
      loading: false,
      refreshId: null,
      showChartModal: false,
    }
  },
  watch: {
    params: {
      handler(val, old) {
        clearTimeout(this.refreshId)
        this.refreshId = setTimeout(this.getInitData, 2000)
      },
      deep: true,
    },
    form: {
      handler(val, old) {
        clearTimeout(this.refreshId)
        this.refreshId = setTimeout(this.getInitData, 3000)
      },
      deep: true,
    },
  },
  mounted() {
    this.getInitData()
  },
  methods: {
    getInitData() {
      // this.loading = true;
      this.dataMap[this.type](this.form, this.params).then(
        res => {
          this.initData = res
          // this.loading = false;
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    openChartModal() {
      this.showChartModal = true
      this.$nextTick(() => {
        this.$refs.affinityLayoutChartFull.resizeChart()
      })
    },
    onLoadNodeClick() {
      this.$refs.loadNodeDialog.doLoadNode().then(
        res => {
          this.params = { ...this.params, ...res }
        },
        _ => {},
      )
    },
  },
}
</script>
<style>
.job-parameters-affinity-layout-params {
  padding: 5px 0;
  background-color: #7a7a7a;
  text-align: center;
  position: relative;
}
.job-parameters-affinity-layout-params > span {
  margin-right: 30px;
}
.job-parameters-affinity-layout-params input {
  width: 30px;
  background-color: #7a7a7a;
  color: #fff;
}
.job-parameters-affinity-layout-params i {
  font-style: normal;
  color: #fff;
  margin-right: 5px;
}
.job-parameters-affinity-layout-content .relation-chart {
  width: 100%;
  height: 360px;
  /* background-color: aqua; */
}
.affinity-layout-modal {
  position: relative;
}
.job-parameters-affinity-layout-content .full-screen,
.affinity-layout-modal .full-screen-zuixiaohua {
  position: absolute;
  margin: 4px 0;
  right: 0;
  cursor: pointer;
}
.affinity-layout-modal .relation-chart {
  width: 100%;
  height: 800px;
}
.affinity-load-node-icon {
  font-size: 13px;
}
</style>
