import JsMapCallbackExtractor, { JsMapExtractCallback } from '@/extractor/JsMapCallbackExtractor'
import JsMapExtractor from '@/extractor/JsMapExtractor'
import JsMapPathExtractor from '@/extractor/JsMapPathExtractor'

import JsMapFilter from '@/filter/JsMapFilter'
import JsMapFilterChain from '@/filter/JsMapFilterChain'

import createFilter, { JsMapFilterArgument } from '@/filter/createFilter'
import { JsMapRecursive } from '@/type'

import JsMapInjector from '@/injector/JsMapInjector'

export default class JsMap<D = Record<string, unknown>> {
  private _destination: () => D
  private readonly _extractors: Map<keyof D | string, JsMapExtractor>
  private readonly _filters: Map<keyof D | string, JsMapFilter>
  private readonly _injectors: Map<keyof D | string, JsMapInjector>

  /**
   * @param {() => unknown} destination Defaults to () => ({})
   */
  constructor (destination: () => D = () => ({} as D)) {
    this._destination = destination
    this._extractors = new Map<keyof D | string, JsMapExtractor>()
    this._filters = new Map<keyof D | string, JsMapFilter>()
    this._injectors = new Map<keyof D | string, JsMapInjector>()
  }

  /**
   * @internal
   */
  public get extractors (): Map<keyof D | string, JsMapExtractor> {
    return this._extractors
  }

  /**
   * @internal
   */
  public get filters (): Map<keyof D | string, JsMapFilter> {
    return this._filters
  }

  /**
   * @internal
   */
  public get injectors (): Map<keyof D | string, JsMapInjector> {
    return this._injectors
  }

  /**
   * Sets callback function will be used to create destination if it not set in mapper ::map method
   *
   * @param {() => unknown} destination
   */
  public destination (destination: () => D): JsMap<D> {
    this._destination = destination
    return this
  }

  /**
   * Associate a member to another member given their property paths.
   *
   * @param {string} destinationMember
   * @param {string} sourceMember
   * @param fallback
   *
   * @return {this} Current instance of map
   */
  public route (
    destinationMember: keyof D | string,
    sourceMember: string,
    fallback: unknown = undefined
  ): JsMap<D> {
    return this.forMember(
      destinationMember,
      new JsMapPathExtractor(sourceMember, fallback)
    )
  }

  /**
   * Applies a field extractor policy to a member.
   *
   * @param {string} destinationMember
   * @param {Function | JsMapExtractor} extractor callback or JMapExtractor instance
   *
   * @return {this} Current instance of map
   */
  public forMember (
    destinationMember: keyof D | string,
    extractor: JsMapExtractCallback | JsMapExtractor
  ): JsMap<D> {
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
  public filter (
    destinationMember: keyof D | string,
    filter: JsMapRecursive<JsMapFilterArgument>
  ): JsMap<D> {
    if (Array.isArray(filter)) {
      this._filters.set(destinationMember, new JsMapFilterChain(filter))
    } else {
      this._filters.set(destinationMember, createFilter(filter))
    }

    return this
  }

  public inject (destinationMember: keyof D | string, injector: JsMapInjector): JsMap<D> {
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
  public exclude (destinationMember: keyof D | string): JsMap<D> {
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
  public clone (): JsMap<D> {
    const map = new JsMap(this._destination)

    this._extractors.forEach((extractor, path) => {
      map.extractors.set(path, extractor)
    })

    this._filters.forEach((filter, path) => {
      map.filters.set(path, filter)
    })

    return map
  }

  public extend<E extends D>(): JsMap<E> {
    return this.clone() as unknown as JsMap<E>
  }

  /**
   * @internal
   */
  public createDestination (): D {
    return this._destination()
  }
}
