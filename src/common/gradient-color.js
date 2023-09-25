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

function getGradientColor(startColor, endColor, step) {
  const startRGB = getColorRgb(startColor)
  const startR = startRGB[0]
  const startG = startRGB[1]
  const startB = startRGB[2]
  const endRGB = getColorRgb(endColor)
  const endR = endRGB[0]
  const endG = endRGB[1]
  const endB = endRGB[2]
  const sR = (endR - startR) / step
  const sG = (endG - startG) / step
  const sB = (endB - startB) / step
  const colorArr = []
  for (let i = 0; i < step; i++) {
    const hex = getColorHex(
      'rgb(' + parseInt(sR * i + startR) + ',' + parseInt(sG * i + startG) + ',' + parseInt(sB * i + startB) + ')',
    )
    colorArr.push(hex)
  }
  return colorArr
}

function getColorRgb(sColor) {
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  sColor = sColor.toLowerCase()
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      let sColorNew = '#'
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
      }
      sColor = sColorNew
    }
    const sColorChange = []
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
    }
    return sColorChange
  } else {
    return sColor
  }
}

function getColorHex(rgb) {
  const _this = rgb
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  if (/^(rgb|RGB)/.test(_this)) {
    const aColor = _this.replace(/(?:(|)|rgb|RGB)*/g, '').split(',')
    let strHex = '#'
    for (let i = 0; i < aColor.length; i++) {
      let hex = Number(aColor[i]).toString(16)
      hex = hex < 10 ? 0 + '' + hex : hex
      if (hex === '0') {
        hex += hex
      }
      strHex += hex
    }
    if (strHex.length !== 7) {
      strHex = _this
    }
    return strHex
  } else if (reg.test(_this)) {
    const aNum = _this.replace(/#/, '').split('')
    if (aNum.length === 6) {
      return _this
    } else if (aNum.length === 3) {
      let numHex = '#'
      for (let i = 0; i < aNum.length; i += 1) {
        numHex += aNum[i] + aNum[i]
      }
      return numHex
    }
  } else {
    return _this
  }
}

export default {
  getGradientColor,
}
