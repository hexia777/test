const cache = require('./mixins/cache')
// const { spawn } = require('child_process')
const { exec } = require('child_process')

//获取全局保存的版本信息
const _ts = cache.getCacheVersion()
//重置版本
cache
  .clear_page_cache_by_version(_ts)
  .then((data) => {
    update_subapp_version()
  })
  .catch((error) => {
    console.error(error)
    update_subapp_version()
  })

function update_subapp_version() {
  // const args = [_ts]
  // const update_subapp_version = spawn('python', ['./devops_script/update_subapp_version.py', ...args])
  // update_subapp_version.stdout.on('data', (data) => {
  //   console.log(`Output from update_subapp_version: ${data}`)
  // })
  // //处理脚本的错误
  // update_subapp_version.stderr.on('data', (data) => {
  //   console.error(`Error from update_subapp_version: ${data}`)
  // })
  // //监听脚本的结束
  // update_subapp_version.on('close', (code) => {
  //   console.log(`update_subapp_version exited with code ${code}`)
  // })

  // 要复制的源文件和目标路径
  const sourceFile = '/usr/src/app/publish_ts/ts.txt'
  const destinationFile = '/usr/src/app/micro_publish_ts/ts.txt'

  console.log('执行cp命令')
  // 执行 cp 命令
  exec(`cp ${sourceFile} ${destinationFile}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行错误: ${error.message}`)
      return
    }
    if (stderr) {
      console.error(`错误输出: ${stderr}`)
      return
    }
    console.log(`成功复制文件，输出: ${stdout}`)
  })
}
