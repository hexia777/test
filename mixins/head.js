import { envJudge } from '@/static/script/utils'
import { devSingleIconUrl, testSingleIconUrl, onlineSingleIconUrl } from '@/static/config/common/env'

export default {
  head() {
    // 配置element.css, posts 页面
    const env = envJudge()
    let singleIconUrl = devSingleIconUrl
    if (env === 'online') {
      singleIconUrl = onlineSingleIconUrl
    } else if (env === 'test') {
      singleIconUrl = testSingleIconUrl
    }
    const headJson = {
      link: [
        // {
        //   rel: 'preload',
        //   as: 'style',
        //   href: singleIconUrl,
        // },
        // {
        //   rel: 'stylesheet',
        //   href: singleIconUrl,
        // },
        {
          rel: 'preload',
          as: 'font',
          href: 'https://c.vanceai.com/fonts/element-icons.woff2',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          href: 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLEj6Z1xlFQ.woff2',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          href: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          href: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff2',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
      ],
      __dangerouslyDisableSanitizers: ['script'],
    }
    return headJson
  },
}
