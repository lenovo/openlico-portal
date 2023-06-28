<template>
  <div class="remotely-debug">
    <div class="debug-title">
      <div class="title-round" />
      <div class="title-info">
        {{ $t('Monitor.Debug.Info1') }}
      </div>
    </div>
    <div class="pl-30 pt-5">
      {{ $t('Monitor.Debug.Info2') }}
    </div>
    <div class="pl-25 pt-5 margin-30">
      {{ $t('Monitor.Debug.Info3') }}
    </div>
    <div class="pl-30 pt-5">
      {{ $t('Monitor.Debug.Info4') }}
    </div>
    <div class="pl-25 pt-5 margin-30">
      {{ $t('Monitor.Debug.Info5') }}
    </div>
    <div class="pl-30 pt-5">
      {{ $t('Monitor.Debug.Info6') }}
    </div>
    <div class="pl-25 pt-5 margin-30">
      {{ $t('Monitor.Debug.Info7') }}
    </div>
    <div class="pl-30 pt-5">
      {{ $t('Monitor.Debug.Info8') }}
    </div>
    <div class="pl-25 pt-5 margin-30">{{ $t('Monitor.Debug.Info9') }} {{ nodeName }}</div>
    <div class="pl-30 pt-5">
      {{ $t('Monitor.Debug.Info10') }}
    </div>
    <div class="pl-25 pt-5 margin-30">
      {{ $t('Monitor.Debug.Info11') }}
    </div>
    <div class="debug-title">
      <div class="title-round" />
      <div class="title-info">
        {{ $t('Monitor.Debug.Info12') }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['job'],
  data() {
    return {
      nodeName: '',
    }
  },
  created() {
    this.getJobInfo()
  },
  methods: {
    getJobInfo() {
      if (Object.keys(this.job.jobCSres[0].csres_value).length && Object.keys(this.job.jobRunning[0].hosts).length) {
        let jobValue = ''
        const hostArr = this.job.jobRunning[0].hosts.split(',')
        jobValue = hostArr[0]
        const jobLabel = this.job.jobCSres[0].csres_value
        this.nodeName = jobValue + ':' + jobLabel
      }
    },
  },
}
</script>

<style scoped lang="less">
.remotely-debug {
  width: 100%;
  border: 1px solid #e9eef2;
  padding-bottom: 10px;
  margin-bottom: 10px;
  .debug-title {
    height: 20px;
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 900;
    padding-left: 10px;
    margin-top: 10px;
    .title-round {
      width: 10px;
      height: 10px;
      border: 1px solid #999;
      border-radius: 50%;
      margin-right: 5px;
      background-color: #999;
    }
    .title-info {
      font-size: 14px;
    }
  }
  .pt-5 {
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .pl-25 {
    padding-left: 25px;
    background-color: #f8f8f8;
  }
  .pl-30 {
    padding-left: 30px;
  }
  .margin-30 {
    margin: 0 20px 0 30px;
  }
}
</style>
