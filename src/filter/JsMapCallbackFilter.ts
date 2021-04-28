import JsMapFilter from './JsMapFilter'

export type JsMapFilterCallback = (value: unknown) => unknown

export default class JsMapCallbackFilter extends JsMapFilter {
  private readonly _callback: JsMapFilterCallback

  constructor (callback: JsMapFilterCallback) {
    super()
    this._callback = callback
  }

  filter (value: unknown): unknown {
    return this._callback(value)
  }
}
