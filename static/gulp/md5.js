const through = require('through2')
const PluginError = require('plugin-error')
const md5 = require('md5')
const fs = require('fs')
const plugin = (except) => {
  return through.obj((file, enc, cb) => {
    if (file.isNull()) {
      cb(null, file)
      return
    }

    if (file.isStream()) {
      cb(new PluginError('gulp-rev', 'Streaming not supported'))
      return
    }
    if (!except.some((item) => file.path.indexOf(item) !== -1)) {
      const buf = fs.readFileSync(file.path)
      const hash = md5(buf).substr(0, 10)
      const filename = file.path.substring(file.path.lastIndexOf('/'), file.path.lastIndexOf('.'))
      const suffix = file.path.substr(file.path.lastIndexOf('.'))
      const newfilename = filename + '-' + hash + suffix
      file.path = file.path.substring(0, file.path.lastIndexOf('/')) + newfilename
    }

    cb(null, file)
  })
}
module.exports = plugin
