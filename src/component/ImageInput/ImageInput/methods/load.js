export default function (data) {
  if (this.imageData !== data) {
    const image = new Image()
    image.addEventListener('load', () => {
      const width = image.naturalWidth
      const height = image.naturalHeight
      this.internalImageData = width && height ? data : null
      this.internalImageWidth = width
      this.internalImageHeight = height
      this.flippedHorizontally = false
      this.flippedVertically = false
      this.rotated = false
      this.scaling = 0
      this.dirtyOriginLeft = 1 / 2
      this.dirtyOriginTop = 1 / 2
    })
    image.src = data
  }
}
