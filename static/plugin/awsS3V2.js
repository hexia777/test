import {
  directUploadS3,
  getAttachUploadUrl,
  getS3DownloadUrlV2,
  getS3PreviewUrlV2,
  getS3UploadUrlV2,
} from '@/static/script/api/s3'
import imageCompression from 'browser-image-compression'

// 上报数据
export const reportProcessElk = (context, type, params) => {
  const { status, time } = params
  const baseElkParams = {}
  if (type === 'upload') {
    baseElkParams.upload_method_type = 's3'
    baseElkParams.upload_status = status ? 'success' : 'failure'
    baseElkParams.upload_time = parseFloat(time) || 0
  } else if (type === 'download') {
    baseElkParams.down_method_type = 's3'
    baseElkParams.down_status = status ? 'success' : 'failure'
    baseElkParams.down_time = parseFloat(time) || 0
  }

  const newElkPrams = { ...baseElkParams }
  // 新版本
  context.$trace.traceCustomEvent({
    event: 'online_work',
    xargs_event_category: type,
    event_value: type,
    event_info: {
      ...newElkPrams,
    },
  })
}

function directUploadS3WithRetry(preSignUrl, file, delay = 1000, retryTimes = 5) {
  return new Promise((resolve, reject) => {
    function attempt() {
      if (retryTimes <= 0) {
        reject({ isUploaded: false })
        return
      }
      directUploadS3(preSignUrl, file)
        .then(() => {
          resolve({ isUploaded: true })
        })
        .catch(() => {
          retryTimes--
          setTimeout(attempt, delay)
        })
    }
    attempt()
  })
}

/**
 * @param {*} file File对象
 * @param {*} validateParams
 * limitWidthOrHeigh?: Number; 单边最大长度
 * limitSize?: Number; 图片最大值
 * limitPixel?: Number; 宽高的最大乘积
 */
function getLimitImage(file, validateParams = {}) {
  return new Promise((resolve, reject) => {
    const { limitWidthOrHeigh, limitSize, limitPixel } = validateParams
    if (validateParams && (limitWidthOrHeigh || limitSize || limitPixel)) {
      let handledFile = file
      const image = new Image()
      image.src = window.URL.createObjectURL(file)
      image.onload = async () => {
        const originWidth = image.width
        const originHeight = image.height
        let targetWidth = originWidth
        let targetHeight = originHeight
        // 宽高乘积大于限定值
        if (limitPixel && originWidth * originHeight > limitPixel) {
          targetWidth = originWidth * Math.sqrt(limitPixel / (originWidth * originHeight))
          targetHeight = originHeight * Math.sqrt(limitPixel / (originWidth * originHeight))
        }

        if (limitWidthOrHeigh && targetWidth > targetHeight && targetWidth > limitWidthOrHeigh) {
          // 顺序不能变动
          targetHeight = (limitWidthOrHeigh / targetWidth) * targetHeight
          targetWidth = limitWidthOrHeigh
        } else if (limitWidthOrHeigh && targetWidth <= targetHeight && targetHeight > limitWidthOrHeigh) {
          targetWidth = (limitWidthOrHeigh / targetHeight) * targetWidth
          targetHeight = limitWidthOrHeigh
        }

        try {
          // 图片宽高压
          if (targetWidth !== originWidth || targetHeight !== originHeight) {
            const maxWidthOrHeight = targetWidth > targetHeight ? targetWidth : targetHeight
            handledFile = await imageCompression(handledFile, {
              maxWidthOrHeight,
            })
          }

          if (limitSize && handledFile.size > limitSize * 1024 * 1024) {
            handledFile = await imageCompression(handledFile, {
              maxSizeMB: limitSize,
            })

            if (handledFile.size > limitSize * 1024 * 1024) {
              console.log({ success: false, errorType: 'IMAGE_LIMIT_COMPRESS_ERROR' })
              reject({ success: false, errorType: 'IMAGE_LIMIT_COMPRESS_ERROR' })
              return
            }
          }
          resolve(handledFile)
        } catch (error) {
          console.log({ success: false, errorType: 'IMAGE_LIMIT_COMPRESS_ERROR' }, error)
          reject({ success: false, errorType: 'IMAGE_LIMIT_COMPRESS_ERROR', error })
        }
      }
      image.onerror = () => {
        console.log({ success: false, errorType: 'IMAGE_LIMIT_LOAD_ERROR' })
        reject({ success: false, errorType: 'IMAGE_LIMIT_LOAD_ERROR' })
      }
    } else {
      resolve(file)
    }
  })
}
/**
 * @param {*} file File对象
 *  * @param {*} extraParams
 * uid?: Number; 与原图绑定的缩略图的uid
 * resource?: String; 后端存储的resource值
 * job?: String; 后端存储的job值
 * @param {*} validateParams
 * limitWidthOrHeigh?: Number; 单边最大长度
 * limitSize?: Number; 图片最大值
 * limitPixel?: Number; 宽高的最大乘积
 */
export function uploadImageToS3(file, extraParams = {}, validateParams = {}) {
  return new Promise((resolve, reject) => {
    if (!file) {
      console.log({ success: false, errorType: 'NO_FILE_ERROR' })
      reject({ success: false, errorType: 'NO_FILE_ERROR' })
    }
    const fileSize = file.size
    getLimitImage(file, validateParams)
      .then(
        () => {
          try {
            const reader = new FileReader()
            reader.onload = function (e) {
              const img = new Image()
              img.onload = async function () {
                try {
                  const width = img.width
                  const height = img.height
                  const params = {
                    file_name: file.name,
                    file_size: fileSize,
                    extra: JSON.stringify({
                      pic_width: width,
                      pic_height: height,
                      job: (extraParams && extraParams.job) || '',
                      is_thumbnail: extraParams && extraParams.uid ? 1 : 0,
                      icc: extraParams && extraParams.icc ? 1 : 0,
                      compress: extraParams && extraParams.isCompress ? 1 : 0,
                    }),
                  }
                  if (extraParams.uid) {
                    params.uid = extraParams.uid
                  }
                  const res = await getS3UploadUrlV2(params)
                  if (res.code === 200 && res.data) {
                    const { uid } = res.data
                    await directUploadS3WithRetry(res.data.presignUrl, file)
                    resolve(uid)
                  } else {
                    reject({
                      success: false,
                      errorType: 'getS3UploadUrl api error,params is:' + JSON.stringify(params),
                    })
                  }
                } catch (error) {
                  console.log({ success: false, errorType: 'IMAGE_UPLOAD_ERROR' })
                  reject({ success: false, errorType: 'IMAGE_UPLOAD_ERROR_111_' + error.message })
                }
              }
              img.src = e.target.result
            }
            reader.readAsDataURL(file)
          } catch (error) {
            console.log({ success: false, errorType: 'IMAGE_UPLOAD_ERROR' })
            reject({ success: false, errorType: 'IMAGE_UPLOAD_ERROR_222_' + error.message })
          }
        },
        (error) => {
          console.log({ success: false, errorType: 'IMAGE_UPLOAD_ERROR' }, error)
          reject({ success: false, errorType: 'IMAGE_UPLOAD_ERROR_333_' + error.message }, error)
        }
      )
      .catch((error) => {
        // 捕获图片压缩时候的错误上报,不然出现异常方法不会报错
        reject(error)
      })
  })
}

export function uploadAttachToS3(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      console.log({ success: false, errorType: 'NO_FILE_ERROR' })
      reject({ success: false, errorType: 'NO_FILE_ERROR' })
    }
    try {
      const reader = new FileReader()
      reader.onload = async function (e) {
        try {
          const params = {
            file_name: file.name,
          }
          const res = await getAttachUploadUrl(params)
          if (res.code === 200 && res.data) {
            const { filePath } = res.data
            await directUploadS3WithRetry(res.data.presignUrl, file)
            resolve(filePath)
          } else {
            reject({
              success: false,
              errorType: 'getAttachUploadUrl api error,params is:' + JSON.stringify(params),
            })
          }
        } catch (error) {
          console.log({ success: false, errorType: 'ATTACH_UPLOAD_ERROR' })
          reject({ success: false, errorType: 'ATTACH_UPLOAD_ERROR_111_' + error.message })
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.log({ success: false, errorType: 'ATTACH_UPLOAD_ERROR' })
      reject({ success: false, errorType: 'ATTACH_UPLOAD_ERROR_222_' + error.message })
    }
  })
}

export function getPreviewUrl(previewParam) {
  const { transId, issrc } = previewParam
  return new Promise((resolve, reject) => {
    try {
      const params = {
        trans_id: transId,
        extra: JSON.stringify({ issrc }),
      }
      getS3PreviewUrlV2(params).then((res) => {
        const imageUrl = res.data.presignUrl
        resolve(imageUrl)
      })
    } catch (error) {
      console.log({ success: false, errorType: 'IMAGE_PREVIEW_ERROR' })
      reject({ success: false, errorType: 'IMAGE_PREVIEW_ERROR' })
    }
  })
}

export function getPreviewUrlData(previewParam) {
  const { transId, issrc } = previewParam
  return new Promise((resolve, reject) => {
    try {
      const params = {
        trans_id: transId,
        extra: JSON.stringify({ issrc }),
      }
      getS3PreviewUrlV2(params).then((res) => {
        // const imageUrl = res.data.presignUrl
        resolve(res.data || {})
      })
    } catch (error) {
      console.log({ success: false, errorType: 'IMAGE_PREVIEW_ERROR' })
      reject({ success: false, errorType: 'IMAGE_PREVIEW_ERROR' })
    }
  })
}

export function getDownloadUrlFromS3(trans_id, issrc) {
  return new Promise((resolve, reject) => {
    try {
      const params = {
        trans_id,
        extra: JSON.stringify({ issrc }),
      }
      getS3DownloadUrlV2(params).then((res) => {
        resolve(res.data)
      })
    } catch (error) {
      console.log({ success: false, errorType: 'IMAGE_DOWNLOAD_ERROR' })
      reject({ success: false, errorType: 'IMAGE_DOWNLOAD_ERROR' })
    }
  })
}
