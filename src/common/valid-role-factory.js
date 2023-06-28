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

import LibPhoneNumber from 'google-libphonenumber'
import Utils from './utils'
const phoneUtil = LibPhoneNumber.PhoneNumberUtil.getInstance()

function getRequireRoleForText(itemLabel) {
  return {
    required: true,
    message: window.gApp.$t('Valid.Require', { name: itemLabel }),
    //  trigger: 'blur'
  }
}

function getLengthRoleForText(itemLabel, min, max) {
  return {
    min,
    max,
    message: window.gApp.$t('Valid.Text.Length', { name: itemLabel, min, max }),
    // trigger: 'blur'
  }
}

function getValidTemplateFileName(itemLabel) {
  const pattern = /^([a-zA-Z0-9]+[_-\s]*)+[a-zA-Z0-9]+$/
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      const regExp = pattern
      if (value.toString().length > 0 && !regExp.test(value.toString())) {
        errors.push(new Error(window.gApp.$t('Valid.Template.Name', { name: itemLabel })))
      }
      callback(errors)
    },
  }
}

function getValidIdentityNameRoleForText(itemLabel) {
  const pattern = '^[a-zA-Z0-9_]+$'
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      const regExp = new RegExp(pattern)
      if (value.toString().length > 0 && !regExp.test(value.toString())) {
        errors.push(new Error(window.gApp.$t('Valid.Text.Name', { name: itemLabel })))
      }
      callback(errors)
    },
  }
}

function getValidQueueNameRoleForText(itemLabel) {
  const pattern = '^[a-zA-Z0-9_-]+$'
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      const regExp = new RegExp(pattern)
      if (value.toString().length > 0 && !regExp.test(value.toString())) {
        errors.push(new Error(window.gApp.$t('Valid.Queue.Name', { name: itemLabel })))
      }
      callback(errors)
    },
  }
}

function getValidRunTimeRoleForText(itemLabel) {
  const pattern = '^([\\s]*([0-9]+d\\b)?[\\s]*)([0-9]+h\\b)?[\\s]*([0-9]+m\\b)?[\\s]*$'
  return {
    validator(rule, value, callback, source, options) {
      if (value === '') {
        callback()
        return
      }
      const errors = []
      const regExp = new RegExp(pattern)
      if (value.replace(/\s+/g, '') && value.toString().length > 0 && !regExp.test(value.toString())) {
        errors.push(new Error(window.gApp.$t('Valid.Text.RunTime', { name: itemLabel })))
      }
      const result = value.split(/\s+/)
      let temp = 0
      result.forEach(i => {
        if (i.length > 0) {
          const item = i.replace(/\s/g, '')
          const unit = item.charAt(item.length - 1)
          const time = parseInt(i)
          if (unit === 'd') {
            temp += time * 24 * 60
          }
          if (unit === 'h') {
            temp += time * 60
          }
          if (unit === 'm') {
            temp += time
          }
        }
      })

      if (value.replace(/\s+/g, '') && temp > 525600) {
        errors.push(new Error(window.gApp.$t('Valid.Text.RunTime.Max', { name: itemLabel })))
      }
      if (value.replace(/\s+/g, '') && temp < 1) {
        errors.push(new Error(window.gApp.$t('Valid.Text.RunTime.Min', { name: itemLabel })))
      }
      callback(errors)
    },
  }
}

// include chinese
function getValidIdentityNameRoleIncludeChineseText(itemLabel) {
  const pattern = /^(?!_|-|\s)(?!.*?(_|-|\s)$)[a-zA-Z0-9_\u4e00-\u9fa5\s-]+$/
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      const regExp = pattern
      if (value.toString().length > 0 && !regExp.test(value.toString())) {
        errors.push(new Error(window.gApp.$t('Valid.Text.Chinese.Name', { name: itemLabel })))
      }
      callback(errors)
    },
  }
}

function getRequireRoleForNumber(itemLabel) {
  return {
    type: 'number',
    required: true,
    message: window.gApp.$t('Valid.Require', { name: itemLabel }),
    // trigger: 'blur'
  }
}

function getValidNumberRoleForText(itemLabel) {
  return {
    type: 'pattern',
    // eslint-disable-next-line no-useless-escape
    pattern: /^(\-|\+)?\d+(\.\d+)?$/,
    message: window.gApp.$t('Valid.Number', { name: itemLabel }),
    // trigger: 'blur'
  }
}

function getNodesExpressionRoleForText(itemLabel) {
  return {
    type: 'pattern',
    pattern: /(^(\w)+$)|(^[\w].*([\w|\]])$)/,
    message: window.gApp.$t('Valid.NodesExpression', { name: itemLabel }),
    // trigger: 'blur'
  }
}

function getMaxTimeForText(itemLabel) {
  return {
    type: 'pattern',
    pattern: /(\d{1,3}-\d{1,2}:\d{1,2}$)|(\d{1,3}-\d{1,2}:\d{1,2}:\d{1,2}$)/,
    message: window.gApp.$t('Valid.MaxTime', { name: itemLabel }),
    // trigger: 'blur'
  }
}

function getMaxTimeRangeRoleForText() {
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      const days = value.split('-')[0]
      const hours = value.split('-')[1].split(':')[0]
      const mins = value.split('-')[1].split(':')[1]
      if (days < 0 || days > 365) {
        errors.push(new Error(window.gApp.$t('Valid.MaxTime.Days.Range')))
      } else if (hours < 0 || hours > 23) {
        errors.push(new Error(window.gApp.$t('Valid.MaxTime.Hours.Range')))
      } else if (mins < 0 || mins > 59) {
        errors.push(new Error(window.gApp.$t('Valid.MaxTime.Mins.Range')))
      }
      callback(errors)
    },
  }
}

function getNumberRangeRoleForText(itemLabel, min, max) {
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      if (value.length > 0) {
        const num = parseFloat(value)
        if (num < min || num > max) {
          if (min === max) {
            errors.push(new Error(window.gApp.$t('Valid.Number.Range.Equal', { name: itemLabel, equal: max })))
          } else if (!max && max !== 0) {
            errors.push(new Error(window.gApp.$t('Valid.Number.Range.Min', { name: itemLabel, min })))
          } else if (!min && min !== 0) {
            errors.push(new Error(window.gApp.$t('Valid.Number.Range.Max', { name: itemLabel, max })))
          } else {
            errors.push(new Error(window.gApp.$t('Valid.Number.Range', { name: itemLabel, min, max })))
          }
        }
      }
      callback(errors)
    },
  }
}

function getNumberDecimalRoleForText(itemLabel, decimal) {
  const numberPattern = '^(\\-|\\+)?\\d+(\\.\\d+)?$'
  const pattern = '^[-]?\\d+(\\.\\d{0,' + decimal + '})?$'
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      const numberRegExp = new RegExp(numberPattern)
      const regExp = new RegExp(pattern)
      if (value.length > 0 && numberRegExp.test(value) && !regExp.test(value)) {
        errors.push(new Error(window.gApp.$t('Valid.Number.Decimal', { name: itemLabel, decimal })))
      }
      callback(errors)
    },
  }
}

function getValidNaturalNumber(itemLabel) {
  const pattern = /^\d+$/
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      if (!!value && !pattern.test(value)) {
        errors.push(new Error(window.gApp.$t('Valid.Number', { name: itemLabel })))
      }
      callback(errors)
    },
  }
}

function getRangeRoleForNumber(itemLabel, min, max) {
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      if (value.toString().length > 0) {
        const num = parseFloat(value.toString())
        if (num < min || num > max) {
          errors.push(new Error(window.gApp.$t('Valid.Number.Range', { name: itemLabel, min, max })))
        }
      }
      callback(errors)
    },
  }
}

function getDynamicRangeRoleForNumber(itemLabel, min, max) {
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      if (value.toString().length > 0) {
        const num = parseFloat(value.toString())
        if (num < min() || num > max()) {
          errors.push(new Error(window.gApp.$t('Valid.Number.Range', { name: itemLabel, min: min(), max: max() })))
        }
      }
      callback(errors)
    },
  }
}

function getDecimalRoleForNumber(itemLabel, decimal) {
  const pattern = '^[-]?\\d+(\\.\\d{0,' + decimal + '})?$'
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      const regExp = new RegExp(pattern)
      if (value.toString().length > 0 && !regExp.test(value.toString())) {
        errors.push(new Error(window.gApp.$t('Valid.Number.Decimal', { name: itemLabel, decimal })))
      }
      callback(errors)
    },
  }
}

function getRequireRoleForArray(itemLabel) {
  return {
    type: 'array',
    required: true,
    message: window.gApp.$t('Valid.Require', { name: itemLabel }),
    trigger: 'blur',
  }
}

function getLengthRoleForArray(itemLabel, min, max) {
  return {
    type: 'array',
    min,
    max,
    message: window.gApp.$t('Valid.Array.Length', { name: itemLabel, min, max }),
    trigger: 'blur',
  }
}

function getUniqueRoleForArray(itemLabel) {
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      if (value instanceof Array) {
        for (let i = 0; i < value.length; i++) {
          for (let j = i + 1; j < value.length; j++) {
            if (Utils.objectEquals(value[i], value[j])) {
              errors.push(new Error(window.gApp.$t('Valid.Array.Unique', { name: itemLabel })))
              break
            }
          }
          if (errors.length > 0) {
            break
          }
        }
      }
      callback(errors)
    },
  }
}

function getEmailRole(itemLabel) {
  return {
    type: 'pattern',
    // pattern: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
    // pattern: /^([a-zA-Z0-9]+[\._-]*)+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
    // pattern: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/,
    // eslint-disable-next-line no-useless-escape
    pattern: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    message: window.gApp.$t('Valid.Email', { name: itemLabel }),
    trigger: 'blur',
  }
}
function getPathRole(itemLabel) {
  return {
    validator: (rule, value, callback) => {
      if (value.indexOf('\\') > 0) {
        callback(new Error(window.gApp.$t('Valid.Path', { name: itemLabel })))
      } else {
        callback()
      }
    },
    trigger: 'blur',
  }
}

function getPasswordRole(itemLabel) {
  const pattern =
    '^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\\W_]+$)(?![a-z0-9]+$)(?![a-z\\W_]+$)(?![0-9\\W_]+$)[a-zA-Z0-9\\W_]{10,20}$'
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      const regExp = new RegExp(pattern)
      if (value.length > 0 && !regExp.test(value)) {
        if (value.length < 10 || value.length > 32) {
          errors.push(new Error(window.gApp.$t('Valid.Password.Length', { name: itemLabel })))
        } else {
          errors.push(new Error(window.gApp.$t('Valid.Password', { name: itemLabel })))
        }
      }
      callback(errors)
    },
  }

  // return {
  //   type: 'pattern',
  //   // pattern: /^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&*]+$)(?![a-zA-z\d]+$)(?![a-zA-z!@#$%^&*]+$)(?![\d!@#$%^&*]+$)[a-zA-Z\d!@#$%^&*]+$/,
  //   pattern: /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{10,20}$/,
  //   message: window.gApp.$t('Valid.Password', {'name': itemLabel}),
  //   trigger: 'blur'
  // };
}

// function getMobileRole(itemLabel) {
//   return {
//     type: 'pattern',
//     //pattern: /^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70)\d{8}$/,
//     pattern: /^((1[3,5,8][0-9])|(14[5,7])|(17[0,6,7,8])|(19[7]))\d{8}$/,
//     message: window.gApp.$t('Valid.Mobile', {'name': itemLabel}),
//     trigger: 'blur'
//   };
// }

function getMobileRole(itemLabel, country, mustMobile) {
  // Get country code
  // const country = window.gApp.$store.getters['settings/getMobilePolicy']
  return {
    validator: (rule, value, callback) => {
      if (value.length > 0) {
        try {
          const phonenumber = phoneUtil.parseAndKeepRawInput(value, country)
          let isaphone = phoneUtil.isValidNumber(phonenumber)
          const isMobile = phoneUtil.getNumberType(phonenumber)
          if (!isaphone) {
            isaphone = false
            throw Error(false)
          } else {
            if (mustMobile) {
              // PhoneNumberType
              // PhoneNumberType
              // FIXED_LINE:0,MOBILE:1,FIXED_LINE_OR_MOBILE:2,
              // TOLL_FREE:3,PREMIUM_RATE:4,SHARED_COST:5,
              // VOIP:6,PERSONAL_NUMBER:7,PAGER:8,UAN:9,
              // VOICEMAIL:10,UNKNOWN:-1
              // 1 || 2 is mobile
              if (isMobile === 1 || isMobile === 2) {
                callback()
              } else {
                isaphone = false
                throw Error(false)
              }
            } else {
              callback()
            }
          }
        } catch (error) {
          callback(new Error(window.gApp.$t('Valid.Mobile', { name: itemLabel })))
        }
      } else {
        callback()
      }
    },
    // trigger: 'chenge'
  }
}

function getArrayRequireForAI(itemLabel) {
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      if (value.trim() === '') {
        errors.push(new Error(window.gApp.$t('Valid.StepValues.Require')))
      } else if (!value.trim().includes(' ')) {
        errors.push(new Error(window.gApp.$t('Valid.StepValues.Sequence')))
      } else if (!isNaN(Number(value.trim()))) {
        errors.push(new Error(window.gApp.$t('Valid.StepValues.Sequence')))
      }
      callback(errors)
    },
  }
}

function getArrayValidForAI(itemLabel) {
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      // const n = '0123456789'
      value = value.trim()
      const numList = value.split(' ')
      let i = 0
      while (i < numList.length) {
        const num = numList[i]
        if (isNaN(Number(num))) {
          errors.push(new Error(window.gApp.$t('Valid.StepValues.Sequence')))
          break
        }
        if (num === '') {
          errors.push(new Error(window.gApp.$t('Valid.StepValues.Sequence')))
          break
        } else {
          i += 1
        }
      }
      if (errors.length === 0) {
        let tmp = numList[0]
        if (tmp === '0') {
          errors.push(new Error(window.gApp.$t('Valid.StepValues.Number')))
        } else {
          for (i = 1; i < numList.length; i++) {
            if (tmp < numList[i]) {
              tmp = numList[i]
            } else {
              errors.push(new Error(window.gApp.$t('Valid.StepValues.Ascend')))
              break
            }
          }
        }
      }
      callback(errors)
    },
  }
}

function getSuffixValid(itemLabel, rules) {
  const str = rules.join(', ')
  const pattern = `(${rules.join('|')})$`
  return {
    trigger: 'blur',
    validator(rule, value, callback, source, options) {
      let errors = []
      if (value.length > 0) {
        errors = [new Error(window.gApp.$t('Valid.Filename.Suffix', { name: itemLabel, value: str }))]
        const regExp = new RegExp(pattern, 'i')
        for (let i = 0; i < rules.length; i++) {
          if (regExp.test(value.substr(0 - rules[i].length))) {
            errors = []
            break
          }
        }
      }
      callback(errors)
    },
  }
}

function getValidUserameForText(itemLabel, caseInsensitive) {
  // eslint-disable-next-line no-useless-escape
  let pattern = '^[a-zA-Z0-9.][a-zA-Z0-9._-]+$'
  if (!caseInsensitive) {
    // eslint-disable-next-line no-useless-escape
    pattern = '^[a-z0-9.][a-z0-9._-]+$'
  }
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      const regExp = new RegExp(pattern)
      if (value.toString().length > 1 && !regExp.test(value.toString())) {
        if (caseInsensitive) {
          errors.push(new Error(window.gApp.$t('Valid.Text.Username', { name: itemLabel })))
        } else {
          errors.push(new Error(window.gApp.$t('Valid.Text.Username.NoCaseInsensitive', { name: itemLabel })))
        }
      }
      callback(errors)
    },
  }
}

function getValidSystemNameRoleForText(itemLabel, caseInsensitive) {
  let pattern = '^[a-zA-Z][a-zA-Z0-9_-]+$'
  if (!caseInsensitive) {
    pattern = '^[a-z][a-z0-9_-]+$'
  }
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      const regExp = new RegExp(pattern)
      if (value.toString().length > 1 && !regExp.test(value.toString())) {
        if (caseInsensitive) {
          errors.push(new Error(window.gApp.$t('Valid.Text.SystemName', { name: itemLabel })))
        } else {
          errors.push(new Error(window.gApp.$t('Valid.Text.SystemName.NoCaseInsensitive', { name: itemLabel })))
        }
      }
      callback(errors)
    },
  }
}

function getValidFileName(itemLabel) {
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      // var regExp = new RegExp(pattern);
      value = value.trim()
      // eslint-disable-next-line no-useless-escape
      const errorChars = '\\/:*?"<>| '
      for (let i = 0; i < value.length; i++) {
        if (errorChars.includes(value[i])) {
          errors.push(new Error(window.gApp.$t('Valid.FileName')))
          break
        }
      }
      callback(errors)
    },
  }
}

function getValidUsersName(allable, maxValue) {
  return {
    validator(rule, value, callback) {
      // eslint-disable-next-line no-useless-escape
      const Reg = /^[a-zA-Z0-9_,-\.]*$/
      if (value === '') {
        if (allable) {
          callback()
        } else {
          callback(new Error(window.gApp.$t('Multi.User.Required')))
        }
      } else if (!value.match(Reg)) {
        callback(new Error(window.gApp.$t('Multi.User.FormatError')))
      } else if (value.split(',').length > maxValue) {
        callback(new Error(window.gApp.$t('Multi.User.tooLong', { value: maxValue })))
      } else {
        callback()
      }
    },
    trigger: 'change',
  }
}

function getValidMultiSelect(allable) {
  return {
    validator(rule, value, callback) {
      if (value.length === 0 && !allable) {
        callback(new Error(window.gApp.$t('Multi.User.Required')))
      } else {
        callback()
      }
    },
    trigger: 'change',
  }
}

function getValidPathForText(itemLabel) {
  // eslint-disable-next-line no-useless-escape
  const pattern = /^(?!\")(?!.*?\"$)((\/|\\)?(\$\{)?[\w\.](\})?)+$/
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      const regExp = new RegExp(pattern)
      if (value.toString().length > 0 && !regExp.test(value.toString())) {
        errors.push(new Error(window.gApp.$t('Admin.Runtime.Env.Value.Valid', { name: itemLabel })))
      }
      callback(errors)
    },
  }
}

function getvalidMultiHostName(required = true) {
  const pattern = /^([a-zA-Z0-9_-]+)*[a-zA-Z0-9_-]$/
  return {
    required,
    pattern,
    validator(rule, value, callback) {
      if (!required && !value) {
        callback()
        return
      }
      const hosts = value.split(',')
      let valid = true
      for (let i = 0; i <= hosts.length; i++) {
        if (!pattern.test(hosts[i])) {
          valid = false
          break
        }
      }
      if (valid) {
        callback()
      } else {
        callback(new Error(window.gApp.$t('MultNode.Error.Format')))
      }
    },
  }
}

function getPasswordRoleByText() {
  const pattern = /(^\s|\s$)/
  return {
    validator(rule, value, callback) {
      if (pattern.test(value)) {
        callback(new Error(window.gApp.$t('Password.Invalid.Space')))
      }

      callback()
    },
  }
}

function getUsernameRoleByText(itemLabel) {
  const pattern = /\s/
  return {
    validator(rule, value, callback) {
      if (pattern.test(value)) {
        callback(new Error(window.gApp.$t('CloudTools.Username.Verification', { name: itemLabel })))
      }

      callback()
    },
  }
}

function getVaildPositiveInteger(itemLabel) {
  const pattern = /^[0-9]*[1-9][0-9]*$/
  return {
    validator(rule, value, callback) {
      if (!pattern.test(value)) {
        callback(new Error(window.gApp.$t('Valid.Positive.Integer', { name: itemLabel })))
      }

      callback()
    },
  }
}

export default {
  getRequireRoleForText,
  getLengthRoleForText,
  getValidTemplateFileName,
  getValidQueueNameRoleForText,
  getValidIdentityNameRoleForText,
  getValidIdentityNameRoleIncludeChineseText,
  getValidNumberRoleForText,
  getNumberRangeRoleForText,
  getNumberDecimalRoleForText,
  getRequireRoleForNumber,
  getRangeRoleForNumber,
  getDynamicRangeRoleForNumber,
  getDecimalRoleForNumber,
  getRequireRoleForArray,
  getLengthRoleForArray,
  getUniqueRoleForArray,
  getEmailRole,
  getPasswordRole,
  getMobileRole,
  getArrayRequireForAI,
  getArrayValidForAI,
  getSuffixValid,
  getValidUserameForText,
  getValidSystemNameRoleForText,
  getValidFileName,
  getNodesExpressionRoleForText,
  getValidUsersName,
  getValidMultiSelect,
  getMaxTimeForText,
  getMaxTimeRangeRoleForText,
  getValidPathForText,
  getPathRole,
  getValidNaturalNumber,
  getValidRunTimeRoleForText,
  getvalidMultiHostName,
  getPasswordRoleByText,
  getUsernameRoleByText,
  getVaildPositiveInteger,
}
