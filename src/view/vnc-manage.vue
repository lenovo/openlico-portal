<template>
  <div class="height--100 p-10">
    <composite-table
      v-if="autoRefresh"
      id="tid_vnc-table"
      ref="VNCTable"
      :columns="columns"
      row-key="id"
      :table-data-fetcher="tableDataFetcher"
      :search-enable="true"
      :search-props="['name', 'username', 'schedulerId']"
      :current-page="1"
      :page-sizes="['10', '20', '40', '50']"
      :page-size="20"
      :total="0"
      :auto-refresh="autoRefresh"
      :show-error-message="false"
      @table-data-fetch-error="tableDataFetchError">
      <template #schedulerId="{ row, schedulerId }">
        <a v-if="schedulerId !== 0" href="javascript:;" class="el-button--wrap" @click="onSchedulerIdClick(row)">{{
          schedulerId
        }}</a>
        <span v-else>-</span>
      </template>
      <template #action="{ row }">
        <a-dropdown placement="bottomLeft" :trigger="['click']">
          <a-button>
            {{ $t('Action') }}
            <down-outlined />
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="OpenVNC(row)">
                {{ $t('VNC.Button.Open') }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </composite-table>
    <div v-else class="vnc-cannot-content">
      <img class="vnc-cannot-img placeholder-img" src="/static/img/system/main/vnc-cannot.svg" />
      <p class="vnc-cannot-tip">
        {{ $t('Error.RestAPI.Unavailable') }}
      </p>
    </div>
    <a-modal
      :open="showJobSchedulerInfo"
      :footer="null"
      :title="$t('JobManage.JobSchedulerInfo.Title')"
      @cancel="showJobSchedulerInfo = false">
      <a-textarea :auto-size="{ maxRows: 10 }" read-only :value="jobSchedulerInfo" style="resize: none" />
    </a-modal>
  </div>
</template>
<script>
import VNCService from '@/service/vnc'
import JobService from '@/service/job'
import CompositeTable from '@/component/composite-table.vue'

export default {
  components: {
    CompositeTable,
  },
  data() {
    const username = this.$store.state.auth.access === 'admin' ? '' : this.$store.state.auth.username
    return {
      tableDataFetcher: VNCService.getVNCTableDataFetcher(username),
      autoRefresh: 30 * 1000,
      columns: [
        {
          title: this.$t('VNC.Title.Name'),
          dataIndex: 'name',
          sorter: true,
          defaultSortOrder: 'descend',
        },
        {
          title: this.$t('VNC.Title.Host'),
          dataIndex: 'host',
          sorter: true,
        },
        {
          title: this.$t('VNC.Title.Port'),
          dataIndex: 'port',
          sorter: true,
        },
        {
          title: this.$t('VNC.Title.Username'),
          dataIndex: 'username',
          sorter: true,
        },
        {
          title: this.$t('VNC.Title.Pid'),
          dataIndex: 'pid',
          sorter: true,
        },
        {
          title: this.$t('VNC.Title.SchedulerId'),
          dataIndex: 'schedulerId',
          sorter: true,
          customSlot: true,
        },
        {
          title: this.$t('VNC.Title.Index'),
          dataIndex: 'index',
          sorter: true,
        },
        {
          title: this.$t('VNC.Title.Operation'),
          key: 'action',
          customSlot: true,
        },
      ],
      showJobSchedulerInfo: false,
      jobSchedulerInfo: '',
    }
  },
  methods: {
    onSchedulerIdClick(vnc) {
      JobService.getJobSchedulerInfo(vnc.jobId).then(
        res => {
          this.jobSchedulerInfo = res
          this.showJobSchedulerInfo = true
        },
        err => {
          this.$message.error(err)
        },
      )
    },
    OpenVNC(data) {
      const origin = location.origin
      const params = {
        path: '/websockify',
        token: data.token,
      }
      const queryParams = []
      for (const k in params) {
        queryParams.push(k + '=' + params[k])
      }
      const query = queryParams.join('?')

      const target = origin + '/novnc/?' + query
      window.open(target)
    },
    tableDataFetchError(err) {
      if (err.status === 502) {
        this.autoRefresh = false
      } else {
        this.$message.error(err.message)
      }
    },
  },
}
</script>
<style media="screen">
.vnc-cannot-content {
  background: #fff;
  padding: 100px 0 200px;
  text-align: center;
}
.vnc-cannot-tip {
  margin-top: 20px;
  font-size: 20px;
}
</style>
