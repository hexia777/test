import Step from './step'
import Background from './operate/background'
import Filter from './operate/filter'
import Rotate from './operate/rotate'
import MaskBrush from './operate/maskBrush'
import RotateCanvas from './operate/rotateCanvas'
import MaskBackground from './operate/maskBackground'
import Crop from './operate/crop'
import Flip from './operate/flip'
import Brush from './operate/brush'
import ResetRotate from './operate/resetRotate'
import AI from './operate/ai'
import Shape from './operate/shape'
import Text from './operate/text'
import Action from './action'
import Canvas from './canvas'
import { canvasToImage } from './utils'

export default class ImageEditor {
  constructor(target, options = {}) {
    this.target = target
    this.options = options
    this.historys = []
    this.index = -1
    this.canvas = new Canvas(this, target, options)
    this.imageChanged = false
    this.renders = []
    // this.setRenderIntervalte()
    this.callbacks = []
  }

  add(operate, target = this.canvas) {
    if (!operate) {
      return
    }
    const step = new Step({ operate, target })
    const lastSetp = this._getLastStep()
    step.setPrev(lastSetp)
    this.historys.push(step)
    if (this.index !== -1) {
      lastSetp.next = step
    }
    this.index = this.historys.length - 1
    step.setIndex(this.index)
    operate.index = step.index

    // this.render()
    this.imageChanged = true
    return this.singleStepRender(operate, target)
  }
  singleStepRender(operate, target) {
    return new Promise(async (resolve, reject) => {
      if (operate instanceof Crop) {
        await operate.render(target)
      } else if (operate instanceof Background) {
        operate.render(target)
        this.canvas._drawImg()
      } else {
        operate.render(target)
      }
      resolve()
    })
  }
  setOptions(options) {
    this.canvas.setOptions(options)
  }
  undo() {
    if (this.index === -1) {
      return false
    }
    const current = this.historys[this.index]
    if (current.operate instanceof Shape || current.operate instanceof Text) {
      current.operate.disabled = true
      if (current.operate.selected) {
        this.canvas.event._removeSelect()
        this.canvas.event._removeHover()
        if (this.canvas.actionCallback.unselect) {
          this.canvas.actionCallback.unselect()
        }
      }
    } else if (current.operate instanceof MaskBrush) {
      current.operate.destory()
    }
    if (!current.prev) {
      this.index = -1
    } else {
      this.index = current.prev.index
    }
    this.render()
  }
  redo() {
    if (this.index === this.historys.length - 1) {
      return false
    }
    let current
    if (this.index === -1) {
      this.index = 0
    } else {
      let current = this.historys[this.index]
      if (!current.next) {
        return false
      }
      this.index = current.next.index
    }
    current = this.historys[this.index]
    if (current.operate instanceof Shape || current.operate instanceof Text) {
      current.operate.disabled = false
      if (current.operate.selected) {
        this.canvas.event._removeSelect()
        this.canvas.event._removeHover()
        if (this.canvas.actionCallback.unselect) {
          this.canvas.actionCallback.unselect()
        }
      }
    }

    this.render()
  }
  loadImage(image, type = this.canvas.imageType, isAIHandler = false) {
    console.log('loadImage')
    if (!image || !(image instanceof Image)) {
      throw new Error('image must be an Image')
    }
    if (!isAIHandler) {
      this.imageChanged = false
    }
    this.canvas.imageType = type
    const size = this.canvas.resetCanvasSize(image.width, image.height)
    this.canvas.drawImg(image, isAIHandler)
    if (!this.canvas.watermarkImg) {
      this.canvas.generateWatermark()
    }
    //The ratio of width to primitive width
    // this.canvas.initScale = size.w / size.ow
    // this.canvas.lastScale = size.w / size.ow
    return size
  }
  _getLastStep() {
    if (!this.historys.length || this.index === -1) {
      return null
    }
    return this.historys[this.index]
  }
  getCurrentStep() {
    if (this.index === -1) {
      return null
    }
    return this.historys[this.index]
  }
  render(isRender = true) {
    let crop = null
    let crops = []
    let ai = []
    let renders = []
    let rotates = []
    let rotatesCanvas = []
    let flip = []
    let filters = {}
    let background = null
    if (this.historys.length && this.index !== -1) {
      // 从当前下标倒序遍历
      let current = this.historys[this.index]
      while (current) {
        if (current.operate instanceof Background) {
          if (!background) {
            background = current
          }
        } else if (current.operate instanceof Filter) {
          if (!filters[current.operate.type]) {
            filters[current.operate.type] = current
          }
        } else if (current.operate instanceof Crop) {
          //多个crop操作坐标叠加
          crops.unshift(current)
          if (crop) {
            crop = Object.assign({}, crop, {
              operate: {
                ...crop.operate,
                x: crop.operate.x + current.operate.x,
                y: crop.operate.y + current.operate.y,
                ox: crop.operate.ox + current.operate.ox,
                oy: crop.operate.oy + current.operate.oy,
                render: current.operate.render,
              },
            })
          } else {
            crop = current
          }
        } else if (current.operate instanceof Rotate) {
          rotates.unshift(current)
        } else if (current.operate instanceof RotateCanvas) {
          rotatesCanvas.unshift(current)
        } else if (current.operate instanceof ResetRotate) {
          rotates.unshift(current)
          rotatesCanvas.unshift(current)
          flip.unshift(current)
        } else if (current.operate instanceof Flip) {
          flip.unshift(current)
        } else if (current.operate instanceof AI) {
          if (!ai.length) {
            ai.push(current)
          }
        } else {
          renders.unshift(current)
        }
        current = current.prev
      }
    }
    if (isRender) {
      this._render(rotates, rotatesCanvas, crop, crops, renders, filters, background, ai, flip)
      // this.renders.push({ rotates, rotatesCanvas, crop, crops, renders, filters, background, ai, flip })
    }
    return { rotates, rotatesCanvas, crop, crops, renders, filters, background, ai, flip }
  }
  _drawImg() {
    this.canvas._drawImg()
  }
  getOffset() {
    return {
      x: this.canvas.originX,
      y: this.canvas.originY,
    }
  }
  async _render(rotates, rotatesCanvas, crop, crops, renders, filters, background, ai, flip) {
    if (!this.canvas.image) {
      return
    }
    console.log('render')
    //隐藏元素避免闪烁
    // this.canvas._hidden()
    // 重置画布
    this.canvas.resetElement()
    this.canvas.resetCanvasImage()
    this.canvas.resetCanvasSize(this.canvas.image.width, this.canvas.image.height)
    this.canvas.resetCanvasParams()
    this.canvas.clearDraw()
    //因为crop操作记录了当时画布数据
    //因此涉及到原图层操作都需要严格按照顺序
    //不包括filter操作
    let beforeFlipX = false
    let beforeFlipY = false
    if (flip && flip.length) {
      let beforeCropFlip = [...flip]
      if (crop) {
        beforeCropFlip = flip.filter((item) => item.index < crop.index)
      }
      for (let i = 0; i < beforeCropFlip.length; i++) {
        if (beforeCropFlip[i].operate instanceof ResetRotate) {
          beforeFlipX = false
          beforeFlipY = false
        } else {
          if (beforeCropFlip[i].operate.flip === 'x') {
            beforeFlipX = !beforeFlipX
          } else {
            beforeFlipY = !beforeFlipY
          }
        }
      }
    }
    let canvasDegBeforeCrop = 0
    let canvasDegAfterCrop = 0
    // let rotatesCanvasBeforeCrop = []
    let rotatesCanvasAfterCrop = []
    if (rotatesCanvas) {
      // if (crop) {
      //   rotatesCanvasBeforeCrop = rotatesCanvas.filter((item) => item.index < crop.index)
      // }
      // if (rotatesCanvasBeforeCrop.length) {
      //   for (let i = 0; i < rotatesCanvasBeforeCrop.length; i++) {
      //     if (rotatesCanvasBeforeCrop[i].operate instanceof ResetRotate) {
      //       canvasDegBeforeCrop = 0
      //       this.canvas.canvasDegBeforeCrop = 0
      //     } else {
      //       canvasDegBeforeCrop -= Number(rotatesCanvasBeforeCrop[i].operate.deg)
      //       this.canvas.canvasDegBeforeCrop += Number(rotatesCanvasBeforeCrop[i].operate.deg)
      //     }
      //   }
      // }
      if (crops.length) {
        rotatesCanvasAfterCrop = rotatesCanvas.filter((item) => item.index > crop.index)
      } else {
        rotatesCanvasAfterCrop = rotatesCanvas
      }
      if (rotatesCanvasAfterCrop.length) {
        for (let i = 0; i < rotatesCanvasAfterCrop.length; i++) {
          if (rotatesCanvasAfterCrop[i].operate instanceof ResetRotate) {
            canvasDegAfterCrop = 0
          } else {
            canvasDegAfterCrop += Number(rotatesCanvasAfterCrop[i].operate.deg)
          }
        }
      }
    }
    const cropObj = {
      lastCrop: null,
      prevCrop: null,
    }
    let arr = [...crops, ...ai, ...rotatesCanvas]
    arr = arr.sort((item, item2) => item.index - item2.index)
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      if (item.operate instanceof AI) {
        item.operate.render(item.target)
      } else if (item.operate instanceof Crop) {
        if (!cropObj.lastCrop) {
          cropObj.lastCrop = item
        } else {
          cropObj.prevCrop = cropObj.lastCrop
          cropObj.lastCrop = item
        }
        await item.operate.render(item.target, beforeFlipX, beforeFlipY)
        if (item !== crops[crops.length - 1]) {
          canvasDegBeforeCrop = 0
        }
        this.canvas.canvasDegBeforeCrop = 0
      } else {
        if (cropObj.lastCrop) {
          if (cropObj.prevCrop) {
            if (cropObj.lastCrop.index > item.index && cropObj.prevCrop.index < item.index) {
              if (item.operate instanceof ResetRotate) {
                canvasDegBeforeCrop = 0
                this.canvas.canvasDegBeforeCrop = 0
              } else {
                canvasDegBeforeCrop -= Number(item[i].operate.deg)
                this.canvas.canvasDegBeforeCrop += Number(item.operate.deg)
              }
            }
          } else {
            if (cropObj.lastCrop.index < item.index) {
              if (item.operate instanceof ResetRotate) {
                canvasDegBeforeCrop = 0
                this.canvas.canvasDegBeforeCrop = 0
              } else {
                canvasDegBeforeCrop -= Number(item.operate.deg)
                this.canvas.canvasDegBeforeCrop += Number(item.operate.deg)
              }
            }
          }
        } else {
          if (item.operate instanceof ResetRotate) {
            canvasDegBeforeCrop = 0
            this.canvas.canvasDegBeforeCrop = 0
          } else {
            canvasDegBeforeCrop -= Number(item.operate.deg)
            this.canvas.canvasDegBeforeCrop += Number(item.operate.deg)
          }
        }
      }
    }
    // if (crop) {
    //   this.canvas.setOrigin(crop.operate.ox, crop.operate.oy)
    // }
    if (rotatesCanvas) {
      if (canvasDegBeforeCrop) {
        this.canvas.rotate(canvasDegBeforeCrop, crop)
      }
      this.canvas.rotate(canvasDegAfterCrop, crop)
      this.canvas.canvasDeg = canvasDegAfterCrop
    }
    if (rotates) {
      let deg = 0
      if (rotates.length) {
        deg = Number(rotates[rotates.length - 1].operate.deg)
        this.canvas.deg = deg
        const scaleOfRotate = this.canvas.getScaleOfRotate() * this.canvas.lastScale
        if (!crop || (crop && rotates[rotates.length - 1].index > crop.index)) {
          rotates[rotates.length - 1].operate.render(
            rotates[rotates.length - 1].target,
            deg,
            scaleOfRotate,
            scaleOfRotate
          )
        } else {
          rotates[rotates.length - 1].operate.render(
            rotates[rotates.length - 1].target,
            deg,
            scaleOfRotate,
            scaleOfRotate,
            crop
          )
        }
      }
    }
    // if (rotatesCanvas && rotatesCanvas.length) {
    //   rotatesCanvas[0].operate.render(rotatesCanvas[0].target, this.canvas.canvasDeg, this.canvas.canvas.width, this.canvas.canvas.height)
    // }
    if (background) {
      background.operate.render(background.target)
    }
    let flipX = false
    let flipY = false
    if (flip && flip.length) {
      let afterCropFlip = [...flip]
      if (crop) {
        afterCropFlip = flip.filter((item) => item.index > crop.index)
      }
      for (let i = 0; i < afterCropFlip.length; i++) {
        if (afterCropFlip[i].operate instanceof ResetRotate) {
          flipX = false
          flipY = false
        } else {
          if (afterCropFlip[i].operate.flip === 'x') {
            flipX = !flipX
          } else {
            flipY = !flipY
          }
        }
      }
    }
    if (flipX) {
      new Flip('x').render(this.canvas)
    }
    if (flipY) {
      new Flip('y').render(this.canvas)
    }
    if (renders && renders) {
      console.log(renders)
      for (let i = 0; i < renders.length; i++) {
        renders[i].operate.render(renders[i].target)
      }
    }
    this.canvas._drawImg()
    console.log('_drawImg')
    if (filters && Object.keys(filters).length) {
      const keys = Object.keys(filters)
      filters[keys[0]].operate.render(filters[keys[0]].target, filters, () => {
        this.canvas.event.activeAction(this.canvas.action)
      })
    }
    this.canvas.setWatermark()
    // this.canvas._show()

    this.runCallback()
  }
  _flipCanvas(flip, crop) {
    let flipX = false
    let flipY = false
    if (flip && flip.length) {
      let afterCropFlip = [...flip]
      if (crop) {
        afterCropFlip = flip.filter((item) => item.index > crop.index)
      }
      for (let i = 0; i < afterCropFlip.length; i++) {
        if (afterCropFlip[i].operate instanceof ResetRotate) {
          flipX = false
          flipY = false
        } else {
          if (afterCropFlip[i].operate.flip === 'x') {
            flipX = !flipX
          } else {
            flipY = !flipY
          }
        }
      }
    }
    if (flipX) {
      new Flip('x').render(this.canvas)
    }
    if (flipY) {
      new Flip('y').render(this.canvas)
    }
  }
  _getStepByType(type) {
    return this.render(false)[type]
  }
  runCallback() {
    for (let i = 0; i < this.callbacks.length; i++) {
      this.callbacks[i]()
    }
  }
  addCallback(callback) {
    this.callbacks.push(callback)
  }
  setAction(action, options = {}) {
    console.log('setAction')
    this.canvas.event._removeEventListener()
    this.canvas.action = action
    this.canvas.event = this.canvas.events[this.canvas.action]
    this.canvas.actionParams = options.params
    this.canvas.actionCallback = options.callback
    this.canvas.event.activeAction(this.canvas.action)
    // this.canvas.changeCursor(action === Action.SHAPE && options.params.type === Shape.REMOVERRUSH)
  }
  setActionParams(params) {
    this.canvas.actionParams = params
  }
  reset() {
    console.log('reset')
    const image = this.canvas.originImage
    const options = this.canvas.options
    const globalCallback = this.canvas.globalCallback
    this.historys = []
    this.index = -1
    this.canvas = new Canvas(this, this.target, this.options)
    this.canvas.setOptions(options)
    const keys = Object.keys(globalCallback)
    keys.forEach((key) => {
      this.registerGlobalCallback(key, globalCallback[key])
    })
    if (image) {
      this.loadImage(image)
    }
  }
  setGlobalParamsOfEvent(key, value) {
    for (let type of Object.getOwnPropertySymbols(this.canvas.events)) {
      this.canvas.events[type].global[key] = value
    }
  }
  setCustomCrop(w, h) {
    const x = this.canvas.upperCanvas.width / 2 - w / 2
    const y = this.canvas.upperCanvas.height / 2 - h / 2
    const lineWidth = this.canvas.lineWidth
    const lineColor = this.canvas.lineColor
    const dropBorderWidth = this.canvas.dropBorderWidth
    const r = this.canvas.event._proportionOfPixelsAndcanvas()
    const realLineWidth = lineWidth * lineWidth * r
    this.canvas.event._drawCropArea(this.canvas.upperCtx, x, y, w, h, realLineWidth, lineColor)
    this.canvas.event._drawCropApplyArea(
      this.canvas.upperCtx,
      {
        x: x + w / 2 - 40,
        y: h < 0 ? y : y + h,
        w: 80 * r,
        h: 30 * r,
        realLineWidth,
        lineColor,
        fillColor: 'rgba(0, 0, 0, 0.7)',
      },
      { cropX: x, cropY: y, cropW: w, cropH: h, r }
    )
  }
  setContainerScale(step, isSet = false) {
    if (isSet) {
      this.canvas.lastScale = step
    } else {
      this.canvas.lastScale += step
    }

    // this.canvas.setContainerScale(this.canvas.lastScale / this.canvas.initScale)
    this.canvas.setContainerScale(this.canvas.lastScale)
  }
  rotate(val) {
    const rotate = new Rotate(val)
    return this.add(rotate)
  }
  canvasRotate(val) {
    const rotateCanvas = new RotateCanvas(val)
    return this.add(rotateCanvas)
  }
  setBackground(val, blurSize, isImage) {
    const background = new Background(val, blurSize, isImage)
    return this.add(background)
  }
  flip(val) {
    const flip = new Flip(val)
    return this.add(flip)
  }
  ai(image, transId, job) {
    const ai = new AI(image, transId, this.canvas.image, job)
    return this.add(ai, this)
  }
  getSvg() {
    const container = this.canvas.svgMask.container.cloneNode(true)
  }
  resetRotate() {
    const resetRotate = new ResetRotate()
    return this.add(resetRotate)
  }
  maskBg(fill, blurSize, isImage) {
    this.canvas.turnCanvas(true)
    const maskBackground = new MaskBackground(fill, blurSize, isImage)
    return this.add(maskBackground)
  }
  async crop(ox, oy, ow, oh) {
    if (this.canvas.watermarkVisible) {
      this.canvas.removeWatermarkDrawImage()
    }
    const image = await canvasToImage(this.canvas.canvas, 'image/' + this.canvas.imageType)
    const crop = new Crop(ox, oy, ow, oh, image)
    return this.add(crop)
  }
  getLastAiTransId() {
    let current = this.historys[this.index]
    while (current) {
      if (current.operate instanceof AI) {
        return current.operate.transId
      }
      current = current.prev
    }
    return null
  }
  registerGlobalCallback(event, callback) {
    console.log('registerGlobalCallback')
    if (arguments.length === 1 && arguments[0] instanceof Array) {
      arguments[0].forEach((item) => {
        this.canvas.globalCallback[item.event] = item.callback
      })
    } else {
      this.canvas.globalCallback[event] = callback
    }
  }
  getUnprocessedImage() {
    return this.canvas.image
  }
  async getImage(base64Result = false) {
    console.log('getImage')
    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = 0
    canvas.style.left = 0
    // this.canvas.frame.parentNode.appendChild(canvas)
    const image = await canvasToImage(this.canvas.canvas, 'image/' + this.canvas.imageType)
    const width = image.width
    const height = image.height
    const canvasDeg = this.canvas.canvasDeg % 360

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (canvasDeg !== 0 && canvasDeg % 180 !== 0) {
      canvas.width = height
      canvas.height = width
      if (canvasDeg > 0) {
        if (canvasDeg > 180) {
          ctx.translate(0, canvas.height)
        } else {
          ctx.translate(canvas.width, 0)
        }
      } else {
        if (Math.abs(canvasDeg) > 180) {
          ctx.translate(canvas.width, 0)
        } else {
          ctx.translate(0, canvas.height)
        }
      }
    } else if (canvasDeg !== 0 && canvasDeg % 360 !== 0) {
      ctx.translate(canvas.width, canvas.height)
    }
    ctx.rotate((canvasDeg * Math.PI) / 180)
    // ctx.drawImage(image, 0, 0, width, height)
    const size = this.canvas.calculateCanvasWidthAndHeightOfRotate(this.canvas.deg, width, height)
    const scale = size.width / width
    ctx.scale(scale, scale)
    // ctx.drawImage(image, 0, 0, width, height)
    ctx.translate(size.x / scale, size.y / scale)
    // ctx.drawImage(image, 0, 0, width, height)
    ctx.rotate((this.canvas.deg * Math.PI) / 180)
    ctx.drawImage(image, 0, 0, width, height)
    // this.canvas.frame.parentNode.removeChild(canvas)
    if (base64Result) {
      return canvas.toDataURL('image/' + this.canvas.imageType)
    } else {
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const url = window.URL.createObjectURL(blob)
          const image = new Image()
          image.src = url
          image.onload = () => {
            console.log(url)
            resolve(image)
          }
        })
      }, 'image/' + this.canvas.imageType)
    }
  }
  getImageSize() {
    if (!this.canvas.image) {
      return
    }
    const canvasDeg = this.canvas.canvasDeg % 360
    if (canvasDeg !== 0 && canvasDeg % 180 !== 0) {
      return {
        w: this.canvas.image.height,
        h: this.canvas.image.width,
      }
    } else {
      return {
        w: this.canvas.image.width,
        h: this.canvas.image.height,
      }
    }
  }
  getImageType() {
    return this.canvas.imageType
  }
  setImageType(type) {
    this.canvas.imageType = type
  }
  getBackground() {
    let current = this.historys[this.index]
    while (current) {
      if (current.operate instanceof Background) {
        return current.operate
      }
      current = current.prev
    }
    return null
  }
  getImageChanged() {
    return this.imageChanged
  }
  initImageChanged() {
    this.imageChanged = false
  }
  setWatermark(val) {
    this.canvas.watermarkText = val
  }
  setWatermarkVisible(val) {
    this.canvas.watermarkVisible = val
    this.options.watermarkVisible = val
    this.render()
  }
  getViewSize() {
    console.log('getViewSize')
    let scale = this.canvas.lastScale * this.canvas.rotateScale
    if (this.canvas.canvasDeg % 180 === 0) {
      return { w: this.canvas.view.clientWidth * scale, h: this.canvas.view.clientHeight * scale }
    } else {
      return { w: this.canvas.view.clientHeight * scale, h: this.canvas.view.clientWidth * scale }
    }
  }

  static MODE = {
    NONE: Action.NONE,
    CROP: Action.CROP,
    SHAPE: Action.SHAPE,
    TEXT: Action.TEXT,
    MASK_BRUSH: Action.MASK_BRUSH,
    BRUSH: Action.BRUSH,
  }
  static BRUSH = {
    RESERVE: MaskBrush.RESERVE,
    REMOVE: MaskBrush.REMOVE,
    MOSAIC: Brush.MOSAIC,
  }
  static SHAPE = {
    RECTANGLE: Shape.RECTANGLE,
    CIRCULAR: Shape.CIRCULAR,
    TRIANGLE: Shape.TRIANGLE,
    ARROW: Shape.ARROW,
    LINE: Shape.LINE,
    CURVE: Shape.CURVE,
    REMOVERRUSH: Shape.REMOVERRUSH,
    RESERVE: Shape.RESERVE,
    REMOVE: Shape.REMOVE,
  }
}
