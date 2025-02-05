import { isCanvas, setTransform, SIN, COS, matrix } from '../utils'
export default class Rotate {
  constructor(deg, accumulative) {
    this.deg = deg
    this.accumulative = accumulative
  }
  render(target) {
    if (isCanvas(target)) {
      target.deg = this.deg
      const scaleOfRotate = target.getScaleOfRotate() * target.lastScale
      // if (crop) {
      //   matrix(target.container, 0, 1, 1)
      //   matrix(target.shapesElement, deg, scaleOfRotate, scaleOfRotate)
      //   matrix(target.upperCanvas, deg, scaleOfRotate, scaleOfRotate)
      // } else {
        matrix(target.container, target.deg, scaleOfRotate, scaleOfRotate)
      // }
    } else {
      target.style = setTransform(target.style.transform, 'rotate', this.deg)
    }
  }
}
