<template>
  <a-popover trigger="hover" @mouseenter="showTooltip">
    <template #content>
      <a-spin :spinning="loading">
        <div v-if="user" class="user-data-tooltip-tips">
          <div class="user-data-tooltip-tips-item">
            <div class="user-data-tooltip-tips-item-label">
              {{ $t('Menu.Admin') }}
            </div>
            <div class="user-data-tooltip-tips-item-value">
              {{ `${username}(${user.uid})` }}
            </div>
          </div>
          <div class="user-data-tooltip-tips-item m-t-10">
            <div class="user-data-tooltip-tips-item-label">
              {{ $t('Menu.UserGroupManage') }}
            </div>
            <div class="user-data-tooltip-tips-item-value">
              {{ `${user.userGroup.name}(${user.userGroup.gid})` }}
            </div>
          </div>
          <div class="user-data-tooltip-tips-item m-t-10">
            <div class="user-data-tooltip-tips-item-label">
              {{ $t('User.Fullname') }}
            </div>
            <div class="user-data-tooltip-tips-item-value">
              {{ `${user.fullName ? user.fullName : '-'}` }}
            </div>
          </div>
        </div>
      </a-spin>
    </template>
    <slot />
  </a-popover>
</template>

<script>
import UserService from '@/service/user'

export default {
  name: 'UserDataTooltip',
  props: {
    username: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      user: null,
      loading: false,
    }
  },
  methods: {
    async showTooltip() {
      this.loading = true
      if (this.user === null) {
        try {
          const res = await UserService.getUserByUsername(this.username)
          this.user = res
        } catch (err) {
          this.$message.error(err)
        } finally {
          this.loading = false
        }
      } else {
        this.loading = false
      }
    },
    clearUserData() {
      this.user = null
    },
  },
}
</script>

<style scoped>
.user-data-tooltip-tips-item {
  display: flex;
}
.user-data-tooltip-tips-item-label {
  margin-right: 20px;
  min-width: 50px;
  color: #999;
}
.user-data-tooltip-tips-item-value {
  font-weight: 400;
  color: #333;
}
</style>
