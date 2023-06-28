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
      :search-props="['name', 'username']"
      :current-page="1"
      :page-sizes="['10', '20', '40', '50']"
      :page-size="20"
      :total="0"
      :auto-refresh="autoRefresh"
      :show-error-message="false"
      @table-data-fetch-error="tableDataFetchError">
      <a-dropdown slot="action" slot-scope="{ row }" placement="bottomLeft" :trigger="['click']">
        <a-button>
          {{ $t('Action') }}
          <a-icon type="down" />
        </a-button>
        <a-menu slot="overlay">
          <a-menu-item @click="OpenVNC(row)">
            {{ $t('VNC.Button.Open') }}
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </composite-table>
    <div v-else class="vnc-cannot-content">
      <img class="vnc-cannot-img placeholder-img" src="/static/img/system/main/vnc-cannot.svg" />
      <p class="vnc-cannot-tip">
        {{ $t('Error.RestAPI.Unavailable') }}
      </p>
    </div>
  </div>
</template>
<script>
import CompositeTable from '../component/composite-table'
import VNCService from '../service/vnc'

export default {
  components: {
    'composite-table': CompositeTable,
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
          title: this.$t('VNC.Title.Index'),
          dataIndex: 'index',
          sorter: true,
        },
        {
          title: this.$t('VNC.Title.Operation'),
          scopedSlots: { customRender: 'action' },
        },
      ],
    }
  },
  methods: {
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
