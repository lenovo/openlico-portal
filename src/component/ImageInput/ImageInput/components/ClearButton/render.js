export default function (h, { parent }) {
  return h('MyActionButton', {
    props: {
      icon: parent.clearIcon,
      iconStyle: parent.clearIconStyle,
      text: 'Clear',
    },
    on: {
      click: parent.clear,
    },
  })
}
