import Vue from 'vue'
import axios from 'axios'
import VueI18n from 'vue-i18n'
import { routeName } from '@/static/script/utils'
import { langUrlMap } from '../static/config/common/common'
import enCommon from '@/static/locale/en/common.json'
import enWorkspace from '@/static/locale/en/workspace.json'
import jaCommon from '@/static/locale/ja/common.json'
import jaWorkspace from '@/static/locale/ja/workspace.json'
import deCommon from '@/static/locale/de/common.json'
import deWorkspace from '@/static/locale/de/workspace.json'
import frCommon from '@/static/locale/fr/common.json'
import frWorkspace from '@/static/locale/fr/workspace.json'

if (!Vue.__vue_il8n__) {
  Vue.__vue_il8n__ = true
  Vue.use(VueI18n)
}

// eslint-disable-next-line no-unused-vars
export default ({ app, route, params, query, store }) => {
  const route_name = routeName(route)
  console.log('i18n:', route_name)
  console.log('enter /plugins/i18n:         ', new Date().getTime())

  const langFiles = ['common', 'workspace']
  let baseURL = process.env.BASE_URL
  if (process.env.ENV == 'company') {
    baseURL = 'http://127.0.0.1:3000'
  }
  const subAppHost = !process.browser ? 'http://127.0.0.1:3000' : baseURL
  let lang = route.path.split('/')[1]
  lang = langUrlMap[lang] ? langUrlMap[lang]['value'] : 'en'
  if (
    process.browser &&
    window.location.host.indexOf('test-') !== -1 &&
    query &&
    query.doyouwant === 'redpill'
  ) {
    app.i18n = new VueI18n({
      locale: 'en',
      messages: {},
      silentTranslationWarn: true,
    })
  } else {
    const langMap = {
      en: {
        common: enCommon,
        workspace: enWorkspace,
      },
      ja: {
        common: jaCommon,
        workspace: jaWorkspace,
      },
      de: {
        common: deCommon,
        workspace: deWorkspace,
      },
      fr: {
        common: frCommon,
        workspace: frWorkspace,
      },
    }
    const msg = {}
    msg[lang] = []
    msg[lang]['common'] = langMap[lang]['common']
    msg[lang]['workspace'] = langMap[lang]['workspace']
    app.i18n = new VueI18n({
      locale: lang,
      fallbackLocale: 'en',
      messages: msg,
      silentTranslationWarn: true,
    })
  }
  app.i18n.path = (link) => {
    if (app.i18n.locale === app.i18n.fallbackLocale) {
      return `/${link}`
    }
    return `/${app.i18n.locale}/${link}`
  }
  async function asyncForEach(array) {
    const axiosInstance = axios.create({
      baseURL: subAppHost,
    })
    const msg = {}
    msg[lang] = []
    const promises = array.map(async (item) => {
      try {
        const res = await axiosInstance.get(`/locales/${lang}/${item}.json`)
        msg[lang][item.split('.')[0]] = res.data
      } catch (e) {
        const res = await axiosInstance.get(`/locales/en/${item}.json`)
        msg[lang][item.split('.')[0]] = res.data
      }
    })
    await Promise.all(promises)

    console.log('outer /plugins/i18n:         ', new Date().getTime())

    return msg
  }
}
