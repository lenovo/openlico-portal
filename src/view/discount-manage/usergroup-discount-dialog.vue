<template>
  <composite-form-dialog
    ref="innerDialog"
    :title="title"
    size="540px"
    :form-model="discountForm"
    :form-rules="discountRules"
    form-label-width="160px"
    :composite-height="400"
    :success-message-formatter="successMessageFormatter"
    :error-message-formatter="errorMessageFormatter">
    <a-form-model-item v-if="mode != 'editUserGroup'" :label="$t('Discount.Discount')" prop="discount">
      <a-input v-model="discountForm.discount" />
    </a-form-model-item>
    <a-form-model-item v-if="mode != 'editDiscount'" :label="$t('Discount.Type.UserGroup')" prop="names">
      <multi-tags-input
        id="tid_discount-usergroup"
        ref="userGroupsInput"
        v-model="discountForm.names"
        :new-tag-button-text="$t('Action.Add')"
        :valid-roles="nameRule"
        :allow-clear-all="false"
        :disabled="false" />
    </a-form-model-item>
  </composite-form-dialog>
</template>
<script>
import CompositeFormDialog from '../../component/composite-form-dialog'
import MultiTagInput from '../../component/multi-tags-input'
import DiscountService from '../../service/discount'
import ValidRoleFactory from '../../common/valid-role-factory'
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
      nameRule: [
        ValidRoleFactory.getLengthRoleForText(this.$t('Discount.Type.UserGroup'), 3, 32),
        ValidRoleFactory.getValidUserameForText(this.$t('Discount.Type.UserGroup'), true),
      ],
      discountRules: {
        names: [
          ValidRoleFactory.getRequireRoleForArray(this.$t('Discount.Type.UserGroup')),
          ValidRoleFactory.getLengthRoleForArray(this.$t('Discount.Type.UserGroup'), 0, 200),
          ValidRoleFactory.getUniqueRoleForArray(this.$t('Discount.Type.UserGroup')),
        ],
        discount: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Discount.Discount')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('Discount.Discount')),
          ValidRoleFactory.getNumberDecimalRoleForText(this.$t('Discount.Discount'), 2),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('Discount.Discount'), 0, 1),
        ],
      },
    }
  },
  methods: {
    submitForm() {
      let data
      if (this.$refs.userGroupsInput && this.$refs.userGroupsInput.errorMessage.length > 0) {
        return new Promise((resolve, reject) => {
          reject(this.$refs.userGroupsInput.errorMessage)
        })
      }
      if (this.mode === 'create') {
        data = []
        this.discountForm.names.forEach(el => {
          data.push({
            name: el,
            type: 'usergroup',
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
            type: 'usergroup',
            discount: this.discountForm.discount,
          })
        })
        return DiscountService.batchUpdateDiscount(data)
      }
      if (this.mode === 'editUserGroup') {
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
              type: 'usergroup',
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
      if (this.mode === 'editUserGroup') {
        return this.$t('Discount.Edit.UserGroup.Success')
      }
    },
    errorMessageFormatter(res) {
      const errMsg = res
      return this.$t(errMsg)
    },
    doCreate() {
      this.mode = 'create'
      this.title = this.$t('Discount.UserGroup.Create.Title')
      this.discountForm = {
        names: [],
        type: 'usergroup',
        discount: '',
      }
      this.$nextTick(() => {
        this.$refs.userGroupsInput.cleanInput()
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEditDiscount(users, discount) {
      this.editqueue = discount
      this.mode = 'editDiscount'
      this.title = this.$t('Discount.UserGroup.Edit.Title')
      this.discountForm = {
        names: users,
        type: 'usergroup',
        discount: discount[0].discount,
      }
      return this.$refs.innerDialog.popup(this.submitForm)
    },
    doEditUserGroup(users, discount) {
      this.editqueue = discount
      this.mode = 'editUserGroup'
      this.title = this.$t('Discount.UserGroup.Edit')
      this.discountForm = {
        names: users,
        type: 'usergroup',
        discount: discount[0].discount,
      }
      this.$nextTick(() => {
        this.$refs.userGroupsInput.cleanInput()
      })
      return this.$refs.innerDialog.popup(this.submitForm)
    },
  },
}
</script>

<style></style>
