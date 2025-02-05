import Vue from 'vue'
// 导入私有包
import servers from '@/static/config/common/server.config'
import tracing from '@elk/analytics'

if (!Vue.__tracing__) {
  Vue.__tracing__ = true
  // 注册插件
  Vue.use(tracing, {
    requestUrl: servers.elkApi + '/api/web/report',
    isDev: process.env.NODE_ENV === 'development',
  })
}
