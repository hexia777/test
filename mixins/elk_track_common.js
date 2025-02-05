import { elk, expire } from '@/static/config/middleware/ab_test'
import { getNowDate } from '@/static/script/utils'

export default {
  methods: {
    getExpandParams(param) {
      const params = {
        ...param,
        ...this.getUserABTry(),
        login_status: this.$getCookie('token') ? true : false,
      }
      if (process.browser) {
        if (window && window.rawWindow) {
          params.url = window.rawWindow.location.href
        }
      }
      if (this.$getCookie('first_request_pricing_page_flag')) {
        params.ext_params_str_param1 = this.$getCookie('cloud_use_feature') ? '1' : '0'
        params.ext_params_str_param_use_feature = this.$getCookie('cloud_use_feature') ? '1' : '0'
      }
      return params
    },
    getUserABTry() {
      const result = []

      let commonABTestValue = this.$store.state.commonABTestModule
      if (!commonABTestValue) {
        commonABTestValue = this.$getCookie('common_ab_test')
      }
      let clientABTestValue = this.$store.state.clientABTestValue
      if (!clientABTestValue) {
        clientABTestValue = this.$getCookie('client_module')
      }
      const list = [
        {
          key: 'common_ab_test',
          version: elk.version,
          expire_day: expire,
          value: commonABTestValue || '',
          enable: elk.enable,
          create_time: getNowDate(),
          invalid_time: '2022-07-15T22:00:00',
        },
        {
          key: 'client_module',
          version: elk.version,
          expire_day: expire,
          value: clientABTestValue || '',
          enable: elk.enable,
          create_time: getNowDate(),
          invalid_time: '2022-07-15T22:00:00',
        },
      ]
      list.forEach((v) => {
        if (v.enable) {
          result.push({
            key: v.key,
            version: v.version,
            value: v.value,
            expire_day: v.expire_day,
          })
        }
      })

      return result.length
        ? {
            ab_try_list: result,
          }
        : {}
    },
    trackInit() {
      this.$nextTick(() => {
        this.$trace.init()
        this.$trace.traceDownload()
        this.$trace.trackBuy()
      })
    },
  },
}
