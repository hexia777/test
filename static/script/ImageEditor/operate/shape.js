import { getPosition, matrix, imageToBase64 } from '../utils'
export default class Shape {
  constructor({ x, y, w, h, type, fillColor = 'none', borderWidth = 0, borderColor = '#333', opacity = 1, path, uuid, lineWidth = 5, lineColor = '#333', lineStyle = 'none', dom, deg = 0, originX, originY, }, canvas) {
    this.uuid = uuid
    this.dom = dom
    this.x = x
    // this.ox = x
    this.y = y
    // this.oy = y
    this.w = w
    // this.ow = w
    this.h = h
    // this.oh = h
    this.path = path
    this.type = type
    this.fillColor = fillColor
    this.lineWidth = lineWidth
    this.lineColor = lineColor
    this.lineStyle = lineStyle
    this.borderWidth = borderWidth
    this.borderColor = borderColor
    this.opacity = opacity
    this.offsetX = 0
    this.offsetY = 0
    this.originX = originX
    this.originY = originY
    // this.rotateOffsetX = 0
    // this.rotateOffsetY = 0
    this.xScale = 1
    this.yScale = 1
    this.xScaleOffset = 0
    this.yScaleOffset = 0
    this.svg = null
    this.container = null
    this.position = null
    this.disabled = false
    this.selected = false
    this.rotate = 0
    this.deg = 0
    this.target = null
    this.maskg = null
    this.imageDom = null
    this.originImageDom = null
    this.canvas = canvas
    this.paths = []
  }
  render(target) {
    console.log('render')
    this.disabled = false
    this.target = target
    if (this.type !== Shape.REMOVE && this.type !== Shape.RESERVE) {
      this.destory()
    }
    let position
    if (this.type === Shape.REMOVE || this.type === Shape.RESERVE) {
      if (this.paths.length) {
        position = getPosition(this.paths[this.paths.length - 1].path,
          this.lineWidth,
          { x: this.xScale, y: this.yScale, },
        )
      }
    } else {
      position = getPosition(this.path,
        this.lineWidth,
        { x: this.xScale, y: this.yScale, },
      )
      this.position = position
      if (!position) {
        return
      }
    }
    if (position) {
      this.calculatePosition(position, this.lineWidth, this.offsetX, this.offsetY, this.xScaleOffset, this.yScaleOffset)
    }
    if (this.type === Shape.RECTANGLE) {
      this._rectangleMode(target, position)
    } else if (this.type === Shape.CIRCULAR) {
      this._circularMode(target, position)
    } else if (this.type === Shape.TRIANGLE) {
      this._triangleMode(target, position)
    } else if (this.type === Shape.ARROW) {
      this._arrowMode(target, position)
    } else if (this.type === Shape.LINE) {
      this._lineMode(target, position)
    } else if (this.type === Shape.CURVE) {
      this._curveMode(target, position)
    } else if (this.type === Shape.REMOVE) {
      this._removeMode(target, position)
    } else if (this.type === Shape.RESERVE) {
      this._reserveMode(target, position)
    }
  }
  _arrowMode(target, position) {
    this.svg = document.createElement('div')
    this.svg.style.position = 'absolute'
    this.svg.style.top = '0'
    this.svg.style.left = '0'
    this.drawArrow(this.svg, this.path, position, this.lineWidth, this.lineColor, this.opacity)
    this.container = this.generateContainer(this.x, this.y, this.w, this.h, this.svg, this.rotate)
    if (this.container.parentNode !== target) {
      target.appendChild(this.container)
    }
  }
  _lineMode(target, position) {
    const line = this.drawLine(this.path, position, this.lineWidth, this.lineColor, this.fillColor, this.opacity, this.calculateDasharray(this.lineStyle, this.lineWidth))
    this.svg = this.generateSvg(this.w, this.h, line)
    this.container = this.generateContainer(this.x, this.y, this.w, this.h, this.svg, this.rotate)
    if (this.container.parentNode !== target) {
      target.appendChild(this.container)
    }
  }
  _triangleMode(target, position) {
    const triangle = this.drawTriangle(this.w, this.h, this.lineWidth, this.lineColor, this.fillColor, this.opacity, this.calculateDasharray(this.lineStyle, this.lineWidth))
    this.svg = this.generateSvg(this.w, this.h, triangle)
    this.container = this.generateContainer(this.x, this.y, this.w, this.h, this.svg, this.rotate)
    // if (this.container.parentNode !== target) {
    //   target.appendChild(this.container)
    // }
  }
  _circularMode(target, position) {
    const ellipse = this.drawCircle(this.w, this.h, this.lineWidth, this.lineColor, this.fillColor, this.opacity, this.calculateDasharray(this.lineStyle, this.lineWidth))
    this.svg = this.generateSvg(this.w, this.h, ellipse)
    this.container = this.generateContainer(this.x, this.y, this.w, this.h, this.svg, this.rotate)
    if (this.container.parentNode !== target) {
      target.appendChild(this.container)
    }
  }
  _rectangleMode(target, position) {
    this.svg = this.generateSvg(this.w, this.h)
    this.drawPath(this.svg, this.path, position, this.lineWidth, this.lineColor, this.fillColor, this.xScale, this.yScale, this.opacity, this.calculateDasharray(this.lineStyle, this.lineWidth))
    this.container = this.generateContainer(this.x, this.y, this.w, this.h, this.svg, this.rotate)
    if (this.container.parentNode !== target) {
      target.appendChild(this.container)
    }
  }
  _curveMode(target, position) {
    this.svg = this.generateSvg(this.w, this.h)
    this.drawPath(this.svg, this.path, position, this.lineWidth, this.lineColor, this.fillColor, this.xScale, this.yScale, this.opacity, this.calculateDasharray(this.lineStyle, this.lineWidth), true)
    this.container = this.generateContainer(this.x, this.y, this.w, this.h, this.svg, this.rotate)
    if (this.container.parentNode !== target) {
      target.appendChild(this.container)
    }
  }
  _removeMode(target, position) {
    console.log("removeMode")
    let path = this.paths.length ? this.paths[this.paths.length - 1] : []
    if (this.maskg) {
      this.drawMask(this.maskg, path, position, this.lineWidth, '#000000', this.xScale, this.yScale)
    } else {
      const width = Number(this.canvas.container.getAttribute('data-width'))
      const height = Number(this.canvas.container.getAttribute('data-height'))
      this.svg = this.generateSvg(width, height)
      const { g, imageDom } = this.generateMask(this.svg, width, height, this.canvas.originImage, this.canvas.image, this.uuid)
      this.imageDom = imageDom
      this.maskg = g
      this.drawMask(this.maskg, path, position, this.lineWidth, '#000000', this.xScale, this.yScale)
      this.container = this.generateContainer(0, 0, width, height, this.svg, this.rotate)
      if (this.container.parentNode !== target) {
        target.appendChild(this.container)
      }
    }
  }
  _reserveMode(target, position) {
    console.log("_reserveMode")
    const path = this.paths[this.paths.length - 1]
    if (this.maskg) {
      this.drawMask(this.maskg, path, position, this.lineWidth, '#ffffff', this.xScale, this.yScale)
    } else {
      const width = Number(this.canvas.container.getAttribute('data-width'))
      const height = Number(this.canvas.container.getAttribute('data-height'))
      this.svg = this.generateSvg(width, height)
      const { g, imageDom } = this.generateMask(this.svg, width, height, this.canvas.originImage, this.canvas.image, this.uuid)
      this.imageDom = imageDom
      this.maskg = g
      this.drawMask(this.maskg, path, position, this.lineWidth, '#ffffff', this.xScale, this.yScale)
      this.container = this.generateContainer(0, 0, width, height, this.svg, this.rotate)
      if (this.container.parentNode !== target) {
        target.appendChild(this.container)
      }
    }
  }
  _reloadImg(target, image, type) {
    if (target) {
      const database = imageToBase64(image, type)
      target.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', database)
    }
  }
  calculatePosition(position, lineWidth, offsetX, offsetY, xScaleOffset, yScaleOffset) {
    this.y = position.oy - Number(lineWidth) / 2 + offsetY + yScaleOffset - (this.canvas.originY - this.originY)
    this.x = position.ox - Number(lineWidth) / 2 + offsetX + xScaleOffset - (this.canvas.originX - this.originX)
    this.w = position.maxx - position.minx ? position.width + Number(lineWidth) : position.width
    this.h = position.maxy - position.miny ? position.height + Number(lineWidth) : position.height
  }
  generateMask(target, w, h, originImage, image, uuid) {
    const database = imageToBase64(image, this.canvas.imageType)
    const odatabase = imageToBase64(originImage, this.canvas.imageType)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask')
    mask.setAttribute('id', 'mask001_' + uuid)
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', w)
    rect.setAttribute('height', h)
    rect.setAttribute('fill', '#ffffff')
    mask.appendChild(rect)
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('id', 'maskg001_' + uuid)
    mask.appendChild(g)
    const mask2 = document.createElementNS('http://www.w3.org/2000/svg', 'mask')
    mask2.setAttribute('id', 'mask002_' + uuid)
    const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect2.setAttribute('width', w)
    rect2.setAttribute('height', h)
    rect2.setAttribute('fill', '#000000')
    mask2.appendChild(rect2)
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    use.setAttribute('href', '#maskg001_' + uuid)
    mask2.appendChild(use)
    const imageg = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    imageg.setAttribute('mask', `url("#mask001_${uuid}")`)
    const imageDom = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    imageDom.setAttribute('width', w)
    imageDom.setAttribute('height', h)
    imageDom.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', database)
    imageg.appendChild(imageDom)
    const originImageDom = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    originImageDom.setAttribute('width', w)
    originImageDom.setAttribute('height', h)
    originImageDom.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', odatabase)
    originImageDom.setAttribute('mask', `url("#mask002_${uuid}")`)
    defs.appendChild(mask)
    defs.appendChild(mask2)
    target.append(imageg)
    target.append(originImageDom)
    target.append(defs)
    return { g, imageDom, originImageDom }
  }
  generateSvg(w, h, child) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.style.position = 'absolute'
    svg.style.top = '0'
    svg.style.left = '0'
    // <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" 
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
  generateContainer(x, y, w, h, child, rotate) {
    if (this.container) {
      this.container.style.position = 'absolute'
      this.container.style.top = y + 'px'
      this.container.style.left = x + 'px'
      this.container.style.width = w + 'px'
      this.container.style.height = h + 'px'
      matrix(this.container, rotate)
      // this.container.style.transform = `rotate(${rotate}deg)`
      this.container.appendChild(child)
      return this.container
    } else {
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.top = y + 'px'
      container.style.left = x + 'px'
      container.style.width = w + 'px'
      container.style.height = h + 'px'
      container.appendChild(child)
      this.target.appendChild(container)
      return container
    }
  }
  destory(thoroughly = false) {
    if (this.svg) {
      const parent = this.svg.parentNode
      if (parent) {
        parent.removeChild(this.svg)
      }
    }
    if (this.dom) {
      const domParent = this.dom.parentNode
      if (this.dom.parentNode) {
        domParent.removeChild(this.dom)
      }
    }
    if (this.container) {
      this.container.innerHTML = ''
    }
    if (thoroughly) {
      if (this.container) {
        const domParent = this.container.parentNode
        if (this.container.parentNode) {
          domParent.removeChild(this.container)
        }
      }
      this.container = null
    }
  }
  drawMask(svg, path, position, lineWidth, lineColor, xScale, yScale) {
    if (!position) {
      return
    }
    const uuid = path.uuid
    path = path.path
    let points = ''
    for (let i = 0; i < path.length; i++) {
      const { x, y, offsetX = 0, offsetY = 0 } = path[i]
      if (i === 0) {
        points += `${x * xScale + lineWidth / 2 + offsetX},${y * yScale + lineWidth / 2 + offsetY} `
      } else {
        points += `${x * xScale + lineWidth / 2 + offsetX},${y * yScale + lineWidth / 2 + offsetY} `
      }
    }
    const polyline = document.querySelector(`#${uuid}`)
    if (polyline) {
      polyline.setAttribute('points', points)
    } else {
      const ctx = d3.select(svg)
      ctx.append('polyline')
        .attr('id', uuid)
        .attr('points', points)
        .attr('stroke-width', lineWidth)
        .attr('stroke', lineColor)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
    }

  }
  drawArrow(svg, path, position, lineWidth, lineColor, opacity) {
    const r = lineWidth / 20
    const arrowWidth = 64 * r
    const arrowHeight = 86 * r
    const line = this.drawLine(path, position, lineWidth, lineColor, { offsetX: arrowWidth / 4, offsetY: arrowHeight / 4 }, opacity)
    const svg1 = this.generateSvg(this.w, this.h, line)
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    arrow.style.position = 'absolute'
    arrow.style.top = '0'
    arrow.style.left = '0'
    arrow.setAttribute('fill', lineColor)
    arrow.setAttribute('stroke-opacity', opacity)
    arrow.setAttribute('fill-opacity', opacity)
    arrow.setAttribute('d', `M60 36.3l-52.1-35.2c-4.2-3-9.9 1.5-7.2 5.4l20.4 24.1v22.6l-20.4 24.1c-2.4 3.9 3 8.7 7.2 5.4l52.1-35.2c4.2-3.1 3.9-8.2 0-11.2z`)
    const svg2 = this.generateSvg(64, 86, arrow)

    const hypotenuse = Math.sqrt(Math.pow(position.width, 2) + Math.pow(position.height, 2))
    svg2.setAttribute('width', arrowWidth)
    svg2.setAttribute('height', arrowHeight)

    if (position.ox === path[0].x && position.oy === path[0].y) { //第三象限
      svg2.style.left = position.maxx - position.minx + lineWidth / 2 - arrowWidth / 4 * 3
      svg2.style.top = position.maxy - position.miny + lineWidth / 2 - arrowHeight / 4 * 3
      svg2.style.transform = `matrix(${position.width / hypotenuse},${position.height / hypotenuse},${-(position.height / hypotenuse)},${position.width / hypotenuse},0,0)`
    } else if (position.omaxx === path[0].x && position.omaxy === path[0].y) { //第二象限
      svg2.style.left = lineWidth / 2 - arrowWidth / 4
      svg2.style.top = lineWidth / 2 - arrowHeight / 4
      svg2.style.transform = `matrix(${-(position.width / hypotenuse)},${-(position.height / hypotenuse)},${position.height / hypotenuse},${-(position.width / hypotenuse)},0,0)`
    } else if (position.ox === path[0].x && position.omaxy === path[0].y) {//第一象限
      svg2.style.left = position.maxx - position.minx + lineWidth / 2 - arrowWidth / 4 * 3
      svg2.style.top = lineWidth / 2 - arrowHeight / 4
      svg2.style.transform = `matrix(${position.width / hypotenuse},${-(position.height / hypotenuse)},${position.height / hypotenuse},${position.width / hypotenuse},0,0)`
    } else {//第四象限
      svg2.style.left = lineWidth / 2 - arrowWidth / 4
      svg2.style.top = position.maxy - position.miny + lineWidth / 2 - arrowWidth
      svg2.style.transform = `matrix(${-(position.width / hypotenuse)},${position.height / hypotenuse},${-(position.height / hypotenuse)},${-(position.width / hypotenuse)},0,0)`
    }
    svg.appendChild(svg1)
    svg.appendChild(svg2)
  }
  drawLine(path, position, lineWidth, lineColor, { offsetX = 0, offsetY = 0 }, opacity, lineStyle) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.style.position = 'absolute'
    line.style.top = '0'
    line.style.left = '0'
    line.setAttribute('stroke-width', lineWidth)
    line.setAttribute('stroke', lineColor)
    line.setAttribute('stroke-linecap', 'round')
    line.setAttribute('stroke-opacity', opacity)
    if (lineStyle) {
      line.setAttribute('stroke-dasharray', lineStyle)
    }
    if (position.ox === path[0].x && position.oy === path[0].y) {//第三象限
      line.setAttribute('x1', lineWidth / 2)
      line.setAttribute('y1', lineWidth / 2)
      line.setAttribute('x2', position.maxx - position.minx + lineWidth / 2 - offsetX)
      line.setAttribute('y2', position.maxy - position.miny + lineWidth / 2 - offsetY)
    } else if (position.omaxx === path[0].x && position.omaxy === path[0].y) {//第二象限
      line.setAttribute('x1', position.maxx - position.minx + lineWidth / 2)
      line.setAttribute('y1', position.maxy - position.miny + lineWidth / 2)
      line.setAttribute('x2', lineWidth / 2 + offsetX)
      line.setAttribute('y2', lineWidth / 2 + offsetY)
    } else if (position.ox === path[0].x && position.omaxy === path[0].y) {//第一象限
      line.setAttribute('x1', lineWidth / 2)
      line.setAttribute('y1', position.maxy - position.miny + lineWidth / 2)
      line.setAttribute('x2', position.maxx - position.minx + lineWidth / 2 - offsetX)
      line.setAttribute('y2', lineWidth / 2 + offsetY)
    } else {
      line.setAttribute('x1', position.maxx - position.minx + lineWidth / 2)//第四象限
      line.setAttribute('y1', lineWidth / 2)
      line.setAttribute('x2', lineWidth / 2 + offsetX)
      line.setAttribute('y2', position.maxy - position.miny + lineWidth / 2 - offsetY)
    }
    return line
  }
  drawTriangle(w, h, lineWidth, lineColor, fillColor, opacity, lineStyle) {
    const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    triangle.style.position = 'absolute'
    triangle.style.top = '0'
    triangle.style.left = '0'
    triangle.setAttribute('stroke-width', lineWidth)
    triangle.setAttribute('stroke', lineColor)
    triangle.setAttribute('stroke-linecap', 'round')
    triangle.setAttribute('stroke-opacity', opacity)
    triangle.setAttribute('fill-opacity', opacity)
    if (lineStyle) {
      triangle.setAttribute('stroke-dasharray', lineStyle)
    }
    triangle.setAttribute('fill', !fillColor || fillColor === 'transparent' ? 'none' : fillColor)
    triangle.setAttribute('points', `${w / 2},${lineWidth} ${lineWidth},${h - lineWidth / 2} ${w - lineWidth},${h - lineWidth / 2}`)
    return triangle
  }
  drawCircle(w, h, lineWidth, lineColor, fillColor, opacity, lineStyle) {
    const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
    ellipse.style.position = 'absolute'
    ellipse.style.top = '0'
    ellipse.style.left = '0'
    ellipse.setAttribute('stroke-width', lineWidth)
    ellipse.setAttribute('stroke', lineColor)
    ellipse.setAttribute('stroke-linecap', 'round')
    ellipse.setAttribute('stroke-opacity', opacity)
    ellipse.setAttribute('fill-opacity', opacity)
    if (lineStyle) {
      ellipse.setAttribute('stroke-dasharray', lineStyle)
    }
    ellipse.setAttribute('fill', !fillColor || fillColor === 'transparent' ? 'none' : fillColor)
    ellipse.setAttribute('cx', w / 2)
    ellipse.setAttribute('cy', h / 2)
    ellipse.setAttribute('rx', w / 2 - lineWidth / 2)
    ellipse.setAttribute('ry', h / 2 - lineWidth / 2)
    return ellipse
  }
  drawPath(svg, path, position, lineWidth, lineColor, fillColor, xScale, yScale, opacity, lineStyle, isRound = false) {
    const ctx = d3.select(svg)
    const canvas = d3.path()
    for (let i = 0; i < path.length; i++) {
      const curr = path[i]
      const tx = curr.x * xScale - position.minx + lineWidth / 2 + (curr.offsetX || 0)
      const ty = curr.y * yScale - position.miny + lineWidth / 2 + (curr.offsetY || 0)
      if (i === 0) {
        canvas.moveTo(tx, ty)
      } else {
        canvas.lineTo(tx, ty)
      }
    }
    ctx.append('path')
      .attr('d', canvas.toString())
      .attr('stroke-width', lineWidth)
      .attr('stroke', lineColor)
      .attr('stroke-opacity', opacity)
      .attr('fill-opacity', opacity)
      .attr('fill-linecap', 'round')
      .attr('fill', !fillColor || fillColor === 'transparent' ? 'none' : fillColor)
    if (lineStyle) {
      ctx.attr('stroke-dasharray', lineStyle)
    }
    if (isRound) {
      ctx.attr('stroke-linecap', 'round')
    }
  }
  setOffset(offsetX, offsetY) {
    this.offsetX += offsetX
    this.offsetY += offsetY
  }
  setScaleOffset(offsetX, offsetY) {
    this.xScaleOffset += offsetX
    this.yScaleOffset += offsetY
  }
  setPath(path) {
    this.path = path
  }
  setRotate(rotate) {
    this.rotate = rotate
  }
  calculateDasharray(item, lineWidth = 5) {
    if ((item === 'none' || !item) && item.indexOf(':') === -1) {
      return item
    } else {
      const arr = item.split(':')
      return `${lineWidth * Number(arr[0])} ${lineWidth * Number(arr[1])}`
    }
  }
  // setRotateOffset(x = 0, y = 0) {
  //   this.rotateOffsetX = x
  //   this.rotateOffsetY = y
  // }
  static RECTANGLE = Symbol('rectangle')
  static CIRCULAR = Symbol('circular')
  static TRIANGLE = Symbol('triangle')
  static ARROW = Symbol('arrow')
  static LINE = Symbol('line')
  static CURVE = Symbol('curve')
  static REMOVERRUSH = Symbol('remove_brush')
  static RESERVE = Symbol('reserve')
  static REMOVE = Symbol('remove')
}
