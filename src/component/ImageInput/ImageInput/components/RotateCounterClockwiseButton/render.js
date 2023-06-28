export default function (h, { parent }) {
  return h('MyActionButton', {
    props: {
      text: parent.$t('Action.RotateLeft') || 'Rotate -90°',
      class: 'el-erp-Leftrotation',
    },
    on: {
      click: parent.rotateCounterClockwise,
    },
  })
}
