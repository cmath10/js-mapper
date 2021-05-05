const fail = (message: string): never => {
  throw new Error('[cmath10/js-mapper] ' + message)
}

const propertyExists = (object: Record<string, unknown>, property: string, message?: string): void => {
  if (!Object.prototype.hasOwnProperty.call(object, property)) {
    fail(message || 'Object has no property ' + property)
  }
}

export {
  fail,
  propertyExists,
}
