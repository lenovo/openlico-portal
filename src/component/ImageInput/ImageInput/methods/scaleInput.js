export default function (e) {
  const scale = parseInt(e.target.value)
  if (scale) {
    this.scaling = scale / 100
  } else {
    e.target.value = this.scaling * 100 + '%'
  }
}
