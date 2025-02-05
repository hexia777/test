import Flip from "./flip"
export default class AI {
  constructor(currImage, transId, prevImage, job) {
    this.prevImage = prevImage
    this.currImage = currImage
    this.transId = transId
    this.job = job
    this.snapshot = null
  }
  render(target) {
    if (this.job === 'pd_matting' || this.job === 'matting') {
      this.snapshot = target.canvas.ctx.getImageData(0, 0, target.canvas.canvas.width, target.canvas.canvas.height)
    }
    target.loadImage(this.currImage, target.canvas.imageType, true)
    const flip = target._getStepByType('flip')
    const crop = target._getStepByType('crop')
    target._flipCanvas(flip, crop)
    target.canvas.removeWatermarkDrawImage()
    target.setWatermark()
    if (this.job === 'pd_matting' || this.job === 'matting') {
      target.canvas.svgMask.oImage = this.prevImage
      target.canvas.svgMask.oSnapshot = this.snapshot
    }
  }
}
