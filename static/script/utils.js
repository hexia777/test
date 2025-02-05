import { browserDevEnvList, browserTestEnvList } from '../config/common/env'
const Base64 = require('js-base64').Base64
export const isMobile = (ua) => {
  // Referer https://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device-in-jquery
  let isMobile = false
  if (
    // eslint-disable-next-line max-len
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
      ua
    ) ||
    // eslint-disable-next-line max-len
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
      ua ? ua.substr(0, 4) : ''
    )
  ) {
    isMobile = true
  }

  return isMobile
}

export const getOperatingSystemInfo = (ua) => {
  if (/Win32|Windows/i.test(ua)) {
    return 'win'
  } else if (/AppleWebKit|Macintosh|Mac OS X|Mac68K|MacPPC|Macintosh|MacIntel|Mac OS/i.test(ua)) {
    return 'mac'
  } else {
    return 'win'
  }
}

export const is_x64 = (ua) => {
  let is_x64 = false
  if (/Win32|Windows/i.test(ua)) {
    if (ua.indexOf('WOW64') > -1 || ua.indexOf('Win64') > -1) {
      is_x64 = true
    }
  }

  return is_x64
}

export const getBrowser = (ua) => {
  const userAgent = ua //取得浏览器的userAgent字符串
  const isOpera = userAgent.indexOf('Opera') > -1 //判断是否Opera浏览器
  const isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera //判断是否IE浏览器
  const isEdge = userAgent.indexOf('Edge') > -1 //判断是否IE的Edge浏览器
  const isFF = userAgent.indexOf('Firefox') > -1 //判断是否Firefox浏览器
  const isSafari = userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') == -1 //判断是否Safari浏览器
  const isChrome = userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1 //判断Chrome浏览器

  if (isOpera) {
    return 'opera'
  }

  if (isEdge) {
    return 'edge'
  }

  if (isIE) {
    return 'ie'
  }

  if (isFF) {
    return 'ff'
  }

  if (isSafari) {
    return 'safari'
  }

  if (isChrome) {
    return 'chrome'
  }
}

export const getToken = () => {
  const token = getCookie('token')
  return token ? token : ''
}

export const getCookie = (name, cookies) => {
  let arr

  const data = process.browser ? document.cookie : cookies
  if (data) {
    arr = data.match(RegExp('(^| )' + name + '=([^;]*)(;|$)'))
  }

  return arr != null && arr[2] ? unescape(arr[2]) : null
}

export const setCookies = (param) => {
  for (const key in param) {
    setCookie(key, param[key], 7)
  }
}

export const resSetCookies = (res, cookie_name, cookie_val, expires) => {
  if (res.getHeader('Set-Cookie')) {
    res.setHeader('Set-Cookie', [
      cookie_name + '=' + cookie_val + '; expires=' + expires + '; path=/',
      ...res.getHeader('Set-Cookie'),
    ])
  } else {
    res.setHeader('Set-Cookie', [cookie_name + '=' + cookie_val + '; expires=' + expires + '; path=/'])
  }
}

export const setCookie = (name, value, expireDays, current_domain = false, end_time) => {
  setCloudCookie(name, value, expireDays)
}

export const clearCookies = async () => {
  const keys = document.cookie
  const cookies = keys.split(';')
  for (let i = 0; i < cookies.length; i++) {
    let cookieName = cookies[i].split('=')[0]
    cookieName = cookieName.trim()
    document.cookie = cookieName + '=0;expires=' + new Date(0).toUTCString()
  }
}

export const validateForm = (table) => {
  let ret = true
  for (let i = 0; i < table.length; i++) {
    table[i].validate()
    ret &= table[i].state == 'valid'
  }

  return ret
}

export const filterJson = (object) => {
  // 主要用在查询时过滤空值参数
  for (const i in object) {
    const value = object[i]
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length == 0) {
          delete object[i]
          continue
        }
      }
      filterJson(value)
      if (_isEmpty(value)) {
        delete object[i]
      }
    } else if (value === '' || value === null || value === undefined) {
      delete object[i]
    }
  }
  return object
}

const _isEmpty = (object) => {
  for (const name in object) {
    return false
  }
  return true
}

export const clone = (myObj) => {
  if (typeof myObj != 'object') {
    return myObj
  }
  if (myObj == null) {
    return myObj
  }
  const myNewObj = {}
  for (const i in myObj) {
    myNewObj[i] = clone(myObj[i])
  }
  return myNewObj
}

export const diffnew = (objget, objsubmit) => {
  if (typeof objsubmit != 'object') {
    return null
  }
  if (objsubmit == null) {
    return null
  }
  if (objget == null) {
    objget = {}
  }

  const out = {}

  for (const key in objsubmit) {
    const a = typeof objget[key]
    if (a == undefined) {
      out[key] = objsubmit[key]
      continue
    }

    if (objget[key] == objsubmit[key] || objsubmit[key] == null) {
      continue
    }

    out[key] = objsubmit[key]
  }

  return out
}

export const getLocale = (host) => {
  let locale = 'en'

  if (host.indexOf('de') != -1) {
    locale = 'de'
  } else if (host.indexOf('fr') != -1) {
    locale = 'fr'
  } else if (host.indexOf('ja') != -1) {
    locale = 'ja'
  } else if (host.indexOf('zh') != -1) {
    locale = 'zh'
  }

  return locale
}

export const routeName = (route) => {
  let path = route.path
  if (Object.prototype.hasOwnProperty.call(route.params, 'lang')) {
    path = path.split('/')[2] ? path.split('/')[2] : 'index'
  } else {
    path = path.split('/')[1] ? path.split('/')[1] : 'index'
  }

  return path.replace(/-/g, '_')
}

export const routeMatch = (list) => {
  let mathFlag = false
  list.forEach((url) => {
    if (location.pathname.indexOf(url) != -1) {
      mathFlag = true
    }
  })
  return mathFlag
}

export const lastRouteMatch = (route, matchRoute) => {
  let list = route.path.split('/')
  return list[list.length - 2] === matchRoute
}

export const formatDataTrack = (name, value, server_cookie) => {
  if (!value) {
    return ''
  }

  const _cookie = process.browser ? getCookie(name) : server_cookie
  let arr = _cookie ? _cookie.split(',') : []

  if (_cookie) {
    arr.unshift(value)
    arr = arr.slice(0, 5)
  } else {
    arr.push(value)
  }

  if (arr.length) {
    return arr.join(',')
  }
}

export const readLocalStorageArray = (key) => {
  const val = localStorage.getItem(key)
  if (val) {
    return JSON.parse(val)
  } else {
    return []
  }
}

export const readLocalStorageDict = (key) => {
  const val = localStorage.getItem(key)
  if (val) {
    return JSON.parse(val)
  } else {
    return {}
  }
}

export const readUserType = (user_id, pid = 0) => {
  if (!user_id) {
    return 'guest'
  }
  pid = Number(pid)
  if (user_id && pid === 0) {
    return 'free'
  } else {
    return 'paying'
  }
}

/**
 * @getUrlParam  获取url参数
 * @param {*} name 需要获取的key
 * @returns
 */
export const getUrlParam = (name) => {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  const r = window.location.search.substr(1).match(reg)
  return r != null ? unescape(r[2]) : null
}
export const getUrlParam2 = (name, url) => {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  const r = url.substr(1).match(reg)
  return r != null ? unescape(r[2]) : null
}

export const serverUrlParam = (name, ctx) => {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  const r = ctx.route.fullPath.substr(1).match(reg)
  return r != null ? unescape(r[2]) : null
}

/**
 * @getUrlParamServer 服务端获取url参数
 */
export const getUrlParamServer = (name, ctx) => {
  if (!ctx) {
    return
  }
  const reg = new RegExp('([?]|&)' + name + '=([^&]*)(&|$)')
  const r = ctx.route.fullPath.substr(1).match(reg)
  return r != null ? unescape(r[2]) : null
}

export function parseLocationQuery() {
  const query = {}
  const locationSearch = location.search
  if (!locationSearch) {
    return query
  }
  const queryStrArr = locationSearch.split('?')[1].split('&')
  queryStrArr.forEach((item) => {
    const queryItem = item.split('=')
    query[queryItem[0]] = queryItem[1]
  })
  return query
}

/**
 * @deepClone 深拷贝
 * @param {Object} target 要拷贝的对象
 * @return {Object}
 */
export function deepClone(obj) {
  //判断拷贝的要进行深拷贝的是数组还是对象，是数组的话进行数组拷贝，对象的话进行对象拷贝
  const objClone = Array.isArray(obj) ? [] : {}
  //进行深拷贝的不能为空，并且是对象或者是
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] && typeof obj[key] === 'object') {
          objClone[key] = deepClone(obj[key])
        } else {
          objClone[key] = obj[key]
        }
      }
    }
  }
  return objClone
}

/**
 * @sizeLengthFun 计算字符的实际长度
 * @param {String} str 字符
 */
export function sizeLengthFun(str) {
  return str.replace(/[\u0391-\uFFE5]/g, 'aa').length //先把中文替换成两个字节的英文，在计算长度
}

/**
 * @outPutPrice 输入金额
 * @param {Number} num 金额
 * @param {String} lan 语言 en ja fr de
 */
export function outPutPrice(num, lan) {
  // num = Number(num)
  const moneyCompany = {
    en: '$' + num,
    de: num.toString() + '€',
    // fr: num + '€',
    fr: num.toString() + '€',
    ja: '￥' + num,
  }
  return moneyCompany[lan]
}

export function outPutPrice2(num, lan) {
  const moneyCompany = {
    en: '<span class="symbol-box">$</span>' + num,
    de: num + '<span class="symbol-box symbol-right">€</span>',
    fr: num + '<span class="symbol-box symbol-right">€</span>',
    ja: '<span class="symbol-box">￥</span>' + num,
  }
  return moneyCompany[lan]
}

/**
 * @currencyPrice 输出币种
 * @param {String} lan 语言 en ja fr de
 */
export function currencyPrice(reqNum, current) {
  const num = reqNum * 1
  const moneyCompany = {
    USD: '$' + num,
    JPY: '￥' + num,
    EUR: Number(num).toFixed(2) + '€',
  }
  const numData = moneyCompany[current]
  if (!numData) {
    return ''
  }
  const str = numData.split('.')[1]
  let strNum = ''
  if (str || str === '0') {
    if (str.length == 0) {
      if (current === 'JPY') {
        strNum = '0'
      } else {
        strNum = '00'
      }
    } else if (str.length == 1) {
      if (current === 'JPY') {
        strNum = '0'
      } else {
        strNum = '0'
      }
    }
  } else {
    if (numData.split('.')[0] != 0) {
      strNum = '.0'
    }
  }

  return moneyCompany[current]
}

/**
 * @outCurrency 输出币种
 * @param {String} lan 语言 en ja fr de
 */
export function outCurrency(lan) {
  const currentData = {
    en: 'USD',
    ja: 'JPY',
    fr: 'EUR',
    de: 'EUR',
  }
  return currentData[lan] || currentData['en']
}

export const fileToDataURL = (file) => {
  console.log(file)
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      resolve(e.target.result)
    }
  })
}
export const dataURLToBlob = (dataURL) => {
  const arr = dataURL.split(',')
  const data = window.atob(arr[1])
  const mime = arr[0].match(/:(.*?);/)[1]
  const ia = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i++) {
    ia[i] = data.charCodeAt(i)
  }
  return new Blob([ia], { type: mime })
}
export const blobToImagePath = (blob) => {
  console.log(blob)
  return window.URL.createObjectURL(blob)
}

export const imageToBase64 = (image, type = 'png') => {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, image.width, image.height)
  const dataURL = canvas.toDataURL('image/' + type)
  return dataURL
}

// 将base64转换为blob
export const dataURLtoBlob = (dataurl) => {
  let arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}
// 将blob转换为file
export const blobToFile = (theBlob, fileName, type) => {
  return new window.File([theBlob], fileName, { type })
}

// 生成缩略图
export const imgThumb = (img, targetWidth, targetHeight) => {
  const canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d')
  canvas.width = targetWidth
  canvas.height = targetHeight

  const ratio = img.width > img.height ? canvas.height / img.height : canvas.width / img.width
  const x = img.width > img.height ? -(img.width - img.height) / 2 : 0
  const y = img.width > img.height ? 0 : -(img.height - img.width) / 2
  ctx.drawImage(img, x * ratio, y * ratio, img.width * ratio, img.height * ratio)
  return canvas.toDataURL()
}

export const getNowDate = () => {
  const date = new Date()
  const sign2 = ':'
  const year = date.getFullYear() // 年
  let month = date.getMonth() + 1 // 月
  let day = date.getDate() // 日
  let hour = date.getHours() // 时
  let minutes = date.getMinutes() // 分
  let seconds = date.getSeconds() //秒
  const weekArr = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天']
  const week = weekArr[date.getDay()]
  // 给一位数的数据前面加 “0”
  if (month >= 1 && month <= 9) {
    month = '0' + month
  }
  if (day >= 0 && day <= 9) {
    day = '0' + day
  }
  if (hour >= 0 && hour <= 9) {
    hour = '0' + hour
  }
  if (minutes >= 0 && minutes <= 9) {
    minutes = '0' + minutes
  }
  if (seconds >= 0 && seconds <= 9) {
    seconds = '0' + seconds
  }
  return year + '-' + month + '-' + day + 'T' + hour + sign2 + minutes + sign2 + seconds
}

export const fileSizeFun = (req) => {
  if (req) {
    const fileSizeNum = req / 1024
    if (fileSizeNum >= 1024) {
      return (fileSizeNum / 1024).toFixed(1) + 'MB'
    } else {
      return fileSizeNum.toFixed(1) + 'KB'
    }
  }
  return '0KB'
}

export const randomNum = (min, max) => {
  return parseInt(Math.random() * (max - min + 1) + min, 10)
}

export const isNull = (val) => {
  if (Array.isArray(val)) {
    return !val.length
  } else if (typeof val === 'object') {
    return val === null
  } else {
    return !val
  }
}

export const getFileSuffix = (val) => {
  if (isNull(val)) {
    return ''
  }
  if (val.lastIndexOf('.') === -1) {
    return ''
  }
  return val.substr(val.lastIndexOf('.') + 1)
}

export const envJudge = () => {
  if (process.browser) {
    if (browserDevEnvList.includes(window.location.host) || window.location.host.indexOf(':3001') !== -1) {
      return 'dev'
    } else if (browserTestEnvList.includes(window.location.host)) {
      return 'test'
    } else {
      return 'online'
    }
  } else {
    if (['company'].includes(process.env.ENV)) {
      return 'dev'
    } else if (['test'].includes(process.env.ENV)) {
      return 'test'
    } else {
      return 'online'
    }
  }
}

export const base64Encode = (data = {}) => {
  if (Object.prototype.toString.call(data) !== '[object Object]') {
    // eslint-disable-next-line no-console
    console.error('base64Encode方法的参数必须是Object类型')
    return
  }
  return Base64.encode(JSON.stringify(data))
}

//对图片旋转处理
export function rotateImg(img, direction, canvas) {
  console.log('开始旋转图片')
  //图片旋转4次后回到原方向
  if (img == null) {
    return
  }
  const height = img.height
  const width = img.width
  let step = 2

  if (direction == 'right') {
    step++
  } else if (direction == 'left') {
    step--
  } else if (direction == 'horizen') {
    step = 2 //不处理
  }
  //旋转角度以弧度值为参数
  const degree = (step * 90 * Math.PI) / 180
  const ctx = canvas.getContext('2d')
  switch (step) {
    case 0:
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0)
      break
    case 1:
      canvas.width = height
      canvas.height = width
      ctx.rotate(degree)
      ctx.drawImage(img, 0, -height)
      break
    case 2:
      canvas.width = width
      canvas.height = height
      ctx.rotate(degree)
      ctx.drawImage(img, -width, -height)
      break
    case 3:
      canvas.width = height
      canvas.height = width
      ctx.rotate(degree)
      ctx.drawImage(img, -width, 0)
      break
  }
  console.log('结束旋转图片')
  return canvas
}

export function convertBase64UrlToFile(urlData, fileName, fileType) {
  const bytes = window.atob(urlData.split(',')[1]) //去掉url的头，并转换为byte

  //处理异常,将ascii码小于0的转换为大于0
  const ab = new ArrayBuffer(bytes.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < bytes.length; i++) {
    ia[i] = bytes.charCodeAt(i)
  }

  return new File([ab], fileName, { type: fileType })
}

export function convertImageUrlToBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'

    img.onload = function () {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const dataURL = canvas.toDataURL('image/png')
      resolve(dataURL)
    }

    img.onerror = function (error) {
      reject(error)
    }

    img.src = url
  })
}

export function preloadImg(url) {
  return {
    rel: 'preload',
    as: 'image',
    href: url,
  }
}

export function getLocalName(prefix, locale) {
  switch (locale) {
    case 'de':
    case 'fr':
    case 'ja':
      return `${prefix}_${locale}`
    default:
      return prefix
  }
}

export function dateFormat(data, locale) {
  const dateArr = data.split('-')
  const year = dateArr[0]
  const mon = dateArr[1]
  const day = dateArr[2]
  let newDateFormate = ''
  const month = '${month}'
  if (locale === 'en') {
    newDateFormate = month + ' ' + day + ', ' + year
  } else if (locale === 'ja') {
    newDateFormate = year + '年' + month + day + '日'
  } else if (locale === 'fr') {
    newDateFormate = day + ' ' + month + ' ' + year
  } else if (locale === 'de') {
    newDateFormate = day + '. ' + month + ' ' + year
  }
  return [newDateFormate, mon]
}

export function debounce(fn, delay) {
  let timer = null
  return function () {
    const context = this
    const args = arguments
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}

export function formatAmount(amount, locale) {
  let [integerPart, decimalPart] = String(amount).split('.')
  if (decimalPart) {
    decimalPart = parseFloat(amount - integerPart).toFixed(2)
    if (decimalPart.split('.')[1].length === 1) {
      decimalPart += '0'
    }
    decimalPart = Number(decimalPart) * 100
  } else {
    decimalPart = '00'
  }

  //integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (locale == 'ja') {
    return integerPart
  } else {
    return `${integerPart}.${decimalPart}`
  }
}

export function formateLocaleUrl(ll, url) {
  return url.replace('${ll}', ll ? ll : '')
}

export function handleShowImgSize(imgW, imgH, boxWidth, boxHeight) {
  let showImgW = imgW
  let showImgH = imgH
  if (imgH < boxHeight && imgW < boxWidth) {
    return { showImgW, showImgH }
  }
  if (imgH > boxHeight && imgW < boxWidth) {
    showImgH = boxHeight
    showImgW = (boxHeight / imgH) * imgW
    return { showImgW, showImgH }
  }
  if (imgW > boxWidth && imgH < boxHeight) {
    showImgH = (boxWidth / imgW) * imgH
    showImgW = boxWidth
    return { showImgW, showImgH }
  }
  if (imgW / boxWidth > imgH / boxHeight) {
    showImgH = (boxWidth / imgW) * imgH
    showImgW = boxWidth
    return { showImgW, showImgH }
  } else {
    showImgH = boxHeight
    showImgW = (boxHeight / imgH) * imgW
    return { showImgW, showImgH }
  }
}

export function hasICCProfile(data) {
  const ICC_MARKER = [0xff, 0xe2]
  for (let i = 0; i < data.length - 1; i++) {
    if (data[i] === ICC_MARKER[0] && data[i + 1] === ICC_MARKER[1]) {
      // const length = (data[i + 2] << 8) + data[i + 3];
      return true
    }
  }
  return false
}

export function hasICCProfile2(arrayBuffer) {
  const view = new DataView(arrayBuffer)
  var offset = 2
  while (offset < view.byteLength) {
    if (view.getUint16(offset, false) === 0xffe2) {
      var length = view.getInt16(offset, false)
      var signature = Array.from(new Uint8Array(arrayBuffer, offset + 4, 11))
        .map((x) => String.fromCharCode(x))
        .join('')
      if (signature === 'ICC_PROFILE') {
        return true
      }
      offset += length
    } else {
      offset += 2
    }
  }
  return true
}

// 计算在限制宽高下，图片缩放后的宽高
export const getFitWidthHeight = (
  containerWidth,
  containerHeight,
  originWidth,
  originHeight,
  needEnlarge
) => {
  const maxWidth = containerWidth
  const maxHeight = containerHeight
  let widthRate = 1
  let heightRate = 1
  if (originWidth > maxWidth) {
    widthRate = maxWidth / originWidth
  }

  if (originHeight > maxHeight) {
    heightRate = maxHeight / originHeight
  }
  if (needEnlarge) {
    if (originWidth < maxWidth) {
      widthRate = maxWidth / originWidth
    }
    if (originHeight < maxHeight) {
      heightRate = maxHeight / originHeight
    }
  }
  const finalRate = widthRate > heightRate ? heightRate : widthRate
  const fitWidth = originWidth * finalRate
  const fitHeight = originHeight * finalRate
  return {
    width: fitWidth,
    height: fitHeight,
    rate: finalRate,
  }
}

/**
 * 往主应用发送数据
 */
//弹出登录框
export function setLoginDialogShow() {
  setGlobalData('subApp_SET_LOGIN_DIALOG_SHOW')
}
//查点
export function getCredits() {
  setGlobalData('subApp_GET_POINT')
}
//guestTokenV2失效
export function guestTokenInvalidedNotify() {
  setGlobalData('subApp_GuestTokenV2_IS_INVALID')
}

function setGlobalData(event) {
  if (window.__MICRO_APP_ENVIRONMENT__) {
    window.microApp.setGlobalData({ [event]: true }, () => {
      window.microApp.setGlobalData({ [event]: false })
    })
  }
}

export function setCloudCookie(name, value, expireDays) {
  setGlobalDataByObj('subApp_SET_CLOUD_COOKIE_'+name, { name, value, expireDays })
}

function setGlobalDataByObj(event, obj) {
  if (window.__MICRO_APP_ENVIRONMENT__) {
    window.microApp.setGlobalData({ [event]: obj }, () => {
      window.microApp.setGlobalData({ [event]: null })
    })
  }
}

export function closeWorkspaceDialog() {
  dispatchData('subApp_CLOSE_WORKSPACE_DIALOG')
}

export function dispatchData(event) {
  if (window.__MICRO_APP_ENVIRONMENT__) {
    window.microApp.forceDispatch({ [event]: true })
  }
}
