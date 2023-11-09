<template>
  <div class="height--100 p-10">
    <div class="discount-container">
      <user-discount class="discount-user-table" :discount="discount" @update-discount="initTableData" />
      <user-group-discount class="discount-user-group-table" :discount="discount" @update-discount="initTableData" />
    </div>
  </div>
</template>
<script>
import DiscountService from '@/service/discount'
import UserDiscountTable from './discount-manage/user-discount.vue'
import UserGroupDiscountTable from './discount-manage/user-group-discount.vue'
export default {
  components: {
    'user-discount': UserDiscountTable,
    'user-group-discount': UserGroupDiscountTable,
  },
  data() {
    return {
      discount: null,
    }
  },
  mounted() {
    this.initTableData()
  },
  methods: {
    initTableData() {
      DiscountService.getAllDiscount().then(
        res => {
          this.discount = res
        },
        err => {
          this.$message.error(err)
        },
      )
    },
  },
}
</script>

<style>
.discount-container {
  display: flex;
}
.discount-user-table {
  width: 50%;
  margin-right: 20px;
}
.discount-user-group-table {
  width: 50%;
}
</style>
