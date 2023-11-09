<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="540px"
    :form-model="discountForm"
    :form-rules="discountRules"
    form-label-width="160px"
    :success-message-formatter="successMessageFormatter">
    <a-form-item v-if="mode != 'editUser'" :label="$t('Discount.Discount')" name="discount">
      <a-input v-model:value="discountForm.discount" />
    </a-form-item>
    <a-form-item v-if="mode != 'editDiscount'" :label="$t(`Discount.Type.${userType}`)" name="names">
      <multi-tags-input
        id="tid_discount-user"
        ref="usersInput"
        v-model:value="discountForm.names"
        :new-tag-button-text="$t('Action.Add')"
        :valid-roles="nameRule"
        :allow-clear-all="false"
        :disabled="false" />
    </a-form-item>
  </composite-form-dialog>
</template>
<script>
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import MultiTagInput from '@/component/multi-tags-input.vue'
import DiscountService from '@/service/discount'
import ValidRoleFactory from '@/common/valid-role-factory'
export default {
  components: {
    'composite-form-dialog': CompositeFormDialog,
    'multi-tags-input': MultiTagInput,
  },
  data() {
    return {
      title: '',
      mode: '',
      editqueue: [],
      discountForm: {
        names: [],
        type: '',
        discount: '',
      },
      userType: '',
      nameRule: [],
      discountRules: {},
    }
  },
  methods: {
    submitForm() {
      let data
      if (this.$refs.usersInput && this.$refs.usersInput.errorMessage.length > 0) {
        return new Promise((resolve, reject) => {
          reject(this.$refs.usersInput.errorMessage)
        })
      }
      if (this.mode === 'create') {
        data = []
        this.discountForm.names.forEach(el => {
          data.push({
            name: el,
            type: this.userType.toLowerCase(),
            discount: this.discountForm.discount,
          })
        })
        return DiscountService.batchCreateDiscount(data)
      }
      if (this.mode === 'editDiscount') {
        data = []
        this.editqueue.forEach(el => {
          data.push({
            id: el.id,
            name: el.name,
            type: this.userType.toLowerCase(),
            discount: this.discountForm.discount,
          })
        })
        return DiscountService.batchUpdateDiscount(data)
      }
      if (this.mode === 'editUser') {
        data = {
          create: [],
          delete: [],
        }
        const sourceNames = []
        const commonNames = []
        const deleteNames = []
        const newNames = [...this.discountForm.names]
        this.editqueue.forEach(el => {
          sourceNames.push(el.name)
        })
        newNames.forEach((el, index) => {
          if (sourceNames.indexOf(el) >= 0) {
            commonNames.push(el)
          } else {
            data.create.push({
              name: el,
              type: this.userType.toLowerCase(),
              discount: this.discountForm.discount,
            })
          }
        })
        sourceNames.forEach(el => {
          if (commonNames.indexOf(el) < 0) {
            deleteNames.push(el)
          }
        })
        deleteNames.forEach(el => {
          this.editqueue.forEach(item => {
            if (el === item.name) {
              data.delete.push(item)
            }
          })
        })
        return DiscountService.batchCreateOrDeleteDiscount(data)
      }
    },
    successMessageFormatter(res) {
      if (this.mode === 'create') {
        return this.$t('Discount.Create.Success')
      }
      if (this.mode === 'editDiscount') {
        return this.$t('Discount.Edit.Discount.Success')
      }
      if (this.mode === 'editUser') {
        return this.$t(`Discount.Edit.${this.userType}.Success`)
      }
    },
    doCreate(userType) {
      this.mode = 'create'
      this.userType = userType
      this.discountFormValitate()
      this.title = this.$t(`Discount.${this.userType}.Create.Title`)
      this.discountForm = {
        names: [],
        type: this.userType.toLowerCase(),
        discount: '',
      }
      this.$nextTick(() => {
        this.$refs.usersInput.cleanInput()
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEditDiscount(users, discount, userType) {
      this.userType = userType
      this.editqueue = discount
      this.mode = 'editDiscount'
      this.discountFormValitate()
      this.title = this.$t(`Discount.${this.userType}.Edit.Title`)
      this.discountForm = {
        names: users,
        type: this.userType.toLowerCase(),
        discount: discount[0].discount,
      }
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEditUser(users, discount, userType) {
      this.userType = userType
      this.editqueue = discount
      this.mode = 'editUser'
      this.discountFormValitate()
      this.title = this.$t(`Discount.${this.userType}.Edit`)
      this.discountForm = {
        names: users,
        type: this.userType.toLowerCase(),
        discount: discount[0].discount,
      }
      this.$nextTick(() => {
        this.$refs.usersInput.cleanInput()
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    discountFormValitate() {
      this.nameRule = [
        ValidRoleFactory.getLengthRoleForText(this.$t(`Discount.Type.${this.userType}`), 3, 32),
        ValidRoleFactory.getValidUserameForText(this.$t(`Discount.Type.${this.userType}`), true),
      ]
      this.discountRules = {
        names: [
          ValidRoleFactory.getRequireRoleForArray(this.$t(`Discount.Type.${this.userType}`)),
          ValidRoleFactory.getLengthRoleForArray(this.$t(`Discount.Type.${this.userType}`), 0, 200),
          ValidRoleFactory.getUniqueRoleForArray(this.$t(`Discount.Type.${this.userType}`)),
        ],
        discount: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Discount.Discount')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('Discount.Discount')),
          ValidRoleFactory.getNumberDecimalRoleForText(this.$t('Discount.Discount'), 2),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('Discount.Discount'), 0, 1),
        ],
      }
    },
  },
}
</script>

<style></style>
