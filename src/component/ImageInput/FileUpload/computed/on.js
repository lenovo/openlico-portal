export default function () {
  const { disabled } = this
  if (disabled) {
    return {}
  }
  const { onClick, onDragEnter, onDragLeave, onDragOver, onDrop } = this
  return {
    click: onClick,
    dragenter: onDragEnter,
    dragleave: onDragLeave,
    dragover: onDragOver,
    drop: onDrop,
  }
}
