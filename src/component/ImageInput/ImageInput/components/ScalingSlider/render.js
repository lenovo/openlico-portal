export default function (h, { parent }) {
  const { computedMaxScaling, computedMinScaling, disabled, scaleTo, scaling } = parent
  return h('ASlider', {
    style: 'margin: 4px',
    props: {
      disabled,
      max: computedMaxScaling,
      min: computedMinScaling,
      step: 1 / 1000,
      defaultValue: scaling,
    },
    on: {
      change: scaleTo,
    },
  })
}
