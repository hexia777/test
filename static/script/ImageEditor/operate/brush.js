import { getPosition } from '../utils'
export default class Brush {
  constructor({ uuid, path, type, lineWidth, lineColor, dom }, canvas) {
    this.uuid = uuid
    this.path = path
    this.lineWidth = lineWidth
    this.lineColor = lineColor
    this.dom = dom
    this.x = 0
    this.y = 0
    this.w = 0
    this.h = 0
    this.svg = null
    this.type = type
    this.container = null
    this.position = null
    this.disabled = false
    this.selected = false
    this.canvas = canvas
    this.target = null
    this.mask = {
      paths: [],
      maskg: null,
      imageDom: null,
      originImageDom: null,
      svg: null
    }

    this.mosaic = {
      imageData: null,
      originImageData: null,
      number: 9,
      size: 5,
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

  render(target) {
    console.log('render')
    this.disabled = false
    this.target = target
    if (this.type !== Brush.REMOVE && this.type !== Brush.RESERVE) {
      this.destory()
    }
    let position
    if (this.type === Brush.REMOVE || this.type === Brush.RESERVE) {
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
    if (this.type === Brush.REMOVE) {
      this._removeMode(target, position)
    } else if (this.type === Brush.RESERVE) {
      this._reserveMode(target, position)
    } else if (this.type === Brush.MOSAIC) {
      this._mosaicMode(target, position)
    }
  }
  _mosaicMode(target, position) {
    console.log("_mosaicMode")
    if (!this.mosaic.imageData) {
      const canvasImage = document.createElement('canvas')
      canvasImage.width = this.canvas.image.width
      canvasImage.height = this.canvas.image.height
      const ctxImage = canvasImage.getContext('2d')
      ctxImage.drawImage(this.canvas.image, 0, 0, canvasImage.width, canvasImage.height)
      this.mosaic.imageData = ctxImage.getImageData(0, 0, canvasImage.width, canvasImage.height)
    }
    const r = this.canvas.canvas.width / Number(this.canvas.container.getAttribute('data-width'))
    if (!this.mosaic.originImageData) {
      const canvas = document.createElement('canvas')
      canvas.width = this.canvas.originImage.width
      canvas.height = this.canvas.originImage.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(this.canvas.originImage, 0, 0, canvas.width, canvas.height)
      this.mosaic.originImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    }

    for (let i = 0; i < this.path.length; i++) {
      const x = this.path[i].x * r
      const y = this.path[i].y * r
      this._drawMosaic(x, y, this.canvas.canvas.width, this.canvas.canvas.height, this.mosaic.imageData.data, this.mosaic.originImageData.data)
    }
    target.getContext('2d').putImageData(this.mosaic.imageData, 0, 0)
  }
  _removeMode(target, position) {
    console.log("removeMode")
    let path = this.mask.paths.length ? this.mask.paths[this.mask.paths.length - 1] : []
    if (this.mask.maskg) {
      this.drawMask(this.mask.maskg, path, position, this.lineWidth, '#000000')
    } else {
      const width = Number(this.canvas.container.getAttribute('data-width'))
      const height = Number(this.canvas.container.getAttribute('data-height'))
      this.mask.svg = this.generateSvg(width, height)
      const { g, imageDom } = this.generateMask(this.mask.svg, width, height, this.canvas.originImage, this.canvas.image, this.uuid)
      this.mask.imageDom = imageDom
      this.mask.maskg = g
      this.drawMask(this.mask.maskg, path, position, this.lineWidth, '#000000')
      this.container = this.generateContainer(0, 0, width, height, this.mask.svg, this.rotate)
      if (this.container.parentNode !== target) {
        target.appendChild(this.container)
      }
    }
  }
  _reserveMode(target, position) {
    console.log("_reserveMode")
    let path = this.mask.paths.length ? this.mask.paths[this.mask.paths.length - 1] : []
    if (this.mask.maskg) {
      this.drawMask(this.mask.maskg, path, position, this.lineWidth, '#ffffff', this.xScale, this.yScale)
    } else {
      const width = Number(this.canvas.container.getAttribute('data-width'))
      const height = Number(this.canvas.container.getAttribute('data-height'))
      this.mask.svg = this.generateSvg(width, height)
      const { g, imageDom } = this.generateMask(this.mask.svg, width, height, this.canvas.originImage, this.canvas.image, this.uuid)
      this.mask.imageDom = imageDom
      this.mask.maskg = g
      this.drawMask(this.mask.maskg, path, position, this.lineWidth, '#ffffff')
      this.container = this.generateContainer(0, 0, width, height, this.mask.svg, this.rotate)
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
  _drawMosaic(x, y, w, h, modifyPxData, originalPxData, mosaicSize = this.mosaic.size, mosaicNum = this.mosaic.number) {
    x = Number(x.toFixed(0))
    y = Number(y.toFixed(0))
    for (let i = x - mosaicSize * mosaicNum; i < x + mosaicSize * mosaicNum; i = i + 2 * mosaicSize + 1) {
      for (let j = y - mosaicSize * mosaicNum; j < y + mosaicSize * mosaicNum; j = j + 2 * mosaicSize + 1) {
        //中心点(x,y)
        //注意！这里的if判断是为了把画笔处理成圆的，有两种方案，下面细述，如果把if判断去掉，画笔默认是正方形的
        // if(Math.pow(i-x,2)+Math.pow(j-y,2) <= Math.pow(mosaicSize*mosaicNum/2,2)){
        if (!((i == x - mosaicSize * mosaicNum && j == y - mosaicSize * mosaicNum) || (i == x - mosaicSize * mosaicNum && j == y - mosaicSize * mosaicNum + 2 * mosaicSize + 1) ||
          (i == x - mosaicSize * mosaicNum && j == y - mosaicSize * mosaicNum + 4 * mosaicSize + 2) || (i == x - mosaicSize * mosaicNum && j == y - mosaicSize * mosaicNum + 12 * mosaicSize + 6) ||
          (i == x - mosaicSize * mosaicNum && j == y - mosaicSize * mosaicNum + 14 * mosaicSize + 7) || (i == x - mosaicSize * mosaicNum && j == y - mosaicSize * mosaicNum + 16 * mosaicSize + 8) ||
          (i == x - mosaicSize * mosaicNum + 16 * mosaicSize + 8 && j == y - mosaicSize * mosaicNum) || (i == x - mosaicSize * mosaicNum + 16 * mosaicSize + 8 && j == y - mosaicSize * mosaicNum + 2 * mosaicSize + 1) ||
          (i == x - mosaicSize * mosaicNum + 16 * mosaicSize + 8 && j == y - mosaicSize * mosaicNum + 4 * mosaicSize + 2) || (i == x - mosaicSize * mosaicNum + 16 * mosaicSize + 8 && j == y - mosaicSize * mosaicNum + 12 * mosaicSize + 6) ||
          (i == x - mosaicSize * mosaicNum + 16 * mosaicSize + 8 && j == y - mosaicSize * mosaicNum + 14 * mosaicSize + 7) || (i == x - mosaicSize * mosaicNum + 16 * mosaicSize + 8 && j == y - mosaicSize * mosaicNum + 16 * mosaicSize + 8) ||
          (i == x - mosaicSize * mosaicNum + 2 * mosaicSize + 1 && j == y - mosaicSize * mosaicNum) || (i == x - mosaicSize * mosaicNum + 4 * mosaicSize + 2 && j == y - mosaicSize * mosaicNum) ||
          (i == x - mosaicSize * mosaicNum + 12 * mosaicSize + 6 && j == y - mosaicSize * mosaicNum) || (i == x - mosaicSize * mosaicNum + 14 * mosaicSize + 7 && j == y - mosaicSize * mosaicNum) ||
          (i == x - mosaicSize * mosaicNum + 2 * mosaicSize + 1 && j == y - mosaicSize * mosaicNum + 16 * mosaicSize + 8) || (i == x - mosaicSize * mosaicNum + 4 * mosaicSize + 2 && j == y - mosaicSize * mosaicNum + 16 * mosaicSize + 8) ||
          (i == x - mosaicSize * mosaicNum + 12 * mosaicSize + 6 && j == y - mosaicSize * mosaicNum + 16 * mosaicSize + 8) || (i == x - mosaicSize * mosaicNum + 14 * mosaicSize + 7 && j == y - mosaicSize * mosaicNum + 16 * mosaicSize + 8))) {
          let sumR = 0;
          let sumG = 0;
          let sumB = 0;
          //找他周围的元素 
          for (let tx = -mosaicSize; tx <= mosaicSize; tx++) {
            for (let ty = -mosaicSize; ty <= mosaicSize; ty++) {
              let xx = i + tx;
              let yy = j + ty;
              let pp = yy * w + xx; //周围的元素。  
              sumR += originalPxData[pp * 4 + 0];
              sumG += originalPxData[pp * 4 + 1];
              sumB += originalPxData[pp * 4 + 2];
            }
          }

          let totlal = (2 * mosaicSize + 1) * (2 * mosaicSize + 1);
          let avgR = sumR / totlal;
          let avgG = sumG / totlal;
          let avgB = sumB / totlal;

          for (let tx = -mosaicSize; tx <= mosaicSize; tx++) {
            for (let ty = -mosaicSize; ty <= mosaicSize; ty++) {
              let xx = i + tx;
              let yy = j + ty;
              let pp = yy * h + xx; //周围的元素。  
              modifyPxData[pp * 4 + 0] = avgR;
              modifyPxData[pp * 4 + 1] = avgG;
              modifyPxData[pp * 4 + 2] = avgB;
            }
          }
        }
      }
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
    const polyline = docu
    ment.querySelector(`#${uuid}`)
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
  static REMOVERRUSH = Symbol('remove_brush')
  static RESERVE = Symbol('reserve')
  static REMOVE = Symbol('remove')
  static MOSAIC = Symbol('mosaic')
}
