export default class Action {
  constructor() {}
  static NONE = Symbol('none')
  static CROP = Symbol('crop')
  static SHAPE = Symbol('shape')
  static TEXT = Symbol('text')
  static MASK_BRUSH = Symbol('maskBrush')
  static BRUSH = Symbol('brush')
}
