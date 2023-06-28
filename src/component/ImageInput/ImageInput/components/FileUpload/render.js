import FileUpload from '../../../FileUpload'

export default function (h, { data, listeners, parent }) {
  const { load } = listeners
  const { style } = data
  return h(FileUpload, {
    style,
    scopedSlots: {
      default: ({ dragging, failed, file, loaded, loading, on, progress }) => {
        return h('img', {
          attrs: {
            src: 'static/img/system/template/Add.png',
            width: '80px',
            height: '80px',
          },
          on,
        })
      },
    },
    on: {
      load,
    },
  })
}
