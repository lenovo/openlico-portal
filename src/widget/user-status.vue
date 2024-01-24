<template lang="">
  <span class="user-status">
    <a-popover ref="popoverUser" placement="bottomRight">
      <template v-if="licenseOperationStatus" #content>
        <div class="user-status-title" style="width: 180px">
          <i class="el-erp-user1 user-status-icon" />
          <i
            id="Change_My_Password"
            :title="$t('User.Change.Password')"
            :class="['user-status-icon el-erp-changepassword', { noChangePassword: !userName }]"
            @click="changePassword" />
          <i id="about" :title="$t('About')" class="user-status-icon el-erp-rack" @click="showAbout" />
          <i id="My_Logout" class="el-erp-logout user-status-icon" :title="$t('Logout')" @click="logout" />
        </div>
        <!-- <p class="user-status-username">{{ $t('User.Status.Id', {'id': userId}) }}</p> -->

        <p class="user-status-userName" :title="userName" @click="editUser">
          {{ $T('User.Status.Username', { name: userName }) }}
        </p>

        <!-- <p class="user-status-username">{{ $t('User.Group', {'group': userGroup}) }}</p> -->
        <ul class="user-status-content">
          <li
            v-for="(access, index) in accessList"
            :id="'Shift_Access_' + access.toUpperCase()"
            :key="index"
            class="user-status-row"
            @click="shiftAccess(access)">
            <a href="javascript:void(0)">{{ $t('Access.' + access) }}</a>
            <check-circle-outlined v-if="currentAccess == access" class="access-selected-icon" />
          </li>
        </ul>
      </template>
      <template v-else #content>
        <div class="user-status-title" style="width: 150px">
          <i class="el-erp-user1 user-status-icon" />
          <i id="My_Logout" class="el-erp-logout user-status-icon" :title="$t('Logout')" @click="logout" />
        </div>
        <p class="user-status-userName" style="cursor: default" :title="userName">
          {{ $T('User.Status.Username', { name: userName }) }}
        </p>
      </template>
      <i class="el-erp-user1 user-status-icon" />
    </a-popover>
    <about-dialog ref="aboutDialog" />
    <change-password-dialog ref="changePasswordDialog" />
    <edit-user-dialog ref="editUserDialog" :user-id="userId" @on-change="() => $emit('on-change')" />
  </span>
</template>
<script type="text/javascript">
import AuthService from '@/service/auth'
import AccessService from '@/service/access'
import AboutDialog from './about/about-dialog.vue'
import EditUserDialog from './user-status/edit-user-dialog.vue'
import ChangePasswordDialog from './user-status/change-password-dialog.vue'

export default {
  components: {
    'about-dialog': AboutDialog,
    'edit-user-dialog': EditUserDialog,
    'change-password-dialog': ChangePasswordDialog,
  },
  props: ['userId', 'userGroup'],
  emits: ['on-change'],
  data() {
    return {
      showClose: true,
      userName: this.$store.state.auth.username,
      arch: AccessService.getSchedulerArch(),
      accessList: AccessService.getAvailableAccessByRole(this.$store.state.auth.role),
    }
  },
  computed: {
    currentAccess() {
      return this.$store.state.auth.access
    },
    licenseOperationStatus() {
      const license = this.$store.getters['settings/getLicense']
      if (
        license.status === 'invalid' ||
        (license.licenseCode && license.licenseCode.includes('Evaluation') && license.status === 'expired')
      ) {
        return false
      }
      return true
    },
  },
  methods: {
    shiftAccess(access) {
      AccessService.shiftAccess(access)
    },
    changePassword() {
      if (!this.userName) {
        return
      }
      this.$refs.changePasswordDialog.doChangePassword().then(
        _res => {
          // Do nothing
          AuthService.logout()
        },
        _res => {
          // Do nothing
        },
      )
    },
    editUser() {
      this.$refs.editUserDialog.open().catch(res => {})
    },
    showAbout() {
      this.$refs.aboutDialog.open()
    },
    logout() {
      this.$confirm({
        title: this.$t('Logout'),
        content: this.$t('Logout.Tip.Text'),
        centered: true,
        zIndex: 1005,
        okText: this.$t('Action.Confirm'),
        cancelText: this.$t('Action.Cancel'),
        onOk() {
          AuthService.logout()
        },
      })
    },
  },
}
</script>
<style media="screen">
.user-status {
  cursor: pointer;
}
.user-status .ant-popover {
  z-index: 10;
}
.user-status-icon {
  display: inline-block;
  font-size: 24px;
  /* color: #5fbdfc; */
}
.user-status-title {
  display: flex;
  padding: 4px 0 10px;
}
.user-status-title i[class*='el-erp'] {
  line-height: 18px;
  width: 100%;
  font-size: 18px;
  cursor: pointer;
}
.user-status-username {
  box-sizing: border-box;
  /* color: #999; */
  width: 100%;
  height: 30px;
  padding: 0 0 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.noChangePassword {
  /* color: #999; */
  cursor: no-drop;
}
.user-status-row {
  box-sizing: border-box;
  width: 100%;
  height: 50px;
  padding: 15px 0;
  /* border-top: 1px solid #eee; */
}
.user-status-row > span {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  float: right;
}
.user-status-button {
  padding: 10px 0 5px;
}
.user-status-userName {
  padding: 0 0 10px 0;
  cursor: pointer;
}
.user-status-title .el-erp-user1 {
  cursor: default !important;
}
</style>
