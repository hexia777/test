import { isCanvas, setTransform, SIN, COS, matrix } from '../utils'
export default class ResetCanvas {
  constructor() {
    this.deg = 0
  }
  render(target) {
    if (isCanvas(target)) {
      target.deg = this.deg
      target.canvasDeg = this.deg
      matrix(target.frame, this.deg)
    }
  }
}
