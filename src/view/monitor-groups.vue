<template>
  <div class="height--100 group-view p-10">
    <div class="MonitorGroupAction p-20" style="display: flex">
      <a-select
        id="tid_monitor-groups-group"
        v-model:value="groupName"
        style="min-width: 100px"
        @change="onNodeGroupChange">
        <a-select-option v-for="group in nodeGroups" :key="group.id" :value="group.name">
          {{ group.name }}
        </a-select-option>
      </a-select>
      <a-button-group v-if="nodeGroups.length > 0" style="margin-left: 35px">
        <a-button
          id="tid_monitor-groups-list"
          :type="displayedContentType == 'list' ? 'primary' : 'default'"
          @click="onActionButtonClick('list')">
          {{ $t('NodeGroup.Tab.Title.List') }}
        </a-button>
        <a-button
          id="tid_monitor-groups-trend"
          :type="displayedContentType == 'trend' ? 'primary' : 'default'"
          @click="onActionButtonClick('trend')">
          {{ $t('NodeGroup.Tab.Title.Trend') }}
        </a-button>
        <a-button
          id="tid_monitor-groups-healthy"
          :type="displayedContentType == 'healthy' ? 'primary' : 'default'"
          @click="onActionButtonClick('healthy')">
          {{ $t('NodeGroup.Tab.Title.Health') }}
        </a-button>
      </a-button-group>
    </div>

    <div v-if="nodeGroups.length > 0" class="table-top-manage">
      <group-list v-if="displayedContentType == 'list'" :node-external-filter="nodeExternalFilter" />
      <group-trend v-if="displayedContentType == 'trend'" :current-selected-group-id="groupName" />
      <group-health v-if="displayedContentType == 'healthy'" :group-name="groupName" />
    </div>
  </div>
</template>
<script>
import GroupList from './monitor-groups/group-list.vue'
import GroupTrend from './monitor-groups/group-trend.vue'
import GroupHealth from './monitor-groups/group-health.vue'
import NodeGroupService from '@/service/node-group'

export default {
  components: {
    'group-list': GroupList,
    'group-trend': GroupTrend,
    'group-health': GroupHealth,
  },
  data() {
    return {
      nodeExternalFilter: {},
      displayedContentType: 'list',
      groupName: '',
      nodeGroups: [],
    }
  },
  mounted() {
    this.initNodeGroupOptions()
  },
  methods: {
    onActionButtonClick(type) {
      this.displayedContentType = type
    },
    initNodeGroupOptions() {
      NodeGroupService.getAllNodeGroups().then(
        res => {
          if (res.length > 0) {
            this.groupName = res[0].name
          }
          this.nodeGroups = res
          this.onNodeGroupChange()
        },
        res => {
          this.$message.error(res)
        },
      )
    },
    onNodeGroupChange() {
      this.nodeExternalFilter = {
        groups: {
          values: [this.groupName],
          type: 'in',
        },
      }
    },
  },
}
</script>
