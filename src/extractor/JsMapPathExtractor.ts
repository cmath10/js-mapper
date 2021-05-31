import JsMapExtractor from './JsMapExtractor'
import * as assert from '@/utils/assert'

const _guard = (source: unknown, message: string): void|never => {
  if (typeof source !== 'object' || source === null) {
    return assert.fail(message)
  }
}

const _extract = (source: Record<string, unknown>, path: string[], prev: string[]): unknown => {
  if (path.length === 0) {
    return source
  }

  const fullPath = [...prev, ...path].join('.')
  const fullPathNotExist = 'Path ' + fullPath + ' is not reachable in the source'

  assert.propertyExists(source, path[0], fullPathNotExist)

  const value = (source as Record<string, unknown>)[path[0]]

  if (path.length === 1) {
    return value
  }

  _guard(value, fullPathNotExist)

  return _extract(value as Record<string, unknown>, path.slice(1), [...prev, path[0]])
}

export default class JsMapPathExtractor extends JsMapExtractor {
  private readonly _path: string[]
  private readonly _fallback: unknown

  constructor (path: string, fallback: unknown = undefined) {
    super()
    this._path = path.split('.')
    this._fallback = fallback
  }

  public extract (source: unknown): unknown {
    try {
      _guard(source, 'Path extracting not available for scalar types')

      return _extract(source as Record<string, unknown>, this._path, [])
    } catch (error) {
      if (this._fallback !== undefined) {
        return typeof this._fallback === 'function' ? this._fallback() : this._fallback
      }

      throw error
    }
  }
}
