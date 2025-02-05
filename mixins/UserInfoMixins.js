import userLevel from '@/static/json/user_level'
import { getCredits } from '@/static/script/utils'
export default {
  data() {
    return {
      guest_token_v2: this.$getCookie('guestTokenV2'),
      userType: this.$getCookie('userType') || userLevel.guest,
      email: this.$getCookie('email'),
      freeProcessWebNum: this.$getCookie('freeProcessWebNum'),
    }
  },
  computed: {
    logged() {
      return this.$store.state.token
    },
    isPaied() {
      return this.$store.state.userlevel === userLevel.paying
    },
    userInfo() {
      return {
        leftCredits: this.credits,
        compressCredits: this.compressCredits,
        level: this.userType,
        limitSize: this.limitSize(userLevel.limits[this.userType] || userLevel.guest),
        limitResolution: this.limitResolution(userLevel.limits[this.userType] || userLevel.guest),
        widthAndHeightLenLimit: userLevel.limits[this.userType].widthAndHeightLenLimit,
        pid: this.subscribeId,
      }
    },
    uploadLimit() {
      return userLevel.limits[this.userType]
    },
    selectLimit() {
      return userLevel.limits[this.userType].batch
    },
    lang() {
      return this.$store.state.locale == 'en' ? '' : '/' + this.$store.state.locale
    },
    hideOnlineService() {
      if (typeof localStorage !== 'undefined') {
        const country = localStorage.getItem('country')
        const excludeCountrys = ['IN', 'ID', 'RU', 'PH']
        const isHideOnlineCountry = excludeCountrys.includes(country)
        const notPaying = this.$store.state.userlevel !== 'paying'
        const { hideOnlineService, hideonlineservice } = this.$route.query
        const hideByQuery = hideOnlineService === 'true' || hideonlineservice === 'true'
        if (this.isMobile) {
          return false
        }
        return hideByQuery || (isHideOnlineCountry && notPaying)
      }
      return false
    },
    isMobile() {
      return this.$store.state.isMobile || this.$store.state.innerWidth <= 1024
    },
    hideOnlineServiceLink() {
      return this.$store.state.mainWebsite + this.$store.state.ll + '/terminate-service-country/'
    },
  },
  watch: {
    userInfo: {
      handler(val) {
        console.log(val)
        if (val) {
          this.$setCookie('user_info', JSON.stringify(val), 1)
          this.$store.commit('SET_USER_INFO', val)
        }
      },
      deep: true,
    },
    userType(val) {
      this.$store.commit('SET_USER_INFO_LEVEL', val)
    },
    uploadLimit(val) {
      this.$store.commit('SET_UPLOAD_LIMIT', val)
    },
    logged(val) {
      this.guest_token_v2 = this.$getCookie('guestTokenV2')
      this.userType = this.$getCookie('userType') || userLevel.guest
      this.email = this.$getCookie('email')
      this.freeProcessWebNum = this.$getCookie('freeProcessWebNum')
      this.selectLimit = userLevel.limits[this.userType].batch
      const user_info = {
        limitSize: this.limitSize(userLevel.limits[this.userType] || userLevel.guest),
        limitResolution: this.limitResolution(userLevel.limits[this.userType] || userLevel.guest),
        widthAndHeightLenLimit: userLevel.limits[this.userType].widthAndHeightLenLimit,
      }
      this.$store.commit('SET_USER_INFO', user_info)
      this.$store.commit('SET_SELECT_LIMIT', this.selectLimit)
    },
    '$store.state.freeProcessWebNum'(newVal) {
      this.freeProcessWebNum = this.$getCookie('freeProcessWebNum')
    },
  },
  methods: {
    limitSize(limit) {
      return parseInt(limit.filesize / userLevel.mb) + 'MB'
    },
    limitResolution(limit) {
      return limit.resolution.megapixels / 1000000 + ' ' + this.$t('common.upload_mp')
    },
    getPoint(callback = () => {}, loading = false) {
      getCredits()
      callback()
    },
    checkHideOnlineService() {
      if (this.hideOnlineService) {
        this.toTerminate()
        return true
      }
      return false
    },
    toTerminate() {
      window.location.href = this.hideOnlineServiceLink
    },
  },
}
