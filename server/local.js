const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const cors = require('cors')
const app = express()

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // 配置 CORS 中间件
  const corsOptions = {
    // origin: 'https://test.mainmicro.com',
    origin: '*',
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Sentry-Trace,Baggage',
  }
  app.use(cors(corsOptions))

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  const { host, port } = nuxt.options.server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true,
  })
}

start()
