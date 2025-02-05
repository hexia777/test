class ReplaceWithHashPlugin {
  constructor(options) {
    this.options = options || {}
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('ReplaceWithHashPlugin', (compilation, callback) => {
      const file = this.options.file
      if (compilation.assets[file]) {
        let source = compilation.assets[file].source() // 获取 app.js 的内容
        source = source.replace(/a\.p\s*\+\s*""/g, 'changeJsCdnDomain(e,a.p) + ""')

        // 更新 compilation.assets[file] 的内容
        compilation.assets[file] = {
          source: () => source,
          size: () => source.length,
        }
      }
      callback()
    })
  }
}

module.exports = ReplaceWithHashPlugin
