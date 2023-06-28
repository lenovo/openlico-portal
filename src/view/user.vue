<template lang="html">
  <div v-if="user" class="user-detail m-10 b-w p-20">
    <h3 class="m-b-20">
      {{ user.username }}
    </h3>
    <a-row class="m-b-10 user-detail-header">
      <a-col :lg="6" :md="8" :sm="24" :xs="24">
        <div class="user-detail-div">
          <div class="user-detail-div-icon">
            <span class="user-detail-icon"><i class="el-erp-email" /></span>
          </div>
          <ul>
            <li class="cell-left">
              <span class="cell-title">{{ $t('User.Detail.Email') }}</span>
              <span class="cell-logo logo-cpu" />
            </li>
            <li class="cell-right">
              <span class="cell-content">{{ user.email || '-' }} &nbsp;</span>
            </li>
          </ul>
        </div>
      </a-col>
      <a-col :lg="6" :md="8" :sm="24" :xs="24">
        <div class="user-detail-div">
          <div class="user-detail-div-icon">
            <span class="user-detail-icon"><i class="el-erp-id" /></span>
          </div>
          <ul>
            <li class="cell-left">
              <span class="cell-title">{{ `${$t('User.Detail.Id')} / UID` }}</span>
              <span class="cell-logo logo-cpu" />
            </li>
            <li class="cell-right">
              <span class="cell-content">{{ user.id + ' / ' + user.uid }}</span>
            </li>
          </ul>
        </div>
      </a-col>
      <a-col :lg="6" :md="8" :sm="24" :xs="24">
        <div class="user-detail-div">
          <div class="user-detail-div-icon">
            <span class="user-detail-icon"><i class="el-erp-role" /></span>
          </div>
          <ul>
            <li class="cell-left">
              <span class="cell-title">{{ $t('User.Detail.Role') }}</span>
              <span class="cell-logo logo-cpu" />
            </li>
            <li class="cell-right">
              <span class="cell-content">{{ role(user.role) }}</span>
            </li>
          </ul>
        </div>
      </a-col>
    </a-row>
    <a-row class="m-t-20 user-detail-params">
      <div class="user-detail-params-title">
        {{ $t('User.Detail.Information') }}
      </div>
      <div class="user-detail-params-content">
        <div class="user-detail-params-item">
          <div class="user-detail-params-label">
            {{ $t('User.Detail.CreateTime') }}
          </div>
          <div class="user-detail-params-value">
            {{ columnFormatter(user.createTime) }}
          </div>
        </div>
        <div class="user-detail-params-item">
          <div class="user-detail-params-label">
            {{ $t('User.Detail.LatestLogin') }}
          </div>
          <div class="user-detail-params-value">
            {{ columnFormatter(user.loginTime) }}
          </div>
        </div>
      </div>
      <div v-if="user.userGroup && arch == 'host'" class="user-detail-params-title">
        {{ $t('User.Detail.Group') }}
      </div>
      <div v-if="user.userGroup && arch == 'host'" class="user-detail-params-content">
        <div class="user-detail-params-item">
          <div class="user-detail-params-label">{{ $t('User.Detail.Group.Name') }} / {{ $t('UserGroup.Gid') }}</div>
          <div class="user-detail-params-value">{{ user.userGroup.name }} / {{ user.userGroup.gid }}</div>
        </div>
      </div>
      <div v-if="user.billGroup && user.billGroup.name && arch == 'host'" class="user-detail-params-title">
        {{ $t('User.Detail.BillGroup') }}
      </div>
      <div v-if="user.billGroup && user.billGroup.name && arch == 'host'" class="user-detail-params-content">
        <div class="user-detail-params-item">
          <div class="user-detail-params-label">
            {{ $t('User.Detail.BillGroup.Name') }}
          </div>
          <div class="user-detail-params-value">
            {{ user.billGroup.name }}
          </div>
        </div>
        <div class="user-detail-params-item">
          <div class="user-detail-params-label">
            {{ $t('User.Detail.BillGroup.Balance') }}
          </div>
          <div class="user-detail-params-value">{{ currency }}{{ user.billGroup.accountBalance }}</div>
        </div>
      </div>
    </a-row>
  </div>
</template>
<script>
import AccessService from '../service/access'
import UserService from '../service/user'
import Format from '../common/format'
export default {
  data() {
    return {
      arch: AccessService.getSchedulerArch(),
      currency: this.$store.getters['settings/getCurrency'],
      userId: null,
      user: null,
      role: UserService.getUserRoleDisplayName,
    }
  },
  created() {
    this.getData()
  },
  methods: {
    columnFormatter(time) {
      return Format.formatDateTime(time)
    },
    getData() {
      this.userId = Number(window.location.hash.split('/')[window.location.hash.split('/').length - 1])
      UserService.getUserById(this.userId).then(res => {
        this.user = res
      })
    },
  },
}
</script>

<style lang="css">
.user-detail-header,
.user-detail-params {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 20px;
}
.user-detail .cell span {
  display: block;
}
.user-detail .cell {
  background: #fff;
  padding: 20px;
}
.user-detail .cell li span:first-child {
  margin-bottom: 20px;
}
.user-detail .cell .cell-left {
  width: 120px;
}
.user-detail .cell .cell-right {
  width: 100%;
}
.user-detail .cell .cell-right span {
  text-align: right;
}
.user-detail-icon {
  display: block;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #5fb4f9;
  position: relative;
}
.user-detail-icon i {
  color: #fff;
  position: absolute;
  left: 5px;
  top: 1px;
  font-size: 20px;
}

.user-detail-div {
  display: flex;
  align-items: center;
}
.user-detail-div-icon {
  width: 15%;
}
.cell-right {
  margin-top: 10px;
}
.user-detail-params-content {
  margin-bottom: 20px;
  padding-left: 10px;
}
.user-detail-params-item {
  display: flex;
}
.user-detail-params-item > div {
  margin: 5px 10px;
}
.user-detail-params-label {
  color: #999;
  width: 150px;
}
.user-detail-params-value {
  font-weight: 700;
  color: #333;
}
</style>
