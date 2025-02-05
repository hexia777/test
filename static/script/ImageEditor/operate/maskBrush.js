import { getPosition, matrix, imageToBase64 } from '../utils'
export default class MaskBrush {
  constructor({ type, uuid, lineWidth = 5, originX, originY, path, }) {
    this.uuid = uuid
    this.type = type
    this.lineWidth = lineWidth
    this.lineColor = '#ffffff'
    this.offsetX = 0
    this.offsetY = 0
    this.originX = originX
    this.originY = originY
    this.xScale = 1
    this.yScale = 1
    this.xScaleOffset = 0
    this.yScaleOffset = 0
    this.svg = null
    this.container = null
    this.position = null
    this.disabled = false
    this.selected = false
    this.target = null
    this.dom = null
    this.path = path
  }
  render(target) {
    console.log('render')
    this.disabled = false
    this.target = target
    let position = getPosition(this.path,
      this.lineWidth,
      { x: this.xScale, y: this.yScale, },
    )
    this.lineColor = this.type === MaskBrush.REMOVE ? '#000000' : '#ffffff'
    this.dom = this.drawMask(target, this.path, position, this.lineWidth, this.lineColor, this.xScale, this.yScale, this.uuid)
  }

  destory() {
    if (this.dom) {
      const domParent = this.dom.parentNode
      if (domParent) {
        domParent.removeChild(this.dom)
      }
    }
  }
  drawMask(svg, path, position, lineWidth, lineColor, xScale, yScale, uuid) {
    if (!position) {
      return
    }
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
    return polyline
  }
  static RESERVE = Symbol('reserve')
  static REMOVE = Symbol('remove')
}