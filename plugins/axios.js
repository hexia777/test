// eslint-disable-next-line no-unused-vars
import { request_cache_get, request_cache_set, url_key, determine_cache } from '@/mixins/cache'
import { getCookie } from '@/static/script/utils'

export default function ({ $axios, redirect, error, app }) {
  console.log('enter /plugins/axios:        ', new Date().getTime())
  // 利用axios的cancelToken来取消请求
  let cancel
  // request interceptor
  $axios.interceptors.request.use(
    async (config) => {
      // TODO 判断是否是自己的域名 在自己域名域名下操作添加
      // 直接先请求缓存
      if (determine_cache(config)) {
        config.cancelToken = $axios.CancelToken(function (c) {
          cancel = c
        })
        const cache_key = url_key(config)
        const data = await request_cache_get(cache_key)
        if (data) {
          cancel(data)
        }
      }
      if (config.method === 'get') {
        if (config.params) {
          if (!config.params.guest_token_v2) {
            config.params['guest_token_v2'] = getCookie('guestTokenV2')
          }
        } else {
          config.params = { guest_token_v2: getCookie('guestTokenV2') }
        }
        if (!config.params.web) {
          config.params.web = 'vanceai'
        }
      } else if (config.method === 'post') {
        if (config.data) {
          if (process.browser && config.data instanceof FormData && !config.data.get('guest_token_v2')) {
            config.data.append('guest_token_v2', getCookie('guestTokenV2'))
          } else if (!config.data.guest_token_v2) {
            config.data['guest_token_v2'] = getCookie('guestTokenV2')
          }
        } else {
          config.data = { guest_token_v2: getCookie('guestTokenV2') }
        }
        if (process.browser && config.data instanceof FormData && !config.data.get('web')) {
          config.data.append('web', 'vanceai')
        } else if (!config.data.web) {
          config.data.web = 'vanceai'
        }
        // if (!(config.data instanceof FormData) &&!config.data.client_type) {
        //   config.data.client_type = 'web' //标识客户端类型
        // }
      }
      // do something before request is sent
      return config
    },
    (error) => {
      // console.log('???????????????????????????????')
      // console.log(error)
      // do something with request error
      return Promise.reject(error)
    }
  )
  $axios.onRequest(() => {
    // eslint-disable-next-line no-console
    // console.log('Making request to ' + config.url)
  })

  // response interceptor
  $axios.interceptors.response.use(
    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    (response) => {
      cancel = null
      // 判断是否是缓存响应回来的，
      // 如果是缓存响应的，如果是200状态码 则直接返回
      // 如果是404 则再请求接口
      const res = response.data
      if (
        response.request &&
        response.request.responseURL &&
        response.request.responseURL.indexOf('/api/v2/download') !== -1
      ) {
        return response
      }
      if (res.cscode == 200 || res.result || res.code == 200) {
        // 加入缓存
        if (determine_cache(response.config)) {
          const cache_key = url_key(response.config)
          request_cache_set(cache_key, JSON.stringify(response.data))
        }
        return res
      } else {
        // eslint-disable-next-line no-console
        // console.log('response_data: ' + JSON.stringify(response))
        // redirect('/404')
        // if the custom code is not 200, it is judged as an error.
      }
      // return Promise.reject(new Error(res.msg || 'Error'))
      return res
    },
    (error) => {
      // eslint-disable-next-line no-console
      // 请求拦截器中的source.cancel会将内容发送到error中
      // 通过axios.isCancel(error)来判断是否返回有数据 有的话直接返回给用户
      cancel = null
      if ($axios.isCancel(error)) {
        return Promise.resolve(error.message.data)
      }
      return Promise.reject(error)
    }
  )

  $axios.onError((err) => {
    const code = parseInt(err.response && err.response.status)
    if (code === 400) {
      return error({
        message: 'This page could not be found.',
        statusCode: 404,
      })
    } else if (code === 500) {
      if (process.browser) {
        // eslint-disable-next-line no-console
      } else {
        return error({
          message: 'Post Not found.',
          statusCode: 500,
        })
      }
    }
  })
}
