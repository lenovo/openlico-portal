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

// import LibPhoneNumber from 'google-libphonenumber'
import Utils from './utils'
// const phoneUtil = LibPhoneNumber.PhoneNumberUtil.getInstance()

function getRequireRoleForText(itemLabel) {
  return {
    required: true,
    message: window.gApp.$T('Valid.Require', { name: itemLabel }),
    //  trigger: 'blur'
  }
}
function getLengthRoleForText(itemLabel, min, max) {
  return {
    min,
    max,
    message: window.gApp.$T('Valid.Text.Length', { name: itemLabel, min, max }),
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
        errors.push(new Error(window.gApp.$T('Valid.Template.Name', { name: itemLabel })))
      }
      if (errors.length) {
        return Promise.reject(errors)
      } else {
        return Promise.resolve()
      }
    },
  }
}

function getValidIdentityNameRoleForText(itemLabel) {
  const pattern = '^[a-zA-Z0-9_]+$'
  return {
    validator(rule, value) {
      const errors = []
      const regExp = new RegExp(pattern)
      if (value.toString().length > 0 && !regExp.test(value.toString())) {
        errors.push(new Error(window.gApp.$T('Valid.Text.Name', { name: itemLabel })))
      }
      if (errors.length) {
        return Promise.reject(errors)
      } else {
        return Promise.resolve()
      }
    },
  }
}

function getValidQueueNameRoleForText(itemLabel) {
  const pattern = '^[a-zA-Z0-9_-]+$'
  return {
    validator(rule, value) {
      const regExp = new RegExp(pattern)
      if (value.toString().length > 0 && !regExp.test(value.toString())) {
        return Promise.reject(new Error(window.gApp.$T('Valid.Queue.Name', { name: itemLabel })))
      }
      return Promise.resolve()
    },
  }
}

function getValidRunTimeRoleForText(itemLabel) {
  const pattern = '^([\\s]*([0-9]+d\\b)?[\\s]*)([0-9]+h\\b)?[\\s]*([0-9]+m\\b)?[\\s]*$'
  return {
    validator(rule, value) {
      if (value === '') {
        return Promise.resolve()
      }
      const errors = []
      const regExp = new RegExp(pattern)
      if (value.replace(/\s+/g, '') && value.toString().length > 0 && !regExp.test(value.toString())) {
        errors.push(new Error(window.gApp.$T('Valid.Text.RunTime', { name: itemLabel })))
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
        errors.push(new Error(window.gApp.$T('Valid.Text.RunTime.Max', { name: itemLabel })))
      }
      if (value.replace(/\s+/g, '') && temp < 1) {
        errors.push(new Error(window.gApp.$T('Valid.Text.RunTime.Min', { name: itemLabel })))
      }
      return Promise.reject(errors)
    },
  }
}

// include chinese
function getValidIdentityNameRoleIncludeChineseText(itemLabel) {
  const pattern = /^(?!_|-|\s)(?!.*?(_|-|\s)$)[a-zA-Z0-9_\u4e00-\u9fa5\s-]+$/
  return {
    validator(rule, value) {
      const regExp = pattern
      if (value.toString().length > 0 && !regExp.test(value.toString())) {
        return Promise.reject(new Error(window.gApp.$T('Valid.Text.Chinese.Name', { name: itemLabel })))
      }
      return Promise.resolve()
    },
  }
}

function getRequireRoleForNumber(itemLabel) {
  return {
    type: 'number',
    required: true,
    message: window.gApp.$T('Valid.Require', { name: itemLabel }),
    // trigger: 'blur'
  }
}

function getValidNumberRoleForText(itemLabel) {
  return {
    type: 'pattern',
    // eslint-disable-next-line no-useless-escape
    pattern: /^(\-|\+)?\d+(\.\d+)?$/,
    message: window.gApp.$T('Valid.Number', { name: itemLabel }),
    // trigger: 'blur'
  }
}

function getNodesExpressionRoleForText(itemLabel) {
  return {
    type: 'pattern',
    pattern: /(^(\w)+$)|(^[\w].*([\w|\]])$)/,
    message: window.gApp.$T('Valid.NodesExpression', { name: itemLabel }),
    // trigger: 'blur'
  }
}

function getMaxTimeForText(itemLabel) {
  return {
    type: 'pattern',
    pattern: /(\d{1,3}-\d{1,2}:\d{1,2}$)|(\d{1,3}-\d{1,2}:\d{1,2}:\d{1,2}$)/,
    message: window.gApp.$T('Valid.MaxTime', { name: itemLabel }),
    // trigger: 'blur'
  }
}

function getMaxTimeRangeRoleForText() {
  return {
    validator(rule, value) {
      if (value) {
        const days = value.split('-')[0]
        const hours = value.split('-')[1] === undefined ? -1 : value.split('-')[1].split(':')[0]
        const mins = value.split('-')[1] === undefined ? -1 : value.split('-')[1].split(':')[1]

        if (days < 0 || days > 365) {
          return Promise.reject(new Error(window.gApp.$T('Valid.MaxTime.Days.Range')))
        } else if (hours < 0 || hours > 23) {
          return Promise.reject(new Error(window.gApp.$T('Valid.MaxTime.Hours.Range')))
        } else if (mins < 0 || mins > 59) {
          return Promise.reject(new Error(window.gApp.$T('Valid.MaxTime.Mins.Range')))
        }
      }

      return Promise.resolve()
    },
  }
}

function getNumberRangeRoleForText(itemLabel, min, max) {
  return {
    validator(rule, value) {
      if (value.length > 0) {
        const num = parseFloat(value)
        if (num < min || num > max) {
          if (min === max) {
            return Promise.reject(
              new Error(window.gApp.$T('Valid.Number.Range.Equal', { name: itemLabel, equal: max })),
            )
          } else if (!max && max !== 0) {
            return Promise.reject(new Error(window.gApp.$T('Valid.Number.Range.Min', { name: itemLabel, min })))
          } else if (!min && min !== 0) {
            return Promise.reject(new Error(window.gApp.$T('Valid.Number.Range.Max', { name: itemLabel, max })))
          } else {
            return Promise.reject(new Error(window.gApp.$T('Valid.Number.Range', { name: itemLabel, min, max })))
          }
        }
      }
      return Promise.resolve()
    },
  }
}

function getNumberDecimalRoleForText(itemLabel, decimal) {
  const numberPattern = '^(\\-|\\+)?\\d+(\\.\\d+)?$'
  const pattern = '^[-]?\\d+(\\.\\d{0,' + decimal + '})?$'
  return {
    validator(rule, value) {
      const numberRegExp = new RegExp(numberPattern)
      const regExp = new RegExp(pattern)
      if (value.length > 0 && numberRegExp.test(value) && !regExp.test(value)) {
        return Promise.reject(
          new Error(
            window.gApp.$T('Valid.Number.Decimal', {
              name: itemLabel,
              decimal,
            }),
          ),
        )
      }
      return Promise.resolve()
    },
  }
}

function getValidNaturalNumber(itemLabel) {
  const pattern = /^\d+$/
  return {
    validator(rule, value) {
      const errors = []
      if (!!value && !pattern.test(value)) {
        errors.push(new Error(window.gApp.$T('Valid.Number', { name: itemLabel })))
      }
      return Promise[errors.length ? 'reject' : 'resolve'](errors)
    },
  }
}

function getRangeRoleForNumber(itemLabel, min, max) {
  return {
    validator(rule, value) {
      const errors = []
      if (value.toString().length > 0) {
        const num = parseFloat(value.toString())
        if (num < min || num > max) {
          errors.push(
            new Error(
              window.gApp.$T('Valid.Number.Range', {
                name: itemLabel,
                min,
                max,
              }),
            ),
          )
        }
      }
      if (errors.length) {
        return Promise.reject(errors)
      } else {
        return Promise.resolve()
      }
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
          errors.push(
            new Error(
              window.gApp.$T('Valid.Number.Range', {
                name: itemLabel,
                min: min(),
                max: max(),
              }),
            ),
          )
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
        errors.push(
          new Error(
            window.gApp.$T('Valid.Number.Decimal', {
              name: itemLabel,
              decimal,
            }),
          ),
        )
      }
      if (errors.length) {
        return Promise.reject(errors)
      } else {
        return Promise.resolve()
      }
    },
  }
}

function getRequireRoleForArray(itemLabel) {
  return {
    type: 'array',
    required: true,
    message: window.gApp.$T('Valid.Require', { name: itemLabel }),
    trigger: 'input',
  }
}

function getLengthRoleForArray(itemLabel, min, max) {
  return {
    type: 'array',
    min,
    max,
    message: window.gApp.$T('Valid.Array.Length', {
      name: itemLabel,
      min,
      max,
    }),
    trigger: 'blur',
  }
}

function getUniqueRoleForArray(itemLabel) {
  return {
    validator(rule, value) {
      return new Promise((resolve, reject) => {
        const errors = []
        if (value instanceof Array) {
          for (let i = 0; i < value.length; i++) {
            for (let j = i + 1; j < value.length; j++) {
              if (Utils.objectEquals(value[i], value[j])) {
                errors.push(new Error(window.gApp.$T('Valid.Array.Unique', { name: itemLabel })))
                break
              }
            }
            if (errors.length > 0) {
              break
            }
          }
        }
        if (errors.length > 0) {
          reject(errors)
        } else {
          resolve()
        }
      })
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
    message: window.gApp.$T('Valid.Email', { name: itemLabel }),
    trigger: 'blur',
  }
}
function getPathRole(itemLabel) {
  return {
    validator: (rule, value) => {
      if (value.indexOf('\\') > 0) {
        return Promise.reject(new Error(window.gApp.$T('Valid.Path', { name: itemLabel })))
      } else {
        return Promise.resolve()
      }
    },
    trigger: 'blur',
  }
}

function getPasswordRole(itemLabel) {
  const pattern =
    '^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\\W_]+$)(?![a-z0-9]+$)(?![a-z\\W_]+$)(?![0-9\\W_]+$)[a-zA-Z0-9\\W_]{10,20}$'
  return {
    validator(rule, value) {
      const regExp = new RegExp(pattern)
      if (value.length > 0 && !regExp.test(value)) {
        if (value.length < 10 || value.length > 32) {
          return Promise.reject(new Error(window.gApp.$T('Valid.Password.Length', { name: itemLabel })))
        } else {
          return Promise.reject(new Error(window.gApp.$T('Valid.Password', { name: itemLabel })))
        }
      }
      return Promise.resolve()
    },
  }
}

// function getMobileRole(itemLabel) {
//   return {
//     type: 'pattern',
//     //pattern: /^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70)\d{8}$/,
//     pattern: /^((1[3,5,8][0-9])|(14[5,7])|(17[0,6,7,8])|(19[7]))\d{8}$/,
//     message: window.gApp.$T('Valid.Mobile', {'name': itemLabel}),
//     trigger: 'blur'
//   };
// }

// function getMobileRole(itemLabel, country, mustMobile) {
//   // Get country code
//   // const country = window.gApp.$store.getters['settings/getMobilePolicy']
//   return {
//     validator: (rule, value, callback) => {
//       if (value.length > 0) {
//         try {
//           const phonenumber = phoneUtil.parseAndKeepRawInput(value, country)
//           let isaphone = phoneUtil.isValidNumber(phonenumber)
//           const isMobile = phoneUtil.getNumberType(phonenumber)
//           if (!isaphone) {
//             isaphone = false
//             throw Error(false)
//           } else {
//             if (mustMobile) {
//               // PhoneNumberType
//               // PhoneNumberType
//               // FIXED_LINE:0,MOBILE:1,FIXED_LINE_OR_MOBILE:2,
//               // TOLL_FREE:3,PREMIUM_RATE:4,SHARED_COST:5,
//               // VOIP:6,PERSONAL_NUMBER:7,PAGER:8,UAN:9,
//               // VOICEMAIL:10,UNKNOWN:-1
//               // 1 || 2 is mobile
//               if (isMobile === 1 || isMobile === 2) {
//                 callback()
//               } else {
//                 isaphone = false
//                 throw Error(false)
//               }
//             } else {
//               callback()
//             }
//           }
//         } catch (error) {
//           callback(new Error(window.gApp.$T('Valid.Mobile', { name: itemLabel })))
//         }
//       } else {
//         callback()
//       }
//     },
//     // trigger: 'chenge'
//   }
// }

function getArrayRequireForAI(itemLabel) {
  return {
    validator(rule, value, callback, source, options) {
      const errors = []
      if (value.trim() === '') {
        errors.push(new Error(window.gApp.$T('Valid.StepValues.Require')))
      } else if (!value.trim().includes(' ')) {
        errors.push(new Error(window.gApp.$T('Valid.StepValues.Sequence')))
      } else if (!isNaN(Number(value.trim()))) {
        errors.push(new Error(window.gApp.$T('Valid.StepValues.Sequence')))
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
          errors.push(new Error(window.gApp.$T('Valid.StepValues.Sequence')))
          break
        }
        if (num === '') {
          errors.push(new Error(window.gApp.$T('Valid.StepValues.Sequence')))
          break
        } else {
          i += 1
        }
      }
      if (errors.length === 0) {
        let tmp = numList[0]
        if (tmp === '0') {
          errors.push(new Error(window.gApp.$T('Valid.StepValues.Number')))
        } else {
          for (i = 1; i < numList.length; i++) {
            if (tmp < numList[i]) {
              tmp = numList[i]
            } else {
              errors.push(new Error(window.gApp.$T('Valid.StepValues.Ascend')))
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
  const regExp = new RegExp(`(${rules.join('|')})$`)
  return {
    trigger: 'blur',
    validator(rule, value) {
      const errors = []
      const type = value.split(';')[0]
      if (!regExp.test(type)) {
        errors.push(
          new Error(
            window.gApp.$T('Valid.Filename.Suffix', {
              name: itemLabel,
              value: str,
            }),
          ),
        )
      }
      return Promise[errors.length ? 'reject' : 'resolve'](errors)
    },
  }
}

function getValidUserameForText(itemLabel, caseInsensitive) {
  let pattern = '^[a-zA-Z0-9.][a-zA-Z0-9._-]+$'
  if (!caseInsensitive) {
    pattern = '^[a-z0-9.][a-z0-9._-]+$'
  }
  return {
    validator(rule, value) {
      const regExp = new RegExp(pattern)
      if (value.toString().length > 1 && !regExp.test(value.toString())) {
        if (caseInsensitive) {
          return Promise.reject(new Error(window.gApp.$T('Valid.Text.Username', { name: itemLabel })))
        } else {
          return Promise.reject(new Error(window.gApp.$T('Valid.Text.Username.NoCaseInsensitive', { name: itemLabel })))
        }
      }
      return Promise.resolve()
    },
  }
}

function getValidSystemNameRoleForText(itemLabel, caseInsensitive) {
  let pattern = '^[a-zA-Z][a-zA-Z0-9_-]+$'
  if (!caseInsensitive) {
    pattern = '^[a-z][a-z0-9_-]+$'
  }
  return {
    validator(rule, value) {
      const errors = []
      const regExp = new RegExp(pattern)
      if (value.toString().length > 1 && !regExp.test(value.toString())) {
        if (caseInsensitive) {
          errors.push(new Error(window.gApp.$T('Valid.Text.SystemName', { name: itemLabel })))
        } else {
          errors.push(
            new Error(
              window.gApp.$T('Valid.Text.SystemName.NoCaseInsensitive', {
                name: itemLabel,
              }),
            ),
          )
        }
      }
      return Promise[errors.length ? 'reject' : 'resolve'](errors)
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
          errors.push(new Error(window.gApp.$T('Valid.FileName')))
          break
        }
      }
      callback(errors)
    },
  }
}

function getValidUsersName(allable, maxValue) {
  return {
    validator(rule, value) {
      // eslint-disable-next-line no-useless-escape
      const Reg = /^[a-zA-Z0-9_,-\.]*$/
      const errors = []
      if (!allable) {
        if (value === '') {
          errors.push(new Error(window.gApp.$T('Multi.User.Required')))
        } else if (!value.match(Reg)) {
          errors.push(new Error(window.gApp.$T('Multi.User.FormatError')))
        } else if (value.split(',').length > maxValue) {
          errors.push(new Error(window.gApp.$T('Multi.User.tooLong', { value: maxValue })))
        }
      }
      return Promise[errors.length ? 'reject' : 'resolve'](errors)
    },
    trigger: 'change',
  }
}

function getValidMultiSelect(allable) {
  return {
    validator(rule, value) {
      const errors = []
      if (!allable && value.length === 0) {
        errors.push(new Error(window.gApp.$T('Multi.User.Required')))
      }
      return Promise[errors.length ? 'reject' : 'resolve'](errors)
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
        errors.push(
          new Error(
            window.gApp.$T('Admin.Runtime.Env.Value.Valid', {
              name: itemLabel,
            }),
          ),
        )
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
    async validator(rule, value) {
      if (!required && !value) {
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
        return Promise.resolve()
      } else {
        return Promise.reject(new Error(window.gApp.$T('MultNode.Error.Format')))
      }
    },
  }
}

function getPasswordRoleByText() {
  const pattern = /(^\s|\s$)/
  return {
    validator(rule, value) {
      if (pattern.test(value)) {
        return Promise.reject(new Error(window.gApp.$T('Password.Invalid.Space')))
      }

      return Promise.resolve()
    },
  }
}

function getUsernameRoleByText(itemLabel) {
  const pattern = /\s/
  return {
    validator(rule, value) {
      if (pattern.test(value)) {
        return Promise.reject(
          new Error(
            window.gApp.$T('CloudTools.Username.Verification', {
              name: itemLabel,
            }),
          ),
        )
      }

      return Promise.resolve()
    },
  }
}

function getVaildPositiveInteger(itemLabel) {
  const pattern = /^[0-9]*[1-9][0-9]*$/
  return {
    validator(rule, value, callback) {
      if (!pattern.test(value)) {
        return Promise.reject(new Error(window.gApp.$T('Valid.Positive.Integer', { name: itemLabel })))
      }

      return Promise.resolve()
    },
  }
}

function getValidRuntimeTime(itemLabel) {
  return {
    type: 'pattern',
    // pattern that matches <min> or <min>:<sec> or <hr>:<min>:<sec> or <days>-<hr>:<min>:<sec> or <days>-<hr>
    pattern:
      /^((\d+)-)?(\d{1,2}):(\d{1,2}):(\d{1,2})$|^((\d+)-)?(\d{1,2})$|^(\d{1,2}):(\d{1,2}):(\d{1,2})$|^(\d{1,2}):(\d{1,2})$|^(\d+)$/,
    message: window.gApp.$T('Valid.Runtime.Text', { name: itemLabel }),
    trigger: 'blur',
  }
}

function getValidLimitationSetting(itemLabel) {
  // Checks if the value is between 1 and 999999
  return {
    type: 'pattern',
    pattern: /^[1-9][0-9]{0,5}$/,
    message: window.gApp.$T('Valid.Limitation.Text', { name: itemLabel }),
    trigger: 'blur',
  }
}

function checkNotBlank(item) {
  return {
    validator(rule, value) {
      if (value.trim() === '') {
        return Promise.reject(new Error(window.gApp.$T('Valid.Text.NotBlank', { name: item })))
      } else {
        return Promise.resolve()
      }
    },
    trigger: 'blur',
  }
}

function getVaildMustInteger(itemLabel) {
  return {
    type: 'pattern',
    pattern: /^0$|(^-?[1-9]\d*$)/,
    message: window.gApp.$T('Valid.Integer', { name: itemLabel }),
  }
}

function getValidIPAddress(itemLabel) {
  return {
    required: true,
    validator(rule, value) {
      const errors = []
      const temp = value.split('.')
      if (value && (temp.length !== 4 || !temp.every(e => e && !isNaN(e) && -1 < Number(e) && Number(e) < 256))) {
        errors.push(new Error(window.gApp.$T('Valid.Address.IPv4', { label: itemLabel })))
      }
      return Promise[errors.length ? 'reject' : 'resolve'](errors)
    },
    // trigger: 'blur',
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
  // getMobileRole,
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
  getValidRuntimeTime,
  getValidLimitationSetting,
  checkNotBlank,
  getVaildMustInteger,
  getValidIPAddress,
}
