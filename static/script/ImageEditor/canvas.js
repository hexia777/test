import Event from './event'
import Action from './action'
import { setTransform, SIN, COS, matrix, UUID, imageToBase64 } from './utils'
import Shape from './operate/shape'
import html2canvas from 'html2canvas'

export default class Canvas {
  constructor(dispatch, target, { maxWidth = 0, maxHeight = 0, lineWidth = 2, dropBorderWidth = 15, dropNodeWidth = 15, lineColor = '#fff', watermarkVisible = true, watermarkText = 'VanceAI' }) {
    this.dispatch = dispatch
    this.originImage = null
    this.image = null
    this.maxWidth = maxWidth
    this.maxHeight = maxHeight
    this.selected = null
    this.hover = null
    this.originImageScale = 1
    this.initScale = 1
    this.lastScale = 1
    this.rotateScale = 1
    this.canvasDeg = 0
    this.canvasDegBeforeCrop = 0
    this.deg = 0
    this.lineWidth = lineWidth
    this.lineColor = lineColor
    this.dropBorderWidth = dropBorderWidth
    this.dropNodeWidth = dropNodeWidth
    this.actionParams = null
    this.actionCallback = null
    this.watermarkText = watermarkText
    this.watermarkVisible = watermarkVisible
    this.watermarkImg = null
    this.defaultBackground = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAEZJREFUWEft1rENACAIBEAZhv0HYhiNM7yJzdF/8lwDNTN7BdPdFcRXKUCAAAECBAh8F0hu+c2mC0TPhAIECBAgQIDAC4EDaHZ5IZ6feOQAAAAASUVORK5CYII=')`
    this.originX = 0
    this.originY = 0
    this.frame = null
    this.canvas = null
    this.ctx = null
    this.view = null
    this.upperCanvas = null
    this.selectedBox = null
    this.eraseCursor = null
    this.hoverBox = null
    this.selectedTransform = null
    this.hoverTransform = null
    this.upperCtx = null
    this.shapesElement = null
    this.svgMask = {
      container: null,
      svg: null,
      g: null,
      filter: null,
      gcc: null,
      originImage: null,
      image: null,
      uuid: null,
      oImage: null,
      oSnapshot: null,
    }
    this.container = this.initCanvas(target)
    this.imageType = ''
    this.options = null
    this.lastMask = null
    this.events = {
      [Action.NONE]: new Event(this, this.upperCanvas),
      [Action.CROP]: new Event(this, this.upperCanvas),
      [Action.TEXT]: new Event(this, this.container),
      [Action.SHAPE]: new Event(this, this.container),
      [Action.MASK_BRUSH]: new Event(this, this.container),
      [Action.BRUSH]: new Event(this, this.container),
    }
    this.globalCallback = {}
    //记录当前所有的对象
    this.shapes = {
      [Action.TEXT]: [],
      uuids: [],
      [Action.SHAPE]: [],
    }
    this.action = Action.NONE
    this.event = this.events[this.action]
    this.turnMaskOrLower = false
    this.masksvgOffset = {
      x:0,y:0
    }
    // this.event.activeAction(this.action)
  }
  initCanvas(target) {
    console.log('initCanvas')
    const frame = document.querySelector(target)
    if (!frame) {
      throw new Error('Element not found')
    }
    frame.innerHTML = ''
    frame.style.userSelect = 'none'
    frame.style.width = '100%'
    frame.style.height = '100%'
    frame.style.maxWidth = null
    frame.style.maxHeight = null
    frame.style.transform = null
    frame.setAttribute('data-tag', 'frame')
    // frame.style.overflow = 'hidden'
    frame.style.position = 'relative'
    this.frame = frame
    const container = document.createElement('div')
    container.style.position = 'relative'
    container.setAttribute('data-tag', 'container')
    container.style.userSelect = 'none'
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.background = this.defaultBackground
    // container.style.overflow = 'hidden'
    if (this.maxWidth) {
      container.style.maxWidth = this.maxWidth + 'px'
    }

    if (this.maxHeight) {
      container.style.maxHeight = this.maxHeight + 'px'
    }

    const lower = document.createElement('canvas')
    lower.setAttribute('class', 'lower-canvas')
    lower.setAttribute('data-tag', 'lower')
    lower.style.position = 'absolute'
    lower.style.top = '0'
    lower.style.left = '0'
    this.canvas = lower
    this.ctx = lower.getContext('2d')
    const upper = document.createElement('div')
    upper.setAttribute('class', 'upper-canvas')
    upper.setAttribute('data-tag', 'upper')
    upper.style.position = 'absolute'
    upper.style.top = '0'
    upper.style.left = '0'
    this.upperCanvas = upper
    // this.upperCtx = upper.getContext('2d')
    const view = document.createElement('div')
    view.setAttribute('class', 'view')
    view.setAttribute('data-tag', 'view')
    view.style.pointerEvents = 'none'
    view.style.position = 'absolute'
    view.style.top = '0'
    view.style.left = '0'
    view.style.boxShadow = '0 0 0 300000px rgb(238 242 248 / 90%)'
    this.view = view
    const shapes = document.createElement('div')
    shapes.setAttribute('class', 'shapes')
    shapes.setAttribute('data-tag', 'shapes')
    // shapes.style.overflow = 'hidden'
    shapes.style.position = 'absolute'
    shapes.style.top = '0'
    shapes.style.left = '0'
    shapes.style.width = '100%'
    shapes.style.height = '100%'
    this.shapesElement = shapes
    upper.appendChild(this.initHover())
    upper.appendChild(this.initSelection())
    upper.appendChild(this.initEraseCursor())
    container.appendChild(lower)
    this.svgMask.container = this.generateSvgMaskContainer()
    container.appendChild(this.svgMask.container)
    container.appendChild(shapes)
    container.appendChild(upper)
    frame.appendChild(container)
    frame.appendChild(view)
    return container
  }
  initEraseCursor() {
    const eraseCursor = document.createElement('div')
    eraseCursor.style.position = 'absolute'
    eraseCursor.style.pointerEvents = 'none'
    eraseCursor.style.display = 'none'
    eraseCursor.style.borderRadius = '50%'
    eraseCursor.style.border = '2px solid #333'
    this.eraseCursor = eraseCursor
    return eraseCursor
  }

  initSelection() {
    const selectedBox = document.createElement('div')
    selectedBox.style.position = 'absolute'
    selectedBox.style.display = 'none'
    selectedBox.style.top = 0
    selectedBox.style.left = 0
    selectedBox.style.width = '100%'
    selectedBox.style.height = '100%'
    const selectedTransform = document.createElement('div')
    selectedTransform.style.transformOrigin = '0 0'
    selectedTransform.style.position = 'absolute'
    selectedTransform.style.top = '0'
    selectedTransform.style.left = '0'
    selectedTransform.style.cursor = 'move'
    // selectedTransform.style.pointerEvents = 'none'
    this.selectedTransform = selectedTransform
    const selected = document.createElement('div')
    selected.setAttribute('class', 'selected')
    selected.setAttribute('data-tag', 'selected')
    selected.style.width = '100%'
    selected.style.height = '100%'
    selected.style.border = '2px solid #6ccfff'
    selected.style.cursor = 'move'
    selected.style.pointerEvents = 'none'
    this.selected = selected
    const points = [
      {
        type: 't-l',
        css: {
          top: `-${this.dropNodeWidth / 2}px`,
          left: `-${this.dropNodeWidth / 2}px`,
          cursor: 'nw-resize',
        }
      },
      {
        type: 't-c',
        css: {
          top: `-${this.dropNodeWidth / 2}px`,
          cursor: 'n-resize',
        }
      },
      {
        type: 't-r',
        css: {
          top: `-${this.dropNodeWidth / 2}px`,
          right: `-${this.dropNodeWidth / 2}px`,
          cursor: 'ne-resize',
        }
      },
      {
        type: 'c-l',
        css: {
          left: `-${this.dropNodeWidth / 2}px`,
          cursor: 'w-resize',
        }
      },
      {
        type: 'c-r',
        css: {
          right: `-${this.dropNodeWidth / 2}px`,
          cursor: 'e-resize',
        }
      },
      {
        type: 'b-l',
        css: {
          bottom: `-${this.dropNodeWidth / 2}px`,
          left: `-${this.dropNodeWidth / 2}px`,
          cursor: 'sw-resize',
        }
      },
      {
        type: 'b-c',
        css: {
          bottom: `-${this.dropNodeWidth / 2}px`,
          cursor: 's-resize',
        }
      },
      {
        type: 'b-r',
        css: {
          bottom: `-${this.dropNodeWidth / 2}px`,
          right: `-${this.dropNodeWidth / 2}px`,
          cursor: 'se-resize',
        }
      },
      {
        type: 'rotate',
        css: {
          bottom: `-${this.dropNodeWidth * 3}px`,
          display: `none`,
        }
      },
    ]
    for (let i = 0; i < points.length; i++) {
      const point = document.createElement('div')
      point.setAttribute('data-position', points[i].type)
      point.style.position = 'absolute'
      point.style.width = this.dropNodeWidth + 'px'
      point.style.height = this.dropNodeWidth + 'px'
      point.style.background = '#ffffff'
      point.style.border = '2px solid #6ccfff'
      point.style.borderRadius = '50%'
      for (let css in points[i].css) {
        if (css === 'cursor') {
          if (points[i].type === 't-l' || points[i].type === 'b-r') {
            point.style[css] = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACP0lEQVQ4jX2Tv0tbURTHPzdJX+ujRmIXUZIXKIFgtJNkEIvSPyFDFuemOCmOGYqjuHQzbaVDB8eOjnXoUtKMGaTBIVZU5Cn+6CMNpO99u3jtq7Q98IV7uefLOfd7vsdIIhYJwMTu9jHiH5GInRtACPyMIbxB405urISEpJYkRVGkMAxvEUWRoihSLBp3eBhJZaDZarVYXl7m8vKS4eFhRkZGcF2XxcVFKpUKiUQCYwxA0hgT2a8ngC5APp8HYG9vD8dxcF2X0dFRrq6uCMPQkl8bY/7QIwU8Btjf32d6ehrf9/F9n2q1Sq1Ww3EcS34HvJL0DPgCBLaDhwBBEHB4eMjCwgKZTIbNzU3q9TqdTscW84CvwEfgO/DeijEhSUdHRxobG9P6+rqCIFC1WlU2m9Xq6qoGg4EkqdPpaHd3V0EQWFEfJdfW1n4AL13XpVAokEwmmZmZoVQqcXJyws7ODufn53ieR6/XY2Njg3Q6TbFYBPhsJKWAQRiGSCKVSt0KdHp6ysrKCu12m1KpRDabZXx8nHK5zNzcHMBTO883sVm/lVSQ9EGSms2mlpaWND8/L0Czs7Pqdrs2N2/d9QK4BzjGmBpQByq+73N2dkYul8PzPCYnJ+l2uxwcHPwW1joq5jBXknq9nra3t+V5ngANDQ0pnU6rUChoa2vLdvDcWPLNrJGUAEJJ9Pt9Li4uuL6+pt/vc3x8TC6XY2pqCmAAPLnt4A4a+n98klS0u/DXJbsx2QMgA6SB+8AE8A1o26RfWvKP8ADq6QQAAAAASUVORK5CYII=') 6 6,${points[i].css[css]}`
          } else if (points[i].type === 't-r' || points[i].type === 'b-l') {
            point.style[css] = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACQUlEQVQ4jX2Tv0vbURTFPy+pIuoQCSikJhGa1IB2k6BiowScg4u4Sagtzg5d/QsEEYqUgKWDi9DRLbgUBMmo1iAO9UfESLfGmNbv950ueUGLeuBxH++9e+7h3XuMJJ5BGHgL/AIugDjwGvgOlAGQ9NT6qqfxV1JKEsYpMMa0ykrqBn7f3NxQLBYJh8NEo1FOT085Pj5mYWGBpopMq2IzMdCMWUna2dnRzMyMVlZWND4+rkgkomQyqf39fafkTeBe1XXAb8YLgP7+fpaXl7m8vGR3d5dQKES1WuXs7MylxRxBAFhsKlkEPgLFZDJJV1cX5+fnTE5OMjIywt3dHZFIxBFUXjQ3nwCstfi+T3t7+zsAz/PY2Njg8PCQTCZDLBbj9vaWjo4OR/AHSQFJstZqa2tLhUJB1lqVy2UtLS0pGo1qbm5Oe3t72t7eVjweV6VScX/w8gFBLpdTPp9Xo9FoJc/Pz+vq6kqSdH19rc3NTdXrdUfQiaSgJPm+r+npaeVyOa2trSmVSml2dlYHBwfu8TdJqtfrsta6s8ADgnQ6rYmJCQ0ODmp0dFS1Wk2+77vHSUlf7g3TuhukIOBZaxkeHubo6IhEIsHU1BSJRILe3l7y+TxAwRjzQVIn0ACsa5/cJIZCIcbGxshms1QqFVZXV+np6cHzPID3ktqMMXVjjHVtcKO8DiyWSiUGBgY4OTmhVqsxNDREX18fAMFgEKDNGOM5D/1vptIz5pGkz3rEdC0zNZEGfgKvgG7gB1Bt3nk8gn/ALOqwNW9xuwAAAABJRU5ErkJggg==') 6 6,${points[i].css[css]}`
          } else if (points[i].type === 't-c' || points[i].type === 'b-c') {
            point.style[css] = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAYAAAAiYZ4HAAABFElEQVQokXWSMW6DQBBFnwiXcYNcuLWypHVlGrgAlVNR0bGcgIKWK/gMrK+QgpyAW1j6aViyhuRLU+z+92E1M0giqJv2uoVMCF88URSFiqIIQ5dt4Oiduq4FCFBd12Ho6AOxpEmS+r4XIGOMjDEC1Pe9D0ySYiSlkjSOowA1TbMGmqYRoHEcfSiNCXS/38myjDRNAbDWkiQJLwqf5OX/sNEkKY6AJ5AAH8CDvR6LlwDPKDDe/oB3XrzUF3D4B35f6htIIuAMHJxzWGt3tLUW5xzLB88vXWrblnme13NZlgzDgDHmFwq71HXdbnBd1+0Gh6STv62qal2NqqrCtp62y3f1Tp7nyvM8hK/b5fP1uZ3WcrcyP/v/iukOlDsjAAAAAElFTkSuQmCC') 6 6,${points[i].css[css]}`
          } else {
            point.style[css] = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAYAAADtc08vAAACVUlEQVQokW2TPUsjURiFn0zGSZDAFonMKhjYwlgJkt1CsNHKxkIE2T9gYeMPsdpy1WZhhWUlEtFOWLCykRUlokXiB9okk4wmKIkOyczZYhONwQMv3Hvee99b3OeEJPGOEkCjXR2FAQEfgOqLK6m7Pkna1Kt+tP1VvdUvSeE3j0vKdrqu66rRaHS23yXJ930FQaBqtdo9aDXcvvwZ+FYqldje3qZcLpNMJolEIgBfJHFzc8PW1hYPDw8MDAxgWRahUOiLIek38BdgZ2eH3d1dGo0G4XCYVqsFQLPZ5Pz8nLOzM46Pjzk4OODx8REAE/h6f3/PxsYGmUyGeDxOrVbj9PSURCKB7/u4rkutViMSibC/v8/d3R3Dw8Mkk0nMp6cnstksKysrFItFpqamuLi4IJfLUSwWCYKAkZERLi8vcRyH6+trCoUC5XKZ5eXl/wPq9TqxWIxoNEq9Xufk5ITn52fi8Tj9/f0cHR0RjUaxbRvHcbi9vSUIAmzbxjQMg3Q6zcLCAoeHh1iWxfj4ODMzM9i2zdXVFaZpYlkWmUyGXC7H3NwcS0tLDA4OYsZiMSYmJrBtm6GhISqVCrOzs4yNjWEYBqOjowDs7e1RKBSYnJxkcXGRdDqNZVmYpmkCkEql8DyPfD6P53kv3wXgeR6maTI/P8/09DSpVKqDz08k9Un6KEmlUkn5fF6O48j3fUlSEATyfV+VSkWu63YA+iMp1k1hnyQ1m80eYl8RbrVaneXmm9R05WC9fWBdkt1hXZIhaa3dW+vJDqGeNPYBzffi2Yau1Wv+AzdlzzwbCNWGAAAAAElFTkSuQmCC') 6 6,${points[i].css[css]}`
          }
        } else {
          point.style[css] = points[i].css[css]
        }

      }
      selected.appendChild(point)
    }
    selectedTransform.appendChild(selected)
    selectedBox.appendChild(selectedTransform)
    this.selectedBox = selectedBox
    return selectedBox
  }
  initHover() {
    const hoverBox = document.createElement('div')
    hoverBox.style.display = 'none'
    hoverBox.style.position = 'absolute'
    hoverBox.style.top = 0
    hoverBox.style.left = 0
    hoverBox.style.width = '100%'
    hoverBox.style.height = '100%'
    hoverBox.style.cursor = 'move'
    const hoverTransform = document.createElement('div')
    hoverTransform.style.transformOrigin = '0 0'
    hoverTransform.style.pointerEvents = 'none'
    hoverTransform.style.position = 'absolute'
    hoverTransform.style.top = '0'
    hoverTransform.style.left = '0'
    hoverTransform.style.cursor = 'move'
    this.hoverTransform = hoverTransform
    const hover = document.createElement('div')
    hover.setAttribute('class', 'hover')
    hover.setAttribute('data-tag', 'hover')
    hover.style.pointerEvents = 'none'
    hover.style.cursor = 'move'
    hover.style.width = '100%'
    hover.style.height = '100%'

    // hover.style.position = 'absolute'
    // hover.style.top = '0'
    // hover.style.left = '0'
    hover.style.border = '1px solid #6ccfff'
    this.hover = hover
    this.hoverBox = hoverBox
    hoverTransform.appendChild(hover)
    hoverBox.appendChild(hoverTransform)
    return hoverBox
  }
  initUpperCorsur(cursor = 'default') {
    this.upperCanvas.style.cursor = cursor
    this.eraseCursor.style.display = 'none'
  }
  setEraseCursorSize(size, x = -100, y = -100) {
    this.upperCanvas.style.cursor = 'none'
    this.eraseCursor.style.width = size + 'px'
    this.eraseCursor.style.height = size + 'px'
    this.eraseCursor.style.left = x + 'px'
    this.eraseCursor.style.top = y + 'px'
  }
  getScaleOfRotate() {
    const size = this.calculateCanvasWidthAndHeightOfRotate(this.deg, Number(this.view.getAttribute('data-width')), Number(this.view.getAttribute('data-height')))
    return size.width / Number(this.view.getAttribute('data-width'))
  }
  setContainerScale(scale) {
    const scaleOfRotate = this.getScaleOfRotate() * scale
    matrix(this.container, this.deg, scaleOfRotate, scaleOfRotate)
    matrix(this.view, 0, scale, scale)
    if (scale < 1) {
      this.originX = 0
      this.originY = 0
    } else {
      this.originX /= scale
      this.originY /= scale
    }

    if ((Math.abs(this.originX) * 2 + this.view.clientWidth) > Math.round(this.container.clientWidth * scale * scaleOfRotate) && this.view.clientWidth <= Math.round(this.container.clientWidth * scale * scaleOfRotate)) {
      this.originX = (Math.round(this.container.clientWidth * scale * scaleOfRotate) - this.view.clientWidth) / 2
    }
    if ((Math.abs(this.originY) * 2 + this.view.clientHeight) > Math.round(this.container.clientHeight * scale * scaleOfRotate) && this.view.clientHeight <= Math.round(this.container.clientHeight * scale * scaleOfRotate)) {
      this.originY = (Math.round(this.container.clientHeight * scale * scaleOfRotate) - this.view.clientHeight) / 2
    }
    this.offsetImage(this.originX, this.originY)

    if (this.globalCallback.onMousewheel) {
      this.globalCallback.onMousewheel(scale)
    }
  }
  setCanvasSize(w, h, canvasW, canvasH, x = 0, y = 0) {
    this.canvas.width = canvasW
    this.canvas.height = canvasH
    // this.canvas.style.width = '100%'
    // this.canvas.style.height = '100%'
    // this.canvas.style.maxWidth = w + 'px'
    // this.canvas.style.maxHeight = h + 'px'
    this.canvas.style.width = w + 'px'
    this.canvas.style.height = h + 'px'
    this.shapesElement.style.width = w + 'px'
    this.shapesElement.style.height = h + 'px'
    this.upperCanvas.style.width = w + 'px'
    this.upperCanvas.style.height = h + 'px'
    this.container.style.width = w + 'px'
    this.container.style.height = h + 'px'
    this.container.style.top = y + 'px'
    this.container.style.left = x + 'px'
  }
  setOrigin(x = 0, y = 0) {
    this.originX = x
    this.originY = y
    this.offsetImage(this.originX, this.originY)
  }
  resetCanvasParams() {
    this.canvasDegBeforeCrop = 0
    this.deg = 0
    this.canvasDeg = 0
  }
  resetCanvasSize(w, h) {
    const originW = w
    const originH = h
    while (this.maxWidth && this.maxHeight && (w > this.maxWidth || h > this.maxHeight)) {
      if (w > this.maxWidth) {
        let tempW = this.maxWidth
        h = tempW / w * h
        w = tempW
      }
      if (h > this.maxHeight) {
        let tempH = this.maxHeight
        w = tempH / h * w
        h = tempH
      }
    }
    this.originImageScale = w / originW
    this.canvas.width = originW
    this.canvas.height = originH
    this.upperCanvas.width = originW
    this.upperCanvas.height = originH
    this.frame.style.width = '100%'
    this.frame.style.height = '100%'
    this.frame.style.maxWidth = w + 'px'
    this.frame.style.maxHeight = h + 'px'
    this.frame.setAttribute('data-width', w)
    this.frame.setAttribute('data-height', h)
    // this.container.style.width = '100%'
    // this.container.style.height = '100%'
    // this.container.style.maxWidth = w + 'px'
    // this.container.style.maxHeight = h + 'px'
    // this.canvas.style.width = '100%'
    // this.canvas.style.height = '100%'
    // this.canvas.style.maxWidth = w + 'px'
    // this.canvas.style.maxHeight = h + 'px'
    this.container.style.width = w + 'px'
    this.container.style.height = h + 'px'
    this.container.setAttribute('data-width', w)
    this.container.setAttribute('data-height', h)
    this.canvas.style.width = w + 'px'
    this.canvas.style.height = h + 'px'
    this.canvas.setAttribute('data-width', w)
    this.canvas.setAttribute('data-height', h)
    this.canvas.style.top = 0 + 'px'
    this.canvas.style.left = 0 + 'px'
    this.view.style.width = '100%'
    this.view.style.height = '100%'
    this.view.style.maxWidth = w + 'px'
    this.view.style.maxHeight = h + 'px'
    this.view.setAttribute('data-width', w)
    this.view.setAttribute('data-height', h)
    return {
      w, h, ow: originW, oh: originH
    }

  }
  drawImg(image, isAIHandler) {
    console.log('drawImg')
    this.image = image
    //保留原图
    if (!isAIHandler) {
      this.originImage = image
    }
    this.canvas.width = this.image.width
    this.canvas.height = this.image.height
    this.upperCanvas.width = this.image.width
    this.upperCanvas.height = this.image.height
    // this.canvas.style.width = '100%'
    // this.canvas.style.height = '100%'
    // this.canvas.style.maxWidth = this.container.clientWidth + 'px'
    // this.canvas.style.maxHeight = this.container.clientHeight + 'px'
    this.canvas.style.width = this.container.clientWidth + 'px'
    this.canvas.style.height = this.container.clientHeight + 'px'
    this.upperCanvas.style.width = '100%'
    this.upperCanvas.style.height = '100%'
    // this.upperCanvas.style.maxWidth = this.container.clientWidth + 'px'
    // this.upperCanvas.style.maxHeight = this.container.clientHeight + 'px'
    this._reloadMaskImg(this.svgMask.image, this.image, this.imageType)
    if (!isAIHandler) {
      this.dispatch.render()
      this.createBrushMask()
    }
  }
  _hidden() {
    this.frame.style.opacity = 0
  }
  _show() {
    this.frame.style.opacity = 1
  }
  calculateCanvasWidthAndHeightOfRotate(deg, w, h) {
    w = Number(w), h = Number(h)
    const aspectRatio = w / h
    let odeg = deg
    deg %= 90
    if (deg % 90) {
      if (deg > 0) {
        if (w > h) {
          let a1 = COS(deg) * w
          let b2 = SIN(deg) * h
          let rw = a1 + b2
          let a2 = COS(deg) * h
          let b5 = SIN(deg) * w
          let rh = a2 + b5
          let w2 = aspectRatio * rh
          let b1 = SIN(deg) * w
          let c3 = b1 / COS(deg)
          let b3 = SIN(deg) * c3
          let rw2 = (w2 - rw) / 2
          let c4 = rw2 - b3
          let a4 = COS(deg) * c4
          let b4 = SIN(deg) * c4
          return {
            width: w2,
            height: rh,
            x: -1 * a4,
            y: -1 * (b4 + c3)
          }
        } else {
          let a2 = COS(deg) * w
          let b1 = SIN(deg) * h
          let b2 = SIN(deg) * w
          let a1 = COS(deg) * h
          let rw = a2 + b1
          let rh = a1 + b2
          let h2 = rw / aspectRatio
          let rw2 = (h2 - rh) / 2
          let c3 = rw2 + b2
          let a3 = COS(deg) * c3
          let b3 = SIN(deg) * c3
          return {
            width: rw,
            height: h2,
            x: b3,
            y: -1 * a3
          }
        }

      } else {
        deg = Math.abs(deg)
        if (w > h) {
          let a1 = COS(deg) * w
          let b2 = SIN(deg) * h
          let rw = b2 + a1
          let b1 = SIN(deg) * w
          let a4 = COS(deg) * h
          let rh = b1 + a4
          let w2 = aspectRatio * rh
          let rw2 = (w2 - rw) / 2
          let c3 = rw2 + b2
          let a3 = COS(deg) * c3
          let b3 = SIN(deg) * c3
          return {
            width: w2,
            height: rh,
            x: -1 * a3,
            y: b3
          }
        } else {
          let b1 = SIN(deg) * h
          let a4 = COS(deg) * w
          let rw = b1 + a4
          let a1 = COS(deg) * h
          let b5 = SIN(deg) * w
          let rh = a1 + b5
          let h2 = rw / aspectRatio
          let c2 = b1 / COS(deg)
          let b2 = SIN(deg) * c2
          let c3 = (h2 - rh) / 2 - b2
          let a3 = COS(deg) * c3
          let b3 = SIN(deg) * c3
          return {
            width: rw,
            height: h2,
            x: -1 * (b3 + c2),
            y: -1 * a3
          }
        }
      }

    } else if (odeg === 0) {
      return {
        width: w,
        height: h,
        x: 0,
        y: 0
      }
    } else {
      if (odeg > 0) {
        if (w > h) {
          return {
            width: w * aspectRatio,
            height: w,
            x: w,
            y: -1 * (w * aspectRatio / 2 - h / 2)
          }
        } else {
          return {
            width: h,
            height: h / aspectRatio,
            x: h / aspectRatio / 2 + w / 2,
            y: 0
          }
        }
      } else {
        if (w > h) {
          return {
            width: w * aspectRatio,
            height: w,
            x: 0,
            y: w * aspectRatio / 2 + h / 2
          }
        } else {
          return {
            width: h,
            height: h / aspectRatio,
            x: -1 * (h / aspectRatio / 2 - w / 2),
            y: h
          }
        }
      }

    }
  }
  calculateWidthAndHeightOfRotate(deg, w = this.image.width, h = this.image.height) {
    deg %= 360
    if (deg % 90 === 0) {
      if (deg % 180 === 0) {
        return { width: w, height: h }
      } else {
        return { width: h, height: w }
      }
    } else {
      if (deg > 0) {
        if (deg < 90 || (deg > 180 && deg < 270)) {
          return {
            width: Math.sin(Math.PI / 180 * (Math.abs(deg) % 90)) * h + Math.cos(Math.PI / 180 * Math.abs(deg % 90)) * w,
            height: Math.sin(Math.PI / 180 * (Math.abs(deg) % 90)) * w + Math.cos(Math.PI / 180 * Math.abs(deg % 90)) * h,
          }
        } else {
          return {
            width: Math.sin(Math.PI / 180 * (Math.abs(deg) % 90)) * w + Math.cos(Math.PI / 180 * Math.abs(deg % 90)) * h,
            height: Math.sin(Math.PI / 180 * (Math.abs(deg) % 90)) * h + Math.cos(Math.PI / 180 * Math.abs(deg % 90)) * w,
          }
        }
      } else {
        if (Math.abs(deg) < 90 || (Math.abs(deg) > 180 && Math.abs(deg) < 270)) {
          return {
            width: Math.sin(Math.PI / 180 * (Math.abs(deg) % 90)) * h + Math.cos(Math.PI / 180 * Math.abs(deg % 90)) * w,
            height: Math.sin(Math.PI / 180 * (Math.abs(deg) % 90)) * w + Math.cos(Math.PI / 180 * Math.abs(deg % 90)) * h,
          }
        } else {
          return {
            width: Math.sin(Math.PI / 180 * (Math.abs(deg) % 90)) * w + Math.cos(Math.PI / 180 * Math.abs(deg % 90)) * h,
            height: Math.sin(Math.PI / 180 * (Math.abs(deg) % 90)) * h + Math.cos(Math.PI / 180 * Math.abs(deg % 90)) * w,
          }
        }
      }
    }
  }
  resetCanvasDeg() {
    this.canvasDeg = 0;
    matrix(this.frame, this.canvasDeg)
  }
  rotate(deg, crop) {
    console.log("rotate")
    deg %= 360
    if (crop) {
      const originW = crop.operate.w, originH = crop.operate.h
      let w = crop.operate.w, h = crop.operate.h, r = w / h
      if (deg % 180) {
        while (this.maxWidth && this.maxHeight && (h > this.maxWidth || w > this.maxHeight)) {
          if (h > this.maxWidth) {
            let tempH = this.maxWidth
            h = tempH
            w = h * r
          }
          if (w > this.maxHeight) {
            let tempW = this.maxHeight
            w = tempW
            h = w / r
          }
        }
      }
      this.rotateToContainer(deg, w / originW, h / originH)
    } else {
      this.rotateToContainer(deg)
    }
  }
  changeCursor(isCircle) {
    if (isCircle) {
      this.upperCanvas.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAADBUlEQVRoge2YTYgcRRiGn6/a/fEHf8hBkATEiIeAiuJB10jQiAdF9CaiB0EwsAPT3TMgQcnJ00Z2uvuyq4KIoIgXMQdFJBFBjAG9GGUPUbwoQZEcgsJmxanXw1QgLJthqmbAQ/q51A/1fl+91dV/BS0tLS0tLS0tVy42y2BlWe6SdBtwELgfuA9wwA/ABnDMzM5UVXV2VjlnYqDb7V7lnHsGeG9CyWtmtlpV1flpc09toCiKG4GPgQOh62XgpPf+jHPunCScczeFK3Ovmb0qaU8Yu1TX9TfT5J/KQJ7n15rZ3wCSPjWzQ3Vd/zZO0+12r3HOHQaOhK6H67r+MnUOyQb6/f7CcDi8EJrRK9nr9W723v8OIGlP0zRjjV8OlyJaXl427/07IfmDKdtgMBj8IelqADP7tSzLG1LmkmRgYWHhUUnPAp80TXMyJQZA0zQXgCcBJPVTYkQb6PV685I+BzCzl1KSXkqWZZ8BPwJH8jzfHauPNjAcDu+C0U07i+f56urqv2b2BoBz7p5YfbQBM3sulMditZfDe/89gKRHYrUp98C+UH6VoN2RLMt+2hZ7YlIM3AlgZj8naHfEe//npbFjSDHgASQpQTtR7BhSDHwXylsTtDvivd+1LfbERBuQdCJUD4wdGDMJ5+4I1VPR2lhBlmUfheoLsdoxLIXyxNhROxBtYHNz8yyjldpfluXBWP12iqLYDRwFMLNfYvXRBtbX1yXpRQBJx4uiSPocuYikN0P1+aqqzsXqk5I3TbMBvBKa76bEACiK4gEzexw45b3/MCVG8ud0WPnzwHWSDi8uLh5dWVmZ+NGa5/mSmX0dmnvruo7ePjDlD01RFNczMjEKZnZ3VVWnx2nKsrxF0lvAE6Hr//mhuUin07H5+fm+pNdD17dm9oGkL8xsA0DS7cBDkp4KW4Yw5lBd139Nk39mpxJ5nu8zs7cZnUaMT2r22NbW1vG1tbWp3+YzPVbpdDo2Nze318yelrSfbccqkt7Psuz0YDD4Z5Z5W1paWlpaWlquVP4DndkNg2HRrFgAAAAASUVORK5CYII=') 24 24,pointer`
    } else {
      this.upperCanvas.style.cursor = 'default'
    }
  }
  rotateToContainer(deg, wScale = 1, hScale = 1) {
    matrix(this.frame, deg, wScale, hScale)
  }
  resetElement() {
    this.frame.style.transform = undefined
    this.container.style.transform = undefined
    this.upperCanvas.style.transform = undefined
    this.shapesElement.style.transform = undefined
    this.container.style.top = 0
    this.container.style.left = 0

  }
  resetCanvasImage() {
    this.image = this.originImage
  }
  offsetImage(x, y) {
    this.container.style.left = `${x}px`
    this.container.style.top = `${y}px`
    // this.container.style.transformOrigin = `${this.container.clientWidth * this.lastScale / 2 + x}px ${this.container.clientHeight * this.lastScale / 2 + y}px`
  }
  removeWatermarkDrawImage() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    const background = this.dispatch._getStepByType('background')
    if (background) {
      background.operate.render(background.target)
    }
    this._drawImg()
  }
  setImage(imgData) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = imgData.width
      canvas.height = imgData.height
      ctx.putImageData(imgData, 0, 0)
      const image = new Image()
      image.src = canvas.toDataURL('image/png')
      image.onload = () => {
        this.image = image
        resolve()
      }
    })
  }
  generateWatermark() {
    const canvas = document.createElement('canvas')
    canvas.width = 130
    canvas.height = 80
    const ctx = canvas.getContext('2d')
    ctx.rotate(-20 * Math.PI / 180)
    ctx.font = "14px Arial";
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.textAlign = 'left'
    ctx.fillText("VanceAI", 20, 65);
    const dataURL = canvas.toDataURL()
    const div = document.createElement('div')
    div.style.width = this.image.width + 'px'
    div.style.height = this.image.height + 'px'
    div.style.position = 'absolute'
    div.style.top = this.image.height * -1 + 'px'
    div.style.left = this.image.width * -1 + 'px'
    div.style.background = `url(${dataURL})`
    document.body.appendChild(div)
    html2canvas(div, {
      width: 750,
      height: 600,
      allowTaint: true,
      backgroundColor: 'none',
    }).then((canvas) => {
      const img = new Image()
      img.src = canvas.toDataURL()
      img.onload = () => {
        document.body.removeChild(div)
        this.watermarkImg = img
        this.dispatch.render()
      }
    })
  }
  setWatermark() {
    if (this.watermarkVisible) {
      if (this.watermarkImg) {
        const width = (Math.floor(this.canvas.width / 130) + 1) * 130
        const height = (Math.floor(this.canvas.height / 80) + 1) * 80
        this.ctx.drawImage(this.watermarkImg, 0, 0, width, height)
      }
    }
  }
  _drawImg() {
    if (!this.image) {
      return
    }
    this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height)
  }
  clearDraw() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.shapesElement.innerHTML = ''
  }
  setAction(action) {
    this.action = action
    this.event.removeEventListener()
    if (action === Action.NONE) {
      this.event.noneEvent()
    } else if (action === Action.CROP) {
      this.event.cropEvent()
    } else if (action === Action.DROW) {
      this.event.drowEvent()
    } else if (action === Action.DROP) {
      this.event.dropEvent()
    } else if (action === Action.SHAPE) {
      this.event.shapeEvent()
    } else if (action === Action.TEXT) {
      this.event.textEvent()
    }
  }
  setOptions(options) {
    this.options = options
    if (options) {
      for (let key in options) {
        this[key] = options[key]
      }
    }
  }
  createBrushMask() {
    const uuid = 'uid-' + UUID()
    this.svgMask.uuid = uuid
    const width = Number(this.container.getAttribute('data-width'))
    const height = Number(this.container.getAttribute('data-height'))
    this.svgMask.svg = this.generateSvg(width, height)
    const { g, imageDom,gcc,filter } = this.generateMask(this.svgMask.svg, width, height, this.originImage, this.image, this.svgMask.uuid)
    this.svgMask.gcc = gcc
    this.svgMask.filter = filter
    this.svgMask.image = imageDom
    this.svgMask.g = g
    this.svgMask.container.innerHTML = ''
    this.svgMask.container.append(this.svgMask.svg)
  }
  _reloadMaskImg(target, image, type, isDataURL = false) {
    if (target) {
      let database
      if (isDataURL) {
        database = image
      } else {
        database = imageToBase64(image, type)
      }
      target.setAttributeNS('http://www.w3.org/1999/xlink', 'href', database)
    }
  }
  generateMask(target, w, h, originImage, image, uuid) {
    const database = imageToBase64(image, this.imageType)
    const odatabase = imageToBase64(originImage, this.imageType)
    const gc = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const gcc = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    gc.appendChild(gcc)
    target.appendChild(gc)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask')
    mask.setAttribute('id', 'mask001')
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', w)
    rect.setAttribute('height', h)
    rect.setAttribute('fill', '#ffffff')
    mask.appendChild(rect)
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('id', 'maskg001')
    mask.appendChild(g)
    const mask2 = document.createElementNS('http://www.w3.org/2000/svg', 'mask')
    mask2.setAttribute('id', 'mask002')
    const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect2.setAttribute('width', w)
    rect2.setAttribute('height', h)
    rect2.setAttribute('fill', '#000000')
    mask2.appendChild(rect2)
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#maskg001')
    mask2.appendChild(use)
    const imageg = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    imageg.setAttribute('mask', `url("#mask001")`)
    const imageDom = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    imageDom.setAttribute('width', image.width)
    imageDom.setAttribute('height', image.height)
    imageDom.style.width = '100%'
    imageDom.style.height = '100%'
    imageDom.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', database)
    imageg.appendChild(imageDom)
    const originImageDom = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    originImageDom.setAttribute('width', image.width)
    originImageDom.setAttribute('height', image.height)
    originImageDom.style.width = '100%'
    originImageDom.style.height = '100%'
    originImageDom.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', odatabase)
    originImageDom.setAttribute('mask', `url("#mask002")`)
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
    filter.setAttribute('id', 'filter001')
    target.append(imageg)
    target.append(originImageDom)
    defs.appendChild(mask)
    defs.appendChild(mask2)
    target.append(defs)
    target.append(filter)
    return { g,gcc, imageDom, originImageDom,filter }
  }
  generateSvg(w, h, child) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.style.position = 'absolute'
    svg.style.top = '0'
    svg.style.left = '0'
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    svg.setAttribute('version', '1.1')
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
    svg.setAttribute('xmlns:svgjs', 'http://svgjs.com/svgjs')
    svg.setAttribute('width', w)
    svg.setAttribute('height', h)
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
    if (child) {
      svg.appendChild(child)
    }
    return svg
  }
  generateSvgMaskContainer() {
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.top = 0
    container.style.left = 0
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.opacity = 0
    return container
  }
  turnCanvas(val) {
    this.turnMaskOrLower = val || val === false ? val : !this.turnMaskOrLower
    if (this.turnMaskOrLower) {
      this.canvas.style.opacity = 0
      this.svgMask.container.style.opacity = 1
    } else {
      this.canvas.style.opacity = 1
      this.svgMask.container.style.opacity = 0
    }
  }
}
