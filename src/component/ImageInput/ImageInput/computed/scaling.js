import MathClamp from '../../core/Math/clamp'

export default {
  get() {
    return MathClamp(this.dirtyScaling, this.computedMinScaling, this.computedMaxScaling)
  },

  set(value) {
    this.dirtyScaling = value
  },
}
