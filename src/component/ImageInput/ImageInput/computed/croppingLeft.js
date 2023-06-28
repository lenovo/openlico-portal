import MathClamp from '../../core/Math/clamp'

export default {
  get() {
    return Math.round(
      MathClamp(
        this.scaledRotatedInternalImageWidthDifference * this.dirtyOriginLeft,
        this.computedMinCroppingLeft,
        this.computedMaxCroppingLeft,
      ),
    )
  },

  set(value) {
    const { scaledRotatedInternalImageWidthDifference } = this
    this.dirtyOriginLeft = scaledRotatedInternalImageWidthDifference
      ? value / scaledRotatedInternalImageWidthDifference
      : 1 / 2
  },
}
