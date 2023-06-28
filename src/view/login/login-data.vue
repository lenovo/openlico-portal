<template>
  <div class="login-data">
    <div class="data-cpu">
      <div v-for="(item, index) in dataList" :key="index" class="data-box">
        <span class="box-icon">
          <i class="cell-icon" :class="`el-erp-${item.icon}`" />
        </span>
        <span>{{ item.title }}</span>
        <colony-info ref="colonyInfo" :data="item" />
      </div>
    </div>
  </div>
</template>

<script>
import AuthService from '../../service/auth'
import loginMonitorService from '../../service/login-monitor'
import ColonyInfo from './colony-info'
export default {
  components: {
    ColonyInfo,
  },
  data() {
    return {
      dataList: [],
      offDataShow: false,
      jobDataShow: false,
      refreshTimeout: null,
      refreshInterval: 15000,
    }
  },
  watch: {
    '$i18n.locale'(val, old) {
      this.$refs.colonyInfo.forEach(element => {
        element.getChartOption()
      })
    },
  },
  mounted() {
    this.getOverview()
  },
  beforeDestroy() {
    clearTimeout(this.refreshTimeout)
  },
  methods: {
    getOverview() {
      if (!AuthService.isLogin()) {
        loginMonitorService.loginResource().then(
          res => {
            const overview = res
            this.dataList = [
              {
                key: 'node',
                icon: 'spnode',
                title: 'Node',
                color: ['#671969', '#2B0C31', '#9E3AB7'],
                idle: null,
                off: null,
                used: null,
                colonyArr: [],
              },
              {
                key: 'cpu',
                icon: 'spcpu',
                title: 'CPU',
                color: ['#166A85', '#041D25', '#50B4D3'],
                idle: null,
                off: null,
                used: null,
                colonyArr: [],
              },
              {
                key: 'gpu',
                icon: 'spgpu',
                title: 'GPU',
                color: ['#0D4F20', '#03200B', '#47B967'],
                idle: null,
                off: null,
                used: null,
                colonyArr: [],
              },
            ]
            if (Object.keys(res).length === 0) {
              this.dataList = []
              this.offDataShow = false
              return
            } else if (Object.prototype.hasOwnProperty.call(overview, 'gpu')) {
              this.jobDataShow = false
              this.offDataShow = true
            } else {
              this.dataList.splice(2, 1)
              this.jobDataShow = true
              this.offDataShow = true
            }
            this.dataList.forEach((item, index) => {
              for (const key in overview[item.key]) {
                const obj = {}
                obj.value = overview[item.key][key]
                obj.name = key === 'used' ? 'Running' : key === 'idle' ? 'Idle' : key === 'off' ? 'Off' : ''
                item.colonyArr.push(obj)
              }
            })
            if (!this.refreshTimeout) {
              this.refresh()
            }
          },
          err => {
            this.$message.error(err)
          },
        )
      }
    },
    refresh() {
      this.refreshTimeout = setTimeout(() => {
        this.refreshTimeout = null
        this.getOverview()
      }, this.refreshInterval)
    },
  },
}
</script>

<style scoped>
.login-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 960px;
  overflow: hidden;
  width: 100%;
  padding: 0 10px;
  display: flex;
  justify-content: center;
}

.data-cpu {
  display: flex;
}

.data-box {
  width: 100%;
  min-width: 220px;
  max-width: 300px;
  height: 220px;
  border-radius: 20px;
  background-color: rgba(0, 0, 0, 0.2);
  margin-right: 30px;
  margin-bottom: 30px;
}

.data-box:last-child {
  margin-right: 0px;
}

.box-icon {
  display: inline-block;
  margin-right: 5px;
  margin-left: 16px;
  margin-top: 16px;
}

.data-gpu {
  display: flex;
}

.data-gpu-box {
  width: 100%;
  min-width: 220px;
  max-width: 300px;
  height: 220px;
  border-radius: 20px;
  background-color: rgba(0, 0, 0, 0.2);
  margin-right: 30px;
  padding: 10px;
}

.data-gpu-box:last-child {
  margin-right: 0px;
}
</style>
