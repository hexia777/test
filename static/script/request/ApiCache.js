import axios from 'axios'
import CacheConfig from '@/static/config/common/api_cache'
import { axios_request_on_full_filled, axios_response_on_full_filled } from '../../../mixins/cache'

const CheckIsChinese = (val) => {
  const reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g')
  return reg.test(val)
}

const _buildUrl = (url, data = {}) => {
  for (const i in data) {
    if (url.indexOf('?') < 0) {
      url += '?'
    } else {
      url += '&'
    }
    if (
      data[i] &&
      isNaN(data[i]) &&
      (CheckIsChinese(data[i]) || data[i].includes('－') || data[i].includes('‐'))
    ) {
      // ‐为中文或者日文的‐
      // use encodeURIComponent to avoid TypeError: Cannot read property 'url' of undefined
      url += i + '=' + encodeURIComponent(data[i])
    } else {
      url += i + '=' + data[i]
    }
  }
  return url
}

export const doApiCacheRequest = (reqUrl, params, host = null) => {
  return new Promise((resolve, recject) => {
    host = host || CacheConfig.api_cache_host
    const req_url = _buildUrl(host + reqUrl, params)
    const req_interceptor_id = axios.interceptors.request.use(axios_request_on_full_filled, (error) => {
      return Promise.reject(error)
    })
    const resp_interceptor_id = axios.interceptors.response.use(axios_response_on_full_filled, (error) => {
      return Promise.reject(error)
    })
    axios
      .get(req_url)
      .then((response) => {
        axios.interceptors.request.eject(req_interceptor_id)
        axios.interceptors.response.eject(resp_interceptor_id)
        if (response.cscode == 200 || response.cscode == 0) {
          resolve(response)
        } else {
          recject('$$$$ doApiCacheRequest 【then】【recject】 【error】')
        }
      })
      .catch((error) => {
        axios.interceptors.request.eject(req_interceptor_id)
        axios.interceptors.response.eject(resp_interceptor_id)
        // eslint-disable-next-line no-console
        console.log('doApiCacheRequest 【catch】【recject】 【error】', error)
        recject(error)
      })
    axios.interceptors.request.eject(req_interceptor_id)
    axios.interceptors.response.eject(resp_interceptor_id)
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.log('doApiCacheRequest 【error】', err)
  })
}
