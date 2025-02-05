import { isCanvas } from '../utils'
export default class Flip {
  constructor(flip) {
    this.flip = flip
  }
  render(target) {
    if (isCanvas(target)) {
      console.log('flip')
      if (this.flip === 'x') {
        target.ctx.translate(target.canvas.width, 0)
        target.ctx.scale(-1, 1)
      } else {
        target.ctx.translate(0, target.canvas.height)
        target.ctx.scale(1, -1)
      }
    }else {
      if (this.flip === 'x') {
        target.translate(target.canvas.width, 0)
        target.scale(-1, 1)
      } else {
        target.translate(0, target.canvas.height)
        target.scale(1, -1)
      }
    }
    target.removeWatermarkDrawImage()
    target.setWatermark()
  }
}
