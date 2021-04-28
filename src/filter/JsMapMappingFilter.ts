import JsMapFilter from '@/filter/JsMapFilter'
import * as assert from '@/utils/assert'

export default class JsMapMappingFilter extends JsMapFilter {
  private readonly _type: string

  constructor (type: string) {
    super()
    this._type = type
  }

  filter (value: unknown): unknown {
    if (this._mapper !== undefined) {
      return this._mapper.map(this._type, value)
    }

    assert.fail('Mapper was not set for filter')
  }
}
