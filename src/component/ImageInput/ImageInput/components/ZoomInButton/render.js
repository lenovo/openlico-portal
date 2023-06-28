export default function (h, { parent }) {
  return h('MyActionButton', {
    props: {
      text: parent.$t('Action.ZoomIn') || 'Zoom In',
      btnIcon: 'plus',
      style: {
        borderStartEndRadius: '4px',
        borderEndEndRadius: '4px',
      },
      disabled: parent.scaling >= parent.computedMaxScaling,
    },
    on: {
      click: parent.zoomIn,
    },
  })
}
