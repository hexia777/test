import { isNull } from '@/static/script/utils'

export default {
  data() {
    return {
      workspaceVisible: false,
    }
  },
  computed: {
    dropBoxRedirectUrl() {
      if (process.browser) {
        return window.location.host.indexOf(':') !== -1
          ? `http://localhost:3000${this.$store.state.ll}/?redirect_source=dropbox`
          : window.location.host.indexOf('test') !== -1
          ? `https://test.vanceai.com${this.$store.state.ll}/?redirect_source=dropbox`
          : `https://vanceai.com${this.$store.state.ll}/?redirect_source=dropbox`
      } else {
        return process.env.ENV === 'online'
          ? `https://vanceai.com${this.$store.state.ll}/?redirect_source=dropbox`
          : process.env.ENV === 'test'
          ? `https://test.vanceai.com${this.$store.state.ll}/?redirect_source=dropbox`
          : `http://localhost:3000${this.$store.state.ll}/?redirect_source=dropbox`
      }
    },
  },
  mounted() {
    this.checkDropBoxCallBack()
  },
  methods: {
    checkDropBoxCallBack() {
      const hash = this.$route.hash.replace('#', '')
      if (hash) {
        const [key, value] = hash.split('&')[0].split('=')
        if (key === 'access_token') {
          this.workspaceVisible = true
        }
      }
    },
    checkDropBoxAccessToken() {
      const hash = this.$route.hash.replace('#', '')
      if (hash) {
        const [key, value] = hash.split('&')[0].split('=')
        if (key === 'access_token') {
          //todo
          let transIds = localStorage.getItem('transIds')
          if (!isNull(transIds)) {
            try {
              transIds = JSON.parse(transIds)
              if (!isNull(transIds)) {
                const filter = this.processeds.filter((item) => item.transId === transIds[0])
                if (filter && filter.length) {
                  this.onApplyProcessedImage(filter[0])
                }
              }
            } catch (e) {
              console.error(e)
            }
          }
        }
      }
    },
  },
}
