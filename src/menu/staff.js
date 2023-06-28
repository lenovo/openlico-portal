/*
 * Copyright 2015-2023 Lenovo
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

export default [
  {
    label: 'JobDashboard',
    icon: 'home',
    path: '/main/dashboard-monitor',
    type: 'dashboard-monitor',
    home: true,
  },
  {
    label: 'JobTemplateStore',
    icon: 'jobtemplates',
    path: '/main/job-template-store',
    type: 'job-template-store',
    details: [
      {
        type: 'job-template-editor-copy',
        param: 'code',
        path: '/main/job-template-editor/copy',
      },
      {
        type: 'job-template-editor',
        param: 'code',
        path: '/main/job-template-editor',
      },
      {
        type: 'job-template-ex-copy',
        param: 'jobId',
        path: '/main/job-template-ex/copy',
      },
      {
        type: 'job-template-ex',
        param: 'code',
        path: '/main/job-template-ex',
      },
    ],
  },
  {
    label: 'JobManage',
    icon: 'job',
    path: '/main/job-manage',
    type: 'job-manage',
    details: [
      {
        type: 'job',
        param: 'id',
        path: '/main/job',
      },
    ],
  },
  {
    label: 'Report',
    icon: 'report',
    featureCode: 'sc.host.*',
    children: [
      {
        label: 'ConsumeReport',
        icon: 'ConsumeReports',
        path: '/main/report-consume',
        type: 'report-consume',
      },
    ],
  },
  {
    label: 'ClundTools',
    icon: 'CloudTools',
    path: '/main/cloud-tools',
    type: 'cloud-tools',
    featureCode: 'ai',
  },
  {
    label: 'Workflow',
    icon: 'workflow',
    path: '/main/workflow-manage',
    type: 'workflow-manage',
    details: [
      {
        type: 'workflow-detail',
        param: 'id',
        path: '/main/workflow-detail',
      },
      {
        type: 'workflow-editor',
        param: 'id',
        path: '/main/workflow-editor',
      },
      {
        type: 'workflow-job-template-store',
        path: '/main/workflow-job-template-store',
      },
      {
        type: 'workflow-job-template-ex',
        path: '/main/workflow-job-template-ex',
      },
      {
        type: 'workflow-job-template-ex',
        path: '/mian/workflow-job-template-ex/edit/',
      },
    ],
  },
  {
    label: 'Tools',
    icon: 'tools',
    children: [
      {
        label: 'ContainerImageStore',
        icon: 'container',
        path: '/main/container-image-store',
        type: 'container-image-store',
        featureCode: 'sc.host.*,ai',
      },
      {
        label: 'BillingReport',
        icon: 'ExportBill',
        path: '/main/report-billing',
        type: 'report-billing',
        featureCode: 'sc.host.*',
      },
      {
        label: 'VNC',
        icon: 'vnc',
        path: '/main/vnc-manage',
        type: 'vnc-manage',
        featureCode: 'sc.host.*,monitor.cluster',
      },
      {
        label: 'APIKey',
        icon: 'APIkey',
        path: '/main/api-key',
        type: 'api-key',
      },
      {
        label: 'Runtime',
        icon: 'Runtime',
        path: '/main/runtime-manage',
        type: 'runtime-manage',
        featureCode: 'sc.host.*',
      },
    ],
  },
]
