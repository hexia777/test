import Scale from './operate/scale'
import Step from './step'
import Crop from './operate/crop'
import Brush from './operate/brush'
import Text from './operate/text'
import Shape from './operate/shape'
import MaskBrush from './operate/maskBrush'
import Disable from './operate/disable'
import Action from './action'
import { UUID, isOnThePath, isOnTheArea, angle, pointAfterRotating, calculateAfterRotateVertex } from './utils'

export default class Event {
  constructor(canvas, target) {
    this.canvas = canvas
    this.target = target
    this.listeners = {}
    this.global = {
      obj: null,
      drawing: false,
      currSelected: false,
      currHover: null,
      rotating: false,
      spaceDown: false,
      canDrag: false,
      hitResult: null,
      lastMask: null,
    }
  }
  activeAction(action) {
    console.log('activeAction', action)
    this._removeEventListener()
    // this.canvas.turnCanvas(false)
    this.canvas.initUpperCorsur(this.global.canDrag ? 'move' : 'default')
    if (this.global.currHover && this.global.currSelected) {
      this._addSelect(this.global.currHover, false, true)
    }
    if (action === Action.NONE) {
      this._noneEvent()
      this._globalEvent()
    } else if (action === Action.CROP) {
      this._noneEvent()
      this._globalEvent()
    } else if (action === Action.DROP) {
      this._dropEvent()
      this._globalEvent()
    } else if (action === Action.SHAPE) {
      this._shapeEvent()
      this._globalEvent()
    } else if (action === Action.MASK_BRUSH) {
      this._maskBrushEvent()
      this._globalEvent()
    } else if (action === Action.BRUSH) {
      this._brushEvent()
      this._globalEvent()
    } else if (action === Action.TEXT) {
      this._textEvent()
      this._globalEvent()
    }
  }
  initGlobal() {
    this.global.spaceDown = false
  }
  _registerEvent(event, callback, options = {}, target = this.target) {
    let { option, uuid } = options
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event] = [...this.listeners[event], { callback, uuid, target }]
    target.addEventListener(event, callback, option)
  }
  _hasResisterEvent(event, uuid) {
    if (uuid) {
      return !!(this.listeners[event] && this.listeners[event].some((item) => item.uuid === uuid))
    } else {
      return !!(this.listeners[event] && this.listeners[event].length)
    }
  }
  _removeEventListener(event, uuid) {
    if (event) {
      if (this.listeners[event]) {
        this.listeners[event].forEach((item, index) => {
          if (uuid) {
            if (item.uuid === uuid) {
              item.target.removeEventListener(event, item.callback)
              this.listeners[event][index] = null
            }
          } else {
            item.target.removeEventListener(event, item.callback)
            this.listeners[event][index] = null
          }
        })
        this.listeners[event] = this.listeners[event].filter(item => !!item)
      }
    } else {
      const events = Object.keys(this.listeners)
      events.forEach((event) => {
        if (this.listeners[event]) {
          this.listeners[event].forEach((item) => {
            item.target.removeEventListener(event, item.callback)
          })
          this.listeners[event] = null
        }
      })
    }
  }
  _globalEvent() {
    console.log('_globalEvent')
    //drag模式激活
    if (!this._hasResisterEvent('mousedown', 'global')) {
      this._registerEvent('mousedown', () => {
        if (this.global.canDrag || (this.global.currHover && this.global.currHover instanceof Text && !this.global.currHover.hasFocus())) {
          this._registerEvent('mousemove', (e) => {
            const viewW = Number(this.canvas.view.getAttribute('data-width')) * this.canvas.lastScale
            const viewH = Number(this.canvas.view.getAttribute('data-height')) * this.canvas.lastScale
            const limitW = (viewW - this.canvas.maxWidth) / 2
            const limitH = (viewH - this.canvas.maxHeight) / 2
            if (viewW > this.canvas.maxWidth && Math.abs(this.canvas.originX + e.movementX) < limitW) {
              this.canvas.originX += e.movementX
            }
            if (viewH > this.canvas.maxHeight && Math.abs(this.canvas.originY + e.movementY) < limitH) {
              this.canvas.originY += e.movementY
            }
            this.canvas.offsetImage(this.canvas.originX, this.canvas.originY)
          }, { uuid: "global" })
        }
      }, { uuid: "global" })
    }
    if (!this._hasResisterEvent('mouseup', 'global')) {
      this._registerEvent('mouseup', () => {
        this._removeEventListener('mousemove', 'global')
      })
    }
    if (!this._hasResisterEvent('keyup', 'preview')) {
      this._registerEvent('keyup', (e) => {
        //编辑模式下禁用全局事件
        if (this.global.currHover && this.global.currHover instanceof Text && this.global.currHover.hasFocus()) { return }
        e.preventDefault();
        e.stopPropagation();
        if (e.code === 'Space') {
          this._removeEventListener('mousedown', 'preview')
          this._removeEventListener('mousemove', 'preview')
          this._removeEventListener('mouseenter', 'preview')
          this._removeEventListener('mousewheel', 'preview')
          this.global.spaceDown = false
          this.global.canDrag = false
          this.activeAction(this.canvas.action)
          if (this.canvas.globalCallback.onSpaceUp) {
            this.canvas.globalCallback.onSpaceUp()
          }
        } else if (e.key === 'Backspace') {
          const uuid = this.canvas.selected.getAttribute('data-uuid')
          if (!uuid) {
            return
          }
          for (let type of Object.getOwnPropertySymbols(this.canvas.shapes)) {
            const filter = this.canvas.shapes[type].filter(item => item.uuid === uuid)
            if (!filter || !filter.length) {
              continue
            }
            const selected = filter[0]
            const filter2 = this.canvas.dispatch.historys.filter(item => item.operate === selected)
            if (!filter2 || !filter2.length) {
              continue
            }
            const selectedStep = filter2[0]
            if (selectedStep.operate instanceof Text && selectedStep.operate.hasFocus()) {
              continue
            }
            selectedStep.operate.disabled = true
            this.global.currSelected = false
            this.global.currHover = null
            this.global.obj = null
            this.canvas.dispatch.add(new Disable(selectedStep))
            if (this.canvas.actionCallback.onUnselect) {
              this.canvas.actionCallback.onUnselect()
            }
            this._removeHover()
            this._removeSelect()
          }
        }
      }, { uuid: "preview" }, window)
    }
    if (!this._hasResisterEvent('keydown', 'preview')) {
      this._registerEvent('keydown', (e) => {
        // e.stopPropagation()
        // e.preventDefault()
        if (e.code === 'Space') {
          if (!this.global.spaceDown) {
            this.global.spaceDown = true
            this._removeEventListener('mousedown')
            this._removeEventListener('mousemove')
            this._removeEventListener('mouseenter')
            this._removeEventListener('mousewheel')
            if (this.canvas.globalCallback.onSpaceDown) {
              this.canvas.globalCallback.onSpaceDown()
            }
            this._registerEvent('mousedown', () => {
              this._registerEvent('mousemove', (e) => {
                const viewW = Number(this.canvas.view.getAttribute('data-width')) * this.canvas.lastScale
                const viewH = Number(this.canvas.view.getAttribute('data-height')) * this.canvas.lastScale
                const limitW = (viewW - this.canvas.maxWidth) / 2
                const limitH = (viewH - this.canvas.maxHeight) / 2
                if (viewW > this.canvas.maxWidth && Math.abs(this.canvas.originX + e.movementX) < limitW) {
                  this.canvas.originX += e.movementX
                }
                if (viewH > this.canvas.maxHeight && Math.abs(this.canvas.originY + e.movementY) < limitH) {
                  this.canvas.originY += e.movementY
                }
                this.canvas.offsetImage(this.canvas.originX, this.canvas.originY)
              }, { uuid: "preview" })
            }, { uuid: "preview" })
          }
        } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
          this.canvas.dispatch.undo()
        } else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
          this.canvas.dispatch.redo()
        } else if (e.ctrlKey || e.metaKey) {
          let accumulator = 0
          this._registerEvent(
            'mousewheel',
            (e) => {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault()
                e.stopPropagation()
                if (this.canvas.frame.contains(e.target)) {
                  accumulator += e.deltaY
                  if (Math.abs(accumulator) >= 20) {
                    const scale = accumulator > 0 ? 0.05 : -0.05
                    if (this.canvas.lastScale + scale <= 3 && this.canvas.lastScale + scale > 0.04) {
                      this.canvas.lastScale = this.canvas.lastScale + scale
                      this.canvas.setContainerScale(this.canvas.lastScale)
                    }
                    accumulator = 0
                  }
                }
              }
            },
            { uuid: "preview", options: { passive: false }, window }
          )
        }
      }, { uuid: "preview" }, window)
    }
    if (!this._hasResisterEvent('paste', 'global')) {
      this._registerEvent('paste', (e) => {
        // 阻止默认粘贴
        e.preventDefault();
        // 粘贴事件有一个clipboardData的属性，提供了对剪贴板的访问
        // clipboardData的getData(fomat) 从剪贴板获取指定格式的数据
        var text = (e.originalEvent || e).clipboardData.getData('text/plain');
        //清除回车
        text = text.replace(/\[\d+\]|\n|\r/ig, "")
        // 插入
        document.execCommand("insertText", false, text);
      }, { uuid: "global" })
    }
    let accumulator2 = 0
    this._registerEvent(
      'mousewheel DOMMouseScroll',
      (e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          e.stopPropagation()
          if (this.canvas.frame.contains(e.target)) {
            accumulator2 += e.deltaY
            if (Math.abs(accumulator2) >= 20) {
              const scale = accumulator2 > 0 ? 0.05 : -0.05
              if (this.canvas.lastScale + scale <= 3 && this.canvas.lastScale + scale > 0.04) {
                this.canvas.lastScale = this.canvas.lastScale + scale
                this.canvas.setContainerScale(this.canvas.lastScale)
              }
              accumulator2 = 0
            }
          }
        }
      },
      { uuid: "global", options: { passive: false }, window }
    )
    if (!this._hasResisterEvent('mouseleave', 'preview')) {
      this._registerEvent('mouseleave', () => {
        //todo 加步骤
        this._removeEventListener('mousewheel', 'preview')
      }, { uuid: "preview" })
    }
    if (!this._hasResisterEvent('mouseup', 'preview')) {
      this._registerEvent('mouseup', () => {
        this._removeEventListener('mousemove', 'preview')
      }, { uuid: "preview" })
    }
  }
  _noneEvent() {
    //
    // this._registerEvent('touchstart', (e) => {
    //   let lastX = e.touches[0].pageX
    //   let lastY = e.touches[0].pageY
    //   this._registerEvent(
    //     'touchmove',
    //     (e) => {
    //       e.preventDefault()
    //       e.stopPropagation()
    //       this.canvas.originX += e.touches[0].pageX - lastX
    //       this.canvas.originY += e.touches[0].pageY - lastY
    //       this.canvas.offsetImage(this.canvas.originX, this.canvas.originY)
    //       lastX = e.touches[0].pageX
    //       lastY = e.touches[0].pageY
    //     },
    //     { passive: false }
    //   )
    //   this._registerEvent(
    //     'touchend',
    //     () => {
    //       this._removeEventListener('touchmove')
    //     },
    //     { passive: false }
    //   )
    // })

  }
  _proportionOfPixelsAndcanvas() {
    return ((this.canvas.upperCanvas.clientWidth * this.canvas.upperCanvas.clientHeight) / (this.canvas.upperCanvas.width * this.canvas.upperCanvas.height))
  }
  _cropEvent() {
    const lineWidth = this.canvas.lineWidth
    const lineColor = this.canvas.lineColor
    const dropBorderWidth = this.canvas.dropBorderWidth
    const r = this._proportionOfPixelsAndcanvas()
    const realLineWidth = (lineWidth * lineWidth) * r
    //鼠标落点坐标 crop区域宽高
    let w = 0
    let h = 0
    let x = 0
    let y = 0
    let ox = 0
    let oy = 0
    let ow = 0
    let oh = 0
    this._registerEvent('mousedown', (e) => {
      //非crop模式
      if (!this._hasResisterEvent('click')) {
        x = e.offsetX / this.canvas.originImageScale
        y = e.offsetY / this.canvas.originImageScale
        ox = e.offsetX
        oy = e.offsetY
        w = 0
        h = 0
        this._registerEvent('mousemove', (e) => {
          w = e.offsetX / this.canvas.originImageScale - x
          h = e.offsetY / this.canvas.originImageScale - y
          ow = e.offsetX - ox
          oh = e.offsetY - oy
          this._drawCropArea(this.canvas.upperCtx, x, y, w, h, realLineWidth, lineColor)
          if (this.canvas.actionCallback.cropping) {
            this.canvas.actionCallback.cropping(w, h)
          }
        }, { uuid: 'crop' })
        // this._registerEvent('mouseout', () => {
        //   this._removeEventListener('mousemove')
        //   this._removeEventListener('mousedown')
        // })
      } else {//crop 模式
        const cx = e.offsetX / this.canvas.originImageScale
        const cy = e.offsetY / this.canvas.originImageScale
        const result = this.calculateDropBorer(cx, cy, x, y, w, h, dropBorderWidth)
        if (result.hit) {
          this._registerEvent('mousemove', (e) => {
            w = e.offsetX / this.canvas.originImageScale - x
            h = e.offsetY / this.canvas.originImageScale - y
            ow = e.offsetX - ox
            oh = e.offsetY - oy
            this._drawCropArea(this.canvas.upperCtx, x, y, w, h, realLineWidth, lineColor)
          }, { uuid: 'crop' })
        }
      }
    }, { uuid: 'crop' })
    // this._registerEvent('mouseenter', () => {
    //   this._registerEvent('mousemove', (e) => {
    //     const cx = e.offsetX / this.canvas.originImageScale
    //     const cy = e.offsetY / this.canvas.originImageScale
    //     const r = this.calculateDropBorer(cx, cy, x, y, w, h, dropBorderWidth)
    //   }, { uuid: 'dropborder' })
    // })
    this._registerEvent('mouseup', () => {
      this._removeEventListener('mousemove', 'crop')
      //计算dom的相对位置
      const originPosition = this.calculateCropOriginPosition(ox, oy, ow, oh)
      this._drawCropApplyArea(this.canvas.upperCtx, { x: x + w / 2 - 40, y: h < 0 ? y : (y + h), w: 80 * r, h: 30 * r, realLineWidth, lineColor, fillColor: 'rgba(0, 0, 0, 0.7)' }, { cropX: x, cropY: y, cropW: w, cropH: h, r }, originPosition)
    })
  }
  calculateCropOriginPosition(ox, oy, ow, oh) {
    if (ow < 0) {
      ox += ow
    }
    if (oh < 0) {
      oy += oh
    }
    return { x: ox, y: oy, w: Math.abs(ow), h: Math.abs(oh) }
  }
  calculateDropBorer(pointX, pointY, x, y, w, h, dropBorderWidth, rotate, center) {
    let afterRotatePoint = pointAfterRotating(-1 * rotate, pointX, pointY, center.x, center.y)
    pointX = afterRotatePoint.x
    pointY = afterRotatePoint.y
    if (pointX >= x - dropBorderWidth && pointX <= x + dropBorderWidth && pointY >= y - dropBorderWidth && pointY <= y + dropBorderWidth) {
      return {
        hit: true,
        type: 'tl'
      }
    } else if (pointX >= x + w / 2 - dropBorderWidth && pointX <= x + w / 2 + dropBorderWidth && pointY >= y - dropBorderWidth && pointY <= y + dropBorderWidth) {
      return {
        hit: true,
        type: 'tc'
      }
    } else if (pointX >= x + w - dropBorderWidth && pointX <= x + w + dropBorderWidth && pointY >= y - dropBorderWidth && pointY <= y + dropBorderWidth) {
      return {
        hit: true,
        type: 'tr'
      }
    } else if (pointX >= x - dropBorderWidth && pointX <= x + dropBorderWidth && pointY >= y + h / 2 - dropBorderWidth && pointY <= y + h / 2 + dropBorderWidth) {
      return {
        hit: true,
        type: 'cl'
      }
    } else if (pointX >= x + w - dropBorderWidth && pointX <= x + w + dropBorderWidth && pointY >= y + h / 2 - dropBorderWidth && pointY <= y + h / 2 + dropBorderWidth) {
      return {
        hit: true,
        type: 'cr'
      }
    } else if (pointX >= x - dropBorderWidth && pointX <= x + dropBorderWidth && pointY >= y + h - dropBorderWidth && pointY <= y + h + dropBorderWidth) {
      return {
        hit: true,
        type: 'bl'
      }
    } else if (pointX >= x + w / 2 - dropBorderWidth && pointX <= x + w / 2 + dropBorderWidth && pointY >= y + h - dropBorderWidth && pointY <= y + h + dropBorderWidth) {
      return {
        hit: true,
        type: 'bc'
      }
    } else if (pointX >= x + w - dropBorderWidth && pointX <= x + w + dropBorderWidth && pointY >= y + h - dropBorderWidth && pointY <= y + h + dropBorderWidth) {
      return {
        hit: true,
        type: 'br'
      }
    } else if (pointX >= x + w / 2 - dropBorderWidth && pointX <= x + w / 2 + dropBorderWidth && pointY >= y + dropBorderWidth * 3 + h - dropBorderWidth && pointY <= y + dropBorderWidth * 3 + h + dropBorderWidth) {
      return {
        hit: true,
        type: 'rotate'
      }
    } else {
      return {
        hit: false
      }
    }

  }
  _drawCropApplyArea(ctx, { x, y, w, h, lineWidth, lineColor, fillColor }, { cropX, cropY, cropW, cropH, r }, originPosition) {
    if (y + h > this.canvas.upperCanvas.height) {
      y -= h
    }
    this._drawRect(ctx, { x, y }, w / 2, h, lineWidth, lineColor, fillColor, () => {
      this._registerEvent('click', (e) => {
        const cx = e.offsetX / this.canvas.originImageScale
        const cy = e.offsetY / this.canvas.originImageScale
        if (cx >= x && cy >= y && cx <= x + w / 2 && cy <= y + h) {
          if (this.canvas.actionCallback.crop) {
            this.canvas.actionCallback.crop(cropW, cropH)
          }
          const imgData = this.canvas.ctx.getImageData(cropX, cropY, cropW, cropH)
          this.canvas.dispatch.add(new Crop(cropX, cropY, cropW, cropH, r, imgData, originPosition.x, originPosition.y, originPosition.w, originPosition.h))
          this._removeEventListener('click')
        }
      })
    })
    this._drawRect(ctx, { x: x + w / 2, y }, w / 2, h, lineWidth, lineColor, fillColor, () => {
      this._registerEvent('click', (e) => {
        const cx = e.offsetX / this.canvas.originImageScale
        const cy = e.offsetY / this.canvas.originImageScale
        if (cx >= x + w / 2 && cy >= y && cx <= x + w && cy <= y + h) {
          if (this.canvas.actionCallback.cancel) {
            this.canvas.actionCallback.cancel()
          }
          this._clearCanvas(ctx)
          this._removeEventListener('click')
        }
      })
    })
  }
  _clearCanvas(ctx) {
    ctx.clearRect(0, 0, this.canvas.upperCanvas.width, this.canvas.upperCanvas.height)
  }
  _drawCropArea(ctx, x, y, w, h, lineWidth, lineColor = '#fff') {
    if (Math.abs(w) >= lineWidth * 4 || Math.abs(h) >= lineWidth * 4) {
      this._clearCanvas(ctx)
      this._drawRect(ctx, { x, y }, w, h, lineWidth, lineColor)
      //竖线
      this._drawLine(ctx, { x: x + w / 3, y }, { x: x + w / 3, y: y + h }, lineWidth)
      this._drawLine(ctx, { x: x + w / 3 * 2, y }, { x: x + w / 3 * 2, y: y + h }, lineWidth)
      //横线
      this._drawLine(ctx, { x, y: y + h / 3 }, { x: x + w, y: y + h / 3 }, lineWidth)
      this._drawLine(ctx, { x, y: y + h / 3 * 2 }, { x: x + w, y: y + h / 3 * 2 }, lineWidth)
    }
  }
  //画线
  _drawLine(ctx, start, end, lineWidth, color = '#fff') {
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
  }
  _drawCurve(ctx, start, end, cp, lineWidth, color = '#fff') {
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.quadraticCurveTo(cp.x, cp.y, end.x, end.y)
    ctx.stroke()
  }
  //画块
  _drawRect(ctx, start, width, height, lineWidth, color = '#fff', fillColor, cb = () => { }) {
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.rect(start.x, start.y, width, height)
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fillRect(start.x, start.y, width, height);
    }
    ctx.stroke()
    cb()
  }
  //画图
  _drawImage(ctx, start, src) {
    let img = new Image();
    img.src = src
    img.onload = () => {
      ctx.drawImage(img, start.x, start.y);
    }
  }
  _generateShapeCanvas(uuid) {
    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.pointerEvents = 'all'
    canvas.width = this.canvas.canvas.width
    canvas.height = this.canvas.canvas.height
    canvas.setAttribute('data-uuid', uuid)
    return canvas
  }
  /**
   * 计算鼠标悬浮位置是否存在图形
   */
  _mouseMove(e) {
    // if (this._hasResisterEvent('mousemove', 'selected')) {
    //   return
    // }
    let mousePosition = this._getOffsetToContainer(e)
    const keys = Object.getOwnPropertySymbols(this.canvas.shapes)
    //移除上一个hover的事件
    this.global.currHover = null
    if (keys) {
      let shapes = []
      keys.forEach(key => {
        shapes = shapes.concat(this.canvas.shapes[key].filter((item) => !item.disabled))
      })
      shapes = shapes.sort((item, item2) => item.index - item2.index)
      if (shapes.length) {
        for (let i = 0; i < shapes.length; i++) {
          const curr = shapes[i]

          if (curr instanceof Shape && curr.type === Shape.CURVE) {
            if (isOnTheArea(
              mousePosition,
              {
                x: curr.x,
                y: curr.y,
                w: curr.w,
                h: curr.h,
              })
              &&
              isOnThePath(
                mousePosition,
                curr
              )) {
              this.global.currHover = curr
            }
          } else {
            mousePosition = this._getOffsetOfContainerAfterRotating(e, curr, mousePosition.x, mousePosition.y)
            if (isOnTheArea(
              mousePosition,
              {
                x: curr.x,
                y: curr.y,
                w: curr.w,
                h: curr.h,
              }, curr, -1 * curr.deg, curr.rotate)) {
              this.global.currHover = curr
            }
          }
        }
        if (this.global.currHover) {
          this._addHover(this.global.currHover)
        } else {
          if (!(e.target === this.canvas.hover)) {
            this._removeHover()
          }

        }
      }
    }
  }
  _removeHover() {
    this.canvas.hoverBox.style.display = 'none'
  }
  _addHover(draw) {
    if (!draw) {
      return
    }
    this.canvas.hoverTransform.style.width = draw.w + 'px'
    this.canvas.hoverTransform.style.height = draw.h + 'px'
    this.canvas.hoverTransform.style.top = draw.y + 'px'
    this.canvas.hoverTransform.style.left = draw.x + 'px'
    this.canvas.hoverTransform.style.transform = `rotate(${-1 * draw.deg}deg)`
    this.canvas.hover.style.transform = `rotate(${draw.rotate}deg)`
    this.canvas.hoverBox.style.display = 'block'
  }
  _removeSelect() {
    console.log('_removeSelect')
    this.global.currSelected = false
    this.canvas.selected.removeAttribute('data-uuid')
    this.canvas.selectedBox.style.display = 'none'
    this._removeEventListener('mousemove', 'selected')
    this._removeEventListener('mousedown', 'selected')
    this._removeEventListener('mouseup', 'selected')
  }
  calculatePointIsInSelected(e, draw, point) {
    if (e.target === this.canvas.selectedTransform) {
      return true
    }
    if (point) {
      // const w = Number(this.canvas.selectedTransform.getAttribute('data-width'))
      // const h = Number(this.canvas.selectedTransform.getAttribute('data-height'))
      // const x = Number(this.canvas.selectedTransform.getAttribute('data-x'))
      // const y = Number(this.canvas.selectedTransform.getAttribute('data-y'))
      return isOnTheArea(point, {
        x: draw.x,
        y: draw.y,
        w: draw.w,
        h: draw.h,
      }, draw, -1 * draw.deg, draw.rotate)
    }
    return false
  }
  _addSelect(draw, isAddText = false, isInit = false) {
    console.log('_addSelect')
    if (!draw) {
      return
    }
    const drawCenterPoint = pointAfterRotating(draw.deg, draw.x + draw.w / 2, draw.y + draw.h / 2, draw.x, draw.y)
    let mousePoint
    this.global.currSelected = true
    this._removeHover()
    draw.selected = true
    this._removeEventListener('mousemove', 'selected')
    this._removeEventListener('mousedown', 'selected')
    this._removeEventListener('mouseup', 'selected')
    this._setSelectedPosition(draw)
    this._setSelectedPointPosition(draw)
    let selectTheSelection
    this._registerEvent('mousedown', (e) => {
      e.stopPropagation()
      console.log('mousedown')
      //删除初始化移动事件
      this._removeEventListener('mousemove', 'selected')
      this._removeHover()
      this.global.drawing = true
      mousePoint = this._getOffsetToContainer(e)
      mousePoint = this._getOffsetOfContainerAfterRotating(e, draw, mousePoint.x, mousePoint.y)
      // if (e.target === this.canvas.selectedTransform) {
      //   mousePoint = pointAfterRotating(-1 * draw.deg, mousePoint.x, mousePoint.y, draw.x, draw.y)
      // }
      const center = { x: draw.x + draw.w / 2, y: draw.y + draw.h / 2 }
      this.global.hitResult = this.calculateDropBorer(
        mousePoint.x,
        mousePoint.y,
        this.canvas.selectedTransform.offsetLeft,
        this.canvas.selectedTransform.offsetTop,
        this.canvas.selectedTransform.clientWidth,
        this.canvas.selectedTransform.clientHeight,
        this.canvas.dropBorderWidth,
        draw.rotate,
        center)
      selectTheSelection = this.calculatePointIsInSelected(e, draw, mousePoint)
      this._registerEvent('mousemove', (e) => {
        if (!e.movementX && !e.movementY) {
          return
        }
        console.log('mousemove2', e.movementX, e.movementY)
        e.stopPropagation()
        if (draw instanceof Text) {
          if (draw.hasFocus()) {
            return
          }
        }
        if (this.global.hitResult.hit) {
          this._resizeSelected(e, this.global.hitResult.type, draw)
        } else {
          if (selectTheSelection) {
            let cp = this._getOffsetToContainer(e)
            if (e.target === this.canvas.selectedTransform) {
              cp = pointAfterRotating(-1 * draw.deg, cp.x, cp.y, draw.x, draw.y)
            }
            draw.setOffset(cp.x - mousePoint.x, cp.y - mousePoint.y)
            mousePoint = cp
            draw.render(this.canvas.shapesElement)
          } else {
            this._resizeSelected(e, 'rotate', draw)
          }
        }
        this._setSelectedPosition(draw)
        this._setSelectedPointPosition(draw)
      }, { uuid: 'selected' }, this.canvas.selectedBox)

    }, { uuid: 'selected' }, this.canvas.selectedBox)
    if (draw instanceof Text) {
      this._registerEvent('blur', (e) => {
        draw.setZIndex()
        draw.blur()

      }, { uuid: 'selected' }, draw.input)
    }
    if (!isInit) {
      if (!(draw instanceof Text) || draw instanceof Text && !draw.hasFocus()) {
        this._registerEvent('mousemove', (e) => {
          console.log('mousemove1')
          e.stopPropagation()
          if (draw instanceof Text) {
            if (draw.hasFocus()) {
              return
            }
          }
          const selectTheSelection = this.calculatePointIsInSelected(e, draw, mousePoint)
          if (this.global.hitResult && this.global.hitResult.hit) {
            this._resizeSelected(e, this.global.hitResult.type, draw)
          } else {
            if (!mousePoint) {
              mousePoint = this._getOffsetToContainer(e)
              if (selectTheSelection) {
                mousePoint = pointAfterRotating(-1 * draw.deg, mousePoint.x, mousePoint.y, draw.x, draw.y)
              }
            }
            let cp = this._getOffsetToContainer(e)
            if (selectTheSelection) {
              cp = pointAfterRotating(-1 * draw.deg, cp.x, cp.y, draw.x, draw.y)
            }
            draw.setOffset(cp.x - mousePoint.x, cp.y - mousePoint.y)
            mousePoint = cp
            draw.render(this.canvas.shapesElement)
          }

          this._setSelectedPosition(draw)
          this._setSelectedPointPosition(draw)
        }, { uuid: 'selected' }, this.canvas.selectedBox)
      }
    }
    this._registerEvent('mouseup', (e) => {
      mousePoint = this._getOffsetToContainer(e)
      mousePoint = this._getOffsetOfContainerAfterRotating(e, draw, mousePoint.x, mousePoint.y)
      selectTheSelection = this.calculatePointIsInSelected(e, draw, mousePoint)
      if (selectTheSelection || isAddText) {
        isAddText = false
        this._setSelectedPosition(draw)
        this._setSelectedPointPosition(draw)
        this._removeEventListener('mousemove', 'selected')
      } else {
        this.global.currSelected = false
        //取消选中回调
        if (this.canvas.actionCallback.onUnselect) {
          this.canvas.actionCallback.onUnselect()
        }
        this._removeSelect()
        if (this.global.currHover) {
          this.global.currHover.selected = false
          this.global.currHover = null
        }
      }
      if (draw instanceof Text) {
        console.log('blur')
        draw.setZIndex()
        draw.blur()
      }
      this.global.drawing = false
      mousePoint = null
      this.global.hitResult = null
    }, { uuid: 'selected' }, this.canvas.selectedBox)
  }
  _setSelectedPosition(draw) {
    this.canvas.selected.setAttribute('data-uuid', draw.uuid)
    this.canvas.selected.style.cursor = 'move'
    this.canvas.selectedTransform.style.width = draw.w + 'px'
    this.canvas.selectedTransform.style.height = draw.h + 'px'
    this.canvas.selectedTransform.style.top = draw.y + 'px'
    this.canvas.selectedTransform.style.left = draw.x + 'px'
    this.canvas.selectedTransform.style.transform = `rotate(${-1 * draw.deg}deg)`
    this.canvas.selectedTransform.setAttribute('data-width', draw.w)
    this.canvas.selectedTransform.setAttribute('data-height', draw.h)
    this.canvas.selectedTransform.setAttribute('data-x', draw.x)
    this.canvas.selectedTransform.setAttribute('data-y', draw.y)
    this.canvas.selected.style.transform = `rotate(${draw.rotate}deg)`
    this.canvas.selectedBox.style.display = 'block'
  }
  _setSelectedPointPosition(draw) {
    this._removeEventListener('mousedown', 'rotate')
    this._removeEventListener('mousemove', 'rotate')
    this._removeEventListener('mouseleave', 'rotate')
    this._removeEventListener('mouseup', 'rotate')
    this._removeEventListener('mousemove', 'resize')
    this._removeEventListener('mousedown', 'resize')
    this._removeEventListener('mouseleave', 'resize')
    this._removeEventListener('mouseup', 'resize')
    const tc = this.canvas.selected.querySelector('div[data-position="t-c"]')
    tc.style.left = draw.w / 2 - this.canvas.dropNodeWidth / 2 + 'px'
    const cl = this.canvas.selected.querySelector('div[data-position="c-l"]')
    cl.style.top = draw.h / 2 - this.canvas.dropNodeWidth / 2 + 'px'
    const cr = this.canvas.selected.querySelector('div[data-position="c-r"]')
    cr.style.top = draw.h / 2 - this.canvas.dropNodeWidth / 2 + 'px'
    const bc = this.canvas.selected.querySelector('div[data-position="b-c"]')
    bc.style.left = draw.w / 2 - this.canvas.dropNodeWidth / 2 + 'px'
    const rotate = this.canvas.selected.querySelector('div[data-position="rotate"]')
    rotate.style.left = draw.w / 2 - this.canvas.dropNodeWidth / 2 + 'px'
    if (draw instanceof Text) {
      tc.style.display = 'none'
      cl.style.display = 'none'
      cr.style.display = 'none'
      bc.style.display = 'none'
    } else {
      tc.style.display = 'block'
      cl.style.display = 'block'
      cr.style.display = 'block'
      bc.style.display = 'block'
    }
  }
  _rotateSelected(target, draw) {
    this._registerEvent('mousedown', (e) => {
      e.stopPropagation()
      this._removeHover()
      this._registerEvent('mousemove', (e) => {
        e.stopPropagation()
        const x = e.movementX
        const y = e.movementY
        if (draw.rotate > 315 || draw.rotate <= 45) {
          draw.setRotate(-x)
        } else if (draw.rotate > 45 && draw.rotate <= 135) {
          draw.setRotate(-y)
        } else if (draw.rotate > 135 && draw.rotate <= 225) {
          draw.setRotate(x)
        } else if (draw.rotate > 225 && draw.rotate <= 315) {
          draw.setRotate(y)
        }
        if (draw.rotate < 0) {
          draw.rotate = 360 - Math.abs(draw.rotate)
        }
        draw.rotate %= 360
        this._setSelectedPosition(draw)
        this._setPostionCursor(draw)
        draw.render(this.canvas.shapesElement)
      }, { uuid: 'rotate' }, target)
    }, { uuid: 'rotate' }, target)
    this._registerEvent('mouseup', (e) => {
      this._removeEventListener('mousemove', 'rotate')
    }, { uuid: 'rotate' }, target)
    this._registerEvent('mouseleave', (e) => {
      this._setSelectedPointPosition(draw)
      draw.render(this.canvas.shapesElement)
    }, { uuid: 'rotate' }, target)
  }
  _setPostionCursor(draw) {
    const tl = this.canvas.selected.querySelector('div[data-position="t-l"]')
    const tr = this.canvas.selected.querySelector('div[data-position="t-r"]')
    const tc = this.canvas.selected.querySelector('div[data-position="t-c"]')
    const cl = this.canvas.selected.querySelector('div[data-position="c-l"]')
    const cr = this.canvas.selected.querySelector('div[data-position="c-r"]')
    const bl = this.canvas.selected.querySelector('div[data-position="b-l"]')
    const br = this.canvas.selected.querySelector('div[data-position="b-r"]')
    const bc = this.canvas.selected.querySelector('div[data-position="b-c"]')
    if ((draw.rotate <= 25 || draw.rotate > 340) || (draw.rotate >= 160 && draw.rotate < 205)) {
      tl.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACP0lEQVQ4jX2Tv0tbURTHPzdJX+ujRmIXUZIXKIFgtJNkEIvSPyFDFuemOCmOGYqjuHQzbaVDB8eOjnXoUtKMGaTBIVZU5Cn+6CMNpO99u3jtq7Q98IV7uefLOfd7vsdIIhYJwMTu9jHiH5GInRtACPyMIbxB405urISEpJYkRVGkMAxvEUWRoihSLBp3eBhJZaDZarVYXl7m8vKS4eFhRkZGcF2XxcVFKpUKiUQCYwxA0hgT2a8ngC5APp8HYG9vD8dxcF2X0dFRrq6uCMPQkl8bY/7QIwU8Btjf32d6ehrf9/F9n2q1Sq1Ww3EcS34HvJL0DPgCBLaDhwBBEHB4eMjCwgKZTIbNzU3q9TqdTscW84CvwEfgO/DeijEhSUdHRxobG9P6+rqCIFC1WlU2m9Xq6qoGg4EkqdPpaHd3V0EQWFEfJdfW1n4AL13XpVAokEwmmZmZoVQqcXJyws7ODufn53ieR6/XY2Njg3Q6TbFYBPhsJKWAQRiGSCKVSt0KdHp6ysrKCu12m1KpRDabZXx8nHK5zNzcHMBTO883sVm/lVSQ9EGSms2mlpaWND8/L0Czs7Pqdrs2N2/d9QK4BzjGmBpQByq+73N2dkYul8PzPCYnJ+l2uxwcHPwW1joq5jBXknq9nra3t+V5ngANDQ0pnU6rUChoa2vLdvDcWPLNrJGUAEJJ9Pt9Li4uuL6+pt/vc3x8TC6XY2pqCmAAPLnt4A4a+n98klS0u/DXJbsx2QMgA6SB+8AE8A1o26RfWvKP8ADq6QQAAAAASUVORK5CYII=') 6 6,move`
      br.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACP0lEQVQ4jX2Tv0tbURTHPzdJX+ujRmIXUZIXKIFgtJNkEIvSPyFDFuemOCmOGYqjuHQzbaVDB8eOjnXoUtKMGaTBIVZU5Cn+6CMNpO99u3jtq7Q98IV7uefLOfd7vsdIIhYJwMTu9jHiH5GInRtACPyMIbxB405urISEpJYkRVGkMAxvEUWRoihSLBp3eBhJZaDZarVYXl7m8vKS4eFhRkZGcF2XxcVFKpUKiUQCYwxA0hgT2a8ngC5APp8HYG9vD8dxcF2X0dFRrq6uCMPQkl8bY/7QIwU8Btjf32d6ehrf9/F9n2q1Sq1Ww3EcS34HvJL0DPgCBLaDhwBBEHB4eMjCwgKZTIbNzU3q9TqdTscW84CvwEfgO/DeijEhSUdHRxobG9P6+rqCIFC1WlU2m9Xq6qoGg4EkqdPpaHd3V0EQWFEfJdfW1n4AL13XpVAokEwmmZmZoVQqcXJyws7ODufn53ieR6/XY2Njg3Q6TbFYBPhsJKWAQRiGSCKVSt0KdHp6ysrKCu12m1KpRDabZXx8nHK5zNzcHMBTO883sVm/lVSQ9EGSms2mlpaWND8/L0Czs7Pqdrs2N2/d9QK4BzjGmBpQByq+73N2dkYul8PzPCYnJ+l2uxwcHPwW1joq5jBXknq9nra3t+V5ngANDQ0pnU6rUChoa2vLdvDcWPLNrJGUAEJJ9Pt9Li4uuL6+pt/vc3x8TC6XY2pqCmAAPLnt4A4a+n98klS0u/DXJbsx2QMgA6SB+8AE8A1o26RfWvKP8ADq6QQAAAAASUVORK5CYII=') 6 6,move`
      tr.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACQUlEQVQ4jX2Tv0vbURTFPy+pIuoQCSikJhGa1IB2k6BiowScg4u4Sagtzg5d/QsEEYqUgKWDi9DRLbgUBMmo1iAO9UfESLfGmNbv950ueUGLeuBxH++9e+7h3XuMJJ5BGHgL/AIugDjwGvgOlAGQ9NT6qqfxV1JKEsYpMMa0ykrqBn7f3NxQLBYJh8NEo1FOT085Pj5mYWGBpopMq2IzMdCMWUna2dnRzMyMVlZWND4+rkgkomQyqf39fafkTeBe1XXAb8YLgP7+fpaXl7m8vGR3d5dQKES1WuXs7MylxRxBAFhsKlkEPgLFZDJJV1cX5+fnTE5OMjIywt3dHZFIxBFUXjQ3nwCstfi+T3t7+zsAz/PY2Njg8PCQTCZDLBbj9vaWjo4OR/AHSQFJstZqa2tLhUJB1lqVy2UtLS0pGo1qbm5Oe3t72t7eVjweV6VScX/w8gFBLpdTPp9Xo9FoJc/Pz+vq6kqSdH19rc3NTdXrdUfQiaSgJPm+r+npaeVyOa2trSmVSml2dlYHBwfu8TdJqtfrsta6s8ADgnQ6rYmJCQ0ODmp0dFS1Wk2+77vHSUlf7g3TuhukIOBZaxkeHubo6IhEIsHU1BSJRILe3l7y+TxAwRjzQVIn0ACsa5/cJIZCIcbGxshms1QqFVZXV+np6cHzPID3ktqMMXVjjHVtcKO8DiyWSiUGBgY4OTmhVqsxNDREX18fAMFgEKDNGOM5D/1vptIz5pGkz3rEdC0zNZEGfgKvgG7gB1Bt3nk8gn/ALOqwNW9xuwAAAABJRU5ErkJggg==') 6 6,move`
      bl.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACQUlEQVQ4jX2Tv0vbURTFPy+pIuoQCSikJhGa1IB2k6BiowScg4u4Sagtzg5d/QsEEYqUgKWDi9DRLbgUBMmo1iAO9UfESLfGmNbv950ueUGLeuBxH++9e+7h3XuMJJ5BGHgL/AIugDjwGvgOlAGQ9NT6qqfxV1JKEsYpMMa0ykrqBn7f3NxQLBYJh8NEo1FOT085Pj5mYWGBpopMq2IzMdCMWUna2dnRzMyMVlZWND4+rkgkomQyqf39fafkTeBe1XXAb8YLgP7+fpaXl7m8vGR3d5dQKES1WuXs7MylxRxBAFhsKlkEPgLFZDJJV1cX5+fnTE5OMjIywt3dHZFIxBFUXjQ3nwCstfi+T3t7+zsAz/PY2Njg8PCQTCZDLBbj9vaWjo4OR/AHSQFJstZqa2tLhUJB1lqVy2UtLS0pGo1qbm5Oe3t72t7eVjweV6VScX/w8gFBLpdTPp9Xo9FoJc/Pz+vq6kqSdH19rc3NTdXrdUfQiaSgJPm+r+npaeVyOa2trSmVSml2dlYHBwfu8TdJqtfrsta6s8ADgnQ6rYmJCQ0ODmp0dFS1Wk2+77vHSUlf7g3TuhukIOBZaxkeHubo6IhEIsHU1BSJRILe3l7y+TxAwRjzQVIn0ACsa5/cJIZCIcbGxshms1QqFVZXV+np6cHzPID3ktqMMXVjjHVtcKO8DiyWSiUGBgY4OTmhVqsxNDREX18fAMFgEKDNGOM5D/1vptIz5pGkz3rEdC0zNZEGfgKvgG7gB1Bt3nk8gn/ALOqwNW9xuwAAAABJRU5ErkJggg==') 6 6,move`
      tc.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAYAAAAiYZ4HAAABFElEQVQokXWSMW6DQBBFnwiXcYNcuLWypHVlGrgAlVNR0bGcgIKWK/gMrK+QgpyAW1j6aViyhuRLU+z+92E1M0giqJv2uoVMCF88URSFiqIIQ5dt4Oiduq4FCFBd12Ho6AOxpEmS+r4XIGOMjDEC1Pe9D0ySYiSlkjSOowA1TbMGmqYRoHEcfSiNCXS/38myjDRNAbDWkiQJLwqf5OX/sNEkKY6AJ5AAH8CDvR6LlwDPKDDe/oB3XrzUF3D4B35f6htIIuAMHJxzWGt3tLUW5xzLB88vXWrblnme13NZlgzDgDHmFwq71HXdbnBd1+0Gh6STv62qal2NqqrCtp62y3f1Tp7nyvM8hK/b5fP1uZ3WcrcyP/v/iukOlDsjAAAAAElFTkSuQmCC') 6 6,move`
      bc.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAYAAAAiYZ4HAAABFElEQVQokXWSMW6DQBBFnwiXcYNcuLWypHVlGrgAlVNR0bGcgIKWK/gMrK+QgpyAW1j6aViyhuRLU+z+92E1M0giqJv2uoVMCF88URSFiqIIQ5dt4Oiduq4FCFBd12Ho6AOxpEmS+r4XIGOMjDEC1Pe9D0ySYiSlkjSOowA1TbMGmqYRoHEcfSiNCXS/38myjDRNAbDWkiQJLwqf5OX/sNEkKY6AJ5AAH8CDvR6LlwDPKDDe/oB3XrzUF3D4B35f6htIIuAMHJxzWGt3tLUW5xzLB88vXWrblnme13NZlgzDgDHmFwq71HXdbnBd1+0Gh6STv62qal2NqqrCtp62y3f1Tp7nyvM8hK/b5fP1uZ3WcrcyP/v/iukOlDsjAAAAAElFTkSuQmCC') 6 6,move`
      cl.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAYAAADtc08vAAACVUlEQVQokW2TPUsjURiFn0zGSZDAFonMKhjYwlgJkt1CsNHKxkIE2T9gYeMPsdpy1WZhhWUlEtFOWLCykRUlokXiB9okk4wmKIkOyczZYhONwQMv3Hvee99b3OeEJPGOEkCjXR2FAQEfgOqLK6m7Pkna1Kt+tP1VvdUvSeE3j0vKdrqu66rRaHS23yXJ930FQaBqtdo9aDXcvvwZ+FYqldje3qZcLpNMJolEIgBfJHFzc8PW1hYPDw8MDAxgWRahUOiLIek38BdgZ2eH3d1dGo0G4XCYVqsFQLPZ5Pz8nLOzM46Pjzk4OODx8REAE/h6f3/PxsYGmUyGeDxOrVbj9PSURCKB7/u4rkutViMSibC/v8/d3R3Dw8Mkk0nMp6cnstksKysrFItFpqamuLi4IJfLUSwWCYKAkZERLi8vcRyH6+trCoUC5XKZ5eXl/wPq9TqxWIxoNEq9Xufk5ITn52fi8Tj9/f0cHR0RjUaxbRvHcbi9vSUIAmzbxjQMg3Q6zcLCAoeHh1iWxfj4ODMzM9i2zdXVFaZpYlkWmUyGXC7H3NwcS0tLDA4OYsZiMSYmJrBtm6GhISqVCrOzs4yNjWEYBqOjowDs7e1RKBSYnJxkcXGRdDqNZVmYpmkCkEql8DyPfD6P53kv3wXgeR6maTI/P8/09DSpVKqDz08k9Un6KEmlUkn5fF6O48j3fUlSEATyfV+VSkWu63YA+iMp1k1hnyQ1m80eYl8RbrVaneXmm9R05WC9fWBdkt1hXZIhaa3dW+vJDqGeNPYBzffi2Yau1Wv+AzdlzzwbCNWGAAAAAElFTkSuQmCC') 6 6,move`
      cr.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAYAAADtc08vAAACVUlEQVQokW2TPUsjURiFn0zGSZDAFonMKhjYwlgJkt1CsNHKxkIE2T9gYeMPsdpy1WZhhWUlEtFOWLCykRUlokXiB9okk4wmKIkOyczZYhONwQMv3Hvee99b3OeEJPGOEkCjXR2FAQEfgOqLK6m7Pkna1Kt+tP1VvdUvSeE3j0vKdrqu66rRaHS23yXJ930FQaBqtdo9aDXcvvwZ+FYqldje3qZcLpNMJolEIgBfJHFzc8PW1hYPDw8MDAxgWRahUOiLIek38BdgZ2eH3d1dGo0G4XCYVqsFQLPZ5Pz8nLOzM46Pjzk4OODx8REAE/h6f3/PxsYGmUyGeDxOrVbj9PSURCKB7/u4rkutViMSibC/v8/d3R3Dw8Mkk0nMp6cnstksKysrFItFpqamuLi4IJfLUSwWCYKAkZERLi8vcRyH6+trCoUC5XKZ5eXl/wPq9TqxWIxoNEq9Xufk5ITn52fi8Tj9/f0cHR0RjUaxbRvHcbi9vSUIAmzbxjQMg3Q6zcLCAoeHh1iWxfj4ODMzM9i2zdXVFaZpYlkWmUyGXC7H3NwcS0tLDA4OYsZiMSYmJrBtm6GhISqVCrOzs4yNjWEYBqOjowDs7e1RKBSYnJxkcXGRdDqNZVmYpmkCkEql8DyPfD6P53kv3wXgeR6maTI/P8/09DSpVKqDz08k9Un6KEmlUkn5fF6O48j3fUlSEATyfV+VSkWu63YA+iMp1k1hnyQ1m80eYl8RbrVaneXmm9R05WC9fWBdkt1hXZIhaa3dW+vJDqGeNPYBzffi2Yau1Wv+AzdlzzwbCNWGAAAAAElFTkSuQmCC') 6 6,move`
    } else if ((draw.rotate > 25 && draw.rotate < 70) || (draw.rotate >= 205 && draw.rotate < 250)) {
      tl.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAYAAAAiYZ4HAAABFElEQVQokXWSMW6DQBBFnwiXcYNcuLWypHVlGrgAlVNR0bGcgIKWK/gMrK+QgpyAW1j6aViyhuRLU+z+92E1M0giqJv2uoVMCF88URSFiqIIQ5dt4Oiduq4FCFBd12Ho6AOxpEmS+r4XIGOMjDEC1Pe9D0ySYiSlkjSOowA1TbMGmqYRoHEcfSiNCXS/38myjDRNAbDWkiQJLwqf5OX/sNEkKY6AJ5AAH8CDvR6LlwDPKDDe/oB3XrzUF3D4B35f6htIIuAMHJxzWGt3tLUW5xzLB88vXWrblnme13NZlgzDgDHmFwq71HXdbnBd1+0Gh6STv62qal2NqqrCtp62y3f1Tp7nyvM8hK/b5fP1uZ3WcrcyP/v/iukOlDsjAAAAAElFTkSuQmCC') 6 6,move`
      br.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAYAAAAiYZ4HAAABFElEQVQokXWSMW6DQBBFnwiXcYNcuLWypHVlGrgAlVNR0bGcgIKWK/gMrK+QgpyAW1j6aViyhuRLU+z+92E1M0giqJv2uoVMCF88URSFiqIIQ5dt4Oiduq4FCFBd12Ho6AOxpEmS+r4XIGOMjDEC1Pe9D0ySYiSlkjSOowA1TbMGmqYRoHEcfSiNCXS/38myjDRNAbDWkiQJLwqf5OX/sNEkKY6AJ5AAH8CDvR6LlwDPKDDe/oB3XrzUF3D4B35f6htIIuAMHJxzWGt3tLUW5xzLB88vXWrblnme13NZlgzDgDHmFwq71HXdbnBd1+0Gh6STv62qal2NqqrCtp62y3f1Tp7nyvM8hK/b5fP1uZ3WcrcyP/v/iukOlDsjAAAAAElFTkSuQmCC') 6 6,move`
      tr.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAYAAADtc08vAAACVUlEQVQokW2TPUsjURiFn0zGSZDAFonMKhjYwlgJkt1CsNHKxkIE2T9gYeMPsdpy1WZhhWUlEtFOWLCykRUlokXiB9okk4wmKIkOyczZYhONwQMv3Hvee99b3OeEJPGOEkCjXR2FAQEfgOqLK6m7Pkna1Kt+tP1VvdUvSeE3j0vKdrqu66rRaHS23yXJ930FQaBqtdo9aDXcvvwZ+FYqldje3qZcLpNMJolEIgBfJHFzc8PW1hYPDw8MDAxgWRahUOiLIek38BdgZ2eH3d1dGo0G4XCYVqsFQLPZ5Pz8nLOzM46Pjzk4OODx8REAE/h6f3/PxsYGmUyGeDxOrVbj9PSURCKB7/u4rkutViMSibC/v8/d3R3Dw8Mkk0nMp6cnstksKysrFItFpqamuLi4IJfLUSwWCYKAkZERLi8vcRyH6+trCoUC5XKZ5eXl/wPq9TqxWIxoNEq9Xufk5ITn52fi8Tj9/f0cHR0RjUaxbRvHcbi9vSUIAmzbxjQMg3Q6zcLCAoeHh1iWxfj4ODMzM9i2zdXVFaZpYlkWmUyGXC7H3NwcS0tLDA4OYsZiMSYmJrBtm6GhISqVCrOzs4yNjWEYBqOjowDs7e1RKBSYnJxkcXGRdDqNZVmYpmkCkEql8DyPfD6P53kv3wXgeR6maTI/P8/09DSpVKqDz08k9Un6KEmlUkn5fF6O48j3fUlSEATyfV+VSkWu63YA+iMp1k1hnyQ1m80eYl8RbrVaneXmm9R05WC9fWBdkt1hXZIhaa3dW+vJDqGeNPYBzffi2Yau1Wv+AzdlzzwbCNWGAAAAAElFTkSuQmCC') 6 6,move`
      bl.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAYAAADtc08vAAACVUlEQVQokW2TPUsjURiFn0zGSZDAFonMKhjYwlgJkt1CsNHKxkIE2T9gYeMPsdpy1WZhhWUlEtFOWLCykRUlokXiB9okk4wmKIkOyczZYhONwQMv3Hvee99b3OeEJPGOEkCjXR2FAQEfgOqLK6m7Pkna1Kt+tP1VvdUvSeE3j0vKdrqu66rRaHS23yXJ930FQaBqtdo9aDXcvvwZ+FYqldje3qZcLpNMJolEIgBfJHFzc8PW1hYPDw8MDAxgWRahUOiLIek38BdgZ2eH3d1dGo0G4XCYVqsFQLPZ5Pz8nLOzM46Pjzk4OODx8REAE/h6f3/PxsYGmUyGeDxOrVbj9PSURCKB7/u4rkutViMSibC/v8/d3R3Dw8Mkk0nMp6cnstksKysrFItFpqamuLi4IJfLUSwWCYKAkZERLi8vcRyH6+trCoUC5XKZ5eXl/wPq9TqxWIxoNEq9Xufk5ITn52fi8Tj9/f0cHR0RjUaxbRvHcbi9vSUIAmzbxjQMg3Q6zcLCAoeHh1iWxfj4ODMzM9i2zdXVFaZpYlkWmUyGXC7H3NwcS0tLDA4OYsZiMSYmJrBtm6GhISqVCrOzs4yNjWEYBqOjowDs7e1RKBSYnJxkcXGRdDqNZVmYpmkCkEql8DyPfD6P53kv3wXgeR6maTI/P8/09DSpVKqDz08k9Un6KEmlUkn5fF6O48j3fUlSEATyfV+VSkWu63YA+iMp1k1hnyQ1m80eYl8RbrVaneXmm9R05WC9fWBdkt1hXZIhaa3dW+vJDqGeNPYBzffi2Yau1Wv+AzdlzzwbCNWGAAAAAElFTkSuQmCC') 6 6,move`
      tc.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACQUlEQVQ4jX2Tv0vbURTFPy+pIuoQCSikJhGa1IB2k6BiowScg4u4Sagtzg5d/QsEEYqUgKWDi9DRLbgUBMmo1iAO9UfESLfGmNbv950ueUGLeuBxH++9e+7h3XuMJJ5BGHgL/AIugDjwGvgOlAGQ9NT6qqfxV1JKEsYpMMa0ykrqBn7f3NxQLBYJh8NEo1FOT085Pj5mYWGBpopMq2IzMdCMWUna2dnRzMyMVlZWND4+rkgkomQyqf39fafkTeBe1XXAb8YLgP7+fpaXl7m8vGR3d5dQKES1WuXs7MylxRxBAFhsKlkEPgLFZDJJV1cX5+fnTE5OMjIywt3dHZFIxBFUXjQ3nwCstfi+T3t7+zsAz/PY2Njg8PCQTCZDLBbj9vaWjo4OR/AHSQFJstZqa2tLhUJB1lqVy2UtLS0pGo1qbm5Oe3t72t7eVjweV6VScX/w8gFBLpdTPp9Xo9FoJc/Pz+vq6kqSdH19rc3NTdXrdUfQiaSgJPm+r+npaeVyOa2trSmVSml2dlYHBwfu8TdJqtfrsta6s8ADgnQ6rYmJCQ0ODmp0dFS1Wk2+77vHSUlf7g3TuhukIOBZaxkeHubo6IhEIsHU1BSJRILe3l7y+TxAwRjzQVIn0ACsa5/cJIZCIcbGxshms1QqFVZXV+np6cHzPID3ktqMMXVjjHVtcKO8DiyWSiUGBgY4OTmhVqsxNDREX18fAMFgEKDNGOM5D/1vptIz5pGkz3rEdC0zNZEGfgKvgG7gB1Bt3nk8gn/ALOqwNW9xuwAAAABJRU5ErkJggg==') 6 6,move`
      bc.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACQUlEQVQ4jX2Tv0vbURTFPy+pIuoQCSikJhGa1IB2k6BiowScg4u4Sagtzg5d/QsEEYqUgKWDi9DRLbgUBMmo1iAO9UfESLfGmNbv950ueUGLeuBxH++9e+7h3XuMJJ5BGHgL/AIugDjwGvgOlAGQ9NT6qqfxV1JKEsYpMMa0ykrqBn7f3NxQLBYJh8NEo1FOT085Pj5mYWGBpopMq2IzMdCMWUna2dnRzMyMVlZWND4+rkgkomQyqf39fafkTeBe1XXAb8YLgP7+fpaXl7m8vGR3d5dQKES1WuXs7MylxRxBAFhsKlkEPgLFZDJJV1cX5+fnTE5OMjIywt3dHZFIxBFUXjQ3nwCstfi+T3t7+zsAz/PY2Njg8PCQTCZDLBbj9vaWjo4OR/AHSQFJstZqa2tLhUJB1lqVy2UtLS0pGo1qbm5Oe3t72t7eVjweV6VScX/w8gFBLpdTPp9Xo9FoJc/Pz+vq6kqSdH19rc3NTdXrdUfQiaSgJPm+r+npaeVyOa2trSmVSml2dlYHBwfu8TdJqtfrsta6s8ADgnQ6rYmJCQ0ODmp0dFS1Wk2+77vHSUlf7g3TuhukIOBZaxkeHubo6IhEIsHU1BSJRILe3l7y+TxAwRjzQVIn0ACsa5/cJIZCIcbGxshms1QqFVZXV+np6cHzPID3ktqMMXVjjHVtcKO8DiyWSiUGBgY4OTmhVqsxNDREX18fAMFgEKDNGOM5D/1vptIz5pGkz3rEdC0zNZEGfgKvgG7gB1Bt3nk8gn/ALOqwNW9xuwAAAABJRU5ErkJggg==') 6 6,move`
      cl.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACP0lEQVQ4jX2Tv0tbURTHPzdJX+ujRmIXUZIXKIFgtJNkEIvSPyFDFuemOCmOGYqjuHQzbaVDB8eOjnXoUtKMGaTBIVZU5Cn+6CMNpO99u3jtq7Q98IV7uefLOfd7vsdIIhYJwMTu9jHiH5GInRtACPyMIbxB405urISEpJYkRVGkMAxvEUWRoihSLBp3eBhJZaDZarVYXl7m8vKS4eFhRkZGcF2XxcVFKpUKiUQCYwxA0hgT2a8ngC5APp8HYG9vD8dxcF2X0dFRrq6uCMPQkl8bY/7QIwU8Btjf32d6ehrf9/F9n2q1Sq1Ww3EcS34HvJL0DPgCBLaDhwBBEHB4eMjCwgKZTIbNzU3q9TqdTscW84CvwEfgO/DeijEhSUdHRxobG9P6+rqCIFC1WlU2m9Xq6qoGg4EkqdPpaHd3V0EQWFEfJdfW1n4AL13XpVAokEwmmZmZoVQqcXJyws7ODufn53ieR6/XY2Njg3Q6TbFYBPhsJKWAQRiGSCKVSt0KdHp6ysrKCu12m1KpRDabZXx8nHK5zNzcHMBTO883sVm/lVSQ9EGSms2mlpaWND8/L0Czs7Pqdrs2N2/d9QK4BzjGmBpQByq+73N2dkYul8PzPCYnJ+l2uxwcHPwW1joq5jBXknq9nra3t+V5ngANDQ0pnU6rUChoa2vLdvDcWPLNrJGUAEJJ9Pt9Li4uuL6+pt/vc3x8TC6XY2pqCmAAPLnt4A4a+n98klS0u/DXJbsx2QMgA6SB+8AE8A1o26RfWvKP8ADq6QQAAAAASUVORK5CYII=') 6 6,move`
      cr.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACP0lEQVQ4jX2Tv0tbURTHPzdJX+ujRmIXUZIXKIFgtJNkEIvSPyFDFuemOCmOGYqjuHQzbaVDB8eOjnXoUtKMGaTBIVZU5Cn+6CMNpO99u3jtq7Q98IV7uefLOfd7vsdIIhYJwMTu9jHiH5GInRtACPyMIbxB405urISEpJYkRVGkMAxvEUWRoihSLBp3eBhJZaDZarVYXl7m8vKS4eFhRkZGcF2XxcVFKpUKiUQCYwxA0hgT2a8ngC5APp8HYG9vD8dxcF2X0dFRrq6uCMPQkl8bY/7QIwU8Btjf32d6ehrf9/F9n2q1Sq1Ww3EcS34HvJL0DPgCBLaDhwBBEHB4eMjCwgKZTIbNzU3q9TqdTscW84CvwEfgO/DeijEhSUdHRxobG9P6+rqCIFC1WlU2m9Xq6qoGg4EkqdPpaHd3V0EQWFEfJdfW1n4AL13XpVAokEwmmZmZoVQqcXJyws7ODufn53ieR6/XY2Njg3Q6TbFYBPhsJKWAQRiGSCKVSt0KdHp6ysrKCu12m1KpRDabZXx8nHK5zNzcHMBTO883sVm/lVSQ9EGSms2mlpaWND8/L0Czs7Pqdrs2N2/d9QK4BzjGmBpQByq+73N2dkYul8PzPCYnJ+l2uxwcHPwW1joq5jBXknq9nra3t+V5ngANDQ0pnU6rUChoa2vLdvDcWPLNrJGUAEJJ9Pt9Li4uuL6+pt/vc3x8TC6XY2pqCmAAPLnt4A4a+n98klS0u/DXJbsx2QMgA6SB+8AE8A1o26RfWvKP8ADq6QQAAAAASUVORK5CYII=') 6 6,move`
    } else if ((draw.rotate >= 70 && draw.rotate < 115) || (draw.rotate >= 250 && draw.rotate < 295)) {
      tl.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACQUlEQVQ4jX2Tv0vbURTFPy+pIuoQCSikJhGa1IB2k6BiowScg4u4Sagtzg5d/QsEEYqUgKWDi9DRLbgUBMmo1iAO9UfESLfGmNbv950ueUGLeuBxH++9e+7h3XuMJJ5BGHgL/AIugDjwGvgOlAGQ9NT6qqfxV1JKEsYpMMa0ykrqBn7f3NxQLBYJh8NEo1FOT085Pj5mYWGBpopMq2IzMdCMWUna2dnRzMyMVlZWND4+rkgkomQyqf39fafkTeBe1XXAb8YLgP7+fpaXl7m8vGR3d5dQKES1WuXs7MylxRxBAFhsKlkEPgLFZDJJV1cX5+fnTE5OMjIywt3dHZFIxBFUXjQ3nwCstfi+T3t7+zsAz/PY2Njg8PCQTCZDLBbj9vaWjo4OR/AHSQFJstZqa2tLhUJB1lqVy2UtLS0pGo1qbm5Oe3t72t7eVjweV6VScX/w8gFBLpdTPp9Xo9FoJc/Pz+vq6kqSdH19rc3NTdXrdUfQiaSgJPm+r+npaeVyOa2trSmVSml2dlYHBwfu8TdJqtfrsta6s8ADgnQ6rYmJCQ0ODmp0dFS1Wk2+77vHSUlf7g3TuhukIOBZaxkeHubo6IhEIsHU1BSJRILe3l7y+TxAwRjzQVIn0ACsa5/cJIZCIcbGxshms1QqFVZXV+np6cHzPID3ktqMMXVjjHVtcKO8DiyWSiUGBgY4OTmhVqsxNDREX18fAMFgEKDNGOM5D/1vptIz5pGkz3rEdC0zNZEGfgKvgG7gB1Bt3nk8gn/ALOqwNW9xuwAAAABJRU5ErkJggg==') 6 6,move`
      br.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACQUlEQVQ4jX2Tv0vbURTFPy+pIuoQCSikJhGa1IB2k6BiowScg4u4Sagtzg5d/QsEEYqUgKWDi9DRLbgUBMmo1iAO9UfESLfGmNbv950ueUGLeuBxH++9e+7h3XuMJJ5BGHgL/AIugDjwGvgOlAGQ9NT6qqfxV1JKEsYpMMa0ykrqBn7f3NxQLBYJh8NEo1FOT085Pj5mYWGBpopMq2IzMdCMWUna2dnRzMyMVlZWND4+rkgkomQyqf39fafkTeBe1XXAb8YLgP7+fpaXl7m8vGR3d5dQKES1WuXs7MylxRxBAFhsKlkEPgLFZDJJV1cX5+fnTE5OMjIywt3dHZFIxBFUXjQ3nwCstfi+T3t7+zsAz/PY2Njg8PCQTCZDLBbj9vaWjo4OR/AHSQFJstZqa2tLhUJB1lqVy2UtLS0pGo1qbm5Oe3t72t7eVjweV6VScX/w8gFBLpdTPp9Xo9FoJc/Pz+vq6kqSdH19rc3NTdXrdUfQiaSgJPm+r+npaeVyOa2trSmVSml2dlYHBwfu8TdJqtfrsta6s8ADgnQ6rYmJCQ0ODmp0dFS1Wk2+77vHSUlf7g3TuhukIOBZaxkeHubo6IhEIsHU1BSJRILe3l7y+TxAwRjzQVIn0ACsa5/cJIZCIcbGxshms1QqFVZXV+np6cHzPID3ktqMMXVjjHVtcKO8DiyWSiUGBgY4OTmhVqsxNDREX18fAMFgEKDNGOM5D/1vptIz5pGkz3rEdC0zNZEGfgKvgG7gB1Bt3nk8gn/ALOqwNW9xuwAAAABJRU5ErkJggg==') 6 6,move`
      tr.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACP0lEQVQ4jX2Tv0tbURTHPzdJX+ujRmIXUZIXKIFgtJNkEIvSPyFDFuemOCmOGYqjuHQzbaVDB8eOjnXoUtKMGaTBIVZU5Cn+6CMNpO99u3jtq7Q98IV7uefLOfd7vsdIIhYJwMTu9jHiH5GInRtACPyMIbxB405urISEpJYkRVGkMAxvEUWRoihSLBp3eBhJZaDZarVYXl7m8vKS4eFhRkZGcF2XxcVFKpUKiUQCYwxA0hgT2a8ngC5APp8HYG9vD8dxcF2X0dFRrq6uCMPQkl8bY/7QIwU8Btjf32d6ehrf9/F9n2q1Sq1Ww3EcS34HvJL0DPgCBLaDhwBBEHB4eMjCwgKZTIbNzU3q9TqdTscW84CvwEfgO/DeijEhSUdHRxobG9P6+rqCIFC1WlU2m9Xq6qoGg4EkqdPpaHd3V0EQWFEfJdfW1n4AL13XpVAokEwmmZmZoVQqcXJyws7ODufn53ieR6/XY2Njg3Q6TbFYBPhsJKWAQRiGSCKVSt0KdHp6ysrKCu12m1KpRDabZXx8nHK5zNzcHMBTO883sVm/lVSQ9EGSms2mlpaWND8/L0Czs7Pqdrs2N2/d9QK4BzjGmBpQByq+73N2dkYul8PzPCYnJ+l2uxwcHPwW1joq5jBXknq9nra3t+V5ngANDQ0pnU6rUChoa2vLdvDcWPLNrJGUAEJJ9Pt9Li4uuL6+pt/vc3x8TC6XY2pqCmAAPLnt4A4a+n98klS0u/DXJbsx2QMgA6SB+8AE8A1o26RfWvKP8ADq6QQAAAAASUVORK5CYII=') 6 6,move`
      bl.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACP0lEQVQ4jX2Tv0tbURTHPzdJX+ujRmIXUZIXKIFgtJNkEIvSPyFDFuemOCmOGYqjuHQzbaVDB8eOjnXoUtKMGaTBIVZU5Cn+6CMNpO99u3jtq7Q98IV7uefLOfd7vsdIIhYJwMTu9jHiH5GInRtACPyMIbxB405urISEpJYkRVGkMAxvEUWRoihSLBp3eBhJZaDZarVYXl7m8vKS4eFhRkZGcF2XxcVFKpUKiUQCYwxA0hgT2a8ngC5APp8HYG9vD8dxcF2X0dFRrq6uCMPQkl8bY/7QIwU8Btjf32d6ehrf9/F9n2q1Sq1Ww3EcS34HvJL0DPgCBLaDhwBBEHB4eMjCwgKZTIbNzU3q9TqdTscW84CvwEfgO/DeijEhSUdHRxobG9P6+rqCIFC1WlU2m9Xq6qoGg4EkqdPpaHd3V0EQWFEfJdfW1n4AL13XpVAokEwmmZmZoVQqcXJyws7ODufn53ieR6/XY2Njg3Q6TbFYBPhsJKWAQRiGSCKVSt0KdHp6ysrKCu12m1KpRDabZXx8nHK5zNzcHMBTO883sVm/lVSQ9EGSms2mlpaWND8/L0Czs7Pqdrs2N2/d9QK4BzjGmBpQByq+73N2dkYul8PzPCYnJ+l2uxwcHPwW1joq5jBXknq9nra3t+V5ngANDQ0pnU6rUChoa2vLdvDcWPLNrJGUAEJJ9Pt9Li4uuL6+pt/vc3x8TC6XY2pqCmAAPLnt4A4a+n98klS0u/DXJbsx2QMgA6SB+8AE8A1o26RfWvKP8ADq6QQAAAAASUVORK5CYII=') 6 6,move`
      tc.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAYAAADtc08vAAACVUlEQVQokW2TPUsjURiFn0zGSZDAFonMKhjYwlgJkt1CsNHKxkIE2T9gYeMPsdpy1WZhhWUlEtFOWLCykRUlokXiB9okk4wmKIkOyczZYhONwQMv3Hvee99b3OeEJPGOEkCjXR2FAQEfgOqLK6m7Pkna1Kt+tP1VvdUvSeE3j0vKdrqu66rRaHS23yXJ930FQaBqtdo9aDXcvvwZ+FYqldje3qZcLpNMJolEIgBfJHFzc8PW1hYPDw8MDAxgWRahUOiLIek38BdgZ2eH3d1dGo0G4XCYVqsFQLPZ5Pz8nLOzM46Pjzk4OODx8REAE/h6f3/PxsYGmUyGeDxOrVbj9PSURCKB7/u4rkutViMSibC/v8/d3R3Dw8Mkk0nMp6cnstksKysrFItFpqamuLi4IJfLUSwWCYKAkZERLi8vcRyH6+trCoUC5XKZ5eXl/wPq9TqxWIxoNEq9Xufk5ITn52fi8Tj9/f0cHR0RjUaxbRvHcbi9vSUIAmzbxjQMg3Q6zcLCAoeHh1iWxfj4ODMzM9i2zdXVFaZpYlkWmUyGXC7H3NwcS0tLDA4OYsZiMSYmJrBtm6GhISqVCrOzs4yNjWEYBqOjowDs7e1RKBSYnJxkcXGRdDqNZVmYpmkCkEql8DyPfD6P53kv3wXgeR6maTI/P8/09DSpVKqDz08k9Un6KEmlUkn5fF6O48j3fUlSEATyfV+VSkWu63YA+iMp1k1hnyQ1m80eYl8RbrVaneXmm9R05WC9fWBdkt1hXZIhaa3dW+vJDqGeNPYBzffi2Yau1Wv+AzdlzzwbCNWGAAAAAElFTkSuQmCC') 6 6,move`
      bc.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAYAAADtc08vAAACVUlEQVQokW2TPUsjURiFn0zGSZDAFonMKhjYwlgJkt1CsNHKxkIE2T9gYeMPsdpy1WZhhWUlEtFOWLCykRUlokXiB9okk4wmKIkOyczZYhONwQMv3Hvee99b3OeEJPGOEkCjXR2FAQEfgOqLK6m7Pkna1Kt+tP1VvdUvSeE3j0vKdrqu66rRaHS23yXJ930FQaBqtdo9aDXcvvwZ+FYqldje3qZcLpNMJolEIgBfJHFzc8PW1hYPDw8MDAxgWRahUOiLIek38BdgZ2eH3d1dGo0G4XCYVqsFQLPZ5Pz8nLOzM46Pjzk4OODx8REAE/h6f3/PxsYGmUyGeDxOrVbj9PSURCKB7/u4rkutViMSibC/v8/d3R3Dw8Mkk0nMp6cnstksKysrFItFpqamuLi4IJfLUSwWCYKAkZERLi8vcRyH6+trCoUC5XKZ5eXl/wPq9TqxWIxoNEq9Xufk5ITn52fi8Tj9/f0cHR0RjUaxbRvHcbi9vSUIAmzbxjQMg3Q6zcLCAoeHh1iWxfj4ODMzM9i2zdXVFaZpYlkWmUyGXC7H3NwcS0tLDA4OYsZiMSYmJrBtm6GhISqVCrOzs4yNjWEYBqOjowDs7e1RKBSYnJxkcXGRdDqNZVmYpmkCkEql8DyPfD6P53kv3wXgeR6maTI/P8/09DSpVKqDz08k9Un6KEmlUkn5fF6O48j3fUlSEATyfV+VSkWu63YA+iMp1k1hnyQ1m80eYl8RbrVaneXmm9R05WC9fWBdkt1hXZIhaa3dW+vJDqGeNPYBzffi2Yau1Wv+AzdlzzwbCNWGAAAAAElFTkSuQmCC') 6 6,move`
      cl.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAYAAAAiYZ4HAAABFElEQVQokXWSMW6DQBBFnwiXcYNcuLWypHVlGrgAlVNR0bGcgIKWK/gMrK+QgpyAW1j6aViyhuRLU+z+92E1M0giqJv2uoVMCF88URSFiqIIQ5dt4Oiduq4FCFBd12Ho6AOxpEmS+r4XIGOMjDEC1Pe9D0ySYiSlkjSOowA1TbMGmqYRoHEcfSiNCXS/38myjDRNAbDWkiQJLwqf5OX/sNEkKY6AJ5AAH8CDvR6LlwDPKDDe/oB3XrzUF3D4B35f6htIIuAMHJxzWGt3tLUW5xzLB88vXWrblnme13NZlgzDgDHmFwq71HXdbnBd1+0Gh6STv62qal2NqqrCtp62y3f1Tp7nyvM8hK/b5fP1uZ3WcrcyP/v/iukOlDsjAAAAAElFTkSuQmCC') 6 6,move`
      cr.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAYAAAAiYZ4HAAABFElEQVQokXWSMW6DQBBFnwiXcYNcuLWypHVlGrgAlVNR0bGcgIKWK/gMrK+QgpyAW1j6aViyhuRLU+z+92E1M0giqJv2uoVMCF88URSFiqIIQ5dt4Oiduq4FCFBd12Ho6AOxpEmS+r4XIGOMjDEC1Pe9D0ySYiSlkjSOowA1TbMGmqYRoHEcfSiNCXS/38myjDRNAbDWkiQJLwqf5OX/sNEkKY6AJ5AAH8CDvR6LlwDPKDDe/oB3XrzUF3D4B35f6htIIuAMHJxzWGt3tLUW5xzLB88vXWrblnme13NZlgzDgDHmFwq71HXdbnBd1+0Gh6STv62qal2NqqrCtp62y3f1Tp7nyvM8hK/b5fP1uZ3WcrcyP/v/iukOlDsjAAAAAElFTkSuQmCC') 6 6,move`
    } else if ((draw.rotate >= 115 && draw.rotate < 160) || (draw.rotate >= 295 && draw.rotate < 340)) {
      tl.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAYAAADtc08vAAACVUlEQVQokW2TPUsjURiFn0zGSZDAFonMKhjYwlgJkt1CsNHKxkIE2T9gYeMPsdpy1WZhhWUlEtFOWLCykRUlokXiB9okk4wmKIkOyczZYhONwQMv3Hvee99b3OeEJPGOEkCjXR2FAQEfgOqLK6m7Pkna1Kt+tP1VvdUvSeE3j0vKdrqu66rRaHS23yXJ930FQaBqtdo9aDXcvvwZ+FYqldje3qZcLpNMJolEIgBfJHFzc8PW1hYPDw8MDAxgWRahUOiLIek38BdgZ2eH3d1dGo0G4XCYVqsFQLPZ5Pz8nLOzM46Pjzk4OODx8REAE/h6f3/PxsYGmUyGeDxOrVbj9PSURCKB7/u4rkutViMSibC/v8/d3R3Dw8Mkk0nMp6cnstksKysrFItFpqamuLi4IJfLUSwWCYKAkZERLi8vcRyH6+trCoUC5XKZ5eXl/wPq9TqxWIxoNEq9Xufk5ITn52fi8Tj9/f0cHR0RjUaxbRvHcbi9vSUIAmzbxjQMg3Q6zcLCAoeHh1iWxfj4ODMzM9i2zdXVFaZpYlkWmUyGXC7H3NwcS0tLDA4OYsZiMSYmJrBtm6GhISqVCrOzs4yNjWEYBqOjowDs7e1RKBSYnJxkcXGRdDqNZVmYpmkCkEql8DyPfD6P53kv3wXgeR6maTI/P8/09DSpVKqDz08k9Un6KEmlUkn5fF6O48j3fUlSEATyfV+VSkWu63YA+iMp1k1hnyQ1m80eYl8RbrVaneXmm9R05WC9fWBdkt1hXZIhaa3dW+vJDqGeNPYBzffi2Yau1Wv+AzdlzzwbCNWGAAAAAElFTkSuQmCC') 6 6,move`
      br.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAYAAADtc08vAAACVUlEQVQokW2TPUsjURiFn0zGSZDAFonMKhjYwlgJkt1CsNHKxkIE2T9gYeMPsdpy1WZhhWUlEtFOWLCykRUlokXiB9okk4wmKIkOyczZYhONwQMv3Hvee99b3OeEJPGOEkCjXR2FAQEfgOqLK6m7Pkna1Kt+tP1VvdUvSeE3j0vKdrqu66rRaHS23yXJ930FQaBqtdo9aDXcvvwZ+FYqldje3qZcLpNMJolEIgBfJHFzc8PW1hYPDw8MDAxgWRahUOiLIek38BdgZ2eH3d1dGo0G4XCYVqsFQLPZ5Pz8nLOzM46Pjzk4OODx8REAE/h6f3/PxsYGmUyGeDxOrVbj9PSURCKB7/u4rkutViMSibC/v8/d3R3Dw8Mkk0nMp6cnstksKysrFItFpqamuLi4IJfLUSwWCYKAkZERLi8vcRyH6+trCoUC5XKZ5eXl/wPq9TqxWIxoNEq9Xufk5ITn52fi8Tj9/f0cHR0RjUaxbRvHcbi9vSUIAmzbxjQMg3Q6zcLCAoeHh1iWxfj4ODMzM9i2zdXVFaZpYlkWmUyGXC7H3NwcS0tLDA4OYsZiMSYmJrBtm6GhISqVCrOzs4yNjWEYBqOjowDs7e1RKBSYnJxkcXGRdDqNZVmYpmkCkEql8DyPfD6P53kv3wXgeR6maTI/P8/09DSpVKqDz08k9Un6KEmlUkn5fF6O48j3fUlSEATyfV+VSkWu63YA+iMp1k1hnyQ1m80eYl8RbrVaneXmm9R05WC9fWBdkt1hXZIhaa3dW+vJDqGeNPYBzffi2Yau1Wv+AzdlzzwbCNWGAAAAAElFTkSuQmCC') 6 6,move`
      tr.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAYAAAAiYZ4HAAABFElEQVQokXWSMW6DQBBFnwiXcYNcuLWypHVlGrgAlVNR0bGcgIKWK/gMrK+QgpyAW1j6aViyhuRLU+z+92E1M0giqJv2uoVMCF88URSFiqIIQ5dt4Oiduq4FCFBd12Ho6AOxpEmS+r4XIGOMjDEC1Pe9D0ySYiSlkjSOowA1TbMGmqYRoHEcfSiNCXS/38myjDRNAbDWkiQJLwqf5OX/sNEkKY6AJ5AAH8CDvR6LlwDPKDDe/oB3XrzUF3D4B35f6htIIuAMHJxzWGt3tLUW5xzLB88vXWrblnme13NZlgzDgDHmFwq71HXdbnBd1+0Gh6STv62qal2NqqrCtp62y3f1Tp7nyvM8hK/b5fP1uZ3WcrcyP/v/iukOlDsjAAAAAElFTkSuQmCC') 6 6,move`
      bl.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAYAAAAiYZ4HAAABFElEQVQokXWSMW6DQBBFnwiXcYNcuLWypHVlGrgAlVNR0bGcgIKWK/gMrK+QgpyAW1j6aViyhuRLU+z+92E1M0giqJv2uoVMCF88URSFiqIIQ5dt4Oiduq4FCFBd12Ho6AOxpEmS+r4XIGOMjDEC1Pe9D0ySYiSlkjSOowA1TbMGmqYRoHEcfSiNCXS/38myjDRNAbDWkiQJLwqf5OX/sNEkKY6AJ5AAH8CDvR6LlwDPKDDe/oB3XrzUF3D4B35f6htIIuAMHJxzWGt3tLUW5xzLB88vXWrblnme13NZlgzDgDHmFwq71HXdbnBd1+0Gh6STv62qal2NqqrCtp62y3f1Tp7nyvM8hK/b5fP1uZ3WcrcyP/v/iukOlDsjAAAAAElFTkSuQmCC') 6 6,move`
      tc.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACP0lEQVQ4jX2Tv0tbURTHPzdJX+ujRmIXUZIXKIFgtJNkEIvSPyFDFuemOCmOGYqjuHQzbaVDB8eOjnXoUtKMGaTBIVZU5Cn+6CMNpO99u3jtq7Q98IV7uefLOfd7vsdIIhYJwMTu9jHiH5GInRtACPyMIbxB405urISEpJYkRVGkMAxvEUWRoihSLBp3eBhJZaDZarVYXl7m8vKS4eFhRkZGcF2XxcVFKpUKiUQCYwxA0hgT2a8ngC5APp8HYG9vD8dxcF2X0dFRrq6uCMPQkl8bY/7QIwU8Btjf32d6ehrf9/F9n2q1Sq1Ww3EcS34HvJL0DPgCBLaDhwBBEHB4eMjCwgKZTIbNzU3q9TqdTscW84CvwEfgO/DeijEhSUdHRxobG9P6+rqCIFC1WlU2m9Xq6qoGg4EkqdPpaHd3V0EQWFEfJdfW1n4AL13XpVAokEwmmZmZoVQqcXJyws7ODufn53ieR6/XY2Njg3Q6TbFYBPhsJKWAQRiGSCKVSt0KdHp6ysrKCu12m1KpRDabZXx8nHK5zNzcHMBTO883sVm/lVSQ9EGSms2mlpaWND8/L0Czs7Pqdrs2N2/d9QK4BzjGmBpQByq+73N2dkYul8PzPCYnJ+l2uxwcHPwW1joq5jBXknq9nra3t+V5ngANDQ0pnU6rUChoa2vLdvDcWPLNrJGUAEJJ9Pt9Li4uuL6+pt/vc3x8TC6XY2pqCmAAPLnt4A4a+n98klS0u/DXJbsx2QMgA6SB+8AE8A1o26RfWvKP8ADq6QQAAAAASUVORK5CYII=') 6 6,move`
      bc.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACP0lEQVQ4jX2Tv0tbURTHPzdJX+ujRmIXUZIXKIFgtJNkEIvSPyFDFuemOCmOGYqjuHQzbaVDB8eOjnXoUtKMGaTBIVZU5Cn+6CMNpO99u3jtq7Q98IV7uefLOfd7vsdIIhYJwMTu9jHiH5GInRtACPyMIbxB405urISEpJYkRVGkMAxvEUWRoihSLBp3eBhJZaDZarVYXl7m8vKS4eFhRkZGcF2XxcVFKpUKiUQCYwxA0hgT2a8ngC5APp8HYG9vD8dxcF2X0dFRrq6uCMPQkl8bY/7QIwU8Btjf32d6ehrf9/F9n2q1Sq1Ww3EcS34HvJL0DPgCBLaDhwBBEHB4eMjCwgKZTIbNzU3q9TqdTscW84CvwEfgO/DeijEhSUdHRxobG9P6+rqCIFC1WlU2m9Xq6qoGg4EkqdPpaHd3V0EQWFEfJdfW1n4AL13XpVAokEwmmZmZoVQqcXJyws7ODufn53ieR6/XY2Njg3Q6TbFYBPhsJKWAQRiGSCKVSt0KdHp6ysrKCu12m1KpRDabZXx8nHK5zNzcHMBTO883sVm/lVSQ9EGSms2mlpaWND8/L0Czs7Pqdrs2N2/d9QK4BzjGmBpQByq+73N2dkYul8PzPCYnJ+l2uxwcHPwW1joq5jBXknq9nra3t+V5ngANDQ0pnU6rUChoa2vLdvDcWPLNrJGUAEJJ9Pt9Li4uuL6+pt/vc3x8TC6XY2pqCmAAPLnt4A4a+n98klS0u/DXJbsx2QMgA6SB+8AE8A1o26RfWvKP8ADq6QQAAAAASUVORK5CYII=') 6 6,move`
      cl.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACQUlEQVQ4jX2Tv0vbURTFPy+pIuoQCSikJhGa1IB2k6BiowScg4u4Sagtzg5d/QsEEYqUgKWDi9DRLbgUBMmo1iAO9UfESLfGmNbv950ueUGLeuBxH++9e+7h3XuMJJ5BGHgL/AIugDjwGvgOlAGQ9NT6qqfxV1JKEsYpMMa0ykrqBn7f3NxQLBYJh8NEo1FOT085Pj5mYWGBpopMq2IzMdCMWUna2dnRzMyMVlZWND4+rkgkomQyqf39fafkTeBe1XXAb8YLgP7+fpaXl7m8vGR3d5dQKES1WuXs7MylxRxBAFhsKlkEPgLFZDJJV1cX5+fnTE5OMjIywt3dHZFIxBFUXjQ3nwCstfi+T3t7+zsAz/PY2Njg8PCQTCZDLBbj9vaWjo4OR/AHSQFJstZqa2tLhUJB1lqVy2UtLS0pGo1qbm5Oe3t72t7eVjweV6VScX/w8gFBLpdTPp9Xo9FoJc/Pz+vq6kqSdH19rc3NTdXrdUfQiaSgJPm+r+npaeVyOa2trSmVSml2dlYHBwfu8TdJqtfrsta6s8ADgnQ6rYmJCQ0ODmp0dFS1Wk2+77vHSUlf7g3TuhukIOBZaxkeHubo6IhEIsHU1BSJRILe3l7y+TxAwRjzQVIn0ACsa5/cJIZCIcbGxshms1QqFVZXV+np6cHzPID3ktqMMXVjjHVtcKO8DiyWSiUGBgY4OTmhVqsxNDREX18fAMFgEKDNGOM5D/1vptIz5pGkz3rEdC0zNZEGfgKvgG7gB1Bt3nk8gn/ALOqwNW9xuwAAAABJRU5ErkJggg==') 6 6,move`
      cr.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACQUlEQVQ4jX2Tv0vbURTFPy+pIuoQCSikJhGa1IB2k6BiowScg4u4Sagtzg5d/QsEEYqUgKWDi9DRLbgUBMmo1iAO9UfESLfGmNbv950ueUGLeuBxH++9e+7h3XuMJJ5BGHgL/AIugDjwGvgOlAGQ9NT6qqfxV1JKEsYpMMa0ykrqBn7f3NxQLBYJh8NEo1FOT085Pj5mYWGBpopMq2IzMdCMWUna2dnRzMyMVlZWND4+rkgkomQyqf39fafkTeBe1XXAb8YLgP7+fpaXl7m8vGR3d5dQKES1WuXs7MylxRxBAFhsKlkEPgLFZDJJV1cX5+fnTE5OMjIywt3dHZFIxBFUXjQ3nwCstfi+T3t7+zsAz/PY2Njg8PCQTCZDLBbj9vaWjo4OR/AHSQFJstZqa2tLhUJB1lqVy2UtLS0pGo1qbm5Oe3t72t7eVjweV6VScX/w8gFBLpdTPp9Xo9FoJc/Pz+vq6kqSdH19rc3NTdXrdUfQiaSgJPm+r+npaeVyOa2trSmVSml2dlYHBwfu8TdJqtfrsta6s8ADgnQ6rYmJCQ0ODmp0dFS1Wk2+77vHSUlf7g3TuhukIOBZaxkeHubo6IhEIsHU1BSJRILe3l7y+TxAwRjzQVIn0ACsa5/cJIZCIcbGxshms1QqFVZXV+np6cHzPID3ktqMMXVjjHVtcKO8DiyWSiUGBgY4OTmhVqsxNDREX18fAMFgEKDNGOM5D/1vptIz5pGkz3rEdC0zNZEGfgKvgG7gB1Bt3nk8gn/ALOqwNW9xuwAAAABJRU5ErkJggg==') 6 6,move`
    }
  }
  _resizeSelected(e, type, draw) {
    this._removeHover()
    let quant = e.metaKey || e.ctrlKey
    let p = this._getOffsetToContainer(e)
    const rotateDeg = draw.rotate + -1 * draw.deg
    console.log('_resizeSelected', type)
    if (type === 'tl') {
      // if (rotateDeg <= 25 || rotateDeg > 340) {
      this._setResizeToType(draw, 'tl', p)
      // } else if (rotateDeg >= 160 && rotateDeg < 205) {
      //   this._setResizeToType(draw, 'br', p)
      // } else if (rotateDeg > 25 && rotateDeg < 70) {
      //   this._setResizeToType(draw, 'tc', p)
      // } else if (rotateDeg >= 205 && rotateDeg < 250) {
      //   this._setResizeToType(draw, 'bc', p)
      // } else if (rotateDeg >= 70 && rotateDeg < 115) {
      //   this._setResizeToType(draw, 'tr', p)
      // } else if (rotateDeg >= 250 && rotateDeg < 295) {
      //   this._setResizeToType(draw, 'bl', p)
      // } else if (rotateDeg >= 115 && rotateDeg < 160) {
      //   this._setResizeToType(draw, 'cr', p)
      // } else if (rotateDeg >= 295 && rotateDeg < 340) {
      //   this._setResizeToType(draw, 'cl', p)
      // }
    } else if (type === 'tr') {
      // if (rotateDeg <= 25 || rotateDeg > 340) {
      this._setResizeToType(draw, 'tr', p)
      // } else if (rotateDeg >= 160 && rotateDeg < 205) {
      //   this._setResizeToType(draw, 'bl', p)
      // } else if (rotateDeg > 25 && rotateDeg < 70) {
      //   this._setResizeToType(draw, 'cr', p)
      // } else if (rotateDeg >= 205 && rotateDeg < 250) {
      //   this._setResizeToType(draw, 'cl', p)
      // } else if (rotateDeg >= 70 && rotateDeg < 115) {
      //   this._setResizeToType(draw, 'br', p)
      // } else if (rotateDeg >= 250 && rotateDeg < 295) {
      //   this._setResizeToType(draw, 'tl', p)
      // } else if (rotateDeg >= 115 && rotateDeg < 160) {
      //   this._setResizeToType(draw, 'bc', p)
      // } else if (rotateDeg >= 295 && rotateDeg < 340) {
      //   this._setResizeToType(draw, 'tc', p)
      // }
    } else if (type === 'bl') {
      // if (rotateDeg <= 25 || rotateDeg > 340) {
      this._setResizeToType(draw, 'bl', p)
      // } else if (rotateDeg >= 160 && rotateDeg < 205) {
      //   this._setResizeToType(draw, 'tr', p)
      // } else if (rotateDeg > 25 && rotateDeg < 70) {
      //   this._setResizeToType(draw, 'cl', p)
      // } else if (rotateDeg >= 205 && rotateDeg < 250) {
      //   this._setResizeToType(draw, 'cr', p)
      // } else if (rotateDeg >= 70 && rotateDeg < 115) {
      //   this._setResizeToType(draw, 'tl', p)
      // } else if (rotateDeg >= 250 && rotateDeg < 295) {
      //   this._setResizeToType(draw, 'br', p)
      // } else if (rotateDeg >= 115 && rotateDeg < 160) {
      //   this._setResizeToType(draw, 'tc', p)
      // } else if (rotateDeg >= 295 && rotateDeg < 340) {
      //   this._setResizeToType(draw, 'bc', p)
      // }
    } else if (type === 'br') {
      // if (rotateDeg <= 25 || rotateDeg > 340) {
      this._setResizeToType(draw, 'br', p)
      // } else if (rotateDeg >= 160 && rotateDeg < 205) {
      //   this._setResizeToType(draw, 'tl', p)
      // } else if (rotateDeg > 25 && rotateDeg < 70) {
      //   this._setResizeToType(draw, 'bc', p)
      // } else if (rotateDeg >= 205 && rotateDeg < 250) {
      //   this._setResizeToType(draw, 'tc', p)
      // } else if (rotateDeg >= 70 && rotateDeg < 115) {
      //   this._setResizeToType(draw, 'bl', p)
      // } else if (rotateDeg >= 250 && rotateDeg < 295) {
      //   this._setResizeToType(draw, 'tr', p)
      // } else if (rotateDeg >= 115 && rotateDeg < 160) {
      //   this._setResizeToType(draw, 'cl', p)
      // } else if (rotateDeg >= 295 && rotateDeg < 340) {
      //   this._setResizeToType(draw, 'cr', p)
      // }
    } else if (type === 'tc') {
      // if (rotateDeg <= 25 || rotateDeg > 340) {
      this._setResizeToType(draw, 'tc', p)
      // } else if (rotateDeg >= 160 && rotateDeg < 205) {
      //   this._setResizeToType(draw, 'bc', p)
      // } else if (rotateDeg > 25 && rotateDeg < 70) {
      //   this._setResizeToType(draw, 'tr', p)
      // } else if (rotateDeg >= 205 && rotateDeg < 250) {
      //   this._setResizeToType(draw, 'bl', p)
      // } else if (rotateDeg >= 70 && rotateDeg < 115) {
      //   this._setResizeToType(draw, 'cr', p)
      // } else if (rotateDeg >= 250 && rotateDeg < 295) {
      //   this._setResizeToType(draw, 'cl', p)
      // } else if (rotateDeg >= 115 && rotateDeg < 160) {
      //   this._setResizeToType(draw, 'br', p)
      // } else if (rotateDeg >= 295 && rotateDeg < 340) {
      //   this._setResizeToType(draw, 'tl', p)
      // }
    } else if (type === 'bc') {
      // if (rotateDeg <= 25 || rotateDeg > 340) {
      this._setResizeToType(draw, 'bc', p)
      // } else if (rotateDeg >= 160 && rotateDeg < 205) {
      //   this._setResizeToType(draw, 'tc', p)
      // } else if (rotateDeg > 25 && rotateDeg < 70) {
      //   this._setResizeToType(draw, 'bl', p)
      // } else if (rotateDeg >= 205 && rotateDeg < 250) {
      //   this._setResizeToType(draw, 'tr', p)
      // } else if (rotateDeg >= 70 && rotateDeg < 115) {
      //   this._setResizeToType(draw, 'cl', p)
      // } else if (rotateDeg >= 250 && rotateDeg < 295) {
      //   this._setResizeToType(draw, 'cr', p)
      // } else if (rotateDeg >= 115 && rotateDeg < 160) {
      //   this._setResizeToType(draw, 'tl', p)
      // } else if (rotateDeg >= 295 && rotateDeg < 340) {
      //   this._setResizeToType(draw, 'br', p)
      // }
    } else if (type === 'cl') {
      // if (rotateDeg <= 25 || rotateDeg > 340) {
      this._setResizeToType(draw, 'cl', p)
      // } else if (rotateDeg >= 160 && rotateDeg < 205) {
      //   this._setResizeToType(draw, 'cr', p)
      // } else if (rotateDeg > 25 && rotateDeg < 70) {
      //   this._setResizeToType(draw, 'tl', p)
      // } else if (rotateDeg >= 205 && rotateDeg < 250) {
      //   this._setResizeToType(draw, 'br', p)
      // } else if (rotateDeg >= 70 && rotateDeg < 115) {
      //   this._setResizeToType(draw, 'tc', p)
      // } else if (rotateDeg >= 250 && rotateDeg < 295) {
      //   this._setResizeToType(draw, 'bc', p)
      // } else if (rotateDeg >= 115 && rotateDeg < 160) {
      //   this._setResizeToType(draw, 'tr', p)
      // } else if (rotateDeg >= 295 && rotateDeg < 340) {
      //   this._setResizeToType(draw, 'bl', p)
      // }
    } else if (type === 'cr') {
      // if (rotateDeg <= 25 || rotateDeg > 340) {
      this._setResizeToType(draw, 'cr', p)
      // } else if (rotateDeg >= 160 && rotateDeg < 205) {
      //   this._setResizeToType(draw, 'cl', p)
      // } else if (rotateDeg > 25 && rotateDeg < 70) {
      //   this._setResizeToType(draw, 'br', p)
      // } else if (rotateDeg >= 205 && rotateDeg < 250) {
      //   this._setResizeToType(draw, 'tl', p)
      // } else if (rotateDeg >= 70 && rotateDeg < 115) {
      //   this._setResizeToType(draw, 'bc', p)
      // } else if (rotateDeg >= 250 && rotateDeg < 295) {
      //   this._setResizeToType(draw, 'tc', p)
      // } else if (rotateDeg >= 115 && rotateDeg < 160) {
      //   this._setResizeToType(draw, 'bl', p)
      // } else if (rotateDeg >= 295 && rotateDeg < 340) {
      //   this._setResizeToType(draw, 'tr', p)
      // }
    } else {
      this._setResizeToType(draw, 'rotate', p, quant)
    }
    draw.render(this.canvas.shapesElement)
    this._setSelectedPosition(draw)
    const tc = this.canvas.selected.querySelector('div[data-position="t-c"]')
    tc.style.left = draw.w / 2 - this.canvas.dropNodeWidth / 2 + 'px'
    const cl = this.canvas.selected.querySelector('div[data-position="c-l"]')
    cl.style.top = draw.h / 2 - this.canvas.dropNodeWidth / 2 + 'px'
    const cr = this.canvas.selected.querySelector('div[data-position="c-r"]')
    cr.style.top = draw.h / 2 - this.canvas.dropNodeWidth / 2 + 'px'
    const bc = this.canvas.selected.querySelector('div[data-position="b-c"]')
    bc.style.left = draw.w / 2 - this.canvas.dropNodeWidth / 2 + 'px'
    const rotate = this.canvas.selected.querySelector('div[data-position="rotate"]')
    rotate.style.left = draw.w / 2 - this.canvas.dropNodeWidth / 2 + 'px'
  }
  _setResizeToType(draw, oType, p, quant = false) {
    const w = draw.w
    const h = draw.h
    let vertex = calculateAfterRotateVertex({ x: draw.x, y: draw.y, w: draw.w, h: draw.h }, draw, draw.deg, draw.rotate)
    if (oType === 'tl') {
      const offsetX = p.x - vertex.lt.x
      const offsetY = p.y - vertex.lt.y
      if (w) {
        this._setScale(draw, 'xScale', Math.abs(offsetX) / (draw.inputWidth || draw.w), !(offsetX > 0))
      }
      if (h) {
        this._setScale(draw, 'yScale', Math.abs(offsetY) / (draw.inputHeight || draw.h), !(offsetY > 0))
      }
      draw.setScaleOffset(offsetX, offsetY)
      // if (draw instanceof Text) {
      //   draw.setScaleSize(-offsetX, -offsetY)
      // }
    } else if (oType === 'tr') {
      const offsetX = p.x - vertex.rt.x
      const offsetY = p.y - vertex.rt.y
      if (w) {
        this._setScale(draw, 'xScale', Math.abs(offsetX) / (draw.inputWidth || draw.w), offsetX > 0)
      }
      if (h) {
        this._setScale(draw, 'yScale', Math.abs(offsetY) / (draw.inputHeight || draw.h), !(offsetY > 0))
      }
      draw.setScaleOffset(0, offsetY)
      // if (draw instanceof Text) {
      //   draw.setScaleSize(0, -offsetY)
      // }
    } else if (oType === 'bl') {
      const offsetX = p.x - vertex.lb.x
      const offsetY = p.y - vertex.lb.y
      if (w) {
        this._setScale(draw, 'xScale', Math.abs(offsetX) / (draw.inputWidth || draw.w), !(offsetX > 0))
      }
      if (h) {
        this._setScale(draw, 'yScale', Math.abs(offsetY) / (draw.inputHeight || draw.h), offsetY > 0)
      }
      draw.setScaleOffset(offsetX, 0)
      // if (draw instanceof Text) {
      //   draw.setScaleSize(-offsetX, 0)
      // }
    } else if (oType === 'br') {
      const offsetX = p.x - vertex.rb.x
      const offsetY = p.y - vertex.rb.y
      if (w) {
        this._setScale(draw, 'xScale', Math.abs(offsetX) / (draw.inputWidth || draw.w), offsetX > 0)
      }
      if (h) {
        this._setScale(draw, 'yScale', Math.abs(offsetY) / (draw.inputHeight || draw.h), offsetY > 0)
      }
      // if (draw instanceof Text) {
      //   draw.setScaleSize(offsetX, offsetY)
      // }
    } else if (oType === 'tc') {
      const offsetY = p.y - vertex.tc.y
      draw.setScaleOffset(0, offsetY)
      if (draw instanceof Shape) {
        // draw.setScaleSize(0, -offsetY)
        if (h) {
          this._setScale(draw, 'yScale', Math.abs(offsetY) / (draw.inputHeight || draw.h), !(offsetY > 0))
        }
      }
    } else if (oType === 'bc') {
      const offsetY = p.y - vertex.bc.y
      if (draw instanceof Shape) {
        // draw.setScaleSize(0, offsetY)
        if (h) {
          this._setScale(draw, 'yScale', Math.abs(offsetY) / (draw.inputHeight || draw.h), offsetY > 0)
        }
      }
    } else if (oType === 'cl') {
      const offsetX = p.x - vertex.lc.x
      if (draw instanceof Shape) {
        draw.setScaleOffset(offsetX, 0)
        if (w) {
          this._setScale(draw, 'xScale', Math.abs(offsetX) / (draw.inputWidth || draw.w), !(offsetX > 0))
        }
      }
    } else if (oType === 'cr') {
      const offsetX = p.x - vertex.rc.x
      if (draw instanceof Shape) {
        // draw.setScaleSize(offsetX, 0)
        if (w) {
          this._setScale(draw, 'xScale', Math.abs(offsetX) / (draw.inputWidth || draw.w), offsetX > 0)
        }
      }
    } else {
      let ox = draw.x + w / 2
      let oy = draw.y + h / 2
      let centerPoint = pointAfterRotating(-1 * draw.deg, ox, oy, draw.x, draw.y)
      ox = centerPoint.x
      oy = centerPoint.y
      const x = p.x - ox
      const y = p.y - oy
      let rotate = angle(x, y)
      if (quant && Math.abs(rotate) % 15 !== 0) {
        return
      }
      if (draw.deg === 90 || draw.deg === -270) {
        if (p.x > ox && p.y < oy) {//first quadrant
          draw.setRotate(rotate)
        } else if (p.x < ox && p.y < oy) {//second quadrant
          draw.setRotate(-180 + rotate)
        } else if (p.x < ox && p.y > oy) {//third quadrant
          draw.setRotate(-180 + rotate)
        } else if (p.x > ox && p.y > oy) {//fourth quadrant
          draw.setRotate(rotate)
        }
      } else if (Math.abs(draw.deg) === 180) {
        if (p.x > ox && p.y < oy) {//first quadrant
          draw.setRotate(90 + rotate)
        } else if (p.x < ox && p.y < oy) {//second quadrant
          draw.setRotate(270 + rotate)
        } else if (p.x < ox && p.y > oy) {//third quadrant
          draw.setRotate(270 + rotate)
        } else if (p.x > ox && p.y > oy) {//fourth quadrant
          draw.setRotate(90 + rotate)
        }
      } else if (draw.deg === 270 || draw.deg === - 90) {
        if (p.x > ox && p.y < oy) {//first quadrant
          draw.setRotate(180 + rotate)
        } else if (p.x < ox && p.y < oy) {//second quadrant
          draw.setRotate(rotate)
        } else if (p.x < ox && p.y > oy) {//third quadrant
          draw.setRotate(rotate)
        } else if (p.x > ox && p.y > oy) {//fourth quadrant
          draw.setRotate(180 + rotate)
        }
      } else {
        if (p.x > ox && p.y < oy) {//first quadrant
          draw.setRotate(270 + rotate)
        } else if (p.x < ox && p.y < oy) {//second quadrant
          draw.setRotate(90 + rotate)
        } else if (p.x < ox && p.y > oy) {//third quadrant
          draw.setRotate(90 + rotate)
        } else if (p.x > ox && p.y > oy) {//fourth quadrant
          draw.setRotate(270 + rotate)
        }
      }
    }
  }
  _setScale(target, key, value, isAdd = true) {
    if (isAdd) {
      if (target[key] + value > 0) {
        target[key] = target[key] + value
      }
    } else {
      if (target[key] - value > 0) {
        target[key] -= value
      }
    }
  }
  _dropEvent() { }
  initEventLayer() {
    this.canvas.upperCanvas.style.cursor = 'default'
    this.canvas.eraseCursor.style.display = 'none'
  }
  _maskBrushEvent() {
    this.canvas.turnCanvas(true)
    //保证是最新的图片
    const dataurl = this.canvas.canvas.toDataURL('image/' + this.canvas.imageType)
    this.canvas._reloadMaskImg(this.canvas.svgMask.image, dataurl, this.canvas.imageType, true)
    //初始化事件层
    this.initEventLayer()
    //初始化标志位
    this.global.drawing = false
    this.canvas.setEraseCursorSize(this.canvas.actionParams.brushSize)
    this.canvas.eraseCursor.style.display = 'block'
    this._registerEvent('mousedown', (e) => {
      const uuid = 'uid-' + UUID()
      const path = []
      this.global.obj = new MaskBrush({
        uuid,
        path,
        lineWidth: this.canvas.actionParams.brushSize,
        lineColor: this.canvas.actionParams.lineColor,
        type: this.canvas.actionParams.type,
        originX: this.canvas.originX,
        originY: this.canvas.originY,
      })
      path.push(this._getOffsetToContainer(e, 1, { x: -1 * this.canvas.actionParams.brushSize / 2, y: -1 * this.canvas.actionParams.brushSize / 2 }))
      this._registerEvent('mousemove', (e) => {
        const position = this._getOffsetToContainer(e, 1, { x: -1 * this.canvas.actionParams.brushSize / 2, y: -1 * this.canvas.actionParams.brushSize / 2 })
        path.push(position)
        this.canvas.setEraseCursorSize(this.canvas.actionParams.brushSize, position.x, position.y)
        this.global.obj.render(this.canvas.svgMask.g)
      }, { uuid: 'draw' })
    })
    this._registerEvent('mousemove', (e) => {
      const position = this._getOffsetToContainer(e, 1, { x: -1 * this.canvas.actionParams.brushSize / 2, y: -1 * this.canvas.actionParams.brushSize / 2 })
      this.canvas.setEraseCursorSize(this.canvas.actionParams.brushSize, position.x, position.y)
    }, { uuid: 'cursor' })
    this._registerEvent('mouseup', () => {
      if (!this.global.obj) {
        return
      }
      this._removeEventListener('mousemove', 'draw')
      this.canvas.dispatch.add(this.global.obj, this.canvas.svgMask.g)
      this.global.obj = null
    })

  }
  _brushEvent() {
    console.log('_brushEvent')
    //初始化事件层
    this.initEventLayer()
    //初始化标志位
    this.global.drawing = false
    this.canvas.setEraseCursorSize(this.canvas.actionParams.brushSize)
    this.canvas.eraseCursor.style.display = 'block'
    let path
    this._registerEvent('mousedown', (e) => {
      //if unselected
      const uuid = UUID()
      path = []
      this.global.obj = new Brush({
        uuid,
        path,
        lineWidth: this.canvas.actionParams.brushSize,
        lineStyle: this.canvas.actionParams.lineStyle,
        opacity: this.canvas.actionParams.opacity,
        lineColor: this.canvas.actionParams.lineColor,
        type: this.canvas.actionParams.type,
        deg: this.canvas.deg + this.canvas.canvasDeg,
        canvasWidth: this.canvas.canvas.width,
        canvasHeight: this.canvas.canvas.height,
        originX: this.canvas.originX,
        originY: this.canvas.originY,
      }, this.canvas)
      path.push(this._getOffsetToContainer(e))
      // draw line
      this._registerEvent('mousemove', (e) => {
        this.global.drawing = true
        path.push(this._getOffsetToContainer(e))
        this.global.obj.render(this.canvas.canvas)
      }, { uuid: 'brush' })
    })
    //hover and move
    this._registerEvent('mousemove', (e) => {
      const position = this._getOffsetToContainer(e)
      this.canvas.setEraseCursorSize(this.canvas.actionParams.brushSize, position.x - this.canvas.actionParams.lineWidth / 2, position.y - this.canvas.actionParams.lineWidth / 2)
      if (!this.global.drawing && !this.global.currSelected) {
        this._mouseMove(e)
      }
    }, { uuid: 'brush' })
    // end drawing
    this._registerEvent('mouseup', () => {
      if (!this.global.currHover) {
        if (!this.global.obj) {
          return
        }
        this._removeEventListener('mousemove', 'brush')
        this.canvas.dispatch.add(this.global.obj, this.canvas.canvas)
        this.global.obj = null
        this.global.drawing = false
      }
    })
  }
  _shapeEvent() {
    //初始化事件层
    this.initEventLayer()
    //初始化标志位
    this.global.drawing = false
    if (this.canvas.actionParams.type === Shape.CURVE) {
      this.canvas.setEraseCursorSize(this.canvas.actionParams.lineWidth)
      this.canvas.eraseCursor.style.display = 'block'
      this._registerEvent('mousedown', (e) => {
        if (this.global.currHover) {
          //选中回调
          if (this.canvas.actionCallback.onSelected) {
            this.canvas.actionCallback.onSelected({
              selected: this.global.currHover,
              action: this.global.currHover instanceof Shape ? Action.SHAPE : Action.TEXT,
              type: this.global.currHover.type
            })
          }
          this._removeSelect()
          this._addSelect(this.global.currHover)
        } else {
          //if unselected
          if (!this.global.currSelected) {
            const uuid = UUID()
            const path = []
            this.global.obj = new Shape({
              uuid,
              path,
              lineWidth: this.canvas.actionParams.lineWidth,
              lineStyle: this.canvas.actionParams.lineStyle,
              opacity: this.canvas.actionParams.opacity,
              lineColor: this.canvas.actionParams.lineColor,
              type: this.canvas.actionParams.type,
              deg: this.canvas.deg + this.canvas.canvasDeg,
              canvasWidth: this.canvas.canvas.width,
              canvasHeight: this.canvas.canvas.height,
              originX: this.canvas.originX,
              originY: this.canvas.originY,
            }, this.canvas)
            path.push(this._getOffsetToContainer(e))
            // draw line
            this._registerEvent('mousemove', (e) => {
              this.global.drawing = true
              path.push(this._getOffsetToContainer(e))
              this.global.obj.render(this.canvas.shapesElement)
            }, { uuid: 'draw' })
          }
        }
      })
      // hover and move
      this._registerEvent('mouseenter', () => {
        this._registerEvent('mousemove', (e) => {
          if (!this.global.drawing && !this.global.currSelected) {
            this._mouseMove(e)
          }
        }, { uuid: 'drop' })
      })
      //hover and move
      this._registerEvent('mousemove', (e) => {
        const position = this._getOffsetToContainer(e)
        this.canvas.setEraseCursorSize(this.canvas.actionParams.lineWidth, position.x - this.canvas.actionParams.lineWidth / 2, position.y - this.canvas.actionParams.lineWidth / 2)
        if (!this.global.drawing && !this.global.currSelected) {
          this._mouseMove(e)
        }
      }, { uuid: 'drop' })
      // end drawing
      this._registerEvent('mouseup', () => {
        if (!this.global.currHover) {
          if (!this.global.obj) {
            return
          }
          this._removeEventListener('mousemove', 'draw')
          this._removeEventListener('mousemove', 'drawshape')
          if (!this.canvas.shapes.uuids.some(item => item === this.global.obj.uuid)) {
            this.canvas.shapes.uuids.push(this.global.obj.uuid)
            this.canvas.shapes[Action.SHAPE].push(
              this.global.obj
            )
            this.canvas.dispatch.add(this.global.obj, this.canvas.shapesElement)
          }
          this.global.obj = null
          this.global.drawing = false
        }
      })
    } else if (this.canvas.actionParams.type === Shape.REMOVERRUSH) {
      this.canvas.setEraseCursorSize(this.canvas.actionParams.brushSize)
      this.canvas.eraseCursor.style.display = 'block'
      this._registerEvent('mousedown', (e) => {
        const uuid = UUID()
        const canvas = this._generateShapeCanvas(uuid)
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        this.canvas.shapesElement.appendChild(canvas)
        const ctx = canvas.getContext('2d');
        const path = []
        this.global.obj = new Shape({
          uuid,
          path,
          lineWidth: this.canvas.actionParams.brushSize,
          lineStyle: this.canvas.actionParams.lineStyle,
          opacity: this.canvas.actionParams.opacity,
          lineColor: 'rgba(189, 255, 1, 1)',
          dom: canvas,
          type: this.canvas.actionParams.type,
          deg: this.canvas.deg + this.canvas.canvasDeg,
          canvasWidth: this.canvas.canvas.width,
          canvasHeight: this.canvas.canvas.height,
          originX: this.canvas.originX,
          originY: this.canvas.originY,
        }, this.canvas)
        const sacle = canvas.width / Number(this.canvas.container.getAttribute('data-width'))
        path.push(this._getOffsetToContainer(e, sacle))
        this._drawLine(
          ctx,
          { x: path[path.length - 1].x, y: path[path.length - 1].y },
          { x: path[path.length - 1].x, y: path[path.length - 1].y },
          this.canvas.actionParams.brushSize * sacle,
          'rgba(189, 255, 1, 1)',
        )
        this._registerEvent('mousemove', (e2) => {
          path.push(this._getOffsetToContainer(e2, sacle))
          this._drawLine(
            ctx,
            { x: path[path.length - 2].x, y: path[path.length - 2].y },
            { x: path[path.length - 1].x, y: path[path.length - 1].y },
            this.canvas.actionParams.brushSize * sacle,
            'rgba(189, 255, 1, 1)',
          )
        }, { uuid: 'draw' })
      })
      this._registerEvent('mousemove', (e) => {
        const position2 = this._getOffsetToContainer(e)
        this.canvas.setEraseCursorSize(this.canvas.actionParams.brushSize, position2.x - this.canvas.actionParams.brushSize / 2, position2.y - this.canvas.actionParams.brushSize / 2)
      })
      this._registerEvent('mouseup', () => {
        if (!this.global.obj) {
          return
        }
        this._removeEventListener('mousemove', 'draw')
        this.global.obj.dom.toBlob((blob) => {
          if (this.canvas.actionCallback.onRemoveBrush) {
            this.canvas.actionCallback.onRemoveBrush(blob)
          }
          this.global.obj.destory()
          this.global.obj = null
        }, 'image/png')
      })
    } else if (
      this.canvas.actionParams.type === Shape.RECTANGLE ||
      this.canvas.actionParams.type === Shape.CIRCULAR ||
      this.canvas.actionParams.type === Shape.TRIANGLE ||
      this.canvas.actionParams.type === Shape.ARROW ||
      this.canvas.actionParams.type === Shape.LINE
    ) {
      this._registerEvent('mousedown', (e) => {
        if (this.global.currHover) {
          this._removeSelect()
          //选中回调
          if (this.canvas.actionCallback.onSelected) {
            this.canvas.actionCallback.onSelected({
              selected: this.global.currHover,
              action: this.global.currHover instanceof Shape ? Action.SHAPE : Action.TEXT,
              type: this.global.currHover.type
            })
          }
          this._addSelect(this.global.currHover)
          this.global.currHover.selected = true
        } else {
          if (!this.global.currSelected) {
            const uuid = UUID()
            this.global.obj = new Shape({
              uuid,
              ox: e.offsetX,
              oy: e.offsetY,
              lineWidth: this.canvas.actionParams.lineWidth,
              lineStyle: this.canvas.actionParams.lineStyle,
              opacity: this.canvas.actionParams.opacity,
              lineColor: this.canvas.actionParams.lineColor,
              fillColor: this.canvas.actionParams.fillColor,
              type: this.canvas.actionParams.type,
              deg: this.canvas.deg + this.canvas.canvasDeg,
              canvasWidth: this.canvas.canvas.width,
              canvasHeight: this.canvas.canvas.height,
              originX: this.canvas.originX,
              originY: this.canvas.originY,
            }, this.canvas)
            let { x, y } = this._getOffsetToContainer(e), w = 0, h = 0
            this._registerEvent('mousemove', (e) => {
              // 画图状态
              this.global.drawing = true
              let path
              if (this.canvas.actionParams.type === Shape.LINE || this.canvas.actionParams.type === Shape.ARROW) {
                path = [
                  { x, y },
                  this._getOffsetToContainer(e)
                ]
              } else {
                let position = this._getOffsetToContainer(e)
                w = position.x - x
                h = position.y - y
                path = [
                  { x, y },
                  { x: x + w, y },
                  { x: x + w, y: y + h },
                  { x, y: y + h },
                  { x, y, offsetY: -this.global.obj.lineWidth / 2 },
                ]
              }
              this.global.obj.setPath(path)
              this.global.obj.render(this.canvas.shapesElement)
            }, { uuid: 'drawshape' })
          }
        }
      }, { uuid: 'shape' })
      this._registerEvent('mousedown', (e) => {
        this._registerEvent('mousemove', (e) => {
          //drawing 为 true 关闭hover
          if (!this.global.drawing) {
            this._mouseMove(e)
          }
        }, { uuid: 'shape' })
      })
      this._registerEvent('mousemove', (e) => {
        //drawing 为 true 关闭hover
        if (!this.global.drawing && !this.global.currSelected) {
          this._mouseMove(e)
        }
      }, { uuid: 'shape' })
      this._registerEvent('mouseup', () => {
        if (!this.global.currHover) {
          if (!this.global.obj) {
            return
          }
          this._removeEventListener('mousemove', 'drawshape')

          if (!this.canvas.shapes.uuids.some(item => item === this.global.obj.uuid)) {
            this.canvas.shapes.uuids.push(this.global.obj.uuid)
            this.canvas.shapes[Action.SHAPE].push(
              this.global.obj
            )
            this.canvas.dispatch.add(this.global.obj, this.canvas.shapesElement)
          }
          this.global.obj = null
          this.global.drawing = false
        }
      })
    } else { // current function is empty
      this._registerEvent('mousedown', (e) => {
        if (this.global.currHover) {
          this._removeSelect()
          //选中回调
          if (this.canvas.actionCallback.onSelected) {
            this.canvas.actionCallback.onSelected({
              selected: this.global.currHover,
              action: this.global.currHover instanceof Shape ? Action.SHAPE : Action.TEXT,
              type: this.global.currHover.type
            })
          }
          this._addSelect(this.global.currHover)
          this.global.currHover.selected = true
        }
      }, { uuid: 'shape' })
      this._registerEvent('mousemove', (e) => {
        //drawing 为 true 关闭hover
        if (!this.global.drawing && !this.global.currSelected) {
          this._mouseMove(e)
        }
      }, { uuid: 'shape' })
    }
  }
  _textEvent() {
    this.global.drawing = false
    this._registerEvent('mousedown', (e) => {
      console.log('mousedown', this.global.currHover)
      if (this.global.currHover) {
        if (this.global.currHover.hasFocus()) {
          // e.stopPropagation();
          // e.preventDefault();
        } else {
          this._removeSelect()
          this.global.currSelected = true
          // 选中回调
          if (this.canvas.actionCallback.onSelected) {
            this.canvas.actionCallback.onSelected({
              selected: this.global.currHover,
              action: this.global.currHover instanceof Shape ? Action.SHAPE : Action.TEXT,
              type: this.global.currHover.type
            })
          }
          this._addSelect(this.global.currHover)
          this.global.currHover.selected = true
        }
      } else {
        console.log('add text')
        if (!this.global.currSelected) {
          const { x, y } = this._getOffsetToContainer(e)
          const uuid = UUID()
          this.global.obj = new Text({
            uuid,
            x,
            y,
            fontFamily: this.canvas.actionParams.fontFamily,
            fontSize: this.canvas.actionParams.fontSize,
            color: this.canvas.actionParams.color,
            lineWidth: this.canvas.actionParams.lineWidth,
            lineStyle: this.canvas.actionParams.lineStyle,
            opacity: this.canvas.actionParams.opacity,
            bevel: this.canvas.actionParams.bevel,
            strong: this.canvas.actionParams.strong,
            underline: this.canvas.actionParams.underline,
            align: this.canvas.actionParams.align,
            lineColor: this.canvas.actionParams.lineColor,
            fillColor: this.canvas.actionParams.fillColor,
            deg: this.canvas.deg + this.canvas.canvasDeg,
            canvasWidth: this.canvas.canvas.width,
            canvasHeight: this.canvas.canvas.height,
            originX: this.canvas.originX,
            originY: this.canvas.originY,
          }, this.canvas)
          this.global.obj.render(this.canvas.shapesElement)
          if (!this.canvas.shapes.uuids.some(item => item === this.global.obj.uuid)) {
            console.log('add')
            this.canvas.shapes.uuids.push(this.global.obj.uuid)
            this.canvas.shapes[Action.TEXT].push(
              this.global.obj
            )
            this.canvas.dispatch.add(this.global.obj, this.canvas.shapesElement)
          }
          this.global.currHover = this.global.obj
          this._removeSelect()
          this.global.currSelected = true
          // 选中回调
          if (this.canvas.actionCallback.onSelected) {
            this.canvas.actionCallback.onSelected({
              selected: this.global.currHover,
              action: this.global.currHover instanceof Shape ? Action.SHAPE : Action.TEXT,
              type: this.global.currHover.type
            })
          }
          this._addSelect(this.global.currHover, true)
          this.global.currHover.selected = true
          setTimeout(() => {
            if (this.global.currHover) {
              this.global.currHover.focus()
              this.global.currHover.setZIndex(9)
            }
          })
        }
      }
    }, { uuid: 'text' })
    this._registerEvent('mousedown', (e) => {
      this._registerEvent('mousemove', (e) => {
        if (!this.global.drawing && !this.global.currSelected) {
          this._mouseMove(e)
        }
      }, { uuid: 'text' })
    })
    this._registerEvent('mousemove', (e) => {
      if (!this.global.drawing && !this.global.currSelected) {
        this._mouseMove(e)
      }
    }, { uuid: 'text' })
    this._registerEvent('dblclick', () => {
      console.log('dblclick')
      if (this.global.currHover) {
        this.global.currHover.focus()
        this.global.currHover.setZIndex(9)
      }
    })
    this._registerEvent('mouseup', () => {
      if (!this.global.currHover) {
        if (!this.global.obj) {
          return
        }
        this.global.obj = null
      }
    })
  }

  _getOffsetToContainer(e, scale = 1, offset = { x: 0, y: 0 }) {
    let x = e.offsetX
    let y = e.offsetY
    let target = e.target
    while (target !== this.canvas.container) {
      x += (target.offsetLeft || 0)
      y += (target.offsetTop || 0)
      target = target.parentNode
    }
    return {
      x: (x + offset.x) * scale, y: (y + offset.y) * scale
    }
  }
  _getOffsetOfContainerAfterRotating(e, curr, x, y) {
    let deg = curr.rotate + -1 * curr.deg
    if (e.target === this.canvas.hover || e.target === this.canvas.selectedTransform) {
      if (deg === 90 || deg === -270) {
        x = e.target.parentNode.offsetLeft + e.offsetY
        y = e.target.parentNode.offsetTop - e.offsetX
      } else if (Math.abs(deg) === 180) {
        x = e.target.parentNode.offsetLeft - e.offsetX
        y = e.target.parentNode.offsetTop - e.offsetY
      } else if (deg === 270 || deg === - 90) {
        x = e.target.parentNode.offsetLeft + e.offsetY
        y = e.target.parentNode.offsetTop - e.offsetX
      }
    }
    return { x, y }
  }
}
