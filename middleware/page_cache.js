// 页面缓存
import {
  getOperatingSystemInfo,
  is_x64,
  isMobile,
  getCookie,
  getLocale,
  getBrowser,
} from '../static/script/utils'
import { cache_post, getCacheVersion, page_cache_api_handler, get_cache_config } from '../mixins/cache'

const cache_config = get_cache_config()
const ignore_cache_uris = cache_config.ignore_cache_uris
const keep_cache_uris = cache_config.keep_cache_uris

const _post = cache_post
const get_page_cache_key = (req, uri) => {
  // 去掉 trackID 参数
  // if (Object.prototype.hasOwnProperty.call(req._parsedOriginalUrl, 'query') && req._parsedOriginalUrl.query) {
  //   const query = req._parsedOriginalUrl.query
  //   const query_arr = []
  //   for (const item of query.split('&')) {
  //     if (cache_config.page_cache_ignore_query_params.indexOf(item.toLowerCase().split('=')[0]) == -1) {
  //       query_arr.push(item)
  //     }
  //   }
  //   if (query_arr.length) {
  //     query_arr.sort()
  //     uri += '?' + query_arr.join('&')
  //   }
  // }

  const page_cache_key_format = cache_config.page_cache_key_format
  let page_cache_key_str = page_cache_key_format

  // 当前系统判断
  if (page_cache_key_format.indexOf('$os') != -1) {
    const os = getOperatingSystemInfo(req.headers['user-agent'])
    // if (os == 'win') {
    //   if (is_x64(req.headers['user-agent'])) {
    //     os += '_64'
    //   }
    // }
    page_cache_key_str = page_cache_key_str.replace('$os', os)
  }
  // webp判断
  if (page_cache_key_format.indexOf('$webp') != -1) {
    let isWebp = 'nonWepb'
    if (req.headers['accept'] && req.headers['accept'].indexOf('image/webp') != -1) {
      isWebp = 'webp'
    }
    page_cache_key_str = page_cache_key_str.replace('$webp', isWebp)
  }
  // pc和 mobile 判断
  if (page_cache_key_format.indexOf('$device') != -1) {
    const device = isMobile(req.headers['user-agent']) ? 'mobile' : 'pc'
    page_cache_key_str = page_cache_key_str.replace('$device', device)
  }
  // locale 判断
  if (page_cache_key_format.indexOf('$locale') != -1) {
    const locale = getLocale(req.headers['host'])
    page_cache_key_str = page_cache_key_str.replace('$locale', locale)
  }
  // domain 判断
  if (page_cache_key_format.indexOf('$domain') != -1) {
    page_cache_key_str = page_cache_key_str.replace('$domain', req.headers['host'])
  }
  // 浏览器判断
  if (page_cache_key_format.indexOf('$browser') != -1) {
    const browserType = getBrowser(req.headers['user-agent']) == 'ff' ? 'ff' : 'other_browser'
    page_cache_key_str = page_cache_key_str.replace('$browser', browserType)
  }
  // 登录状态判断
  if (page_cache_key_format.indexOf('$loginStatus') != -1) {
    const loginStatus = getCookie('token', req.headers['cookie']) ? 'logged' : 'no_logged'
    page_cache_key_str = page_cache_key_str.replace('$loginStatus', loginStatus)
  }
  return encodeURIComponent(page_cache_key_str + '.' + uri)
}

function handle_promotion(req, hit_html) {
  let html = hit_html
  if (Object.prototype.hasOwnProperty.call(req.headers, 'cookie')) {
    //如果关闭广告
    const flag =
      getCookie('closeBannerAd', req.headers['cookie']) ||
      (cache_config.celebrationIgnorePage || []).some((item) => item.test(req.url))
    if (flag) {
      if (html && typeof html === 'string') {
        html = html.replace(cache_config.bannerAd, `style="display: none;"`)
        html = html.replace(cache_config.mobileBannerAd, `style="display: none;"`)
      }
    }
    const CelebrationFlag = (cache_config.celebrationIgnorePage || []).some((item) => item.test(req.url))

    if (CelebrationFlag) {
      if (html && typeof html === 'string') {
        html = html.replace(cache_config.CelebrationAd, `style="display: none;"`)
      }
    }

    const CelebrationFloatFlag =
      getCookie('celebration_float_close', req.headers['cookie']) ||
      (cache_config.celebrationFloatIgnorePage || []).some((item) => item.test(req.url))

    if (CelebrationFloatFlag) {
      if (html && typeof html === 'string') {
        html = html.replace(cache_config.CelebrationFlotAd, `style="display: none;"`)
      }
    }
    if (html && typeof html === 'string') {
      if ((cache_config.ignorePaddingPage || []).some((item) => item.test(req.url))) {
        html = html.replace(cache_config.defaultPadding, `style="padding-top: 0;"`)
      } else {
        html = html.replace(cache_config.defaultPadding, `style="padding-top: 0;"`)
      }
      return html
    }
  }
  if ((cache_config.ignorePaddingPage || []).some((item) => item.test(req.url))) {
    html = html.replace(cache_config.defaultPadding, `style="padding-top: 0;"`)
  }

  return html
}
export default {
  handler(req, res, next) {
    console.log('enter /middleware/page_cache:       ', new Date().getTime())
    //防止他人网站iframe嵌套
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self'")
    if (req.url.indexOf('/json/versoin') !== -1) {
      return
    }
    if (page_cache_api_handler(req, res)) {
      return
    }

    // 如果是以端口方式请求，则不记录缓存，因为 $store.state.fullurl 会导致部分问题
    const isSetCache = req.headers['host'].indexOf(':') < 0
    const online = req.headers['host'].indexOf(':3000') < 0
    if (online && req._parsedOriginalUrl && req._parsedOriginalUrl.pathname) {
      /*
      req._parsedOriginalUrl:
      {
        protocol: null,
        slashes: null,
        auth: null,
        host: null,
        port: null,
        hostname: null,
        hash: null,
        search: '?trackID=1&a=2&b=333&c=4',
        query: 'trackID=1&a=2&b=333&c=4',
        pathname: '/blu-ray-copy.htm',
        path: '/blu-ray-copy.htm?trackID=1&a=2&b=333&c=4',
        href: '/blu-ray-copy.htm?trackID=1&a=2&b=333&c=4',
        _raw: '/blu-ray-copy.htm?trackID=1&a=2&b=333&c=4'
      }*/
      const uri = req._parsedOriginalUrl.pathname.replace('_', '-')

      // 通过路由判断，进行缓存
      if (!ignore_cache_uris.some((item) => uri.indexOf(item) !== -1)) {
        const key = get_page_cache_key(req, uri)

        //获取全局保存的版本信息
        const _ts = getCacheVersion()

        let suffix = '&ts=' + _ts
        if (keep_cache_uris.some((item) => uri.indexOf(item) !== -1)) {
          suffix = ''
        }

        _post('/get?key=' + key + suffix)
          .then((html) => {
            if (html) {
              html = handle_promotion(req, html)
              // 页面有缓存
              res.setHeader('Content-Type', 'text/html; charset=utf-8')
              res.setHeader('Accept-Ranges', 'none')
              if (html) {
                res.setHeader('Content-Length', Buffer.byteLength(html, 'utf-8'))
                // eslint-disable-next-line no-console
                console.log('------------------------ hit', html.length, Buffer.byteLength(html, 'utf-8'))
              }
              res.end(html, 'utf-8')
            } else {
              // 页面没有命中缓存
              res.original_end = res.end
              res.end = function (html) {
                if (isSetCache) {
                  if (res.statusCode === 200) {
                    _post('/set?key=' + key + '&ts=' + _ts, html)
                  }
                }
                html = handle_promotion(req, html)
                if (html) {
                  html = handle_promotion(req, html)
                  res.setHeader('Content-Length', Buffer.byteLength(html, 'utf-8'))
                  // eslint-disable-next-line no-console
                  console.log('------------------------ miss', html.length, Buffer.byteLength(html, 'utf-8'))
                }
                res.original_end(html, 'utf-8')
              }
              next()
            }
          })
          .catch((e) => {
            // eslint-disable-next-line no-console
            console.log('page_cache, problem with _post, error: ' + e.message + '\n' + e.stack)
            // 生活这么艰难，但是还得继续
            // 降级：即使 page_cache_service 不正常响应，但是页面还需要正常渲染
            res.original_end = res.end
            res.end = function (html) {
              if (html) {
                html = handle_promotion(req, html)
                res.setHeader('Content-Length', Buffer.byteLength(html, 'utf-8'))
                // eslint-disable-next-line no-console
                console.log('------------------------ catch', html.length, Buffer.byteLength(html, 'utf-8'))
              }
              res.original_end(html, 'utf-8')
            }
            next()
          })
      } else {
        // 页面不缓存
        res.original_end = res.end
        res.end = function (html) {
          if (html) {
            html = handle_promotion(req, html)
            res.setHeader('Content-Length', Buffer.byteLength(html, 'utf-8'))
            // eslint-disable-next-line no-console
            console.log('------------------------ not cache', html.length, Buffer.byteLength(html, 'utf-8'))
          }
          res.original_end(html, 'utf-8')
        }
        next()
      }
    } else {
      // 不是线上环境或 _parsedOriginalUrl 为空
      res.original_end = res.end
      res.end = function (html) {
        if (html) {
          html = handle_promotion(req, html)
          res.setHeader('Content-Length', Buffer.byteLength(html, 'utf-8'))
          // eslint-disable-next-line no-console
          console.log('------------------------ other', html.length, Buffer.byteLength(html, 'utf-8'))
        }
        res.original_end(html, 'utf-8')
      }
      next()
    }
  },
  path: '',
}
