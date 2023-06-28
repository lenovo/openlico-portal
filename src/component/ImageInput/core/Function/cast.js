import FunctionConstant from './constant'
import FunctionIsFunction from './isFunction'

export default function (value) {
  return FunctionIsFunction(value) ? value : FunctionConstant(value)
}
