const fs = require('fs')
const winston = require('winston')
const path = require('path')
require('winston-daily-rotate-file')
const modifyHtml = require('./modify_html')
const ReplaceWithHashPlugin = require('./webpack_plugins/ReplaceWithHashPlugin.js')

const infoLogPath = path.resolve(process.cwd(), './logs', `%DATE%.access.log`)
const errorLogPath = path.resolve(process.cwd(), './logs', `%DATE%.error.log`)

/* eslint-disable no-console*/
console.log(
  'nuxt.config.js: process.env.ENV: ' +
    process.env.ENV +
    ', process.env.NODE_ENV: ' +
    process.env.NODE_ENV +
    ', process.env.LOCATION: ' +
    process.env.LOCATION +
    ', process.env.ISBUILD: ' +
    process.env.ISBUILD
)

/* 【警告】 此处为线上配置，谨慎修改 【警告】 */
// node端接口地址
const serverURL = 'https://ai-backend.vanceai.com'
//const serverURL = 'http://10.10.2.147:8202'

// 浏览器端接口地址
const browserURL = 'https://ai-backend.vanceai.com'
//const browserURL = 'http://10.10.2.147:8202'
/* 【警告】 此处为线上配置，谨慎修改 【警告】 */

const TerserPlugin = require('terser-webpack-plugin')
const { env } = require('process')
// const plugins = process.env.NODE_ENV === 'development' ? ['~/plugins/mock'] : []
const plugins = process.env.NODE_ENV === 'development' ? [] : []

//获取发布的版本路径
const getReleasePath = (env) => {
  const dir = './publish_ts/ts.txt'
  try {
    fs.accessSync(dir, fs.constants.F_OK)
  } catch (e) {
    fs.writeFileSync(dir, '', { flag: 'w' })
  }

  let releasePath
  console.log('releasePath: 环境=' + env.ENV)
  if (env.ENV == 'company' || env.ENV == 'home' || ['pre1', 'pre2', 'pre3'].includes(env.LOCATION)) {
    releasePath = '~/_nuxt/'
  } else if (env.ENV == 'test' || ['test'].includes(env.LOCATION)) {
    const ts = fs
      .readFileSync(dir, 'utf8')
      .trim()
      .replace(/[\r\n]/g, '')
    releasePath = `~/dist_test/${ts}`
  } else {
    const ts = fs
      .readFileSync(dir, 'utf8')
      .trim()
      .replace(/[\r\n]/g, '')
    releasePath = `~/dist/${ts}`
  }
  console.log('releasePath: 路径=' + releasePath)
  return releasePath
}

const getPublicPath = (env) => {
  const dir = './publish_ts/ts.txt'
  try {
    fs.accessSync(dir, fs.constants.F_OK)
  } catch (e) {
    fs.writeFileSync(dir, '', { flag: 'w' })
  }

  let cdnPath
  if (env.ENV == 'company' || env.ENV == 'home' || ['pre1', 'pre2', 'pre3'].includes(env.LOCATION)) {
    cdnPath = '/_nuxt/'
  } else if (['test'].includes(env.LOCATION)) {
    const ts = fs
      .readFileSync(dir, 'utf8')
      .trim()
      .replace(/[\r\n]/g, '')
    cdnPath = `https://c4.vanceai.com/dist_test/${ts}`
  } else {
    const ts = fs
      .readFileSync(dir, 'utf8')
      .trim()
      .replace(/[\r\n]/g, '')
    cdnPath = `https://c4.vanceai.com/dist/${ts}`
  }
  return cdnPath
}

module.exports = {
  rootDir: __dirname,
  telemetry: false,
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    //title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      // {
      //   name: 'viewport',
      //   content:
      //     'width=device-width,initial-scale=1.0,minimum-scale=1.0, maximum-scale=1.0, user-scalable=no',
      // },
      // {
      //   hid: 'description',
      //   name: 'description',
      //   content: process.env.npm_package_description || '',
      // },
      { 'http-equiv': 'x-dns-prefetch-control', content: 'on' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: 'https://c.vanceai.com/favicon.ico' },
      { rel: 'preconnect', href: 'https://s3-cloud.vanceai.com', crossorigin: true },
      { rel: 'dns-prefetch', href: '//cloud.vanceai.com' },
    ],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: false,
  /*
   ** Global CSS
   */
  css: ['~/static/css/element-ui-2.13.0.css', '~/static/assets/iconfont/single/iconfont.css'],
  /*
   ** Plugins to load before mounting the App
   */
  // prettier-ignore
  plugins: [
    ...plugins,
    "~plugins/global_import",
    "~plugins/i18n",
    "~plugins/element",
    "~/plugins/error",
    "~/plugins/axios",
    { src: "~/plugins/vue_lazyload", ssr: false },
    { src: '~/plugins/elk_analytics', ssr: false }
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ['@nuxtjs/style-resources'],
  /*
   ** Nuxt.js modules
   */
  // prettier-ignore
  modules: [
    ["cookie-universal-nuxt", { parseJSON: false }],
    "@nuxtjs/axios",
    //"@nuxtjs/pwa",
    "nuxt-winston-log"
  ],
  // pwa: {
  //   workbox: {
  //     cacheAssets: true,
  //     runtimeCaching: [
  //       {
  //         urlPattern: '.*',
  //         handler: 'CacheFirst',
  //         options: {
  //           cacheName: 'nuxt-cache',
  //           expiration: {
  //             maxAgeSeconds: 31536000,
  //           },
  //         },
  //       },
  //     ],
  //   },
  // },
  //nuxt日志
  winstonLog: {
    loggerOptions: {
      transports: [
        new winston.transports.DailyRotateFile({
          filename: infoLogPath,
          dataPattern: 'YYYY-MM-DD',
          prepend: true,
          json: true,
          level: 'info',
        }),
        new winston.transports.DailyRotateFile({
          filename: errorLogPath,
          dataPattern: 'YYYY-MM-DD',
          prepend: true,
          json: true,
          level: 'error',
        }),
      ],
    },
  },
  axios: {
    baseURL: serverURL,
    browserBaseURL: browserURL,
  },
  styleResources: {
    less: [
      './assets/less/common/variables.less',
      process.env.ENV == 'company' ||
      process.env.ENV == 'home' ||
      ['pre1', 'pre2', 'pre3'].includes(process.env.LOCATION)
        ? './assets/less/common/env_dev.less'
        : ['test'].includes(process.env.LOCATION)
        ? './assets/less/common/env_online_test.less'
        : './assets/less/common/env_online.less',
    ],
  },
  env: {
    ENV: process.env.ENV,
    BASE_URL: process.env.BASE_URL,
  },
  /*
   ** Build configuration
   */
  build: {
    babel: { compact: process.env.ENV === 'online' ? true : false },
    // 开启打包分析
    // analyze: true,
    // assetFilter(assetFilename) {
    //   return assetFilename.endsWith('.js')
    // },
    cache: process.env.NODE_ENV === 'development' ? true : false, // 每个 page 打包一个单独的 js
    // cache: isDev, // 每个 page 打包一个单独的 js
    // hardSource: isDev,
    splitChunks: {
      pages: true, // 生成单独的 page.js
      commons: false, // 不生成单独的 common.js
      layouts: false, // 不按 layout 拆分
    },
    optimization: {
      runtimeChunk: false, // 不生成单独的 runtime.js
      minimize: process.env.NODE_ENV !== 'development',
      minimizer: [
        // webpack4 使用的压缩插件，用来替代 webpack3 的 UglifyJsPlugin
        new TerserPlugin({
          terserOptions: {
            warnings: false,
            compress: {
              drop_debugger: true,
              drop_console: process.env.ENV !== 'company' ? true : false,
              pure_funcs: process.env.ENV !== 'company' ? ['console.debug', 'console.log'] : [],
            },
            output: {
              comments: false,
            },
          },
          cache: true, // 文件缓存 (node_modules/.cache/terser-webpack-plugin)
          parallel: 4, // 并行编译
          sourceMap: false, // 是否生成 source map
          extractComments: true, // 去掉注释
        }),
      ],
      splitChunks: {
        chunks: 'all',
        automaticNameDelimiter: '-',
        // maxInitialRequests: 5, // 不生成单独的 vendors.app.js
        // maxAsyncRequests: 5, // page.js 不再异步加载其他资源
        maxSize: 900000,
        cacheGroups: {
          element: {
            test: /[\\/]node_modules[\\/]element-ui[\\/]/,
            name: true,
            priority: 20,
          },
        },
      },
    },
    filenames: {
      app: 'app.js',
      chunk: '[name].js',
    },
    transpile: [
      '@pqina/pintura',
      '@pqina/vue-pintura',
      // '@pqina/filepond-plugin-image-editor'
    ],
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      config.node = {
        fs: 'empty',
      }
      if (ctx.isClient) {
        config.resolve.alias['bn.js'] = require.resolve('bn.js')
        // if (['test'].includes(process.env.LOCATION) || process.env.ENV == 'online') {
        //   config.plugins.push(
        //     new ReplaceWithHashPlugin({
        //       file: 'app.js',
        //     })
        //   )
        // }
      }
      // Run ESLint on save
      // if (ctx.isDev && ctx.isClient) {
      //   config.module.rules.push({
      //     enforce: 'pre',
      //     test: /\.(js|vue)$/,
      //     loader: 'eslint-loader',
      //     exclude: /(node_modules)/,
      //   })
      // }
      const { isDev, isClient } = ctx
      console.log('isDev=' + isDev)
      if (!isDev && isClient) {
        //进行判断操作
        if (isClient) {
          config.devtool = 'source-map'
          // config.devtool = 'hidden-source-map'
        }
      }
    },
    // .nuxt\dist\client放到cdn
    publicPath: getPublicPath(process.env),
  },
  render: {
    // https://nuxtjs.org/api/configuration-render#compressor
    compressor: false,
    // https://github.com/nuxt/nuxt.js/issues/2791
    etag: false,
    lastModified: false,
    static: {
      etag: false,
    },
    // Disable resourceHints since we don't load any scripts for AMP
    resourceHints: true,
  },
  serverMiddleware: [
    '~/middleware/access_log_writer.js', // 记录访问日志
    '~/middleware/page_cache.js', // 页面级别缓存
  ],
  hooks: {
    'render:route': (url, page, { req }) => {
      let uri = url.split('/')[1]
      if (url.indexOf('.htm') != -1) {
        uri = uri ? uri.split('.')[0] : ''
      } else {
        uri = uri ? uri.split('?')[0] : ''
      }

      const host = req.headers.host
      let locale = 'en'
      if (host.indexOf('/ja/') != -1) {
        locale = 'ja'
      } else if (host.indexOf('/de/') != -1) {
        locale = 'de'
      } else if (host.indexOf('/fr/') != -1) {
        locale = 'fr'
      }

      page.html = modifyHtml(req.headers['user-agent'], page.html, locale, uri, host, url)
    },
  },
  router: {
    middleware: ['injection_store', 'i18n', 'route'],
    extendRoutes(routes) {
      routes.forEach((obj) => {
        if (obj.path.indexOf('sitemap') < 0 && obj.path.indexOf('robots') < 0) {
          obj.path = obj.path.replace(/_/g, '-')
        }
      })
    },
  },
}
