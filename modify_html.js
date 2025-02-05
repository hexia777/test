const cheerio = require('cheerio')

const modifyHtml = (user_agent, html, lang, url, host, fullurl) => {
  if (!html) {
    return html
  }

  // 调整preload顺序，提升图片的加载等级
  html = modifyPreloadLink(html)

  //将所有懒加载图片添加prefetch
  html = injectLazyImgsPrefetch(html, lang, url, user_agent, fullurl)

  html = changeCDN(html)

  return html
}

//把匹配内容动态调整到不同的cdn域名上
const changeCDN = (html) => {
  const regex = /https:\/\/c4\.vanceai\.com[^"'\s]*/g
  const cache = {} // 缓存哈希结果，避免重复计算

  const hashUrlToNum = (url) => {
    if (cache[url]) {
      return cache[url]
    }

    let hash = 0
    for (let i = 0; i < url.length; i++) {
      hash += url.charCodeAt(i)
    }
    const result = (hash % 3) + 4
    cache[url] = result // 将计算结果存入缓存
    return result
  }

  html = html.replace(regex, (match) => {
    const hash = hashUrlToNum(match)
    return match.replace('c4.vanceai.com', `c${hash}.vanceai.com`)
  })

  const regex2 = /https:\/\/test-s3-cloud\.vanceai\.com[^"'\s]*/g
  const hashUrlToNum2 = (url) => {
    if (cache[url]) {
      return cache[url]
    }

    let hash = 0
    for (let i = 0; i < url.length; i++) {
      hash += url.charCodeAt(i)
    }
    let result = hash % 4
    if (result == 0) {
      result = ''
    }
    cache[url] = result
    return result
  }
  html = html.replace(regex2, (match) => {
    const hash = hashUrlToNum2(match)
    return match.replace('test-s3-cloud.vanceai.com', `test-s3-cloud${hash}.vanceai.com`)
  })

  const regex3 = /https:\/\/s3-cloud\.vanceai\.com[^"'\s]*/g
  html = html.replace(regex3, (match) => {
    const hash = hashUrlToNum2(match)
    return match.replace('s3-cloud.vanceai.com', `s3-cloud${hash}.vanceai.com`)
  })

  return html
}

// 将所有懒加载图片添加prefetch
const injectLazyImgsPrefetch = (html) => {
  const $ = cheerio.load(html)

  // 解析<body></body>标签中的所有包含属性'data-img'和'lazy'的img标签
  const lazyImgList = []
  $('.micro-default-layout img').each(function (i, elem) {
    if ($(this).attr('data-img') && $(this).attr('lazy') !== undefined) {
      const imgSrc = $(this).attr('data-img')
      lazyImgList.push(imgSrc)

      const prefetchImgLink = `<link rel="prefetch" as="image" href="${imgSrc}">`

      // 检查<head></head>是否已经有该img的预加载链接
      let exists = false
      $('head link[rel="prefetch"][as="image"]').each(function (j, link) {
        if ($(link).attr('href') === imgSrc) {
          exists = true
          return false // Break the loop
        }
      })

      // 如果<head></head>中没有该图片的href，则添加到<head></head>中
      if (!exists) {
        $('head').append(prefetchImgLink)
      }
    }
  })

  return $.html()
}

const modifyPreloadLink = (html) => {
  try {
    const htmlString = html

    const $ = cheerio.load(htmlString)
    let preloadLinkList = []
    const preloadImgLinkList = []

    $('head link[rel="preload"]').each(function () {
      const linkTagString = $.html(this)
      // 判断是否懒加载图片
      if ($(this).attr('as') === 'image') {
        preloadImgLinkList.push(linkTagString)
      } else {
        preloadLinkList.push(linkTagString)
      }
      $(this).remove()
    })
    preloadLinkList = preloadImgLinkList.concat(preloadLinkList)

    const modifiedLinkTags = preloadLinkList.join('\n')
    $('head').prepend(modifiedLinkTags)

    return $.html()
  } catch (err) {
    return html
  }
}

module.exports = modifyHtml
