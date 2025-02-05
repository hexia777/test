/*
 * @Description: 用于快速从iconfont下载字体文件
 */
const fs = require('fs')
const request = require('request')
const newPath = process.argv[2]
const type = process.argv[3]

if (!newPath) {
  console.log('【Error】字体图标的文件路径不能为空')
  process.exit(0)
}
const fontPath = 'https://at.alicdn.com/t/c/' + newPath
const suffixs = ['.woff2', '.ttf', '.json', '.css', '.js']

const promise = (ele) => {
  return new Promise((resolve, reject) => {
    const downloadPath = `${fontPath}${ele}`
    const options = {
      method: 'GET',
      url: downloadPath,
      headers: {
        'cache-control': 'no-cache',
      },
    }
    request(options, (error, response, body) => {
      if (error) {
        reject(`iconfont${ele}下载失败了`)
        throw new Error(error)
      }
      if (type === 'color') {
        fs.writeFileSync(`./static/assets/iconfont/color/iconfont${ele}`, body)
      } else {
        fs.writeFileSync(`./static/assets/iconfont/single/iconfont${ele}`, body)
      }

      resolve(`iconfont${ele}下载更新成功`)
    })
  })
}
const promises = suffixs.map((ele) => {
  return promise(ele)
})
Promise.all(promises).then((res) => {
  console.log(res)
  process.exit(0)
})
