export default function (h, { parent }) {
  return h('AInput', {
    style: {
      width: '42%',
    },
    attrs: {
      id: 'image-editor-scale-input',
    },
    props: {
      size: 'small',
      value: parseInt(parent.scaling * 100) + '%',
      disabled: parent.disabled,
    },
    on: {
      blur: parent.scaleInput,
      keyup: parent.scaleInputEnter,
    },
  })
}
