<template>
  <div class="source">
    <div v-for="item in about" :key="item.title" class="info-box">
      <div class="box-top">
        <p class="top-title">{{ item.title }}</p>
        <p class="bom-num">{{ 'v' + item.version }}</p>
      </div>
      <div class="box-bom">
        <a :href="item.gitHubLink" target="_blank">{{ $t('GitHub') }}</a>
        <span class="m-r-20"></span>
        <a :href="item.licenseLink" target="_blank">{{ $t('License') }}</a>
      </div>
    </div>
  </div>
</template>

<script>
import AboutService from '@/service/about'
export default {
  data() {
    return {
      about: [],
    }
  },
  created() {
    AboutService.getAbout().then(
      res => {
        AboutService.getVersion().then(
          resp => {
            this.about = [
              {
                title: this.$t('Core'),
                version: resp.version,
                gitHubLink: 'https://github.com/lenovo/openlico',
                licenseLink: 'https://github.com/lenovo/openlico/blob/main/LICENSE',
              },
              {
                title: this.$t('Portal'),
                version: res.version,
                gitHubLink: 'https://github.com/lenovo/openlico-portal',
                licenseLink: 'https://github.com/lenovo/openlico-portal/blob/main/LICENSE',
              },
            ]
          },
          resp => {
            this.$message.error(resp)
          },
        )
      },
      res => {
        this.$message.error(res)
      },
    )
  },
}
</script>

<style scoped>
.source .info-box {
  height: 75px;
  border-bottom: 1px solid #eeeeee;
}
.source .box-top {
  display: flex;
  padding-top: 10px;
  margin-bottom: 8px;
}
.source .top-title {
  flex: 1;
  font-size: 16px;
  color: #333333;
}
.source .top-github {
  margin-right: 20px;
}
.source .box-bom {
  display: flex;
  font-size: 14px;
}
.source .bom-version {
  flex: 1;
  color: #999999;
}
.source .bom-num {
  color: #333333;
}
.source .info-box:first-child {
  margin-top: 32px;
  border-top: 1px solid #eeeeee;
}
</style>
