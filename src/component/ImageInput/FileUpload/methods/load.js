import FunctionNoop from '../../core/Function/noop'
import PromiseTry from '../../core/Promise/try'

export default function (file) {
  PromiseTry(() => {
    this.cancel()
    const reader = new FileReader()
    const promise = new Promise((resolve, reject) => {
      reader.addEventListener('progress', event => {
        const { loaded } = event
        this.progress = loaded
        this.$emit('progress', {
          file,
          loaded,
        })
      })
      reader.addEventListener('load', () => {
        const { result } = reader
        Object.assign(this, {
          loaded: true,
          result,
        })
        this.$emit('load', {
          file,
          result,
        })
        resolve()
      })
      reader.addEventListener('abort', () => {
        this.$emit('cancel', { file })
        resolve()
      })
      reader.addEventListener('error', reject)
    })
    const cancel = () => {
      if (reader.readyState === 1) {
        reader.abort()
      }
    }
    reader.readAsDataURL(file)
    Object.assign(this, {
      cancel,
      error: null,
      failed: false,
      file,
      loaded: false,
      loading: true,
      progress: 0,
      result: null,
    })
    return promise
  })
    .catch(error => {
      Object.assign(this, {
        error,
        failed: true,
      })
      this.$emit('error', {
        error,
        file,
      })
    })
    .finally(() => {
      Object.assign(this, {
        cancel: FunctionNoop,
        loading: false,
      })
    })
}
