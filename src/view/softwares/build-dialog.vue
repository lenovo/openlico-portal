<template>
  <div>
    <composite-form-dialog
      ref="innerDialog"
      size="680px"
      type="submit"
      :title="$t('Softwares.Build.Title')"
      :form-model="formModel"
      :form-rules="formRules"
      :success-message-formatter="successMessageFormatter">
      <div class="build-module-info">
        <p class="build-module-item">
          <span class="build-module-item-label">{{ $t('Softwares.Build.Filename') }}</span>
          <span class="build-module-item-value">{{ formModel.filename }}</span>
        </p>
        <p class="build-module-item">
          <span class="build-module-item-label">{{ $t('Name') }}</span>
          <span class="build-module-item-value">{{ formModel.name }}</span>
        </p>
        <p class="build-module-item">
          <span class="build-module-item-label">{{ $t('Softwares.Build.Version') }}</span>
          <span class="build-module-item-value">{{ formModel.version }}</span>
        </p>
        <p class="build-module-item">
          <span class="build-module-item-label">{{ $t('Softwares.Build.Home') }}</span>
          <span class="build-module-item-value">
            <a :href="formModel.home" target="_blank"> {{ formModel.home }}</a>
          </span>
        </p>
        <p class="build-module-item">
          <span class="build-module-item-label">{{ $t('Softwares.Build.Description') }}</span>
          <span class="build-module-item-value">
            <p v-if="formModel.description" class="build-module-description">{{ formModel.description }}</p>
          </span>
        </p>
      </div>
      <a-form-item :label="$t('Softwares.Build.Queue')" name="queue">
        <queue-selector ref="queueSelector" v-model:value="formModel.queue" style="width: 100%" />
      </a-form-item>
      <a-form-item :label="$t('Softwares.Build.Nodes')" name="nodes">
        <a-input v-model:value="formModel.nodes" disabled></a-input>
      </a-form-item>
      <a-form-item :label="$t('Softwares.Build.Cpu')" name="cpu">
        <a-input v-model:value="formModel.cpu"></a-input>
      </a-form-item>
      <a-form-item :label="$t('Softwares.Build.Args')" name="args">
        <a-input v-model:value="formModel.args"></a-input>
      </a-form-item>
    </composite-form-dialog>
  </div>
</template>
<script>
import SoftwaresService from '@/service/softwores'
import ValidRoleFactory from '@/common/valid-role-factory'
import CompositeFormDialog from '@/component/composite-form-dialog.vue'
import QueueSelector from '@/widget/queue-selector.vue'
export default {
  components: { CompositeFormDialog, QueueSelector },
  data() {
    return {
      mode: '',
      formModel: {
        filename: '',
        name: '',
        version: '',
        home: '',
        description: '',
        queue: '',
        nodes: 1,
        cpu: 1,
        args: '',
      },
      formRules: {
        queue: [ValidRoleFactory.getRequireRoleForText(this.$t('Softwares.Build.Queue'))],
        nodes: [ValidRoleFactory.getRequireRoleForText(this.$t('Softwares.Build.Nodes'))],
        cpu: [
          ValidRoleFactory.getRequireRoleForText(this.$t('Softwares.Build.Cpu')),
          ValidRoleFactory.getValidNumberRoleForText(this.$t('Softwares.Build.Cpu')),
          ValidRoleFactory.getNumberRangeRoleForText(this.$t('Softwares.Build.Cpu'), 1, 999),
        ],
      },
      queueOptions: [],
    }
  },
  methods: {
    doSubmit() {
      return SoftwaresService.buildSoftware(this.formModel)
    },
    successMessageFormatter(res) {
      return this.$T('Softwares.Build.Success', { id: res.schedulerId })
    },
    doOpenBuild(data) {
      const { filename, name, version, home = '', path = '', description = '' } = data
      this.formModel = {
        filename,
        name,
        version,
        home,
        description,
        path,
        queue: '',
        nodes: 1,
        cpu: 1,
        args: '',
      }
      return this.$refs.innerDialog.popup(this.doSubmit)
    },
  },
}
</script>
<style scoped>
.build-module-info {
  padding: 20px;
  border: 1px solid #eee;
  margin-bottom: 20px;
}
.build-module-info .build-module-item {
  padding: 5px 0;
  display: flex;
}
.build-module-item-label {
  color: #999;
  /* display: inline-block; */
  width: 150px;
}
.build-module-item-value {
  width: 100%;
}
.build-module-description {
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
}
</style>
