import Default from './index.json'
import JobStatus from './job-status.json'
import NodeStatus from './node-status.json'
import NodeGroupStatus from './nodegroup-status.json'
import JobQueueStatus from './queue-jobs.json'
import Alert from './alert.json'

import * as Echarts from 'echarts'

Echarts.registerTheme('default', Default)
Echarts.registerTheme('jobStatus', JobStatus)
Echarts.registerTheme('nodeStatus', NodeStatus)
Echarts.registerTheme('nodeGroupStatus', NodeGroupStatus)
Echarts.registerTheme('jobQueueStatus', JobQueueStatus)
Echarts.registerTheme('alert', Alert)

export default Echarts
