<template>
  <div class="height--100">
    <composite-table
      id="tid_discount-user-table"
      ref="discountUserTable"
      :row-key="row => row.id"
      :columns="columns"
      :table-data="tableData"
      :pagination-enable="false"
      :page-sizes="[]">
      <template #controller>
        <a-button id="tid_discount-user-create" type="primary" @click="onCreateClick">
          {{ $t('Discount.Create') }}
        </a-button>
      </template>
      <template #name="{ row }">
        <span>
          <a-tag v-for="tag in row.name" :key="tag">
            {{ tag }}
          </a-tag>
        </span>
      </template>
      <template #action="{ row }">
        <a-dropdown :trigger="['click']" placement="bottomLeft">
          <a-button>
            {{ $t('Action') }}
            <down-outlined />
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="onEditUsersClick(row)">
                {{ $t('Discount.User.Edit') }}
              </a-menu-item>
              <a-menu-item key="2" @click="onEditClick(row)">
                {{ $t('Discount.Discount.Edit') }}
              </a-menu-item>
              <a-menu-item key="3" @click="onDeleteClick(row)">
                {{ $t('Action.Delete') }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </composite-table>
    <user-discount-create-dialog ref="discountCreateDialog" />
  </div>
</template>

<script>
import CompositeTable from '@/component/composite-table.vue'
import UserDiscountCreateDialog from './discount-dialog.vue'
import DiscountService from '@/service/discount'
export default {
  components: {
    'composite-table': CompositeTable,
    'user-discount-create-dialog': UserDiscountCreateDialog,
  },
  props: ['discount'],
  emits: ['update-discount'],
  data() {
    return {
      sourceData: [],
      tableData: [],
      columns: [
        {
          align: 'cneter',
          title: this.$t('Discount.Discount'),
          dataIndex: 'discount',
          defaultSortOrder: 'ascend',
        },
        {
          align: 'left',
          title: this.$t('Discount.Type.User'),
          dataIndex: 'name',
          customSlot: true,
        },
        {
          title: this.$t('Action'),
          key: 'action',
          customSlot: true,
        },
      ],
      userType: 'User',
    }
  },
  watch: {
    discount(val, oldVal) {
      if (val) {
        this.sourceData = val.user
        const formatData = []
        this.sourceData.forEach(el => {
          let exist = false
          let repeat = null
          for (let i = 0; i < formatData.length; i++) {
            if (formatData[i].discount === el.discount) {
              exist = true
              repeat = el
              break
            }
          }
          if (!exist) {
            formatData.push({
              id: el.id,
              name: [el.name],
              type: el.type,
              discount: el.discount,
            })
          } else {
            formatData.forEach(el => {
              if (el.discount === repeat.discount) {
                el.name.push(repeat.name)
              }
            })
          }
        })
        this.tableData = formatData
      }
    },
  },
  methods: {
    onCreateClick() {
      this.$refs.discountCreateDialog.doCreate(this.userType).then(
        res => {
          this.$emit('update-discount')
        },
        _ => {
          this.$emit('update-discount')
        },
      )
    },
    onEditClick(discount) {
      const data = []
      discount.name.forEach(el => {
        this.sourceData.forEach(item => {
          if (el === item.name) {
            data.push({
              id: item.id,
              name: item.name,
              type: item.type,
              discount: item.discount,
            })
          }
        })
      })
      this.$refs.discountCreateDialog.doEditDiscount(discount.name, data, this.userType).then(
        res => {
          this.$emit('update-discount')
        },
        _ => {
          this.$emit('update-discount')
        },
      )
    },
    onEditUsersClick(discount) {
      const data = []
      discount.name.forEach(el => {
        this.sourceData.forEach(item => {
          if (el === item.name) {
            data.push({
              id: item.id,
              name: item.name,
              type: item.type,
              discount: item.discount,
            })
          }
        })
      })
      this.$refs.discountCreateDialog.doEditUser(discount.name, data, this.userType).then(
        res => {
          this.$emit('update-discount')
        },
        _ => {
          this.$emit('update-discount')
        },
      )
    },
    onDeleteClick(discount) {
      const $this = this
      const data = []
      discount.name.forEach(el => {
        this.sourceData.forEach(item => {
          if (el === item.name) {
            data.push({
              id: item.id,
              name: item.name,
              type: item.type,
              discount: item.discount,
            })
          }
        })
      })
      this.$confirm({
        title: this.$t('Discount.User.Delete.Title'),
        content: this.$t('Discount.Delete.Tips'),
        okText: this.$t('Dialog.Yes'),
        cancelText: this.$t('Dialog.No'),
        onOk() {
          DiscountService.batchDeleteDiscount(data).then(
            res => {
              $this.$emit('update-discount')
              $this.$message.success(
                $this.$t('Discount.Delete.Success', {
                  name: $this.sourceData[0].discount,
                }),
              )
            },
            _ => {
              $this.$emit('update-discount')
            },
          )
        },
      })
    },
  },
}
</script>

<style scoped>
.tag-container {
  padding: 5px;
  display: inline-block;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding: 0 10px;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
