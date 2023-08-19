type Maybe<D> = D extends undefined ? unknown : D

export class JsMapExtractor {
  extract (source: unknown): unknown;
}

export class JsMapCallbackExtractor extends JsMapExtractor {
  private readonly _callback;

  constructor (callback: (source: unknown) => unknown);

  extract (source: unknown): unknown;
}

export class JsMapPathExtractor extends JsMapExtractor {
  private readonly _path;

  private readonly _fallback;

  constructor (path: string, fallback?: unknown);

  extract (source: unknown): unknown;
}

export class JsMapInjector {
  inject (destination: unknown, path: string, value: unknown): void;
}

export class JsMapFilter {
  protected _mapper: JsMapper | undefined;

  set mapper (mapper: JsMapper);

  filter (value: unknown): unknown;
}

export class JsMapCallbackFilter extends JsMapFilter {
  private readonly _callback;

  constructor (callback: (value: unknown) => unknown);

  filter (value: unknown): unknown;
}

export class JsMapMappingFilter extends JsMapFilter {
  private readonly _type;

  constructor (type: string);

  filter (value: unknown): unknown;
}

declare type JsMapRecursive<T> = T | JsMapRecursive<T>[];
declare type JsMapFilterArgument = string | ((value: unknown) => unknown) | JsMapFilter

export class JsMapFilterChain extends JsMapFilter {
  private _filters;

  constructor (filters: JsMapRecursive<JsMapFilterArgument>[]);

  filter (value: unknown): unknown;
}

export class JsMap<D = Record<string, unknown>> {
  private _destination: () => D;
  private readonly _extractors: Map<string, JsMapExtractor>;
  private readonly _filters: Map<string, JsMapFilter>;
  private readonly _injectors: Map<string, JsMapInjector>;

  /**
   * @param {() => unknown} destination Defaults to () => ({})
   */
  constructor (destination?: () => D);

  /**
   * @internal
   */
  get extractors (): Map<string, JsMapExtractor>;

  /**
   * @internal
   */
  get filters (): Map<string, JsMapFilter>;

  /**
   * @internal
   */
  get injectors (): Map<string, JsMapInjector>;

  /**
   * Sets callback function will be used to create destination if it not set in mapper ::map method
   *
   * @param {() => unknown} destination
   */
  destination (destination: () => D): JsMap<D>;

  /**
   * Associate a member to another member given their property paths.
   *
   * @param {string} destinationMember
   * @param {string} sourceMember
   * @param fallback
   *
   * @return {this} Current instance of map
   */
  route (destinationMember: string, sourceMember: string, fallback?: unknown): JsMap;

  /**
   * Applies a field extractor policy to a member.
   *
   * @param {string} destinationMember
   * @param {Function | JsMapExtractor} extractor callback or JMapExtractor instance
   *
   * @return {this} Current instance of map
   */
  forMember (destinationMember: string, extractor: (source: unknown) => unknown | JsMapExtractor): JsMap;

  /**
   * Applies a filter to the field.
   *
   * @param {string} destinationMember
   * @param {JsMapRecursive<JsMapFilterArgument>} filter Map name or callback or filter instance
   *
   * @return {this} Current instance of map
   */
  filter(destinationMember: string, filter: JsMapRecursive<JsMapFilterArgument>): JsMap<D>;

  inject(destinationMember: string, injector: JsMapInjector): JsMap<D>;

  /**
   * Removes destination member
   */
  exclude(destinationMember: string): JsMap<D>;

  /**
   * Creates map copy, useful for inherited types
   */
  clone(): JsMap<D>;

  /**
   * @internal
   */
  createDestination(): D;
}

export default class JsMapper {
  private _maps: Map<string, JsMap<unknown>>;

  constructor ();

  get (type: string, clone?: boolean): JsMap<unknown>;

  set (type: string, map: JsMap): JsMapper;

  unset (type: string): JsMapper;

  map<DestinationType = unknown, SourceType = unknown> (
    typeOrMap: string | JsMap<DestinationType>,
    source: SourceType,
    destination?: DestinationType
  ): Maybe<DestinationType>;
}
