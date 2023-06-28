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
    label: 'MonitorDashboard',
    icon: 'home',
    path: '/main/dashboard-monitor',
    type: 'dashboard-monitor',
    home: true,
  },
  {
    label: 'Admin',
    icon: 'admin',
    children: [
      {
        label: 'UserGroupManage',
        icon: 'userGroup',
        path: '/main/user-group-manage',
        type: 'user-group-manage',
        ldap: 'optional',
        featureCode: 'sc.host.*',
      },
      {
        label: 'UserManage',
        icon: 'user',
        path: '/main/user-manage',
        type: 'user-manage',
        ldap: 'optional',
        details: [
          {
            type: 'user',
            param: 'id',
            path: '/main/user',
          },
        ],
      },
      {
        label: 'BillGroupManage',
        icon: 'billinggroup',
        path: '/main/bill-group-manage',
        type: 'bill-group-manage',
        featureCode: 'sc.host.*,monitor.scheduler',
        details: [
          {
            type: 'billinggroup',
            param: 'id',
            path: '/main/bill-group',
          },
        ],
      },
      {
        label: 'Discount',
        icon: 'discount',
        path: '/main/discount-manage',
        type: 'discount-manage',
        featureCode: 'sc.host.*,monitor.scheduler',
      },
    ],
  },
  {
    label: 'Monitor',
    icon: 'monitor',
    children: [
      {
        label: 'MonitorNodes',
        icon: 'listview',
        path: '/main/monitor-nodes',
        type: 'monitor-nodes',
        featureCode: 'sc.host.*,monitor.cluster',
      },
      {
        label: 'MonitorRacks',
        icon: 'physicalview',
        path: '/main/monitor-racks',
        type: 'monitor-racks',
        featureCode: 'sc.host.*,monitor.cluster',
        details: [
          {
            type: 'rack',
            param: 'id',
            path: '/main/rack',
          },
        ],
      },
      {
        label: 'MonitorGroups',
        icon: 'groupview',
        path: '/main/monitor-groups',
        type: 'monitor-groups',
        featureCode: 'sc.host.*,monitor.cluster',
      },
      {
        label: 'MonitorGpus',
        icon: 'GPU',
        path: '/main/monitor-gpus',
        type: 'monitor-gpus',
        featureCode: 'sc.host.*,monitor.cluster',
      },
      {
        label: 'JobManage',
        icon: 'job',
        path: '/main/job-manage',
        type: 'job-manage',
        featureCode: 'monitor.scheduler',
        details: [
          {
            type: 'job',
            param: 'id',
            path: '/main/job',
          },
        ],
      },
      {
        label: 'AlertManage',
        icon: 'alert',
        path: '/main/alert-manage',
        type: 'alert-manage',
        featureCode: 'sc.host.*,monitor.cluster',
      },
      {
        label: 'OperationManage',
        icon: 'operationlog',
        path: '/main/operation-manage',
        type: 'operation-manage',
      },
      {
        label: 'Cluster',
        icon: 'Cluster',
        path: '/main/monitor-cluster',
        type: 'monitor-cluster',
        featureCode: 'sc.host.*,monitor.cluster,monitor.scheduler',
      },
    ],
  },
  {
    label: 'Report',
    icon: 'report',
    children: [
      {
        label: 'JobReport',
        icon: 'jobreport',
        featureCode: 'monitor.scheduler',
        path: '/main/report-job',
        type: 'report-job',
      },
      {
        label: 'ConsumeReport',
        icon: 'ConsumeReports',
        featureCode: 'sc.host.*,monitor.scheduler',
        path: '/main/report-consume',
        type: 'report-consume',
      },
      {
        label: 'ClusterReport',
        icon: 'ClusterReport',
        featureCode: 'monitor.scheduler',
        path: '/main/report-cluster',
        type: 'report-cluster',
      },
      {
        label: 'AlertReport',
        icon: 'alertreport',
        featureCode: 'sc.host.*,monitor.cluster,monitor.scheduler',
        path: '/main/report-alert',
        type: 'report-alert',
      },
      {
        label: 'OperationReport',
        icon: 'operationreport',
        featureCode: 'sc.host.*,monitor.cluster',
        path: '/main/report-operation',
        type: 'report-operation',
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
        featureCode: 'sc.host.*,ai,monitor.scheduler',
      },
      {
        label: 'Runtime',
        icon: 'Runtime',
        path: '/main/runtime-manage',
        type: 'runtime-manage',
        featureCode: 'sc.host.*,monitor.scheduler',
      },
      {
        label: 'BillingReport',
        icon: 'ExportBill',
        featureCode: 'sc.host.*,monitor.scheduler',
        path: '/main/report-billing',
        type: 'report-billing',
      },
      {
        label: 'VNC',
        icon: 'vnc',
        path: '/main/vnc-manage',
        type: 'vnc-manage',
        featureCode: 'sc.host.*,monitor.cluster',
      },
      {
        label: 'OperationLogManage',
        icon: 'operationlog',
        path: '/main/operation-log-manage',
        type: 'operation-log-manage',
      },
    ],
  },
  {
    label: 'Setting',
    icon: 'tools1',
    children: [
      {
        label: 'AlertPolicyManage',
        icon: 'alertpolicy',
        featureCode: 'sc.host.*,monitor.cluster',
        path: '/main/alert-policy-manage',
        type: 'alert-policy-manage',
      },
      {
        label: 'NotifyGroupManage',
        icon: 'notifygroup',
        featureCode: 'sc.host.*,monitor.cluster',
        path: '/main/notify-group-manage',
        type: 'notify-group-manage',
      },
      {
        label: 'NotifyAdapterManage',
        icon: 'notifyadapter',
        path: '/main/notify-adapter-manage',
        type: 'notify-adapter-manage',
      },
      {
        label: 'AlertScriptManage',
        icon: 'script',
        featureCode: 'sc.host.*,monitor.cluster',
        path: '/main/alert-script-manage',
        type: 'alert-script-manage',
      },
    ],
  },
]
