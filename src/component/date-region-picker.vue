<template>
  <div id="tid_date-picker" class="lico-date-picke-date" @click="disabledEdit">
    <a-date-picker
      id="tid_date-picker-start-time"
      v-model:value="startTime"
      popup-class-name="date-pick-container"
      name="lico-date-picker-start-time"
      mode="date"
      :show-today="false"
      :disabled-date="startPickerOptions"
      :placeholder="$t('Date.Picker.startTime')"
      :disabled="disabled" />
    <i style="margin-right: 5px"> -</i>
    <a-date-picker
      id="tid_date-picker-end-time"
      v-model:value="endTime"
      popup-class-name="date-pick-container"
      mode="date"
      :show-today="false"
      :disabled-date="endPickerOptions"
      :placeholder="$t('Date.Picker.endTime')"
      :disabled="disabled" />
    <div v-if="quickPickenabel" style="display: inline-block; margin-left: 20px">
      <span v-for="(label, index) in pickerLabelDefault" :key="index" class="datePicklabel">
        <a
          class="lico-date-picke-label-style"
          :class="{ highLight: index == currentIndex }"
          @click="onSetTime(label, index)"
          >{{ $T('Date.Picker.' + label.unit, { size: label.size }) }}</a
        >
      </span>
    </div>
  </div>
</template>

<script>
import dayjs from '@/dayjs'
export default {
  props: ['value', 'quickPick', 'disabled'],
  emits: ['date-change'],
  data() {
    return {
      startPickerOptions: this.pickerDateDisabled(this.value[1], 'start'),
      endPickerOptions: this.pickerDateDisabled(this.value[0], 'end'),
      startTime: this.value[0] ? dayjs(this.value[0]) : null,
      endTime: this.value[1] ? dayjs(this.value[1]) : null,
      pickerLabelList: ['d', 'day', 'w', 'week', 'm', 'month'],
      quickPickenabel: this.quickPick && this.quickPick !== '' && this.quickPick !== [],
      pickerLabelDefault: [],
      debug: true,
      currentIndex: null,
      optionTime: [],
    }
  },
  mounted() {
    if (this.quickPick) {
      let quickPick = this.quickPick
      if (quickPick === 'default') {
        quickPick = ['1d', '7d', '30d']
      }
      if (typeof quickPick === 'object') {
        this.initPickerLabel(quickPick)
      }
    }

    this.$watch(
      () => {
        return {
          start: this.startTime,
          end: this.endTime,
        }
      },
      (newVal, oldVal) => {
        newVal.start = newVal.start ? newVal.start.format('YYYY/MM/DD') : ''
        newVal.end = newVal.end ? newVal.end.format('YYYY/MM/DD') : ''
        this.endPickerOptions = this.pickerDateDisabled(newVal.start, 'end')
        this.startPickerOptions = this.pickerDateDisabled(newVal.end, 'start')

        const start = newVal.start ? new Date(newVal.start + ' 00:00:00') : ''
        const end = newVal.end ? new Date(newVal.end + ' 23:59:59') : ''

        const interval = new Date(newVal.end) - new Date(newVal.start)

        this.currentIndex = null
        for (let i = 0; i < this.optionTime.length; i++) {
          if (interval === this.optionTime[i]) {
            this.currentIndex = i
          }
        }

        this.$emit('date-change', [start, end])
      },
    )
  },
  methods: {
    initPickerLabel(quickPick) {
      const optionTime = []
      for (let i = 0; i < quickPick.length; i++) {
        const num = parseInt(quickPick[i])
        const unit = quickPick[i].replace(num, '')
        let time = 0
        if (unit === 'd' || unit === 'day') {
          time = (num - 1) * 3600 * 24 * 1000
        } else if (unit === 'w' || unit === 'week') {
          time = (num * 7 - 1) * 3600 * 24 * 1000
        } else if (unit === 'm' || unit === 'month') {
          time = (num * 31 - 1) * 3600 * 24 * 1000
        }
        optionTime.push(time)
      }
      this.optionTime = optionTime
      quickPick.forEach(item => {
        const num = parseInt(item)
        let str = item.substr(String(num).length)
        if (this.pickerLabelList.indexOf(str) !== -1) {
          if (str.length > 1) {
            str = str.substr(0, 1)
          }
          this.pickerLabelDefault.push({
            size: num,
            unit: num <= 1 ? str : str + 's',
          })
        }
      })
    },
    onSetTime(label, index) {
      this.currentIndex = index
      const num = label.size
      const str = label.unit
      const oneDayTime = 3600 * 1000 * 24
      const startTime = new Date()
      const endTime = new Date()
      if (str === 'd' || str === 'ds') {
        if (num > 1) {
          startTime.setTime(Date.now() - oneDayTime * (num - 1))
          endTime.setTime(Date.now())
        } else {
          startTime.setTime(Date.now())
          endTime.setTime(Date.now())
        }
      } else if (str === 'w' || str === 'ws') {
        startTime.setTime(startTime.getTime() - oneDayTime * 7 * num + 8.64e7)
        endTime.setTime(Date.now())
      } else if (str === 'm' || str === 'ms') {
        startTime.setTime(startTime.getTime() - oneDayTime * 30 * num)
        endTime.setTime(Date.now())
      }
      this.startTime = dayjs(startTime.getTime())
      this.endTime = dayjs(endTime.getTime())
    },
    pickerDateDisabled(date, type) {
      const disabledDate = function (time) {
        const dateTime = new Date(time.format('YYYY/MM/DD'))
        if (date) {
          if (type === 'start') {
            if (new Date(date) < dateTime.getTime()) {
              return dateTime.getTime() > new Date(date)
            } else {
              return dateTime.getTime() > Date.now()
            }
          } else {
            return dateTime.getTime() < new Date(date)
          }
        } else {
          return dateTime.getTime() > Date.now()
        }
      }
      return disabledDate
    },
    clear() {
      this.currentIndex = null
      this.startTime = ''
      this.endTime = ''
    },
    disabledEdit() {
      this.$nextTick(() => {
        const dateInput = document.querySelectorAll('.date-pick-container .ant-calendar-input')
        dateInput.forEach(el => {
          el.setAttribute('readonly', true)
        })
      })
    },
  },
}
</script>

<style>
.lico-date-picke-date,
.lico-date-picke-label {
  margin-right: 20px;
}
.datePicklabel {
  display: inline-block;
  margin-right: 20px;
  height: 36px;
  line-height: 36px;
}
.datePicklabel a {
  cursor: pointer;
  color: #a0a0a0;
}
.highLight {
  color: #40aaff !important;
}
</style>
