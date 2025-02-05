const uris = [
  '/workspace/',
  '/workspace/enhance/',
  '/workspace/photo-restorer/',
  '/workspace/remove-background/',
  '/workspace/magic-upscale/',
  '/workspace/image-cartoonizer/',
  '/workspace/photo-to-sketch/',
  '/workspace/image-editor/',
  '/workspace/colorize-photo/',
]

const CACHE_COOKIES = []
const client_env_info_key = 'cf_client_env_info'
const cache_cookie_key = 'cf_cache_cookie'

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

function removeQueryParams(url) {
  const ignoreQueryParams = ['source', 'medium', 'location', 'feature', 'work']
  const urlObj = new URL(url)
  ignoreQueryParams.forEach((param) => {
    urlObj.searchParams.delete(param)
  })
  return urlObj.toString()
}

async function cache_request(event, request, url) {
  // request = new Request(url, request)
  return await fetch(request, {
    cf: {
      // Always cache this fetch regardless of content type
      // for a max of 5 seconds before revalidating the resource
      cacheTtl: 3600,
      cacheEverything: true,
      //Enterprise only feature, see Cache API for other plans
      cacheKey: url,
      // 1296000 为 15天
      cacheTtlByStatus: { '200-299': 1296000, '301-302': 3600, 304: 1296000, 404: 1, '500-599': 0 },
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
    if (uris.includes(uri)) {
      bypassCache = false
    }
  }
  return bypassCache
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
  if (bypass) {
    return { url, bypass }
  }
  // if (url.indexOf('?' + client_env_info_key + '=') < 0 && url.indexOf('&' + client_env_info_key + '=') < 0 ){
  const locale = getLocale(req.headers.get('host'))
  const os = getOperatingSystemInfo(req.headers.get('user-agent'))

  const device = isMobile(req.headers.get('user-agent')) ? 'mobile' : 'pc'
  let key = locale + '.' + os + '.' + device

  key = encodeURIComponent(key)
  const client_env_info = client_env_info_key + '=' + key

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
      if (arrCookie[i].indexOf('ab=') != -1) {
        const cookie_info = arrCookie[i].split('=')
        const cookie_name = cookie_info[0]
        const ab = cookie_info[1]

        bypass = false

        if (url.indexOf('?' + cookie_name + '=') < 0 && url.indexOf('&' + cookie_name + '=') < 0) {
          url = url + '&' + cookie_name + '=' + ab
        }
      }

      // 缓存需要关心的cookie
      if (cacheCookies.length) {
        // See if the cookie starts with any of the logged-in user prefixes
        for (const suffix of cacheCookies) {
          if (arrCookie[i].trim().endsWith(suffix)) {
            cache_cookies.push(arrCookie[i])
          }
        }
      }
    }
    if (cache_cookies.length) {
      url = url + '&' + cache_cookie_key + '=' + cache_cookies.join(',')
      bypass = false
    }
  }
  return { url, bypass }
}

async function handleRequest(event) {
  const req = event.request
  try {
    const { url, bypass } = rewrite_url(req)
    //req.headers.set('cf-set-req-url', url)
    if (bypass) {
      return await fetch(req)
    } else {
      const newUrl = removeQueryParams(req.url)
      const new_request = new Request(newUrl, req)
      new_request.headers.set('cf-set-req-url', newUrl)

      let response = await cache_request(event, new_request, newUrl)
      response = new Response(response.body, response)
      //删除 Vary 头部
      response.headers.delete('Vary')
      // Set cache control headers to cache on browser for 25 minutes
      response.headers.set('Cache-Control', 'public, max-age=1296000, immutable')
      response.headers.set('X-Debug-ck', url)
      //response.headers.set('X-Debug-cookie', req.headers.get('cookie'))
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
    response.headers.set('X-Debug-stack', stack)
    response.headers.set('X-Debug-err', err)
    return response
  }
}

addEventListener('fetch', (event) => {
  event.passThroughOnException()
  return event.respondWith(handleRequest(event))
})
