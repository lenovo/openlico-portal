import MathClamp from '../../core/Math/clamp'

export default {
  get() {
    return Math.round(
      MathClamp(
        this.scaledRotatedInternalImageHeightDifference * this.dirtyOriginTop,
        this.computedMinCroppingTop,
        this.computedMaxCroppingTop,
      ),
    )
  },

  set(value) {
    const { scaledRotatedInternalImageHeightDifference } = this
    this.dirtyOriginTop = scaledRotatedInternalImageHeightDifference
      ? value / scaledRotatedInternalImageHeightDifference
      : 1 / 2
  },
}
