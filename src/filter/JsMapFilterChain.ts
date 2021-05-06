import JsMapFilter from '@/filter/JsMapFilter'
import createFilter, { JsMapFilterArgument } from '@/filter/createFilter'
import { JsMapRecursive } from '@/type'

export default class JsMapFilterChain extends JsMapFilter {
  private _filters: JsMapFilter[] = []

  constructor (filters: JsMapRecursive<JsMapFilterArgument>[]) {
    super()
    this._filters = filters.map(f => Array.isArray(f) ? new JsMapFilterChain(f) : createFilter(f))
  }

  filter (value: unknown): unknown {
    this._filters.forEach(filter => {
      if (this._mapper !== undefined) {
        filter.mapper = this._mapper
      }

      value = filter.filter(value)
    })

    return value
  }
}
