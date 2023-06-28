export default function (e) {
  if (e.code === 'Enter' || e.keyCode === 13) {
    // const input = document.getElementById('image-editor-scale-input')

    this.scaleInput(e)
  }
}
