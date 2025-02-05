import { blobToImagePath } from '@/static/script/utils'
import Canvas from '../canvas'
export default class Background {
  constructor(val, blurSize = 0, isImage = false) {
    this.fill = val
    this.blurSize = blurSize
    this.isImage = isImage
  }
  render(canvas) {
    if (canvas instanceof Canvas) {
      canvas = canvas.canvas
    }
    let ctx = canvas.getContext('2d')
    if (this.isImage) {
      let sx, sy, width, height, swidth, sheight
      if (this.fill.width > this.fill.height) {
        if (this.fill.height > canvas.height) {
          sx = this.fill.width / 2 - canvas.width / 2
          sy = this.fill.height / 2 - canvas.height / 2
          width = this.fill.width
          height = this.fill.height
        } else {
          if (canvas.width > canvas.height) {
            width = canvas.width
            height = width / (this.fill.width / this.fill.height)
            sx = (width / 2 - canvas.width / 2) / (width / this.fill.width)
            sy = (height / 2 - canvas.height / 2) / (height / this.fill.height)
          } else {
            height = canvas.height
            width = height * (this.fill.width / this.fill.height)
            sx = (width / 2 - canvas.width / 2) / (width / this.fill.width)
            sy = (height / 2 - canvas.height / 2) / (height / this.fill.height)
          }
        }
      } else {
        if (this.fill.width > canvas.width) {
          sx = this.fill.width / 2 - canvas.width / 2
          sy = this.fill.height / 2 - canvas.height / 2
          width = this.fill.width
          height = this.fill.height
        } else {
          if (canvas.width > canvas.height) {
            width = canvas.width
            height = width / (this.fill.width / this.fill.height)
            sx = (width / 2 - canvas.width / 2) / (width / this.fill.width)
            sy = (height / 2 - canvas.height / 2) / (height / this.fill.height)
          } else {
            height = canvas.height
            width = height * (this.fill.width / this.fill.height)
            sx = (width / 2 - canvas.width / 2) / (width / this.fill.width)
            sy = (height / 2 - canvas.height / 2) / (height / this.fill.height)
          }
        }
      }
      swidth = canvas.width / (width / this.fill.width)
      sheight = canvas.height / (height / this.fill.height)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(this.fill, sx, sy, swidth, sheight, 0, 0, canvas.width, canvas.height)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = this.fill
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }
  async gaussBlur(img, radius) {
    return new Promise((resolve, reject) => {
      const Canvas = document.createElement('CANVAS'); //大量使用可考虑只创建一次
      Canvas.width = img.width;
      Canvas.height = img.height;
      let ctx = Canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, img.width, img.height);
      let imgData = ctx.getImageData(0, 0, img.width, img.height);
      radius *= 3;

      //Copy图片内容
      let pixes = new Uint8ClampedArray(imgData.data);
      const width = imgData.width;
      const height = imgData.height;
      let gaussMatrix = [],
        gaussSum,
        x, y,
        r, g, b, a,
        i, j, k,
        w;

      radius = Math.floor(radius);
      const sigma = radius / 3;

      a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
      b = -1 / (2 * sigma * sigma);

      //生成高斯矩阵
      for (i = -radius; i <= radius; i++) {
        gaussMatrix.push(a * Math.exp(b * i * i));
      }

      //x 方向一维高斯运算
      for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
          r = g = b = a = gaussSum = 0;
          for (j = -radius; j <= radius; j++) {
            k = x + j;
            if (k >= 0 && k < width) {
              i = (y * width + k) * 4;
              w = gaussMatrix[j + radius];

              r += pixes[i] * w;
              g += pixes[i + 1] * w;
              b += pixes[i + 2] * w;
              a += pixes[i + 3] * w;

              gaussSum += w;
            }
          }

          i = (y * width + x) * 4;
          //计算加权均值
          imgData.data.set([r, g, b, a].map(v => v / gaussSum), i);
        }
      }

      pixes.set(imgData.data);

      //y 方向一维高斯运算
      for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
          r = g = b = a = gaussSum = 0;
          for (j = -radius; j <= radius; j++) {
            k = y + j;

            if (k >= 0 && k < height) {
              i = (k * width + x) * 4;
              w = gaussMatrix[j + radius];

              r += pixes[i] * w;
              g += pixes[i + 1] * w;
              b += pixes[i + 2] * w;
              a += pixes[i + 3] * w;

              gaussSum += w;
            }
          }
          i = (y * width + x) * 4;
          imgData.data.set([r, g, b, a].map(v => v / gaussSum), i);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      var blurImg = new Image();
      blurImg.src = Canvas.toDataURL('image/png');
      blurImg.onload = () => {
        resolve(blurImg)
      }
    })
  };
}
