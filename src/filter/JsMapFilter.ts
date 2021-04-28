import JsMapper from '@/JsMapper'

export default class JsMapFilter {
  protected _mapper: JsMapper | undefined

  set mapper (mapper: JsMapper) {
    this._mapper = mapper
  }

  filter (value: unknown): unknown {
    return value
  }
}
