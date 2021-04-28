import JsMap from '@/JsMap'
import JsMapFilter from '@/filter/JsMapFilter'
import JsMapInjector from '@/injector/JsMapInjector'

import * as assert from '@/utils/assert'

const defaultFilter = new JsMapFilter()
const defaultInjector = new JsMapInjector()

const _isArrayType = (type: string): boolean => {
  return type.length > 2 && type[0] === '[' && type[type.length - 1] === ']'
}

const _map = (mapper: JsMapper, map: JsMap, source: unknown, destination?: unknown): unknown => {
  const dst = destination !== undefined ? destination : map.createDestination()

  map.extractors.forEach((extractor, path) => {
    const injector = map.injectors.get(path) || defaultInjector
    const filter = map.filters.get(path) || defaultFilter

    filter.mapper = mapper

    const value = filter.filter(extractor.extract(source))

    injector.inject(dst, path, value)
  })

  return dst
}

const _mapArray = (mapper: JsMapper, type: string, source: unknown): unknown[] => {
  const map = mapper.get(type.substr(1, type.length - 2))

  if (Array.isArray(source)) {
    return source.map(s => _map(mapper, map, s, undefined))
  }

  return assert.fail('For array maps source must be an array')
}

export default class JsMapper {
  private _maps: Map<string, JsMap>

  constructor () {
    this._maps = new Map<string, JsMap>()
  }

  public get (type: string, clone = true): JsMap {
    if (!this._maps.has(type)) {
      assert.fail('No map for type: ' + type)
    }

    const map = this._maps.get(type) as JsMap

    return clone ? map.clone() : map
  }

  public set (type: string, map: JsMap): JsMapper {
    this._maps.set(type, map)
    return this
  }

  public unset (type: string): JsMapper {
    if (this._maps.has(type)) {
      this._maps.delete(type)
    }
    return this
  }

  public map (typeOrMap: string|JsMap, source: unknown, destination?: unknown): unknown {
    if (typeof typeOrMap === 'string' && _isArrayType(typeOrMap)) {
      return _mapArray(this, typeOrMap, source)
    }

    const map = typeOrMap instanceof JsMap ? typeOrMap : this.get(typeOrMap, false)

    return _map(this, map, source, destination)
  }
}
