export default function (h, { parent }) {
  return h('MyActionButton', {
    props: {
      text: parent.$t('Action.ZoomOut') || 'Zoom Out',
      btnIcon: 'minus',
      disabled: parent.scaling <= parent.computedMinScaling,
    },
    on: {
      click: parent.zoomOut,
    },
  })
}
