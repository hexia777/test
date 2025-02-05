import axios from 'axios'
import { getCookie, guestTokenInvalidedNotify } from '@/static/script/utils'

const instance = axios.create()
instance.interceptors.request.use(
  (config) => {
    let guestTokenV2 = null
    if (window.__MICRO_APP_ENVIRONMENT__) {
      guestTokenV2 = getCookie('guestTokenV2')
    }
    // TODO 判断是否是自己的域名 在自己域名域名下操作添加
    if (config.method === 'get') {
      if (config.params) {
        if (config.params.custom_token) {
          config.params['guest_token_v2'] = guestTokenV2 || config.params.guest_token_v2
        } else if (!config.params.guest_token_v2) {
          config.params['guest_token_v2'] = guestTokenV2 || getCookie('guestTokenV2')
        }
      } else {
        config.params = { guest_token_v2: guestTokenV2 || getCookie('guestTokenV2') }
      }
      if (!config.params.web) {
        config.params.web = 'vanceai'
      }

      // 兼容v3
      if(config.url.includes('/v3/')){
        delete config.params.guest_token_v2
        config.params.user_info =  guestTokenV2 || getCookie('guestTokenV2')
        delete config.params.web
        config.params.from = 'web'
      }
    } else if (config.method === 'post') {
      if (config.data) {
        console.log(process.browser)
        if (process.browser && config.data instanceof FormData && !config.data.get('guest_token_v2')) {
          config.data.append('guest_token_v2', guestTokenV2 || getCookie('guestTokenV2'))
        } else if (!config.data.guest_token_v2) {
          config.data['guest_token_v2'] = guestTokenV2 || getCookie('guestTokenV2')
        }
        if (config.data.custom_token) {
          config.data['guest_token_v2'] = guestTokenV2 || config.data.guest_token_v2
        }
      } else {
        config.data = { guest_token_v2: guestTokenV2 || getCookie('guestTokenV2') }
      }
      if (process.browser && config.data instanceof FormData && !config.data.get('web')) {
        config.data.append('web', 'vanceai')
      } else if (!config.data.web) {
        config.data.web = 'vanceai'
      }

      // 兼容v3
      if(config.url.includes('/v3/')){
        delete config.data.guest_token_v2
        config.data.user_info =  guestTokenV2 || getCookie('guestTokenV2')
        delete config.data.web
        config.data.from = 'web'
      }
    }
    // do something before request is sent
    return config
  },
  (error) => {
    // do something with request error
    return Promise.reject(error)
  }
)
let count = 1
instance.interceptors.response.use(
  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  async (response) => {
    const res = response.data
    if (Number(res.cscode) === 30001 || Number(res.code) === 30001) {
      guestTokenInvalidedNotify()
      return response
    } else {
      return response
    }
  },
  (error) => {
    // eslint-disable-next-line no-console
    return Promise.reject(error)
  }
)

export default instance
