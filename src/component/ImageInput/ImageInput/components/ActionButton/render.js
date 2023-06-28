export default function (h, { listeners, parent, props }) {
  return h(
    'ATooltip',
    {
      props: {
        title: h(
          'span',
          {
            style: {
              whiteSpace: 'nowrap',
            },
          },
          props.text,
        ),
      },
    },
    [
      props.btnIcon
        ? h(
            'AButton',
            {
              style: {
                width: '28%',
                ...(props.style || {}),
                cursor: props.disabled || parent.disabled ? 'no-drop' : 'pointer',
              },
              props: {
                disabled: parent.disabled,
                size: 'small',
              },
              on: listeners,
            },
            [h('AIcon', { props: { type: props.btnIcon } })],
          )
        : h(props.icon ? 'AIcon' : 'i', {
            props: {
              disabled: parent.disabled,
              component: props.icon || '',
            },
            class: props.class || '',
            on: listeners,
            style: {
              margin: '2px 8px',
              cursor: 'pointer',
              ...(props.style || {}),
            },
          }),
    ],
  )
}
