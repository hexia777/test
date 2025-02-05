import { developedCountry } from '@/static/json/country'
export default {
  mounted() {
    // 等待 microApp 环境准备好
    if (window && window.__MICRO_APP_ENVIRONMENT__) {
      this.initMicroApp()
    } else {
      document.addEventListener('microAppReady', this.initMicroApp)
    }
  },
  beforeDestroy() {
    if (process.browser && window.__MICRO_APP_ENVIRONMENT__) {
      window.microApp.removeGlobalDataListener(this.handleDataFromMainApp)
    }
  },
  methods: {
    initMicroApp() {
      //以属性的方式传过来的数据
      const { token, guestTokenV2, userType, leftCredits, freeProcessWebNum } = window.microApp.getData()
      this.$store.commit('SET_TOKEN', token)
      this.$store.commit('SET_TOKENV2', guestTokenV2)
      this.$store.commit('SET_USER_INFO_LEVEL', userType)
      this.$store.commit('SET_USER_INFO_CREDITS', leftCredits)
      this.$store.commit('SET_FREE_PROCESS_NUM', freeProcessWebNum)

      // 监听全局数据变化
      window.microApp.addGlobalDataListener(this.handleDataFromMainApp)
    },
    //处理主应用传过来的数据
    handleDataFromMainApp(data) {
      const validEvent = this.getMainAppEvent(data)
      console.log('子应用接收到的主应用的有效数据:', validEvent)

      //主应用登录后，子应用更新token、guestTokenV2、userType和leftCredits
      if (validEvent.mainApp_ON_LOGIN_SUCCESS) {
        this.$store.commit('SET_TOKEN', this.$getCookie('token'))
        this.$store.commit('SET_TOKENV2', this.$getCookie('guestTokenV2'))
        this.$store.commit('SET_USER_INFO_LEVEL', this.$getCookie('userType'))
        this.$store.commit('SET_USER_INFO_CREDITS', this.$getCookie('leftCredits'))
        this.$store.commit('SET_FREE_PROCESS_NUM', this.$getCookie('freeProcessWebNum'))
        this.$store.commit('SET_COUNTRY', this.$getCookie('country'))
        this.$store.commit('SET_IS_DEVELOPED_COUNTRY', developedCountry.includes(this.$getCookie('country')))
      }

      //子应用更新点数
      if (validEvent.mainApp_UPDATE_CREDITS) {
        this.$store.commit('SET_USER_INFO_CREDITS', this.$getCookie('leftCredits'))
        this.$store.commit('SET_FREE_PROCESS_NUM', this.$getCookie('freeProcessWebNum'))
      }
    },
    getMainAppEvent(obj) {
      return Object.keys(obj)
        .filter((key) => key.startsWith('mainApp_') && obj[key] === true)
        .reduce((acc, key) => {
          acc[key] = obj[key]
          return acc
        }, {})
    },
  },
}
