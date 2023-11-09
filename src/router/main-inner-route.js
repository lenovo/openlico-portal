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

export default [
  {
    path: 'user-manage',
    name: 'user-manage',
    meta: {
      auth: true,
      access: ['admin'],
      ldap: 'optional',
      // keepAlive: true,
    },
    component: _ => import('@/view/user-manage.vue'),
  },
  {
    path: 'user/:id',
    name: 'user',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: _ => import('@/view/user.vue'),
  },
  {
    path: 'bill-group-manage',
    name: 'bill-group-manage',
    meta: {
      auth: true,
      access: ['admin'],
      // keepAlive: true,
    },
    component: _ => import('@/view/bill-group-manage.vue'),
  },
  {
    path: 'bill-group/:id',
    name: 'bill-group',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: _ => import('@/view/bill-group-detail.vue'),
  },
  {
    path: 'api-key',
    name: 'api-key',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: _ => import('@/view/api-key.vue'),
  },
  {
    path: 'operation-manage',
    name: 'operation-manage',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: _ => import('@/view/operation-manage.vue'),
  },
  {
    path: 'operation-log-manage',
    name: 'operation-log-manage',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: _ => import('@/view/operation-log-manage.vue'),
  },
  {
    path: 'discount-manage',
    name: 'discount-manage',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: _ => import('@/view/discount-manage.vue'),
  },
  {
    path: 'notify-adapter-manage',
    name: 'notify-adapter-manage',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: _ => import('@/view/notify-adapter-manage.vue'),
  },
  {
    path: 'alert-policy-manage',
    name: 'alert-policy-manage',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: _ => import('@/view/alert-policy-manage.vue'),
  },
  {
    path: 'alert-script-manage',
    name: 'alert-script-manage',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: _ => import('@/view/alert-script-manage.vue'),
  },
  {
    path: 'notify-group-manage',
    name: 'notify-group-manage',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: _ => import('@/view/notify-group-manage.vue'),
  },
  {
    path: 'user-group-manage',
    name: 'user-group-manage',
    meta: {
      auth: true,
      access: ['admin'],
    },
    component: _ => import('@/view/user-group-manage.vue'),
  },
  {
    path: 'container-image-store',
    name: 'container-image-store',
    meta: {
      auth: true,
      access: ['admin', 'staff'],
    },
    component: _ => import('@/view/container-image-store.vue'),
  },
  {
    path: 'job-template-store/:category?',
    name: 'job-template-store',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: _ => import('@/view/job-template-store.vue'),
  },
  {
    path: 'job-template-ex/:code',
    name: 'job-template-ex',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: _ => import('@/view/job-template-ex.vue'),
  },
  {
    path: 'job-template-ex/copy/:jobId',
    name: 'job-template-ex-copy',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: _ => import('@/view/job-template-ex.vue'),
  },
  {
    path: 'job-template-editor/:action?/:code?',
    name: 'job-template-editor',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: _ => import('@/view/job-template-editor.vue'),
  },
  {
    path: 'workflow-manage',
    name: 'workflow-manage',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: _ => import('@/view/workflow-manage.vue'),
  },
  {
    path: 'workflow-detail/:id',
    name: 'workflow-detail',
    meta: {
      auth: true,
      access: ['staff'],
    },
    props: true,
    component: _ => import('@/view/workflow-manage/workflow-detail.vue'),
  },
  {
    path: 'workflow-editor/:id',
    name: 'workflow-editor',
    meta: {
      auth: true,
      access: ['staff'],
    },
    props: true,
    component: _ => import('@/view/workflow-manage/workflow-editor.vue'),
  },
  {
    path: 'workflow-job-template-store/:workflowId/:stepId/:category?',
    name: 'workflow-template-store',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: _ => import('@/view/workflow-manage/workflow-job-template-store.vue'),
  },
  {
    path: 'workflow-job-template-ex/:workflowId/:stepId/:code/:action?/:stepJobId?',
    name: 'workflow-template-ex',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: _ => import('@/view/workflow-manage/workflow-job-template-ex.vue'),
  },
  {
    path: 'vnc-manage',
    name: 'vnc-manage',
    meta: {
      auth: true,
      access: ['admin', 'staff'],
    },
    component: _ => import('@/view/vnc-manage.vue'),
  },
  {
    path: 'report-operation',
    name: 'report-operation',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: _ => import('@/view/report-operation.vue'),
  },
  {
    path: 'report-alert',
    name: 'report-alert',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: _ => import('@/view/report-alert.vue'),
  },
  {
    path: 'runtime-manage',
    name: 'runtime-manage',
    meta: {
      auth: true,
      access: ['admin', 'staff'],
    },
    component: _ => import('@/view/runtime-manage.vue'),
  },
  {
    path: 'alert-manage',
    name: 'alert-manage',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: _ => import('@/view/alert-manage.vue'),
  },
  {
    path: 'monitor-nodes',
    name: 'monitor-nodes',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: _ => import('@/view/monitor-nodes.vue'),
  },
  {
    path: 'monitor-groups',
    name: 'monitor-groups',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: _ => import('@/view/monitor-groups.vue'),
  },
  {
    path: 'monitor-gpus',
    name: 'monitor-gpus',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: _ => import('@/view/monitor-gpus.vue'),
  },
  {
    path: 'job-manage/:status?',
    name: 'job-manage',
    meta: {
      auth: true,
      // keepAlive: true,
      access: ['admin', 'operator', 'staff'],
    },
    component: _ => import('@/view/job-manage.vue'),
  },
  {
    path: 'monitor-racks',
    name: 'monitor-racks',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },

    component: _ => import('@/view/monitor-racks.vue'),
  },
  {
    path: 'rack/:id',
    name: 'rack',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: _ => import('@/view/rack.vue'),
  },
  {
    path: 'dashboard-monitor',
    name: 'dashboard-monitor',
    meta: {
      auth: true,
      access: ['admin', 'operator', 'staff'],
    },
    component: _ => import('@/view/dashboard-monitor.vue'),
  },
  {
    path: 'cloud-tools',
    name: 'cloud-tools',
    meta: {
      auth: true,
      access: ['staff'],
      // keepAlive: true,
    },
    component: _ => import('@/view/cloud-tools.vue'),
  },
  {
    path: 'report-billing',
    name: 'report-billing',
    meta: {
      auth: true,
      access: ['admin', 'staff'],
    },

    component: _ => import('@/view/report-billing.vue'),
  },
  {
    path: 'report-consume',
    name: 'report-consume',
    meta: {
      auth: true,
      access: ['admin', 'operator', 'staff'],
    },
    component: _ => import('@/view/report-consume.vue'),
  },
  {
    path: 'report-cluster',
    name: 'report-cluster',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: _ => import('@/view/report-cluster.vue'),
  },
  {
    path: 'job/:id',
    name: 'job',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: _ => import('@/view/job.vue'),
  },
  {
    path: 'report-job',
    name: 'report-job',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: _ => import('@/view/report-job.vue'),
  },
  {
    path: 'monitor-cluster',
    name: 'monitor-cluster',
    meta: {
      auth: true,
      access: ['admin', 'operator'],
    },
    component: _ => import('@/view/monitor-cluster.vue'),
  },
  {
    path: 'softwares',
    name: 'softwares-manage',
    meta: {
      auth: true,
      access: ['staff'],
    },
    component: _ => import('@/view/softwares.vue'),
  },
]
