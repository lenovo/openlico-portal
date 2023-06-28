export default function (event) {
  event.preventDefault()
  this.dragging = false
  const { files } = event.dataTransfer
  if (files) {
    if (files.length) {
      this.load(files[0])
    }
  }
}
