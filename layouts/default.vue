<template>
  <div
    class="wrapper default-layout micro-default-layout"
    :class="{ 'pc-wrap': !$store.state.mobile, 'm-wrap': $store.state.mobile }"
    :data-warden-g-parm="$base64Encode(getExpandParams({}))"
  >
    <div hidden :data-vars-ab-test="getAbTest()"></div>
    <div class="wrapper-box">
      <nuxt
        class="section"
        data-uuid="7a467a84-2068-4328-9880-9f07c7563f1c"
        :style="{
          minHeight: footetHeight + 'px',
        }"
        :class="{ 'non-space': hideHeader }"
      />
    </div>
  </div>
</template>

<script>
  import head from '@/mixins/head'
  import UserInfoMixins from '@/mixins/UserInfoMixins'
  import MicroAppMixins from '@/mixins/MicroAppMixins'
  import {
    getBrowser,
    getOperatingSystemInfo,
    is_x64,
    isMobile,
    getMainAppEvent,
  } from '@/static/script/utils'
  import CommonElk from '@/mixins/elk_track_common'
  import enLocale from 'element-ui/lib/locale/lang/en'
  import deLocale from 'element-ui/lib/locale/lang/de'
  import jaLocale from 'element-ui/lib/locale/lang/ja'
  import frLocale from 'element-ui/lib/locale/lang/fr'
  import esLocale from 'element-ui/lib/locale/lang/es'
  import ptLocale from 'element-ui/lib/locale/lang/pt'
  import itLocale from 'element-ui/lib/locale/lang/it'
  import ruLocale from 'element-ui/lib/locale/lang/ru-RU'
  import trLocale from 'element-ui/lib/locale/lang/tr-TR'
  import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
  import zhtwLocale from 'element-ui/lib/locale/lang/zh-TW'
  import idLocale from 'element-ui/lib/locale/lang/id'
  import locale from 'element-ui/lib/locale'

  export default {
    mixins: [head, CommonElk, UserInfoMixins, MicroAppMixins],
    data() {
      if (process.browser) {
        this.$store.commit('SET_PRICING_PAGE', this.$getCookie('pricing_module'))
        this.$store.commit('SET_COMMON_AB_TEST_MODULE', this.$getCookie('common_ab_test'))
        this.$store.commit('SET_CLIENT_AB_TEST_MODULE', this.$getCookie('client_module'))
      } else {
        this.$store.commit('SET_PRICING_PAGE', this.$route.query.pricing_module)
        this.$store.commit('SET_COMMON_AB_TEST_MODULE', this.$route.query.common_ab_test)
        this.$store.commit('SET_CLIENT_AB_TEST_MODULE', this.$route.query.client_module)
      }

      let routeName = ''
      const lang = this.$route.params.lang
      if (lang && this.$store.state.locales.includes(lang)) {
        routeName = this.$route.name == 'lang' ? 'index' : this.$route.name.replace('lang-', '')
      } else {
        routeName = this.$route.name
      }
      return {
        routeName,
        footetHeight: 600,
        hideHeader: [
          'workspace',
          'workspace-enhance',
          'workspace-remove_background',
          'workspace-image_cartoonizer',
          'workspace-photo_restorer',
        ].includes(routeName),
        scrollTop: 0,
        localeMap: {
          en: enLocale,
          de: deLocale,
          ja: jaLocale,
          fr: frLocale,
          es: esLocale,
          pt: ptLocale,
          it: itLocale,
          ru: ruLocale,
          tr: trLocale,
          zh: zhLocale,
          'zh-tw': zhtwLocale,
          id: idLocale,
        },
      }
    },
    computed: {
      innerWidth() {
        return this.$store.state.innerWidth < 768
      },
    },
    mounted() {
      const ua = navigator.userAgent.toLowerCase()
      this.$store.commit('SET_IS_ANDROID', ua.indexOf('android') > -1 || ua.indexOf('linux') > -1)
      if (
        process.browser &&
        window.location.host.indexOf('test-') !== -1 &&
        this.$route.query &&
        this.$route.query.doyouwant === 'redpill'
      ) {
        const fragment = document.createDocumentFragment()
        const style = document.createElement('style')
        style.setAttribute('type', 'text/css')
        style.innerHTML = '*{font-size:16px!important;}'
        fragment.appendChild(style)
        document.head.appendChild(fragment)
      }

      this.$nextTick(() => {
        //设置elment-ui的语言
        locale.use(this.localeMap[this.$store.state.locale] || enLocale)
      })

      window.addEventListener('resize', this.watchWindowResize)
      window.addEventListener('scroll', this.watchWindowScrollTop)

      const pricing_module = this.$getCookie('pricing_module')
      this.$store.commit('SET_PRICING_MODULE', pricing_module)
      const common_ab_test = this.$getCookie('common_ab_test')
      this.$store.commit('SET_COMMON_AB_TEST_MODULE', common_ab_test)
      const client_ab_test = this.$getCookie('client_module')
      this.$store.commit('SET_CLIENT_AB_TEST_MODULE', client_ab_test)

      // 新版数据追踪
      this.trackInit()
    },
    destroyed() {
      window.removeEventListener('resize', this.watchWindowResize)
      window.removeEventListener('scroll', this.watchWindowScrollTop)
    },
    methods: {
      watchWindowScrollTop() {
        this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      },
      watchWindowResize() {
        this.$nextTick(() => {
          const userAgent = navigator.userAgent
          this.$store.commit('SET_DEVICE', window.innerWidth < 768 || isMobile(userAgent))

          this.$store.commit('SET_CLIENT', getOperatingSystemInfo(userAgent))

          this.$store.commit('SET_BROWSER_TYPE', getBrowser(userAgent))

          this.$store.commit('SET_OS_INFO', is_x64(userAgent))
        })
      },
      getAbTest() {
        if (this.$store.state.pricingPage) {
          return this.$store.state.pricingPage
        }
      },
    },
  }
</script>
<style lang="less" scoped>
  .default-layout {
    position: relative;
  }
</style>
<style lang="less">
  .wrapper-box {
    position: relative;
  }
  .section {
    min-height: 600px;

    &.non-space {
      padding-top: 0;
    }
  }

  @import '../assets/less/common/common.less';
</style>
