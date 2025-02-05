<template>
  <div class="uploaded" :class="[{ 'btn-left': btnLeft }, { 'full-content': isFullContent }]">
    <el-upload
      class="uploaded"
      :class="{ 'full-content': isFullContent }"
      v-bind="$attrs"
      ref="upload"
      :multiple="isPaied && multiple"
      :drag="true"
      :show-file-list="false"
      :accept="accept"
      :action="''"
      :disabled="disabled"
      :data="uploadParams"
      :file-list="fileList"
      :http-request="submit"
      :on-success="onSuccess"
      :on-error="onError"
      :before-upload="beforeUpload"
      :on-progress="onProgress"
      :on-exceed="onExceed"
    >
      <div v-if="showFullUpload" id="full_mask" class="full-mask">
        <div class="full-mask-body">
          <img :src="$imgPath('/common/drag_1.png')" alt="" />
          <p class="fdrag">{{ $t('common.full_drop_upload') }}</p>
          <p>{{ $t('common.upload_16') }}</p>
        </div>
      </div>
      <slot>
        <div
          class="upload-dragger"
          @click="onBeforeUpload"
          v-track-label="$commonTrackLabel('upload_image_button')"
        >
          <div class="border-top" v-if="isShowBorder"></div>
          <div class="border-left" v-if="isShowBorder"></div>
          <div class="border-bottom" v-if="isShowBorder"></div>
          <div class="border-right" v-if="isShowBorder"></div>
          <div class="drag-img-shell icons">
            <div class="drag-img-box">
              <img class="drag-img" width="229" height="97" :src="$imgPath('/common/drag.png')" alt />
              <img
                class="drag-img-hover"
                width="229"
                height="97"
                :src="$imgPath('/common/drag-hover.png')"
                alt
              />
            </div>
            <div class="el-upload__text" v-if="$store.state.locale === 'ja'">
              <div>
                <span v-if="!$store.state.mobile" v-html="$t('common.upload_11')"></span>
                <span class="icon-upload-box icons">
                  <i class="icon iconfont-single icon-s-upload2"></i>
                  <i class="icon_hover iconfont-single icon-s-upload2 active"></i>
                  <em v-html="$t('common.banner_4_1')"></em>
                  <span v-html="$t('common.banner_4_2')"></span>
                </span>
              </div>
            </div>
            <div class="el-upload__text" v-else>
              <div>
                <span v-if="!$store.state.mobile" v-html="$t('common.upload_11')"></span>
                <span class="icon-upload-box icons">
                  <i class="icon iconfont-single icon-s-upload2"></i>
                  <i class="icon_hover iconfont-single icon-s-upload2 active"></i>
                  <span class="quicksand-bold" v-html="$t('common.upload_12')"></span>
                </span>
              </div>
            </div>
            <div class="upload-text-tip" v-show="showUploadTip">
              <p>{{ $t('workspace.upload_format') }} jpg, png, jpeg</p>
              <p>
                {{
                  $t('workspace.upload_limits_new', {
                    maxLength: $store.state.user_info.widthAndHeightLenLimit,
                    maxSize: $store.state.user_info.limitSize,
                    limitResolution: $store.state.user_info.limitResolution,
                  })
                }}
              </p>
              <p class="small">{{ $t('workspace.upload_tip') }}</p>
            </div>
          </div>
        </div>
      </slot>
    </el-upload>
  </div>
</template>

<script>
  import Work from '@/static/script/work'
  import userLevel from '@/static/json/user_level'
  import * as imageConversion from 'image-conversion'
  import ELKMixins from '@/mixins/ELKMixins'
  import UserInfoMixins from '@/mixins/UserInfoMixins'
  import ProcessMixins from '@/mixins/components/ProcessMixins'
  import SparkMD5 from 'spark-md5'
  import { USED_UPLOAD_PROMPT } from '@/static/config/common/constants'
  import { readLocalStorageArray, hasICCProfile } from '@/static/script/utils'

  export default {
    name: 'FileUpload',
    mixins: [ELKMixins, UserInfoMixins, ProcessMixins],
    inheritAttrs: false,
    props: {
      btnLeft: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      isFullContent: {
        type: Boolean,
        default: false,
      },
      multiple: {
        type: Boolean,
        default: true,
      },
      isShowBorder: {
        type: Boolean,
        default: true,
      },
      showUploadTip: {
        type: Boolean,
        default: true,
      },
      jobType: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        showUploadLoadding: false,
        fileList: [],
        uploadList: [],
        accept: '.jpg,.png,.jpeg,.JPG,.PNG,.JPEG',
        // STEP 1: add new work type 单任务处理 增加workType
        uploadParams: {
          web: Work.web,
          guest_token_v2: this.$getCookie('guestTokenV2'),
          job: '',
        },
      }
    },
    computed: {
      showFullUpload() {
        return this.$store.state.showFullUpload
      },
    },
    watch: {
      uploadList: {
        handler(val) {
          if (val.length && val.every((item) => item.uploadStatus === 'success')) {
            this.$emit('onUpload', val)
            this.uploadList = []
            this.fileList = []
          }
        },
        deep: true,
      },
    },
    mounted() {
      this.dragFile('full_mask')
      document.addEventListener(
        'drop',
        function (e) {
          e.preventDefault()
        },
        false
      )
      document.addEventListener(
        'dragover',
        function (e) {
          e.preventDefault()
        },
        false
      )
      document.body.ondrop = function (event) {
        event.preventDefault()
        event.stopPropagation()
      }
    },
    methods: {
      automaticUpLoad(file) {
        const fileData = file
        this.fileList = []
        this.fileList.push(file)
        setTimeout(async () => {
          await this.beforeUpload(fileData, { noPush: true })
          this.submit({ file: fileData })
        }, 0)
      },
      submit(file) {
        let fileName = file.file.name.replace(
          /[’·°–!"#$%&'()*,:;<=>?@，。?★、…【】（）《》？“”‘’！\\[\]^_`{}~\s]/gi,
          '_'
        )

        const index = fileName.lastIndexOf('.')
        const ext = fileName.substr(index)
        const ext2 = fileName.substr(0, index)
        const uid = file.file.uid
        fileName = this.sizeof(ext2, 140) + ext
        const copyFile = new File([file.file], fileName)
        file.file = copyFile
        const img = new Image()
        img.src = window.URL.createObjectURL(file.file)
        img.onload = () => {
          file.uid = uid
          file.w = img.width
          file.h = img.height
          this.onSuccess(file)
        }
      },
      sizeof(str, max) {
        let total = 0,
          charCode
        let returnValue = ''
        for (let i = 0; i < str.length; i++) {
          charCode = str.charCodeAt(i)
          if (charCode <= 0x007f) {
            total += 1
          } else if (charCode <= 0x07ff) {
            total += 2
          } else if (charCode <= 0xffff) {
            total += 3
          } else {
            total += 4
          }
          if (total > max) {
            break
          }
          returnValue += str[i]
        }
        return returnValue
      },
      // 全屏拖拽上传
      hideFullUploadImg() {
        this.$store.commit('SET_FULL_UPLOAD', false)
      },
      dragFile(domId) {
        let onDragLeave
        const vm = this

        const dragBoxes = document.querySelectorAll('.workspace-drag-ctr')
        dragBoxes.forEach((dragBox) => {
          dragBox.addEventListener('dragenter', (e) => {
            e.stopPropagation()
            e.preventDefault()
            if (!this.showFullUpload) {
              vm.$store.commit('SET_FULL_UPLOAD', true)
            }
            try {
              const dom = document.getElementById(domId)
              if (dom) {
                onDragLeave = (e) => {
                  // eslint-disable-next-line no-console
                  console.log('onDragLeave event')
                  e.stopPropagation()
                  e.preventDefault()
                  vm.hideFullUploadImg()
                  dom.removeEventListener('dragleave', onDragLeave)
                }
                dom.addEventListener('dragend', () => {
                  // eslint-disable-next-line no-console
                  console.log('dragend')
                })
                dom.addEventListener('dragexit', (e) => {
                  // eslint-disable-next-line no-console
                  console.log('dragexit event')
                  e.stopPropagation()
                  e.preventDefault()
                  vm.hideFullUploadImg()
                })
                document.getElementById(domId).addEventListener('dragleave', onDragLeave)
              }
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error(e)
              vm.$store.commit('SET_FULL_UPLOAD', true)
            }
          })
        })
      },
      limitSize(limit) {
        return parseInt(limit.filesize / userLevel.mb) + 'MB'
      },
      limitResolution(limit) {
        return limit.resolution.megapixels / 1000000 + ' ' + this.$t('common.upload_mp')
      },
      onExceed(files) {
        if (files.length > this.limitNum) {
          let txt = this.$t('workspace.upload_limit_4', { limit: this.limitNum })
          const ok = this.$t('workspace.upload_limit_2')
          let dangerouslyUseHTMLString = false
          if (this.type === 'compress') {
            txt = this.$t('workspace.upload_limit_3', { link: this.$t('common.common_nav_link_2') })
            dangerouslyUseHTMLString = true
          }
          this.$confirm(txt, '', {
            dangerouslyUseHTMLString,
            confirmButtonText: ok,
            showCancelButton: false,
            lockScroll: false,
            type: 'warning',
          })
            .then(() => {})
            .catch(() => {})
        }
      },
      // 图片压缩
      compressImgResulution(img, targetWidth, targetHeight, fileType) {
        return new Promise((resolve) => {
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          canvas.width = targetWidth
          canvas.height = targetHeight
          context.clearRect(0, 0, targetWidth, targetHeight)
          context.drawImage(img, 0, 0, targetWidth, targetHeight)
          canvas.toBlob((blob) => {
            resolve(blob)
          }, fileType)
        })
      },
      // 判断是否有icc属性
      readFileHasICCProfile(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = function (e) {
            const buffer = e.target.result
            const uint8Array = new Uint8Array(buffer)
            const iccProfile = hasICCProfile(uint8Array)
            resolve(iccProfile)
          }
          reader.onerror = function (e) {
            reject(false)
          }
          reader.readAsArrayBuffer(file)
        })
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
      // 上传图片的处理
      checkLimitAndRetiveThumb(file, imgInfo, resolve) {
        let compressFile = {}
        const img = new Image()
        img.src = window.URL.createObjectURL(file)
        imgInfo.originImg = img.src
        imgInfo.filesize = file.size
        imgInfo.size = file.size
        img.onload = async () => {
          imgInfo.width = img.width
          imgInfo.height = img.height
          imgInfo.thumb = this.imgThumb(img, 180, 180)
          // 分辨率超出或者判断单边不能超过指定值，否则按比例压缩
          console.log('imgInfo----2: ', imgInfo)
          if (
            imgInfo.width * imgInfo.height > this.uploadLimit.resolution.megapixels ||
            imgInfo.width > this.uploadLimit.widthAndHeightLenLimit ||
            imgInfo.height > this.uploadLimit.widthAndHeightLenLimit
          ) {
            // 計算壓縮後的寬高
            const originWidth = img.width
            const originHeight = img.height
            const mp = this.uploadLimit.resolution.megapixels
            // 图片分辨率 修改为根据总分辨率计算
            const maxWidth = originWidth * Math.sqrt(mp / (originWidth * originHeight)),
              maxHeight = originHeight * Math.sqrt(mp / (originWidth * originHeight))
            let targetWidth = maxWidth,
              targetHeight = maxHeight
            // 判断单边不能超过指定值，否则按比例压缩
            if (targetWidth > targetHeight && targetWidth > this.uploadLimit.widthAndHeightLenLimit) {
              targetWidth = this.uploadLimit.widthAndHeightLenLimit
              targetHeight = (this.uploadLimit.widthAndHeightLenLimit / maxWidth) * maxHeight
            } else if (targetHeight > targetWidth && targetHeight > this.uploadLimit.widthAndHeightLenLimit) {
              targetHeight = this.uploadLimit.widthAndHeightLenLimit
              targetWidth = (this.uploadLimit.widthAndHeightLenLimit / maxHeight) * maxWidth
            }
            imgInfo.width = targetWidth
            imgInfo.height = targetHeight

            imgInfo.status = Work.statusResizing
            const hasICCProfile = await this.readFileHasICCProfile(file)
            imgInfo.icc = hasICCProfile
            imgInfo.isCompress = true
            this.compressImgResulution(img, targetWidth, targetHeight, file.type).then((resResized) => {
              console.log('resResized: ', resResized)
              // 判斷文件大小是否超出
              if (resResized.size > this.uploadLimit.filesize) {
                imgInfo.status = Work.statusCompressing
                imageConversion
                  .compressAccurately(resResized, this.uploadLimit.filesize / 1024)
                  .then((resCompressed) => {
                    imgInfo.status = Work.statusUploading
                    imgInfo.filesize = this.getFileSize(resCompressed.size)
                    compressFile = new window.File([resCompressed], file.name, {
                      type: file.type,
                      lastModified: Date.now(),
                    })
                    if (resCompressed.size > this.uploadLimit.filesize) {
                      imageConversion.compress(resResized, 0.8).then((resCompressed) => {
                        imgInfo.status = Work.statusUploading
                        imgInfo.filesize = this.getFileSize(resCompressed.size)
                        compressFile = new window.File([resCompressed], file.name, {
                          type: file.type,
                          lastModified: Date.now(),
                        })
                        resolve(compressFile)
                      })
                    } else {
                      resolve(compressFile)
                    }
                  })
              } else {
                imgInfo.status = Work.statusUploading
                imgInfo.filesize = this.getFileSize(resResized.size)
                compressFile = new window.File([resResized], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                })
                resolve(compressFile)
              }
            })
            // elk
            this.uploadResizeELK(Work.statusResizing, img.width + 'X' + img.height, imgInfo.filesize)
          } else if (file.size > this.uploadLimit.filesize) {
            imgInfo.status = Work.statusCompressing
            const hasICCProfile = await this.readFileHasICCProfile(file)
            imgInfo.icc = hasICCProfile
            imgInfo.isCompress = true
            imageConversion
              .compressAccurately(file, { size: this.uploadLimit.filesize / 1024, accuracy: 1 })
              .then((resCompressed) => {
                imgInfo.status = Work.statusUploading
                imgInfo.filesize = this.getFileSize(resCompressed.size)
                compressFile = new window.File([resCompressed], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                })
                if (resCompressed.size > this.uploadLimit.filesize) {
                  imageConversion.compress(compressFile, 0.8).then((resCompressed) => {
                    imgInfo.status = Work.statusUploading
                    imgInfo.filesize = this.getFileSize(resCompressed.size)
                    compressFile = new window.File([resCompressed], file.name, {
                      type: file.type,
                      lastModified: Date.now(),
                    })
                    resolve(compressFile)
                  })
                } else {
                  resolve(compressFile)
                }
              })

            this.uploadCompressELK(Work.statusCompressing, imgInfo.filesize)
          } else if (file.size > this.uploadLimit.compress.filesize) {
            this.$emit('on-before-upload-error', imgInfo, 'fileTooLarge')
            return
          } else {
            imgInfo.status = Work.statusUploading
            imgInfo.filesize = this.getFileSize(file.size)
            setTimeout(() => {
              resolve()
            }, 100)
          }
          this.showUploadLoadding = true
          this.$store.commit('SET_FULL_UPLOAD', false)
          this.$emit('dropImageHandle')
          this.uploadList.unshift({
            uploadStartTime: Date.now(),
            cid: imgInfo.cid,
            uploadStatus: 'ready',
            uid: '',
            filename: imgInfo.filename,
            filesize: imgInfo.size,
            thumbnail: imgInfo.thumb,
            w: '',
            h: '',
            //前端自己需要的
            selected: false,
            status: Work.statusUploading,
            originImg: imgInfo.originImg,
            targetImg: '',
            zoomOriginImg: '',
            zoomTargetImg: '',
            processed: '',
            workType: '',
            image_resolution: imgInfo.width + 'X' + imgInfo.height,
            icc: imgInfo.icc,
            isCompress: imgInfo.isCompress,
          })
        }
      },
      beforeUpload(file) {
        if (this.checkUploadPrompt()) {
          this.$emit('beforeUpload', true)
          return false
        }

        if (this.limitNum && this.fileList && this.fileList.length >= this.limitNum) {
          return false
        }
        this.fileList.push(file)
        const fileType = file.name.substring(file.name.lastIndexOf('.') + 1).toLocaleLowerCase()
        const typeList = ['jpg', 'jpeg', 'png']
        if (!typeList.includes(fileType)) {
          this.$confirm(this.$t('workspace.alert_unsupported_formats1'), '', {
            confirmButtonText: this.$t('workspace.upload_19'),
            showCancelButton: false,
            lockScroll: false,
            type: 'warning',
          })
            .then(() => {
              // TODO 隐藏drag
              this.$emit('hideFullUploadImg')
            })
            .catch(() => {
              this.$emit('hideFullUploadImg')
            })
          return false
        }
        if (this.drag && this.disableUpload) {
          //拖拽操作
          this.$emit('limitUpload')
          return false
        }
        const imgInfo = {
          cid: file.uid,
          filename: file.name,
          filesize: '',
          size: file.size,
          width: 0,
          height: 0,
          status: '',
          originImg: null,
          thumb: null,
          progressUpload: 0,
        }
        return new Promise((resolve, reject) => {
          this.checkLimitAndRetiveThumb(file, imgInfo, resolve, reject)
        })
      },
      onBeforeUpload(e) {
        if (this.checkUploadPrompt()) {
          e.stopPropagation()
          this.$emit('beforeUpload', true)
          return false
        }
      },
      handlePrepareUpload(reqFile) {
        return new Promise((resolve) => {
          const file = reqFile
          const fileSize = file.size // 文件大小
          const chunkSize = 1024 * 1024 * 100000 // 切片的大小
          const chunks = Math.ceil(fileSize / chunkSize) // 获取切片个数
          const fileReader = new FileReader()
          const spark = new SparkMD5.ArrayBuffer()
          const bolbSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
          let currentChunk = 0

          fileReader.onload = (e) => {
            const res = e.target.result
            spark.append(res)
            currentChunk++
            if (currentChunk < chunks) {
              loadNext()
              console.log(`第${currentChunk}分片解析完成, 开始第${currentChunk + 1}分片解析`)
            } else {
              const md5 = spark.end()
              resolve(md5)
            }
          }

          const loadNext = () => {
            const start = currentChunk * chunkSize
            const end = start + chunkSize > file.size ? file.size : start + chunkSize
            fileReader.readAsArrayBuffer(bolbSlice.call(file, start, end))
          }
          loadNext()
        })
      },
      onSuccess(file) {
        const filfers = this.uploadList.filter((item) => item.cid === file.uid)
        if (filfers && filfers.length) {
          filfers[0].uploadStatus = 'success'
          filfers[0].filename = file.file.name
          filfers[0].filesize = file.file.size
          filfers[0].w = file.w
          filfers[0].h = file.h
          filfers[0].status = Work.statusReady
          filfers[0].file = file.file
          filfers[0].isLocal = true
        }
        this.showUploadLoadding = false
      },
      onError(res, uid) {
        this.uploadList.forEach((list) => {
          if (list.cid && !uid) {
            list.uploadStatus = 'failed'
          }
        })
        this.showUploadLoadding = false
        this.uploadList.map((item, idx) => {
          if (item.uid === uid) {
            this.uploadList[idx].status = Work.statusUploadFailed
          }
          return false
        })
      },
      onProgress(event, file) {
        this.uploadList.forEach((list) => {
          if (list.cid === file.uid) {
            list.uploadStatus = 'uploading'
          }
        })
      },
      checkUploadPrompt() {
        const usedUploadPromptArr = readLocalStorageArray(USED_UPLOAD_PROMPT)
        const jobList = ['sketch', 'repair']
        if (this.jobType && jobList.includes(this.jobType) && !usedUploadPromptArr.includes(this.jobType)) {
          return true
        }
        return false
      },
    },
  }
</script>

<style scoped lang="less">
  .icon-s-upload2 {
    padding: 0 6 / @base;
    font-size: 16 / @base;
    color: #4d4d4d;
  }

  .icon-s-upload2.active {
    color: #0374ff;
  }

  .uploaded {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;

    &.btn-left {
      flex-direction: initial;
      justify-content: flex-start;
      width: auto;
    }

    &.full-content {
      align-items: normal;

      /deep/ .el-upload-dragger {
        background: transparent;
      }
    }

    .drag-img-box {
      display: flex;
      justify-content: center;
    }

    .upload-dragger {
      position: relative;
      width: 100%;
      padding: 25 / @base 2rem;

      .upload-text-tip {
        margin-top: 1.125rem;

        p {
          font-size: 14px;
          color: #9a9999;
        }

        .small {
          font-size: 12px;
        }
      }
    }

    .upload-img {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 70%;
    }

    .operator {
      width: 30%;
    }

    .drag-img-shell {
      .drag-img {
        display: block;
      }

      .drag-img-hover {
        display: none;
      }

      &:hover {
        .drag-img-hover {
          display: block;
        }

        .drag-img {
          display: none;
        }

        .quicksand-bold {
          text-decoration: underline;
        }
      }
    }

    /deep/ .el-upload-dragger {
      width: 100%;
      height: auto;
      padding-bottom: 0;
      margin-top: 0;
      border: none;
      border-radius: 2px;
    }

    .el-upload-dragger {
      .el-upload__text {
        padding: 18 / @base 0;
        color: #4d4d4f;
        border-bottom: 1px solid #f2f2f2;

        /deep/ em {
          color: #4d4d4f;
          text-decoration: underline;
        }
      }
    }
  }

  .full-mask {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 99;
    width: 100%;
    height: 100%;
    background: rgba(225, 225, 225, 0.85);

    * {
      pointer-events: none;
    }

    .full-mask-body {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    img {
      width: auto !important;
      height: auto !important;
    }

    p.fdrag {
      font-size: 30 / @base;
      font-weight: bold;
      line-height: 54 / @base;
      color: #4f6785;
      text-align: center;
    }
  }

  .border-top {
    position: absolute;
    top: 0;
    left: 5px;
    width: 100%;
    height: 1px;
    border: 0;
    background-image: linear-gradient(to right, #dfdede 0%, #dfdede 50%, transparent 50%);
    background-repeat: repeat-x;
    background-size: 11px 1px;
  }

  .border-left {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 100%;
    background-image: linear-gradient(to top, #dfdede 0%, #dfdede 50%, transparent 50%);
    background-repeat: repeat-y;
    background-size: 1px 11px;
  }

  .border-bottom {
    position: absolute;
    bottom: 0;
    left: 5px;
    width: 100%;
    height: 1px;
    background-image: linear-gradient(to right, #dfdede 0%, #dfdede 50%, transparent 50%);
    background-repeat: repeat-x;
    background-size: 11px 1px;
  }

  .border-right {
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    background-image: linear-gradient(to top, #dfdede 0%, #dfdede 50%, transparent 50%);
    background-repeat: repeat-y;
    background-size: 1px 11px;
  }
  @media screen and (max-width: 768px) {
    .uploaded.container {
      width: 100%;

      .upload-img {
        width: 100%;
      }

      .operator {
        width: 100%;
      }
    }
  }

  .icons {
    .icon {
      display: inline-block;
    }

    .icon_hover {
      display: none;
    }

    &:hover {
      .icon {
        display: none;
      }

      .icon_hover {
        display: inline-block;
      }
    }
  }
</style>
