<template>
  <div class="p-10">
    <a-row type="flex" :gutter="20" style="flex-wrap: wrap">
      <a-col :xs="24" :sm="24" :md="12" :lg="8">
        <MailSetting class="table-style notify-content"></MailSetting>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import MailSetting from './notify-adapter-manage/notify-adapter-email'
import AccessService from '../service/access'

export default {
  components: {
    MailSetting,
  },
  data() {
    return {
      arch: AccessService.getSchedulerArch(),
    }
  },
}
</script>
<style>
.notify-content {
  padding: 20px;
  height: 840px;
  box-sizing: border-box;
}
.notify-header-radio {
  position: absolute;
  right: 0;
}
.notify-settings-img {
  text-align: center;
  padding-bottom: 20px;
}
.notify-settings-img img {
  height: 70px;
}
</style>
