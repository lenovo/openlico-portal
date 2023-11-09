<template>
  <div id="tid_dashboard-message" class="dashboard-message">
    <a-row class="dashboard-message-title m-b-20">
      <span class="dashboard-message-left dashboard-card-title">{{ $t('Dashboard.Message.title') }}</span>
    </a-row>
    <div class="dashboard-message-contenter">
      <ul v-for="(item, index) in messageData" :key="index" class="dashboard-message-card m-b-20">
        <li class="dashboard-message-line dashboard-message-name m-b-10">
          <span>{{ item.title }}</span
          ><span :title="item.name">{{ item.name }}</span>
        </li>
        <li class="dashboard-message-line dashboard-message-time">
          {{ item.time }}
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import Format from '@/common/format'
export default {
  props: ['initData', 'arch'],
  data() {
    return {
      messageData: [],
    }
  },
  watch: {
    initData(val, oldVal) {
      this.init()
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      if (this.initData && this.initData !== []) {
        this.messageData = []
        this.initData.forEach(item => {
          this.messageData.push({
            title: this.getMessageTitle(item),
            name: this.getMessageTargets(item),
            time: Format.formatDateTime(item.actionTime),
          })
        })
      }
    },
    getMessageTitle(item) {
      let text = this.$t('Operation.Module.' + item.action)
      if (item.module) {
        text += this.$t('Operation.Module.' + item.module) + ': '
      } else {
        text += ': '
      }
      return text
    },
    getMessageTargets(item) {
      let target = ''
      item.target.forEach((obj, index) => {
        if (index === item.target.length - 1) {
          target += obj.name
        } else {
          target += obj.name + ', '
        }
      })
      return target
    },
  },
}
</script>

<style scoped>
.dashboard-message-card {
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  font-size: 12px;
}
.dashboard-message-name {
  display: block;
  width: 100%;
  overflow: hidden;
  white-space: pre;
  text-overflow: ellipsis;
}
.dashboard-message-time {
  text-align: right;
}
</style>
