import { isCanvas } from '../utils'
export default class Crop {
  constructor(x, y, w, h, image) {
    //dom定位
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.currentImage = image
    // this.imgData = imgData
  }
  async render(target) {
    if (isCanvas(target)) {
      console.log('crop')
      const canvas = document.createElement('canvas')
      canvas.style.position = 'absolute'
      canvas.style.top = 0
      canvas.style.left = 0
      // canvas.style.transform = 'scale(0.3)'
      // canvas.style.transformOrigin = '0 0'
      // target.frame.parentNode.appendChild(canvas)
      let width = Number(target.view.getAttribute('data-width')) * target.lastScale
      let height = Number(target.view.getAttribute('data-height')) * target.lastScale
      const r = target.canvas.width / width
      width = width * r
      height = height * r
      const canvasDeg = target.canvasDeg % 360
      const ctx = canvas.getContext('2d')
      canvas.width = width
      canvas.height = height
      if (canvasDeg !== 0 && canvasDeg % 180 !== 0) {
        // canvas.width = target.image.height
        // canvas.height = target.image.width
        canvas.width = height
        canvas.height = width
        if (canvasDeg > 0) {
          if (canvasDeg > 180) {
            ctx.translate(0, width)
          } else {
            ctx.translate(height, 0)
          }
        } else {
          if (Math.abs(canvasDeg) > 180) {
            ctx.translate(height, 0)
          } else {
            ctx.translate(0, width)
          }
        }
      } else if (canvasDeg !== 0 && canvasDeg % 360 !== 0) {
        ctx.translate(width, height)
      }
      // ctx.drawImage(this.currentImage, 0, 0, width, height)
      ctx.rotate(canvasDeg * Math.PI / 180);
      // ctx.drawImage(this.currentImage, 0, 0, width, height)
      const size = target.calculateCanvasWidthAndHeightOfRotate(target.deg, width, height)
      const scale = size.width / width
      ctx.scale(scale, scale)
      // ctx.drawImage(this.currentImage, 0, 0, width, height)
      ctx.translate(size.x / scale, size.y / scale)
      // ctx.drawImage(this.currentImage, 0, 0, width, height)
      ctx.rotate(target.deg * Math.PI / 180);
      ctx.drawImage(this.currentImage, 0, 0, width, height)
      const imgData = ctx.getImageData( this.x, this.y, this.w, this.h)
      // ctx.beginPath();
      // ctx.lineWidth = "6";
      // ctx.strokeStyle = "red";
      // ctx.rect(x, y, w, h)
      // ctx.stroke();
      // console.log(this.x + this.w, this.y + this.h)
      // ctx.putImageData(imgData, 0, 0)
      await target.setImage(imgData)
      target.rotateScale = 1
      target.resetCanvasSize(this.w, this.h)
      target.removeWatermarkDrawImage()
      target.resetCanvasDeg()
      target.setOrigin()
      target.setWatermark()
      // target.frame.parentNode.removeChild(canvas)

    }
  }
}
