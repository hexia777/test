import language_limited_routes from '@/static/config/middleware/language_limited_routes'

export default function ({ isHMR, store, route, error }) {
  console.log('enter route:', new Date().getTime())
  if (isHMR) {
    return
  }

  // 以下模块仅限某个语种访问
  for (const name in language_limited_routes.pages) {
    if (
      route.name && // 404 页面的 route.name 为空
      name == route.name.split('lang-')[1] &&
      !language_limited_routes.pages[name].includes(store.state.locale)
    ) {
      return error({
        message: 'This page could not be found.Error from middleware/route',
        statusCode: 404,
      })
    }
  }
}
