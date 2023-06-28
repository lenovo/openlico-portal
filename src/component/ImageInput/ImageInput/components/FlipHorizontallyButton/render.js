export default function (h, { parent }) {
  const SVG = {
    template: `<svg t="1636081778539" class="icon" viewBox="0 0 1170 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6352" width="200" height="200">
<path d="M356.95 0h69.717A85.333 85.333 0 0 1 512 85.333v853.334A85.333 85.333 0 0 1 426.667 1024H117.504a85.333 85.333 0 0 1-81.152-111.787l5.12-15.616 95.061-335.018 70.742-226.56L274.09 64.853A85.333 85.333 0 0 1 356.864 0z" fill="#EEEEEE" p-id="6353"></path>
<path d="M752.384 0h-69.717a85.333 85.333 0 0 0-85.334 85.333v853.334A85.333 85.333 0 0 0 682.667 1024h309.162a85.333 85.333 0 0 0 81.152-111.787l-5.12-15.616L972.8 561.58l-70.741-226.56-66.816-270.166A85.333 85.333 0 0 0 752.469 0z" fill="#666666" p-id="6354"></path>
</svg>`,
  }
  return h('MyActionButton', {
    props: {
      text: parent.$t('Action.FlipHorizontal') || 'Flip Horizontal',
      // class: 'el-erp-Horizontalmirror',
      icon: SVG,
      style: {
        fontSize: '17px',
        marginTop: '6px',
      },
    },
    on: {
      click: parent.flipHorizontally,
    },
  })
}
