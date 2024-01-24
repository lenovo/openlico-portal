<template>
  <div v-if="billGroup" class="height--100 m-10 billgroup-bj">
    <a-spin :spinning="spinning">
      <a-row class="p-20" style="display: block">
        <div class="billgroup-header billgroup-title p-b-10">
          <h4>{{ $t('BillGroup.Default.Policy') }}</h4>
          <a-button class="billgroup-edit-but m-l-20" @click="onEditClick">
            {{ $t('Action.Edit') }}
          </a-button>
        </div>
        <p class="p-t-10 m-l-20">
          {{ billGroupRate.cpu }}
        </p>
        <p class="p-t-10 m-l-20">
          {{ billGroupRate.memory }}
        </p>
        <p v-for="(item, index) in billGroupRate.gres" :key="index" class="p-t-10 m-l-20">
          {{ item }}
        </p>
        <!-- <p class="p-t-10 m-l-20">{{billGroupRate.storage}}</p> -->
      </a-row>
    </a-spin>
    <a-row class="p-20" style="display: block">
      <div class="billgroup-header billgroup-title p-b-10">
        <h4>{{ $t('BillGroup.Detail.Queue') }}</h4>
        <a-button class="billgroup-queue-edit-but m-l-20" @click="onCreateQueueClick">
          {{ $t('BillGroup.Action.Create') }}
        </a-button>
      </div>
      <billgroup-queue ref="billGroupQueue" :bill-group="billGroup" @update-billgroup="freshBillGroup" />
    </a-row>
    <a-row class="p-20" style="display: block">
      <div class="billgroup-header billgroup-title p-b-10">
        <h4>{{ $t('BillGroup.Detail.Storage') }}</h4>
        <a-button class="billgroup-storage-edit-but m-l-20" @click="onCreateStorageClick">
          {{ $t('BillGroup.Action.Create') }}
        </a-button>
      </div>
      <billgroup-storage ref="billGroupStorage" :bill-group="billGroup" @update-billgroup="freshBillGroup" />
    </a-row>
    <billgroup-dialog ref="billGroupDialog" />
  </div>
</template>
<script>
import BillGroupService from '@/service/bill-group'
import Format from '@/common/format'
import BillGroupDialog from './bill-group-manage/bill-group-dialog.vue'
import BillGroupQueues from './bill-group-manage/bill-group-queues.vue'
import BillGroupStorage from './bill-group-manage/bill-group-storage.vue'

export default {
  name: 'BillGroup',
  components: {
    'billgroup-queue': BillGroupQueues,
    'billgroup-storage': BillGroupStorage,
    'billgroup-dialog': BillGroupDialog,
  },
  data() {
    return {
      id: this.$route.params.id,
      billGroup: null,
      spinning: false,
      currency: this.$store.getters['settings/getCurrency'],
      gResource: window.gApp.$store.getters['settings/getGResource'],
      billGroupRate: {
        cpu: '',
        memory: '',
        gres: [],
        // storage: ''
      },
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.spinning = true
      BillGroupService.getBillGroupById(this.id).then(res => {
        this.billGroup = res
        const cpuRate = res.chargeRateDisplayType
          ? res.chargeRateDisplayType === 'hour'
            ? res.chargeRate
            : res.chargeRateMinute
          : res.chargeRate
          ? res.chargeRate
          : '0.0000'
        const cpuTimeUnit = res.chargeRateDisplayType ? res.chargeRateDisplayType : 'hour'
        this.billGroupRate.cpu = this.$T('BillGroup.Detail.CpuChargeRate', {
          value: Format.formatBillingRate(cpuRate, this.currency, true),
          time_type: this.$T(
            'BillGroup.ChargeRate.' + cpuTimeUnit.replace(cpuTimeUnit[0], cpuTimeUnit[0].toUpperCase()),
          ),
        })
        const memoryRate = res.memoryChargeRateDisplayType
          ? res.memoryChargeRateDisplayType === 'hour'
            ? res.memoryChargeRate
            : res.memoryChargeRateMinute
          : res.memoryChargeRate
          ? res.memoryChargeRate
          : '0.00'
        const memoryTimeUnit = res.memoryChargeRateDisplayType ? res.memoryChargeRateDisplayType : 'hour'
        this.billGroupRate.memory = this.$T('BillGroup.Detail.MemoryChargeRate', {
          value: Format.formatBillingRate(memoryRate, this.currency, true),
          time_type: this.$T(
            'BillGroup.ChargeRate.' + memoryTimeUnit.replace(memoryTimeUnit[0], memoryTimeUnit[0].toUpperCase()),
          ),
        })
        this.billGroupRate.gres = []
        const gresNames = Object.keys(res.gresChargeRate)
        gresNames.forEach(el => {
          const rate = res.gresChargeRateDisplayType[el]
            ? res.gresChargeRateDisplayType[el] === 'hour'
              ? res.gresChargeRate[el]
              : res.gresChargeRateMinute[el]
            : res.gresChargeRate[el]
            ? res.gresChargeRate[el]
            : '0.00'
          const timeUnit = res.gresChargeRateDisplayType[el] ? res.gresChargeRateDisplayType[el] : 'hour'
          const gresItem = this.getGresourceItem(el)
          this.billGroupRate.gres.push(
            this.$T('BillGroup.Detail.GresChargeRate', {
              name: gresItem.display_name,
              value: Format.formatBillingRate(rate, this.currency, true),
              unit: gresItem.unit,
              time_type: this.$T('BillGroup.ChargeRate.' + timeUnit.replace(timeUnit[0], timeUnit[0].toUpperCase())),
            }),
          )
        })
        // this.billGroupRate.storage = this.$t('BillGroup.Detail.StorageChargeRate', {value: Format.formatBillingRate(res.storageChargeRate)});
        this.spinning = false
      })
    },
    onEditClick() {
      this.$refs.billGroupDialog.doEdit(this.billGroup).then(
        res => {
          // Reload billgroup
          this.init()
          this.setUpdateImmediate()
        },
        res => {
          // Do nothing
        },
      )
    },
    onCopyClick() {
      this.$refs.billGroupDialog.doCopy(this.billGroup).then(
        res => {
          // Reload billgroup
          this.init()
          this.setUpdateImmediate()
        },
        res => {
          // Do nothing
        },
      )
    },
    onCreateQueueClick() {
      this.$refs.billGroupQueue.onCreateClick()
    },
    onCreateStorageClick() {
      this.$refs.billGroupStorage.onCreateClick()
    },
    getGresourceItem(type) {
      return this.gResource.filter(i => i.code === type)[0] || {}
    },
    freshBillGroup() {
      this.init()
      this.setUpdateImmediate()
    },
    setUpdateImmediate() {
      window.gApp.updateImmediate = true
    },
  },
}
</script>
<style>
.billgroup-bj {
  background: #fff;
  box-sizing: border-box;
  height: 100%;
}
.billgroup-header {
  display: flex;
}
.billgroup-header > h4 {
  line-height: 28px;
  font-size: 16px;
}
.billgroup-title {
  box-sizing: border-box;
  border-bottom: 1px solid #eee;
}
</style>
