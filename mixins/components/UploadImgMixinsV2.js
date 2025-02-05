const md5Data = require('@/static/script/md5')
import ELKMixins from '@/mixins/ELKMixins'
import { reportProcessElk, uploadImageToS3 } from '@/static/plugin/awsS3V2'
import { dataURLtoFile } from '@/static/script/util/imageUtil'
import Work from '@/static/script/work.js'
import { WorkFlowConfig } from '@/static/script/workflow_util'
import { convertBase64UrlToFile } from '@/static/script/utils.js'
import * as imageConversion from 'image-conversion'
import SparkMD5 from 'spark-md5'
import servers from '@/static/config/common/server.config'
import { developedCountry } from '@/static/json/country'

const EXIF = require('@/static/script/exif.js')

export default {
  mixins: [ELKMixins],
  data() {
    return {
      timeMap: {},
      tempTimeMap: {}, // 没有得到transId之前的存储结构
      timeElkInfo: {},
      country: null,
      // start | upload | pre_process | jobserver | worker | load
      uploadParams: {
        web: Work.web,
        guest_token_v2: this.$getCookie('guestTokenV2'),
      },
    }
  },
  methods: {
    setUidFun(obj) {
      if (this.uploadList && this.uploadList.length > 0) {
        this.uploadList.forEach((val) => {
          if (val.cid === obj.cid) {
            // 已经有uid就不设置了，避免触发currentImage修改
            if (!val.uid) {
              val.uid = obj.uid
            }
          }
        })
      }
    },
    onUploadClick(event) {
      this.uploadName = event
      if (!this.requestTransform) {
        this.setTime('start', 'start')
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

    handleRemoteImg(file, imageFileType) {
      const fileSize = file.size
      return new Promise(function (resolve, reject) {
        EXIF.getData(file, function () {
          const Orientation = EXIF.getTag(this, 'Orientation')
          console.log('Orientation>>>>>>', Orientation)

          if (!Orientation || Orientation == 1) {
            resolve(file)
            return
          }
          //转换成base64
          const uploadBase64 = new Image()
          uploadBase64.src = window.URL.createObjectURL(file)

          uploadBase64.onload = function () {
            //修正旋转图片
            const expectWidth = uploadBase64.width
            const expectHeight = uploadBase64.height

            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            canvas.width = expectWidth
            canvas.height = expectHeight

            ctx.drawImage(uploadBase64, 0, 0, expectWidth, expectHeight)

            if (Orientation !== '' && Orientation != 1) {
              //输出转换后的base64图片
              const dataUrl = canvas.toDataURL(imageFileType, 1)
              const newFIle = convertBase64UrlToFile(dataUrl, file.name, imageFileType)
              imageConversion.compressAccurately(newFIle, fileSize / 1024).then((compressBlob) => {
                const compressFile = new window.File([compressBlob], file.name, {
                  type: imageFileType,
                  lastModified: Date.now(),
                })
                resolve(compressFile)
              })
            } else {
              resolve(file)
            }
          }
        })
      })
    },

    getFileType(file) {
      if (file.type) {
        return file.type
      }
      const imageMimeTypes = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
      }

      const suffixs = file.name.split('.')
      let suffix = suffixs[suffixs.length - 1]
      if (suffix) {
        suffix = suffix.toLowerCase()
        return imageMimeTypes[suffix]
      }
      return ''
    },
    getTargetWidthHeight(work, limitHeight) {
      const originWidth = work.w
      const originHeight = work.h
      let targetWidth = originWidth
      let targetHeight = originHeight
      if (limitHeight && originHeight > limitHeight) {
        targetHeight = limitHeight
        targetWidth = Math.ceil((limitHeight / originHeight) * originWidth)
      }
      work.w = targetWidth
      work.h = targetHeight
      return {
        width: targetWidth,
        height: targetHeight,
      }
    },
    saveToRealTimeMap(transId, config) {
      console.log('saveToRealTimeMap', transId, config)
      this.timeMap[transId] = { ...this.tempTimeMap }
      const process_type = config.name
      const model_name =
        config.config && config.config.length && config.config[0].config.module_params.model_name
      this.timeElkInfo[transId] = {
        process_type,
        model_name,
      }
      if (!this.country) {
        this.$axios.post(servers.service + '/api/test/ip2location').then((res) => {
          if (res.code === 200) {
            this.country = res.data.country
          }
        })
      }
    },
    formatJobTimelines(transId) {
      const jobTimelines = []
      const nodeStepMap = {
        timestamp_line_jobserver: 'jobserver',
        timestamp_end_jobserver: 'jobserver',
        jobserver: 'worker',
        timestamp_finish_jobserver: 'jobserver',
      }
      let lastTime = Date.now()
      if (transId) {
        const steps = [
          'start',
          'upload',
          'pre_process',
          'timestamp_end_jobserver',
          'timestamp_line_jobserver',
          'jobserver',
          'timestamp_finish_jobserver',
          'load',
        ]
        steps.forEach((key, index) => {
          const item = this.timeMap[transId][key]
          let { start, end, trans_time } = item || {}
          const node = nodeStepMap[key] || 'web'
          if (item && item.start) {
            lastTime = end || start
          } else {
            start = lastTime
            end = lastTime
          }
          if (end < start) {
            end = start
          }
          const interval = end - start
          jobTimelines.push({
            node,
            step: key,
            start,
            end,
            sort_num: index,
            duration: { ms: interval, sec: interval / 1000 },
            trans_time: trans_time || 0,
          })
        })
      } else {
        const steps = ['start', 'upload', 'pre_process']
        steps.forEach((key, index) => {
          const item = this.tempTimeMap[key]
          let { start, end } = item || {}
          if (item && item.start) {
            lastTime = end || start
          } else {
            start = lastTime
            end = lastTime
          }
          if (end < start) {
            end = start
          }
          const interval = end - start
          jobTimelines.push({
            node: 'web',
            step: key,
            start,
            end,
            sort_num: index,
            duration: { ms: interval, sec: interval / 1000 },
            trans_time: 0,
          })
        })
      }
      return {
        job_timelines: jobTimelines,
      }
    },
    uploadTimeElk(transId) {
      const basic_info = {
        ...this.timeElkInfo[transId],
        country: this.country,
        country_level: this.$store.state.isDevelopedCountry ? 'developed' : 'developing',
        trans_id: transId,
        device: this.$store.state.isMobile ? 'Mobile' : 'PC',
        language: this.$store.state.locale,
        origin_url: this.$route.path,
      }
      const job_timelines = this.formatJobTimelines(transId)
      Work.sendJobTimeLines({
        info: JSON.stringify(basic_info),
        job_timelines: JSON.stringify(job_timelines.job_timelines),
      })
        .then((res) => {
          console.log('uploadTimeElk success-------------', res)
        })
        .catch((error) => {
          console.log('uploadTimeElk error-------------', error)
        })
      // this.$trace.traceCustomEvent({
      //   event: 'online_work',
      //   xargs_event_category: 'process',
      //   event_value: 'process',
      //   event_info: {
      //     job_timelines: JSON.stringify(job_timelines.job_timelines),
      //     basic_info: JSON.stringify(basic_info),
      //   },
      // })
    },
    setLoadEnd(transId) {
      this.setTime('load', 'end', transId)
    },
    setTime(step, type, transId, timestamp, trans_time) {
      let historyInfo
      if (transId) {
        console.log(`${step} ${type} ${transId}`, this.timeMap[transId])
        if (!this.timeMap[transId]) {
          console.log(`未找到前置数据，停止执行${step} ${type} ${transId}`)
          return
        }
        historyInfo = this.timeMap[transId][step] || {}
        if (trans_time) {
          historyInfo.trans_time = trans_time
        }
        // 可能出现progress结束先预览图片，再请求历史记录触发start的情况
        if (step === 'load' && type === 'start' && historyInfo.end) {
          historyInfo.end = timestamp || Date.now()
        }
        this.timeMap[transId][step] = {
          ...historyInfo,
          [type]: timestamp || Date.now(),
        }
        if (step === 'load') {
          // 图片加载完成后上报
          const cur = this.timeMap[transId][step]
          if (cur.start && cur.end) {
            this.uploadTimeElk(transId)
          }
        }
      } else if (['start', 'upload', 'pre_process'].includes(step)) {
        console.log(`${step} ${type}`, this.tempTimeMap)
        historyInfo = this.tempTimeMap[step] || {}
        // 开始的时候恢复为默认值，没有重新上传图片就保留之前的
        if (step === 'start' && type === 'start') {
          this.tempTimeMap = {}
        }
        this.tempTimeMap[step] = {
          ...historyInfo,
          [type]: Date.now(),
        }
        // pre_process开始时间和上传结束时间一致
        if (step === 'upload' && type === 'end') {
          this.setTime('pre_process', 'start')
        }
      }
      // start | upload | pre_process | jobserver | worker | load
    },
    uploadImg(work) {
      this.setTime('start', 'end')
      this.setTime('upload', 'start')
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        const imageFileType = this.getFileType(work.file)
        // let workFile = work.file
        let remoteFIle = work.file
        if (imageFileType === 'image/jpeg') {
          remoteFIle = await this.handleRemoteImg(remoteFIle, imageFileType)
        }

        work.uploadStartTime = Date.now()

        work.status = 'uploading'
        // 第一次上传 自动化
        this.firstAutoProcessELK()
        //首次上传elk
        this.firstUploadELK()
        this.startUploadELK(work.w + 'X' + work.h)
        this.uploadCountELK()
        /* S3上传 start */
        try {
          //上传原图
          const startTime = Date.now()
          const uid = await uploadImageToS3(remoteFIle, {
            job: work.params.job,
            icc: work.icc,
            isCompress: work.isCompress,
          })
          const timestamp = Date.now() - startTime
          reportProcessElk(this, 'upload', {
            status: uid,
            time: (timestamp / 1000).toFixed(2),
          })
          this.firstUploadedELK()
          this.setUidFun({ uid, cid: work.u_uid })
          //上传缩略图
          if (work.thumbnail) {
            //缩略图在上传文件的组件中已经生成了
            await this.uploadThumbnail(work.thumbnail, work.file.name, { uid, job: work.params.job })
            this.setTime('upload', 'end')
            resolve({ uid })
          } else {
            //生成缩略图并上传
            const img = new Image()
            img.src = window.URL.createObjectURL(work.file)
            img.onload = async () => {
              try {
                const thumbUrl = this.imgThumb(img, 180, 180)
                await this.uploadThumbnail(thumbUrl, work.file.name, { uid, job: work.params.job })
                this.setTime('upload', 'end')
                resolve({ uid })
              } catch (err) {
                console.error(err)
                this.uploadFailELK(work.w + 'X' + work.h)
                this.setTime('upload', 'end')
                reject({ message: err.errorType })
              }
            }
          }
        } catch (err) {
          console.error(err)
          this.uploadFailELK(work.w + 'X' + work.h)
          this.setTime('upload', 'end')
          reject({ message: err.errorType })
        }
        /* S3上传 end */
      })
    },

    uploadImgV2(work, workName) {
      this.setTime('start', 'end')
      this.setTime('upload', 'start')
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        const imageFileType = this.getFileType(work.file)
        // let workFile = work.file
        let remoteFIle = work.file
        if (imageFileType === 'image/jpeg') {
          remoteFIle = await this.handleRemoteImg(remoteFIle, imageFileType)
        }

        work.uploadStartTime = Date.now()
        const formData = new FormData()
        formData.append('file', remoteFIle)
        const md5 = await this.handlePrepareUpload(remoteFIle)

        formData.append('md5', md5)
        this.uploadParams.guest_token_v2 = this.$getCookie('guestTokenV2')
        Object.keys(this.uploadParams).forEach((key) => {
          formData.append(key, this.uploadParams[key])
        })
        formData.append('job', workName)
        work.status = 'uploading'
        // 第一次上传 自动化
        this.firstAutoProcessELK()
        //首次上传elk
        this.firstUploadELK()
        this.startUploadELK(work.w + 'X' + work.h)
        this.uploadCountELK()
        /* S3上传 start */
        try {
          //上传原图
          const startTime = Date.now()
          const uid = await uploadImageToS3(remoteFIle, { job: workName })
          const timestamp = Date.now() - startTime
          reportProcessElk(this, 'upload', {
            status: uid,
            time: (timestamp / 1000).toFixed(2),
          })
          this.firstUploadedELK()
          this.setUidFun({ uid, cid: work.u_uid })

          //上传缩略图
          if (work.thumbnail) {
            //缩略图在上传文件的组件中已经生成了
            await this.uploadThumbnail(work.thumbnail, work.file.name, { uid, job: workName })
            this.setTime('upload', 'end')
            resolve({ uid })
          } else {
            //生成缩略图并上传
            const img = new Image()
            img.src = window.URL.createObjectURL(work.file)
            img.onload = async () => {
              try {
                const thumbUrl = this.imgThumb(img, 180, 180)
                await this.uploadThumbnail(thumbUrl, work.file.name, { uid, job: workName })
                resolve({ uid })
              } catch (err) {
                console.error(err)
                this.uploadFailELK(work.w + 'X' + work.h)
                this.setTime('upload', 'end')
                reject({ message: err.errorType })
              }
            }
          }
        } catch (err) {
          console.error(err)
          this.uploadFailELK(work.w + 'X' + work.h)
          this.setTime('upload', 'end')
          reject({ message: err.errorType })
        }
        /* S3上传 end */
      })
    },
    //上传缩略图
    async uploadThumbnail(thumbUrl, fileName, extraParams) {
      const file = dataURLtoFile(thumbUrl, fileName)
      await uploadImageToS3(file, extraParams)
    },
    //上传mask图
    async uploadMask(thumbUrl, fileName, extraParams) {
      const file = dataURLtoFile(thumbUrl, fileName)
      return await uploadImageToS3(file, extraParams)
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
  },
}
