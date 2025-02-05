const uris = [
  '/streamfab-promotion.htm',
  // order
  //'/test-ab-test', // TODO 用来测试ab测试的页面 cloudflare测试完就可以删除
  '/',
  //'/index.htm', //301
  '/order.htm',
  //'/bundles.htm', //301
  //'/bundles-for-mac.htm', //301
  '/download.htm',
  '/free.htm',
  //'/products.htm', //301
  // '/checkout.htm', //存在，但是不缓存
  //'/card-info.htm', //存在，但是不缓存
  '/contact.htm',
  '/newsletter.htm',
  //'/payment.htm', //存在，但是不缓存
  //'/paypal.htm', //存在，但是不缓存
  '/pcgo.htm',
  //'/thankyou.htm', //存在，但是不缓存
  // '/download-dvdfab-mac.htm', //展示异常
  // '/download-dvdfab-win.htm', //展示异常
  '/dvdfab-pad.htm',
  '/close-app.htm',
  '/convert-fail.htm',
  '/convert-success.htm',
  '/open-fail.htm',

  // news
  //'/news', //301
  '/downloader-mac-new.htm',
  '/downloader-new.htm',
  '/dvd-fab-new.htm',
  '/dvdfab-mac-new.htm',
  '/toolkit-new.htm',
  '/media-player-mac-new.htm',
  '/media-player-new.htm',
  '/passkey-new.htm',
  //'/pc-backup-new.htm', //404

  // technology
  '/technology.htm',
  '/uhdpath.htm',
  '/8k-uhd.htm',
  '/videotoolbox.htm',
  '/exactread.htm',
  '/10-bit-conversion-profile.htm',
  '/bdfix.htm',
  '/amd-app.htm',
  '/cloud-decryption.htm',
  '/pathplayer.htm',
  '/blupath.htm',
  '/metainfo.htm',
  '/stealthy-clone.htm',
  '/lightning-shrink.htm',
  '/cinavia.htm',
  '/lightning-recoding.htm',
  '/miniso.htm',
  '/intel-quick-sync.htm',
  '/nvidia-cuda.htm',
  '/bdshrink.htm',
  '/bdinfo.htm',
  '/about-4k.htm',
  '/h265.htm',
  '/4k-uhd-drives.htm',
  '/4k-uhd-solution.htm',

  // static
  '/links.htm',
  //'/links2.htm', //没有内容
  '/webmaster.htm',
  '/company.htm',
  '/cookies-policy.htm',
  //'/dvdfabpad.htm', //404
  '/terms-of-use.htm',
  '/how-to-register.htm',
  '/about.htm',
  '/awards-and-reviews.htm',
  '/opensource.htm',
  '/pricelist.htm',
  '/privacy.htm',
  '/purchase-policy.htm',
  '/review-campaign.htm',
  //'/sitemap.htm', //301
  //'/dvdfab10-more-stable.htm', //301
  //'/dvdfab10-new-ui.htm', //301
  //'/dvdfab10-productive.htm', //301
  //'/dvdfab10-run-faster.htm', //301
  //'/supported-online-sites-for-downloader.htm', //301
  //'/supported-online-sites-list.htm', //404

  // article
  //'/video-downloader-topic.htm', //404
  '/multimedia-culture.htm',
  '/video-downloader.htm',
  '/manual-for-mac.htm',
  //'/movies-info.htm', //404
  '/resource',
  //'/tutorial', //301
  '/reviews',
  //'/seiyuu.htm', //404
  //'/manual', //301
  //'/anime.htm', //404
  '/tips.htm',
  //'/ura.htm', //404
  '/faq.htm',
  //'/author.htm', //404

  // products
  '/all-in-one.htm',
  //'/all-in-one-for-mac.htm', //301
  '/blu-ray-cinavia-removal.htm',
  //'/blu-ray-cinavia-removal-for-mac.htm', //301
  '/blu-ray-copy.htm',
  //'/blu-ray-copy-for-mac.htm', //301
  '/blu-ray-creator.htm',
  //'/blu-ray-creator-for-mac.htm', //301
  '/blu-ray-ripper.htm',
  //'/blu-ray-ripper-for-mac.htm', //301
  '/blu-ray-to-dvd-converter.htm',
  '/blu-ray-to-dvd-converter-for-mac.htm',
  '/blu-ray-to-uhd-converter.htm',
  '/downloader.htm',
  // '/downloader-for-mac.htm', //301
  //'/drm-removal.htm', //301
  //'/dvd-blu-ray-cinavia-removal.htm', //301
  //'/dvd-blu-ray-cinavia-removal-for-mac.htm', //301
  '/dvd-cinavia-removal.htm',
  //'/dvd-cinavia-removal-for-mac.htm', //301
  '/dvd-copy.htm',
  //'/dvd-copy-for-mac.htm', //301
  '/dvd-creator.htm',
  //'/dvd-creator-for-mac.htm', //301
  '/dvd-ripper.htm',
  //'/dvd-ripper-for-mac.htm', //301
  '/dvd-to-blu-ray-converter.htm',
  //'/dvd-to-blu-ray-converter-for-mac.htm', //301
  //'/dvdfab-diy.htm', //301
  '/dvdfab-remote.htm',
  //'/dvdfab11.htm', //301
  //'/dvdfab12.htm', //301
  '/dvdfab13.htm',
  //'/dvdfab365.htm', dvdfab365涉及用户信息判断
  //'/enlarger-ai.htm', //301
  '/file-transfer.htm',
  '/file-transfer-for-mac.htm',
  //'/hd-decrypter.htm', //301
  //'/hd-decrypter-for-mac.htm', //301
  //'/hi-fi-audio-converter.htm', //301
  //'/hi-fi-audio-converter-for-mac.htm', //301
  '/mac-blu-ray-player.htm',
  //'/mac-drm-removal-for-apple.htm', //301
  //'/media-player.htm', //301
  '/media-recover-for-dvd.htm',
  '/media-recover-for-ripper.htm',
  '/media-recover-for-dvd-blu-ray.htm',
  //'/movie-server.htm', //301
  '/passkey-for-blu-ray.htm',
  '/passkey-for-dvd.htm',
  '/passkey-lite.htm',
  //'/pc-backup.htm', //301
  //'/screen-recorder-editor-for-ios.htm', //301
  //'/toolkit.htm', //301
  '/uhd-cinavia-removal.htm',
  //'/uhd-cinavia-removal-for-mac.htm', //301
  '/uhd-copy.htm',
  //'/uhd-copy-for-mac.htm', //301
  '/uhd-creator.htm',
  '/uhd-drive-tool.htm',
  '/uhd-ripper.htm',
  //'/uhd-ripper-for-mac.htm', //301
  '/uhd-to-blu-ray-converter.htm',
  //'/video-converter.htm', //301
  //'/video-converter-for-mac.htm', //301
  //'/video-converter-lite-for-mac.htm', //301
  //'/video-downloader.htm', //301
  //'/video-downloader-for-mac.htm', //301
  //'/virtual-drive.htm', //301
  //'/youtube-to-mp3.htm', //301
  //'/youtube-to-mp3-for-mac.htm', //301
  '/mvc-codecs.htm',
  //'/2d-to-3d-converter.htm', //301
  //'/2d-to-3d-converter-for-mac.htm', //301
  //'/3d-video-toolkit.htm', //301
  //'/3d-video-toolkit-for-mac.htm', //301
  //'/baseball-cap.htm', //301
  //'/blu-ray-3d-ripper.htm', //301
  //'/blu-ray-3d-ripper-for-mac.htm', //301
  //'/blu-ray-copy-ripper.htm', //404
  //'/blu-ray-copy-ripper-for-mac.htm', //404
  //'/blu-ray-toolkit.htm', //301
  //'/blu-ray-toolkit-for-mac.htm', //301
  //'/business-backpack.htm', //301
  //'/cinaviaremoval-hd.htm', //301
  //'/cinaviaremoval-hd-for-mac.htm', //301
  //'/copy-suite.htm', //404
  //'/copy-suite-for-mac.htm', //404
  // '/copy-suite-pro.htm', //404
  //'/copy-suite-pro-for-mac.htm', //404
  //'/dvd-blu-ray-cinavia-removal.htm', //301
  //'/dvd-blu-ray-cinavia-removal-for-mac.htm', //301
  //'/dvd-copy-ripper.htm', //404
  //'/dvd-copy-ripper-for-mac.htm', //404
  //'/dvdfab-bluray-suite.htm', //404
  '/dvdfab-remote.htm',
  //'/dvdfab-streaming.htm', //404
  //'/dvdfab-streaming-for-mac.htm', //404
  //'/ifonerestore.htm', //301
  //'/ifonerestore-for-mac.htm', //301
  //'/movie-server-3years.htm', //404
  //'/passkey-dvd-blu-ray.htm', //404
  //'/ripper-suite.htm', //404
  //'/ripper-suite-for-mac.htm', //404
  //'/ripper-suite-pro.htm', //404
  //'/ripper-suite-pro-for-mac.htm', //404
  //'/sleeve-hoodie.htm', //301
  //'/uhd-copy-ripper-cinaval.htm', //404
  //'/uhd-copy-uhd-ripper.htm', //404
  //'/uhd-creator-for-mac.htm', //404
  //'/uhd-suite.htm', //404
  //'/uhd-to-blu-ray-converter-for-mac.htm', //404
  //'/video-converter-lite-for-mac.htm', //301
  //'/virtual-drive.htm', //301
  //'/youtube-video-downloader.htm', //301
  '/4k-recorder-copy.htm',
  '/4k-recorder-ripper.htm',
  //'/4k-recorder-copy-for-mac.htm', //301
  //'/4k-recorder-ripper-for-mac.htm', //301
  '/blu-ray-recorder-copy.htm',
  '/blu-ray-recorder-ripper.htm',
  '/passkey-for-4k-recorder.htm',
  '/passkey-for-blu-ray-recorder.htm',
  //'/video-enhancer-ai.htm', //301
  '/photo-enhancer-ai.htm',
  //'/videocruise-video-editor.htm', //301
  //'/video-converter.htm', //301
  //'/video-converter-pro.htm', //301
  //'/drm-video-downloader.htm', //301
  '/apple-tv-plus-downloader.htm',
  //'/clientad-downloader-mac.htm', //301
  '/hulu-downloader.htm',
  '/netflix-downloader.htm',
  '/amazon-downloader.htm',
  //'/amazon-downloader-for-mac.htm', //301
  '/disney-plus-downloader.htm',
  //'/hbo-downloader.htm', //301
  '/paramount-plus-downloader.htm',
  '/unext-downloader.htm',
  '/abematv-downloader.htm',
  '/chip.htm',
  '/chip-geschenk.htm',
  '/chip-giveaway.htm',
  '/pcgo.htm',
  //'/pcgo-ngebot.htm', //404
  '/pcgo-geschenk.htm',
  '/pcgo-giveaway.htm',
  '/pcgo-leser.htm',
  '/pcmagazin.htm',
  '/pcmagazin-angebot.htm',
  '/pcmagazin-geschenk.htm',
  '/pcmagazin-giveaway.htm',
  '/pcmagazin-leser.htm',
  //'/r18-downloader.htm', //301
  '/espn-plus-downloader.htm',
  //'/funimation-downloader.htm', //301
  '/chip-angebot.htm',
  '/hardware-gaming-guide.htm',
  '/pc-welt.htm',
  '/pc-welt-leser.htm',
  '/pc-welt-angebot.htm',
  '/fanza-downloader.htm',
  //'/youtube-video-downloader-free.htm', //404
  //'/youtube-to-mp3-converter.htm', //301
  //'/home', //404
]

const article_uris_re = /^\/(video-downloader-for-mac|video-downloader|manual-for-mac|movies-info|tutorial|resource|reviews|seiyuu|anime|manual|movies|news|tips|ura|faq|downloader|author|abematv-downloader|amazon-downloader|apple-tv-plus-downloader|disney-plus-downloader|hbo-downloader|hulu-downloader|netflix-downloader|paramount-plus-downloader|unext-downloader|youtube-video-downloader|r18-downloader|youtube-movie-downloader|espn-plus-downloader)\//i

//const ageProofCacheKeyUris = ['/fanza-downloader.htm', '/r18-downloader.htm']
//目前这2个页面没有看到差异化展示
const ageProofCacheKeyUris = []

const CACHE_COOKIES = ['close_coupon_dvdfab_promotion_halloween_24']

const client_env_info_key = '_client'
const cache_cookie_key = '_profile'

let debuggerMode = false

const ignoreQueryParams = ['debugger', 'trackid']

// region url info
const getBrowser = (ua) => {
  if (!ua) {
    return 'chrome'
  }

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

const getCookie = (name, cookies) => {
  let arr

  const data = cookies
  if (data) {
    arr = data.match(RegExp('(^| )' + name + '=([^;]*)(;|$)'))
  }

  return arr != null ? unescape(arr[2]) : null
}

const getLocale = (host) => {
  // 日本服务器不好挂代理测试，因此增加本行
  /*if (process.env.LOCATION == 'ja') {
    return 'ja'
  }*/

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

const getOperatingSystemInfo = (ua) => {
  if (/Win32|Windows/i.test(ua)) {
    return 'win'
  } else if (/Mac68K|MacPPC|Macintosh|MacIntel/i.test(ua)) {
    return 'mac'
  } else {
    return 'win'
  }
}

const isMobile = (ua) => {
  // Referer https://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device-in-jquery
  let isMobile = false
  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
      ua
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
      ua ? ua.substr(0, 4) : ''
    )
  ) {
    isMobile = true
  }

  return isMobile
}

const is_x64 = (ua) => {
  let is_x64 = false
  if (/Win32|Windows/i.test(ua)) {
    if (ua.indexOf('WOW64') > -1 || ua.indexOf('Win64') > -1) {
      is_x64 = true
    }
  }

  return is_x64
}

async function cache_request(event, request, url) {
  // request = new Request(url, request)
  return await fetch(request, {
    cf: {
      // Always cache this fetch regardless of content type
      // for a max of 5 seconds before revalidating the resource
      cacheTtl: 0,
      cacheEverything: true,
      //Enterprise only feature, see Cache API for other plans
      cacheKey: url,
      // 1296000 为 15天
      cacheTtlByStatus: { '200': 1296000, 304: 1296000 },
    },
  })
}

async function cache_request_by_api(event, request, url) {
  // let request = event.request

  // const cacheUrl = new URL(url)

  // Construct the cache key from the cache URL
  // const cacheKey = new Request(cacheUrl.toString(), request)
  const cache = caches.default

  // Check whether the value is already available in the cache
  // if not, you will need to fetch it from origin, and store it in the cache
  // for future access
  let response = await cache.match(url)

  if (!response) {
    // If not in cache, get it from origin
    response = await fetch(request)

    // Must use Response constructor to inherit all of response's fields
    response = new Response(response.body, response)

    // Cache API respects Cache-Control headers. Setting s-max-age to 10
    // will limit the response to be in cache for 10 seconds max

    // Any changes made to the response here will be reflected in the cached value
    response.headers.append('Cache-Control', 's-maxage=10')

    // Store the fetched response as cacheKey
    // Use waitUntil so you can return the response without blocking on
    // writing to cache
    event.waitUntil(cache.put(url, response.clone()))
  }
  return response
}

// endregion url info

function shouldBypass(request) {
  let bypassCache = true

  // Bypass the cache for all requests to a URL that matches any of the URL path bypass patterns
  const url = new URL(request.url)
  const uri = url.pathname.replace('_', '-')

  // 通过路由判断，进行缓存
  if (request.method !== 'POST') {
    // if (uris.includes(uri) || uri.match(article_uris_re)) {
    if (uris.includes(uri)) {
      bypassCache = false
    }
  }
  return bypassCache
}

function processUrl(url) {
  const urlObj = new URL(url)
  const params = new URLSearchParams(urlObj.search)

  // 删除忽略的参数
  ignoreQueryParams.forEach((param) => params.delete(param))

  // 按字母排序剩余参数
  const sortedParams = new URLSearchParams([...params.entries()].sort())

  // 构建新的 URL
  urlObj.search = sortedParams.toString()

  return urlObj.toString()
}

function rewrite_url(req) {
  // 还要判断语言 locale
  // 还要判断系统 os
  // 还要判断设备 device
  // 还要判断浏览器类型 browserType
  // 还要判断系统环境 location
  // 组合成一个key
  // 有client_env_info_key则不再进行添加
  const cookie = req.headers.get('cookie')
  let bypass = shouldBypass(req)
  let url = req.url
  debuggerMode = url.includes('debugger=1')
  if (bypass) {
    return { url, bypass }
  }
  // if (url.indexOf('?' + client_env_info_key + '=') < 0 && url.indexOf('&' + client_env_info_key + '=') < 0 ){
  const locale = getLocale(req.headers.get('host'))
  const os = getOperatingSystemInfo(req.headers.get('user-agent'))
  // if (os == 'win') {
  //   if (is_x64(req.headers.get('user-agent'))) {
  //     os += '_64'
  //   }
  // }

  const device = isMobile(req.headers.get('user-agent')) ? 'mobile' : 'pc'
  //const browserType = getBrowser(req.headers.get('user-agent')) == 'ff' ? 'ff' : 'other_browser'
  //const location = ['ja', 'us'].includes(process.env.LOCATION) ? 's_' + process.env.LOCATION : 's_other'

  let key = locale + '.' + os + '.' + device /* + '.' + browserType + '.' + location*/
  // 年龄认证页面根据cookie缓存不同版本 ---开始
  const exist = ageProofCacheKeyUris.some((v) => {
    return url.indexOf(v) != -1
  })
  if (exist) {
    const ageProofKey = getCookie('age_proof', cookie) ? 'age_proof_true' : 'age_proof_false'
    key += '.' + ageProofKey
  }
  // 年龄认证页面根据cookie缓存不同版本 ---结束

  key = encodeURIComponent(key)
  const client_env_info = client_env_info_key + '=' + key

  url = processUrl(url)
  if (url.indexOf('?') >= 0) {
    url = url + '&' + client_env_info
  } else {
    url = url + '?' + client_env_info
  }
  // }

  if (cookie) {
    const arrCookie = cookie.split('; ')
    const cache_cookies = []
    const cacheCookies = CACHE_COOKIES

    for (let i = 0; i < arrCookie.length; i++) {
      //把AB测试相关的cookie作为缓存key的一部分,这些cookie中都以“_ab”开头
      if (arrCookie[i].indexOf('_ab') != -1) {
        const cookie_info = arrCookie[i].split('=')
        const cookie_name = cookie_info[0]
        if (cookie_name.indexOf('_ab') != -1) {
          const ab = cookie_info[1]

          bypass = false

          if (url.indexOf('?' + cookie_name + '=') < 0 && url.indexOf('&' + cookie_name + '=') < 0) {
            url = url + '&' + cookie_name + '=' + ab
          }
        }
      }

      // 缓存需要关心的cookie
      if (cacheCookies.length) {
        // See if the cookie starts with any of the logged-in user prefixes
        for (const suffix of cacheCookies) {
          // if (arrCookie[i].trim().endsWith(suffix)) {
          //   cache_cookies.push(arrCookie[i])
          // }
          if (arrCookie[i].trim().includes(suffix)) {
            cache_cookies.push(arrCookie[i])
          }
        }
      }
    }
    if (cache_cookies.length) {
      url = url + '&' + cache_cookie_key + '=' + cache_cookies.join(';')
      bypass = false
    }
  }
  return { url, bypass }
}

async function handleRequest(event) {
  const req = event.request
  try {
    const { url, bypass } = rewrite_url(req)
    if (bypass) {
      return await fetch(req)
    } else {
      const new_request = new Request(url, req)
      new_request.headers.set('cf-set-req-url', url)

      let response = await cache_request(event, new_request, url)
      response = new Response(response.body, response)
      // Set cache control headers to cache on browser for 15 days
      response.headers.set('Cache-Control', 'public, max-age=1296000, immutable')
      console.log('cahce_key:' + url)
      console.log(response.headers)
      if (debuggerMode) {
        response.headers.set('_cf_key', url)
        //response.headers.set('_cf_hash_key', url)
        //response.headers.set('X-Debug-cookie', req.headers.get('cookie'))
      }

      return response
    }
  } catch (err) {
    // Without event.waitUntil(), our fetch() to our logging service may
    // or may not complete.
    // event.waitUntil(postLog(err))
    const stack = JSON.stringify(err.stack) || err
    // Copy the response and initialize body to the stack trace
    const response = new Response('Internal Server Error', { status: 500 })
    // Shove our rewritten URL into a header to find out what it was.
    response.headers.set('_cf_err', err)
    response.headers.set('_cf_err_stack', stack)

    return response
  }
}

addEventListener('fetch', (event) => {
  event.passThroughOnException()
  return event.respondWith(handleRequest(event))
})
