import { imageToBase64, matrix } from '../utils'
import Canvas from '../canvas'
export default class MaskBackground {
  constructor(val, blurSize = 0, isImage = false) {
    this.fill = val
    this.blurSize = blurSize
    this.isImage = isImage
  }
  render(canvas) {
    console.log('render')
    canvas.svgMask.gcc.innerHTML = ''
    this._generateFilter(canvas)
    this._generateBgForGcc(canvas)
  }
  _generateBgForGcc(canvas) {
    if (this.isImage) {
      const w = canvas.svgMask.svg.width.baseVal.value
      const h = canvas.svgMask.svg.height.baseVal.value
      const bgw = this.fill.width
      const bgh = this.fill.height
      let r
      if (w > h) {
        r = w / bgw + 0.1
      } else {
        r = h / bgh + 0.1
      }
      const imageDatabase = imageToBase64(this.fill, 'png')
      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
      image.setAttribute('width', this.fill.width)
      image.setAttribute('height', this.fill.height)
      matrix(image, 0, r, r, -1 * (bgw * r - w) / 2, -1 * (bgh * r - h) / 2)
      image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imageDatabase)
      image.setAttribute('filter', `url("#filter001")`)
      canvas.svgMask.gcc.appendChild(image)
    } else {
      if (this.fill && this.fill !== 'transparent') {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('width', canvas.image.width)
        rect.setAttribute('height', canvas.image.height)
        rect.setAttribute('fill', this.fill)
        canvas.svgMask.gcc.appendChild(rect)

      }
    }
  }
  _generateFilter(canvas) {
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur')
    const id = ('' + canvas.svgMask.filter.children.length + 1).padStart('0')
    feGaussianBlur.setAttribute('id', 'blur' + id)
    feGaussianBlur.setAttribute('result', 'blur' + id)
    feGaussianBlur.setAttribute('in', 'SourceGraphic')
    feGaussianBlur.setAttribute('stdDeviation', `${this.blurSize / 5} ${this.blurSize / 5}`)
    canvas.svgMask.filter.appendChild(feGaussianBlur)
  }
}
