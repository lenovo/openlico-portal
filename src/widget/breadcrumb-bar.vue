<template>
  <a-row class="breadcrumb-container">
    <a-col :span="22">
      <a-breadcrumb style="padding-top: 3px" separator=">">
        <a-breadcrumb-item v-for="path in pathStack" :key="path.path">
          <span v-if="path.path && path.path.length > 0">
            <router-link :to="path.path">{{ path.name }}</router-link>
          </span>
          <span v-else class="breadcrumb-nolink">{{ path.name }}</span>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </a-col>
    <a-col :span="2" align="right">
      <a-button
        v-show="pathStack.length > 1"
        :disabled="
          license.status == 'invalid' ||
          (license.licenseCode && license.licenseCode.includes('Evaluation') && license.status != 'valid')
        "
        style="padding: 0px"
        type="link"
        size="small"
        @click="onBackClick">
        {{ $T('Breadcrumb.Back') }}
      </a-button>
    </a-col>
  </a-row>
</template>
<script>
import menu from '../menu/menu'
import JobService from '../service/job'
import UserService from '../service/user'
import RackService from '../service/rack'
import JobTemplateService from '../service/job-template'
import WorkflowServices from '../service/workflow'
import BillGroupService from '../service/bill-group'
export default {
  data() {
    return {
      pathStack: [''],
    }
  },
  computed: {
    license() {
      return this.$store.getters['settings/getLicense']
    },
  },
  watch: {
    $route() {
      this.init()
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const route = this.$route
      const access = this.$store.state.auth.access
      const currentMenu = menu[access]
      const pathStack = []
      // Only root menu can be home
      currentMenu.forEach(menu => {
        if (menu.home && !route.meta.breadcrumb) {
          pathStack.push(this.getPathByMenu(menu))
        }
      })
      this.findPath(route, pathStack, currentMenu)
      if (route.meta.breadcrumb) {
        pathStack.push({
          name: route.meta.breadcrumb,
          path: '',
        })
      }
      this.pathStack = pathStack
    },
    findPath(route, pathStack, subItems) {
      for (let i = 0; i < subItems.length; i++) {
        const subItem = subItems[i]
        if (subItem.home) {
          continue
        }
        // Need improve this function to fit param
        if (route.name === subItem.type && (!subItem.key || subItem.key === route.params[subItem.param])) {
          pathStack.push(this.getPathByMenu(subItem))
          return true
        }
        if (subItem.details) {
          for (let j = 0; j < subItem.details.length; j++) {
            const detail = subItem.details[j]
            const usage = detail.usage ? detail.usage : ['go-back', 'breadcrumb']
            if (!usage.includes('breadcrumb')) {
              continue
            }
            if (menu.compareWithMenuPath(detail, route.path, route.name)) {
              pathStack.push(this.getPathByMenu(subItem))
              this.asyncAddPath(detail.type, route.params[detail.param])
              return true
            }
          }
        }
        pathStack.push(this.getPathByMenu(subItem))
        if (this.findPath(route, pathStack, subItem.children)) {
          return true
        }
        pathStack.pop()
      }
      return false
    },
    getPathByMenu(menu) {
      return {
        name: this.$T('Menu.' + menu.label),
        path: menu.path,
      }
    },
    asyncAddPath(type, id) {
      if (type === 'user') {
        UserService.getUserById(id).then(
          res => {
            this.addDetailPath(id, res.username)
          },
          res => {
            this.$message.error(res)
          },
        )
      }
      if (type === 'billinggroup') {
        BillGroupService.getBillGroupById(id).then(
          res => {
            this.addDetailPath(id, res.name)
          },
          res => {
            this.$message.error(res)
          },
        )
      }
      if (type === 'job') {
        JobService.getJobById(id, { jobtemplateSync: false }).then(
          res => {
            this.addDetailPath(id, res.name)
          },
          res => {
            this.$message.error(res)
          },
        )
      }
      if (type === 'rack') {
        RackService.getRackById(id).then(
          res => {
            this.addDetailPath(id, res.name)
          },
          res => {
            this.$message.error(res)
          },
        )
      }
      if (type === 'job-template-ex-copy') {
        JobService.getJobById(id).then(
          res => {
            this.addDetailPath(id, res.realType || res.type)
          },
          res => {
            this.$message.error(res)
          },
        )
      }
      if (type === 'job-template-ex') {
        JobTemplateService.getJobTemplate(id).then(
          res => {
            this.addDetailPath(id, res.name)
          },
          res => {
            this.$message.error(res)
          },
        )
      }
      if (type === 'job-template-editor') {
        if (!id) {
          setTimeout(() => {
            this.addDetailPath(id, this.$T('JobTemplate.Create'))
          }, 300)
        } else {
          JobTemplateService.getJobTemplate(id).then(
            res => {
              let action = this.$route.params.action
              action = action === 'edit' ? 'Edit' : action === 'copy' ? 'Copy' : ''
              this.addDetailPath(id, this.$T(`JobTemplate.${action}`, { name: res.name }))
            },
            res => {
              this.$message.error(res)
            },
          )
        }
      }
      if (type === 'workflow-detail' || type === 'workflow-editor') {
        WorkflowServices.getWorkflowById(id).then(
          res => {
            const pathName =
              type === 'workflow-detail'
                ? this.$T('Workflow.Bread.Detail', {
                    name: res.name,
                  })
                : this.$T('Workflow.Bread.Edit', {
                    name: res.name,
                  })
            this.addDetailPath(id, pathName)
          },
          _ => {},
        )
      }
    },
    addDetailPath(id, name, path) {
      this.pathStack.push({
        name,
        path: path || '',
      })
    },
    onBackClick() {
      window.history.back()
    },
  },
}
</script>
<style scoped>
.breadcrumb-container {
  padding-left: 10px;
  padding-right: 10px;
  line-height: 16px;
}
.breadcrumb-container .ant-breadcrumb {
  line-height: inherit;
}
.breadcrumb-container .ant-col button {
  height: 1rem;
  line-height: inherit;
}
.breadcrumb-nolink {
  font-weight: 400;
  cursor: text;
  display: table-cell;
  max-width: 250px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
