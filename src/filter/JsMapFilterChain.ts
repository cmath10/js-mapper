import JsMapFilter from '@/filter/JsMapFilter'

export default class JsMapFilterChain extends JsMapFilter {
  private _filters: JsMapFilter[] = []

  constructor (filters: JsMapFilter[]) {
    super()
    this._filters = filters
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
