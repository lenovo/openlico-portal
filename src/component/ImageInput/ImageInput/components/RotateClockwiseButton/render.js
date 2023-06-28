export default function (h, { parent }) {
  return h('MyActionButton', {
    props: {
      text: parent.$t('Action.RotateRight') || 'Rotate +90°',
      class: 'el-erp-rightrotation',
    },
    on: {
      click: parent.rotateClockwise,
    },
  })
}
