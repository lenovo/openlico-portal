<template>
  <div class="relation-chart">
    <div ref="container" class="relation-inner-chart" />
  </div>
</template>

<script>
export default {
  props: ['initData', 'type'],
  data() {
    return {
      innerChart: null,
    }
  },
  watch: {
    initData: {
      handler: function (val, oldVal) {
        this.init()
      },
      deep: true,
    },
  },
  mounted() {
    this.$chart.init(this.$refs.container)

    this.resizeChart()
    this.init()
  },
  beforeUnmount() {
    this.$chart.getInstanceByDom(this.$refs.container).clear()
  },
  methods: {
    resizeChart() {
      this.$chart.getInstanceByDom(this.$refs.container).resize()
    },
    init() {
      const $this = this
      const cpuInfo = this.initData.cpuInfo
      const threadBind = this.initData.threadBind
      const data = [
        {
          name: 'Node',
          value: 'Node',
          symbol: 'rect',
          symbolSize: [60, 30],
          tooltip: {
            formatter: val => {
              return val.value
            },
          },
        },
      ]
      const links = []
      let sockets = 0
      let cores = 0
      let process = 0
      cpuInfo.forEach((socket, socketIndex) => {
        data.push({
          name: 'Socket' + sockets,
          value: 'Socket' + sockets,
          index: sockets,
          symbol: 'rect',
          symbolSize: [60, 30],
          tooltip: {
            formatter: val => {
              return val.value
            },
          },
        })
        links.push({
          source: 'Node',
          target: 'Socket' + sockets,
        })
        if (Array.isArray(socket)) {
          socket.forEach((core, coreIndex) => {
            data.push({
              name: 'Core' + cores,
              value: 'Core' + cores,
              index: cores,
              symbol: 'rect',
              symbolSize: [60, 30],
              tooltip: {
                formatter: val => {
                  return val.value
                },
              },
            })
            links.push({
              source: 'Socket' + sockets,
              target: 'Core' + cores,
            })
            if (Array.isArray(core)) {
              core.forEach((pro, proindex) => {
                data.push({
                  name: 'Process' + pro,
                  value: pro.toString(),
                  index: process,
                  tooltip: {
                    formatter: val => {
                      return val.value
                    },
                  },
                })
                links.push({
                  source: 'Core' + cores,
                  target: 'Process' + pro,
                })
                process++
              })
            }
            cores++
          })
        }
        sockets++
      })
      const maxWidth = Math.max(sockets, cores, process) * 150
      data.forEach(el => {
        if (el.name === 'Node') {
          el.x = maxWidth / 2
          el.x = maxWidth / 2 / 2
          el.y = 0
        } else if (el.name.includes('Socket')) {
          el.x = ((maxWidth / (sockets + 1)) * (el.index + 1)) / 2
          el.y = 150
        } else if (el.name.includes('Core')) {
          el.x = ((maxWidth / (cores + 1)) * (el.index + 1)) / 2
          el.y = 300
        } else if (el.name.includes('Process')) {
          el.x = ((maxWidth / (process + 1)) * (el.index + 1)) / 2
          el.y = 450
        }
      })
      const pids = Object.keys(threadBind).length
      const y = process > 0 ? 600 : cores > 0 ? 450 : sockets > 0 ? 300 : 150
      Object.keys(threadBind).forEach((el, index) => {
        data.push({
          name: el,
          value: el,
          x: ((maxWidth / (pids + 1)) * (index + 1)) / 2,
          y,
          symbol: 'rect',
          // symbolSize: [60, 30],
          tooltip: {
            formatter: val => {
              const idType = $this.type === 'openmp' ? 'tid' : 'pid'
              return idType + ' ' + val.value
            },
          },
        })
        const values = threadBind[el].replace(/,\s+/g, ',')
        if (values.includes(',')) {
          values.split(',').forEach(ele => {
            links.push({
              source: el,
              target: 'Process' + ele,
              symbol: ['none', 'arrow'],
              symbolSize: '8',
              lineStyle: {
                type: 'dashed',
              },
              emphasis: {
                lineStyle: {
                  type: 'dashed',
                },
              },
            })
          })
        } else {
          links.push({
            source: el,
            target: 'Process' + values,
            lineStyle: {
              type: 'solid',
            },
          })
        }
      })
      data.push({
        name: 'Node ',
        value: 'Node ',
        x: 0,
        y: 0,
        symbol: 'rect',
        focusNodeAdjacency: false,
        itemStyle: {
          borderColor: '#fff',
        },
        tooltip: {
          show: false,
        },
        cursor: 'default',
        label: {
          align: 'right',
        },
      })
      if (sockets) {
        data.push({
          name: 'Socket',
          value: 'Socket',
          x: 0,
          y: 150,
          symbol: 'rect',
          focusNodeAdjacency: false,
          itemStyle: {
            borderColor: '#fff',
          },
          tooltip: {
            show: false,
          },
          cursor: 'default',
          label: {
            align: 'right',
          },
        })
      }
      if (cores) {
        data.push({
          name: 'Physical Core',
          value: 'Physical Core',
          x: 0,
          y: 300,
          symbol: 'rect',
          focusNodeAdjacency: false,
          itemStyle: {
            borderColor: '#fff',
          },
          tooltip: {
            show: false,
          },
          cursor: 'default',
          label: {
            width: 40,
            align: 'right',
            overflow: 'break',
          },
        })
      }
      if (process) {
        data.push({
          name: 'Logical Core',
          value: 'Logical Core',
          x: 0,
          y: 450,
          symbol: 'rect',
          focusNodeAdjacency: false,
          itemStyle: {
            borderColor: '#fff',
          },
          tooltip: {
            show: false,
          },
          cursor: 'default',
          label: {
            align: 'right',
            overflow: 'break',
          },
        })
      }
      if (pids) {
        const idType = $this.type === 'openmp' ? 'TID' : 'PID'
        data.push({
          name: idType,
          value: idType,
          x: 0,
          y,
          symbol: 'rect',
          focusNodeAdjacency: false,
          itemStyle: {
            borderColor: '#fff',
          },
          tooltip: {
            show: false,
          },
          cursor: 'default',
          label: {
            align: 'right',
          },
        })
      }
      const option = {
        tooltip: {},
        animationDurationUpdate: 500,
        animationEasingUpdate: 'cubicInOut',
        series: [
          {
            type: 'graph',
            left: '4%',
            right: '4%',
            nodeScaleRatio: 0,
            layout: 'none',
            symbolSize: 40,
            autoCurveness: 10,
            roam: true,
            focusNodeAdjacency: true,
            color: '#fff',
            label: {
              show: true,
              color: '#000',
              formatter: val => {
                return val.value.replace('Process', '')
              },
            },
            edgeSymbol: ['none', 'none'],
            edgeSymbolSize: [4, 10],
            data,
            links,
            lineStyle: {
              width: 2,
            },
            itemStyle: {
              borderColor: '#000',
            },
            emphasis: {
              lineStyle: {
                color: '#1890FF',
              },
            },
          },
        ],
      }
      this.$chart.getInstanceByDom(this.$refs.container).setOption(option)
    },
  },
}
</script>

<style scoped>
.relation-chart {
  padding: 10px;
}
.relation-chart,
.relation-inner-chart {
  width: 100%;
  height: 100%;
}
</style>
