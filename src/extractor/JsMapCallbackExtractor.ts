import JsMapExtractor from './JsMapExtractor'

export type JsMapExtractCallback = (source: unknown) => unknown

export default class JsMapCallbackExtractor extends JsMapExtractor {
  private readonly _callback: JsMapExtractCallback

  constructor (callback: JsMapExtractCallback) {
    super()
    this._callback = callback
  }

  public extract (source: unknown): unknown {
    return this._callback(source)
  }
}
