import JsMapCallbackExtractor, { JsMapExtractCallback } from '@/extractor/JsMapCallbackExtractor'
import JsMapExtractor from '@/extractor/JsMapExtractor'
import JsMapPathExtractor from '@/extractor/JsMapPathExtractor'

import JsMapFilter from '@/filter/JsMapFilter'
import JsMapFilterChain from '@/filter/JsMapFilterChain'

import createFilter, { JsMapFilterArgument } from '@/filter/createFilter'
import { JsMapRecursive } from '@/type'

import JsMapInjector from '@/injector/JsMapInjector'

export default class JsMap {
  private _destination: () => unknown
  private readonly _extractors: Map<string, JsMapExtractor>
  private readonly _filters: Map<string, JsMapFilter>
  private readonly _injectors: Map<string, JsMapInjector>

  /**
   * @param {() => unknown} destination Defaults to () => ({})
   */
  constructor (destination: () => unknown = () => ({})) {
    this._destination = destination
    this._extractors = new Map<string, JsMapExtractor>()
    this._filters = new Map<string, JsMapFilter>()
    this._injectors = new Map<string, JsMapInjector>()
  }

  /**
   * @internal
   */
  public get extractors (): Map<string, JsMapExtractor> {
    return this._extractors
  }

  /**
   * @internal
   */
  public get filters (): Map<string, JsMapFilter> {
    return this._filters
  }

  /**
   * @internal
   */
  public get injectors (): Map<string, JsMapInjector> {
    return this._injectors
  }

  /**
   * Sets callback function will be used to create destination if it not set in mapper ::map method
   *
   * @param {() => unknown} destination
   */
  public destination (destination: () => unknown): JsMap {
    this._destination = destination
    return this
  }

  /**
   * Associate a member to another member given their property paths.
   *
   * @param {string} destinationMember
   * @param {string} sourceMember
   *
   * @return {this} Current instance of map
   */
  public route (destinationMember: string, sourceMember: string): JsMap {
    return this.forMember(destinationMember, new JsMapPathExtractor(sourceMember))
  }

  /**
   * Applies a field extractor policy to a member.
   *
   * @param {string} destinationMember
   * @param {Function | JsMapExtractor} extractor callback or JMapExtractor instance
   *
   * @return {this} Current instance of map
   */
  public forMember (destinationMember: string, extractor: JsMapExtractCallback | JsMapExtractor): JsMap {
    if (typeof extractor === 'function') {
      this._extractors.set(destinationMember, new JsMapCallbackExtractor(extractor))
    } else {
      this._extractors.set(destinationMember, extractor)
    }

    return this
  }

  /**
   * Applies a filter to the field.
   *
   * @param {string} destinationMember
   * @param {JsMapRecursive<JsMapFilterArgument>} filter Map name or callback or filter instance
   *
   * @return {this} Current instance of map
   */
  public filter (destinationMember: string, filter: JsMapRecursive<JsMapFilterArgument>): JsMap {
    if (Array.isArray(filter)) {
      this._filters.set(destinationMember, new JsMapFilterChain(filter))
    } else {
      this._filters.set(destinationMember, createFilter(filter))
    }

    return this
  }

  public inject (destinationMember: string, injector: JsMapInjector): JsMap {
    this._injectors.set(destinationMember, injector)
    return this
  }

  /**
   * Removes destination member
   *
   * @param {string} destinationMember
   *
   * @return {this} Current instance of map
   */
  public exclude (destinationMember: string): JsMap {
    [this._extractors, this._filters, this._injectors].forEach(map => {
      if (map.has(destinationMember)) {
        map.delete(destinationMember)
      }
    })

    return this
  }

  /**
   * Creates map copy, useful for inherited types
   *
   * @return {JsMap}
   */
  public clone (): JsMap {
    const map = new JsMap(this._destination)

    this._extractors.forEach((extractor, path) => {
      map.extractors.set(path, extractor)
    })

    this._filters.forEach((filter, path) => {
      map.filters.set(path, filter)
    })

    return map
  }

  /**
   * @internal
   */
  public createDestination (): unknown {
    return this._destination()
  }
}
