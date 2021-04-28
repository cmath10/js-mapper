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
  const fullPathNotExist = 'Path ' + fullPath + ' does not exist in the source'

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

  constructor (path: string) {
    super()
    this._path = path.split('.')
  }

  public extract (source: unknown): unknown {
    _guard(source, 'Path extracting not available for scalar types')

    return _extract(source as Record<string, unknown>, this._path, [])
  }
}
