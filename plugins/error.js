// 为context注册全局的错误处理事件
// eslint-disable-next-line no-unused-vars
export default (ctx, inject) => {
  console.log('enter /plugins/error:        ', new Date().getTime())
  ctx.$errorHandler = (err) => {
    const data = {
      statusCode: 500,
      message: 'Post not found',
    }
    try {
      const res = err || data
      // eslint-disable-next-line no-console
      // console.error(res)

      if (err) {
        // 由于nuxt的错误页面只能识别http的状态码，因此statusCode统一传500，表示服务器异常。
        ctx.error({ statusCode: res.statusCode, message: 'Post not found' })
      } else {
        ctx.error(data)
      }
    } catch {
      ctx.error(data)
    }
  }
}
