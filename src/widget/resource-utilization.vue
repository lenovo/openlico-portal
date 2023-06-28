<template>
  <div ref="outerContainer" class="b-w outer-container">
    <a-popover overlay-class-name="width-266" :align="{ points: ['tl', 'tr'] }">
      <template slot="content">
        <a-row v-if="text.length" type="flex" style="margin-bottom: 16px">
          <a-col :span="12">
            {{ text[0] }}
          </a-col>
          <a-col :span="12" style="text-align: right; color: #999">
            {{ text[1] }}
          </a-col>
        </a-row>
        <a-row type="flex" class="job-used-tips">
          <a-col :span="3" style="position: relative">
            <span class="icon" :style="{ 'background-color': color }" />
          </a-col>
          <a-col :span="16">
            {{ $t('Monitor.Cluster.Resources.JobUsed') }}
          </a-col>
          <a-col :span="5" class="value">
            {{ error ? '-' : jobUsedValue }}
          </a-col>
        </a-row>
        <a-row type="flex" class="job-free-tips">
          <a-col :span="3" style="position: relative">
            <span class="icon">
              <span class="outer">
                <span class="free-block" />
                <span class="border" :style="{ 'border-color': color }" />
                <span class="line" />
              </span>
            </span>
          </a-col>
          <a-col :span="16">
            {{ $t('Monitor.Cluster.Resources.Vacant') }}
          </a-col>
          <a-col :span="5" class="value" :style="{ color: error ? '' : '#449fff' }">
            {{ error ? '-' : vacantValue }}
          </a-col>
        </a-row>
        <a-row type="flex" class="job-allocated-tips">
          <a-col :span="3">
            <span class="icon">
              <span class="outer">
                <span class="border" :style="{ 'border-color': color }" />
                <span class="line" />
              </span>
            </span>
          </a-col>
          <a-col :span="16">
            {{ $t('Monitor.Cluster.Resources.JobAllocated') }}
          </a-col>
          <a-col :span="5" class="value">
            {{ error ? '-' : jobAllocatedValue }}
          </a-col>
        </a-row>
        <a-row type="flex" class="system-used-tips">
          <a-col :span="3">
            <span class="icon" :style="{ 'background-color': color.replace(')', ',0.5)') }" />
          </a-col>
          <a-col :span="16">
            {{ $t('Monitor.Cluster.Resources.SystemUsed') }}
          </a-col>
          <a-col :span="5" class="value">
            {{ error ? '-' : systemUsedValue }}
          </a-col>
        </a-row>
        <a-row type="flex" class="system-allocated-tips">
          <a-col :span="3">
            <span class="icon" :style="{ 'border-color': '#999' }" />
          </a-col>
          <a-col :span="16">
            {{ $t('Monitor.Cluster.Resources.SystemAllocated') }}
          </a-col>
          <a-col :span="5" class="value">
            {{ error ? '-' : systemAllocatedValue }}
          </a-col>
        </a-row>
      </template>
      <canvas ref="canvas" class="resource-progress-bar" width="1" height="1"
        >Your browser does not support the canvas element.</canvas
      >
    </a-popover>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: Array,
      default: function () {
        return []
      },
    },
    color: {
      type: String,
      default: 'rgb(24,144,255)',
      validator: function (value) {
        return value.startsWith('rgb')
      },
    },
    data: {
      type: Object,
      default: function () {
        return {
          jobUsed: 0,
          allocated: 0,
          nonSchedulable: 0,
          systemUsed: 0,
          vacant: 0,
          total: 0,
        }
      },
    },
    barHeight: {
      type: Number,
      default: 16,
    },
  },
  data() {
    return {
      jobUsedValue: '',
      vacantValue: '',
      jobAllocatedValue: '',
      systemUsedValue: '',
      systemAllocatedValue: '',
      error: false,
    }
  },
  watch: {
    color() {
      this.$nextTick(() => {
        this.setCanvasSize()
        this.draw()
      })
    },
    data() {
      this.$nextTick(() => {
        this.setCanvasSize()
        this.draw()
      })
    },
    barHeight() {
      this.$nextTick(() => {
        this.setCanvasSize()
        this.draw()
      })
    },
  },
  mounted() {
    this.setCanvasSize()
    this.draw()
    window.addEventListener('resize', this.resize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resize)
    clearTimeout(this.resizeTimer)
  },
  methods: {
    setCanvasSize() {
      const width = window.getComputedStyle(this.$refs.outerContainer, null).getPropertyValue('width')
      this.$refs.canvas.width = parseInt(width) >= 100 ? parseInt(width) : 100
      this.$refs.canvas.height = this.barHeight + 6
    },
    resize() {
      this.$nextTick(() => {
        clearTimeout(this.resizeTimer)
        this.resizeTimer = setTimeout(() => {
          this.setCanvasSize()
          this.draw()
        }, 200)
      })
    },
    draw() {
      const canvas = this.$refs.canvas
      const ctx = canvas.getContext('2d')
      const maxWidth = canvas.width - 4
      const barHeight = this.barHeight
      const drawY = 3
      const drawX = 2
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (this.hasErrorItem()) {
        // draw error
        ctx.fillStyle = '#FFDFDF'
        ctx.fillRect(drawX, drawY, maxWidth, barHeight)
        for (let i = 2; i <= maxWidth - 2; i = i + 10) {
          ctx.strokeStyle = '#FFFFFF'
          ctx.lineWidth = 2
          ctx.moveTo(i + drawX, drawY)
          ctx.lineTo(i + drawX + 10, barHeight + drawY)
        }
        ctx.stroke()
        return false
      }
      if (this.isSafeNumber(this.data.vacant)) {
        this.vacantValue = Number(this.data.vacant.toFixed(2)) + '%'
      }
      const jobUsedPercent = this.data.jobUsed / 100
      if (this.isSafeNumber(jobUsedPercent)) {
        this.jobUsedValue = Number((jobUsedPercent * 100).toFixed(2)) + '%'
      }
      const systemUsedPercent = this.data.systemUsed / 100
      if (this.isSafeNumber(systemUsedPercent)) {
        this.systemUsedValue = Number((systemUsedPercent * 100).toFixed(2)) + '%'
      }
      const threshold = parseFloat(this.data.allocated / this.data.total)
      if (this.isSafeNumber(threshold)) {
        this.jobAllocatedValue = Number((threshold * 100).toFixed(2)) + '%'
      }
      const nonSchedulablePercent = this.data.nonSchedulable / this.data.total
      if (this.isSafeNumber(nonSchedulablePercent)) {
        this.systemAllocatedValue = Number((nonSchedulablePercent * 100).toFixed(2)) + '%'
      }
      // draw background
      ctx.fillStyle = '#F1F1F1'
      ctx.fillRect(drawX, drawY, maxWidth, barHeight)
      // draw jobUsed percent
      if (this.isSafeNumber(jobUsedPercent)) {
        ctx.fillStyle = this.color
        ctx.fillRect(drawX, drawY, maxWidth * jobUsedPercent, barHeight)
      }
      // draw nonSchedulable percent
      if (this.isSafeNumber(nonSchedulablePercent) && nonSchedulablePercent !== 0) {
        ctx.strokeStyle = '#999'
        ctx.setLineDash([2, 2])
        ctx.strokeRect(
          drawX + maxWidth * (1 - nonSchedulablePercent),
          drawY,
          maxWidth * nonSchedulablePercent,
          barHeight,
        )
      }
      // draw systemUsed percent
      if (this.isSafeNumber(systemUsedPercent)) {
        ctx.setLineDash([1, 0])
        ctx.fillStyle = this.color.replace('rgb', 'rgba').replace(')', ',0.5)')
        ctx.fillRect(drawX + maxWidth * (1 - systemUsedPercent), drawY, maxWidth * systemUsedPercent, barHeight)
      }
      // draw threshold value
      if (this.isSafeNumber(threshold)) {
        ctx.beginPath()
        ctx.strokeStyle = '#225080'
        ctx.lineWidth = 2
        ctx.moveTo(maxWidth * threshold + drawX, drawY - 1.5)
        ctx.lineTo(maxWidth * threshold + drawX, drawY + 17.5)
        ctx.stroke()
        ctx.beginPath()
        ctx.strokeStyle = this.color
        ctx.lineWidth = 3
        ctx.moveTo(maxWidth * threshold + drawX - 3, drawY - 3)
        ctx.lineTo(maxWidth * threshold + drawX + 3, drawY - 3)
        ctx.moveTo(maxWidth * threshold + drawX - 3, drawY + barHeight + 3)
        ctx.lineTo(maxWidth * threshold + drawX + 3, drawY + barHeight + 3)
        ctx.stroke()
      }
    },
    isSafeNumber(val) {
      if (Number.isNaN(val) || !Number.isFinite(val) || val === undefined || val === null) {
        return false
      }
      return true
    },
    hasErrorItem() {
      this.error = false
      const data = this.data
      const keys = ['jobUsed', 'allocated', 'nonSchedulable', 'systemUsed', 'vacant', 'total']
      let error = false
      keys.forEach(el => {
        if (data[el] === undefined || data[el] === null || data[el] === '') {
          error = true
        }
      })
      if (error) {
        this.error = true
        return true
      }
      return false
    },
  },
}
</script>

<style scoped>
.outer-container {
  min-width: 100px;
  min-height: 22px;
}
.title {
  padding-bottom: 20px;
}
.outer-container >>> .width-266 {
  width: 266px;
}
.job-used-tips .icon,
.system-used-tips .icon,
.job-allocated-tips .icon,
.job-free-tips .icon,
.system-allocated-tips .icon {
  width: 14px;
  height: 14px;
  border-radius: 2px;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
}
.job-free-tips .icon,
.job-allocated-tips .icon {
  border-radius: 0;
}
.job-free-tips .icon .outer,
.job-allocated-tips .icon .outer {
  width: 14px;
  height: 14px;
  position: relative;
  display: inline-block;
}
.job-allocated-tips .icon .border {
  width: 5px;
  height: 14px;
  border-top: 2px solid;
  border-bottom: 2px solid;
  left: 50%;
  transform: translateX(-50%);
  position: absolute;
}
.job-free-tips .icon .border {
  width: 5px;
  height: 14px;
  border-top: 2px solid;
  border-bottom: 2px solid;
  right: 0;
  position: absolute;
}
.job-free-tips .icon .line {
  width: 1px;
  height: 10px;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #225080;
  position: absolute;
}
.job-allocated-tips .icon .line {
  width: 1px;
  height: 10px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: #225080;
  position: absolute;
}
.system-allocated-tips .icon {
  border: 1px dashed;
  border-radius: 0;
}
.job-used-tips .value,
.system-used-tips .value,
.job-allocated-tips .value,
.job-free-tips .value,
.system-allocated-tips .value {
  text-align: right;
}
.job-free-tips .free-block {
  width: 12px;
  top: 2px;
  right: 3px;
  height: 10px;
  background-color: #f1f1f1;
  position: absolute;
}
.job-used-tips,
.system-used-tips,
.job-allocated-tips,
.job-free-tips {
  margin-bottom: 8px;
}
.ant-col-12:nth-child(1) {
  color: #333;
}
.ant-col-16 {
  color: #aaa;
}
</style>
