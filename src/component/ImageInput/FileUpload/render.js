export default function () {
  const { $scopedSlots, cancel, dragging, error, failed, file, loaded, loading, on, progress, result } = this
  return $scopedSlots.default({
    cancel,
    dragging,
    error,
    failed,
    file,
    loaded,
    loading,
    on,
    progress,
    result,
  })
}
