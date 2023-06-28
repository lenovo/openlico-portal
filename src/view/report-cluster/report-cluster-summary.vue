<template>
  <div v-if="submit && waiting" class="m-10 p-20 b-w">
    <h3 class="m-b-20" style="font-size: 18px">
      {{ $t('Report.Cluster.Summary') }}
    </h3>
    <a-row class="cluster-summary m-b-20">
      <a-col :span="8" class="cluster-summary-card">
        <p class="cluster-report-summary-label">
          {{ $t('Report.Cluster.Summary.SubmitJob') }}
        </p>
        <p class="cluster-report-summary-value">
          {{ submit[0] }}
        </p>
      </a-col>
      <a-col :span="7" class="cluster-summary-card">
        <p class="cluster-report-summary-label">
          {{ $t('Report.Cluster.Summary.WaitingJob') }}
        </p>
        <p class="cluster-report-summary-value">
          {{ waiting[0] }}
        </p>
      </a-col>
      <a-col :span="9" class="cluster-summary-card">
        <p class="cluster-report-summary-label">
          {{ $t('Report.Cluster.Summary.WaitRatio') }}
        </p>
        <p class="cluster-report-summary-value">
          {{ waitRatio }}
        </p>
      </a-col>
    </a-row>
    <a-row :gutter="20">
      <a-col :span="12">
        <div class="cluster-summary cluster-summary-card">
          <p class="cluster-report-summary-label">
            {{ $t('Report.Cluster.Summary.Execution.Maximum') }}
          </p>
          <p class="cluster-report-summary-value">
            {{ format(submit[1]) }}
          </p>
          <p class="cluster-report-summary-label">
            {{ $t('Report.Cluster.Summary.Execution.Average') }}
          </p>
          <p class="cluster-report-summary-value">
            {{ format(submit[2]) }}
          </p>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="cluster-summary cluster-summary-card">
          <p class="cluster-report-summary-label">
            {{ $t('Report.Cluster.Summary.Waiting.Maximum') }}
          </p>
          <p class="cluster-report-summary-value">
            {{ format(waiting[1]) }}
          </p>
          <p class="cluster-report-summary-label">
            {{ $t('Report.Cluster.Summary.Waiting.Average') }}
          </p>
          <p class="cluster-report-summary-value">
            {{ format(waiting[2]) }}
          </p>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script>
export default {
  props: ['data'],
  data() {
    return {}
  },
  computed: {
    submit() {
      return this.data.submit || []
    },
    waiting() {
      return this.data.waiting || []
    },
    waitRatio() {
      let ratio = (this.data.waiting[0] / this.data.submit[0]) * 100
      if (ratio % 1) {
        ratio = ratio.toFixed(2)
      }
      return ratio || ratio === 0 ? ratio + '%' : '-'
    },
  },
  methods: {
    format(val) {
      const durationTime = parseInt(val)
      const seconds = durationTime % 60
      const minutes = ((durationTime % 3600) - (durationTime % 60)) / 60
      const hours = (durationTime - (durationTime % 3600)) / 3600
      const s = seconds < 10 ? '0' + seconds : seconds
      const m = minutes < 10 ? '0' + minutes : minutes
      const h = hours < 10 ? '0' + hours : hours
      return `${h}:${m}:${s}`
    },
  },
}
</script>
<style>
.cluster-summary {
  background-color: #fafafa;
}
.cluster-summary p {
  line-height: 30px;
}
.cluster-summary-card {
  padding: 10px 20px 10px;
}
.cluster-report-summary-label {
  font-weight: bold;
}
.cluster-report-summary-value {
  font-size: 12px;
  color: #918c8c;
}
</style>
