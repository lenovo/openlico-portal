<template>
  <a-spin :spinning="loading" style="height: 100%">
    <div class="composite-table b-w p-20">
      <a-row v-if="controllerHeaderEnable || controllerHeaderEnable == undefined" class="composite-table-header">
        <a-col :span="14" justify="left">
          <slot name="controller" />
        </a-col>
        <a-col :span="5" align="right">
          <slot name="filter"> &nbsp; </slot>
        </a-col>
        <a-col :span="5" align="right">
          <a-input
            v-if="searchEnable"
            v-model:value="searchKeyword"
            class="composite-table-search-input"
            style="max-width: 260px; color: rgba(0, 0, 0, 0.65)"
            :placeholder="searchPlaceholder"
            :title="searchPlaceholder"
            @keyup.enter="onSearchEnter"
            @blur="onSearchBlur">
            <template #prefix>
              <SearchOutlined style="color: rgba(0, 0, 0, 0.65)" />
            </template>
          </a-input>
        </a-col>
      </a-row>
      <div class="composite-table-body">
        <a-table
          ref="innerTable"
          :columns="innerColumns"
          :data-source="innerTableData"
          :show-sorter-tooltip="false"
          :pagination="false"
          :row-key="rowKey"
          :row-selection="
            selectionEnable
              ? {
                  type: selectTypeValue,
                  selectedRowKeys: selectionIndex,
                  onChange: onSelectionChange,
                  // onSelect,
                  // onSelectAll,
                }
              : null
          "
          @change="handleTableChange">
          <template #bodyCell="{ column, record }">
            <template v-if="column.customSlot">
              <slot :name="column.key" :[column.key]="record[column.key]" :row="record" :col="column"></slot>
            </template>
          </template>
        </a-table>
      </div>
      <div v-show="paginationEnable !== false && innerTotal > 0" class="composite-table-footer">
        <div class="table-footer-pagination">
          <a-pagination
            v-model:current="innerCurrentPage"
            v-model:page-size="innerPageSize"
            size="small"
            show-size-changer
            :page-size-options="innerPageSizes"
            :show-total="total => $T('CompositeTable.Footer.Total', { total: innerTotal })"
            @show-size-change="onPageSizeChange" />
        </div>
        <div class="table-footer-pagination" style="text-align: right">
          <a-pagination
            v-model:current="innerCurrentPage"
            size="small"
            :show-size-changer="false"
            show-quick-jumper
            :total="innerTotal"
            :page-size="innerPageSize"
            @change="onCurrentPageChange" />
        </div>
      </div>
    </div>
  </a-spin>
</template>
<script>
import TableDataFetcherFactory from '../common/table-data-fetcher-factory'
import PreferenceService from '../service/preference'

export default {
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'columns',
    // eslint-disable-next-line vue/require-prop-types
    'rowKey',
    // eslint-disable-next-line vue/require-prop-types
    'tableData',
    // eslint-disable-next-line vue/require-prop-types
    'tableDataFetcher',
    // eslint-disable-next-line vue/require-prop-types
    'selectionEnable',
    // eslint-disable-next-line vue/require-prop-types
    'paginationEnable',
    // eslint-disable-next-line vue/require-prop-types
    'currentPage',
    // eslint-disable-next-line vue/require-prop-types
    'pageSizes',
    // eslint-disable-next-line vue/require-prop-types
    'pageSize',
    // eslint-disable-next-line vue/require-prop-types
    'total',
    // eslint-disable-next-line vue/require-prop-types
    'searchEnable',
    // eslint-disable-next-line vue/require-prop-types
    'searchProps',
    // eslint-disable-next-line vue/require-prop-types
    'externalFilter',
    // eslint-disable-next-line vue/require-prop-types
    'autoRefresh',
    // eslint-disable-next-line vue/require-prop-types
    'showErrorMessage',
    // eslint-disable-next-line vue/require-prop-types
    'controllerHeaderEnable',
    // eslint-disable-next-line vue/require-prop-types
    'tableLoading',
    // eslint-disable-next-line vue/require-prop-types
    'showHeader',
    // eslint-disable-next-line vue/require-prop-types
    'selectType',
  ],
  emits: [
    'loading-change',
    'sort-change',
    'search-change',
    'page-change',
    'selection-change',
    'data-refreshed',
    'table-data-fetch-error',
  ],
  data() {
    return {
      requestId: 0,
      innerTableData: this.tableData,
      searchPlaceholder: this.$t('CompositeTable.SearchPlaceholder'),
      searchKeyword: '',
      innerPageSizes: this.pageSizes || PreferenceService.getPreferenceByKey('pageSizes'),
      innerPageSize: this.pageSize || PreferenceService.getPreferenceByKey('pageSize'),
      innerCurrentPage: this.currentPage || 1,
      innerTotal: this.total,
      innerSort: {},
      loading: false,
      autoRefreshInterval: 0,
      autoRefreshTimerId: 0,
      keywordCache: '',
      innerSortProp: '',
      selectionIndex: [],
    }
  },
  computed: {
    innerColumns() {
      return this.columns.map(item => {
        if (!item.align) {
          item.align = 'center'
        }
        if (item.key === undefined) {
          item.key = item.dataIndex
        }
        return item
      })
    },
    selectTypeValue() {
      if (this.selectType) {
        return this.selectType
      } else {
        return 'checkbox'
      }
    },
  },
  watch: {
    externalFilter: {
      handler: function (val, oldVal) {
        this.$nextTick(() => {
          this.fetchTableData(true)
        })
        this.clearSelection()
      },
      deep: true,
    },
    tableData: {
      handler: function (val, oldVal) {
        this.$nextTick(() => {
          this.fetchTableData(true)
        })
      },
    },
    loading: {
      handler: function (val, oldVal) {
        this.$emit('loading-change', val)
      },
    },
    tableLoading: {
      handler: function (val, oldVal) {
        this.loading = val
      },
    },
  },
  mounted() {
    this.innerShowHeader = this.showHeader
    this.autoRefreshInterval = this.autoRefresh
    this.autoRefreshTimerId = 0
    const defaultSort = this.columns.filter(item => item.defaultSortOrder)[0]
    this.innerSort = {
      prop: defaultSort.dataIndex,
      order: defaultSort.defaultSortOrder,
    }
    this.innerSortProp = defaultSort.defaultSortOrder
    this.loading = this.tableLoading
    this.fetchTableData(true)
  },
  beforeUnmount() {
    clearTimeout(this.autoRefreshTimerId)
    this.pauseAutoRefresh()
  },
  methods: {
    handleTableChange(pagination, filters, sorter) {
      this.innerSort.prop = sorter.columnKey
      this.innerSort.order = sorter.order
      this.fetchTableData(true)
      this.$emit('sort-change', this.innerSort.prop, this.innerSort.order)
    },
    pauseAutoRefresh() {
      // Set interval to zero will stop auto refresh.
      this.autoRefreshInterval = 0
      if (this.autoRefreshTimerId > 0) {
        clearTimeout(this.autoRefreshTimerId)
        this.autoRefreshTimerId = 0
      }
    },
    resumeAutoRefresh() {
      this.autoRefreshInterval = this.autoRefresh
      this.fetchTableData(false, true)
    },
    onSearchBlur(val) {
      this.searchKeyword = this.keywordCache
      window.document.onkeyup = null
    },
    onSearchEnter() {
      const self = this
      if (self.searchKeyword !== self.keywordCache) {
        self.searchKeyword = self.searchKeyword.trim()
        self.keywordCache = self.searchKeyword
        self.fetchTableData(true)
        self.$emit('search-change', self.searchKeyword)
      }
    },
    onPageSizeChange(current, val) {
      this.innerPageSize = val

      const pageSizes = PreferenceService.getPreferenceByKey('pageSizes')
      if (pageSizes.includes(val)) {
        PreferenceService.setPreferenceValue('pageSize', val)
      }

      // set first page to  current page // 6.0
      this.innerCurrentPage = 1

      this.fetchTableData(false)
      this.$emit('page-change', this.innerPageSize, this.innerCurrentPage)

      // 5.5
      // if (
      //     this.innerPageSize * (this.innerCurrentPage - 1) + 1 <=
      //     this.innerTotal
      // ) {
      //     this.fetchTableData(false);
      //     this.$emit(
      //         "page-change",
      //         this.innerPageSize,
      //         this.innerCurrentPage
      //     );
      // }
    },
    onCurrentPageChange(val) {
      this.innerCurrentPage = val
      this.fetchTableData(false)
      this.$emit('page-change', this.innerPageSize, this.innerCurrentPage)
      this.clearSelection()
    },
    onSelectionChange(selectedRowKeys, selectedRows) {
      this.selectionIndex = selectedRowKeys
      this.$emit('selection-change', selectedRows)
    },
    // onSelect(record, selected, selectedRows) {
    //   this.selectionIndex = this.getIndexBySelection(selectedRows)
    // },
    // onSelectAll(selected, selectedRows, changeRows) {
    //   this.selectionIndex = this.getIndexBySelection(selectedRows)
    // },
    fetchTableData(gotoStartPage, isAutoRefresh) {
      if (this._isDestroyed) return
      let tableDataFetcher = this.tableDataFetcher
      if ((tableDataFetcher === undefined || tableDataFetcher === null) && this.tableData !== null) {
        tableDataFetcher = TableDataFetcherFactory.createFixLocalPagingFetcher(this.tableData)
      }
      if (tableDataFetcher) {
        this.requestId++
        const pageSize = this.innerPageSize
        let currentPage = this.innerCurrentPage
        if (gotoStartPage) {
          currentPage = 1
        }
        const sort = {
          prop: this.innerSort.prop,
          order: this.innerSort.order,
        }

        const filters = []
        if (this.externalFilter) {
          const propNames = Object.getOwnPropertyNames(this.externalFilter)
          propNames.forEach(propName => {
            if (propName !== '__ob__') {
              const filterOption = {
                prop: propName,
                type: this.externalFilter[propName].type,
                values: this.externalFilter[propName].values,
              }
              if (this.externalFilter[propName].value_type) {
                filterOption.value_type = this.externalFilter[propName].value_type
              }
              filters.push(filterOption)
            }
            /*
                        if (propName = '__ob__') {
                            return;
                        }
                        var filterOption = {
                            prop: propName,
                            type: this.externalFilter[propName].type,
                            values: this.externalFilter[propName].values
                        };
                        filters.push(filterOption);
                        */
          })
        }
        let search = null
        if (this.searchEnable) {
          search = {
            props: this.searchProps,
            keyword: this.keywordCache,
          }
        } else {
          search = {
            props: [],
            keyword: this.keywordCache,
          }
        }
        if (isAutoRefresh) {
          // Do nothing
        } else {
          this.$nextTick(() => {
            this.loading = true
          })
        }
        tableDataFetcher.fetch(pageSize, currentPage, sort, filters, search, this.requestId).then(
          res => {
            if (!Object.prototype.hasOwnProperty.call(res, 'requestId') || res.requestId === this.requestId) {
              this.$emit('data-refreshed')
              this.innerTableData = res.data
              this.innerTotal = res.total
              this.innerPageSize = res.pageSize
              this.innerCurrentPage = res.currentPage
            }
            this.$nextTick(() => {
              this.loading = false
            })
            if (this.selectionIndex.length) {
              this.getRowDataBySelection()
            }
            if (this.autoRefreshInterval > 0) {
              const self = this
              if (this.autoRefreshTimerId > 0) {
                clearTimeout(this.autoRefreshTimerId)
              }
              this.autoRefreshTimerId = setTimeout(function () {
                self.fetchTableData(false, true)
              }, this.autoRefreshInterval)
            }
          },
          (errMsg, status) => {
            this.innerTableData = []
            this.innerTotal = 0
            this.innerPageSize = pageSize
            this.innerCurrentPage = 1
            if (this.showErrorMessage === false) {
              // Do nothing
            } else {
              this.$message.error(errMsg)
            }
            this.$emit('table-data-fetch-error', {
              message: errMsg,
              status: tableDataFetcher.status,
            })
            this.$nextTick(() => {
              this.loading = false
              // this.$refs.innerTable.doLayout();
            })
          },
        )
      }
    },
    reLayout() {
      // this.$refs.innerTable.doLayout();
    },
    getIndexBySelection(selection) {
      const indexs = []
      const rowKey = this.$refs.innerTable.rowKey
      this.innerTableData.forEach((row, index) => {
        if (selection.includes(row)) {
          indexs.push(row[rowKey])
        }
      })
      return indexs
    },
    getRowDataBySelection() {
      const selectResult = this.innerTableData.filter(item => {
        return this.selectionIndex.includes(item[this.rowKey])
      })
      this.selectionIndex = selectResult.map(item => item[this.rowKey])
      this.$emit('selection-change', selectResult)
    },
    clearSelection() {
      this.selectionIndex = []
      this.$emit('selection-change', [])
    },
  },
}
</script>
<style scoped>
.composite-table-header {
  margin-bottom: 20px;
  border: 0;
}
.composite-table-header-span {
  margin: 0 20px;
}
/* .table-header-color {
  color: #666;
}
.lico-table-header,
.lico-table-header th {
  background: #f8f8f8 !important;
  color: #666;
  border-top: 1px solid #eee;
} */
.lico-table-header-cell {
  font-weight: normal;
}
.composite-table-footer {
  margin-top: 20px;
  display: flex;
}
.composite-table-footer div:first-child :deep(.ant-pagination-prev),
.composite-table-footer div:first-child :deep(.ant-pagination-item),
.composite-table-footer div:first-child :deep(.ant-pagination-next) {
  display: none;
}
.composite-table-footer .table-footer-pagination {
  width: 50%;
}
.composite-table-body :deep(.ant-table-column-sorter.ant-table-column-sorter-full) {
  position: inherit;
  top: -2.5px;
}
</style>
