<template>
  <div class="p-10 monitor-racks">
    <a-row
      v-for="(room, index) in rooms"
      :key="index"
      :span="24"
      type="flex"
      justify="space-between"
      class="MonitorRoomContainer">
      <a-col :span="16">
        <a-row id="tid_monitor-racks-roomname">
          <h3>{{ room.roomName }}</h3>
        </a-row>
        <a-row style="margin-top: 20px">
          <a-col id="tid_monitor-racks-location" class="room-top-monitor" :span="8">
            <img src="/static/img/system/physical/monitor_house.png" />
            <span>{{ room.location }}</span>
          </a-col>
          <a-col id="tid_monitor-racks-nodes" class="room-top-monitor" :span="8">
            <img src="/static/img/system/physical/monitor_node.png" />
            <span>{{ room.nodeNumber || '-' }}</span>
            <span style="padding-left: 5px">
              {{ $t('Physical.Room.Node.Unit') }}
            </span>
          </a-col>
          <a-col id="tid_monitor-racks-energy" class="room-top-monitor" :span="8">
            <img src="/static/img/system/physical/monitor_power.png" />
            <span>{{ roomEnergy || '-' }}</span>
            <span style="padding-left: 5px">
              {{ $t('Monitor.Group.Ene.Unit') }}
            </span>
          </a-col>
        </a-row>
      </a-col>
      <a-col :span="8" />
    </a-row>
    <a-row v-if="rows.length > 0" :span="24" type="flex" justify="space-between" class="MonitorRowContainer">
      <a-col id="tid_monitor-racks-row-list" :span="7" class="RowList">
        <a-button
          v-for="(row, rowIndex) in rows"
          :key="rowIndex"
          class="RowItem"
          style="height: 60px"
          :type="row.rowId == currentRowId ? 'primary' : 'normal'"
          @click="onSelectRowItem(row.rowId)">
          <a-row>
            <a-col :span="8">
              <div class="rowInfo">
                {{ row.rowName }}
              </div>
            </a-col>
            <a-col :span="5">
              <div>{{ row.totalRacks }}</div>
              <div style="margin-top: 5px">
                {{ $t('Physical.RowList.Rack') }}
              </div>
            </a-col>
            <a-col :span="5">
              <div>{{ row.totalNode }}</div>
              <div style="margin-top: 5px">
                {{ $t('Physical.RowList.Node') }}
              </div>
            </a-col>
            <a-col :span="5">
              <div>
                {{ formatEnergy(row.totalEnergy) }}
                {{ $t('Monitor.Group.Ene.Unit') }}
              </div>
              <div style="margin-top: 5px">
                {{ $t('Physical.RowList.Energy') }}
              </div>
            </a-col>
          </a-row>
        </a-button>
      </a-col>
      <a-col :span="17" class="RackList">
        <a-spin :spinning="loading">
          <div class="physical-row-rack" style="min-height: 280px">
            <div
              v-for="rack in racks"
              id="tid_monitor-racks-rack-thumbnail-list"
              :key="rack.id"
              @click="redirectToRackDetail(rack.rackName)">
              <rack-thumbnail
                height="240px"
                width="96px"
                notify-num=""
                :nodes="rack.nodeNumber"
                :energy="rack.energy"
                :used-number="rack.usedNumber"
                :off-number="rack.offNumber"
                :busy-number="rack.busyNumber"
                :free-number="rack.freeNumber"
                :rack-name="rack.rackName" />
            </div>
          </div>
        </a-spin>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import RackThumbnail from './monitor-racks/rack-thumbnail.vue'
import RoomService from '@/service/room'
import Format from '@/common/format'
export default {
  components: {
    'rack-thumbnail': RackThumbnail,
  },
  data() {
    return {
      rooms: [],
      rows: [],
      racks: [],
      loading: false,
      roomEnergy: '',
      currentRowId: null,
      currentRow: [],
      refreshTimeout: null,
      refreshInterval: 30000,
    }
  },
  watch: {
    rows(val, oldVal) {
      let roomEnergy = 0
      val.forEach(row => {
        roomEnergy += row.totalEnergy
      })
      this.roomEnergy = this.formatEnergy(roomEnergy)
    },
  },
  created() {
    this.getRooms()
    this.getRows()
  },
  beforeUnmount() {
    clearTimeout(this.refreshTimeout)
  },
  methods: {
    getRooms() {
      RoomService.getAllRooms().then(res => {
        this.rooms = res.data
      })
    },
    getRows() {
      RoomService.getAllRowListItems().then(res => {
        if (res.length > 0) {
          this.rows = res
          this.currentRowId = this.currentRowId ? this.currentRowId : this.rows[0].rowId
          this.currentRow = res.filter(r => r.rowId === this.currentRowId)[0]
          this.getRacks()
        }
      })
    },
    getRowsMonitor() {
      const names = this.rows.map(row => row.rowName)
      RoomService.getRowItemByNames(names).then(res => {
        // let energy = 0
        this.rows.map(row => {
          const result = res.filter(i => row.rowName === i.name)[0]
          // energy += result.total_energy
          row.totalEnergy = result.total_energy
          return row
        })
      })
    },
    getRacks() {
      clearTimeout(this.refreshTimeout)
      RoomService.getRackMonitorByNames(this.currentRow).then(res => {
        if (this.currentRowId === this.currentRow.rowId) {
          this.racks = res
          this.loading = false
          this.refresh()
        }
      })
    },
    refresh() {
      clearTimeout(this.refreshTimeout)
      this.refreshTimeout = setTimeout(() => {
        this.getRowsMonitor()
        this.getRacks()
      }, this.refreshInterval)
    },
    onSelectRowItem(rowId) {
      this.loading = true
      this.currentRowId = rowId
      this.currentRow = this.rows.filter(r => r.rowId === rowId)[0]
      this.getRacks()
    },
    redirectToRackDetail(rackId) {
      const path = './rack/' + rackId
      this.$router.push(path)
    },
    formatEnergy(energy) {
      return Format.formatEnergy(energy, 1000) // 1000w = 1kW
    },
  },
}
</script>

<style>
.MonitorRoomContainer {
  background-color: #ffffff;
  padding: 20px;
}
.MonitorRowContainer {
  margin-top: 20px;
}
.room-top-monitor {
  display: flex;
}
.room-top-monitor img {
  margin-right: 5px;
}
.room-top-monitor span {
  line-height: 16px;
}
.RowList {
  background-color: #ffffff;
  padding: 20px;
}

.RowItem {
  margin-bottom: 10px;
  width: 100%;
}
.physical-row-rack {
  display: flex;
  flex-wrap: wrap;
  background-color: #fff;
  margin-left: 20px;
}
.physical-row-rack > div {
  margin-right: 20px;
  padding: 20px;
}
.rowInfo {
  text-align: center;
  line-height: 45px;
  font-weight: bold;
}
</style>
