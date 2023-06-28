export default function (event) {
  event.preventDefault()
  const { files } = event.target
  if (files) {
    if (files.length) {
      this.load(files[0])
    }
  }
}
