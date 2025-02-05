// 记录访问日志
const access_log = require('access-log')

export default {
  handler(req, res, next) {
    console.log('enter /middleware/access_log_writer:', new Date().getTime())
    access_log(req, res, {
      format:
        // eslint-disable-next-line max-len
        ':Xip - :userID [:clfDate] ":method :host :url :protocol/:httpVersion" :statusCode :contentLength :delta ":referer" ":userAgent"',
    })

    res.setHeader('Cache-Control', 'public, max-age=600,stale-while-revalidate=60')

    next()
  },
  path: '',
}
