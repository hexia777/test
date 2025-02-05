import { matrix, pointAfterRotating } from "../utils"
export default class Text {
  constructor({ uuid, x, y, fontFamily, opacity = 1, fontSize = 16, color, strong, bevel, underline, align, deg = 0, lineWidth = 0, lineColor = 'transparent', fillColor = 'transparent', originX, originY }, canvas) {
    this.uuid = uuid
    this.ox = x
    this.oy = y
    this.x = y
    this.y = y
    this.ow = fontSize * 1.425 * 6
    this.oh = fontSize * 1.75
    this.w = fontSize * 1.425 * 6
    this.h = fontSize * 1.75
    this.fontFamily = fontFamily
    this.fontSize = fontSize
    this.color = color
    this.strong = strong
    this.bevel = bevel
    this.underline = underline
    this.offsetX = 0
    this.offsetY = 0
    this.originX = 0
    this.originY = 0
    this.align = align
    this.container = null
    this.input = null
    this.value = 'dbclick edit'
    this.disabled = false
    this.selected = false
    this.xScale = 1
    this.yScale = 1
    this.xScaleOffset = 0
    this.yScaleOffset = 0
    this.wScale = 0
    this.hScale = 0
    this.deg = deg
    this.rotate = 0
    this.inputWidth = 0
    this.inputHeight = 0
    this.lineWidth = lineWidth
    this.lineColor = lineColor
    this.fillColor = fillColor
    this.opacity = opacity
    this.canvas = canvas
    this.target = null
    this.lastFontFamily = ''
    this.lastFontSize = 0
    this.inputBox = null
  }
  destory(thoroughly = false) {
    if (this.container) {
      if (thoroughly) {
        const parent = this.container.parentNode
        if (this.container.parentNode) {
          parent.removeChild(this.container)
        }
      } else {
        this.container.innerHTML = ''
      }
    }
  }
  render(target) {
    this.target = target
    this.destory()
    if (!this.container) {
      const container = document.createElement('div')
      this.container = container
    }
    this.container.style.position = 'absolute'
    this.x = this.ox + this.offsetX + this.xScaleOffset - (this.canvas.originX - this.originX)
    this.y = this.oy + this.offsetY + this.yScaleOffset - (this.canvas.originY - this.originY)
    this.container.style.top = this.y + 'px'
    this.container.style.left = this.x + 'px'
    this.container.style.opacity = this.opacity
    this.container.style.transformOrigin = '0 0'
    matrix(this.container, -1 * this.deg)
    const inputBox = document.createElement('div')
    // inputBox.style.position = 'relative'
    inputBox.style.width = '100%'
    inputBox.style.height = '100%'
    this.inputBox = inputBox
    matrix(this.inputBox, this.rotate)
    const input = document.createElement('span')
    input.setAttribute('class', 'imge_input')
    input.setAttribute('contenteditable', 'true')
    // input.style.position = 'absolute'
    // input.style.top = 0
    // input.style.left = 0
    input.style.display = 'inline-block'
    input.style.wordBreak = 'break-all'
    input.type = 'text'
    input.placeholder = 'input text'
    input.style.color = this.color
    if (this.bevel) {
      input.style.fontStyle = 'italic'
    }
    if (this.strong) {
      input.style.fontWeight = 'bold'
    }
    if (this.underline) {
      input.style.textDecoration = 'underline'
    }
    input.style.fontFamily = this.fontFamily
    input.style.fontSize = this.fontSize + 'px'
    input.style.fontWeight = this.strong ? 'bold' : 'normal'
    input.style.textDecoration = this.underline ? 'underline' : 'none'
    input.style.textAlign = this.align
    input.style.border = `${this.lineWidth}px solid ${this.lineColor}`
    input.style.backgroundColor = this.fillColor
    input.style.overflow = 'hidden'
    // input.style.textShadow = `0 0 ${this.lineWidth}px ${this.lineColor}`

    input.innerHTML = this.value
    input.style.transformOrigin = `0 0`
    matrix(input, 0)
    input.addEventListener('input', (e) => {
      input.style.height = null
      this.value = e.target.innerHTML
      // this.w = e.target.clientWidth
      // this.h = e.target.clientHeight
      // container.style.width = this.w + 'px'
      this.inputHeight = input.clientHeight + this.lineWidth * 2
      this.h = this.inputHeight > this.h ? this.inputHeight : this.h
      input.style.height = this.h + 'px'
      this.container.style.height = this.h + 'px'
      this.canvas.event._setSelectedPosition(this)
      this.canvas.event._setSelectedPointPosition(this)
    })
    this.input = input
    inputBox.appendChild(input)
    this.container.appendChild(inputBox)
    target.appendChild(this.container)
    if (!this.inputWidth) {
      this.inputWidth = input.clientWidth + this.lineWidth * 2
      this.inputHeight = input.clientHeight + this.lineWidth * 2
      this.w = this.inputWidth * this.xScale
      input.style.width = this.w + 'px'
      this.h = input.clientHeight + this.lineWidth * 2
      this.container.style.width = this.w + 'px'
      this.container.style.height = this.h + 'px'
      this.canvas.event._setSelectedPosition(this)
      this.canvas.event._setSelectedPointPosition(this)
    } else {
      this.w = this.inputWidth * this.xScale < this.fontSize ? this.fontSize : this.inputWidth * this.xScale
      this.h = this.inputHeight * this.yScale < this.fontSize ? this.fontSize : this.inputHeight * this.yScale
      this.container.style.width = this.w + 'px'
      this.container.style.height = this.h + 'px'
      input.style.width = this.w + 'px'
      input.style.height = this.h + 'px'
    }

    this.lastFontFamily = this.fontFamily
    this.lastFontSize = this.fontSize
    // this.canvas.event._setSelectedPosition(this)
    // this.canvas.event._setSelectedPointPosition(this)
  }
  setOffset(offsetX, offsetY) {
    this.offsetX += offsetX
    this.offsetY += offsetY
  }
  setScaleOffset(offsetX, offsetY) {
    console.log(offsetX, offsetY)
    this.xScaleOffset += offsetX
    this.yScaleOffset += offsetY
  }
  setScaleSize(w, h) {
    this.wScale += w
    this.hScale += h
  }
  setRotate(rotate) {
    this.rotate = rotate
  }
  //使聚焦
  focus() {
    let range, selection
    if (window.getSelection && document.createRange) {
      range = document.createRange();
      range.collapse(true);
      range.setEnd(this.input, this.input.childNodes.length);
      range.setStart(this.input, this.input.childNodes.length);
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      range.selectNodeContents(this.input)
    } else if (document.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(this.input);
      range.collapse(true);
      range.select();
      range.selectNodeContents(this.input)
    }
  }
  //使失焦
  blur() {
    let range, selection
    if (window.getSelection && document.createRange) {
      // range = document.createRange();
      // range.collapse(true);
      // range.setEnd(this.input, this.input.childNodes.length);
      // range.setStart(this.input, this.input.childNodes.length);
      selection = window.getSelection();
      selection.removeAllRanges();
      // selection.addRange(range);
      // range.selectNodeContents(this.input)
    } else if (document.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(this.input);
      range.collapse(true);
      // range.select();
      // range.selectNodeContents(this.input)
    }

  }
  setZIndex(zIndex = 0) {
    this.container.style.zIndex = zIndex
  }
  hasFocus() {
    const focusDom = document.activeElement
    if (!focusDom) {
      return false
    }
    return this.container.contains(focusDom)
  }
}
