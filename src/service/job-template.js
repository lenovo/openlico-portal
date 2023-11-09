/*
 * Copyright 2015-present Lenovo
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Request from '../request/https'
import ErrorHandler from '../common/error-handler'
import Collection from '../common/collection'
import Format from '../common/format'
import download from './download'
import AccessService from './access'
// import CategorySortMap from '/static/settings/system-template-categories.json'

// const JobTemplateTypeEnums = ['system', 'private', 'public']

const CategoryEnums = getJobTemplateCategory()

const MigOption = {
  id: 'gpu_resource_name',
  name: {
    en: 'GPU Resource Type',
    zh: 'GPU资源类型',
  },
  featureCodes: 'sc.host.*',
  defaultValue: '',
  // "defaultValue": MigSelectOption.length ? MigSelectOption[0].value: "",
  class: 'resource',
  dataType: 'mig',
  selectOption: [],
  visible: 'context.gpu_per_node>0&&(migOptions&&migOptions.length>0 || context.gpu_resource_name.length>0)',
  must: false,
}

class JobTemplate {
  constructor() {
    this.code = ''
    this.name = ''
    this.index = 0
    this.logo = ''
    this.description = ''
    this.category = ''
    this.featureCode = ''
    this.type = ''
    this.username = ''
    this.scheduler = ''
    this.helpUrl = ''
    this.display = false
    this.entrance = ''
  }

  static parseFromStatic(jsonObj) {
    const jobTemplate = new JobTemplate()
    jobTemplate.code = jsonObj.code
    jobTemplate.name = jsonObj.name
    jobTemplate.index = jsonObj.index
    jobTemplate.logo = jsonObj.logoUrl
    jobTemplate.description = jsonObj.description
    jobTemplate.category = jsonObj.category.split(',')
    jobTemplate.featureCode = jsonObj.featureCode
    jobTemplate.type = 'system'
    jobTemplate.display = jsonObj.display
    jobTemplate.username = ''
    jobTemplate.entrance = jsonObj.entrance
    if (jsonObj.help) {
      const lang = window.gApp.$i18n.locale
      jobTemplate.helpUrl = `/jobtemplates/help/?code=${jsonObj.code}&language=${lang}`
    }
    if (jsonObj.hypervisor) {
      jobTemplate.hypervisor = jsonObj.hypervisor
    }
    if (jsonObj.framework) {
      jobTemplate.framework = jsonObj.framework
    }
    if (jsonObj.params) {
      const migOptions = MigOption
      const params = jsonObj.params
      for (let i = 0; i < params.length; i++) {
        if (params[i].id === 'gpu_per_node') {
          params.splice(i + 1, 0, migOptions)
          break
        }
      }
      jobTemplate.params = params
    }
    if (jsonObj.resourceOptions) {
      jobTemplate.resourceOptions = jsonObj.resourceOptions
    }
    if (jsonObj.notifyOptions) {
      jobTemplate.notifyOptions = jsonObj.notifyOptions
    }
    if (jsonObj.template_file) {
      jobTemplate.templateFileContent = jsonObj.template_file
    }
    if (jsonObj.scheduler) {
      jobTemplate.scheduler = jsonObj.scheduler
    }
    if (jsonObj.subTemplates) {
      jobTemplate.subTemplates = jsonObj.subTemplates
    } else {
      jobTemplate.subTemplates = []
    }
    return jobTemplate
  }

  static parseFromRestApi(jsonObj) {
    const jobTemplate = new JobTemplate()
    jobTemplate.code = String(jsonObj.id)
    jobTemplate.name = jsonObj.name
    jobTemplate.index = jsonObj.index
    jobTemplate.logo = jsonObj.logo
    jobTemplate.description = jsonObj.desc
    jobTemplate.category = jsonObj.category.split(',')
    jobTemplate.featureCode = jsonObj.feature_code
    jobTemplate.type = jsonObj.type.toLowerCase()
    jobTemplate.username = jsonObj.username
    if (jsonObj.parameters_json) {
      // jobTemplate.params = JSON.parse(jsonObj.parameters_json);
      const params = JSON.parse(jsonObj.parameters_json)
      const migOptions = MigOption
      for (let i = 0; i < params.length; i++) {
        if (params[i].id === 'gpu_pre_node') {
          params.splice(i + 1, 0, migOptions)
          break
        }
      }
      jobTemplate.params = params
    }
    if (jsonObj.template_file) {
      jobTemplate.templateFileContent = jsonObj.template_file
    }
    if (jsonObj.workspace) {
      jobTemplate.workspace = jsonObj.workspace
    }
    if (jsonObj.scheduler) {
      jobTemplate.scheduler = jsonObj.scheduler
    }
    return jobTemplate
  }
}

class TemplateCard {
  constructor() {
    this.code = ''
    this.name = ''
    this.type = ''
    this.username = ''
    this.category = ''
    this.favorite = ''
    this.allCategorys
  }

  static parseFromRestApi(jsonObj) {
    const templateCard = new TemplateCard()
    templateCard.code = jsonObj.code
    templateCard.name = jsonObj.name
    templateCard.type = jsonObj.type
    templateCard.username = jsonObj.username
    templateCard.category = jsonObj.category
    templateCard.allCategorys = jsonObj.allCategorys
    templateCard.favorite = jsonObj.favorite
    return templateCard
  }

  get categoryDisplay() {
    return this.category
      .split(',')
      .map(i => {
        const category = this.allCategorys.filter(({ category }) => category === i)[0]
        if (category) {
          return category.label[window.gApp.$i18n.locale]
        }
        return i
      })
      .join(',')
  }
}

class License {
  constructor() {
    this.name = ''
    this.total = 0
    this.used = 0
  }

  static parseFromRestApi(jsonObj) {
    const license = new License()
    license.name = jsonObj.feature
    license.total = jsonObj.total
    license.used = jsonObj.used
    return license
  }
}

function getAllJobTemplates() {
  return new Promise((resolve, reject) => {
    const restApiReq = Request.get('/api/template/usertemplates/')
    const staticExReq = Request.get('/api/template/jobtemplates/')
    Promise.all([restApiReq, staticExReq]).then(
      res => {
        const jobTemplates = []
        res[1].body.data.forEach(obj => {
          if (!Object.prototype.hasOwnProperty.call(obj, 'enable') || obj.enable === true) {
            jobTemplates.push(JobTemplate.parseFromStatic(obj))
          }
        })
        res[0].body.data.forEach(obj => {
          jobTemplates.push(JobTemplate.parseFromRestApi(obj))
        })
        filterTemplatesByFeatureCodes(jobTemplates, window.gApp.$store.state.auth.featureCodes)
        resolve(jobTemplates)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getAllFavoriteTemplates() {
  return new Promise((resolve, reject) => {
    Request.get('/api/template/favorite/').then(
      res => {
        resolve(res.body.map(i => i.code))
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function addToFavorite(code) {
  return new Promise((resolve, reject) => {
    const req = { code }
    Request.post('/api/template/favorite/', req).then(
      res => {
        resolve(res)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function removeFromFavorite(code) {
  return new Promise((resolve, reject) => {
    Request.delete('/api/template/favorite/' + code + '/').then(
      res => {
        resolve(res)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getJobTemplate(code) {
  // If code is not a number, it must be the static template
  if (isNaN(parseInt(code))) {
    return new Promise((resolve, reject) => {
      Request.get('/api/template/jobtemplates/' + code + '/').then(
        res => {
          const jobTemplate = JobTemplate.parseFromStatic(res.body)
          resolve(jobTemplate)
        },
        res => {
          ErrorHandler.restApiErrorHandler(res, reject)
        },
      )
    })
  }
  return new Promise((resolve, reject) => {
    Request.get('/api/template/usertemplates/' + code + '/').then(
      res => {
        const jobTemplate = JobTemplate.parseFromRestApi(res.body)
        resolve(jobTemplate)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function filterTemplatesByFeatureCodes(templates, featureCodes) {
  const removeArr = []
  for (let i = 0; i < templates.length; i++) {
    const result = AccessService.getMatchFeatureCodes(templates[i].featureCode, featureCodes)
    if (templates[i].type === 'system' && !result.length) {
      removeArr.push(templates[i])
    }
  }
  for (let i = 0; i < removeArr.length; i++) {
    Collection.removeByValue(templates, removeArr[i])
  }
}

function createJobTemplate(formModel, params, templateFileContent) {
  return new Promise((resolve, reject) => {
    const { name, logo, category, customCategory, description, index } = formModel
    const req = {
      name: name.trim(),
      logo,
      category: category === 'custom' ? customCategory : category,
      desc: description,
      index: Number(index),
      parameters_json: JSON.stringify(params),
      template_file: Format.dos2unix(templateFileContent),
    }
    Request.post('/api/template/usertemplates/', req).then(
      res => {
        const jobTemplate = JobTemplate.parseFromRestApi(res.body)
        resolve(jobTemplate)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function updateJobTemplate(code, formModel, params, templateFileContent) {
  return new Promise((resolve, reject) => {
    const { name, logo, category, customCategory, description, index } = formModel
    const req = {
      name: name.trim(),
      logo,
      category: category === 'custom' ? customCategory : category,
      desc: description,
      index: Number(index),
      parameters_json: JSON.stringify(params),
      template_file: Format.dos2unix(templateFileContent),
    }
    Request.put('/api/template/usertemplates/' + code + '/', req).then(
      res => {
        const jobTemplate = JobTemplate.parseFromRestApi(res.body)
        resolve(jobTemplate)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function deleteJobTemplate(code) {
  return new Promise((resolve, reject) => {
    Request.delete('/api/template/usertemplates/' + code + '/').then(
      res => {
        const jobTemplate = new JobTemplate()
        jobTemplate.code = code
        resolve(jobTemplate)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function publishJobTemplate(code) {
  return new Promise((resolve, reject) => {
    Request.post('/api/template/usertemplates/' + code + '/publish/').then(
      res => {
        const jobTemplate = JobTemplate.parseFromRestApi(res.body)
        resolve(jobTemplate)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function unpublishJobTemplate(code) {
  return new Promise((resolve, reject) => {
    Request.post('/api/template/usertemplates/' + code + '/unpublish/').then(
      res => {
        const jobTemplate = JobTemplate.parseFromRestApi(res.body)
        resolve(jobTemplate)
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getTemplateDownLoadUrl(code) {
  return download(`/api/download/template/usertemplates/${code}/export/`)
}

function importTemplate(template) {
  const req = {
    upload: template.file,
    name: template.name,
  }
  const formData = new FormData()
  for (const el in req) {
    formData.append(el, req[el])
  }
  return new Promise((resolve, reject) => {
    Request({
      url: '/api/template/usertemplates/import/',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(
      res => {
        resolve(res)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getJobTemplateCategory() {
  const Category = []
  const featureCodes = window.gApp.$store.state.auth.featureCodes

  if (featureCodes.includes('ai')) {
    Category.push('LeTrain', 'AI')
  }

  if (featureCodes.includes('hpc')) {
    Category.push('HPC')
  }

  if (AccessService.getMatchFeatureCodes('sc.host.*', featureCodes).length) {
    Category.push('Intel_oneAPI')
  }

  if (featureCodes.includes('lico')) {
    Category.push('General')
  }

  return Category
}

function getMIGSelectOptions() {
  return new Promise((resolve, reject) => {
    let options = []
    Request.get('/api/job/scheduler/gres/type/').then(
      res => {
        options = res.body.map((item, i) => ({
          label: item || window.gApp.$t('JobTemplate.MIG.Default'),
          value: item,
          key: i,
        }))
        resolve(options)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getTemplateCategory() {
  return new Promise((resolve, reject) => {
    const req = {
      feature_code: window.gApp.$store.state.auth.featureCodes.join(','),
    }
    Request.get('api/template/categories/', { params: req }).then(
      async res => {
        const data = res.body
        const CategorySortMap = await getTemplateCategoryByJson()
        // filter and sort system category by "/static/settings/system-template-categories.json";
        let categories = CategorySortMap.filter(({ category }) => Object.keys(data.categories).includes(category)).map(
          ({ category, label }) => {
            const categoryLabel = label[window.gApp.$i18n.locale]
            const item = {
              key: category,
              counts: data.categories[category],
              label: categoryLabel || category,
            }
            return item
          },
        )

        // filter custom category
        let customCategorise = Object.keys(data.categories)
          .filter(i => !CategorySortMap.filter(({ category }) => category === i)[0])
          .map(i => ({
            key: i,
            counts: data.categories[i],
          }))

        // sort custom category by name
        Collection.sortObjectsByProp(customCategorise, 'key', 'asc')

        // result categories
        categories = categories.concat(customCategorise)

        resolve([
          categories,
          [
            {
              key: 'favorites',
              counts: data.favorites,
              label: window.gApp.$t('JobTemplateStore.Category.Favorite'),
            },
          ],
          [
            {
              key: 'my_templates',
              counts: data.my_templates,
              label: window.gApp.$t('JobTemplateStore.Category.MyTemplate'),
            },
          ],
        ])
      },
      res => {
        ErrorHandler.restApiErrorHandler(res, reject)
      },
    )
  })
}

function getTemplatesByFilter(filterskeys, sort, search, currentPage, pageSize) {
  return new Promise((resolve, reject) => {
    const filters = [
      ...filterskeys.map(filter => ({
        prop:
          filter !== 'favorites' && filter !== 'my_templates'
            ? 'category'
            : filter === 'my_templates'
            ? 'type'
            : filter,
        type: 'in',
        values: [filter === 'favorites' ? true : filter === 'my_templates' ? 'private' : filter],
      })),
      {
        prop: 'feature_code',
        type: 'in',
        values: [window.gApp.$store.state.auth.featureCodes.join(',')],
      },
    ]

    const args = {
      length: pageSize,
      offset: (currentPage - 1) * pageSize,
      sort: { prop: sort, order: 'ascend' },
      search: { props: ['name'], keyword: search },
      filters,
    }
    Request.get('/api/template/alltemplates/', { params: { args } }).then(
      async res => {
        const CategorySortMap = await getTemplateCategoryByJson()
        const data = res.body.data.map(i => TemplateCard.parseFromRestApi({ ...i, allCategorys: CategorySortMap }))

        resolve({
          data,
          total: res.body.total,
          currentPage: Math.ceil(res.body.offset / pageSize) || 1,
        })
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getJobLicenseFeature() {
  return new Promise((resolve, reject) => {
    Request.get('/api/job/license/').then(
      res => {
        resolve(res.body.map(i => License.parseFromRestApi(i)))
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getTemplateCategoryByJson() {
  return new Promise((resolve, reject) => {
    Request.get('/static/settings/system-template-categories.json').then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

function getLadlBussiness() {
  return new Promise((resolve, reject) => {
    Request.get('/static/settings/example/ladl-scenario-example.json').then(
      res => {
        resolve(res.body)
      },
      err => {
        ErrorHandler.restApiErrorHandler(err, reject)
      },
    )
  })
}

export default {
  CategoryEnums,
  getAllJobTemplates,
  getJobTemplate,
  getAllFavoriteTemplates,
  addToFavorite,
  removeFromFavorite,
  createJobTemplate,
  updateJobTemplate,
  deleteJobTemplate,
  publishJobTemplate,
  unpublishJobTemplate,
  getTemplateDownLoadUrl,
  importTemplate,
  getMIGSelectOptions,
  getTemplateCategory,
  getTemplatesByFilter,
  getJobLicenseFeature,
  getLadlBussiness,
}
