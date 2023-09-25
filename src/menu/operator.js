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
    label: 'MonitorDashboard',
    icon: 'home',
    path: '/main/dashboard-monitor',
    type: 'dashboard-monitor',
    home: true,
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
]
