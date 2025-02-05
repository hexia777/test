import { getBrowser, getOperatingSystemInfo, is_x64, isMobile } from '../static/script/utils'
import servers from 'static/config/common/server.config'

export default function (context) {
  console.log('enter injection_store:', new Date().getTime())

  context.userAgent = process.server ? context.req.headers['user-agent'] : navigator.userAgent

  context.is_mobile = isMobile(context.userAgent)
  context.store.commit('SET_DEVICE', context.is_mobile)

  context.client = getOperatingSystemInfo(context.userAgent)
  context.store.commit('SET_CLIENT', context.client)
  context.store.commit(
    'SET_IS_ANDROID',
    context.userAgent.toLowerCase().indexOf('android') > -1 ||
      context.userAgent.toLowerCase().indexOf('linux') > -1
  )

  context.browser_type = getBrowser(context.userAgent)
  context.store.commit('SET_BROWSER_TYPE', context.browser_type)

  context.is_x64 = is_x64(context.userAgent)
  context.store.commit('SET_OS_INFO', context.is_x64)

  context.host = process.server ? context.req.headers.host : window.location.host
  context.protocol = process.server
    ? context.host.indexOf(':') < 0
      ? 'https:'
      : 'http:'
    : window.location.protocol
  context.store.commit('SET_HOST', {
    host: context.host,
    protocol: context.protocol,
  })

  context.$servers = servers
  context.store.commit('SET_SERVERS', context.$servers)
}
