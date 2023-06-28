export default function (object, iteratee) {
  const result = {}
  Object.entries(object).forEach(([key, value]) => {
    result[key] = iteratee(value, key, object)
  })
  return result
}
