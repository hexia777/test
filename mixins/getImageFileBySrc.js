import Work from '@/static/script/work.js'

// 需要设置cookie的value eg: 1, 2, 3, 4   这种形式的可以用此方法
// import { formatDataTrack } from '@/static/script/utils'
// 非amp页面数据追踪

export default {
  data() {
    return {}
  },
  methods: {
    getFileByAfterSrc(transId) {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        try {
          const file = {}
          // http://localhost:3000/toongineer-cartoonizer/?medium=reffer_funtion&fileId=97e3c5034c5ebc07bfcf1da5871d073a
          // const fileSrc = Work.targetImgUrl(transId)
          const fileSrc = ''

          const [res, img] = await Promise.all([Work.getTargetImgUrlBlob(transId), this.imgLoad(fileSrc)])
          const metaMap = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
          }
          const imageType = res.data.type ? metaMap[res.data.type] : 'jpg'
          console.log('resresresres', res, imageType)
          const fileName = `${new Date().getDay()}_${Math.random()
            .toString()
            .slice(2, 6)}_${transId}.${imageType}`
          const fileObj = new File([res.data], fileName)
          file.file = fileObj
          file.filename = fileName
          file.filesize = fileObj.size
          file.size = fileObj.size
          file.originImg = fileSrc

          file.w = img.width
          file.h = img.height
          file.thumbnail = this.imgThumb(img, 180, 180)
          resolve(file)
        } catch (err) {
          console.log('error---', err)
          reject(err)
        }
      })
    },
    getFileByPreviewSrc(transId) {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        try {
          const file = {}
          // http://localhost:3000/toongineer-cartoonizer/?medium=reffer_funtion&fileId=97e3c5034c5ebc07bfcf1da5871d073a
          // const fileSrc = Work.previewSrc(transId)
          const fileSrc = ''

          const [res, img] = await Promise.all([Work.getPreviewSrcBlob(transId), this.imgLoad(fileSrc)])
          const metaMap = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
          }

          const imageType = res.data.type ? metaMap[res.data.type] : 'jpg'

          const fileName = `${new Date().getDay()}_${Math.random()
            .toString()
            .slice(2, 6)}_${transId}.${imageType}`
          const fileObj = new File([res.data], fileName)
          file.file = fileObj
          file.filename = fileName
          file.filesize = fileObj.size
          file.size = fileObj.size
          file.originImg = fileSrc

          file.w = img.width
          file.h = img.height
          file.thumbnail = this.imgThumb(img, 180, 180)
          resolve(file)
        } catch (err) {
          console.log('error---', err)
          reject(err)
        }
      })
    },

    imgLoad(fileSrc) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = fileSrc
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          resolve(img)
        }
        img.onerror = () => {
          reject()
        }
      })
    },
    imgThumb(img, targetWidth, targetHeight) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = targetWidth
      canvas.height = targetHeight

      const ratio = img.width > img.height ? canvas.height / img.height : canvas.width / img.width
      const x = img.width > img.height ? -(img.width - img.height) / 2 : 0
      const y = img.width > img.height ? 0 : -(img.height - img.width) / 2
      ctx.drawImage(img, x * ratio, y * ratio, img.width * ratio, img.height * ratio)
      return canvas.toDataURL()
    },
  },
}
