import Flip from "./flip"
export default class SvgMaskBackground{
  constructor(val, blurSize = 0, isImage = false) {
    this.fill = val
    this.blurSize = blurSize
    this.isImage = isImage
  }
  render(target) {
  }
}
