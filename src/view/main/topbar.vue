<template>
  <nav class="main-header">
    <div class="main-header-left">
      <span id="Shift_Menu" style="cursor: pointer" @click="shiftMenuSize">
        <a-icon :type="collapsed ? 'menu-unfold' : 'menu-fold'" />
      </span>
      <span class="main-heaser-title" />
    </div>
    <div v-if="license && license.licenseMessage" class="main-header-center">
      <p style="">
        {{ license.licenseMessage }}
      </p>
    </div>
    <div class="main-header-right">
      <span class="welcome-user">{{ $t('Welcome.User', { name: userName }) }}</span>
      <file-editor />
      <mian-tools-icon v-if="isTools()" />
      <alertstatus v-if="isAlert()" id="Alert_Status" />
      <userstatus id="My_Status" :user-name="userName" :user-id="userId" :user-group="userGroup" @on-change="getUser" />
    </div>
  </nav>
</template>
<script>
import UserService from './../../service/user'
import AccessService from './../../service/access'
import Userstatus from './../../widget/user-status'
import Alertstatus from './../../widget/alert-status'
import FileEditor from './topbar/file-editor.vue'
import MianToolsIcon from './topbar/mian-tools-icon.vue'
export default {
  components: {
    Userstatus,
    Alertstatus,
    FileEditor,
    MianToolsIcon,
  },
  data() {
    return {
      userName: this.$store.state.auth.username,
      userId: '',
      userGroup: '',
      refreshTimeout: null,
    }
  },
  computed: {
    collapsed() {
      return window.gApp.isCollapse
    },
    license() {
      return this.$store.getters['settings/getLicense']
    },
  },
  mounted() {
    this.getUser()
  },
  beforeDestroy() {
    if (this.refreshTimeout > 0) {
      clearTimeout(this.refreshTimeout)
      this.refreshTimeout = 0
    }
  },
  methods: {
    shiftMenuSize() {
      window.gApp.isCollapse = !window.gApp.isCollapse
    },
    getUser() {
      UserService.getUserById(this.$store.state.auth.userid).then(
        res => {
          this.userName = res.realName ? res.realName : ''
          this.userName = this.userName ? this.userName : this.$store.state.auth.username
          this.userId = res.id
          this.userGroup = res.userGroupName
          // this.refreshTimeout = setTimeout(this.getUser, 60000);
        },
        res => {
          this.$message.error(res)
          console.log("Can't get user info")
        },
      )
    },
    isAlert() {
      return (
        AccessService.getMatchFeatureCodes(['sc.host.*,monitor.cluster'], this.$store.state.auth.featureCodes).length >
        0
      )
    },
    isTools() {
      return (
        AccessService.getMatchFeatureCodes(['sc.host.*'], this.$store.state.auth.featureCodes).length > 0 ||
        this.$store.state.auth.access === 'staff'
      )
    },
  },
}
</script>
<style>
.main-header {
  width: 100%;
  height: 60px;
  box-sizing: border-box;
  background-color: #fff;
  display: flex;
}
.main-header > div {
  box-sizing: border-box;
  height: 100%;
}
.main-header-left {
  width: 100px;
  line-height: 60px;
  padding-left: 20px;
  display: flex;
  justify-content: left;
}
.main-header-right {
  flex: 1 1 auto;
  line-height: 60px;
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
}
.main-header-center {
  padding-top: 10px;
  text-align: center;
  width: 100%;
}
.main-header-center > p {
  display: inline-block;
  color: red;
  font-size: 16px;
  background: #f8f8f8;
  padding: 10px;
  border-radius: 4px;
}

.main-header-right > span {
  margin-right: 30px;
}
.welcome-user {
  white-space: pre;
  color: #999;
}
</style>
