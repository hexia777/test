// 将base64数据转为文件
export const dataURLtoFile = (dataURL, filename) => {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mime })
}

export const imageToBase64 = (image, type = 'png') => {
  var canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  var ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, image.width, image.height)
  var dataURL = canvas.toDataURL('image/' + type)
  return dataURL
}

// 将图片转为base64数据
export const urlToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    if (url.startsWith('data:image')) {
      resolve(url)
    }
    const image = new Image()
    image.setAttribute('crossOrigin', 'anonymous')
    image.onload = function () {
      const base64Data = imageToBase64(image)
      resolve(base64Data)
    }
    image.onerror = function () {
      reject()
    }
    image.src = url
  })
}

// 将图片转为base64数据再通过a标签下载，避免浏览器限制
export const browserDownload = (url, filename) => {
  if (!filename) {
    console.error('browserDownload filename error')
    return false
  }
  return new Promise((resolve) => {
    // urlToBase64(url).then(
    //   (base64Data) => {
    const link = document.createElement('a')
    link.download = filename
    link.style.display = 'none'
    link.href = url
    link.addEventListener('click', () => {
      setTimeout(() => {
        document.body.removeChild(link)
        resolve(true)
      }, 2000)
    })
    document.body.appendChild(link)
    link.click()

    //   },
    //   () => {
    //     console.error('browserDownload urlToBase64 error')
    //     resolve(false)
    //   }
    // )
  })
}

// base64图片转为白底黑图Mask图
export const convertToMask = (base64Image) => {
  const whiteColor = [0, 0, 0]; // 定义白色

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            // 先将 Canvas 填充为白色
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                // 检查是否为非白色
                if (data[i] !== whiteColor[0] || data[i + 1] !== whiteColor[1] || data[i + 2] !== whiteColor[2]) {
                    data[i] = 255;   // Red
                    data[i + 1] = 255; // Green
                    data[i + 2] = 255; // Blue
                }
            }

            ctx.putImageData(imageData, 0, 0);
            // 生成新的 JPEG 格式的 Base64 数据
            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = () => reject(new Error('Image load error'));
        img.src = base64Image;
    });
}