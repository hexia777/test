let urls
// 2台服务器地址： 54.151.35.110:30010    54.177.194.13:30010/
const onlineEnvList = ['workspace.vanceai.com', 'vanceai.com']
/* 【警告】 此处为线上配置，谨慎修改 【警告】 */
const onlineUrls = {
  service: 'https://cloud.vanceai.com',
  serviceFile: 'https://files.vanceai.com',
  elkApi: 'https://servo-report.vanceai.com',
  cloudS3BucketPath: 'https://s3-cloud.vanceai.com/',
  cdnBucketPath: 'https://s3-images.vanceai.com/',
}
const testUrls = {
  service: 'https://test1-cloud.vanceai.com',
  //service: 'https://test2-back.vanceai.com',
  serviceFile: 'https://test-files.vanceai.com',
  elkApi: 'https://test-servo-report.vanceai.com',
  cloudS3BucketPath: 'https://test-s3-cloud.vanceai.com/',
  cdnBucketPath: 'https://test-s3-images.vanceai.com/',
}
if (process.browser) {
  if (onlineEnvList.includes(window.location.host)) {
    urls = onlineUrls
  } else {
    urls = testUrls
  }
} else {
  if (process.env.ENV == 'online') {
    urls = onlineUrls
  } else {
    urls = testUrls
  }
}

export default urls
