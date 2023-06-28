export default function (event) {
  event.preventDefault()
  const input = document.createElement('input')
  input.setAttribute('type', 'file')
  const { onChange } = this
  input.addEventListener('change', onChange)
  input.click()
}
