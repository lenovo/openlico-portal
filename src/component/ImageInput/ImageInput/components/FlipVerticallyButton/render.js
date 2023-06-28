export default function (h, { parent }) {
  const SVG = {
    template: `<svg t="1636081735017" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6209" width="200" height="200">
<path d="M950.857 342.528v59.758a73.143 73.143 0 0 1-73.143 73.143H146.286a73.143 73.143 0 0 1-73.143-73.143V137.289A73.143 73.143 0 0 1 168.96 67.73l13.385 4.389L469.577 153.6l194.194 60.635 231.57 57.271a73.143 73.143 0 0 1 55.59 70.949z" fill="#EEEEEE" p-id="6210"></path>
<path d="M950.857 681.472v-59.758a73.143 73.143 0 0 0-73.143-73.143H146.286a73.143 73.143 0 0 0-73.143 73.143v264.997a73.143 73.143 0 0 0 95.817 69.559l13.385-4.389L469.577 870.4l194.194-60.635 231.57-57.271a73.143 73.143 0 0 0 55.59-70.949z" fill="#666666" p-id="6211"></path>
</svg>`,
  }
  return h('MyActionButton', {
    props: {
      text: parent.$t('Action.FlipVertical') || 'Flip Vertical',
      // class: 'el-erp-mirrorvertically',
      icon: SVG,
      style: {
        fontSize: '17px',
        marginTop: '6px',
      },
    },
    on: {
      click: parent.flipVertically,
    },
  })
}
