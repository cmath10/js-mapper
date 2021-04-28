import * as assert from '@/utils/assert'

const _guard = (source: unknown, message: string): void|never => {
  if (typeof source !== 'object' || source === null) {
    return assert.fail(message)
  }
}

const _inject = (destination: Record<string, unknown>, path: string, value: unknown): void => {
  if (typeof destination[path] === 'function') {
    const fn = destination[path] as (value: unknown) => void

    fn.call(destination, value)
  } else {
    destination[path] = value
  }
}

export default class JsMapInjector {
  public inject(destination: unknown, path: string, value: unknown): void {
    _guard(destination, 'Scalar destinations not supported by default injector')
    _inject(destination as Record<string, unknown>, path, value)
  }
}
