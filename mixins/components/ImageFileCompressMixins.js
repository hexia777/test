import Work from '@/static/script/work.js'
import * as imageConversion from 'image-conversion'

export default {
  data() {
    return {
      type: '',
      nextStep: true, //是否继续执行
    }
  },
  methods: {
    /**
     * @intercept 拦截处理流程
     */
    intercept() {
      this.nextStep = true
      return new Promise((resolve) => {
        this.interceptType = resolve
      })
    },
    /**
     * @implement 释放拦截流程
     */
    implement(req) {
      // 1:确定 2:取消
      if (req == 2) {
        this.nextStep = false
      }
      this.interceptType()
    },
    calculateWHToMaxWH(max, w, h) {
      let targetWidth = 0,
        targetHeight = 0
      if (w > h) {
        targetWidth = max
        targetHeight = (max / w) * h
      } else {
        targetHeight = max
        targetWidth = (max / h) * w
      }
      return { w: targetWidth, h: targetHeight }
    },
    calulateWHToResulution(megapixels, w, h) {
      const mp = this.uploadLimit.resolution.megapixels
      const maxWidth = w * Math.sqrt(mp / (w * h)),
        maxHeight = h * Math.sqrt(mp / (w * h))
      return { w: maxWidth, h: maxHeight }
    },
    // 上传图片的处理
    async checkLimitAndRetiveThumb(img, imgInfo, resolve) {
      // console.log('pintura-checkLimitAndRetiveThumb', img)
      let compressFile
      imgInfo.originImg = img.src

      const file = new window.File(
        [await this.generateBlobOnImage(img, img.width, img.height, 'image/' + imgInfo.type)],
        Date.now() + '.' + imgInfo.type,
        {
          type: 'image/' + imgInfo.type,
          lastModified: Date.now(),
          uid: Date.now(),
        }
      )
      imgInfo.file = file
      imgInfo.filename = file.name
      imgInfo.size = file.size
      imgInfo.width = img.width
      imgInfo.height = img.height
      imgInfo.thumb = this.imgThumb(img, 180, 180)

      // 分辨率超出，壓縮和縮放圖片
      if (this.type === Work.typeRepair && (imgInfo.width > 2000 || imgInfo.height > 2000)) {
        //用户确认是否进行图片压缩等处理
        // this.$emit('sizeWinFun', true)
        this.sizeWinFun(true)
        await this.intercept()
        if (!this.nextStep) {
          return
        }
        //用户确认是否进行图片压缩等处理end
        let size = this.calculateWHToMaxWH(2000, imgInfo.width, imgInfo.height)
        if (size.w * size.h > this.uploadLimit.resolution.megapixels) {
          size = this.calulateWHToResulution(this.uploadLimit.resolution.megapixels, size.w, size.h)
        }
        imgInfo.width = size.w
        imgInfo.height = size.h
        this.generateBlobOnImage(img, imgInfo.width, imgInfo.height, file.type).then((resResized) => {
          const compressFile = new window.File([resResized], file.name, {
            type: file.type,
            lastModified: Date.now(),
            uid: Date.now(),
          })
          imgInfo.size = compressFile.size
          imgInfo.file = compressFile
          resolve(compressFile)
        })
      } else if (imgInfo.width * imgInfo.height > this.uploadLimit.resolution.megapixels) {
        //用户确认是否进行图片压缩等处理
        // this.$emit('sizeWinFun', true)
        this.sizeWinFun(true)
        await this.intercept()
        if (!this.nextStep) {
          return
        }
        //用户确认是否进行图片压缩等处理end
        // 計算壓縮後的寬高
        const size = this.calulateWHToResulution(
          this.uploadLimit.resolution.megapixels,
          imgInfo.width,
          imgInfo.height
        )
        imgInfo.width = size.w
        imgInfo.height = size.h

        this.generateBlobOnImage(img, imgInfo.width, imgInfo.height, file.type).then((resResized) => {
          // 判斷文件大小是否超出
          if (resResized.size > this.uploadLimit.filesize) {
            imageConversion
              .compressAccurately(resResized, this.uploadLimit.filesize / 1024)
              .then((resCompressed) => {
                compressFile = new window.File([resCompressed], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                  uid: Date.now(),
                })
                if (resCompressed.size > this.uploadLimit.filesize) {
                  imageConversion.compress(resResized, 0.8).then((resCompressed) => {
                    compressFile = new window.File([resCompressed], file.name, {
                      type: file.type,
                      lastModified: Date.now(),
                      uid: Date.now(),
                    })
                    imgInfo.size = compressFile.size
                    imgInfo.file = compressFile
                    resolve()
                  })
                } else {
                  resolve()
                }
              })
          } else {
            resolve()
          }
        })
        // elk
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'editor',
          event_value: 'resize',
          event_info: {
            upload_status: Work.statusResizing,
            image_resolution: img.width + 'X' + img.height,
            image_megapixels: img.width * img.height,
          },
        })
      } else if (file.size > this.uploadLimit.filesize) {
        //用户确认是否进行图片压缩等处理
        // this.$emit('sizeWinFun', true)
        this.sizeWinFun(true)
        await this.intercept()
        if (!this.nextStep) {
          return
        }
        //用户确认是否进行图片压缩等处理end
        imageConversion
          .compressAccurately(file, { size: this.uploadLimit.filesize / 1024, accuracy: 1 })
          .then((resCompressed) => {
            compressFile = new window.File([resCompressed], file.name, {
              type: file.type,
              lastModified: Date.now(),
              uid: Date.now(),
            })
            if (compressFile.size > this.uploadLimit.filesize) {
              imageConversion.compress(compressFile, 0.8).then((resCompressed) => {
                compressFile = new window.File([resCompressed], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                  uid: Date.now(),
                })
                imgInfo.size = compressFile.size
                imgInfo.file = compressFile
                resolve()
              })
            } else {
              resolve()
            }
          })

        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'editor',
          event_value: 'compress',
          event_info: {
            upload_status: Work.statusCompressing,
          },
        })
      } else {
        resolve()
      }
    },
    // 生成缩略图
    imgThumb(img, targetWidth, targetHeight) {
      const canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d')
      canvas.width = targetWidth
      canvas.height = targetHeight

      const ratio = img.width > img.height ? canvas.height / img.height : canvas.width / img.width
      const x = img.width > img.height ? -(img.width - img.height) / 2 : 0
      const y = img.width > img.height ? 0 : -(img.height - img.width) / 2
      ctx.drawImage(img, x * ratio, y * ratio, img.width * ratio, img.height * ratio)
      return canvas.toDataURL()
    },
    // 获取文件大小
    getFileSize(size) {
      const kb = 1024,
        mb = 1024 * 1024
      return size > mb ? Math.floor((size / mb) * 10) / 10 + 'MB' : Math.floor(size / kb) + 'KB'
    },
    // 图片压缩
    generateBlobOnImage(img, targetWidth, targetHeight, fileType = 'image/jpeg') {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = targetWidth
        canvas.height = targetHeight
        context.drawImage(img, 0, 0)
        canvas.toBlob(
          (blob) => {
            resolve(blob)
          },
          fileType,
          0.5
        )
      })
    },
    async initWork(image, type = 'jpeg') {
      // console.log('pintura-initWorkinitWork', image, type)
      const imgInfo = {
        width: image.width,
        height: image.height,
        originImg: null,
        thumb: null,
        type,
      }
      await new Promise((resolve, reject) => {
        return this.checkLimitAndRetiveThumb(image, imgInfo, resolve, reject)
      })
      return imgInfo
    },

    async initUploadImgInfo(image, type = 'jpeg') {
      // console.log('pintura-initWorkinitWork', image, type)
      const imgInfo = {
        width: image.width,
        height: image.height,
        originImg: null,
        thumb: null,
        type,
      }
      await new Promise((resolve, reject) => {
        return this.checkLimitAndRetiveThumb(image, imgInfo, resolve, reject)
      })
      return imgInfo
    },
    // 上传图片的处理
    // async checkLimitAndRetiveThumbNew(imageFile, imgInfo, resolve) {
    //   console.log('pintura-checkLimitAndRetiveThumbNew', imageFile)
    //   let compressFile
    //   // File 转 BLOB
    //   const imageBlobUrl = URL.createObjectURL(imageFile)
    //   imgInfo.originImg = imageBlobUrl

    //   // const file = new window.File(
    //   //   [await this.generateBlobOnImage(img, img.width, img.height, 'image/' + imgInfo.type)],
    //   //   Date.now() + '.' + imgInfo.type,
    //   //   {
    //   //     type: 'image/' + imgInfo.type,
    //   //     lastModified: Date.now(),
    //   //     uid: Date.now(),
    //   //   }
    //   // )
    //   const { file: compressImageFile, url: compressUrl } = await this.imgCompress(
    //     imageFile,
    //     imageFile.type,
    //     { width: imgInfo.width, height: imgInfo.height }
    //   )
    //   const thumbUrl = await this.generateThumbImage(imageFile, 180, 180)
    //   imgInfo.file = compressImageFile
    //   imgInfo.filename = compressImageFile.name
    //   imgInfo.size = compressImageFile.size

    //   imgInfo.thumb = thumbUrl

    //   // 分辨率超出，壓縮和縮放圖片
    //   if (this.type === Work.typeRepair && (imgInfo.width > 2000 || imgInfo.height > 2000)) {
    //     //用户确认是否进行图片压缩等处理
    //     // this.$emit('sizeWinFun', true)
    //     this.sizeWinFun(true)
    //     await this.intercept()
    //     if (!this.nextStep) {
    //       return
    //     }
    //     //用户确认是否进行图片压缩等处理end
    //     let size = this.calculateWHToMaxWH(2000, imgInfo.width, imgInfo.height)
    //     if (size.w * size.h > this.uploadLimit.resolution.megapixels) {
    //       size = this.calulateWHToResulution(this.uploadLimit.resolution.megapixels, size.w, size.h)
    //     }
    //     imgInfo.width = size.w
    //     imgInfo.height = size.h

    //     this.imgCompress(imageFile, imageFile.type, 0.5)
    //     this.generateBlobOnImage(img, imgInfo.width, imgInfo.height, file.type).then((resResized) => {
    //       const compressFile = new window.File([resResized], file.name, {
    //         type: file.type,
    //         lastModified: Date.now(),
    //         uid: Date.now(),
    //       })
    //       imgInfo.size = compressFile.size
    //       imgInfo.file = compressFile
    //       resolve(compressFile)
    //     })
    //   } else if (imgInfo.width * imgInfo.height > this.uploadLimit.resolution.megapixels) {
    //     //用户确认是否进行图片压缩等处理
    //     this.$emit('sizeWinFun', true)
    //     await this.intercept()
    //     if (!this.nextStep) {
    //       return
    //     }
    //     //用户确认是否进行图片压缩等处理end
    //     // 計算壓縮後的寬高
    //     const size = this.calulateWHToResulution(
    //       this.uploadLimit.resolution.megapixels,
    //       imgInfo.width,
    //       imgInfo.height
    //     )
    //     imgInfo.width = size.w
    //     imgInfo.height = size.h

    //     this.generateBlobOnImage(img, imgInfo.width, imgInfo.height, file.type).then((resResized) => {
    //       // 判斷文件大小是否超出
    //       if (resResized.size > this.uploadLimit.filesize) {
    //         imageConversion
    //           .compressAccurately(resResized, this.uploadLimit.filesize / 1024)
    //           .then((resCompressed) => {
    //             compressFile = new window.File([resCompressed], file.name, {
    //               type: file.type,
    //               lastModified: Date.now(),
    //               uid: Date.now(),
    //             })
    //             if (resCompressed.size > this.uploadLimit.filesize) {
    //               imageConversion.compress(resResized, 0.8).then((resCompressed) => {
    //                 compressFile = new window.File([resCompressed], file.name, {
    //                   type: file.type,
    //                   lastModified: Date.now(),
    //                   uid: Date.now(),
    //                 })
    //                 imgInfo.size = compressFile.size
    //                 imgInfo.file = compressFile
    //                 resolve()
    //               })
    //             } else {
    //               resolve()
    //             }
    //           })
    //       } else {
    //         resolve()
    //       }
    //     })
    //   } else if (file.size > this.uploadLimit.filesize) {
    //     //用户确认是否进行图片压缩等处理
    //     this.$emit('sizeWinFun', true)
    //     await this.intercept()
    //     if (!this.nextStep) {
    //       return
    //     }
    //     //用户确认是否进行图片压缩等处理end
    //     imageConversion
    //       .compressAccurately(file, { size: this.uploadLimit.filesize / 1024, accuracy: 1 })
    //       .then((resCompressed) => {
    //         compressFile = new window.File([resCompressed], file.name, {
    //           type: file.type,
    //           lastModified: Date.now(),
    //           uid: Date.now(),
    //         })
    //         if (compressFile.size > this.uploadLimit.filesize) {
    //           imageConversion.compress(compressFile, 0.8).then((resCompressed) => {
    //             compressFile = new window.File([resCompressed], file.name, {
    //               type: file.type,
    //               lastModified: Date.now(),
    //               uid: Date.now(),
    //             })
    //             imgInfo.size = compressFile.size
    //             imgInfo.file = compressFile
    //             resolve()
    //           })
    //         } else {
    //           resolve()
    //         }
    //       })

    //
    //   } else {
    //     resolve()
    //   }
    // },

    async initWorkNew(imageFile, imageType = 'image/jpeg') {
      const img = await this.imageFileToImageElement(imageFile)
      const imgInfo = {
        width: img.width,
        height: img.height,
        originImg: null,
        thumb: null,
        type: imageType.split('/')[1],
      }
      await new Promise((resolve, reject) => {
        return this.checkLimitAndRetiveThumb(img, imgInfo, resolve, reject)
      })
      return imgInfo
    },

    imageFileToImageElement(imgFile) {
      return new Promise((resolve, reject) => {
        const src = URL.createObjectURL(imgFile)
        const img = new Image() //创建一个img标签
        img.src = src
        img.onload = function () {
          try {
            URL.revokeObjectURL(src) //释放内存
            resolve(img)
          } catch (e) {
            reject(e)
          }
        }
      })
    },

    generateThumbImage(imgFile, targetWidth, targetHeight) {
      return new Promise((resolve, reject) => {
        const src = URL.createObjectURL(imgFile)
        const img = new Image() //创建一个img标签
        img.src = src
        img.onload = function () {
          try {
            URL.revokeObjectURL(src) //释放内存
            const imgCanvas = document.createElement('canvas') //创建canvas元素
            const ctx = imgCanvas.getContext('2d') //2d渲染
            imgCanvas.width = targetWidth
            imgCanvas.height = targetHeight
            const ratio =
              this.width > this.height ? imgCanvas.height / this.height : imgCanvas.width / this.width
            const x = this.width > this.height ? -(this.width - this.height) / 2 : 0
            const y = this.width > this.height ? 0 : -(this.height - this.width) / 2
            ctx.drawImage(this, x * ratio, y * ratio, this.width * ratio, this.height * ratio)

            resolve(imgCanvas.toDataURL())
          } catch (e) {
            reject(e)
          }
        }
      })
    },
    //blob转file
    blobToFile(blob, fileName, type) {
      return new window.File([blob], fileName, { type })
    },
    //图片压缩方法2
    //imgFile：图片原文件,File或Blob实例
    //imgType：压缩后的图片的格式，可选image/webp或image/jpeg，其他格式无效
    //quality：压缩质量，0~1，仅当imgType为有效值时生效
    imgCompress(imgFile, imgType, { width, height }) {
      if (!imgType) {
        imgType = 'image/jpeg' //默认输出webp格式的图片
      }
      return new Promise((resolve, reject) => {
        const src = URL.createObjectURL(imgFile)
        const img = new Image() //创建一个img标签
        img.src = src
        img.onload = function () {
          try {
            URL.revokeObjectURL(src) //释放内存
            // const width = this.width
            // const height = this.height
            let imgCanvas = document.createElement('canvas') //创建canvas元素
            imgCanvas.width = width
            imgCanvas.height = height
            const ctx = imgCanvas.getContext('2d') //2d渲染
            ctx.drawImage(this, 0, 0) //将图片以原有尺寸绘制到canvas中
            //转换成base64并压缩，可以从0到1的区间内选择图片的质量。如果超出取值范围，将会使用默认值0.92。其他参数会被忽略
            if (imgType === 'image/webp' || imgType === 'image/jpeg') {
              imgCanvas.toBlob(
                function (b) {
                  const compressUrl = URL.createObjectURL(b) //压缩后的文件url
                  const fileName =
                    imgFile.name.substring(0, imgFile.name.lastIndexOf('.')) + '.' + imgType.split('/')[1] //重构文件名
                  const file = this.blobToFile(b, fileName, imgType) //Blob实例转成File实例
                  resolve({
                    url: compressUrl,
                    file,
                  })
                  imgCanvas = null //释放内存
                },
                imgType,
                0.5
              )
            } else {
              imgCanvas.toBlob(function (b) {
                const compressUrl = URL.createObjectURL(b)
                const fileName =
                  imgFile.name.substring(0, imgFile.name.lastIndexOf('.')) + '.' + imgType.split('/')[1]
                const file = this.blobToFile(b, fileName, imgType)
                resolve(
                  {
                    url: compressUrl,
                    file,
                  },
                  imgType
                )
                imgCanvas = null //释放内存
              }, imgType)
            }
          } catch (e) {
            reject(e)
          }
        }
      })
    },
  },
}
