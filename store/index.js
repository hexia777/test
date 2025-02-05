import servers from '@/static/config/common/server.config'
import { allLangs, extendedLangs, specialExtendedLangs } from 'static/config/common/common'
const Base64 = require('js-base64').Base64

export const state = () => ({
  token: '',
  guestTokenV2: '', //token会有两个这里记录绑定后的token
  userlevel: '',
  user_info: {
    limitSize: '28MB',
    limitResolution: '5MB',
    widthAndHeightLenLimit: '4000px',
  },
  logged: false,
  credits: '',
  freeProcessWebNum: 0,
  compressCredits: '',
  selectLimit: 1,
  country: '',
  isDevelopedCountry: false,

  mobile: false,
  isAndroid: false,
  client: 'win',
  is_x64: false,
  browser: '',
  innerWidth: 1200,

  locales: allLangs,
  locale: 'en',
  ll: '',
  localeLink: '',
  specialLocaleLink: '',
  host: '',
  protocol: '',
  fullurl: '',
  $servers: servers,
  currency: {
    en: ['USD', '$'],
    de: ['EUR', '€'],
    ja: ['USD', '$'],
    fr: ['EUR', '€'],
  },

  website: 'workspace.vanceai.com',
  my_upload_dialog_work_type: '',
  hideHeader: true,
  uploadList: '[]',
  showFullUpload: false,
  guestTrial: {
    upload: 0,
    process: 0,
    preview: 0,
    download_popup: 0,
  },
  registerTrial: {
    upload: 0,
    process: 0,
    preview: 0,
    download_img: 0,
  },

  pricingPage: '',
  clientABTestModule: '',
  commonABTestModule: '',
  mainWebsite: 'https://vanceai.com',
})
export const mutations = {
  SET_VUX_DATA(state, items) {
    //存储数据
    for (const i in items) {
      state[i] = items[i]
    }
  },
  SET_WINDOW_WIDTH(state, val) {
    state.innerWidth = val
  },
  SET_FULL_UPLOAD(state, flag) {
    state.showFullUpload = flag
  },
  SET_DEVICE(state, bool) {
    state.mobile = bool
  },
  SET_LANG(state, locale) {
    if (state.locales.indexOf(locale) !== -1) {
      state.locale = locale
    }
    if (state.locales.includes(locale)) {
      state.ll = locale == 'en' ? '' : '/' + locale
      state.localeLink = locale == 'en' || extendedLangs.includes(locale) ? '' : '/' + locale
      state.specialLocaleLink = locale == 'en' || specialExtendedLangs.includes(locale) ? '' : '/' + locale
    } else {
      state.ll = ''
      state.localeLink = ''
      state.specialLocaleLink = ''
    }
  },
  SET_CLIENT(state, info) {
    state.client = info
  },
  SET_OS_INFO(state, info) {
    state.is_x64 = info
  },
  SET_HOST(state, info) {
    state.host = info.host
    state.protocol = info.protocol
    state.fullurl = info.protocol + '//' + info.host
  },
  SET_SERVERS(state, servers) {
    state.$servers = servers
  },
  SET_TOKEN(state, token) {
    state.token = token
  },
  SET_TOKENV2(state, guestTokenV2) {
    state.guestTokenV2 = guestTokenV2
  },
  SET_USER_INFO_CREDITS(state, credits) {
    state.credits = credits
  },
  SET_FREE_PROCESS_NUM(state, freeProcessWebNum) {
    state.freeProcessWebNum = freeProcessWebNum
  },
  SET_COUNTRY(state, country) {
    state.country = country
  },
  SET_IS_DEVELOPED_COUNTRY(state, isDevelopedCountry) {
    state.isDevelopedCountry = isDevelopedCountry
  },
  SET_USER_INFO_COMPRESS_CREDITS(state, compressCredits) {
    state.compressCredits = compressCredits
  },
  SET_USER_INFO_LEVEL(state, userlevel) {
    state.userlevel = userlevel
  },
  SET_USER_INFO(state, user_info) {
    if (user_info && typeof user_info !== 'object') {
      user_info = JSON.parse(user_info)
      user_info.username = decodeURI(user_info.username ? user_info.username : '')
    }
    state.user_info = { ...state.user_info, ...user_info }
  },
  SET_USER_LOGINED(state, flag) {
    state.logged = flag
  },
  SET_SELECT_LIMIT(state, limit) {
    state.selectLimit = limit
  },
  SET_BROWSER_TYPE(state, info) {
    state.browser = info
  },
  SET_WORK_TYPE(state, workType) {
    state.my_upload_dialog_work_type = workType
    localStorage.setItem('type', workType)
  },
  SET_UPLOAD_LIST(state, data) {
    state.uploadList = data
  },
  SET_PRICING_PAGE(state, bool) {
    state.pricingPage = bool
  },
  SET_WEBSITE(state, bool) {
    state.website = bool
  },
  SET_GUEST_TRIAL(state, bool) {
    if (bool !== 'undefined') {
      const json = JSON.parse(bool)
      state.guestTrial = json
    }
  },
  SET_REGISTER_TRIAL(state, bool) {
    if (bool !== 'undefined') {
      const json = JSON.parse(bool)
      state.registerTrial = json
    }
  },
  SET_IS_ANDROID(state, bool) {
    state.isAndroid = bool
  },
  SET_PRICING_MODULE(state, val) {
    state.pricingModule = val
  },
  SET_COMMON_AB_TEST_MODULE(state, val) {
    state.commonABTestModule = val
  },
  SET_CLIENT_AB_TEST_MODULE(state, val) {
    state.clientABTestModule = val
  },
}

export const actions = {
  nuxtServerInit(store, ctx) {
    const cookies = ctx.app.$cookies
    store.commit('SET_TOKEN', unescape(cookies.get('token') || ''))
    store.commit('SET_USER_LOGINED', !!cookies.get('token'))
    if (unescape(cookies.get('userType')) == 'guest' || unescape(cookies.get('userType')) == 'undefined') {
      store.commit('SET_GUEST_TRIAL', unescape(cookies.get('guestTrial')))
    }
    if (unescape(cookies.get('userType')) == 'register') {
      store.commit('SET_REGISTER_TRIAL', unescape(cookies.get('registerTrial')))
    }
    // 45032c4b-e745-4ee5-994c-84f0858707d2 store_server_init_set_website begin
    // -------------------------- elk数据追踪 start
    const expiresDate = new Date(new Date().getTime() + 3650 * 24 * 60 * 60 * 1000)
    if (ctx.route.query.client_e) {
      cookies.set('elk_user_email', Base64.decode(ctx.route.query.client_e), {
        path: '/',
        expires: expiresDate,
      })
    }

    if (ctx.route.query.client_m) {
      cookies.set('elk_mac', Base64.decode(ctx.route.query.client_m), {
        path: '/',
        expires: expiresDate,
      })
    }
    // -------------------------- elk数据追踪 end
    store.commit('SET_USER_INFO', unescape(cookies.get('user_info') || ''))
  },
}
export const getters = {
  getGuestTrial: (state) => {
    return state.guestTrial
  },
  getRegisterTrial: (state) => {
    return state.registerTrial
  },
}
