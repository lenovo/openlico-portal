import Default from './index.json'
import JobStatus from './job-status.json'
import NodeStatus from './node-status.json'
import NodeGroupStatus from './nodegroup-status.json'
import JobQueueStatus from './queue-jobs.json'
import Alert from './alert.json'

import * as Echarts from 'echarts/core'

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  VisualMapComponent,
  ToolboxComponent,
  GraphicComponent,
  DataZoomComponent,
} from 'echarts/components'

import { BarChart, LineChart, PieChart, HeatmapChart, ScatterChart } from 'echarts/charts'

import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

Echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  VisualMapComponent,
  ToolboxComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  GraphicComponent,
  DataZoomComponent,
])
Echarts.use([BarChart, LineChart, PieChart, HeatmapChart, ScatterChart])

Echarts.registerTheme('default', Default)
Echarts.registerTheme('jobStatus', JobStatus)
Echarts.registerTheme('nodeStatus', NodeStatus)
Echarts.registerTheme('nodeGroupStatus', NodeGroupStatus)
Echarts.registerTheme('jobQueueStatus', JobQueueStatus)
Echarts.registerTheme('alert', Alert)

export default Echarts
