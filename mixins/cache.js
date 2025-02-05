const http = require('http')
const querystring = require('querystring')
const pageCacheConfig = require('../static/config/middleware/page_cache')
const apiCacheConfig = require('../static/config/common/api_cache')

const cache_ignore_params = []

const page_cache_api_handler = (req, res) => {
  const reqUrl = req.url
  if (reqUrl.indexOf(pageCacheConfig.get_cache_uri) > -1) {
    return cache_api(res, '/get?key=' + '.' + reqUrl.split(pageCacheConfig.get_cache_uri)[1].split('&')[0])
  } else if (reqUrl.indexOf(pageCacheConfig.clear_cache_uri) > -1) {
    return cache_api(res, '/del?key=' + reqUrl.split(pageCacheConfig.clear_cache_uri)[1].split('&')[0])
  } else if (reqUrl.indexOf(pageCacheConfig.clear_all_cache_uri) > -1) {
    return cache_api(
      res,
      '/del?key=' + '.' + reqUrl.split(pageCacheConfig.clear_all_cache_uri)[1].split('&')[0]
    )
  } else if (reqUrl.indexOf(pageCacheConfig.cache_keys_uri) > -1) {
    return cache_api(res, '/keys')
  } else if (reqUrl.indexOf(pageCacheConfig.reset_cache_uri) > -1) {
    return cache_api(res, '/reset')
  } else if (reqUrl.indexOf(pageCacheConfig.clear_request_cache_uri) > -1) {
    return cache_api(
      res,
      '/del?type=1&key=' + reqUrl.split(pageCacheConfig.clear_request_cache_uri)[1].split('&')[0]
    )
  } else if (reqUrl.indexOf(pageCacheConfig.request_cache_keys_uri) > -1) {
    return cache_api(res, '/keys?type=1')
  } else if (reqUrl.indexOf(pageCacheConfig.get_request_cache_uri) > -1) {
    return cache_api(
      res,
      '/get?type=1&key=' + reqUrl.split(pageCacheConfig.get_request_cache_uri)[1].split('&')[0]
    )
  } else if (reqUrl.indexOf(pageCacheConfig.cache_details_uri) > -1) {
    return cache_api(res, '/cache_details')
  } else if (reqUrl.indexOf(pageCacheConfig.key_details_uri) > -1) {
    return cache_api(res, '/key_details')
  } else if (reqUrl.indexOf(apiCacheConfig.request_cache_keys_uri) > -1) {
    return cache_api(res, '/keys?type=1')
  } else if (reqUrl.indexOf(apiCacheConfig.request_clear_cache_uri) > -1) {
    return cache_api(
      res,
      '/del?type=1&key=' + reqUrl.split(apiCacheConfig.request_clear_cache_uri)[1].split('&')[0]
    )
  } else if (reqUrl.indexOf(apiCacheConfig.request_get_cache_uri) > -1) {
    return cache_api(
      res,
      '/get?type=1&key=' + reqUrl.split(apiCacheConfig.request_get_cache_uri)[1].split('&')[0]
    )
  } else if (reqUrl.indexOf(apiCacheConfig.request_reset_cache_uri) > -1) {
    return cache_api(res, '/reset?type=1')
  } else if (reqUrl.indexOf(apiCacheConfig.request_cache_details_uri) > -1) {
    return cache_api(res, '/cache_details?type=1')
  } else if (reqUrl.indexOf(apiCacheConfig.request_key_details_uri) > -1) {
    return cache_api(res, '/key_details?type=1')
  } else if (reqUrl.indexOf(apiCacheConfig.request_clear_expires_uri) > -1) {
    return cache_api(res, '/clearByVersion?type=1&ts=' + getCacheVersion())
  }

  return false
}

const cache_api = (res, url) => {
  cache_post(url)
    .then((html) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.setHeader('Accept-Ranges', 'none')
      res.setHeader('Content-Length', Buffer.byteLength(html))
      res.end(html, 'utf-8')
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e)
    })
  return true
}

const cache_post = (url, data = '') => {
  // eslint-disable-next-line no-console
  console.log('$$$$$ cache_post start!!----------------------------')
  if (pageCacheConfig.cache_domain) {
    url = url.includes('?')
      ? url + '&domain=' + pageCacheConfig.cache_domain
      : url + '?domain=' + pageCacheConfig.cache_domain
  }
  const hostname = process.env.ENV == 'online' ? 'page_cache' : 'page-cache'
  return new Promise(function (resolve, reject) {
    // TODO: 必须设置极短的超时时间，以防 page_cache_service 出错或超时导致页面响应极慢
    const options = {
      protocol: 'http:',
      hostname,
      port: 40010,
      path: url,
      method: 'POST',
      // timeout: 50,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    }
    const req = http.request(options, function (res) {
      let html = ''
      res.on('data', function (chunk) {
        html += chunk
      })

      res.on('end', function () {
        resolve(html)
      })
    })
    /*req.setTimeout(100, function () {
      req.destroy()
      console.log('timeout!! request destroyed')
    })*/
    req.on('error', function (e) {
      // eslint-disable-next-line no-console
      console.log('page_cache, problem with request, url: ' + url + ', error: ' + e.message + '\n' + e.stack)
      reject(e)
    })
    if (data) {
      req.write(data)
    }
    req.end()
  })
}

const clear_page_cache_by_version = (_ts) => {
  return cache_post('/setVersion?ts=' + _ts).then((html) => {
    // _post('/test?ts=' + _ts).then((html) => {
    // eslint-disable-next-line no-console
    console.log('clean--------------')
    if (html) {
      // eslint-disable-next-line no-console
      console.log(html)
    }
  })
}

const request_cache_get = async (key = '') => {
  // return axios.create().get('/get?type=1&key=' + key)
  return await cache_post('/get?type=1&key=' + key)
    .then((body) => {
      if (body && typeof body == 'string') {
        return JSON.parse(body)
      }
      return body
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('request_cache_get, problem with cache_post, error: ' + e.message + '\n' + e.stack)
    })
}

const request_cache_set = async (key = '', data) => {
  // return axios.create().get('/get?type=1&key=' + key)
  return await cache_post('/set?type=1&key=' + key, data)
    .then((body) => {
      // if (body) {
      //   return JSON.parse(body)
      // }
      return body
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('request_cache_set, problem with cache_post, error: ' + e.message + '\n' + e.stack)
    })
}

const url_key = (config, ignore_params = []) => {
  const base_url = config.baseURL || ''
  const url = config.url
  let params = url.split('?')
  const uri = params[0]
  params = params.length > 1 ? params[1] : ''
  params = querystring.parse(params)
  if (config.params && Object.keys(config.params).length > 0) {
    Object.assign(params, config.params)
  }
  // 去掉多余的params 参数
  Object.assign(ignore_params, cache_ignore_params)
  ignore_params.forEach((value) => {
    delete params[value]
  })
  const qs = querystring.stringify(params)
  const cache_key = base_url + uri + '?' + qs
  return encodeURIComponent(cache_key)
}

const determine_cache = (config) => {
  // 服务端，并且是get请求，并且在缓存白名单里或者设置了要缓存
  // 应该也去掉 json 等静态文件请求
  const production = process.env.NODE_ENV === 'production'
  const white_cache_url = apiCacheConfig.api_cache_list.includes(config.url.split('?')[0]) || config.cache
  return (
    process.server &&
    production &&
    config.method === 'get' &&
    white_cache_url &&
    !config.url.endsWith('.json')
  )
}

// 获取 ts 文件第一行（ts文件在发布时会更新）,获取发布后的版本号
const getTsFirstLine = () => {
  const fs = require('fs')
  const dir = './publish_ts/ts.txt'
  const ts = fs.readFileSync(dir, 'utf8').split('\n')
  return ts[0]
}

//获取全局保存的版本信息
const getCacheVersion = () => {
  let _ts = ''
  if (!global.cacheVersion) {
    _ts = getTsFirstLine() //获取版本号
    global.cacheVersion = _ts
  } else {
    _ts = global.cacheVersion
  }
  return _ts
}

const get_cache_config = () => {
  return pageCacheConfig
}

const axios_request_on_full_filled = async (config) => {
  if (determine_cache(config)) {
    const cache_key = url_key(config)
    const data = await request_cache_get(cache_key)
    if (data) {
      data.__fromCache = true
      // eslint-disable-next-line no-console
      console.log('$$$$$ api cache hit!!!' + config.url + '------------------------')
      config.data = data
      config.adapter = () => {
        // eslint-disable-next-line no-console
        console.log('$$$$$ axios_request_on_full_filled 【config.adapter】------------------------')
        return Promise.resolve({
          data,
          status: config.status,
          statusText: config.statusText,
          headers: config.headers,
          config,
          request: config,
        })
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('$$$$$ api cache miss!!!' + config.url + '-----------------------')
    }
  }

  // do something before request is sent
  return config
}

const axios_response_on_full_filled = (response) => {
  const res = response.data

  if (res.cscode == 200 || res.result || res.code == 200 || res.cscode == 0) {
    // 加入缓存
    // eslint-disable-next-line max-len
    if (
      determine_cache(response.config) &&
      !(Object.prototype.hasOwnProperty.call(response.data, '__fromCache') && response.data.__fromCache)
    ) {
      const cache_key = url_key(response.config)
      // eslint-disable-next-line no-console
      console.log('$$$$$ api cache response set cache!!!' + response.config.url + '-----------------------')
      request_cache_set(cache_key, JSON.stringify(response.data))
    } else {
      // eslint-disable-next-line no-console
      console.log(
        '$$$$$ api cache response not need set cache~~~' + response.config.url + '-----------------------'
      )
    }
  }

  return res
}

module.exports = {
  page_cache_api_handler,
  cache_api,
  cache_post,
  clear_page_cache_by_version,
  request_cache_get,
  request_cache_set,
  url_key,
  determine_cache,
  getCacheVersion,
  get_cache_config,
  axios_request_on_full_filled,
  axios_response_on_full_filled,
}
