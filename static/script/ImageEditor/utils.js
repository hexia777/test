import Canvas from './canvas'
export const isCanvas = (target) => {
  return target instanceof Canvas
}
export const setTransform = (transform, target, val) => {
  const str = transform.replace(' ')
  if (str.indexOf(target) !== -1) {
    let exec = null
    const arr = []
    const regx = /[a-z]+\([^\)]+\)/gi
    while ((exec = regx.exec(str)) && exec[0]) {
      if (exec[0].indexOf(target) !== -1) {
        arr.push(`${target}(${val})`)
      } else {
        arr.push(exec[0])
      }
    }
    return arr.join(' ')
  } else {
    transform += ` ${target}(${val})`
    return transform
  }
}
export const UUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
export const getPosition = (path, lineWidth, scale) => {
  if (!path || !path.length) {
    return false
  }
  let minx = path[0].x * scale.x,
    maxx = path[0].x * scale.x,
    miny = path[0].y * scale.y,
    maxy = path[0].y * scale.y,
    ox = path[0].x,
    oy = path[0].y,
    omaxx = path[0].x,
    omaxy = path[0].y
  path.forEach((item) => {
    if (item.x * scale.x < minx) {
      minx = item.x * scale.x
      ox = item.x
    }
    if (item.x * scale.x > maxx) {
      maxx = item.x * scale.x
      omaxx = item.x
    }
    if (item.y * scale.y < miny) {
      miny = item.y * scale.y
      oy = item.y
    }
    if (item.y * scale.y > maxy) {
      maxy = item.y * scale.y
      omaxy = item.y
    }
  })
  return {
    minx: Math.round(minx),
    maxx: Math.round(maxx),
    miny: Math.round(miny),
    maxy: Math.round(maxy),
    ox: Math.round(ox),
    oy: Math.round(oy),
    omaxx: Math.round(omaxx),
    omaxy: Math.round(omaxy),
    width: (maxx - minx) > lineWidth ? Math.round(maxx - minx) : lineWidth,
    height: (maxy - miny) > lineWidth ? Math.round(maxy - miny) : lineWidth,
    ow: (omaxx - ox) > lineWidth ? Math.round(omaxx - ox) : lineWidth,
    oh: (omaxy - oy) > lineWidth ? Math.round(omaxy - oy) : lineWidth,
  }
}

export const isOnTheArea = (currPoint, targetArea, curr, canvasDeg = 0, deg = 0) => {
  const { lt, lb, rt, rb } = calculateAfterRotateVertex(targetArea, curr, canvasDeg, deg)
  return pointInRect({ x: currPoint.x, y: currPoint.y }, { lt, lb, rt, rb })

}
export const calculateAfterRotateVertex = (targetArea, curr, canvasDeg = 0, deg = 0) => {
  let lt, lb, rt, rb, lc, rc, tc, bc, center
  if (canvasDeg === 90 || canvasDeg === -270) {
    lt = pointAfterRotating(canvasDeg, targetArea.x, targetArea.y + targetArea.h, targetArea.x, targetArea.y)
    lb = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w, targetArea.y + targetArea.h, targetArea.x, targetArea.y)
    rt = pointAfterRotating(canvasDeg, targetArea.x, targetArea.y, targetArea.x, targetArea.y)
    rb = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w, targetArea.y, targetArea.x, targetArea.y)


    lc = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w / 2, targetArea.y + targetArea.h, targetArea.x, targetArea.y)
    rc = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w / 2, targetArea.y, targetArea.x, targetArea.y)

    bc = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w, targetArea.y + targetArea.h / 2, targetArea.x, targetArea.y)
    tc = pointAfterRotating(canvasDeg, targetArea.x, targetArea.y + targetArea.h / 2, targetArea.x, targetArea.y)

  } else if (Math.abs(canvasDeg) === 180) {
    lt = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w, targetArea.y + targetArea.h, targetArea.x, targetArea.y)
    lb = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w, targetArea.y, targetArea.x, targetArea.y)
    rt = pointAfterRotating(canvasDeg, targetArea.x, targetArea.y + targetArea.h, targetArea.x, targetArea.y)
    rb = pointAfterRotating(canvasDeg, targetArea.x, targetArea.y, targetArea.x, targetArea.y)

    rc = pointAfterRotating(canvasDeg, targetArea.x, targetArea.y + targetArea.h / 2, targetArea.x, targetArea.y)
    lc = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w, targetArea.y + targetArea.h / 2, targetArea.x, targetArea.y)
    bc = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w / 2, targetArea.y, targetArea.x, targetArea.y)
    tc = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w / 2, targetArea.y + targetArea.h, targetArea.x, targetArea.y)
  } else if (canvasDeg === 270 || canvasDeg === - 90) {
    lt = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w, targetArea.y, targetArea.x, targetArea.y)
    lb = pointAfterRotating(canvasDeg, targetArea.x, targetArea.y, targetArea.x, targetArea.y)
    rt = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w, targetArea.y + targetArea.h, targetArea.x, targetArea.y)
    rb = pointAfterRotating(canvasDeg, targetArea.x, targetArea.y + targetArea.h, targetArea.x, targetArea.y)

    lc = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w / 2, targetArea.y, targetArea.x, targetArea.y)
    rc = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w / 2, targetArea.y + targetArea.h, targetArea.x, targetArea.y)
    tc = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w, targetArea.y + targetArea.h / 2, targetArea.x, targetArea.y)
    bc = pointAfterRotating(canvasDeg, targetArea.x, targetArea.y + targetArea.h / 2, targetArea.x, targetArea.y)
  } else {
    lt = pointAfterRotating(canvasDeg, targetArea.x, targetArea.y, targetArea.x, targetArea.y)
    lb = pointAfterRotating(canvasDeg, targetArea.x, targetArea.y + targetArea.h, targetArea.x, targetArea.y)
    rt = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w, targetArea.y, targetArea.x, targetArea.y)
    rb = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w, targetArea.y + targetArea.h, targetArea.x, targetArea.y)

    lc = pointAfterRotating(canvasDeg, targetArea.x, targetArea.y + targetArea.h / 2, targetArea.x, targetArea.y)
    rc = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w, targetArea.y + targetArea.h / 2, targetArea.x, targetArea.y)
    tc = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w / 2, targetArea.y, targetArea.x, targetArea.y)
    bc = pointAfterRotating(canvasDeg, targetArea.x + targetArea.w / 2, targetArea.y + targetArea.h, targetArea.x, targetArea.y)
  }
  center = { x: lt.x + curr.w / 2, y: lt.y + curr.h / 2 }
  lt = pointAfterRotating(deg, lt.x, lt.y, center.x, center.y)
  lb = pointAfterRotating(deg, lb.x, lb.y, center.x, center.y)
  rt = pointAfterRotating(deg, rt.x, rt.y, center.x, center.y)
  rb = pointAfterRotating(deg, rb.x, rb.y, center.x, center.y)

  lc = pointAfterRotating(deg, lc.x, lc.y, center.x, center.y)
  rc = pointAfterRotating(deg, rc.x, rc.y, center.x, center.y)
  tc = pointAfterRotating(deg, tc.x, tc.y, center.x, center.y)
  bc = pointAfterRotating(deg, bc.x, bc.y, center.x, center.y)
  return { lt, lb, rt, rb, lc, rc, tc, bc, center }

}
export const isOnThePath = (currPoint, draw) => {
  for (let i = 0; i < draw.path.length; i++) {
    const curr = draw.path[i]
    if (currPoint.x >= curr.x * draw.xScale - draw.position.minx + draw.x - draw.lineWidth &&
      currPoint.x <= curr.x * draw.xScale - draw.position.minx + draw.x + draw.lineWidth &&
      currPoint.y >= curr.y * draw.yScale - draw.position.miny + draw.y - draw.lineWidth &&
      currPoint.y <= curr.y * draw.yScale - draw.position.miny + draw.y + draw.lineWidth
    ) {
      return true
    }
  }
  return false
}
export const SIN = (deg) => {
  return Math.sin(deg * Math.PI / 180)
}
export const COS = (deg) => {
  return Math.cos(deg * Math.PI / 180)
}
export const matrix = (target, deg, wScale = 1, hScale = 1, offsetX = 0, offsetY = 0) => {
  deg %= 360
  target.style.transform = `matrix(${COS(deg) * wScale},${SIN(deg) * hScale},${-1 * SIN(deg) * wScale},${COS(deg) * hScale},${offsetX},${offsetY})`
}
export const angle = (x, y) => {
  const radian = Math.atan(y / x);//弧度
  let angle = Math.floor(180 / (Math.PI / radian));//弧度转角度
  return angle;
}
export const canvasToImage = (canvas, imageType = 'image/png') => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const img = new Image()
      img.src = window.URL.createObjectURL(blob);
      img.onload = () => {
        resolve(img)
      }
    }, imageType)
  })

}
export const pointAfterRotating = (deg = 0, x = 0, y = 0, rx = 0, ry = 0) => {
  let fx
  let fy
  fx = ((x - rx) * COS(deg)) - ((y - ry) * SIN(deg)) + rx
  fy = ((y - ry) * COS(deg)) + ((x - rx) * SIN(deg)) + ry
  return {
    x: fx,
    y: fy
  }
}
export const pointInRect = (p, rect) => {
  let a = (rect.lt.x - rect.lb.x) * (p.y - rect.lb.y) - (rect.lt.y - rect.lb.y) * (p.x - rect.lb.x);
  let b = (rect.rt.x - rect.lt.x) * (p.y - rect.lt.y) - (rect.rt.y - rect.lt.y) * (p.x - rect.lt.x);
  let c = (rect.rb.x - rect.rt.x) * (p.y - rect.rt.y) - (rect.rb.y - rect.rt.y) * (p.x - rect.rt.x);
  let d = (rect.lb.x - rect.rb.x) * (p.y - rect.rb.y) - (rect.lb.y - rect.rb.y) * (p.x - rect.rb.x);
  return (a > 0 && b > 0 && c > 0 && d > 0) || (a < 0 && b < 0 && c < 0 && d < 0)
}

export const imageToBase64 = (image, type = 'png') => {
  var canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, image.width, image.height);
  var dataURL = canvas.toDataURL("image/" + type);
  return dataURL;
}