import JsMapCallbackFilter, { JsMapFilterCallback } from '@/filter/JsMapCallbackFilter'
import JsMapFilter from '@/filter/JsMapFilter'
import JsMapMappingFilter from '@/filter/JsMapMappingFilter'

export type JsMapFilterArgument = string | JsMapFilterCallback | JsMapFilter

export default (filter: JsMapFilterArgument): JsMapFilter => {
  if (typeof filter === 'string') {
    return new JsMapMappingFilter(filter)
  }

  if (typeof filter === 'function') {
    return new JsMapCallbackFilter(filter)
  }

  return filter
}
