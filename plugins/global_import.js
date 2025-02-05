import Vue from 'vue'
import { getCookie, setCookie, clearCookies, base64Encode, preloadImg, envJudge } from '@/static/script/utils'
import { devAssetsImgPath, testAssetsImgPath, onlineAssetsImgPath } from '@/static/config/common/env'
import servers from 'static/config/common/server.config'

console.log('enter /plugins/global_import:', new Date().getTime())

const ImgMap = require('@/static/json/rev-manifest.json')
Vue.$getCookie = Vue.prototype.$getCookie = getCookie
Vue.$setCookie = Vue.prototype.$setCookie = setCookie
Vue.$clearCookies = Vue.prototype.$clearCookies = clearCookies
Vue.$servers = Vue.prototype.$servers = servers
Vue.$base64Encode = Vue.prototype.$base64Encode = base64Encode
Vue.$preloadImg = Vue.prototype.$preloadImg = preloadImg
Vue.$imgPath = Vue.prototype.$imgPath = (path) => {
  //本地直接返回路径
  // if (process.browser) {
  //   if (window.location.host.indexOf(':3000') !== -1 || window.location.host.indexOf(':3001') !== -1) {
  //     return '/assets/images' + path
  //   }
  // } else {
  //   if (process.env.ENV === 'company' || ['pre1', 'pre2', 'pre3'].includes(process.env.LOCATION)) {
  //     return '/assets/images' + path
  //   }
  const hashUrlToNum = (url) => {
    const cache = {}
    if (cache[url]) {
      return cache[url]
    }

    let hash = 0
    for (let i = 0; i < url.length; i++) {
      hash += url.charCodeAt(i)
    }
    let result = hash % 4
    if (result == 0) {
      result = ''
    }
    cache[url] = result
    return result
  }
  // }
  try {
    //内网线上读取json文件
    // const response = await axios.get('https://c.vanceai.com/static/json/rev-manifest.json')
    // const ImgMap = response.data
    // if (ImgMap[path.substr(1)]) {
    //   path = '/' + ImgMap[path.substr(1)]
    // }
    const env = envJudge()
    const hash = hashUrlToNum(path)
    if (env == 'dev') {
      return devAssetsImgPath + path
    } else if (env == 'test') {
      const cdnDomain = testAssetsImgPath.replace(
        'test-s3-cloud.vanceai.com',
        `test-s3-cloud${hash}.vanceai.com`
      )
      return cdnDomain + path
    } else {
      const cdnDomain = onlineAssetsImgPath.replace('s3-cloud.vanceai.com', `s3-cloud${hash}.vanceai.com`)
      return cdnDomain + path
    }
  } catch (error) {
    console.error(error)
    return ''
  }
}

Vue.filter('toFixed', function (value) {
  value = value && Number(value)
  if (!value && value !== 0) {
    return ''
  }
  if (value <= 0) {
    return 0
  }
  if (String(value).indexOf('.') < 0) {
    return value
  }
  if (typeof value === 'number') {
    value = value.toFixed(1)
    return value
  }
})
Vue.$commonTrackLabel = Vue.prototype.$commonTrackLabel = function (labelSuffix) {
  const self = this
  let ctx = self.$parent
  let label = (self.$options.name || '') + (labelSuffix ? '_' + labelSuffix : '')
  // console.log('label: ', label)
  // console.log('$commonTrackLabel this: ', self)
  // console.log('ctx: ', ctx)
  // console.log('ctx.$options.name: ', ctx.$options.name)
  while (ctx) {
    const name = ctx.$options.name
    if (name) {
      if (ctx.$options.name === 'Nuxt' || ctx.$options.name === 'layouts/default.vue') {
        break
      } else {
        // console.log('name: ', name)
        label = name && name.replaceAll && name.replaceAll('-', '_') + '_' + label
      }
    }
    ctx = ctx.$parent
  }
  // console.log('commonTrackLabel label: ', label)
  return label
}
// eslint-disable-next-line no-unused-vars
Vue.config.errorHandler = (err, vm, info) => {
  // eslint-disable-next-line no-console
  console.error(err, info)
  console.error('|workspace.vanceai.com|', '---------err: ' + err.name + ' ' + err.message + ' ' + err.stack)
}
