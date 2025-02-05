/*/!*
 * 1. sets i18n.locale and state.locale if possible
 * 2. redirects if not with locale
 *!/*/
export default function ({ isHMR, app, store, error, params, route }) {
  console.log('enter i18n:', new Date().getTime())
  const defaultLocale = app.i18n.fallbackLocale
  // If middleware is called from hot module replacement, ignore it
  if (isHMR) {
    return
  }
  // Get locale from params
  let lang = route.path.split('/')[1]
  lang = store.state.locales.includes(lang) ? lang : 'en'
  const locale = params.lang || lang || defaultLocale

  // if (!store.state.locales.includes(locale)) {
  //   return error({ message: 'This page could not be found.', statusCode: 404 })
  // }

  // Set locale
  store.commit('SET_LANG', locale)

  // app.i18n.locale = store.state.locale
  //app.i18n.locale = locale

  // If route is /<defaultLocale>/... -> redirect to /...
  if (locale === defaultLocale && route.fullPath.indexOf('/' + defaultLocale) === 0) {
    // const toReplace =
    //   '^/' + defaultLocale + (route.fullPath.indexOf('/' + defaultLocale + '/') === 0 ? '/' : '')
    // const re = new RegExp(toReplace)
    // return redirect(route.fullPath.replace(re, '/'))

    // https://vanceai.com/en/ & /en/目录下的所有URL，均404处理
    return error({ message: 'This page could not be found.Error from middleware/i18n', statusCode: 404 })
  }
}
