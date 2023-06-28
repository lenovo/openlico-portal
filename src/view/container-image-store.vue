<template>
  <div class="container-image height--100 p-10">
    <div class="height--100 container-images">
      <composite-table
        id="Container_Images_Table"
        ref="imageTable"
        row-key="id"
        :columns="columns"
        :table-data-fetcher="tableDataFetcher"
        :search-enable="true"
        :search-props="['name', 'status', 'version', 'tag']"
        :auto-refresh="30 * 1000">
        <div slot="controller" class="composite-table-controller">
          <a-button id="Create_Container_Import_Button" type="primary" class="action-button" @click="onCreateClick">
            {{ $t('Action.Import') }}
          </a-button>
          <a-button
            v-if="canBuild()"
            id="Create_Container_Build_Button"
            type="primary"
            class="action-button"
            @click="onBuildClick">
            {{ $t('Action.Build') }}
          </a-button>
        </div>
        <template slot="tags" slot-scope="{ tags }">
          <a-tag v-for="item in tags" :key="item" style="margin-right: 2px">{{ item }}</a-tag>
        </template>
        <template slot="status" slot-scope="{ status }">
          <image-status-label :status="status"></image-status-label>
        </template>
        <a-dropdown slot="action" slot-scope="{ row }" :trigger="['click']" placement="bottomLeft">
          <a-button v-show="canDelete(row) || canBrowse(row) || canDownload(row) || canReupload(row)">
            {{ $t('Action') }}
            <a-icon type="down" />
          </a-button>
          <a-menu slot="overlay">
            <a-menu-item v-if="canDelete(row)" @click="editImage(row)">{{ $t('Action.Edit') }} </a-menu-item>
            <a-menu-item v-if="canBrowse(row)" @click="showPath(row)">{{ $t('Action.Browse') }} </a-menu-item>
            <a-menu-item v-if="canDelete(row)" @click="deleteImage(row)">{{ $t('Action.Delete') }} </a-menu-item>
            <a-menu-item v-if="canDownload(row)" @click="downloadImage(row)"> {{ $t('Action.Download') }}</a-menu-item>
            <a-menu-item v-if="canReupload(row)" @click="reupload(row)">{{ $t('Action.Reupload') }} </a-menu-item>
          </a-menu>
        </a-dropdown>
      </composite-table>
      <ai-image-dialog ref="imageDialog" />
      <image-build-dialog ref="imageBuildDialog" @refreshContainerImageStoreTable="refreshContainerImageStoreTable" />
      <image-action ref="imageActionDialog" />
      <image-message ref="imageMessageDialog" />
    </div>
  </div>
</template>
<script>
import CompositeTable from '../component/composite-table'
import ImageService from '../service/image'
import ImageDialog from './container-image-manage/image-create-dialog'
import ImageBuildDialog from './container-image-manage/image-build/image-build-dialog'
import ImageAction from './container-image-manage/image-action-dialog'
import ImageMessage from './container-image-manage/image-message-dialog'
import ImageStatusLabel from '../widget/image-status-label'
import Format from '../common/format'
import AccessService from '../service/access'

export default {
  components: {
    'composite-table': CompositeTable,
    'ai-image-dialog': ImageDialog,
    'image-build-dialog': ImageBuildDialog,
    'image-status-label': ImageStatusLabel,
    'image-action': ImageAction,
    'image-message': ImageMessage,
  },
  data() {
    return {
      tableDataFetcher: ImageService.getImagesTableDataFetcher(this.$store.state.auth.access),
      role: this.$store.state.auth.access,
      username: this.$store.state.auth.username,
      userId: this.$store.state.auth.userid,
      show: false,
      currentImage: '',
      arch: AccessService.getSchedulerArch(),
      columns: [
        {
          title: this.$t('Image.Id'),
          dataIndex: 'id',
          sorter: true,
          defaultSortOrder: 'descend',
          width: 70,
          align: 'left',
        },
        {
          title: this.$t('Image.Name'),
          dataIndex: 'name',
          sorter: true,
          align: 'left',
        },
        {
          title: this.$t('Image.Framework'),
          dataIndex: 'framework',
          sorter: true,
          customRander: val => this.$t(`Image.Framework${val}`),
          align: 'left',
        },
        {
          title: this.$t('Image.Type'),
          dataIndex: 'username',
          customRender: val => this.$t(`Image.Type.${val ? 'Private' : 'System'}`),
          sorter: true,
          width: 80,
          align: 'left',
        },
        {
          title: this.$t('Image.Version'),
          dataIndex: 'version',
          // width: 120,
          align: 'left',
        },
        {
          title: this.$t('Image.Tag'),
          dataIndex: 'tags',
          scopedSlots: { customRender: 'tags' },
          // width: 180,
          align: 'left',
        },
        {
          title: this.$t('Action'),
          key: 'actoin',
          scopedSlots: { customRender: 'action' },
          width: 100,
        },
      ],
    }
  },
  mounted() {
    if (this.arch === 'host') {
      this.columns.splice(6, 0, {
        title: this.$t('Image.Status'),
        dataIndex: 'status',
        scopedSlots: { customRender: 'status' },
        width: 120,
        align: 'left',
      })
    }
  },
  methods: {
    sizeFormatter(row, column) {
      if (column.property === 'fileSize') {
        return Format.formatByteSize(row.fileSize)
      }
    },
    columnFormatter(row, column) {
      if (column.property === 'createTime') {
        return Format.formatDateTime(row.createTime)
      }
    },
    canBrowse(data) {
      const status = data.status
      const condition = ['success']
      return this.arch === 'host' && (condition.includes(status) || !status)
    },
    canDownload(data) {
      const status = data.status
      const condition = ['success']
      return this.arch === 'host' && (condition.includes(status) || !status)
    },
    canDelete(data) {
      const status = data.status
      const actionStatus = ['success', 'failure']
      if (this.role === 'admin') {
        return actionStatus.includes(status) || !status
      } else if (this.role === 'staff') {
        return data.username && actionStatus.includes(status)
      }
    },
    canReupload(data) {
      return this.arch === 'host' && this.canDelete(data)
    },
    canBuild() {
      return this.arch === 'host'
    },
    onCreateClick() {
      this.$refs.imageDialog.doImport().then(
        res => {
          // Reload table data
          setTimeout(() => {
            this.$refs.imageTable.fetchTableData(true)
          }, 1000)
        },
        res => {
          // Do nothing
        },
      )
    },
    onBuildClick() {
      this.$refs.imageBuildDialog.doBuild().then(
        res => {
          // Reload table data
          console.log(this.$refs.imageTable)
          setTimeout(() => {
            this.$refs.imageTable.fetchTableData(true)
          }, 1000)
        },
        res => {
          // Do nothing
        },
      )
    },
    deleteImage(data) {
      this.$refs.imageActionDialog.doDelete(data).then(
        res => {
          // Reload table data
          this.$refs.imageTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    downloadImage(data) {
      this.$refs.imageActionDialog.doDownload(data).then(
        res => {
          this.$refs.imageTable.fetchTableData(true)
        },
        res => {},
      )
    },
    reupload(data) {
      this.$refs.imageActionDialog.doReupload(data).then(
        res => {
          // Reload table data
          this.$refs.imageTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    editImage(data) {
      this.$refs.imageDialog.doEdit(data).then(
        res => {
          // Reload table data
          this.$refs.imageTable.fetchTableData(true)
        },
        res => {
          // Do nothing
        },
      )
    },
    showPath(data) {
      this.$refs.imageMessageDialog.doBrowse(data)
    },
    onActionCommand(command) {
      const fn = command.fn
      const argument = command.argument
      fn(argument)
    },
    refreshContainerImageStoreTable() {
      this.$refs.imageTable.fetchTableData(true)
    },
  },
}
</script>
<style scoped>
.action-button {
  margin-right: 10px;
}
.includes:hover {
  cursor: auto;
}
.description {
  width: 200px;
  word-wrap: break-word;
}
.nova:hover {
  text-overflow: inherit;
  overflow: visible;
  white-space: pre-line;
}
.disableClass >>> .demonstration {
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  line-height: 32px;
  display: block;
  padding: 0 15px 0 15px;
  cursor: not-allowed;
  color: #c0c4cc;
  font-size: 12px;
}
</style>
