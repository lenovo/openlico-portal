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
    path: 'user-manage',
    name: 'user-manage',
    meta: {
      auth: true,
      access: ['admin'],
      ldap: 'optional',
      keepAlive: true,
    },
    component: resolve => require(['../view/user-manage'], resolve),
  },
  {
    path: 'user/:id',
    name: 'user',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: resolve => require(['../view/user'], resolve),
  },
  {
    path: 'bill-group-manage',
    name: 'bill-group-manage',
    meta: {
      auth: true,
      access: ['admin'],
      keepAlive: true,
    },
    component: resolve => require(['../view/bill-group-manage'], resolve),
  },
  {
    path: 'bill-group/:id',
    name: 'bill-group',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: resolve => require(['../view/bill-group-detail'], resolve),
  },
  {
    path: 'api-key',
    name: 'api-key',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: resolve => require(['../view/api-key'], resolve),
  },
  {
    path: 'operation-manage',
    name: 'operation-manage',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: resolve => require(['../view/operation-manage'], resolve),
  },
  {
    path: 'operation-log-manage',
    name: 'operation-log-manage',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: resolve => require(['../view/operation-log-manage'], resolve),
  },
  {
    path: 'discount-manage',
    name: 'discount-manage',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: resolve => require(['../view/discount-manage'], resolve),
  },
  {
    path: 'file-manage',
    name: 'file-manage',
    meta: {
      auth: true,
      access: ['staff'],
      keepAlive: true,
    },
    component: resolve => require(['../view/file-manage'], resolve),
  },
  {
    path: 'notify-adapter-manage',
    name: 'notify-adapter-manage',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: resolve => require(['../view/notify-adapter-manage'], resolve),
  },
  {
    path: 'alert-policy-manage',
    name: 'alert-policy-manage',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: resolve => require(['../view/alert-policy-manage'], resolve),
  },
  {
    path: 'alert-script-manage',
    name: 'alert-script-manage',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: resolve => require(['../view/alert-script-manage'], resolve),
  },
  {
    path: 'notify-group-manage',
    name: 'notify-group-manage',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: resolve => require(['../view/notify-group-manage'], resolve),
  },
  {
    path: 'user-group-manage',
    name: 'user-group-manage',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: resolve => require(['../view/user-group-manage'], resolve),
  },
  {
    path: 'container-image-store',
    name: 'container-image-store',
    meta: {
      auth: true,
      access: ['admin', 'staff'],
    },
    component: resolve => require(['../view/container-image-store'], resolve),
  },
  {
    path: 'job-template-store/:code?',
    name: 'job-template-store',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: resolve => require(['../view/job-template-store'], resolve),
  },
  {
    path: 'job-template-ex/:code',
    name: 'job-template-ex',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: resolve => require(['../view/job-template-ex'], resolve),
  },
  {
    path: 'job-template-ex/copy/:jobId',
    name: 'job-template-ex-copy',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: resolve => require(['../view/job-template-ex'], resolve),
  },
  {
    path: 'job-template-editor',
    name: 'job-template-editor',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: resolve => require(['../view/job-template-editor'], resolve),
  },
  {
    path: 'job-template-editor/copy/:code',
    name: 'job-template-editor-copy/',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: resolve => require(['../view/job-template-editor'], resolve),
  },
  {
    path: 'job-template-editor/:code',
    name: 'job-template-editor-info',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: resolve => require(['../view/job-template-editor'], resolve),
  },
  {
    path: 'workflow-manage',
    name: 'workflow-manage',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: resolve => require(['../view/workflow-manage'], resolve),
  },
  {
    path: 'workflow-detail/:id',
    name: 'workflow-detail',
    meta: {
      auth: true,
      access: ['staff'],
    },
    props: true,
    component: resolve => require(['../view/workflow-manage/workflow-detail'], resolve),
  },
  {
    path: 'workflow-editor/:id',
    name: 'workflow-editor',
    meta: {
      auth: true,
      access: ['staff'],
    },
    props: true,
    component: resolve => require(['../view/workflow-manage/workflow-editor'], resolve),
  },
  {
    path: 'vnc-manage',
    name: 'vnc-manage',
    meta: {
      auth: true,
      access: ['admin', 'staff'],
    },
    component: resolve => require(['../view/vnc-manage'], resolve),
  },
  {
    path: 'report-operation',
    name: 'report-operation',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: resolve => require(['../view/report-operation'], resolve),
  },
  {
    path: 'report-alert',
    name: 'report-alert',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: resolve => require(['../view/report-alert'], resolve),
  },
  {
    path: 'runtime-manage',
    name: 'runtime-manage',
    meta: {
      auth: true,
      access: ['admin', 'staff'],
    },
    component: resolve => require(['../view/runtime-manage'], resolve),
  },
  {
    path: 'alert-manage',
    name: 'alert-manage',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: resolve => require(['../view/alert-manage'], resolve),
  },
  {
    path: 'monitor-nodes',
    name: 'monitor-nodes',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: resolve => require(['../view/monitor-nodes'], resolve),
  },
  {
    path: 'workflow-job-template-store/:workflowId/:stepId/:code',
    name: 'workflow-template-store',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: resolve => require(['../view/workflow-manage/workflow-job-template-store'], resolve),
  },
  {
    path: 'workflow-job-template-ex/:workflowId/:stepId/:code',
    name: 'workflow-template-ex',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: resolve => require(['../view/workflow-manage/workflow-job-template-ex'], resolve),
  },
  {
    path: 'workflow-job-template-ex/edit/',
    name: 'workflow-job-edit',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: resolve => require(['../view/workflow-manage/workflow-job-template-ex'], resolve),
  },
  {
    path: 'monitor-groups',
    name: 'monitor-groups',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: resolve => require(['../view/monitor-groups'], resolve),
  },
  {
    path: 'monitor-gpus',
    name: 'monitor-gpus',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: resolve => require(['../view/monitor-gpus'], resolve),
  },
  {
    path: 'job-manage/:status?',
    name: 'job-manage',
    meta: {
      auth: true,
      keepAlive: true,
      access: ['admin', 'operator', 'staff'],
    },
    component: resolve => require(['../view/job-manage'], resolve),
  },
  {
    path: 'monitor-racks',
    name: 'monitor-racks',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },

    component: resolve => require(['../view/monitor-racks'], resolve),
  },
  {
    path: 'rack/:id',
    name: 'rack',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: resolve => require(['../view/rack'], resolve),
  },
  {
    path: 'dashboard-monitor',
    name: 'dashboard-monitor',
    meta: {
      auth: true,
      access: ['admin', 'operator', 'staff'],
    },
    component: resolve => require(['../view/dashboard-monitor'], resolve),
  },
  {
    path: 'cloud-tools',
    name: 'cloud-tools',
    meta: {
      auth: true,
      access: ['staff'],
      keepAlive: true,
    },
    component: resolve => require(['../view/cloud-tools'], resolve),
  },
  {
    path: 'report-billing',
    name: 'report-billing',
    meta: {
      auth: true,
      access: ['admin', 'staff'],
    },

    component: resolve => require(['../view/report-billing'], resolve),
  },
  {
    path: 'report-consume',
    name: 'report-consume',
    meta: {
      auth: true,
      access: ['admin', 'operator', 'staff'],
    },
    component: resolve => require(['../view/report-consume'], resolve),
  },
  {
    path: 'report-cluster',
    name: 'report-cluster',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: resolve => require(['../view/report-cluster'], resolve),
  },
  {
    path: 'job/:id',
    name: 'job',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: resolve => require(['../view/job'], resolve),
  },
  {
    path: 'report-job',
    name: 'report-job',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: resolve => require(['../view/report-job'], resolve),
  },
  {
    path: 'monitor-cluster',
    name: 'monitor-cluster',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: resolve => require(['../view/monitor-cluster'], resolve),
  },
]
