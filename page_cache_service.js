// https://www.npmjs.com/package/lru-cache
const LRU = require('lru-cache')
const http = require('http')
const url = require('url')

// 只有生产环境配置有页面缓存
// 日本服务器相比俄罗斯配置要差，所以缓存要适当降低
const cachePage = new LRU({
  max: process.env.LOCATION == 'ja' ? 20000 : 30000, // 缓存队列长度,180 KB * 20000 = 3600MB,180 KB * 30000 = 5400MB
  maxAge: 1000 * 60 * 60 * 12, // 缓存 12 小时
})

const del_keys = (magic) => {
  const deleted_keys = []

  cachePage.forEach(function (value, key, cache) {
    if (key.indexOf(magic) >= 0) {
      cachePage.del(key)
      deleted_keys.push(key)
    }
  })

  return deleted_keys
}

const clean_by_version = (_ts) => {
  const deleted_keys = []

  cachePage.forEach(function (value, key, cache) {
    const ts = value.ts ? value.ts : 0
    if (ts < _ts) {
      setTimeout(function () {
        cachePage.del(key)
        deleted_keys.push(key)
      }, 100)
    }
  })

  return deleted_keys
}

const resp = (res, status_code, html = '') => {
  res.writeHead(status_code, {
    'Content-Type': 'text/plain;charset=utf-8',
    'Content-Length': Buffer.byteLength(html, 'utf-8'),
  })
  res.end(html, 'utf-8')
}

http
  .createServer((req, res) => {
    console.log(req.url)

    const p = url.parse(req.url, true)
    const uri = p.pathname
    const key = p.query ? p.query['key'] : undefined
    const _ts = p.query ? p.query['ts'] : undefined

    if ('/get' == uri) {
      if (key) {
        const hit = cachePage.get(key)
        if (hit) {
          resp(res, 200, hit.html)
        } else {
          resp(res, 404)
        }
      } else {
        resp(res, 500)
      }
    } else if ('/set' == uri) {
      if (key) {
        let html = ''
        req.on('data', function (chunk) {
          html += chunk
        })

        req.on('end', function () {
          cachePage.set(key, { ts: _ts, html })
          resp(res, 200, key)
        })
      } else {
        resp(res, 404)
      }
    } else if ('/del' == uri) {
      if (key) {
        const deleted_keys = del_keys(key)
        resp(res, 200, deleted_keys.join('\n'))
      } else {
        resp(res, 404)
      }
    } else if ('/reset' == uri) {
      cachePage.reset()
      resp(res, 200)
    } else if ('/keys' == uri) {
      resp(res, 200, cachePage.keys().join('\n'))
    } else if ('/clearByVersion' == uri) {
      resp(res, 200, clean_by_version(_ts).join('\n'))
    } else if ('/test' == uri) {
      setTimeout(function () {
        const _ts = p.query ? p.query['ts'] : undefined
        console.log(_ts)

        resp(res, 200, 'return!')
      }, 10000)
    }
  })
  .listen(40010)
