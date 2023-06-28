<template>
  <div>
    <div class="rackthumbnail">
      <a-popover>
        <template slot="content">
          <p>{{ rackName }}</p>
        </template>
        <a-badge :count="alarmCont" :overflow-count="99" class="alarmstatus-item">
          <div class="rackthumbnail-icon" :style="rackContainerStyle">
            <div :style="getInnerboxStyle()">
              <div :style="getTittleboxStyle()">
                <div class="box-text">
                  <div>
                    <p class="node-info-style">
                      {{ nodes }}
                    </p>
                    <p class="energy-info-style">
                      {{ $t('Rack.TotalNodes') }}
                    </p>
                  </div>
                </div>
              </div>
              <div :style="getTittleboxStyle()">
                <div class="box-text">
                  <div>
                    <p class="node-info-style">
                      {{ formatEnergy(energy) }}
                      {{ $t('Monitor.Group.Ene.Unit') }}
                    </p>
                    <p class="energy-info-style">
                      {{ $t('Physical.RowList.Energy') }}
                    </p>
                  </div>
                </div>
              </div>
              <div :style="getTittleboxStyle()">
                <div ref="container" :style="getChartStyle()" />
              </div>
              <div class="rack-name-style">
                {{ rackName }}
              </div>
            </div>
          </div>
        </a-badge>
      </a-popover>
    </div>
  </div>
</template>

<script type="text/javascript">
import * as ECharts from 'echarts'
import Format from './../../common/format'
export default {
  props: [
    'height',
    'width',
    'notify_num',
    'nodes',
    'energy',
    'usedNumber',
    'offNumber',
    'busyNumber',
    'freeNumber',
    'rackName',
  ],
  data() {
    return {
      alarmCont: this.notify_num,
      rackContainerStyle: {
        display: 'block',
        height: '0px',
        width: '0px',
      },
      innerChart: null,
    }
  },
  mounted() {
    this.init()
    this.$watch(
      () => {
        return [this.usedNumber, this.offNumber, this.busyNumber, this.freeNumber]
      },
      (val, oldVal) => {
        this.initChart()
      },
    )
  },
  methods: {
    getRackBackgroundImg(imageName) {
      return './../asset/image/rack/' + imageName
    },
    init() {
      this.rackContainerStyle = {
        display: 'block',
        height: this.height,
        width: this.width,
      }
      this.innerChart = ECharts.init(this.$refs.container, window.gApp.echartsTheme.nodegroupStatus)
      this.initChart()
    },
    getInnerboxStyle() {
      const innerboxCss = {
        width: '100%',
        height: '100%',
        padding:
          '10px ' +
          '10px ' +
          String(parseInt(parseFloat(this.height.substring(0, this.height.length - 1)) * 0.12)) +
          'px ' +
          '10px',
        'box-sizing': 'border-box',
      }
      return innerboxCss
    },
    getTittleboxStyle() {
      const littleboxCss = {
        height: String(parseInt(parseFloat(this.height.substring(0, this.height.length - 1)) * 0.28)) + 'px',
        padding: '5px',
        'box-sizing': 'border-box',
      }
      return littleboxCss
    },
    getChartStyle() {
      const chartStyle = {
        width: String(parseInt(this.width.substring(0, this.width.length - 1)) - 30) + 'px',
        height: '100%',
        'background-color': '#F8F8F8',
      }
      return chartStyle
    },
    initChart() {
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function (item) {
            return item.name + ': ' + item.value
          },
        },
        series: [
          {
            name: 'Rack State',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              scale: false,
              label: {
                show: false,
                itemStyle: {
                  fontSize: '10',
                  fontWeight: 'bold',
                },
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              { value: this.busyNumber, name: 'busy' },
              { value: this.freeNumber, name: 'idle' },
              { value: this.offNumber, name: 'off' },
              { value: this.usedNumber, name: 'on' },
            ],
          },
        ],
      }
      this.innerChart.setOption(option)
    },
    formatEnergy(energy) {
      return Format.formatEnergy(energy, 1000) // 1000W = 1kW
    },
  },
}
</script>

<style media="screen">
.rackthumbnail-icon {
  background-image: url('static/img/rack/rack-thumbnail.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
}
.box-text {
  text-align: center;
  position: relative;
  /* background-color: #f8f8f8; */
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.node-info-style {
  text-align: center;
  vertical-align: middle;
  /* color: #40aaff; */
  font-size: 14px;
}
.energy-info-style {
  text-align: center;
  vertical-align: middle;
  font-size: 12px;
  /* color: #999999; */
}
.rack-name-style {
  text-align: right;
  /* color: #999; */
  font-size: 10px;
}
</style>
